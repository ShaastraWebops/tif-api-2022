import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { BaseEntity,BeforeInsert,Column, Entity, ManyToOne,  PrimaryColumn} from "typeorm";
import cuid from "cuid";
import bcrypt from "bcryptjs";
import { Team } from "./Team";
import { UserRole } from "../utils/UserRole";
import { mail } from "../utils/mail";
import { SendVerificationMailOptions } from "src/utils";

registerEnumType( UserRole, { name: "UserRole" } );

@Entity("User")
@ObjectType("User")
export class User extends BaseEntity {

    @BeforeInsert()
    async setId() {
      this.id = cuid();
      this.password = await bcrypt.hash(this.password, 13);
      this.verificationOTP = User.generateOTP();
      console.log(this.verificationOTP);
    }

    static generateOTP() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    
    static async sendVerificationMail({ name, email , verificationOTP}: SendVerificationMailOptions) {
      console.log("name",name,email)
      const  body= `Hello <b>${name}</b>,<br><br>
      Thanks for signing up!<br><br><p>You verification code is <strong>${verificationOTP}</strong></p>`;
      await mail({ email, sub: "Complete your Verification | Tech and Innovation fair", body });
  }

  
  static async sendForgotResetMail({ name, email , verificationOTP}: SendVerificationMailOptions) {
    const  body= `Hello <b>${name}</b>,<br><br>
    In case you forgot your password,<p>your OTP for reset password is
    <strong>${verificationOTP}</strong></p>`;
      await mail({ email, sub: "Forgot your password  | Tech and Innovation fair", body });
}
  
    @PrimaryColumn()
    @Field(() => ID)
    id: string;
  
    @Column()
    @Field()
    name: string;
  
    @Column({ unique: true })
    @Field()
    email: string;

    @Column({nullable : true})
    password: string;

    @Column()
    verificationOTP : string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    passwordOTP: string;

    @Column({ default: false})
    @Field()
    isVerified: boolean;

    @Column({ default: false})
    @Field()
    isSubmitted: boolean;

    @Column({nullable : true})
    @Field({nullable : true})
    institution : string ;

    @Column({nullable : true})
    @Field({nullable : true})
    contactno : string;

    @Column({nullable : true})
    @Field({nullable : true})
    city : string;

    @Column({nullable : true})
    @Field({nullable : true})
    state : string;

    @Column("enum", { enum: UserRole, default: UserRole.MEMBER})
    @Field(() => UserRole)
    role: UserRole;



    // relations
    @ManyToOne(() => Team, (team) => team.members)
    @Field(()=> Team,{nullable : true})
    team: Team

}