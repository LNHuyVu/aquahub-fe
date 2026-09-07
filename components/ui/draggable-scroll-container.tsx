'use client';

import React, { useRef, useState } from 'react';

interface DraggableScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function DraggableScrollContainer({
  children,
  className = '',
}: DraggableScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsMouseDown(true);
    setHasMoved(false);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !containerRef.current) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.8; // Scroll sensitivity multiplier
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Prevent button click if the user was dragging the menu horizontally
  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasMoved) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onClickCapture={handleClickCapture}
      className={`flex items-center gap-2 overflow-x-auto select-none scrollbar-none max-w-full transition-all ${
        isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
      } ${className}`}
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {children}
    </div>
  );
}
