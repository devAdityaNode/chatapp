import mongoose from "mongoose"
import { DB_NAME } from "./constant.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`Connection Successfull`);
    } catch (error) {
        console.log("Connection with MongoDB failed", error);
        process.exit(1)
    }
}


export default connectDB