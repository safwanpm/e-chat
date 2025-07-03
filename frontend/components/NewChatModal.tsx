'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { User } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';

export const NewChatModal = ({ onClose }: { onClose: () => void }) => {
  const { viewUsers, getViewUsers, setSelectedUser } = useChatStore();
  const { authUser } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getViewUsers();
  }, [getViewUsers]);



  const filteredUsers = searchTerm
    ? viewUsers.filter(
      (user) =>
        user._id !== authUser?._id &&
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];


  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Start New Chat</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for people"
          className="w-full mb-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {searchTerm && (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className="p-3 rounded-md cursor-pointer hover:bg-secondary shadow-xl bg-gray-100   flex items-center space-x-3"
                >
                  <Image
                    height={80}
                    width={80}
                    src={user.profilePic|| 'https://cdn-icons-png.flaticon.com/128/847/847969.png'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <p className="font-medium text-gray-800">{user.name}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No users found.</p>
            )}
          </div>

        )}


        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
