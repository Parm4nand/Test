'use client';

import Avatar from '@/components/ui/Avatar';
import { Conversation } from '@/types';
import { formatTimeAgo } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conversation: Conversation) => void;
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <span className="text-5xl mb-4">💬</span>
        <p className="font-semibold text-gray-900">Your Messages</p>
        <p className="mt-1 text-sm text-gray-500">
          Send private photos and messages to a friend or group.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeId;
        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={`flex items-center gap-3 px-4 py-3 transition-colors text-left ${
              isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="relative shrink-0">
              <Avatar
                src={conversation.other_user.avatar_url}
                alt={conversation.other_user.username}
                size="md"
              />
            </div>
            <div className="flex flex-1 flex-col min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {conversation.other_user.username}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatTimeAgo(conversation.last_message_at)}
                </span>
              </div>
              <span className="text-sm text-gray-500 truncate">{conversation.last_message}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
