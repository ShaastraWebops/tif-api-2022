import { Team } from "../entities/Team";
import { Arg, Authorized, Ctx, Field, FieldResolver, InputType, Mutation, Query, Resolver, Root } from "type-graphql";
import { MyContext } from "../utils/context";
import { User } from "../entities/User";
import { UserRole } from "../utils/UserRole";

@InputType("MemberInput")
export class MemberInput{

    @Field()
    name : string

    @Field()
    contactno : string;

    @Field()
    email : string;

    @Field()
    institution : string;

    @Field()
    city : string;

    @Field()
    state : string;
}
@InputType("CreateTeamInput")
export class CreateTeamInput {
    @Field()
    name: string;

    @Field(() => [MemberInput], { nullable: true })
    members: MemberInput[];
}

@Resolver(Team)
export class TeamResolver {

    @Authorized()
    @Mutation(() => Boolean)
    async createTeamAndRegister(@Arg("data") { name, members}: CreateTeamInput , @Ctx() {user} : MyContext) {

        const team = await Team.create();
        team.name = name;
        team.members = [];
        user.role = UserRole.LEADER;
        const teamlead = members.filter(member => {
            return member.email === user.email 
            })
        user.state = teamlead[0].state;
        user.city= teamlead[0].city;
        user.institution = teamlead[0].institution;
        team.members.push(user);

        user.contactno= teamlead[0].contactno;

        const teammembers = members.filter(member => {
        return (member.email !== user.email )   
        })
        await user.save();

        await Promise.all(teammembers?.map(async (member) => {
            const userM = await User.create({...member,password : member.email}).save();
                       
            await userM.save();

            team.members.push(userM);

        }));
        await team.save();
        return !!team;
    }

    @Authorized(['LEADER'])
    @Mutation(() => Boolean)
    async leaveTeam(@Arg("data") teamID: string, @Ctx() { user }: MyContext ) {
        const team = await Team.findOneOrFail(teamID, { relations: ["members"] });

        team.members = team.members.filter((member) => member.id !== user.id);
        await team.save();

        return !!team;
    }

    // @Authorized(['ADMIN'])
    @Query(() => [Team])
    async getTeams(){
        const teams = await Team.find({relations : ["members","project"]});
        console.log("teams",teams)
        return teams ;

    }

    @Query(() => Team)
    async getTeamById(@Arg("teamid") teamid : string){
        const team = await Team.findOneOrFail(teamid,{relations : ["members","project"]});
        console.log("teams",team)
        return team ;

    }

    @FieldResolver(() => [User])
    async members(@Root() { id }: Team ) {
        const team = await Team.findOneOrFail(id, { relations: ["members"] });
        return team.members;
    } 
}