'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { ChatWindow } from '@/components/ChatWindow';
import { EmptyChatPlaceholder } from '@/components/EmptyChatPlaceholder';
import { NewChatModal } from '@/components/NewChatModal';
import { Sidebar } from '@/components/Sidebar'; 
import { User } from '@/store/chatStore';

const ChatPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'list' | 'chat'>('list');

  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { selectedUser, setSelectedUser } = useChatStore();
  const router = useRouter();

  // ✅ Check auth on load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ✅ Fetch users for sidebar
 

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>E-Chat - Next.js & Tailwind</title>
        <meta name="description" content="A chat UI built with Next.js and Tailwind CSS" />
      </Head>

      <div className="antialiased text-gray-800 bg-gray-200 flex items-center justify-center min-h-screen">
        <div className="w-full h-screen p-0">
          <div className="h-full md:rounded-2xl shadow-lg flex">
            {/* Sidebar Section */}
            <div className={`${view === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[350px] lg:w-[400px]`}>
              <Sidebar
                users={users}
                selectedUser={selectedUser}
                setselectedUser={setSelectedUser}
                setView={setView}
              />
            </div>

            {/* Chat Window Section */}
            <div className={`${view === 'chat' ? 'flex' : 'hidden'} md:flex flex-col flex-1`}>
              {selectedUser ? (
                <ChatWindow contact={selectedUser} setView={setView} />
              ) : (
                <EmptyChatPlaceholder onStartNewChat={() => setIsModalOpen(true)} />
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && <NewChatModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default ChatPage;
