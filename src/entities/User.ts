import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity,Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity("User")
@ObjectType("User")
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
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

    @Column({ default: false})
    @Field()
    isVerified: boolean;

}