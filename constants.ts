
import { ViewType, BomItem, PfmeaItem, EquipmentItem, Task, DocHistoryItem, EquipmentIpGroup } from './types';

export const MOCK_BOM: BomItem[] = [
  { 
    id: '1', 
    station: 'OP10', 
    partNumber: '13059-036/0000', 
    quantity: 2, 
    description: 'Ax', 
    visualAidBgColor: '#CCFFFF',
    variants: {
      '90122-032/0000': true,
      '90122-034/0000': true,
      '90122-035/0000': true,
      '90122-037/0000': true,
      '90122-033/0000': true,
      '90122-036/0000': true
    }
  },
  { 
    id: '2', 
    station: 'OP10', 
    partNumber: '12620-736/0000', 
    quantity: 2, 
    description: 'Carcasa ax', 
    visualAidBgColor: '#CCFFFF',
    variants: {
      '90122-032/0000': true,
      '90122-034/0000': true,
      '90122-035/0000': true,
      '90122-037/0000': true,
      '90122-033/0000': true,
      '90122-036/0000': true
    }
  },
  { 
    id: '3', 
    station: 'OP20', 
    partNumber: '10013-651/0000', 
    quantity: 2, 
    description: 'Arc', 
    visualAidBgColor: '#CCFFFF',
    variants: {
      '90122-032/0000': true,
      '90122-034/0000': true,
      '90122-035/0000': true,
      '90122-037/0000': true,
      '90122-033/0000': true,
      '90122-036/0000': true
    }
  },
  { 
    id: '4', 
    station: 'OP30', 
    partNumber: '12331-482/0000', 
    quantity: 1, 
    description: 'Bezel scroll stanga mat', 
    visualAidBgColor: '#CCFFFF',
    variants: {
      '90122-032/0000': true,
      '90122-034/0000': true,
      '90122-035/0000': true,
      '90122-037/0000': true,
      '90122-033/0000': true,
      '90122-036/0000': true
    }
  },
  { 
    id: '5', 
    station: 'OP30', 
    partNumber: '12331-483/0000', 
    quantity: 1, 
    description: 'Bezel scroll dreapta mat', 
    visualAidBgColor: '#CCFFFF',
    variants: {
      '90122-032/0000': true,
      '90122-034/0000': true,
      '90122-035/0000': true,
      '90122-037/0000': true,
      '90122-033/0000': true,
      '90122-036/0000': true
    }
  },
  { 
    id: '6', 
    station: 'OP40', 
    partNumber: '13073-141/0000', 
    quantity: 2, 
    description: 'Rotita scroll mat', 
    visualAidBgColor: '#CCFFFF',
    variants: {
      '90122-032/0000': true,
      '90122-034/0000': true,
      '90122-035/0000': true,
      '90122-037/0000': true,
      '90122-033/0000': true,
      '90122-036/0000': true
    }
  },
  { 
    id: '7', 
    station: 'OP60', 
    partNumber: '12620-734/0000', 
    quantity: 1, 
    description: 'Carcasa Stranga', 
    visualAidBgColor: '#FFFF00',
    variants: {
      '90122-032/0000': true,
      '90122-034/0000': true,
      '90122-035/0000': true,
      '90122-037/0000': true,
      '90122-033/0000': true,
      '90122-036/0000': true
    }
  },
  { 
    id: '8', 
    station: 'OP60', 
    partNumber: '05055-276/0000', 
    quantity: 2, 
    description: 'Lever', 
    visualAidBgColor: '#CCFFFF',
    variants: {
      '90122-032/0000': true,
      '90122-034/0000': true,
      '90122-035/0000': true,
      '90122-037/0000': true,
      '90122-033/0000': true,
      '90122-036/0000': true
    }
  },
  { 
    id: '9', 
    station: 'OP110', 
    partNumber: '12331-481/0001', 
    quantity: 1, 
    description: 'Back cover right', 
    visualAidBgColor: '#CCFFFF',
    variants: {
      '90122-032/0000': true,
      '90122-034/0000': true,
      '90122-035/0000': true,
      '90122-037/0000': true,
      '90122-033/0000': true,
      '90122-036/0000': true
    }
  }
];

