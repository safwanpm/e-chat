
import { runInNewContext } from "vm";
import cloudinary from "../lib/cloudinary.js";
import { io,getReceiverSocketId } from "../lib/socket.js";
import Message from "../model/messageModel.js";
import User from "../model/userModel.js";



// export const viewUsers = async (req, res) => {
//   try {
//     const users = await User.find();

//     res.status(200).json({
//       data: users,
//       success: true,
//     });
//   } catch (error) {
//     console.error('Error fetching users:', error);

//     res.status(500).json({
//       message: 'Failed to fetch users',
//       success: false,
//     });
//   }
// };

export const viewUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    const usersWithStatus = users.map((user) => {
      const isOnline = getReceiverSocketId(user._id.toString()) !== undefined;
      return {
        ...user.toObject(),
        status: isOnline ? 'Online' : 'Offline',
      };
    });

    res.status(200).json({
      data: usersWithStatus,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      success: false,
    });
  }
};



import mongoose from 'mongoose';

// export const getUsersForSidebar = async (req, res) => {
//     try {
//         console.log(req.body, 'dsda'); // Still logs body, usually empty for GET

//         // Ensure req.user._id is populated by your authentication middleware
//         const loggedInUserId = req.user._id;

//         // 1. Find all messages where the loggedInUser is either the senderId or the receiverId
//         const messages = await Message.find({
//             $or: [
//                 { senderId: loggedInUserId },
//                 { receiverId: loggedInUserId }
//             ]
//         }).select('senderId receiverId'); // Select only senderId and receiverId IDs to optimize

//         // 2. Extract unique user IDs from these messages (excluding the logged-in user)
//         const participantIds = new Set();
//         messages.forEach(message => {
//             // Convert ObjectIds to strings for consistent comparison
//             if (message.senderId && message.senderId.toString() !== loggedInUserId.toString()) {
//                 participantIds.add(message.senderId.toString());
//             }
//             if (message.receiverId && message.receiverId.toString() !== loggedInUserId.toString()) {
//                 participantIds.add(message.receiverId.toString());
//             }
//         });

//         // Convert Set of string IDs to an Array of Mongoose ObjectIds
//         const userIdsToFetch = Array.from(participantIds).map(id => new mongoose.Types.ObjectId(id));

//         // 3. Fetch the user details for these unique IDs, excluding the password
//         const messagedOrReceivedUsers = await User.find({ _id: { $in: userIdsToFetch } }).select("-password");

//         res.status(200).json(messagedOrReceivedUsers);
//     } catch (error) {
//         console.error("Error in getUsersForSidebar: ", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };


export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId },
        { receiverId: loggedInUserId }
      ]
    }).select('senderId receiverId');

    const participantIds = new Set();
    messages.forEach(message => {
      if (message.senderId && message.senderId.toString() !== loggedInUserId.toString()) {
        participantIds.add(message.senderId.toString());
      }
      if (message.receiverId && message.receiverId.toString() !== loggedInUserId.toString()) {
        participantIds.add(message.receiverId.toString());
      }
    });

    const userIdsToFetch = Array.from(participantIds).map(id => new mongoose.Types.ObjectId(id));
    const users = await User.find({ _id: { $in: userIdsToFetch } }).select("-password");

    const usersWithStatus = users.map((user) => {
      const isOnline = getReceiverSocketId(user._id.toString()) !== undefined;
      return {
        ...user.toObject(),
        status: isOnline ? 'Online' : 'Offline',
      };
    });

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image,
    });

    await newMessage.save();

    // Emit to receiver (if online)
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Emit to sender (if online, may be same socket, still safe)
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

