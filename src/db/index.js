import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    // console.log(`${process.env.MONGODB_URI}/${DB_NAME}`);
    const connectionIntances = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MOngoDB connected !! DB HOST: ${connectionIntances.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB CONNECTION FAILD>>>", error);
    process.exit(1);
  }
};

export default connectDB;

// process is come from nodeJs
