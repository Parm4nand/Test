'use client';

import ChatWindow from '@/components/messages/ChatWindow';
import { createClient } from '@/lib/supabase/client';
import { Conversation } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  const [conversation, setConversation] = useState<Conversation | null>(null);
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
          const conversations: Conversation[] = data.conversations ?? [];
          const found = conversations.find((c) => c.id === conversationId);
          setConversation(found ?? null);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [conversationId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
      </div>
    );
  }

  if (!conversation || !currentUserId) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Conversation not found.</p>
        <Link href="/messages" className="text-sm text-blue-500 hover:underline">
          Back to messages
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] md:h-screen flex-col">
      {/* Back header (mobile) */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 md:hidden">
        <Link href="/messages" aria-label="Back to messages" className="text-gray-900 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-sm font-semibold text-gray-900">
          {conversation.other_user.username}
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          conversationId={conversation.id}
          otherUser={conversation.other_user}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
