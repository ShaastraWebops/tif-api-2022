import "reflect-metadata";
import express from "express";
import * as dotenv from "dotenv";
import { buildSchema } from "type-graphql";
import resolvers from "./resolvers";
import entities from "./entities";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import jwt from "jsonwebtoken";
import {authChecker} from "./utils/auth";
import cors from "cors";

dotenv.config();

const PORT = 8000 ;

const main = async () =>{

  await createConnection({
    type: "postgres",
    url: "postgresql://postgres:postgres@localhost:5433/tif",
    entities,
    synchronize: true,
    logging: true,
  })
  .then(() => {
    console.log('Database Connected');
  })
  .catch((e) => console.log(e))

  const schema = await buildSchema({ resolvers ,authChecker});

  const server = new ApolloServer({
    schema,
    context: async ( { req, res } : { req: express.Request, res: express.Response } ) => {
      let user;
      if(req.headers.cookie) {
        const token = req.headers.cookie.split("token=")[1];
        if(token){
          const decoded = jwt.verify(token, "secret" ) as any;
          user = await User.findByIds(decoded.id);
          user = user[0];
        }
       
      }
      return { req, res, user };
    },
  });

  await server.start();

  const app =express();

  app.use( 
    cors({
      credentials: true,
      origin:["https://studio.apollographql.com", "http://localhost:8000", "http://localhost:3000", "https://tif.shaastra.org", "https://api.tif.shaastra.org"]
    })
  );


  server.applyMiddleware({ app, cors: false });

  

  app.listen(PORT , () => {
    console.log(`Server started on port ${PORT}`);
});

}

main()