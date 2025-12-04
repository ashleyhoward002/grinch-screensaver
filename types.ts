export interface GrinchQuote {
  text: string;
  mood: 'annoyed' | 'angry' | 'scheming' | 'slightly-touched';
}

export interface ScreensaverConfig {
  idleTimeoutSeconds: number;
  showCountdown: boolean;
  showSnow: boolean;
}
