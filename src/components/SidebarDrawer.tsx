import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sliders, LayoutGrid, Settings as SettingsIcon, Clock } from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: 'main' | 'settings') => void;
  fadeTime: number;
  onFadeTimeChange: (time: number) => void;
  loadedFilesCount: number;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  fadeTime,
  onFadeTimeChange,
  loadedFilesCount,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex">
          {/* Backdrop blur & black mask */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer main box */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-72 md:w-80 bg-slate-900 border-r border-slate-800 h-full p-4 flex flex-col gap-6 shadow-[5px_0_30px_rgba(0,0,0,0.5)] z-10"
          >
            {/* Header branding & dismiss close btn */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex flex-col">
                <h2 className="text-lg font-display font-bold text-white tracking-wider">
                  ガイド音源
                </h2>
                <span className="text-[10px] font-mono text-slate-500 font-medium">
                  Professional Sound Sampler
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
                title="メニューを閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation links list */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  onSelectTab('main');
                  onClose();
                }}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-left transition-all ${
                  activeTab === 'main'
                    ? 'bg-emerald-600/90 text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-950/40 text-slate-300 hover:bg-slate-850 hover:text-white border border-slate-800'
                }`}
              >
                <LayoutGrid className="h-4 w-4 shrink-0" />
                <span>メイン画面</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('settings');
                  onClose();
                }}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-left transition-all ${
                  activeTab === 'settings'
                    ? 'bg-emerald-600/90 text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-950/40 text-slate-300 hover:bg-slate-850 hover:text-white border border-slate-800'
                }`}
              >
                <SettingsIcon className="h-4 w-4 shrink-0" />
                <span>各システム設定</span>
              </button>
            </div>

            <div className="w-full h-px bg-slate-800" />

            {/* Custom Crossfade/Fade parameters slider */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono tracking-wider">
                <Clock className="h-4 w-4" />
                <span>音楽のフェード時間設定</span>
              </div>
              <div className="bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={fadeTime}
                    onChange={(e) => onFadeTimeChange(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="font-mono text-sm text-amber-400 font-bold w-12 text-right">
                    {fadeTime.toFixed(1)}s
                  </span>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 leading-normal">
                  MUSICパッドのフェードON時、およびクロスフェード切替時のイン／アウト移行時間です。
                </div>
              </div>
            </div>

            {/* System Status Panel from custom footer specs */}
            <div className="mt-auto flex flex-col gap-2.5 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl font-mono text-[11px] select-none">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-300 font-bold tracking-wider">SYSTEM READY</span>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-1 py-0.5 rounded leading-none">PWA APP</span>
              </div>
              <div className="flex flex-col gap-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>AUDIO ENGINE:</span>
                  <span className="text-emerald-400 font-bold">WEB AUDIO API</span>
                </div>
                <div className="flex justify-between">
                  <span>BUFFER STATUS:</span>
                  <span className="text-emerald-400 font-bold">OK (512)</span>
                </div>
                <div className="flex justify-between">
                  <span>SAMPLES LOADED:</span>
                  <span className="text-blue-400 font-bold">{loadedFilesCount} FILES</span>
                </div>
              </div>
            </div>

            {/* Footer and version tracker */}
            <div className="pt-2 text-center border-t border-slate-850">
              <span className="text-[10px] font-mono text-slate-500">
                GUIDE PLUS v1.4 • PWA ENHANCED
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
