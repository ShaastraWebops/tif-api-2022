import cuid from "cuid";
import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, BeforeInsert, Column, Entity,JoinColumn,OneToOne, PrimaryColumn } from "typeorm";
import { Team } from "./Team";

@Entity("Project")
@ObjectType("Project")
export class Project extends BaseEntity {
    @BeforeInsert()
    setId() {
      this.id = cuid();
    }

    @PrimaryColumn()
    @Field(() => ID)
    id: string;

    @Column()
    @Field()
    title: string;

    @Column()
    @Field()
    category: string;

    @Column()
    @Field()
    Q1: string;

    @Column()
    @Field()
    Q2: string;

    @Column()
    @Field()
    Q3: string;

    @Column()
    @Field()
    Q4: string;

    @Column()
    @Field()
    Q5: string;

    @Column()
    @Field()
    Q6: string;

    @Column()
    @Field()
    Q7: string;

    @Column()
    @Field()
    videolink : string;

    //relations
    @OneToOne(() => Team, team => team.project)
    @JoinColumn()
    team: Team;
}