import "reflect-metadata";
import Express from "express";
import * as dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 4000 ;

const main = async () =>{

  const app =Express();

  app.listen(PORT , () => {
    console.log(`Server started on port ${PORT}`);
});

}

main()