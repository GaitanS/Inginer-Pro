import React from 'react';

export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  STATUS = 'STATUS',
  TASK_PRIORITIZATION = 'TASK_PRIORITIZATION',
  TEAM = 'TEAM',
  WORK_INSTRUCTIONS = 'WORK_INSTRUCTIONS',
  BOM = 'BOM',
  VISUAL_AIDS = 'VISUAL_AIDS',
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
  station: string; // e.g. OP10
  partNumber: string; // Material
  description: string;
  quantity: number;
  image?: string; // URL for the image
  visualAidBgColor?: string; // Hex color for Visual Aid background
  // Dynamic variant applicability (e.g., "Audio/FAS...")
  variants: {
    [variantName: string]: boolean; 
  };
}

export interface VariantDefinition {
  name: string;
  color: string; // Hex Code e.g. #FF0000
}

export interface DocHistoryItem {
  id: string;
  version: string;
  register: string;
  changes: string;
  created: string;
  dateCreated: string;
  released: string;
  dateReleased: string;
}

export interface VisualAidMetadata {
  dateCreated: string;
  createdBy: string;
  checkedBy: string;
  approvedBy: string;
  releaseDate: string;
  version: string;
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

export interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  source: 'Inginer PRO' | 'Teams';
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate?: string;
}