export const MOCK_HISTORY: DocHistoryItem[] = [
  {
    id: '1',
    version: '00',
    register: 'Formular BOM',
    changes: 'Emitere document',
    created: 'Pakot Laszlo',
    dateCreated: '19.09.2012',
    released: 'Braga Cristian',
    dateReleased: '19.09.2012'
  },
  {
    id: '2',
    version: '01',
    register: 'Formular BOM',
    changes: 'Actualizare document si transpunere in noul template',
    created: 'Asandulesei Vladut',
    dateCreated: '15.04.2022',
    released: 'Apostolescu Marius',
    dateReleased: '15.04.2022'
  }
];

export const MOCK_PFMEA: PfmeaItem[] = [
  { id: '1', processStep: 'SMT Placement', failureMode: 'Component Misalignment', severity: 7, occurrence: 3, detection: 4, rpn: 84, action: 'Improve camera calibration' },
  { id: '2', processStep: 'Reflow Soldering', failureMode: 'Cold Solder Joint', severity: 8, occurrence: 2, detection: 6, rpn: 96, action: 'Optimize reflow profile' },
  { id: '3', processStep: 'AOI Inspection', failureMode: 'False Negative', severity: 9, occurrence: 2, detection: 3, rpn: 54, action: 'Update training dataset' },
  { id: '4', processStep: 'Final Assembly', failureMode: 'Missing Screw', severity: 6, occurrence: 4, detection: 2, rpn: 48, action: 'Implement torque counter' },
];

export const MOCK_EQUIPMENT_DATA: EquipmentItem[] = [
  { id: '1', station: 'OP 10', owner: 'Customer', eqNumber: '1097268', powerSupply: 'AC 220V 50HZ single phase', powerKw: '1', airSupplyBar: 'no', airSupplyDiam: 'no' },
  { id: '2', station: 'OP 20.1', owner: 'Preh', eqNumber: '1097269', powerSupply: 'AC 220V 50HZ single phase', powerKw: '1', airSupplyBar: 'no', airSupplyDiam: 'no' },
  { id: '3', station: 'OP 20.2', owner: 'Preh', eqNumber: '1097271', powerSupply: 'AC 220V 50HZ single phase', powerKw: '1', airSupplyBar: 'no', airSupplyDiam: 'no' },
  { id: '4', station: 'OP 30.1', owner: 'Preh', eqNumber: '1097272', powerSupply: 'AC 220V 50HZ single phase', powerKw: '1', airSupplyBar: 'no', airSupplyDiam: 'no' },
  { id: '5', station: 'OP 30.2', owner: 'Preh', eqNumber: '1097273', powerSupply: 'AC 220V 50HZ single phase', powerKw: '1', airSupplyBar: 'no', airSupplyDiam: 'no' },
  { id: '6', station: 'OP 40.1', owner: 'Preh', eqNumber: '1097274', powerSupply: 'AC 220V 50HZ single phase', powerKw: '1', airSupplyBar: 'no', airSupplyDiam: 'no' },
  { id: '7', station: 'OP 40.2', owner: 'Preh', eqNumber: '1097275', powerSupply: 'AC 220V 50HZ single phase', powerKw: '1', airSupplyBar: 'no', airSupplyDiam: 'no' },
  { id: '8', station: 'OP 50.1', owner: 'Preh', eqNumber: '1097276', powerSupply: 'AC 220V 50HZ single phase', powerKw: '2', airSupplyBar: '6', airSupplyDiam: '12' },
  { id: '9', station: 'OP 50.2', owner: 'Preh', eqNumber: '1097277', powerSupply: 'AC 220V 50HZ single phase', powerKw: '2', airSupplyBar: '6', airSupplyDiam: '12' },
  { id: '10', station: 'OP 60.1', owner: 'Preh', eqNumber: '1097278', powerSupply: 'AC 220V 50HZ single phase', powerKw: '1,5', airSupplyBar: '6', airSupplyDiam: '12' },
  { id: '11', station: 'OP 60.2', owner: 'Preh', eqNumber: '1097279', powerSupply: 'AC 220V 50HZ single phase', powerKw: '1,5', airSupplyBar: '6', airSupplyDiam: '12' },
  { id: '12', station: 'EOL 1', owner: 'Customer', eqNumber: '1097283', powerSupply: 'AC 400V 50Hz 3~/N/PE - max. 32A', powerKw: '', airSupplyBar: '6', airSupplyDiam: '12' },
  { id: '13', station: 'EOL 2', owner: 'Customer', eqNumber: '1097285', powerSupply: 'AC 400V 50Hz 3~/N/PE - max. 32A', powerKw: '', airSupplyBar: '6', airSupplyDiam: '12' },
];

