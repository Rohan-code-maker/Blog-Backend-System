import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { httpServer } from "./app.js";

dotenv.config({
    path:'./.env'
})

const majorNodeVersion = +process.env.NODE_VERSION?.split(".")[0] || 0;

const startServer = () => {
  httpServer.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port:${process.env.PORT}`);
  });
};

if (majorNodeVersion >= 14) {
  try {
    await connectDB();
    startServer();
  } catch (err) {
    console.error("Mongo db connect error: ", err);
  }
} else {
  connectDB()
    .then(() => {
      startServer();
    })
    .catch((err) => {
      logger.error("Mongo db connect error: ", err);
    });
}


// connectDB()
// .then( () => {
//     app.listen(process.env.PORT || 8000, () => {
//         console.log(`Server is running at port:${process.env.PORT}`);
        
//     })
// })
// .catch((err) => {
//     console.log("MongoDb Connection error:",err);
// })



/*
import express from "express";
const app = express()

// Database connection
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error:",error)
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on post ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("Error:",error)
        throw error
    }
})()
*/