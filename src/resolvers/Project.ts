import { Project } from "../entities/Project";
import { Arg,Ctx,Field,InputType,Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "../utils/context";
import { User } from "../entities/User";
import { Team } from "../entities/Team";

@InputType("ProjectInput")
export class ProjectInput{

    @Field()
    title: string;

    @Field()
    category: string;

    @Field()
    Q1: string;

    @Field()
    Q2: string;

    @Field()
    Q3: string;

    @Field()
    Q4: string;

    @Field()
    Q5: string;

    @Field()
    Q6: string;

    @Field()
    Q7: string;

    @Field()
    Q8: string;

    @Field()
    videolink : string;
}


@Resolver()
export class ProjectResolver{

    @Mutation(() => Boolean)
    async fillProject( @Arg("data") data: ProjectInput, @Ctx() { user } : MyContext) {
        const userM = await User.findOneOrFail(user.id,{relations : ['team']})
        const team = userM.team;
        console.log(team)
        const project = await Project.create({ ...data,team}).save();

        
        return !!project;
    }

    //query for admin to fetch all questionnarie
    @Query(() => [Project])
    async getProjects() {
        return  await Project.find();
    }

    //query for admin to fetch questionnarie by id
    @Query(() => Project)
    async getProjectbyteamId(@Arg("teamid") teamId : string) {
        const team = await Team.findOneOrFail(teamId,{relations : ['project']});
        // const project= await Project.findOneOrFail({ where: { team : team} });
        return team.project;
    }
    

}