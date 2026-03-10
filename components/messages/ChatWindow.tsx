'use client';

import Avatar from '@/components/ui/Avatar';
import MessageBubble from '@/components/messages/MessageBubble';
import { Message, Profile } from '@/types';
import { Send } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';

interface ChatWindowProps {
  conversationId: string;
  otherUser: Profile;
  currentUserId: string;
}

export default function ChatWindow({ conversationId, otherUser, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/messages?conversation_id=${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || isSending) return;
    setIsSending(true);
    setNewMessage('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, content }),
      });
      if (res.ok) {
        const msg: Message = await res.json();
        setMessages((prev) => [...prev, msg]);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        <Avatar src={otherUser.avatar_url} alt={otherUser.username} size="sm" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">{otherUser.username}</span>
          {otherUser.full_name && (
            <span className="text-xs text-gray-500">{otherUser.full_name}</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <Avatar src={otherUser.avatar_url} alt={otherUser.username} size="xl" />
            <p className="font-semibold text-gray-900">{otherUser.username}</p>
            <p className="text-sm text-gray-500">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 border-t border-gray-200 px-4 py-3"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Message…"
          className="flex-1 rounded-full border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          aria-label="Send message"
          className="rounded-full p-2 text-blue-500 hover:bg-blue-50 disabled:opacity-30 transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
