import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Gift, XOctagon, Volume2, VolumeX } from 'lucide-react';
import Snow from './Snow';
import HeartWidget from './HeartWidget';
import { generateGrinchQuote } from '../services/geminiService';
import { GrinchQuote } from '../types';

interface ScreensaverProps {
  onWake: () => void;
  soundEnabled: boolean;
}

const Screensaver: React.FC<ScreensaverProps> = ({ onWake, soundEnabled }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [quote, setQuote] = useState<GrinchQuote | null>(null);
  const [heartSize, setHeartSize] = useState(1);
  const [mouseMoved, setMouseMoved] = useState(false);
  
  // Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sound Logic
  useEffect(() => {
    if (soundEnabled) {
      // Using a publicly available weather sound (Wind) from Google Actions Sound Library
      // This fits the "top of Mt. Crumpit" vibe
      const audio = new Audio('https://actions.google.com/sounds/v1/weather/strong_wind_blowing.ogg');
      audio.loop = true;
      audio.volume = 0.5;
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Audio autoplay prevented by browser policy:", error);
        });
      }
      
      audioRef.current = audio;

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [soundEnabled]);

  // Countdown logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let christmas = new Date(currentYear, 11, 25); // Month is 0-indexed

      if (now.getTime() > christmas.getTime()) {
        christmas = new Date(currentYear + 1, 11, 25);
      }

      const difference = christmas.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, []);

  // Fetch initial quote and rotate occasionally
  const fetchQuote = useCallback(async () => {
    try {
      const newQuote = await generateGrinchQuote("waiting for Christmas");
      setQuote(newQuote);
      
      // Adjust heart size based on mood
      if (newQuote.mood === 'slightly-touched') {
        setHeartSize(3);
      } else if (newQuote.mood === 'angry') {
        setHeartSize(1);
      } else {
        setHeartSize(1.5);
      }

    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchQuote();
    // Increased interval to 60 seconds to reduce API calls and prevent 429 errors
    const quoteInterval = setInterval(fetchQuote, 60000); 
    return () => clearInterval(quoteInterval);
  }, [fetchQuote]);

  // Handle Wake Up
  const handleInteraction = () => {
    if (!mouseMoved) {
      setMouseMoved(true);
      onWake();
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('click', handleInteraction);
    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, []);

  if (!timeLeft) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center grinch-gradient cursor-none overflow-hidden select-none">
      <Snow />
      
      {/* Sound Indicator */}
      <div className="absolute top-6 right-6 z-50 opacity-50">
          {soundEnabled ? <Volume2 className="text-lime-400 animate-pulse" size={24} /> : <VolumeX className="text-red-900" size={24} />}
      </div>

      {/* Moving Background Elements (Simulated with absolute positions/animations) */}
      <div className="absolute top-10 left-10 animate-pulse text-lime-900 opacity-20">
        <Gift size={120} />
      </div>
      <div className="absolute bottom-20 right-20 animate-bounce duration-[3000ms] text-red-900 opacity-20">
        <XOctagon size={100} />
      </div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center max-w-4xl text-center px-6">
        
        {/* The Quote */}
        <div className="mb-10 min-h-[120px] flex items-center justify-center perspective-1000">
            {quote ? (
                <div key={quote.text} className="relative group animate-fade-bounce">
                    <h1 className="text-4xl md:text-6xl font-christmas text-lime-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight">
                    "{quote.text}"
                    </h1>
                    <p className="mt-4 text-lime-700 text-sm font-bold uppercase tracking-widest opacity-80">
                    — The Grinch ({quote.mood})
                    </p>
                </div>
            ) : (
                <div className="animate-pulse text-lime-800 text-2xl font-christmas">Stealing thoughts...</div>
            )}
        </div>

        {/* Heart Animation */}
        <div className="mb-12">
            <HeartWidget sizeMultiplier={heartSize} />
        </div>

        {/* Countdown Timer */}
        <div className="bg-black/40 backdrop-blur-sm p-8 rounded-3xl border border-lime-900/50 shadow-2xl transform transition-transform hover:scale-[1.02] duration-300">
          <div className="flex items-center justify-center space-x-2 text-lime-500 mb-6 opacity-80">
            <Clock size={20} />
            <span className="uppercase tracking-widest text-sm font-semibold">Time Until I Steal Christmas</span>
          </div>
          
          <div className="grid grid-cols-4 gap-4 md:gap-8 text-center">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.minutes} label="Mins" />
            <TimeUnit value={timeLeft.seconds} label="Secs" />
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-lime-900/40 text-sm font-mono">
        Move mouse to annoy the Grinch
      </div>
    </div>
  );
};

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <span className="text-4xl md:text-6xl font-bold font-mono text-white tabular-nums drop-shadow-md">
      {value.toString().padStart(2, '0')}
    </span>
    <span className="text-xs md:text-sm text-lime-600 font-medium uppercase mt-2">{label}</span>
  </div>
);

export default Screensaver;