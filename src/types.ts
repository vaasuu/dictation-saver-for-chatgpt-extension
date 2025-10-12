// Shared types for the extension

export interface RecordingMetadata {
  id: number;
  timestamp: number;
  duration: number;
  mime: string;
}

export interface RecordingData {
  data: Uint8Array;
  mime: string;
  timestamp: number;
  duration: number;
}

export interface SaveRecordingMessage {
  type: 'SAVE_RECORDING';
  data: number[];
  mime: string;
  timestamp: number;
  duration: number;
}

export interface ClearRecordingsMessage {
  type: 'CLEAR_RECORDINGS';
}

export interface GetRecordingsMessage {
  type: 'GET_RECORDINGS';
}

export interface GetRecordingMessage {
  type: 'GET_RECORDING';
  index: number;
}

export type Message =
  | SaveRecordingMessage
  | ClearRecordingsMessage
  | GetRecordingsMessage
  | GetRecordingMessage;

export interface MessageResponse {
  ok: boolean;
  recordings?: RecordingMetadata[];
  data?: number[];
  mime?: string;
  timestamp?: number;
  duration?: number;
  error?: string;
}