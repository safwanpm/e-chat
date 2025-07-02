'use client';

import {
  ArrowLeft, Phone, Paperclip, Mic, AudioWaveform, Send, MoreVertical, Image
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore, Message, User } from '@/store/chatStore';
import { format } from 'date-fns';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

interface ChatWindowProps {
  contact: User;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const relevantMessages = messages.filter(
    (msg) =>
      (msg.senderId === authUser?._id && msg.receiverId === contact._id) ||
      (msg.senderId === contact._id && msg.receiverId === authUser?._id)
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [relevantMessages, scrollToBottom]);

  useEffect(() => {
    if (contact._id) {
      getMessages(contact._id);
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [contact._id]);

  const uploadToCloudinary = async (file: File | Blob, type: 'image' | 'audio') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'e-chat-cloudinary');
    formData.append('cloud_name', 'dh4xqnzmv');

    const endpoint =
      type === 'image'
        ? 'https://api.cloudinary.com/v1_1/dh4xqnzmv/image/upload'
        : 'https://api.cloudinary.com/v1_1/dh4xqnzmv/video/upload';

    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      let imageUrl = '';
      let audioUrl = '';

      if (selectedFile) {
        imageUrl = await uploadToCloudinary(selectedFile, 'image');
      }

      if (audioBlob) {
        audioUrl = await uploadToCloudinary(audioBlob, 'audio');
      }

      await sendMessage({ text, image: imageUrl, audio: audioUrl });
    },
    onSuccess: () => {
      setNewMessage('');
      setSelectedFile(null);
      setFilePreview(null);
      setAudioBlob(null);
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to send message'),
  });

  const handleSend = () => {
    if (!newMessage.trim() && !selectedFile && !audioBlob) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleAudioRecord = async () => {
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const audio = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(audio);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } else {
      mediaRecorder?.stop();
      setIsRecording(false);
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
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={() => setPreviewImageUrl(null)}
        >
          <img
            src={previewImageUrl}
            alt="Full preview"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

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
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="attachment"
                            className="w-60 h-40 max-h-60 rounded-lg mb-2 cursor-pointer"
                            onClick={() => setPreviewImageUrl(msg.image)}
                          />
                        )}
                        {msg.audio && (
                          <audio controls className="mt-2">
                            <source src={msg.audio} type="audio/webm" />
                            Your browser does not support the audio element.
                          </audio>
                        )}
                        {msg.text && <p>{msg.text}</p>}
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

      {/* Input Area */}
      <div className="p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
        {filePreview && (
          <div className="mb-2 relative">
            <img src={filePreview} alt="Preview" className="w-32 h-32 object-cover rounded-md" />
            <button
              onClick={() => {
                setFilePreview(null);
                setSelectedFile(null);
              }}
              className="absolute top-0 right-0 text-black bg-gray-50 rounded-full w-6 h-6"
            >×</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
            <Image size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-full bg-blue-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={newMessage.trim() || selectedFile || audioBlob ? handleSend : handleAudioRecord}
            disabled={sendMessageMutation.isLoading}
            className={`p-3 rounded-full transition-colors ${newMessage.trim() || selectedFile || audioBlob
                ? 'bg-primary hover:text-gray-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            {sendMessageMutation.isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isRecording ? (
              <AudioWaveform />
            ) : newMessage.trim() || selectedFile || audioBlob ? (
              <Send size={18} />
            ) : (
              <Mic size={18} />
            )}
          </button>

        </div>
      </div>
    </div>
  );
};
