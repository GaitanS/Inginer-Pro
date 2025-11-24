import { ViewType, BomItem, PfmeaItem, EquipmentItem, Task, DocHistoryItem } from './types';

export const MOCK_BOM: BomItem[] = [
  { 
    id: '1', 
    station: 'OP10', 
    partNumber: '13059-036/0000', 
    quantity: 2, 
    description: 'Ax', 
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

export const MOCK_EQUIPMENT: EquipmentItem[] = [
  { id: '1', name: 'Pick & Place Machine A', model: 'NXT III', serialNumber: 'SN-99283', maintenanceDue: '2024-06-15', status: 'Active' },
  { id: '2', name: 'Reflow Oven', model: 'Heller 1809', serialNumber: 'SN-11223', maintenanceDue: '2024-05-20', status: 'Active' },
  { id: '3', name: 'Wave Solder', model: 'E-Wave 2', serialNumber: 'SN-44511', maintenanceDue: '2024-04-10', status: 'Maintenance' },
  { id: '4', name: 'ICT Tester', model: 'Teradyne Z1', serialNumber: 'SN-77821', maintenanceDue: '2024-07-01', status: 'Offline' },
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