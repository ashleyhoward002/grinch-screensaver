import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MonitorPlay, Settings, Timer, Music, UserX, Power, Volume2, VolumeX } from 'lucide-react';
import Screensaver from './components/Screensaver';
import { generateGrinchQuote } from './services/geminiService';
import { GrinchQuote } from './types';

const IDLE_TIMEOUT = 10000; // 10 seconds for demo purposes, normally longer

function App() {
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [manualOverride, setManualOverride] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [welcomeQuote, setWelcomeQuote] = useState<string>("Ugh. You're here.");
  
  // Use 'any' or 'number' for browser timers to avoid NodeJS.Timeout conflicts
  const idleTimerRef = useRef<number | null>(null);

  // Activity Monitor
  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    if (isScreensaverActive) {
        // We only wake up if the screensaver component calls onWake, 
        // effectively handling the 'wake' logic there to prevent instant flickering
    }
  }, [isScreensaverActive]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handler = () => resetTimer();
    
    events.forEach(event => window.addEventListener(event, handler));
    
    return () => {
      events.forEach(event => window.removeEventListener(event, handler));
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, [resetTimer]);

  // Check for idle
  useEffect(() => {
    const checkIdle = () => {
      if (manualOverride) return;

      const now = Date.now();
      if (now - lastActivity > IDLE_TIMEOUT && !isScreensaverActive) {
        setIsScreensaverActive(true);
      }
    };

    const interval = setInterval(checkIdle, 1000);
    return () => clearInterval(interval);
  }, [lastActivity, isScreensaverActive, manualOverride]);

  const handleWake = () => {
    setIsScreensaverActive(false);
    setLastActivity(Date.now());
    generateGrinchQuote("user returned").then((q: GrinchQuote) => setWelcomeQuote(q.text));
  };

  const forceScreensaver = () => {
    setManualOverride(false);
    setIsScreensaverActive(true);
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-lime-500 selection:text-black">
      {isScreensaverActive ? (
        <Screensaver onWake={handleWake} soundEnabled={isSoundEnabled} />
      ) : (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          
          {/* Header */}
          <header className="flex items-center justify-between mb-12 border-b border-slate-700 pb-6">
            <div className="flex items-center space-x-4">
               <div className="p-3 bg-lime-500 rounded-full shadow-[0_0_15px_rgba(132,204,22,0.5)]">
                 <UserX className="text-slate-900" size={32} />
               </div>
               <div>
                 <h1 className="text-3xl font-bold text-white font-christmas tracking-wide">GrinchMode</h1>
                 <p className="text-lime-500 text-sm font-medium">Screensaver Control Center</p>
               </div>
            </div>
            <button 
                onClick={forceScreensaver}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 hover:text-lime-400 text-slate-300 px-4 py-2 rounded-lg transition-all border border-slate-700 shadow-lg"
            >
                <MonitorPlay size={18} />
                <span>Start Now</span>
            </button>
          </header>

          {/* Main Dashboard */}
          <main className="space-y-8">
            
            {/* Welcome / Status */}
            <section className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Settings size={120} />
                </div>
                <h2 className="text-xl font-semibold text-lime-400 mb-2">System Status: <span className="text-white">WAITING FOR INACTIVITY</span></h2>
                <p className="text-slate-400 mb-6">
                    The screensaver will activate automatically after <span className="text-white font-mono font-bold">10 seconds</span> of idleness.
                    Don't touch anything. I dare you.
                </p>

                <div className="bg-slate-900/80 p-6 rounded-xl border-l-4 border-lime-500 italic text-lg text-slate-300">
                    "{welcomeQuote}"
                </div>
            </section>

            {/* Config Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-start gap-4 hover:border-lime-500/30 transition-colors">
                    <div className="p-2 bg-slate-700 rounded-lg text-lime-400">
                        <Timer size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Idle Timer</h3>
                        <p className="text-sm text-slate-400 mt-1">Currently set to 10s for demo.</p>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-lime-500 h-full w-[10%] animate-pulse"></div>
                    </div>
                </div>

                <button 
                    onClick={toggleSound}
                    className={`text-left p-6 rounded-xl border flex flex-col items-start gap-4 transition-all duration-300 group ${
                        isSoundEnabled 
                            ? 'bg-slate-800 border-lime-500/50 shadow-[0_0_20px_rgba(132,204,22,0.1)]' 
                            : 'bg-slate-800 border-slate-700 hover:border-red-500/30'
                    }`}
                >
                    <div className={`p-2 rounded-lg transition-colors ${isSoundEnabled ? 'bg-lime-900/30 text-lime-400' : 'bg-slate-700 text-red-400'}`}>
                        {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </div>
                    <div>
                        <h3 className={`font-semibold transition-colors ${isSoundEnabled ? 'text-lime-400' : 'text-white'}`}>
                            Festive Noise
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                            {isSoundEnabled ? "Playing Mt. Crumpit Winds." : "Audio is disabled. Silence is golden."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        {isSoundEnabled ? (
                             <span className="px-2 py-1 bg-lime-900/30 text-lime-400 text-xs rounded border border-lime-900/50 animate-pulse">ACTIVE</span>
                        ) : (
                             <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded border border-red-900/50">MUTED</span>
                        )}
                        <span className="text-xs text-slate-500 ml-2 group-hover:text-slate-300 transition-colors">Click to toggle</span>
                    </div>
                </button>
            </div>

            {/* Footer Control */}
            <div className="pt-8 border-t border-slate-800 text-center">
                 <p className="text-slate-500 text-sm mb-4">Want to ruin Christmas immediately?</p>
                 <button 
                    onClick={() => {
                        if (confirm("Are you sure you want to shut down? Just kidding, this button does nothing useful.")) {
                           // noop
                        }
                    }}
                    className="group inline-flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm"
                 >
                    <Power size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>Disable Screensaver System</span>
                 </button>
            </div>

          </main>
        </div>
      )}
    </div>
  );
}

export default App;