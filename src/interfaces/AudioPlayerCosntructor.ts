export interface AudioPlayerConstructorProps {
  getAudioFilePaths: () => Promise<string[]>;
  threadsNumber?: number;
  minDelay?: number;
  maxDelay?: number;
}
