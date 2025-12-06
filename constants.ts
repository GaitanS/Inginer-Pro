
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

export const DROPDOWN_OPTIONS = {
  owners: ['Customer', 'Preh'],
  powerSupply: ['AC 220V 50HZ single phase', 'AC 400V 50Hz 3~/N/PE - max. 32A', 'DC 24V'],
  powerKw: ['1', '1.5', '2', '2.5', '3'],
  airSupplyBar: ['no', '6', '8'],
  airSupplyDiam: ['no', '12', '16']
};

export const VALIDATION_CHECKLIST_DATA = [
  {
    id: 'safety',
    title: '1. SAFETY & EHS (Siguranță și Mediu)',
    items: [
      {
        refIatf: '7.1.3.1 (Siguranță)',
        refVda: 'P6.4.1 (Mediu lucru)',
        test: 'Pornește mașina în mod automat. Activează un element de siguranță (apasă E-Stop sau întrerupe cortina).',
        expected: 'Oprire Instantanee. Mașina nu trebuie să mai facă nicio mișcare mecanică. Resetarea necesită acțiune voită (buton albastru).',
        example: 'Dacă bagi mâna prin cortină, cilindrul de presare se oprește imediat.',
      },
      {
        refIatf: 'P6.4.1 (Conformitate)',
        refVda: 'P6.4.1',
        test: 'Caută plăcuța metalică de identificare pe șasiu. Verifică dacă are marcajul "CE".',
        expected: 'Marcaj Prezent. Plăcuța conține: Producător, An, Serie, Tensiune, Presiune, Marcaj CE.',
        example: 'Plăcuța e nituită vizibil, nu e un abțibild care cade.',
      },
      {
        refIatf: '7.1.3.1 (Ergonomie)',
        refVda: 'P6.4.1 (Ergonomie)',
        test: 'Treci cu mâna (fără mănușă) pe la colțurile mașinii, profilele de aluminiu, sub masă. Verifică zgomotul în sarcină.',
        expected: 'Fără riscuri. Nu există muchii tăioase, bavuri metalice sau colțuri ascuțite.',
        example: 'Profilele de aluminiu au capace de plastic. Cablurile nu atârnă.',
      }
    ]
  },
  {
    id: 'hardware',
    title: '2. CONSTRUCȚIE MECANICĂ & HARDWARE',
    items: [
      {
        refIatf: '8.5.4.1 (Protecție)',
        refVda: 'P6.6.2 (Manipulare)',
        test: 'Ia o piesă HMI vopsită. Așaz-o în cuib (nest) și scoate-o de 10 ori. Verifică piesa la lumină.',
        expected: 'Zero Zgârieturi. Suprafețele de contact trebuie să fie din material moale (Rășină, POM, Cauciuc).',
        example: 'Cuibul e curat, nu are șuruburi metalice care ating fața piesei.',
      },
      {
        refIatf: '7.1.4 (Mediu)',
        refVda: 'P6.4.3 (ESD)',
        test: 'Măsoară cu aparatul ESD continuitatea între părțile metalice și pământare. Verifică materialele plastice.',
        expected: 'Disipativ / Conductiv. Toate metalele sunt legate la pământ. Plasticul de contact e negru (ESD Safe).',
        example: 'Dacă atingi cu sonda șurubelnița electrică și masa, aparatul piuie.',
      },
      {
        refIatf: 'P6.4.1 (Ordinea)',
        refVda: 'P6.4.1',
        test: 'Deschide dulapul electric și uită-te la fire. Verifică traseul cablurilor pe mașină.',
        expected: 'Etichetare & Ordine. Toate firele au etichete. Cablurile mobile sunt în lanț port-cablu.',
        example: 'Pe fir scrie "S12" și pe senzor scrie "S12". Nu sunt fire lipite cu bandă.',
      },
      {
        refIatf: '10.2.4 (Poka-Yoke)',
        refVda: 'P6.4.2 (Design)',
        test: 'Încearcă să așezi piesa în cuib invers (rotită cu 180 grade sau cu fața în jos).',
        expected: 'Imposibil mecanic. Pinii de ghidare nu permit așezarea greșită a piesei.',
        example: 'Piesa intră doar într-o singură poziție. Nu poți forța asamblarea greșită.',
      }
    ]
  },
  {
    id: 'capability',
    title: '3. CAPABILITATE & PROCES',
    items: [
      {
        refIatf: '7.1.5.1.1 (Statistica)',
        refVda: 'P6.4.1 (Cmk)',
        test: 'Rulează 50 de piese consecutive fără eroare. Cere raportul Cmk pentru caracteristica critică.',
        expected: 'Cmk >= 1.67. Procesul este stabil și centrat. Histogramă îngustă.',
        example: 'Dacă ținta e 1.2 Nm, toate valorile sunt între 1.18 și 1.22.',
      },
      {
        refIatf: '7.1.5.1.1 (MSA)',
        refVda: 'P6.4.1 (Precizie)',
        test: 'Ia piesa "Master" (Etalon). Măsoar-o de 10 ori la rând pe aceeași mașină.',
        expected: 'Variație < 10%. Mașina arată aproape aceeași valoare de fiecare dată.',
        example: 'Test Light Density: 500, 501, 499, 500 lux.',
      },
      {
        refIatf: '8.5.1.1 (Parametri)',
        refVda: 'P6.2.3 (Setări)',
        test: 'Compară foaia de parametri aprobată cu ce e setat în ecranul mașinii.',
        expected: 'Identic. Nu există abateri neaprobate.',
        example: 'Timp lipire: Foaie = 3.5s vs Mașină = 3.5s.',
      }
    ]
  },
  {
    id: 'logic',
    title: '4. LOGICA DE REBUT & ERORI',
    items: [
      {
        refIatf: '10.2.4 (Detecție)',
        refVda: 'P6.4.3 (Eroare)',
        test: 'Introdu o piesă defectă (ex: fără un clips). Dă Start.',
        expected: 'STOP / NOK. Mașina detectează eroarea înainte de a finaliza procesul.',
        example: 'Senzorul de prezență vede că lipsește clipsul.',
      },
      {
        refIatf: '10.2.3 (Interlock)',
        refVda: 'P6.3.2 (Blocare)',
        test: 'După ce mașina a dat NOK... Încearcă să bagi o piesă nouă imediat.',
        expected: 'Start Blocat. Nu poți porni ciclul nou până nu "cureți" eroarea.',
        example: 'Butonul de Start e inactiv. HMI-ul afișează "Acknowledge Scrap".',
      },
      {
        refIatf: '8.7.1.4 (Confirmare)',
        refVda: 'P6.3.2 (Segregare)',
        test: 'Când mașina cere "Aruncă piesa", bagă mâna în cutia de piese BUNE. Vezi dacă eroarea dispare.',
        expected: 'Nu se resetează. Eroarea dispare DOAR dacă senzorul vede mâna în cutia ROȘIE.',
        example: 'Senzorul de pe cutia roșie trebuie să confirme fizic aruncarea.',
      },
      {
        refIatf: '8.5.1.1 (Acces)',
        refVda: 'P6.2.3 (User)',
        test: 'Loghează-te ca Operator. Încearcă să dezactivezi senzorul de la cutia de rebut.',
        expected: 'Acces Interzis. Operatorul nu poate modifica logica de control.',
        example: 'Butonul de "Settings" este gri sau cere parolă.',
      }
    ]
  },
  {
    id: 'docs',
    title: '5. DOCUMENTAȚIE & MENTENANȚĂ',
    items: [
      {
        refIatf: '8.5.1.5 (Piese)',
        refVda: 'P6.4.2 (Spare Parts)',
        test: 'Cere cutia cu "Start-up Kit". Verifică dacă ai piesele critice.',
        expected: 'Fizic prezente. Nu semnezi recepția pe promisiuni.',
        example: 'Ai în mână senzorul optic de rezervă și bitul de șurubelniță.',
      },
      {
        refIatf: '7.5.3.2 (Scheme)',
        refVda: 'P6.4.2 (Manuale)',
        test: 'Verifică dacă ai manualul de utilizare și schema electrică.',
        expected: 'Disponibil. Format digital (PDF) + O copie fizică la mașină.',
        example: 'Schema electrică corespunde cu tabloul.',
      }
    ]
  }
];
