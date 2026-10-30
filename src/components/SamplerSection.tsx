import React from 'react';
import { Volume2, RefreshCw, Shuffle, Sliders, Music, Sparkles } from 'lucide-react';
import { Pad, PlayingStatus } from '../types';
import { PadButton } from './PadButton';

interface SamplerSectionProps {
  pads: Pad[];
  playingStatus: PlayingStatus[];
  musicVolume: number;
  onMusicVolumeChange: (vol: number) => void;
  soundVolume: number;
  onSoundVolumeChange: (vol: number) => void;
  isCrossfade: boolean;
  onToggleCrossfade: () => void;
  onPlay: (id: number) => void;
  onPause: (id: number) => void;
  onStop: (id: number) => void;
  onToggleLoop: (id: number) => void;
  onToggleFade: (id: number) => void;
}

export const SamplerSection: React.FC<SamplerSectionProps> = ({
  pads,
  playingStatus,
  musicVolume,
  onMusicVolumeChange,
  soundVolume,
  onSoundVolumeChange,
  isCrossfade,
  onToggleCrossfade,
  onPlay,
  onPause,
  onStop,
  onToggleLoop,
  onToggleFade,
}) => {
  const musicPads = pads.filter((p) => p.type === 'music');
  const sePads = pads.filter((p) => p.type === 'se');

  return (
    <div className="flex-1 flex flex-col landscape:flex-row lg:flex-row p-1.5 md:p-3 gap-2 md:gap-3.5 min-h-0 overflow-y-auto landscape:overflow-hidden lg:overflow-hidden">
      
      {/* MUSIC SECTION */}
      <div className="flex-1 flex flex-col bg-slate-900/30 border border-slate-800/80 rounded-xl landscape:rounded-2xl lg:rounded-2xl p-2 landscape:p-2.5 md:p-4 min-h-0 landscape:h-full lg:h-full">
        {/* Section Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-800/40 mb-2 md:mb-3.5 shrink-0 gap-1.5">
          <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
            <div className="p-1 px-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/15">
              <Music className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <h2 className="font-display font-bold text-xs md:text-base text-blue-400 tracking-wider">
              MUSIC
            </h2>
            <div className="flex items-center gap-1 bg-slate-950/70 p-1 px-1.5 rounded-lg border border-slate-800 shrink-0">
              <Volume2 className="h-3 w-3 text-blue-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={musicVolume}
                onChange={(e) => onMusicVolumeChange(parseFloat(e.target.value))}
                className="w-12 sm:w-20 md:w-24 h-1 appearance-none cursor-pointer accent-blue-400 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={onToggleCrossfade}
            className={`flex items-center gap-1.5 px-1.5 py-1 md:py-1.5 rounded-lg border text-[9px] md:text-xs font-bold transition-all active:scale-95 shrink-0 ${
              isCrossfade
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                : 'bg-slate-950/50 text-slate-500 border-slate-800'
            }`}
            title={`クロスフェード: ${isCrossfade ? 'ON (自動フェード切替)' : 'OFF (即時切替)'}`}
          >
            <Shuffle className="h-3 w-3" />
            <span>CROSSFADE {isCrossfade ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Music Pads Grid */}
        <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-1 md:gap-3 min-h-[160px] landscape:min-h-0 lg:min-h-0">
          {musicPads.map((pad) => (
            <PadButton
              key={pad.id}
              pad={pad}
              status={playingStatus[pad.id]}
              onPlay={onPlay}
              onPause={onPause}
              onStop={onStop}
              onToggleLoop={onToggleLoop}
              onToggleFade={onToggleFade}
            />
          ))}
        </div>
      </div>

      {/* SOUND EFFECTS (SE) SECTION */}
      <div className="flex-1 flex flex-col bg-slate-900/30 border border-slate-800/80 rounded-xl landscape:rounded-2xl lg:rounded-2xl p-2 landscape:p-2.5 md:p-4 min-h-0 landscape:h-full lg:h-full">
        {/* Section Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-800/40 mb-2 md:mb-3.5 shrink-0 gap-1.5">
          <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
            <div className="p-1 px-1.5 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/15">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <h2 className="font-display font-bold text-xs md:text-base text-orange-400 tracking-wider">
              SOUND EFFECTS
            </h2>
            <div className="flex items-center gap-1 bg-slate-950/70 p-1 px-1.5 rounded-lg border border-slate-800 shrink-0">
              <Volume2 className="h-3 w-3 text-orange-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={soundVolume}
                onChange={(e) => onSoundVolumeChange(parseFloat(e.target.value))}
                className="w-12 sm:w-20 md:w-24 h-1 appearance-none cursor-pointer accent-orange-400 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* SE Pads Grid */}
        <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-1 md:gap-3 min-h-[160px] landscape:min-h-0 lg:min-h-0">
          {sePads.map((pad) => (
            <PadButton
              key={pad.id}
              pad={pad}
              status={playingStatus[pad.id]}
              onPlay={onPlay}
              onPause={onPause}
              onStop={onStop}
              onToggleLoop={onToggleLoop}
              onToggleFade={onToggleFade}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
