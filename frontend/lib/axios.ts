// lib/axios.ts
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:  "https://e-chat-backend-slin.onrender.com",
  withCredentials: true,
});
