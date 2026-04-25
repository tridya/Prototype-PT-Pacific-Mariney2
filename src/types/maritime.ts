export type VesselStatus = 'Underway' | 'At Anchor' | 'Under Repair';

export interface Vessel {
  id: string;
  name: string;
  imoNumber?: string;
  type: string;
  status: VesselStatus;
  latitude: number;
  longitude: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  vesselId: string;
  type: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  version: number;
  isCopy: boolean;
  copyFromId?: string;
  notes?: string;
  attachmentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificateWithVessel extends Certificate {
  vessel: Vessel;
}

export type EquipmentStatus = 'Available' | 'In Use' | 'Maintenance' | 'Broken';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  location: string;
  serialNumber?: string;
  purchaseDate?: Date;
  lastMaintenance?: Date;
  histories: EquipmentHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export type HistoryAction = 'Check Out' | 'Check In';

export interface EquipmentHistory {
  id: string;
  equipmentId: string;
  action: HistoryAction;
  assignee?: string;
  project?: string;
  vessel?: string;
  location: string;
  notes?: string;
  createdAt: Date;
}

export type CertificateHealth = 'critical' | 'warning' | 'good';

export interface CertificateHealthResult {
  health: CertificateHealth;
  daysRemaining: number;
}
