import "reflect-metadata";
import express from "express";
import * as dotenv from "dotenv";
import { buildSchema } from "type-graphql";
import resolvers from "./resolvers";
import entities from "./entities";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
dotenv.config();

const PORT = process.env.PORT || 8000 ;

const main = async () =>{

  await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities,
    synchronize: true,
    logging: true,
  })
  .then(() => {
    console.log('Database Connected');
  })
  .catch((e) => console.log(e))

  const schema = await buildSchema({ resolvers});

  const server = new ApolloServer({
    schema,
  });

  await server.start();

  const app =express();

  server.applyMiddleware({ app, cors: false });


  app.listen(PORT , () => {
    console.log(`Server started on port ${PORT}`);
});

}

main()