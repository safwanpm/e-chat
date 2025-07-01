// 'use client';

// import { useEffect, useState } from 'react';
// import { User, Settings, Moon, Plus, LogOut, Loader } from 'lucide-react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useAuthStore } from '@/store/authStore';
// import { useChatStore, User as ChatUser } from '@/store/chatStore';
// import toast from 'react-hot-toast';
// import { NewChatModal } from './NewChatModal';

// export const Sidebar = ({
//   selectedUser,
//   setselectedUser,
//   setView,
// }: {
//   selectedUser: ChatUser | null;
//   setselectedUser: (user: ChatUser) => void;
//   setView: (view: 'chat' | 'list') => void;
// }) => {
//   const { authUser, logout } = useAuthStore();
//   const {
//     users,
//     isViewUsersLoading,
//     getUsers,
//   } = useChatStore();

//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Fetch users on mount
//   useEffect(() => {
//     getUsers();
//   }, [getUsers]);
// console.log(users,'sidebar');

//     const router = useRouter();

//   const handleLogout = async () => {
//     await logout();
//     router.push('/');
//   };

//   return (
//     <>
//       <aside className="w-full h-full bg-secondary md:rounded-l-xl p-4 flex flex-col">
//         {/* Profile Header */}
//         <div className="flex items-center justify-between pb-4 border-b border-gray-200">
//           <Link href={'/home/profile'} className="flex items-center gap-3">
//             <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-full">
//               {authUser?.profilePic ? (
//                 <img
//                   src={authUser.profilePic}
//                   alt={authUser.name}
//                   className="w-full h-full rounded-full object-cover"
//                 />
//               ) : (
//                 <User size={24} className="text-purple-600" />
//               )}
//             </div>
//             <span className="font-bold text-lg text-gray-800">
//               {authUser?.name || 'User Name'}
//             </span>
//           </Link>
//           <div className="flex items-center gap-3 text-gray-500">
//             <button className="hover:text-gray-800" onClick={() => setIsModalOpen(true)}>
//               <Plus size={22} />
//             </button>
//             <button className="hover:text-gray-800" onClick={() => toast('Feature coming soon!')}>
//               <Settings size={22} />
//             </button>
//             <button className="hover:text-gray-800" onClick={() => toast('Dark mode coming soon!')}>
//               <Moon size={22} />
//             </button>
//           </div>
//         </div>

//         {/* Search */}
//         <div className="relative my-4">
//           <input
//             type="text"
//             placeholder="Search users"
//             className="w-full py-2.5 pl-4 pr-4 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
//             onChange={() => toast('Search functionality coming soon!')}
//           />
//         </div>

//         {/* Users List */}
//         <div className="flex-grow overflow-y-auto -mr-2 pr-2">
//           {isViewUsersLoading ? (
//             <div className="flex justify-center items-center h-full">
//               <Loader className="animate-spin text-gray-400" size={28} />
//             </div>
//           ) : users.length > 0 ? (
//             <div className="space-y-2">
//               {users.map((user) => (
//                 <div
//                   key={user._id as string}
//                   onClick={() => {
//                     setselectedUser(user);
//                     setView('chat');
//                   }}
//                   className={`flex items-center gap-4 p-2.5 rounded-xl cursor-pointer transition-colors ${
//                     selectedUser?._id === user._id ? 'bg-white shadow-sm' : 'hover:bg-gray-200/50'
//                   }`}
//                 >
//                   <img
//                     src={user.profilePic || '/default-avatar.png'}
//                     alt={user.name}
//                     className="w-12 h-12 rounded-full object-cover"
//                     onError={(e) => {
//                       (e.target as HTMLImageElement).src = '/default-avatar.png';
//                     }}
//                   />
//                   <div className="min-w-0">
//                     <h3 className="font-semibold text-gray-800 truncate">{user.name}</h3>
//                     <p className="text-sm text-gray-500 truncate">
//                       {user.status || 'Hey there! I am using E-Chat'}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="flex flex-col items-center justify-center h-full text-center p-4">
//               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
//                 <User size={24} className="text-gray-400" />
//               </div>
//               <p className="text-gray-500">No users found</p>
//               <button
//                 onClick={() => setIsModalOpen(true)}
//                 className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm"
//               >
//                 Start New Chat
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Logout */}
//         <div className="mt-4 pt-4 border-t border-gray-200">
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/80 w-full text-left transition-colors"
//           >
//             <LogOut className="text-primary" size={24} />
//             <span className="font-semibold text-primary">Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* New Chat Modal */}
//       {isModalOpen && <NewChatModal onClose={() => setIsModalOpen(false)} />}
//     </>
//   );
// };
'use client';

