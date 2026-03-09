'use client';

import ChatWindow from '@/components/messages/ChatWindow';
import ConversationList from '@/components/messages/ConversationList';
import { createClient } from '@/lib/supabase/client';
import { Conversation } from '@/types';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      try {
        const res = await fetch('/api/messages');
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations ?? []);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <div className="flex h-[calc(100vh-7rem)] md:h-screen">
      {/* Conversation list */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col shrink-0 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Messages</h2>
        </div>
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?.id}
              onSelect={setActiveConversation}
            />
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className={`flex-1 ${activeConversation ? 'flex' : 'hidden md:flex'} flex-col`}>
        {activeConversation && currentUserId ? (
          <ChatWindow
            conversationId={activeConversation.id}
            otherUser={activeConversation.other_user}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-6">
            <div className="rounded-full border-2 border-gray-900 p-4">
              <MessageCircle className="h-10 w-10 text-gray-900" />
            </div>
            <div>
              <p className="text-xl font-light text-gray-900">Your messages</p>
              <p className="mt-1 text-sm text-gray-500">
                Send private photos and messages to a friend or group.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
