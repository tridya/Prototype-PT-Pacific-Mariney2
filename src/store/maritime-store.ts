import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vessel, Certificate, Equipment } from '@/types/maritime';

export type Module = 'dashboard' | 'sm' | 'pmt' | 'uwc';
export type UserRole = 'Admin' | 'Manager' | 'Staff' | 'Warehouse' | 'Viewer';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'error';
  isRead: boolean;
  createdAt: string;
}

interface MaritimeState {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  vessels: Vessel[];
  addVessel: (vessel: Vessel) => void;
  updateVessel: (id: string, vessel: Partial<Vessel>) => void;
  deleteVessel: (id: string) => void;

  certificates: Certificate[];
  addCertificate: (cert: Certificate) => void;
  updateCertificate: (id: string, cert: Partial<Certificate>) => void;
  deleteCertificate: (id: string) => void;

  equipment: Equipment[];
  addEquipment: (equip: Equipment) => void;
  updateEquipment: (id: string, equip: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
}

// Convert string dates to Date objects for initial dummy data since persist might serialize them
export const useMaritimeStore = create<MaritimeState>()(
  persist(
    (set) => ({
      activeModule: 'dashboard',
      setActiveModule: (module) => set({ activeModule: module }),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      userRole: 'Admin',
      setUserRole: (role) => set({ userRole: role }),
      notifications: [
        {
          id: '1',
          title: 'Certificate Expiring Soon',
          message: 'CSC-2024-004 for MV Pacific Voyager will expire in 90 days.',
          type: 'warning',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Equipment Maintenance',
          message: 'Sonar System-001 requires scheduled maintenance.',
          type: 'info',
          isRead: false,
          createdAt: new Date().toISOString(),
        }
      ],
      addNotification: (notif) => set((state) => ({
        notifications: [
          { ...notif, id: Date.now().toString(), createdAt: new Date().toISOString(), isRead: false },
          ...state.notifications
        ]
      })),
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      })),
      clearNotifications: () => set({ notifications: [] }),

      // Dummy data for vessels
      vessels: [
        {
          id: 'v1',
          name: 'MV Pacific Voyager',
          imoNumber: 'IMO9234567',
          type: 'Cargo Vessel',
          status: 'Underway',
          latitude: -6.2088,
          longitude: 106.8456,
          lastUpdated: new Date(),
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date(),
        },
        {
          id: 'v2',
          name: 'MT Nusantara Gas',
          imoNumber: 'IMO9876543',
          type: 'Tanker',
          status: 'At Anchor',
          latitude: -5.5521,
          longitude: 105.2771,
          lastUpdated: new Date(),
          createdAt: new Date('2021-01-01'),
          updatedAt: new Date(),
        },
        {
          id: 'v3',
          name: 'MV Maritime Explorer',
          imoNumber: 'IMO9123456',
          type: 'Research Vessel',
          status: 'Under Repair',
          latitude: -1.2654,
          longitude: 116.8312,
          lastUpdated: new Date(),
          createdAt: new Date('2019-01-01'),
          updatedAt: new Date(),
        },
      ],
      addVessel: (vessel) => set((state) => ({ vessels: [...state.vessels, vessel] })),
      updateVessel: (id, data) => set((state) => ({
        vessels: state.vessels.map(v => v.id === id ? { ...v, ...data, updatedAt: new Date() } : v)
      })),
      deleteVessel: (id) => set((state) => ({
        vessels: state.vessels.filter(v => v.id !== id)
      })),

      // Dummy data for certificates
      certificates: [
        {
          id: 'c1',
          certificateNumber: 'IOPP-2024-001',
          vesselId: 'v1',
          type: 'IOPP Certificate',
          issuingAuthority: 'BKI',
          issueDate: new Date('2023-01-15'),
          expiryDate: new Date('2025-01-15'),
          version: 1,
          isCopy: false,
          notes: 'International Oil Pollution Prevention Certificate',
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date(),
        },
        {
          id: 'c2',
          certificateNumber: 'SMC-2024-002',
          vesselId: 'v1',
          type: 'Safety Management Certificate',
          issuingAuthority: 'ABS',
          issueDate: new Date('2023-06-01'),
          expiryDate: new Date('2024-12-15'),
          version: 1,
          isCopy: false,
          notes: 'Compliance with ISM Code',
          createdAt: new Date('2023-06-01'),
          updatedAt: new Date(),
        },
        {
          id: 'c3',
          certificateNumber: 'DOC-2024-003',
          vesselId: 'v2',
          type: 'Document of Compliance',
          issuingAuthority: 'LR',
          issueDate: new Date('2023-03-01'),
          expiryDate: new Date('2025-03-01'),
          version: 1,
          isCopy: false,
          notes: 'Company DOC Certificate',
          createdAt: new Date('2023-03-01'),
          updatedAt: new Date(),
        },
        {
          id: 'c4',
          certificateNumber: 'CSC-2024-004',
          vesselId: 'v2',
          type: 'Cargo Ship Safety Certificate',
          issuingAuthority: 'BKI',
          issueDate: new Date('2024-01-01'),
          expiryDate: new Date('2024-06-30'),
          version: 1,
          isCopy: false,
          notes: 'Expires in 90 days - needs attention',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        },
      ],
      addCertificate: (cert) => set((state) => ({ certificates: [...state.certificates, cert] })),
      updateCertificate: (id, data) => set((state) => ({
        certificates: state.certificates.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date() } : c)
      })),
      deleteCertificate: (id) => set((state) => ({
        certificates: state.certificates.filter(c => c.id !== id)
      })),

      // Dummy data for equipment
      equipment: [
        {
          id: 'e1',
          name: 'ROV-001',
          type: 'Remote Operated Vehicle',
          status: 'Available',
          location: 'Warehouse',
          serialNumber: 'ROV-2024-001',
          purchaseDate: new Date('2023-01-01'),
          lastMaintenance: new Date('2024-01-15'),
          histories: [],
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date(),
        },
        {
          id: 'e2',
          name: 'ROV-002',
          type: 'Remote Operated Vehicle',
          status: 'In Use',
          location: 'MV Pacific Voyager',
          serialNumber: 'ROV-2024-002',
          purchaseDate: new Date('2023-02-01'),
          lastMaintenance: new Date('2024-02-15'),
          histories: [
            {
              id: 'hist-001',
              equipmentId: 'e2',
              action: 'Check Out',
              assignee: 'Captain John Doe',
              project: 'Pipeline Inspection 2024',
              vessel: 'MV Pacific Voyager',
              location: 'MV Pacific Voyager',
              notes: 'Deployed for pipeline inspection',
              createdAt: new Date('2024-03-01'),
            },
          ],
          createdAt: new Date('2023-02-01'),
          updatedAt: new Date(),
        },
        {
          id: 'e3',
          name: 'Diving Helmet-001',
          type: 'Professional Diving Helmet',
          status: 'Available',
          location: 'Warehouse',
          serialNumber: 'DH-2024-001',
          purchaseDate: new Date('2023-03-01'),
          lastMaintenance: new Date('2024-03-15'),
          histories: [],
          createdAt: new Date('2023-03-01'),
          updatedAt: new Date(),
        },
        {
          id: 'e4',
          name: 'Sonar System-001',
          type: 'Side Scan Sonar',
          status: 'Maintenance',
          location: 'Warehouse',
          serialNumber: 'SON-2024-001',
          purchaseDate: new Date('2023-04-01'),
          lastMaintenance: new Date('2024-04-01'),
          histories: [],
          createdAt: new Date('2023-04-01'),
          updatedAt: new Date(),
        },
        {
          id: 'e5',
          name: 'ROV-003',
          type: 'Remote Operated Vehicle',
          status: 'Broken',
          location: 'Warehouse',
          serialNumber: 'ROV-2024-003',
          purchaseDate: new Date('2023-05-01'),
          lastMaintenance: new Date('2024-05-01'),
          histories: [],
          createdAt: new Date('2023-05-01'),
          updatedAt: new Date(),
        },
        {
          id: 'e6',
          name: 'Diving Helmet-002',
          type: 'Professional Diving Helmet',
          status: 'In Use',
          location: 'MT Nusantara Gas',
          serialNumber: 'DH-2024-002',
          purchaseDate: new Date('2023-06-01'),
          lastMaintenance: new Date('2024-06-01'),
          histories: [
            {
              id: 'hist-002',
              equipmentId: 'e6',
              action: 'Check Out',
              assignee: 'Officer Jane Smith',
              project: 'Underwater Survey 2024',
              vessel: 'MT Nusantara Gas',
              location: 'MT Nusantara Gas',
              notes: 'Assigned for underwater survey',
              createdAt: new Date('2024-06-01'),
            },
          ],
          createdAt: new Date('2023-06-01'),
          updatedAt: new Date(),
        },
      ],
      addEquipment: (equip) => set((state) => ({ equipment: [...state.equipment, equip] })),
      updateEquipment: (id, data) => set((state) => ({
        equipment: state.equipment.map(e => e.id === id ? { ...e, ...data, updatedAt: new Date() } : e)
      })),
      deleteEquipment: (id) => set((state) => ({
        equipment: state.equipment.filter(e => e.id !== id)
      })),
    }),
    {
      name: 'maritime-storage',
      // We need to parse dates back from strings because localStorage stores JSON
      merge: (persistedState: any, currentState) => {
        if (!persistedState) return currentState;
        
        // Helper to parse dates
        const parseDates = (obj: any): any => {
          if (obj === null || obj === undefined) return obj;
          if (typeof obj === 'string') {
            const isDateString = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(obj);
            if (isDateString) return new Date(obj);
          }
          if (Array.isArray(obj)) return obj.map(parseDates);
          if (typeof obj === 'object') {
            const result: any = {};
            for (const key in obj) {
              result[key] = parseDates(obj[key]);
            }
            return result;
          }
          return obj;
        };

        return {
          ...currentState,
          ...parseDates(persistedState)
        };
      }
    }
  )
);
