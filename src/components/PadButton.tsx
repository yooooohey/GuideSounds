import React, { MouseEvent } from 'react';
import { Play, Pause, Square, RotateCcw, TrendingUp } from 'lucide-react';
import { Pad, PlayingStatus } from '../types';

interface PadButtonProps {
  pad: Pad;
  status: PlayingStatus;
  onPlay: (id: number) => void;
  onPause: (id: number) => void;
  onStop: (id: number) => void;
  onToggleLoop: (id: number) => void;
  onToggleFade: (id: number) => void;
}

export const PadButton: React.FC<PadButtonProps> = ({
  pad,
  status,
  onPlay,
  onPause,
  onStop,
  onToggleLoop,
  onToggleFade,
}) => {
  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';
  const isAssigned = !!pad.fileName;

  // Active pad styling
  const borderAndGlow = isPlaying
    ? pad.type === 'music'
      ? 'border-blue-400 bg-blue-950/90 shadow-[0_0_15px_rgba(96,165,250,0.4)] md:shadow-[0_0_25px_rgba(96,165,250,0.5)]'
      : 'border-amber-400 bg-amber-950/90 shadow-[0_0_15px_rgba(245,158,11,0.4)] md:shadow-[0_0_25px_rgba(245,158,11,0.5)]'
    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/85';

  const trackNumColor = pad.type === 'music' ? 'text-blue-500/80' : 'text-amber-500/80';
  const activeIconColor = isPlaying
    ? pad.type === 'music'
      ? 'text-blue-400'
      : 'text-amber-400'
    : 'text-slate-400';

  const handleMainClick = () => {
    if (!isAssigned) return;
    if (isPlaying) {
      onPause(pad.id);
    } else {
      onPlay(pad.id);
    }
  };

  const stopClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (isAssigned) {
      onStop(pad.id);
    }
  };

  const loopClick = (e: MouseEvent) => {
    e.stopPropagation();
    onToggleLoop(pad.id);
  };

  const fadeClick = (e: MouseEvent) => {
    e.stopPropagation();
    onToggleFade(pad.id);
  };

  return (
    <div
      id={`pad-${pad.id}`}
      className={`relative flex flex-col justify-between rounded-xl border-2 p-2.5 landscape:p-1.5 md:p-3 transition-all duration-200 select-none aspect-square landscape:aspect-auto lg:aspect-square w-full h-full min-h-0 ${borderAndGlow} ${
        !isAssigned ? 'opacity-40 grayscale-[40%]' : 'cursor-pointer'
      }`}
      onClick={handleMainClick}
    >
      {/* Top row: Pad number, custom label, and individual Stop button */}
      <div className="flex justify-between items-start gap-1 md:gap-2 h-7 landscape:h-5 md:h-7 shrink-0">
        <div className="flex items-baseline gap-1 md:gap-1.5 min-w-0">
          <span className={`font-display text-base landscape:text-xs md:text-base font-bold leading-none ${trackNumColor}`}>
            {pad.id % 8 + 1}
          </span>
          <span className="font-sans text-xs landscape:text-[10px] md:text-sm font-semibold text-slate-100 truncate">
            {pad.label || `P${pad.id % 8 + 1}`}
          </span>
        </div>
        {isAssigned && (
          <button
            onClick={stopClick}
            className="p-1 rounded-md bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition-all active:scale-90"
            title={pad.type === 'music' && pad.useFade ? 'フェードアウト停止' : '停止'}
          >
            <Square className="h-2.5 w-2.5 md:h-3 md:w-3 fill-current" />
          </button>
        )}
      </div>

      {/* Title & File center section: Play/Pause and filename */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-0.5 md:py-1">
        <div className={`transition-transform duration-300 ${isPlaying ? 'scale-[1.05]' : 'scale-100'}`}>
          {isPlaying ? (
            <Pause className={`h-6 w-6 landscape:h-5 landscape:w-5 md:h-8 md:w-8 ${activeIconColor} fill-current`} />
          ) : (
            <Play className={`h-6 w-6 landscape:h-4 landscape:w-4 md:h-8 md:w-8 ml-0.5 text-slate-500 ${isAssigned ? 'group-hover:text-slate-300' : ''}`} />
          )}
        </div>
        <div className="w-full text-center mt-1 landscape:mt-0.5 px-0.5">
          <p className="font-mono text-[8px] md:text-[10px] text-slate-400 truncate leading-tight w-full">
            {pad.fileName || '音源未割り当て'}
          </p>
        </div>
      </div>

      {/* Bottom controls: Icons for Loop & Fade */}
      <div className="flex justify-end gap-1 h-5 md:h-6 items-center shrink-0 border-t border-slate-800/60 pt-1.5">
        {pad.type === 'music' && (
          <button
            onClick={fadeClick}
            className={`p-0.5 md:p-1 rounded transition-all active:scale-95 ${
              pad.useFade
                ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40'
                : 'bg-slate-950/30 text-slate-600 hover:text-slate-400'
            }`}
            title="ON：単独開始・終了時にフェード"
          >
            <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3" />
          </button>
        )}
        <button
          onClick={loopClick}
          className={`p-0.5 md:p-1 rounded transition-all active:scale-95 ${
            pad.loop
              ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40'
              : 'bg-slate-950/30 text-slate-600 hover:text-slate-400'
          }`}
          title="リピート・ループ再生"
        >
          <RotateCcw className={`h-2.5 w-2.5 md:h-3 md:w-3 ${pad.loop && isPlaying ? 'animate-spin-slow' : ''}`} />
        </button>
      </div>
    </div>
  );
};
