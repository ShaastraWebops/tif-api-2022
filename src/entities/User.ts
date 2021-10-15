import { Field, ID, ObjectType } from "type-graphql";
import {BaseEntity,BeforeInsert,Column, Entity, ManyToMany,  PrimaryColumn} from "typeorm";
import cuid from "cuid";
import bcrypt from "bcryptjs";
import { Team } from "./Team";

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
    
  
    // @AfterInsert()
    // async sendVerificationMail() {
    //   await User.sendMail({
    //     name: this.name,
    //     subject: "Complete your Verification | Tech and Innovation fair",
    //     htmlPart: `<p>You verification code is <strong>${this.verificationOTP}</strong></p>`,
    //   });
    //   console.log(this.verificationOTP);
      
    // }

    // static sendMail({ rollNumber, name, htmlPart, subject }: SendMailOptions) {
    //   if (process.env.NODE_ENV === "production") {
    //     return mailjet.post("send", { version: "v3" }).request({
    //       FromEmail: "prime@shaastra.org",
    //       FromName: "Shaastra Prime Bot",
    //       Recipients: [
    //         {
    //           Email: `${rollNumber.toLowerCase()}@smail.iitm.ac.in`,
    //           Name: name,
    //         },
    //       ],
    //       Subject: subject,
    //       "Html-part": htmlPart,
    //     });
    //   } else return Promise.resolve();
    // }
  

    @PrimaryColumn()
    @Field(() => ID)
    id: string;

  
    @Column()
    @Field()
    name: string;
  
    @Column({ unique: true })
    @Field()
    email: string;

    @Column()
    password: string;

    @Column()
    verificationOTP : string;


    @Column({ default: false})
    isVerified: boolean;

    @Column({nullable : true})
    institution : string ;

    @Column({nullable : true})
    contactno : string;

    @Column({nullable : true})
    city : string;

    @Column({nullable : true})
    state : string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    passwordOTP: string;

    // relations
    @ManyToMany(() => Team, (team) => team.members)
    team: Team


}