import { User } from "../entities/user";
import {Arg, Field, InputType, Mutation, Query,Resolver} from "type-graphql";
import { IsEmail } from "class-validator";

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

@Resolver(User)
export class UserResolver {

    @Query(()=>String)
    async hello( 
    ): Promise <String> {
      return "hello";
    }

    @Mutation(()=>Boolean)
    async registerUser(
      @Arg("data") data:RegisterUserInput
    ) : Promise<Boolean>{

      return !! await User.create({ ...data}).save();
    }
}