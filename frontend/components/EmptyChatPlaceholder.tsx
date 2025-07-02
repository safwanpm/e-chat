'use client'
import { MessageSquare } from 'lucide-react';

export const EmptyChatPlaceholder = ({ onStartNewChat }: { onStartNewChat: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center h-full bg-primary text-white md:rounded-r-xl p-8 text-center">
    <MessageSquare size={60} className="mb-4 text-white/80" />
    <h2 className="text-md md:text-xl font-bold">No conversation Selected</h2>
    <p className="mt-1 text-white/90">Choose a conversation from Sidebar</p>
    <button
      onClick={onStartNewChat}
      className="mt-4 px-3 py-1.5 bg-gray-100/90 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-white transition-all"
    >
      Start New Chat
    </button>
  </div>
);