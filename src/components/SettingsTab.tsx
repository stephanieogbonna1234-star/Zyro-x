import React from 'react';
import { AppSettings } from '../types';
import { Volume2, Languages, ShieldAlert, Sliders, Play, Trash2, HelpCircle } from 'lucide-react';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (next: Partial<AppSettings>) => void;
  onResetStats: () => void;
  onResetAchievements: () => void;
  onClearSaves: () => void;
}

export default function SettingsTab({
  settings,
  onUpdateSettings,
  onResetStats,
  onResetAchievements,
  onClearSaves
}: SettingsTabProps) {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-4 overflow-y-auto space-y-5 font-sans select-none pb-8">
      
      {/* Title */}
      <div className="flex flex-col gap-1 border-b border-slate-900 pb-2.5">
        <h2 className="text-base font-black text-slate-100 tracking-wide">Offline Settings</h2>
        <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">CLIENT CONFIGURATION</p>
      </div>

      {/* Audio volume settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 border-b border-slate-950 pb-2">
          <Volume2 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
            AUDIO CHANNELS
          </h3>
        </div>

        {/* Music Volume slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Background Music Volume</span>
            <span className="text-indigo-400">{settings.musicVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.musicVolume}
            onChange={(e) => onUpdateSettings({ musicVolume: parseInt(e.target.value) })}
            className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
        </div>

        {/* Sound Effects volume slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Sound Effects Volume</span>
            <span className="text-indigo-400">{settings.soundVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.soundVolume}
            onChange={(e) => onUpdateSettings({ soundVolume: parseInt(e.target.value) })}
            className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
        </div>
      </div>

      {/* Preferences / Toggles panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 border-b border-slate-950 pb-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
            PREFERENCES
          </h3>
        </div>

        {/* Vibration haptic toggle */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-200">Haptic Vibrations</span>
            <span className="text-[10px] text-slate-500">Enable tap vibration feedback</span>
          </div>
          <button
            onClick={() => onUpdateSettings({ vibration: !settings.vibration })}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              settings.vibration ? 'bg-indigo-600' : 'bg-slate-950 border border-slate-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
              settings.vibration ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Animations toggle */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-200">Fluid Animations</span>
            <span className="text-[10px] text-slate-500">Enable card and screen transitions</span>
          </div>
          <button
            onClick={() => onUpdateSettings({ animations: !settings.animations })}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              settings.animations ? 'bg-indigo-600' : 'bg-slate-950 border border-slate-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
              settings.animations ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Accessibility Large Text */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-200">Large Text Size</span>
            <span className="text-[10px] text-slate-500">Enhance font sizes on labels</span>
          </div>
          <button
            onClick={() => onUpdateSettings({ largeText: !settings.largeText })}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              settings.largeText ? 'bg-indigo-600' : 'bg-slate-950 border border-slate-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
              settings.largeText ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 border-b border-slate-950 pb-2">
          <Languages className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
            LOCAL LANGUAGE
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {([
            { id: 'en', label: 'English (US)' },
            { id: 'es', label: 'Español' },
            { id: 'fr', label: 'Français' },
            { id: 'de', label: 'Deutsch' },
            { id: 'ja', label: '日本語' }
          ] as const).map((lang) => (
            <button
              key={lang.id}
              onClick={() => onUpdateSettings({ language: lang.id })}
              className={`px-3 py-2 text-[10px] font-bold rounded-xl transition-all border cursor-pointer ${
                settings.language === lang.id
                  ? 'bg-slate-950 text-indigo-400 border-indigo-500/30'
                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Safe Storage Reset Actions */}
      <div className="bg-slate-900 border border-rose-950/20 rounded-3xl p-4 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 border-b border-slate-950 pb-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
            DANGER SYSTEM ZONE
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          {/* Reset stats button */}
          <button
            onClick={onResetStats}
            className="w-full py-2.5 rounded-xl border border-rose-900/30 bg-slate-950 text-rose-400 hover:text-rose-300 text-xs font-bold font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Reset Play Statistics
          </button>

          {/* Reset achievements */}
          <button
            onClick={onResetAchievements}
            className="w-full py-2.5 rounded-xl border border-rose-900/30 bg-slate-950 text-rose-400 hover:text-rose-300 text-xs font-bold font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Reset Accomplished Badges
          </button>

          {/* Wipe local database */}
          <button
            onClick={onClearSaves}
            className="w-full py-2.5 rounded-xl border border-rose-600/40 bg-rose-950/50 hover:bg-rose-950/80 text-white text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Trash2 className="w-4 h-4" /> WIPE ALL OFFLINE CACHES
          </button>
        </div>
      </div>
    </div>
  );
}
