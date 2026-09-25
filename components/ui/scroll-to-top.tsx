'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setProgress(pct);
      setVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SVG circle progress ring
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Về đầu trang"
      className={`
        fixed z-[9970] right-4 md:right-6 bottom-36 md:bottom-20
        w-11 h-11 flex items-center justify-center
        bg-white border border-blue-100 rounded-full
        shadow-lg shadow-blue-500/10
        transition-all duration-300 ease-out
        hover:scale-110 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-300
        active:scale-95 cursor-pointer
        ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
    >
      {/* Progress ring */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Track */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="#E2EDFF"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Progress */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="#1A94FF"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-150 ease-linear"
        />
      </svg>

      {/* Arrow icon */}
      <ArrowUp className="w-4 h-4 text-[#1A94FF] relative z-10" strokeWidth={2.5} />
    </button>
  );
}
