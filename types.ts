
export enum AppMode {
  TRY_ON = 'TRY_ON',
  EDIT = 'EDIT'
}

export interface ImageData {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export interface ProcessingState {
  isLoading: boolean;
  error: string | null;
  resultImageUrl: string | null;
}
