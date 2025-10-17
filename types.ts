export enum TimerStatus {
  STOPPED,
  RUNNING,
  PAUSED,
  FINISHED,
}

export interface GamePreset {
  id: string;
  name: string;
  costPerUnit: number;
  minutesPerUnit: number;
}

export interface TimerState {
  id: string;
  name: string;
  initialDuration: number; // in seconds
  remainingTime: number; // in seconds
  status: TimerStatus;
  costAnchor: number; // in seconds, represents remainingTime at last cost reset
  gamePresetId?: string;
}

export interface StopwatchState {
  id:string;
  name: string;
  elapsedTime: number; // in seconds
  laps: number[];
  status: TimerStatus;
  costAnchor: number; // in seconds, represents elapsedTime at last cost reset
  gamePresetId?: string;
}

export interface BillingRecord {
  id: string;
  date: string; // ISO string
  amount: number;
}
