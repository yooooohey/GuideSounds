import React from 'react';
import { Menu, Volume2, Activity, Mic, MicOff, Sliders } from 'lucide-react';
import { MicSettings } from '../types';

interface HeaderProps {
  onToggleMenu: () => void;
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
  masterGain: number;
  onMasterGainChange: (gain: number) => void;
  micSettings: MicSettings;
  onToggleMic: () => void;
  onMicSettingsChange: (settings: Partial<MicSettings>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMenu,
  masterVolume,
  onMasterVolumeChange,
  masterGain,
  onMasterGainChange,
  micSettings,
  onToggleMic,
  onMicSettingsChange,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 p-1.5 md:p-3 flex items-center gap-1.5 md:gap-3 shrink-0 select-none landscape:p-1">
      {/* Menu Trigger & Brand Title */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleMenu}
          className="p-1.5 md:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700/60 transition-all active:scale-95 shrink-0 shadow-lg"
          title="メニューを開く"
        >
          <Menu className="h-4.5 w-4.5 md:h-6 md:w-6" />
        </button>
        <h1 className="font-display font-black text-xs md:text-base text-slate-100 tracking-wider hidden sm:inline whitespace-nowrap">
          ガイド音源
        </h1>
      </div>

      {/* Control sliders & Panel layout wrap */}
      <div className="flex-1 flex flex-nowrap overflow-x-auto gap-2 md:gap-3 items-center scrollbar-hide py-0.5 justify-end">
        
        {/* Master Output Block */}
        <div className="flex items-center gap-2 md:gap-4 bg-slate-950/80 px-2.5 md:px-3 py-1 md:py-1.5 rounded-xl border border-slate-800 shrink-0 shadow-inner">
          {/* Master Volume */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-500 font-mono tracking-wider leading-none uppercase">
              MASTER VOL
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Volume2 className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
                className="w-14 sm:w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span className="text-[10px] font-mono text-slate-400 font-medium w-7 text-right">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
          </div>

          <div className="w-px h-7 bg-slate-800" />

          {/* Master Gain Booster */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-500 font-mono tracking-wider leading-none uppercase">
              MASTER GAIN
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Activity className="h-3.5 w-3.5 text-amber-500" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={masterGain}
                onChange={(e) => onMasterGainChange(parseFloat(e.target.value))}
                className="w-12 sm:w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] font-mono text-slate-400 font-medium w-8 text-right">
                x{masterGain.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Microphone Settings Block */}
        <div className="flex items-center gap-1.5 md:gap-4 bg-slate-950/80 px-2 md:px-2.5 py-1 md:py-1.5 rounded-xl border border-slate-800 shrink-0 shadow-inner">
          <button
            onClick={onToggleMic}
            className={`flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs font-bold transition-all ${
              micSettings.active
                ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.4)] ring-1 ring-rose-400'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {micSettings.active ? (
              <Mic className="h-3.5 w-3.5 animate-pulse" />
            ) : (
              <MicOff className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline font-mono">{micSettings.active ? 'MIC ON' : 'MIC OFF'}</span>
          </button>

          {/* Mic Volume */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-500 font-mono tracking-wider leading-none uppercase">
              MIC VOL
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={micSettings.volume}
              onChange={(e) => onMicSettingsChange({ volume: parseFloat(e.target.value) })}
              className="w-8 sm:w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              title="マイク音量"
            />
          </div>

          {/* Reverb Size */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-500 font-mono tracking-wider leading-none uppercase">
              REVERB
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={micSettings.reverb}
              onChange={(e) => onMicSettingsChange({ reverb: parseFloat(e.target.value) })}
              className="w-8 sm:w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              title="残響・リバーブ量"
            />
          </div>

          {/* Vocal Pitch scale */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-500 font-mono tracking-wider leading-none uppercase">
              PITCH
            </span>
            <div className="flex items-center gap-1">
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={micSettings.pitch}
                onChange={(e) => onMicSettingsChange({ pitch: parseFloat(e.target.value) })}
                className="w-8 sm:w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                title="ボイスチェンジャーピッチ"
              />
              <span className="text-[8px] font-mono text-slate-500 w-5">
                x{micSettings.pitch.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
