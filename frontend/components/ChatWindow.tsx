

import {
  ArrowLeft, Phone, Paperclip, Mic, Send, User, MoreVertical,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore, Message, UserProfile } from '@/store/chatStore';
import { format } from 'date-fns';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  contact: UserProfile;
  setView: (view: 'list' | 'chat') => void;
}

export const ChatWindow = ({ contact, setView }: ChatWindowProps) => {
  const { authUser } = useAuthStore();
  const {
    messages,
    getMessages,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
    isMessagesLoading,
  } = useChatStore();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get only relevant messages
  const relevantMessages = messages.filter(
    (msg) =>
      (msg.senderId === authUser?._id && msg.receiverId === contact._id) ||
      (msg.senderId === contact._id && msg.receiverId === authUser?._id)
  );

  // Scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [relevantMessages, scrollToBottom]);

  // Fetch messages and subscribe on mount
  useEffect(() => {
    if (contact._id) {
      getMessages(contact._id);
      subscribeToMessages();

      return () => unsubscribeFromMessages();
    }
  }, [contact._id]);

  // Mutation for sending
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      await sendMessage({ text });
    },
    onSuccess: () => setNewMessage(''),
    onError: (err: any) =>
      toast.error(err?.message || 'Failed to send message'),
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso: string) => format(new Date(iso), 'p');
  const formatDate = (iso: string) => format(new Date(iso), 'MMMM d, yyyy');

  const groupedMessages = relevantMessages.reduce<Record<string, Message[]>>((acc, msg) => {
    const date = formatDate(msg.createdAt);
    acc[date] = acc[date] || [];
    acc[date].push(msg);
    return acc;
  }, {});

  if (!authUser || !contact) return null;

  return (
    <div className="flex flex-col h-full dark:bg-gray-900 shadow-lg overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-5 border-b border-white dark:border-gray-700 bg-secondary dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('list')}
            className="md:hidden p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          {contact.profilePic ? (
            <img src={contact.profilePic} alt={contact.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300">
              {contact.name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-white">{contact.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{contact.status}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
            <Phone size={20} />
          </button>
          <button className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6 bg-gray-50 dark:bg-gray-900">
        {isMessagesLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 ? 'justify-end' : 'justify-start'} gap-2`}>
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
                <div className="w-48 h-6 rounded-xl bg-gray-300 dark:bg-gray-700 animate-pulse" />
              </div>
            ))}
          </div>
        ) : Object.entries(groupedMessages).length ? (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="text-center my-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">{date}</span>
              </div>
              {msgs.map((msg) => {
                const isOwn = msg.senderId === authUser._id;
                return (
                  <div key={msg._id} className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {!isOwn && (
                      <img
                        src={contact.profilePic || ''}
                        alt={contact.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-2 rounded-2xl shadow ${isOwn
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-none'
                        }`}>
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                    {isOwn && (
                      <img
                        src={authUser.profilePic || ''}
                        alt="You"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">

            <h3 className="text-lg font-semibold">No messages yet</h3>
            <p className="text-sm">Start a conversation with {contact.name}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3  dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
            <Paperclip size={20} />
          </button>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-full bg-blue-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={newMessage.trim() ? handleSend : undefined}
            disabled={sendMessageMutation.isLoading}
            className={`p-3 rounded-full transition-colors ${newMessage.trim()
              ? 'bg-primary hover:text-gray-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            {sendMessageMutation.isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              newMessage.trim() ? <Send size={18} /> : <Mic size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
