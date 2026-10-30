export type PadType = 'music' | 'se';
export type PlayingStatus = 'playing' | 'paused' | 'stopped';

export interface Pad {
  id: number;
  type: PadType;
  label: string;
  fileName: string;
  volume: number; // Individual volume setting (0.0 to 1.5 or 2.0)
  loop: boolean;
  useFade: boolean; // Unique to MUSIC pads
}

export interface MicSettings {
  active: boolean;
  volume: number;
  reverb: number; // 0.0 (dry) to 1.0 (wet)
  pitch: number;  // Pitch shift ratio (0.5 to 2.0)
}

export interface LoadedFile {
  name: string;
  file: File;
  buffer: AudioBuffer;
}

export interface ActiveAudioNode {
  source: AudioBufferSourceNode;
  fadeGain: GainNode;
  volumeGain: GainNode;
  startTime: number;
  offsetBase: number;
  pausedAt?: number;
  bufferDuration: number;
}