import { useEffect, useState } from 'react';
import { User, Settings, Moon, Plus, LogOut, Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore, User as ChatUser } from '@/store/chatStore';
import { toast } from 'react-toastify'
import { NewChatModal } from './NewChatModal';
import { UserAvatar } from '@/components/UserAvatar';
import { useOnlineStatusSync } from './OnlineStatus';

export const Sidebar = ({
  selectedUser,
  setselectedUser,
  setView,
}: {
  selectedUser: ChatUser | null;
  setselectedUser: (user: ChatUser) => void;
  setView: (view: 'chat' | 'list') => void;
}) => {
  const { authUser, logout } = useAuthStore();
  const {
    users,
    isViewUsersLoading,
    getUsers,
  } = useChatStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  useOnlineStatusSync()
  const onlineUserIds = useChatStore((state) => state.onlineUserIds);
  const updatedUsers = users.map((user) => ({
    ...user,
    status: onlineUserIds.includes(user._id) ? 'Online' : 'Offline',
  }));
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.error('Logout Success')
    router.push('/');
  };

  return (
    <>
      <aside className="w-full h-full bg-secondary md:rounded-l-xl p-4 flex flex-col">
        {/* Profile Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <Link href={'/home/profile'} className="flex items-center gap-3">
            <div className="w-12 h-12">
              <UserAvatar
                src={authUser?.profilePic}
                alt={authUser?.name || 'User'}
                className="w-12 h-12"
              />
            </div>
            <span className="font-bold text-lg text-gray-800">
              {authUser?.name || 'User Name'}
            </span>
          </Link>
          <div className="flex items-center gap-3 text-gray-500">
            <button className="hover:text-gray-800" onClick={() => setIsModalOpen(true)}>
              <Plus size={22} />
            </button>
            <button className="hover:text-gray-800" onClick={() => toast('Feature coming soon!')}>
              <Settings size={22} />
            </button>
            <button className="hover:text-gray-800" onClick={() => toast('Dark mode coming soon!')}>
              <Moon size={22} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative my-4">
          <input
            type="text"
            placeholder="Search users"
            className="w-full py-2.5 pl-4 pr-4 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            onChange={() => toast('Search functionality coming soon!')}
          />
        </div>

        {/* Users List */}
        <div className="flex-grow overflow-y-auto -mr-2 pr-2">
          {isViewUsersLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="animate-spin text-gray-400" size={28} />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-2">
              {updatedUsers.map((user) => (
                <div
                  key={user._id as string}
                  onClick={() => {
                    setselectedUser(user);
                    setView('chat');
                  }}
                  className={`flex items-center gap-4 p-2.5 rounded-xl cursor-pointer transition-colors ${selectedUser?._id === user._id ? 'bg-white shadow-sm' : 'hover:bg-gray-200/50'
                    }`}
                >
                  <UserAvatar
                    src={user.profilePic}
                    alt={user.name}
                    className="w-12 h-12"
                    isOnline={onlineUserIds.includes(user._id)}
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{user.name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {user.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <User size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">No users found</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm"
              >
                Start New Chat
              </button>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/80 w-full text-left transition-colors"
          >
            <LogOut className="text-primary" size={24} />
            <span className="font-semibold text-primary">Logout</span>
          </button>
        </div>
      </aside>

      {/* New Chat Modal */}
      {isModalOpen && <NewChatModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};
