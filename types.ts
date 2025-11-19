export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  STATUS = 'STATUS',
  TEAM = 'TEAM',
  WORK_INSTRUCTIONS = 'WORK_INSTRUCTIONS',
  BOM = 'BOM',
  DOCUMENTATION = 'DOCUMENTATION',
  EQUIPMENT = 'EQUIPMENT',
  PROCESS_FLOW = 'PROCESS_FLOW',
  CAPABILITIES = 'CAPABILITIES',
  PFMEA = 'PFMEA',
  MSA = 'MSA',
  FAILURE_CODES = 'FAILURE_CODES',
  EOLT = 'EOLT',
  CAPACITY = 'CAPACITY'
}

export type Language = 'en' | 'ro';

export interface MenuItem {
  id: ViewType;
  label: string; // Now used as a fallback or key
  icon?: React.ReactNode;
  category: 'main' | 'technical';
  number?: number;
}

export interface BomItem {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
  unit: string;
  supplier: string;
}

export interface PfmeaItem {
  id: string;
  processStep: string;
  failureMode: string;
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number; // Risk Priority Number
  action: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  maintenanceDue: string;
  status: 'Active' | 'Maintenance' | 'Offline';
}