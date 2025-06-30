// export interface AuthUser {
//   _id: string;
//   name: string;
//   email: string;
//   profilePic:string
//   // add more fields
// }

// export interface AuthStore {
//   authUser: AuthUser | null;
//   isSigningUp: boolean;
//   isLoggingIn: boolean;
//   isUpdatingProfile: boolean;
//   isCheckingAuth: boolean;
//   onlineUsers: string[];
//   socket: any;

//   checkAuth: () => Promise<void>;
//   signup: (data: Record<string, any>) => Promise<void>;
//   login: (data: Record<string, any>) => Promise<void>;
//   logout: () => Promise<void>;
//   updateProfile: (data: Record<string, any>) => Promise<void>;
//   connectSocket: () => void;
//   disconnectSocket: () => void;
// }


// export interface User {
//   _id: string;
//   name: string;
//   email: string;
//   profilePic: string;
//   // add more fields as needed
// }

// export interface Message {
//   _id: string;
//   senderId: Number;
//   receiverId: string;
//   text?: string;
//   image?: string;
//   createdAt: string;
//   updatedAt: string;
//   // add more fields as needed
// }

// export interface MessagePayload {
//   text?: string;
//   image?: string;
//   // add more fields as needed
// }

// export interface ChatStore {
//   messages: Message[];
//   users: User[];
//   selectedUser: User | null;
//   isUsersLoading: boolean;
//   isMessagesLoading: boolean;
//   isSendingMessage: boolean;

//   getUsers: () => Promise<void>;
//   getMessages: (userId: string) => Promise<void>;
//   sendMessage: (messageData: MessagePayload) => Promise<void>;
//   subscribeToMessages: () => void;
//   unsubscribeFromMessages: () => void;
//   setSelectedUser: (user: User | null) => void;
// }
// export type UserProfile = {
//   id: number;
//   name: string;
//   profilePic: string;
//   status: 'Online' | 'Offline';
// };


// export type Message = {
//   id: number;
//   text: string;
//   timestamp: string;
//   senderId: number;
// };


