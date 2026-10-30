import React, { ChangeEvent } from 'react';
import { FolderOpen, Settings, Volume2, Sparkles, Music, HelpCircle, RefreshCw } from 'lucide-react';
import { Pad } from '../types';

interface SettingsTabProps {
  pads: Pad[];
  availableFiles: File[];
  onDirectorySelect: (e?: ChangeEvent<HTMLInputElement>) => void;
  onUpdatePad: (id: number, key: keyof Pad, value: any) => void;
  isLoading: boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  pads,
  availableFiles,
  onDirectorySelect,
  onUpdatePad,
  isLoading,
}) => {
  const musicPads = pads.filter(p => p.type === 'music');
  const sePads = pads.filter(p => p.type === 'se');

  const rendersPadRow = (pad: Pad) => {
    const isMusic = pad.type === 'music';
    const numStyle = isMusic
      ? 'bg-blue-950/40 border-blue-900/60 text-blue-400'
      : 'bg-amber-950/40 border-amber-900/60 text-amber-400';

    return (
      <div
        key={pad.id}
        className="flex flex-col md:flex-row gap-3 md:gap-4 items-center bg-slate-900/40 border border-slate-800/80 p-3.5 md:p-4 rounded-xl transition hover:bg-slate-900/60"
      >
        {/* Pad design indicator */}
        <div className={`w-full md:w-20 px-3 py-2 text-center font-display font-black text-sm rounded-lg border tracking-wider shrink-0 ${numStyle}`}>
          {isMusic ? 'MUSIC' : 'SE'}-{pad.id % 8 + 1}
        </div>

        {/* Input labels & dropdown maps */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {/* Custom print name */}
          <div className="flex flex-col gap-1 w-full">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wide">表示名</span>
            <input
              type="text"
              value={pad.label}
              onChange={(e) => onUpdatePad(pad.id, 'label', e.target.value)}
              placeholder={`パッド ${pad.id % 8 + 1} の表記`}
              className="bg-slate-950/60 text-slate-100 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm w-full outline-none transition"
            />
          </div>

          {/* Sound source selector */}
          <div className="flex flex-col gap-1 w-full">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wide">音源ファイル</span>
            <select
              value={pad.fileName}
              onChange={(e) => onUpdatePad(pad.id, 'fileName', e.target.value)}
              className="bg-slate-950/60 text-slate-200 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm w-full outline-none transition"
            >
              <option value="">-- 未割り当て (音源なし) --</option>
              {availableFiles.map((file, idx) => (
                <option key={idx} value={file.name}>
                  {file.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customizable individual master level booster config */}
        <div className="w-full md:w-56 shrink-0 bg-slate-950/55 p-2.5 rounded-lg border border-slate-850">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold tracking-wider">
              <span className="flex items-center gap-1">
                <Volume2 className="h-3 w-3" /> PAD LEVEL
              </span>
              <span className="text-emerald-400 font-display text-xs">
                {Math.round(pad.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={pad.volume}
              onChange={(e) => onUpdatePad(pad.id, 'volume', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-850 rounded accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full select-none pb-24">
      {/* Title Header info */}
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-2xl font-display font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-emerald-500" />
          <span>システム設定・パッド調整</span>
        </h2>
        <p className="text-xs text-slate-400">
          フォルダ選択でお持ちのローカル音源（MP3, WAVなど）をロードし、各パッドに自由にアサインできます。
        </p>
      </div>

      {/* Directory Folder Load Dashboard Block */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 mb-8 shadow-xl">
        <div className="flex items-center gap-2 mb-3.5">
          <FolderOpen className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-200">
            音源フォルダ一括読み込み / ファイル追加
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Fallback to multi-file inputs if Directory Selection API is unsupported (e.g. mobile Safari / Chrome) */}
          {(window as any).showDirectoryPicker ? (
            <button
              onClick={() => onDirectorySelect()}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-bold rounded-xl transition shadow-lg shadow-emerald-950/20 active:scale-[0.98] outline-none"
            >
              PCフォルダから一括ロード (推奨)
            </button>
          ) : (
            <label className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-bold rounded-xl transition cursor-pointer text-center shadow-lg shadow-emerald-950/20 active:scale-[0.98]">
              音声ファイルを選択 (スマホ向け)
              <input
                type="file"
                multiple
                accept="audio/*"
                className="hidden"
                onChange={onDirectorySelect}
              />
            </label>
          )}

          <div className="flex-1 bg-slate-950/50 rounded-xl p-3 border border-slate-850 flex items-center justify-between min-w-0">
            <span className="text-xs text-slate-400 truncate">
              {isLoading ? (
                <span className="flex items-center gap-1.5 text-amber-500">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> デコード & メモリ展開中...
                </span>
              ) : availableFiles.length > 0 ? (
                `${availableFiles.length}個 の音源ファイルをロード中`
              ) : (
                'ロード済みの音源ファイルはありません'
              )}
            </span>
            {availableFiles.length > 0 && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg shrink-0">
                BUFF_LOADED
              </span>
            )}
          </div>
        </div>

        {/* Browser sandbox notification */}
        <div className="mt-3.5 text-[10px] text-slate-500 flex gap-1.5 items-start">
          <HelpCircle className="h-3.5 w-3.5 shrink-0 text-slate-500 mt-0.5" />
          <span>
            読み込まれたコンテンツはすべてブラウザ上のメモリ内に安全に展開され、外部サーバーにアップロードされることはありません。再度アプリを開く際、ブラウザの権限確認に同意することで自動保存されたフォルダーからファイルを再構築することが可能です。
          </span>
        </div>
      </div>

      {/* Individual configurations partitioned */}
      <div className="space-y-6">
        {/* MUSIC section presets links */}
        <div>
          <h3 className="text-sm font-bold text-blue-400 tracking-wider flex items-center gap-1.5 mb-3 uppercase">
            <Music className="h-4 w-4" /> MUSIC部 パッド設定 (1〜8)
          </h3>
          <div className="space-y-3">
            {musicPads.map(rendersPadRow)}
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-sm font-bold text-orange-400 tracking-wider flex items-center gap-1.5 mb-3 uppercase">
            <Sparkles className="h-4 w-4" /> SOUND EFFECTS部 パッド設定 (1〜8)
          </h3>
          <div className="space-y-3">
            {sePads.map(rendersPadRow)}
          </div>
        </div>

        {/* PWA & Smartphone Tips & Troubleshooting Card */}
        <div className="pt-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-emerald-400 tracking-wider flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4" /> スマートフォンでのPWAインストールについて
            </h3>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>【Chrome (Android) で「既にインストールされています」と表示される場合】</strong><br />
                以前の古い設定や別のアプリ情報が端末内に残っていることが原因です。<br />
                1. スマホの「設定」アプリ ＞「アプリ」一覧を開き、古い「ガイドぷらす」や「ガイド音源」アプリがある場合は<strong>アンインストール（削除）</strong>してください。<br />
                2. Chromeの右上のメニュー（︙）＞「設定」＞「サイトの設定」＞「すべてのサイト」から <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-300">yooooohey.github.io</code> を探して<strong>「データを消去してリセット」</strong>を実行してください。<br />
                3. 再度本ページを開き直すと、正常に「アプリをインストール」できるようになります。
              </p>
              <p>
                <strong>【iPhone / iPad (Safari) の場合】</strong><br />
                Safari下部の共有ボタン（四角から上矢印）をタップし、メニューから「ホーム画面に追加」を選択してください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
