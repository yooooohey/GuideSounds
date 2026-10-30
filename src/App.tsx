import React, { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react';
import { Header } from './components/Header';
import { SidebarDrawer } from './components/SidebarDrawer';
import { SamplerSection } from './components/SamplerSection';
import { SettingsTab } from './components/SettingsTab';
import { Pad, MicSettings, PlayingStatus, ActiveAudioNode } from './types';

const INITIAL_PADS: Pad[] = Array.from({ length: 16 }).map((_, i) => ({
  id: i,
  type: i < 8 ? 'music' : 'se',
  label: '', // custom label
  fileName: '',
  volume: 1.0,
  loop: i < 8, // loop defaults to true for music, false for SE
  useFade: i < 8, // fade defaults to true for music pads
}));

// IndexedDB Helper to persist directory selection across sessions (supports Chrome/Edge/Opera API)
const initDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open('GuidePlusDB', 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('handles')) {
        db.createObjectStore('handles');
      }
    };
    request.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    request.onerror = () => reject('DB Error');
  });

const saveDirHandle = async (handle: any) => {
  try {
    const db = await initDB();
    const tx = db.transaction('handles', 'readwrite');
    tx.objectStore('handles').put(handle, 'dirHandle');
  } catch (err) {
    console.error('IndexedDB Save Error:', err);
  }
};

const getSavedDirHandle = async (): Promise<any | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const req = db.transaction('handles').objectStore('handles').get('dirHandle');
      req.onsuccess = (e) => resolve((e.target as IDBRequest).result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
};

