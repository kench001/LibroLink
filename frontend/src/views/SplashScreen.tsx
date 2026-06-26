import { useEffect, useState, useCallback } from 'react';
import { BookOpen } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [start, setStart] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleFinish = useCallback(() => {
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setStart(true));
    const exitTimer = setTimeout(() => setExiting(true), 1800);
    const finishTimer = setTimeout(() => handleFinish(), 2500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [handleFinish]);

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-slate-950"
      style={{
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(0.96)' : 'scale(1)',
        transition: 'opacity 700ms ease-in-out, transform 700ms ease-in-out',
        willChange: 'opacity, transform',
      }}
    >
      <div
        className="relative mb-8"
        style={{
          opacity: start ? 1 : 0,
          transform: start ? 'scale(1)' : 'scale(0.85)',
          transition: 'opacity 600ms ease-out, transform 600ms ease-out',
          willChange: 'opacity, transform',
        }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
          <BookOpen className="h-10 w-10 text-white" />
        </div>
        <div className="absolute -inset-4 -z-10 animate-pulse rounded-3xl bg-purple-500/10 blur-xl" />
      </div>

      <div
        style={{
          opacity: start ? 1 : 0,
          transform: start ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 600ms ease-out 200ms, transform 600ms ease-out 200ms',
          willChange: 'opacity, transform',
        }}
      >
        <h1 className="mb-2 text-center text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          LibroLink
        </h1>
        <p className="text-center text-sm tracking-wide text-slate-500">
          Your digital library companion
        </p>
      </div>
    </div>
  );
}
