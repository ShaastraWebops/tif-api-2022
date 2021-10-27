import { User } from "../entities/User";
import {Arg, Authorized, Ctx, Field, InputType, Mutation,Query,Resolver} from "type-graphql";
import { IsEmail } from "class-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { MyContext } from "../utils/context";
import { ADMINMAILLIST , UserRole } from "../utils/UserRole";


@InputType("CreateUserInput")
export class RegisterUserInput {
	@Field()
	name: string;

	@Field()
	@IsEmail()
	email: string;

	@Field()
	password: string;
}

@InputType("LoginInput")
export class LoginInput {
	@Field()
	@IsEmail()
	email: string;

	@Field()
	password: string;
}

@InputType("ResetPasswordInput")
export class ResetPasswordInput {
	@Field()
  @IsEmail()
	email: string;

  @Field()
  otp : string;

	@Field()
	newPassword: string;
}

@InputType("RequestForgotPassInput")
export class RequestForgotPassInput {
    @Field()
    @IsEmail()
    email: string;
}



@Resolver(User)
export class UserResolver {

    @Mutation(()=>Boolean)
    async registerUser(
      @Arg("data") data:RegisterUserInput ,@Ctx() {res} : MyContext
    ) : Promise<Boolean>{
      const userM = await User.findOne({where : {email : data.email}});
      if(userM && userM.role === UserRole.LEADER) throw new Error("User already registered")
      if(userM && userM.role === UserRole.MEMBER) throw new Error("Email already registered in a team")
      const user = await User.create({ ...data}).save();
      user.role = UserRole.LEADER;
      await user.save();
      let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret");
      res.cookie("token", token )
      console.log(user.verificationOTP)
      const {name , email , verificationOTP } = user;
      await User.sendVerificationMail({ name , email , verificationOTP});


      if(ADMINMAILLIST.includes(user.email)){
        const { affected } = await User.update(user?.id, { role: UserRole.ADMIN })
        if (affected !== 1) throw new Error("");
    }

      return !! user ;
    }

    @Mutation(() => Boolean)
    async resendVerificationMail(@Arg("data") { email }: RequestForgotPassInput) {
        const user = await User.findOneOrFail({ where: { email } });
        const { name,verificationOTP , isVerified } = user;

        if (isVerified) throw new Error("Email has been verified before");

        await User.sendVerificationMail({ name, email , verificationOTP });

        return true;
    }


    @Mutation(() => User, { nullable: true })
    async login(@Arg("data") { email, password }: LoginInput, @Ctx() {res} : MyContext) {
        const user = await User.findOne({ where: { email} });
        if(!user) throw new Error("Account Not Found");

        //if(!user.isVerified) throw new Error("Oops, email not verified!");
        
        const checkPass = await bcrypt.compare(password, user?.password);
        if(!checkPass) throw new Error("Invalid Credentials");

        let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret");
        res.cookie("token", token )

        return user;
    }

    @Mutation(() => String)
    async verifyUser(@Arg("otp") otp: string,@Ctx() {user} : MyContext) {
      if (user?.verificationOTP !== otp) throw new Error("Invalid OTP!");
      await User.update(user.id, { isVerified: true });
      return user.id;
    }

   
    @Mutation(() => Boolean)
    async resetPassword(@Arg("data") { email, otp, newPassword }: ResetPasswordInput) {
        const user = await User.findOneOrFail({ where: {email} });

        if (user.passwordOTP === otp) {
            const password = await bcrypt.hash(newPassword, 13);
            const { affected } = await User.update(user.id, { password });
            return affected === 1
        }else{
          throw new Error("Invalid Otp");
        }
    }

    

    @Mutation(() => Boolean)
    async getPasswordOTP(@Arg("email") email: string) {
      const user = await User.findOneOrFail({ where: { email } });
      if(!user) throw new Error("Email Not found");
      const passwordOTP = User.generateOTP();
      await User.update(user.id, { passwordOTP });

      const { name} = user;
      await User.sendForgotResetMail({ name, email, verificationOTP : passwordOTP });
      return true;
    }

    @Mutation(() => Boolean)
    async logoutUser(@Ctx() { res } : MyContext ) {
        res.cookie("token", "", { httpOnly: true, maxAge: 1 })

        return true;
    }

    @Query(() => [User], {nullable: true})
    async getUsers() {
        const users = await User.find({ order: { name: "ASC"} ,relations:['team']});
        return { users };
    }
    @Authorized()
    @Query(() => User, {nullable: true})
    async me(@Ctx() { user } : MyContext) {
        return await User.findOneOrFail({ where: { id: user.id }, relations : ['team'] });
    }


}