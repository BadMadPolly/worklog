export interface WorklogEntry {
    id: string;
    description: string;
    hours: number;
    date: string;
    writtenOff: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface EntryFormData {
    description: string;
    hours: number;
    date: string;
    writtenOff: boolean;
  }