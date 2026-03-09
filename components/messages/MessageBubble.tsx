'use client';

import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function timeLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col max-w-[70%] gap-0.5">
        <div
          className={`rounded-2xl px-4 py-2 text-sm break-words ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
        >
          {message.content}
        </div>
        <span
          className={`text-[10px] text-gray-400 ${isOwn ? 'text-right' : 'text-left'} px-1`}
        >
          {timeLabel(message.created_at)}
          {isOwn && (
            <span className="ml-1">{message.read ? '✓✓' : '✓'}</span>
          )}
        </span>
      </div>
    </div>
  );
}
