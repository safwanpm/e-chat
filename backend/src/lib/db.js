import mongoose from "mongoose";
const ConnectDb = async()=>{
    try{
        const Connect =await (mongoose.connect(process.env.MONGODB_URL))
        console.log("mongoDB Connected");
    }
    catch(error){
        console.log("mongoDB Connection Error");
        
    }
}
export default ConnectDb