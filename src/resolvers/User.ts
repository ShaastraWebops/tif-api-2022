import { User } from "../entities/User";
import {Arg, Ctx, Field, InputType, Mutation,Resolver} from "type-graphql";
import { IsEmail } from "class-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { MyContext } from "src/utils/context";


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

@InputType("UpdatePasswordInput")
export class UpdatePasswordInput {
	@Field()
	email: string;

	@Field()
	newPassword: string;
}


@Resolver(User)
export class UserResolver {

    @Mutation(()=>Boolean)
    async registerUser(
      @Arg("data") data:RegisterUserInput ,@Ctx() {res} : MyContext
    ) : Promise<Boolean>{
      const user = await User.create({ ...data}).save();
      let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret");
      res.cookie("token", token )
      return !! user ;
    }

    @Mutation(() => User, { nullable: true })
    async login(@Arg("data") { email, password }: LoginInput, @Ctx() {res} : MyContext) {
        const user = await User.findOneOrFail({ where: { email} });
        if(!user) throw new Error("Account Not Found");

        if(!user.isVerified) throw new Error("Oops, email not verified!");

        const checkPass = await bcrypt.compare(password, user?.password);
        if(!checkPass) throw new Error("Invalid Credential");

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
    async updatePassword(@Arg("data") data: UpdatePasswordInput) {
      const password = await bcrypt.hash(data.newPassword, 13);
      let user = await User.findOneOrFail({where : {email : data.email}});
      user.password = password;
      user = await User.save(user);
      return !!user;
    }

    @Mutation(() => Boolean)
    async getPasswordOTP(@Arg("email") email: string) {
      let user = await User.findOneOrFail({where : {email}});
      user.passwordOTP = User.generateOTP();
      user = await User.save(user);
      // await User.sendMail({
      //   name: user.name,
      //   htmlPart: `<p>Your password reset code for Shaastra Prime is <strong>${user.passwordOTP}</strong> </p>`,
      //   subject: "Reset Your Password | Shaastra Prime",
      // });
      return true;
    }

    @Mutation(() => Boolean)
    async logoutUser(@Ctx() { res } : MyContext ) {
        res.cookie("token", "", { httpOnly: true, maxAge: 1 })

        return true;
    }

}