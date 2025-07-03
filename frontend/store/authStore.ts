import { create } from "zustand";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";

// Types
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
  staus:'online'| 'offline'
  // add other user fields if available
}

interface AuthPayload {
  email: string;
  password: string;
  name?: string;
  profilePic?: string;
}

interface AuthStore {
  authUser: AuthUser | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
  socket: Socket | null;

  checkAuth: () => Promise<void>;
  signup: (data: AuthPayload) => Promise<void>;
  login: (data: AuthPayload) => Promise<AuthUser | void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;

  connectSocket: () => void;
  disconnectSocket: () => void;
}

const BASE_URL = "https://e-chat-backend-slin.onrender.com";

export const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get<AuthUser>("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data: AuthPayload) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post<AuthUser>("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      const err = error as AxiosError<any>;
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
  // set({ isLoggingIn: true });
  try {
    const res = await axiosInstance.post('/auth/login', data);
    set({ authUser: res.data });
    toast.success("Logged in successfully");
    get().connectSocket();
    return res.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Login failed');
    throw new Error(error.response?.data?.message || 'Login failed'); // <== THROW error here
  } finally {
    set({ isLoggingIn: false });
  }
},


  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      const err = error as AxiosError<any>;
      toast.error(err.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data: Partial<AuthUser>) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put<AuthUser>("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      const err = error as AxiosError<any>;
      console.error("error in update profile:", err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket: Socket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    newSocket.connect();
    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
  },
}));
