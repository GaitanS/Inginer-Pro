import { ViewType, BomItem, PfmeaItem, EquipmentItem } from './types';

export const MOCK_BOM: BomItem[] = [
  { id: '1', partNumber: 'PCB-001', description: 'Main Control Board', quantity: 1, unit: 'PC', supplier: 'TechCircuits Inc' },
  { id: '2', partNumber: 'RES-4K7', description: 'Resistor 4.7k Ohm', quantity: 12, unit: 'PC', supplier: 'CompSource' },
  { id: '3', partNumber: 'CAP-100U', description: 'Capacitor 100uF', quantity: 4, unit: 'PC', supplier: 'CompSource' },
  { id: '4', partNumber: 'HS-ALU', description: 'Aluminum Heat Sink', quantity: 1, unit: 'PC', supplier: 'MetalWorks' },
  { id: '5', partNumber: 'SCR-M3', description: 'Screw M3x10', quantity: 8, unit: 'PC', supplier: 'FastenersCo' },
];

export const MOCK_PFMEA: PfmeaItem[] = [
  { id: '1', processStep: 'SMT Placement', failureMode: 'Component Misalignment', severity: 7, occurrence: 3, detection: 4, rpn: 84, action: 'Improve camera calibration' },
  { id: '2', processStep: 'Reflow Soldering', failureMode: 'Cold Solder Joint', severity: 8, occurrence: 2, detection: 6, rpn: 96, action: 'Optimize reflow profile' },
  { id: '3', processStep: 'AOI Inspection', failureMode: 'False Negative', severity: 9, occurrence: 2, detection: 3, rpn: 54, action: 'Update training dataset' },
  { id: '4', processStep: 'Final Assembly', failureMode: 'Missing Screw', severity: 6, occurrence: 4, detection: 2, rpn: 48, action: 'Implement torque counter' },
];

export const MOCK_EQUIPMENT: EquipmentItem[] = [
  { id: '1', name: 'Pick & Place Machine A', model: 'NXT III', serialNumber: 'SN-99283', maintenanceDue: '2024-06-15', status: 'Active' },
  { id: '2', name: 'Reflow Oven', model: 'Heller 1809', serialNumber: 'SN-11223', maintenanceDue: '2024-05-20', status: 'Active' },
  { id: '3', name: 'Wave Solder', model: 'E-Wave 2', serialNumber: 'SN-44511', maintenanceDue: '2024-04-10', status: 'Maintenance' },
  { id: '4', name: 'ICT Tester', model: 'Teradyne Z1', serialNumber: 'SN-77821', maintenanceDue: '2024-07-01', status: 'Offline' },
];

export const PROJECTS = [
  "Project Alpha - Auto ECU",
  "Project Beta - Consumer IoT",
  "Project Gamma - Medical Device"
];