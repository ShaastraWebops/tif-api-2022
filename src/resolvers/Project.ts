import { Project } from "../entities/Project";
import { Arg,Authorized,Ctx,Field,InputType,Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "../utils/context";
import { User } from "../entities/User";
import { Team } from "../entities/Team";
// import { getRepository } from "typeorm";
// import { parse } from "json2csv";


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
    videolink : string;
}


@Resolver()
export class ProjectResolver{

    @Authorized(['LEADER'])
    @Mutation(() => Boolean)
    async fillProject( @Arg("data") data: ProjectInput, @Ctx() { user } : MyContext) {
        const userM = await User.findOneOrFail(user.id,{relations : ['team']})
        const team = userM.team;
        console.log("team",userM)
        const project = await Project.create({ ...data,team}).save();
        user.isSubmitted = true;
        await user.save();
        
        return !!project;
    }

    @Authorized(['ADMIN'])
    @Query(() => [Project])
    async getProjects() {
        return  await Project.find({relations : ['team']});
    }

    // @Authorized(['ADMIN'])
    @Query(() => Project)
    async getProjectbyteamId(@Arg("teamid") teamId : string) {
        const team = await Team.findOneOrFail(teamId,{relations : ['project']});
        const project= await Project.findOneOrFail({ where: { team : team.id} });
        return project;
    }

    // @Query(() => String)
    // async exportCSV(@Arg("EventID") id: string) {
        
    //     const projectrepo = getRepository(Project);
    //     let csv;
        
    //         const projects = Project.find({relations : ['team']});
    //         let csvData = '"Project title ,"category","Overview","Uniqueness ","Technology Implemented ","Target crowd","IP Status","Partner Status","Miscellaneous Questions","Video Attachment"';
    //         const csvHeading = ',"name","email","sjID","school","class"';
    //         for (let i = 0; i < event.teamSize; i++) {
    //             csvData += csvHeading;
    //         }

    //         registeredTeams.map((registeredTeam) => {

    //             csvData += `\n "${registeredTeam.name}"`;

    //             registeredTeam.members.map((member) => {
    //                 const { name, email, sjID, school } = member;
    //                 csvData += `, "${name}","${email}","${sjID}","${school}","${member.class}"`;
    //             })
    //         })
    //         csv = csvData;
    //     }

    //     return csv
    // }
    

}