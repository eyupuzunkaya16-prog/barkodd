export interface ScannedItem {
  id: string;
  barcode: string;
  format: string;
  timestamp: number;
  note?: string;
}

export enum AppView {
  SCANNER = 'SCANNER',
  LIST = 'LIST',
  SETTINGS = 'SETTINGS',
  BROWSER = 'BROWSER'
}

export interface AppSettings {
  batchScan: boolean;
  vibration: boolean;
  sound: boolean;
  history: boolean;
  allowDuplicates: boolean;
  isAppLocked: boolean;
  pinCode: string | null;
  theme: {
    bg: string;
    primary: string;
  };
}

export interface InventoryStats {
  totalItems: number;
  uniqueItems: number;
  scanRate: string;
}