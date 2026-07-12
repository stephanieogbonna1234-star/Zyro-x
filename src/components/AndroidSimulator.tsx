import React, { useState, useEffect } from 'react';
import { WifiOff, Signal, Battery, Maximize2, Minimize2, ChevronLeft, Circle, Square } from 'lucide-react';

interface AndroidSimulatorProps {
  children: React.ReactNode;
  onBackPress?: () => void;
  onHomePress?: () => void;
}

export default function AndroidSimulator({
  children,
  onBackPress,
  onHomePress
}: AndroidSimulatorProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Clock update
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);

    // Simulated battery discharge
    const batteryInterval = setInterval(() => {
      setBatteryLevel((prev) => (prev > 10 ? prev - 1 : 100));
    }, 60000 * 5);

    return () => {
      clearInterval(interval);
      clearInterval(batteryInterval);
    };
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen) {
    return (
      <div id="full-screen-container" className="fixed inset-0 w-full h-full bg-slate-950 text-slate-100 flex flex-col z-50">
        {/* Compact Full-screen Controls Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-200 tracking-wider font-mono">GAMEVAULT OFFLINE</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px]">
            <span className="flex items-center gap-1"><WifiOff className="w-3.5 h-3.5 text-rose-400" /> Offline Mode</span>
            <span className="flex items-center gap-0.5"><Signal className="w-3.5 h-3.5" /> Full</span>
            <span className="flex items-center gap-0.5"><Battery className="w-3.5 h-3.5 text-emerald-400" /> {batteryLevel}%</span>
            <span>{currentTime}</span>
            <button
              onClick={toggleFullscreen}
              className="ml-2 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-100 transition-colors cursor-pointer"
            >
              <Minimize2 className="w-3 h-3" /> Exit Fullscreen
            </button>
          </div>
        </div>
        
        {/* Screen Area */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div id="simulator-outer-wrapper" className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 md:p-6 transition-colors duration-300">
      {/* Container header / Control desk */}
      <div className="w-full max-w-[430px] mb-3 flex items-center justify-between text-slate-400 px-2 select-none">
        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-slate-200 tracking-wide">GameVault Mini</h1>
          <p className="text-[10px] text-slate-500 font-mono">PRO-SPEC ANDROID CONSOLE</p>
        </div>
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 transition-all cursor-pointer shadow-md"
        >
          <Maximize2 className="w-3.5 h-3.5" /> Play Full Screen
        </button>
      </div>

      {/* Realistic Mobile Device Shell */}
      <div
        id="android-device-shell"
        className="relative w-full max-w-[420px] aspect-[9/19.5] bg-slate-950 rounded-[50px] p-3.5 shadow-[0_0_50px_rgba(0,0,0,0.8),_inset_0_4px_10px_rgba(255,255,255,0.15)] border-4 border-slate-800 flex flex-col overflow-hidden"
      >
        {/* Screen Bezel Glass Reflect Overlay */}
        <div className="absolute inset-0 rounded-[36px] border border-slate-800 pointer-events-none z-40 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]"></div>

        {/* Top Ear Speaker & Camera Punch-hole Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-950 rounded-b-2xl flex items-center justify-center gap-2 z-50 shadow-inner">
          <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-indigo-900"></div>
          </div>
        </div>

        {/* Inner Screen Area */}
        <div className="flex-1 w-full h-full bg-slate-950 rounded-[32px] overflow-hidden flex flex-col relative z-30 select-none">
          
          {/* Simulated Android Status Bar */}
          <div className="h-7 pt-1 px-6 bg-transparent flex items-center justify-between text-[11px] font-semibold text-slate-100 select-none z-50">
            <span className="font-mono">{currentTime.split(' ')[0]}</span>
            <div className="flex items-center gap-1.5 font-mono">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" title="Offline Mode enabled" />
              <Signal className="w-3.5 h-3.5 text-slate-300" />
              <div className="flex items-center gap-0.5">
                <span className="text-[9px] text-slate-300">{batteryLevel}%</span>
                <div className="relative">
                  <Battery className="w-4 h-4 text-emerald-400" />
                  <div className="absolute top-[3px] left-[2px] h-[7px] rounded-sm bg-emerald-400" style={{ width: `${(batteryLevel / 100) * 10}px` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Actual Client Application Content */}
          <div className="flex-1 overflow-hidden relative bg-slate-900 text-slate-100 flex flex-col">
            {children}
          </div>

          {/* Simulated Android Bottom Softkeys / Gestures Panel */}
          <div className="h-10 bg-slate-950 flex items-center justify-around text-slate-500 border-t border-slate-900/60 z-50 px-8 select-none">
            <button
              onClick={onBackPress}
              className="p-2 hover:text-slate-200 active:scale-95 transition-all cursor-pointer"
              title="Android Back Button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onHomePress}
              className="p-2 hover:text-slate-200 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Android Home Button"
            >
              <Circle className="w-4.5 h-4.5" />
            </button>
            <button
              className="p-2 hover:text-slate-200 active:scale-95 transition-all cursor-pointer"
              title="Android Recent Apps"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer hint */}
      <p className="mt-3 text-xs text-slate-500 font-mono text-center">
        Tested: 60 FPS • SQLite Cache Sync • Offline Enabled
      </p>
    </div>
  );
}
