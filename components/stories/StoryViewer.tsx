'use client';

import Avatar from '@/components/ui/Avatar';
import { Story } from '@/types';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

interface StoryViewerProps {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
}

const STORY_DURATION = 5000;

export default function StoryViewer({ stories, initialIndex = 0, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  const current = stories[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    setProgress(0);
    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        goNext();
      }
    };

    intervalRef.current = setInterval(tick, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex, goNext]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onClose]);

  if (!current) return null;

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, currentTarget } = e;
    const mid = currentTarget.getBoundingClientRect().width / 2;
    if (clientX < mid) {
      goPrev();
    } else {
      goNext();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative h-full w-full max-w-sm mx-auto" onClick={handleTap}>
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
          {stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-0.5 rounded-full bg-white/40 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width:
                    idx < currentIndex
                      ? '100%'
                      : idx === currentIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-7 left-3 right-3 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Avatar src={current.user.avatar_url} alt={current.user.username} size="sm" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">{current.user.username}</span>
              <span className="text-[10px] text-white/70">
                {new Date(current.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close story"
            className="rounded-full p-1 text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Story image */}
        <Image
          src={current.image_url}
          alt={`Story by ${current.user.username}`}
          fill
          className="object-cover"
          unoptimized={current.image_url.startsWith('http')}
          priority
        />
      </div>
    </div>
  );
}
