import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

export const useOnlineStatusSync = () => {
  const { socket } = useAuthStore();
  const setOnlineUserIds = useChatStore((state) => state.setOnlineUserIds);

  useEffect(() => {
    if (!socket) return;

    socket.on('getOnlineUsers', (onlineIds: string[]) => {
      setOnlineUserIds(onlineIds);
    });

    return () => {
      socket.off('getOnlineUsers');
    };
  }, [socket, setOnlineUserIds]);
};