export const MOCK_EQUIPMENT_IPS: EquipmentIpGroup[] = [
  {
    id: 'g1',
    linkedId: '8', // OP 50.1
    station: 'OP 50.1',
    devices: [
      { equipment: 'PLC 1217C DC/DC/DC', name: 'OP50-1=PLC-KF1', ip: '172.19.123.150' },
      { equipment: 'WAGO', name: 'OP50-1=PLC-KF2', ip: '172.19.123.151' },
      { equipment: 'HMI KTP700', name: 'KTP700_OP50-1', ip: '172.19.123.152' },
      { equipment: 'Vision Sensor', name: 'OP50-1-ST10-CR', ip: '172.19.123.153' },
    ]
  },
  {
    id: 'g2',
    linkedId: '9', // OP 50.2
    station: 'OP 50.2',
    devices: [
      { equipment: 'PLC 1217C DC/DC/DC', name: 'OP50-2=PLC-KF1', ip: '172.19.123.50' },
      { equipment: 'WAGO', name: 'OP50-2=PLC-KF2', ip: '172.19.123.51' },
      { equipment: 'HMI KTP700', name: 'KTP700_OP50-2', ip: '172.19.123.52' },
      { equipment: 'Vision Sensor', name: 'OP50-2-ST10-CR', ip: '172.19.123.53' },
    ]
  },
  {
    id: 'g3',
    linkedId: '10', // OP 60.1
    station: 'OP 60.1',
    devices: [
      { equipment: 'PLC 1217C DC/DC/DC', name: 'OP60-1=PLC-KF1', ip: '172.19.123.60' },
      { equipment: 'WAGO', name: 'OP60-1=PLC-KF2', ip: '172.19.123.61' },
      { equipment: 'HMI KTP700', name: 'KTP700_OP60-1', ip: '172.19.123.62' },
      { equipment: 'Vision Sensor', name: 'OP60-1-CR-UP', ip: '172.19.123.64' },
      { equipment: 'Vision Sensor', name: 'OP60-1-OB-UP', ip: '172.19.123.65' },
      { equipment: 'Vision Sensor', name: 'OP60-1-CR-DOWN', ip: '172.19.123.66' },
    ]
  },
  {
    id: 'g4',
    linkedId: '11', // OP 60.2
    station: 'OP 60.2',
    devices: [
      { equipment: 'PLC 1217C DC/DC/DC', name: 'OP60-2=PLC-KF1', ip: '172.19.123.160' },
      { equipment: 'WAGO', name: 'OP60-2=PLC-KF2', ip: '172.19.123.161' },
      { equipment: 'HMI KTP700', name: 'KTP700_OP60-2', ip: '172.19.123.162' },
      { equipment: 'Vision Sensor', name: 'OP60-2-CR-UP', ip: '172.19.123.164' },
      { equipment: 'Vision Sensor', name: 'OP60-2-OB-UP', ip: '172.19.123.165' },
      { equipment: 'Vision Sensor', name: 'OP60-2-CR-DOWN', ip: '172.19.123.166' },
    ]
  }
];

export const PROJECTS = [
  "10546- SK38xFaceLift",
  "10547- VW Passat B9",
  "10548- Audi A4 B10"
];

export const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Review PFMEA for SMT Line', assignee: 'Alex Engineer', priority: 'High', source: 'Inginer PRO', status: 'In Progress', dueDate: '2024-03-25' },
  { id: 't2', title: 'Calibrate AOI Machine', assignee: 'Maintenance Team', priority: 'High', source: 'Inginer PRO', status: 'To Do', dueDate: '2024-03-26' },
  { id: 't3', title: 'Update BOM for Revision B', assignee: 'Sarah Design', priority: 'Medium', source: 'Inginer PRO', status: 'Done', dueDate: '2024-03-20' },
  { id: 't4', title: 'Safety Audit - Zone 4', assignee: 'Alex Engineer', priority: 'Medium', source: 'Inginer PRO', status: 'To Do', dueDate: '2024-04-01' },
  { id: 't5', title: 'Order Paste Mask', assignee: 'Procurement', priority: 'Low', source: 'Inginer PRO', status: 'To Do', dueDate: '2024-04-05' },
];

export const DEFAULT_COLORS = [
  '#bdd7ee', // Blue
  '#a9d08e', // Green
  '#ffff99', // Yellow
  '#f4b084', // Orange
  '#cc99ff', // Purple
  '#99ffff', // Teal
  '#e2f0d9', 
  '#deebf7', 
  '#fff2cc', 
  '#fbe5d6'
];
