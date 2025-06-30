import mongoose from "mongoose";


const ChatSchema = new mongoose.Schema({
    chatName: {
        trim: true, type: String
    },
    isGroupChat: { tupe: Boolean, default: false },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    isAdmin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

},
    { timestamps: true }
)

const Chat = mongoose.model('Chat', ChatSchema)
export default Chat