export type SourceStatus = 'uploaded' | 'processing' | 'ready' | 'failed';

export interface SourceItem {
  _id: string;
  studentId: string;
  originalName: string;
  storedName: string;
  type: 'file';
  mimeType: string;
  size: number;
  storagePath: string;
  status: SourceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SourceContent {
  _id: string;
  sourceId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}
