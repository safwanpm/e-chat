import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import { useAuthStore } from "./authStore";


export interface User {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
  status: 'Online' | 'Offline';
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
}



interface ChatStore {
  messages: Message[];
  users: User[];
  viewUsers: User[]; 
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isViewUsersLoading: boolean;
  onlineUserIds: string[];
  setOnlineUserIds: (ids: string[]) => void;

  getUsers: () => Promise<void>;
  getViewUsers: () => Promise<void>; 
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (messageData: { text: string }) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  setSelectedUser: (user: User) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  onlineUserIds: [],

setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),

  messages: [],
  users: [],
  viewUsers: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isViewUsersLoading: false, 

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get<User[]>("/message/users");
      set({ users: res.data });
    } catch (error) {
      const err = error as AxiosError<any>;
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getViewUsers: async () => {
  set({ isViewUsersLoading: true });
  try {
    const res = await axiosInstance.get("/message/view-users");
    const users = res.data.data;

    if (Array.isArray(users)) {
      set({ viewUsers: users });
    } else {
      throw new Error("Invalid users data format");
    }

  } catch (error) {
    const err = error as AxiosError<any>;
    toast.error(err.response?.data?.message || "Failed to fetch view users");
  } finally {
    set({ isViewUsersLoading: false });
  }
},


  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get<Message[]>(`/message/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      const err = error as AxiosError<any>;
      toast.error(err.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData: { text: string }) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post<Message>(`/message/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      const err = error as AxiosError<any>;
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
  const { selectedUser } = get();
  if (!selectedUser) return;

  const socket = useAuthStore.getState().socket;
  if (!socket) return;

  socket.on("newMessage", (newMessage: Message) => {
    const authUser = useAuthStore.getState().authUser;
    const isRelevant =
      (newMessage.senderId === selectedUser._id && newMessage.receiverId === authUser?._id) ||
      (newMessage.receiverId === selectedUser._id && newMessage.senderId === authUser?._id);

    if (!isRelevant) return;

    set({
      messages: [...get().messages, newMessage],
    });
  });
},


  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  setSelectedUser: (user: User) => set({ selectedUser: user }),
}));
