import { Team } from "../entities/Team";
import { Arg, Ctx, Field, FieldResolver, InputType, Mutation, Query, Resolver, Root } from "type-graphql";
import { MyContext } from "../utils/context";
import { User } from "../entities/User";

@InputType("CreateTeamInput")
export class CreateTeamInput {
    @Field()
    name: string;

    @Field(() => [String], { nullable: true })
    members: string[];
}

@Resolver(Team)
export class TeamResolver {

    @Mutation(() => Boolean)
    async createTeamAndRegister(@Arg("data") { name, members}: CreateTeamInput, @Ctx() { user }: MyContext) {

        const team =  Team.create();
        team.name = name;
        team.members = [];
        members.push(user.email);
        await Promise.all(members?.map(async (member) => {
            console.log("member",member)
            const userM = await User.findOne({ where: { email : member} });
            console.log("test",userM)
            if(!userM) throw new Error(`Invalid email`);
            team.members.push(userM);
        }));

        await team.save();
        return !!team;
    }

    @Mutation(() => Boolean)
    async leaveTeam(@Arg("data") teamID: string, @Ctx() { user }: MyContext ) {
        const team = await Team.findOneOrFail(teamID, { relations: ["members"] });

        team.members = team.members.filter((member) => member.id !== user.id);
        await team.save();

        return !!team;
    }

    @Query(() => [Team])
    async getTeams(){
        const teams = await Team.find({relations : ["members"]});
        return teams ;

    }

    @FieldResolver(() => [User])
    async members(@Root() { id }: Team ) {
        const team = await Team.findOneOrFail(id, { relations: ["members"] });
        return team.members;
    } 
}