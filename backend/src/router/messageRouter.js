import express from "express";


import { protectRoute } from "../middleware/auth.middlware.js";
import { getUsersForSidebar, getMessages, sendMessage,viewUsers } from "../controller/chatController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/view-users", protectRoute, viewUsers);
messageRouter.get("/:id", protectRoute, getMessages);

messageRouter.post("/send/:id", protectRoute, sendMessage);

export default messageRouter;