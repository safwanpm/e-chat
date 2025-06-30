import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        receiverId:{type: mongoose.Schema.Types.ObjectId, ref: "User"},
        text: {
            type: String, trim: true
        },
        // chat: {
        //     sender: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
        // }
        image:{
            type:String        }
    },
    {
        timestamps: true
    }
)
const Message = mongoose.model('Message', messageSchema)
export default Message