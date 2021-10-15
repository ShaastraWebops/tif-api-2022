import cuid from "cuid";
import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, BeforeInsert, Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Project } from "./Project";
import { User } from "./User";

@Entity("Team")
@ObjectType("Team")
export class Team extends BaseEntity {
    @BeforeInsert()
    setId() {
      this.id = cuid();
    }

    @PrimaryColumn()
    @Field(() => ID)
    id: string;

    @Column()
    @Field()
    name: string;

    //relations
    @ManyToMany(() => User, (user) => user.team)
    @JoinTable()
    @Field(() => [User])
    members: User[];

    @OneToOne(() => Project, project => project.team)
    @JoinColumn()
    project: Project;

    
}