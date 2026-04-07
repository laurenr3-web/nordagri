
import React, { useRef, useState, useCallback } from 'react';
import { PlanningTask } from '@/services/planning/planningService';
import { TaskCard } from './TaskCard';
import { Check, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';

const SWIPE_THRESHOLD = 80;
const MAX_SWIPE = 120;

interface SwipeableTaskCardProps {
  task: PlanningTask;
  onClick?: () => void;
  teamMembers?: { id: string; name: string }[];
  currentUserMemberId?: string | null;
  onAssign?: (taskId: string, memberId: string | null) => void;
  onComplete?: (taskId: string) => void;
  onPostpone?: (taskId: string) => void;
}

export function SwipeableTaskCard({
  task,
  onClick,
  teamMembers,
  currentUserMemberId,
  onAssign,
  onComplete,
  onPostpone,
}: SwipeableTaskCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isSwiping = useRef(false);
  const isScrolling = useRef<boolean | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const isDone = task.status === 'done';
  const canSwipe = !isDone && (!!onComplete || !!onPostpone);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!canSwipe) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentX.current = 0;
    isSwiping.current = false;
    isScrolling.current = null;
    setTransitioning(false);
  }, [canSwipe]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!canSwipe) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // Determine scroll vs swipe on first significant move
    if (isScrolling.current === null) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 5) {
        isScrolling.current = true;
        return;
      }
      if (Math.abs(dx) > 10) {
        isScrolling.current = false;
      } else {
        return;
      }
    }

    if (isScrolling.current) return;

    isSwiping.current = true;
    const clamped = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, dx));
    currentX.current = clamped;
    setOffsetX(clamped);
  }, [canSwipe]);

  const handleTouchEnd = useCallback(() => {
    if (!canSwipe || !isSwiping.current) return;

    const dx = currentX.current;
    setTransitioning(true);

    if (dx >= SWIPE_THRESHOLD && onComplete) {
      // Swipe right → complete
      setOffsetX(MAX_SWIPE + 20);
      setTimeout(() => {
        onComplete(task.id);
        setOffsetX(0);
        setTransitioning(false);
      }, 200);
    } else if (dx <= -SWIPE_THRESHOLD && onPostpone) {
      // Swipe left → postpone
      setOffsetX(-MAX_SWIPE - 20);
      setTimeout(() => {
        onPostpone(task.id);
        setOffsetX(0);
        setTransitioning(false);
      }, 200);
    } else {
      setOffsetX(0);
      setTimeout(() => setTransitioning(false), 200);
    }

    isSwiping.current = false;
    isScrolling.current = null;
  }, [canSwipe, onComplete, onPostpone, task.id]);

  const handleClick = useCallback(() => {
    // Only trigger click if we weren't swiping
    if (Math.abs(currentX.current) < 10) {
      onClick?.();
    }
  }, [onClick]);

  const rightActive = offsetX >= SWIPE_THRESHOLD;
  const leftActive = offsetX <= -SWIPE_THRESHOLD;

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-lg">
      {/* Background layers revealed on swipe */}
      {canSwipe && (
        <>
          {/* Complete background (swipe right) */}
          <div
            className={cn(
              "absolute inset-y-0 left-0 flex items-center pl-4 rounded-lg transition-colors",
              rightActive
                ? "bg-green-500 dark:bg-green-600"
                : "bg-green-100 dark:bg-green-900/40"
            )}
            style={{ width: Math.max(0, offsetX) }}
          >
            <Check className={cn(
              "h-5 w-5 transition-colors",
              rightActive ? "text-white" : "text-green-600 dark:text-green-400"
            )} />
          </div>

          {/* Postpone background (swipe left) */}
          <div
            className={cn(
              "absolute inset-y-0 right-0 flex items-center justify-end pr-4 rounded-lg transition-colors",
              leftActive
                ? "bg-blue-500 dark:bg-blue-600"
                : "bg-blue-100 dark:bg-blue-900/40"
            )}
            style={{ width: Math.max(0, -offsetX) }}
          >
            <CalendarClock className={cn(
              "h-5 w-5 transition-colors",
              leftActive ? "text-white" : "text-blue-600 dark:text-blue-400"
            )} />
          </div>
        </>
      )}

      {/* Card content */}
      <div
        className={cn(
          "relative z-10",
          transitioning && "transition-transform duration-200 ease-out"
        )}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <TaskCard
          task={task}
          onClick={handleClick}
          teamMembers={teamMembers}
          currentUserMemberId={currentUserMemberId}
          onAssign={onAssign}
        />
      </div>

      {/* Hint labels */}
      {canSwipe && Math.abs(offsetX) > 30 && (
        <>
          {offsetX > 30 && (
            <span className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold z-0 transition-opacity",
              rightActive ? "text-white opacity-100" : "text-green-700 dark:text-green-300 opacity-70"
            )} style={{ maxWidth: Math.max(0, offsetX - 30) }}>
              Terminé
            </span>
          )}
          {offsetX < -30 && (
            <span className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold z-0 transition-opacity",
              leftActive ? "text-white opacity-100" : "text-blue-700 dark:text-blue-300 opacity-70"
            )} style={{ maxWidth: Math.max(0, -offsetX - 30) }}>
              Reporter
            </span>
          )}
        </>
      )}
    </div>
  );
}