async function getFilesFromHandle(dirHandle: any): Promise<File[]> {
  const files: File[] = [];
  for await (const entry of (dirHandle as any).values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      const isAudio =
        file.type.startsWith('audio/') ||
        file.name.endsWith('.mp3') ||
        file.name.endsWith('.wav') ||
        file.name.endsWith('.m4a') ||
        file.name.endsWith('.ogg');
      if (isAudio) {
        files.push(file);
      }
    }
  }
  return files;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'main' | 'settings'>('main');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Persistent settings stored in LocalStorage
  const [pads, setPads] = useState<Pad[]>(() => {
    const saved = localStorage.getItem('guide-plus-pads');
    return saved ? JSON.parse(saved) : INITIAL_PADS;
  });

  const [musicVolume, setMusicVolume] = useState<number>(() => {
    const saved = localStorage.getItem('guide-plus-musicVol');
    return saved !== null ? parseFloat(saved) : 0.8;
  });

  const [soundVolume, setSoundVolume] = useState<number>(() => {
    const saved = localStorage.getItem('guide-plus-soundVol');
    return saved !== null ? parseFloat(saved) : 0.8;
  });

  const [masterVolume, setMasterVolume] = useState<number>(() => {
    const saved = localStorage.getItem('guide-plus-masterVol');
    return saved !== null ? parseFloat(saved) : 1.0;
  });

  const [masterGain, setMasterGain] = useState<number>(() => {
    const saved = localStorage.getItem('guide-plus-masterGain');
    return saved !== null ? parseFloat(saved) : 1.0;
  });

  const [globalFadeTime, setGlobalFadeTime] = useState<number>(() => {
    const saved = localStorage.getItem('guide-plus-fadeTime');
    return saved !== null ? parseFloat(saved) : 3.0; // default to 3s
  });

  const [isCrossfade, setIsCrossfade] = useState<boolean>(() => {
    const saved = localStorage.getItem('guide-plus-isCrossfade');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [micSettings, setMicSettings] = useState<MicSettings>(() => {
    const saved = localStorage.getItem('guide-plus-micSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, active: false }; // mic always starts OFF for security
    }
    return { active: false, volume: 0.8, reverb: 0.2, pitch: 1.0 };
  });

  // Track operational states and references
  const [availableFiles, setAvailableFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playingStatus, setPlayingStatus] = useState<PlayingStatus[]>(() =>
    Array(16).fill('stopped')
  );

  // Web Audio Context & Node Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainMixRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const masterVolumeRef = useRef<GainNode | null>(null);

  const musicMasterRef = useRef<GainNode | null>(null);
  const soundMasterRef = useRef<GainNode | null>(null);
  const micMasterRef = useRef<GainNode | null>(null);

  // Web Audio storage map
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const activeNodesRef = useRef<Map<number, ActiveAudioNode>>(new Map());

  // Microphone resources
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const reverbBufferRef = useRef<AudioBuffer | null>(null);
  const micConvolverRef = useRef<ConvolverNode | null>(null);
  const micPitchFilterRef = useRef<BiquadFilterNode | null>(null);
  const micDryGainRef = useRef<GainNode | null>(null);
  const micWetGainRef = useRef<GainNode | null>(null);
  const micVolumeGainRef = useRef<GainNode | null>(null);

  // Auto preserve settings across turns
  useEffect(() => {
    localStorage.setItem('guide-plus-pads', JSON.stringify(pads));
  }, [pads]);
  useEffect(() => {
    localStorage.setItem('guide-plus-musicVol', musicVolume.toString());
  }, [musicVolume]);
  useEffect(() => {
    localStorage.setItem('guide-plus-soundVol', soundVolume.toString());
  }, [soundVolume]);
  useEffect(() => {
    localStorage.setItem('guide-plus-masterVol', masterVolume.toString());
  }, [masterVolume]);
  useEffect(() => {
    localStorage.setItem('guide-plus-masterGain', masterGain.toString());
  }, [masterGain]);
  useEffect(() => {
    localStorage.setItem('guide-plus-fadeTime', globalFadeTime.toString());
  }, [globalFadeTime]);
  useEffect(() => {
    localStorage.setItem('guide-plus-isCrossfade', JSON.stringify(isCrossfade));
  }, [isCrossfade]);
  useEffect(() => {
    localStorage.setItem('guide-plus-micSettings', JSON.stringify(micSettings));
  }, [micSettings]);

  // Audio Context initialization on gestured interaction
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Routing Layout:
    // Section masters (musicMaster, soundMaster, micMaster) -> mainMix -> masterGain -> masterVolume -> speakers
    mainMixRef.current = ctx.createGain();
    masterGainRef.current = ctx.createGain();
    masterGainRef.current.gain.value = masterGain;

    masterVolumeRef.current = ctx.createGain();
    masterVolumeRef.current.gain.value = masterVolume;

    mainMixRef.current.connect(masterGainRef.current);
    masterGainRef.current.connect(masterVolumeRef.current);
    masterVolumeRef.current.connect(ctx.destination);

    // Section volumes routing
    musicMasterRef.current = ctx.createGain();
    musicMasterRef.current.gain.value = musicVolume;
    musicMasterRef.current.connect(mainMixRef.current);

    soundMasterRef.current = ctx.createGain();
    soundMasterRef.current.gain.value = soundVolume;
    soundMasterRef.current.connect(mainMixRef.current);

    micMasterRef.current = ctx.createGain();
    micMasterRef.current.gain.value = 1.0;
    micMasterRef.current.connect(mainMixRef.current);

    // Generate Synthetic Reverb Impulse response
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * 2.0; // 2 seconds decay
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const leftChan = impulse.getChannelData(0);
    const rightChan = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (sampleRate * 0.45));
      leftChan[i] = (Math.random() * 2 - 1) * decay;
      rightChan[i] = (Math.random() * 2 - 1) * decay;
    }
    reverbBufferRef.current = impulse;
  }, [masterGain, masterVolume, musicVolume, soundVolume]);

  // Sync real-time volume slider updates directly into existing Audio Graph node parameters
  useEffect(() => {
    if (musicMasterRef.current) {
      musicMasterRef.current.gain.setValueAtTime(musicVolume, audioCtxRef.current?.currentTime || 0);
    }
  }, [musicVolume]);

  useEffect(() => {
    if (soundMasterRef.current) {
      soundMasterRef.current.gain.setValueAtTime(soundVolume, audioCtxRef.current?.currentTime || 0);
    }
  }, [soundVolume]);

  useEffect(() => {
    if (masterVolumeRef.current) {
      masterVolumeRef.current.gain.setValueAtTime(masterVolume, audioCtxRef.current?.currentTime || 0);
    }
  }, [masterVolume]);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(masterGain, audioCtxRef.current?.currentTime || 0);
    }
  }, [masterGain]);

  // Sync microphone effects real-time configurations
  useEffect(() => {
    const now = audioCtxRef.current?.currentTime || 0;
    if (micVolumeGainRef.current) {
      micVolumeGainRef.current.gain.setValueAtTime(micSettings.volume, now);
    }
    if (micDryGainRef.current) {
      micDryGainRef.current.gain.setValueAtTime(1 - micSettings.reverb, now);
    }
    if (micWetGainRef.current) {
      micWetGainRef.current.gain.setValueAtTime(micSettings.reverb, now);
    }
    if (micPitchFilterRef.current) {
      const pitchRatio = micSettings.pitch;
      if (pitchRatio === 1.0) {
        micPitchFilterRef.current.gain.setValueAtTime(0, now);
      } else if (pitchRatio > 1.0) {
        // High resonance vocal peak simulation
        micPitchFilterRef.current.frequency.setValueAtTime(1800 * pitchRatio, now);
        micPitchFilterRef.current.gain.setValueAtTime(12 * (pitchRatio - 1), now);
      } else {
        // Deep voice resonator
        micPitchFilterRef.current.frequency.setValueAtTime(350 / pitchRatio, now);
        micPitchFilterRef.current.gain.setValueAtTime(16 * (1 - pitchRatio), now);
      }
    }
  }, [micSettings]);

  // Loader decoding files array into buffers
  const decodeAndIndexFiles = async (filesToLoad: File[]) => {
    if (!audioCtxRef.current) return;
    setIsLoading(true);

    for (const file of filesToLoad) {
      if (!audioBuffersRef.current.has(file.name)) {
        try {
          const bufferData = await file.arrayBuffer();
          // Clean decode supporting older browser targets safely
          const audioBuffer = await audioCtxRef.current.decodeAudioData(bufferData);
          audioBuffersRef.current.set(file.name, audioBuffer);
        } catch (err) {
          console.error(`Failed to decode file "${file.name}":`, err);
        }
      }
    }
    setIsLoading(false);
  };

  // Restore directory handles from IndexedDB on initial mount
  useEffect(() => {
    const restoreSavedHandle = async () => {
      const canPickDir = !!(window as any).showDirectoryPicker;
      if (!canPickDir) return;

      try {
        const handle = await getSavedDirHandle();
        if (handle) {
          const shouldLoad = window.confirm(
            '前回のフォルダー構成が保存されています。音源ファイル（一括読み込み）を復元しますか？'
          );
          if (shouldLoad) {
            const hasPermission = await (handle as any).requestPermission({ mode: 'read' });
            if (hasPermission === 'granted') {
              setIsLoading(true);
              const filesInDir = await getFilesFromHandle(handle);
              setAvailableFiles(filesInDir);

              // Setup default audio context silently to unlock decoding triggers
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioContextClass();
              }

              await decodeAndIndexFiles(filesInDir);
            }
          }
        }
      } catch (err) {
        console.error('Failed to auto-restore folder handles:', err);
      }
    };
    restoreSavedHandle();
  }, []);

  // Directory handling triggers
  const handleDirectorySelect = async (e?: ChangeEvent<HTMLInputElement>) => {
    initAudio();
    let selectedFiles: File[] = [];

    if (e && e.target && e.target.files) {
      // User picked a bundle of files on mobile/smartphones
      selectedFiles = (Array.from(e.target.files) as File[]).filter(
        (f) =>
          f.type.startsWith('audio/') ||
          f.name.endsWith('.mp3') ||
          f.name.endsWith('.wav') ||
          f.name.endsWith('.m4a') ||
          f.name.endsWith('.ogg')
      );
    } else if ((window as any).showDirectoryPicker) {
      // User opened native Folder Picker on PC Chrome/Edge
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        await saveDirHandle(dirHandle);
        selectedFiles = await getFilesFromHandle(dirHandle);
      } catch (err) {
        console.warn('Folder selection aborted or failed:', err);
        return;
      }
    }

    if (selectedFiles.length === 0) return;

    // Deduplicate lists
    setAvailableFiles((prev) => {
      const merged = [...prev, ...selectedFiles];
      const uniqueMap = new Map<string, File>();
      merged.forEach((item) => uniqueMap.set(item.name, item));
      return Array.from(uniqueMap.values());
    });

    await decodeAndIndexFiles(selectedFiles);
  };

  // Toggle mic access and build live micro audio nodes
  const toggleMic = async () => {
    initAudio();
    if (micSettings.active) {
      // Stop media stream tracks cleanly
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      if (micSourceRef.current) {
        micSourceRef.current.disconnect();
        micSourceRef.current = null;
      }
      setMicSettings((p) => ({ ...p, active: false }));
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;

        const ctx = audioCtxRef.current!;
        micSourceRef.current = ctx.createMediaStreamSource(stream);

        // Build mic chain if it doesn't already exist
        if (!micConvolverRef.current) {
          micPitchFilterRef.current = ctx.createBiquadFilter();
          micPitchFilterRef.current.type = 'peaking';
          micPitchFilterRef.current.Q.setValueAtTime(3.2, ctx.currentTime);

          micConvolverRef.current = ctx.createConvolver();
          micConvolverRef.current.buffer = reverbBufferRef.current;

          micDryGainRef.current = ctx.createGain();
          micWetGainRef.current = ctx.createGain();
          micVolumeGainRef.current = ctx.createGain();
        }

        // Connect chain nodes:
        // micSource -> micPitchFilter -> splits into:
        //   1) micDryGain
        //   2) micConvolver (synthetic impulse) -> micWetGain
        // Both DRY & WET -> micVolumeGain -> micMaster
        micSourceRef.current.connect(micPitchFilterRef.current);

        micPitchFilterRef.current.connect(micDryGainRef.current);
        micPitchFilterRef.current.connect(micConvolverRef.current);
        micConvolverRef.current.connect(micWetGainRef.current);

        micDryGainRef.current.connect(micVolumeGainRef.current);
        micWetGainRef.current.connect(micVolumeGainRef.current);

        micVolumeGainRef.current.connect(micMasterRef.current!);

        // Sync parameters upon startup
        const now = ctx.currentTime;
        micVolumeGainRef.current.gain.setValueAtTime(micSettings.volume, now);
        micDryGainRef.current.gain.setValueAtTime(1 - micSettings.reverb, now);
        micWetGainRef.current.gain.setValueAtTime(micSettings.reverb, now);

        setMicSettings((p) => ({ ...p, active: true }));
      } catch (err) {
        alert(
          'マイク入力へのアクセスが拒否されたか、デバイスが見つかりません。権限設定を確認してください。'
        );
        console.error('Microphone Stream Access Error:', err);
      }
    }
  };

  // Main Pad Play trigger logic
  const playPad = (padId: number) => {
    initAudio();
    const pad = pads[padId];
    if (!pad.fileName) return;

    const buffer = audioBuffersRef.current.get(pad.fileName);
    if (!buffer) {
      alert(`音源ファイル "${pad.fileName}" のバッファ展開が完了していないか、読み込めません。設定タブを確認してください。`);
      return;
    }

    const ctx = audioCtxRef.current!;
    const now = ctx.currentTime;
    const existingNode = activeNodesRef.current.get(padId);

    // Retrieve active cursor offsets if it was paused
    let offset = 0;
    if (existingNode && playingStatus[padId] === 'paused') {
      offset = existingNode.pausedAt || 0;
    }

    // Stop cleanly if it is already playing
    if (existingNode && playingStatus[padId] === 'playing') {
      existingNode.source.onended = null;
      existingNode.source.stop(now);
      offset = 0;
    }

    const isMusic = pad.type === 'music';
    let isSwitching = false;
    const toStop: { id: number; node: ActiveAudioNode }[] = [];

    // MUSIC Section Exclusive play logic (Only one track at a time)
    if (isMusic) {
      pads
        .filter((p) => p.type === 'music' && p.id !== padId)
        .forEach((p) => {
          const otherNode = activeNodesRef.current.get(p.id);
          if (
            otherNode &&
            (playingStatus[p.id] === 'playing' || playingStatus[p.id] === 'paused')
          ) {
            isSwitching = true;
            toStop.push({ id: p.id, node: otherNode });
          }
        });
    }

    // Stop other competing active MUSIC pads with matching crossfade fadeouts
    toStop.forEach(({ id, node }) => {
      node.source.onended = null;
      if (isCrossfade && globalFadeTime > 0) {
        node.fadeGain.gain.cancelScheduledValues(now);
        node.fadeGain.gain.setValueAtTime(node.fadeGain.gain.value, now);
        node.fadeGain.gain.linearRampToValueAtTime(0, now + globalFadeTime);
        node.source.stop(now + globalFadeTime);
        setTimeout(() => {
          activeNodesRef.current.delete(id);
        }, globalFadeTime * 1000);
      } else {
        node.source.stop(now);
        activeNodesRef.current.delete(id);
      }
    });

    // Create and configure new routing Nodes
    const sourceNode = ctx.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.loop = pad.loop;

    const volumeGain = ctx.createGain();
    volumeGain.gain.value = pad.volume;

    const fadeGain = ctx.createGain();

    // Source -> Vol -> Fade -> SECTION MASTER
    sourceNode.connect(volumeGain);
    volumeGain.connect(fadeGain);

    const targetMaster = isMusic ? musicMasterRef.current! : soundMasterRef.current!;
    fadeGain.connect(targetMaster);

    // Apply linear fade transition if applicable
    let shouldFadeIn = false;
    if (isMusic) {
      if (isSwitching) {
        shouldFadeIn = isCrossfade && globalFadeTime > 0;
      } else {
        shouldFadeIn = pad.useFade && globalFadeTime > 0;
      }
    }

    if (shouldFadeIn && offset === 0) {
      fadeGain.gain.setValueAtTime(0, now);
      fadeGain.gain.linearRampToValueAtTime(1.0, now + globalFadeTime);
    } else {
      fadeGain.gain.setValueAtTime(1.0, now);
    }

    // Trigger Playback
    sourceNode.start(now, offset);

    // End tracker
    sourceNode.onended = () => {
      setPlayingStatus((prev) => {
        const active = activeNodesRef.current.get(padId);
        if (active && active.source === sourceNode && prev[padId] === 'playing') {
          const next = [...prev];
          next[padId] = 'stopped';
          activeNodesRef.current.delete(padId);
          return next;
        }
        return prev;
      });
    };

    activeNodesRef.current.set(padId, {
      source: sourceNode,
      fadeGain,
      volumeGain,
      startTime: now,
      offsetBase: offset,
      bufferDuration: buffer.duration,
    });

    setPlayingStatus((prev) => {
      const next = [...prev];
      toStop.forEach(({ id }) => {
        next[id] = 'stopped';
      });
      next[padId] = 'playing';
      return next;
    });
  };

  // Pause active Pad
  const pausePad = (padId: number) => {
    const node = activeNodesRef.current.get(padId);
    if (!node) return;

    const { source, startTime, offsetBase, settings, bufferDuration } = node as any;
    const now = audioCtxRef.current!.currentTime;

    // Calculate exact cursor point we paused on (wrapping loops)
    let playedTime = now - startTime;
    let newOffset = offsetBase + playedTime;

    if (settings && settings.loop && bufferDuration) {
      newOffset = newOffset % bufferDuration;
    }

    source.onended = null;
    source.stop();

    activeNodesRef.current.set(padId, {
      ...node,
      pausedAt: newOffset,
    });

    setPlayingStatus((prev) => {
      const next = [...prev];
      next[padId] = 'paused';
      return next;
    });
  };

  // Stop active Pad
  const stopPad = (padId: number) => {
    const node = activeNodesRef.current.get(padId);
    if (!node) {
      setPlayingStatus((prev) => {
        const next = [...prev];
        next[padId] = 'stopped';
        return next;
      });
      return;
    }

    const { source, fadeGain } = node;
    const now = audioCtxRef.current!.currentTime;
    const pad = pads[padId];

    source.onended = null;

    const isMusic = pad.type === 'music';
    const shouldFadeOut = isMusic && pad.useFade && globalFadeTime > 0;

    if (playingStatus[padId] === 'playing' && shouldFadeOut) {
      fadeGain.gain.cancelScheduledValues(now);
      fadeGain.gain.setValueAtTime(fadeGain.gain.value, now);
      fadeGain.gain.linearRampToValueAtTime(0, now + globalFadeTime);
      source.stop(now + globalFadeTime);

      setPlayingStatus((prev) => {
        const next = [...prev];
        next[padId] = 'stopped';
        return next;
      });

      setTimeout(() => {
        activeNodesRef.current.delete(padId);
      }, globalFadeTime * 1000);
    } else {
      source.stop();
      activeNodesRef.current.delete(padId);
      setPlayingStatus((prev) => {
        const next = [...prev];
        next[padId] = 'stopped';
        return next;
      });
    }
  };

  // Modify local parameters of individual pads
  const updatePad = (id: number, key: keyof Pad, value: any) => {
    setPads((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: value } : p))
    );

    // If changing pad volume on-the-fly and playing, update nodes
    if (key === 'volume') {
      const active = activeNodesRef.current.get(id);
      if (active) {
        active.volumeGain.gain.setValueAtTime(value, audioCtxRef.current?.currentTime || 0);
      }
    }
  };

  const handleToggleLoop = (id: number) => {
    const pad = pads[id];
    const nextVal = !pad.loop;
    updatePad(id, 'loop', nextVal);

    // Real-time sync for running loop properties
    const active = activeNodesRef.current.get(id);
    if (active) {
      active.source.loop = nextVal;
    }
  };

  const handleToggleFade = (id: number) => {
    updatePad(id, 'useFade', !pads[id].useFade);
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-slate-950 text-slate-100 font-sans flex flex-col relative">
      
      {/* Drawer and Hamburg configurations */}
      <SidebarDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        fadeTime={globalFadeTime}
        onFadeTimeChange={setGlobalFadeTime}
        loadedFilesCount={availableFiles.length}
      />

      {/* Persistent global Header controller */}
      <Header
        onToggleMenu={() => setIsMenuOpen(true)}
        masterVolume={masterVolume}
        onMasterVolumeChange={setMasterVolume}
        masterGain={masterGain}
        onMasterGainChange={setMasterGain}
        micSettings={micSettings}
        onToggleMic={toggleMic}
        onMicSettingsChange={(changed) => setMicSettings((prev) => ({ ...prev, ...changed }))}
      />

      {/* Main screens routing */}
      {activeTab === 'main' ? (
        <SamplerSection
          pads={pads}
          playingStatus={playingStatus}
          musicVolume={musicVolume}
          onMusicVolumeChange={setMusicVolume}
          soundVolume={soundVolume}
          onSoundVolumeChange={setSoundVolume}
          isCrossfade={isCrossfade}
          onToggleCrossfade={() => setIsCrossfade(!isCrossfade)}
          onPlay={playPad}
          onPause={pausePad}
          onStop={stopPad}
          onToggleLoop={handleToggleLoop}
          onToggleFade={handleToggleFade}
        />
      ) : (
        <SettingsTab
          pads={pads}
          availableFiles={availableFiles}
          onDirectorySelect={handleDirectorySelect}
          onUpdatePad={updatePad}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
