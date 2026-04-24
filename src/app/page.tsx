'use client';

import { ShipManagement } from '@/components/modules/ship-management';
import { CertificateManagement } from '@/components/modules/certificate-management';
import { EquipmentInventory } from '@/components/modules/equipment-inventory';
import { useMaritimeStore } from '@/store/maritime-store';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Ship,
  Vault,
  Package,
  Menu,
  X,
  Anchor,
  Building,
  Users,
} from 'lucide-react';

// Sidebar component
function SidebarContent() {
  const activeModule = useMaritimeStore((state) => state.activeModule);
  const setActiveModule = useMaritimeStore((state) => state.setActiveModule);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#002147] rounded-lg flex items-center justify-center">
            <Anchor className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#002147]">Pacific Marine</h1>
            <p className="text-xs text-gray-600">Technology</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
          Management Modules
        </p>

        <button
          onClick={() => setActiveModule('sm')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            activeModule === 'sm'
              ? 'bg-[#002147] text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Ship className="h-5 w-5" />
          <span className="font-medium">Ship Management</span>
        </button>

        <button
          onClick={() => setActiveModule('pmt')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            activeModule === 'pmt'
              ? 'bg-[#002147] text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Vault className="h-5 w-5" />
          <span className="font-medium">Certificate Data</span>
        </button>

        <button
          onClick={() => setActiveModule('uwc')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            activeModule === 'uwc'
              ? 'bg-[#002147] text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Package className="h-5 w-5" />
          <span className="font-medium">Equipment Inventory</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-[#002147] to-[#00152e] rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Building className="h-5 w-5" />
            <span className="font-semibold text-sm">PT. Pacific Marine</span>
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            Professional maritime technology solutions for vessel management and operations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MaritimeManagement() {
  const activeModule = useMaritimeStore((state) => state.activeModule);
  const setActiveModule = useMaritimeStore((state) => state.setActiveModule);

  // Dummy data for vessels
  const vessels = [
    {
      id: 'v1',
      name: 'MV Pacific Voyager',
      imoNumber: 'IMO9234567',
      type: 'Cargo Vessel',
      status: 'Underway' as const,
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
      status: 'At Anchor' as const,
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
      status: 'Under Repair' as const,
      latitude: -1.2654,
      longitude: 116.8312,
      lastUpdated: new Date(),
      createdAt: new Date('2019-01-01'),
      updatedAt: new Date(),
    },
  ];

  // Dummy data for certificates
  const certificates = [
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
  ];

  // Dummy data for equipment
  const equipment = [
    {
      id: 'e1',
      name: 'ROV-001',
      type: 'Remote Operated Vehicle',
      status: 'Available' as const,
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
      status: 'In Use' as const,
      location: 'MV Pacific Voyager',
      serialNumber: 'ROV-2024-002',
      purchaseDate: new Date('2023-02-01'),
      lastMaintenance: new Date('2024-02-15'),
      histories: [
        {
          id: 'hist-001',
          equipmentId: 'e2',
          action: 'Check Out' as const,
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
      status: 'Available' as const,
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
      status: 'Maintenance' as const,
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
      status: 'Broken' as const,
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
      status: 'In Use' as const,
      location: 'MT Nusantara Gas',
      serialNumber: 'DH-2024-002',
      purchaseDate: new Date('2023-06-01'),
      lastMaintenance: new Date('2024-06-01'),
      histories: [
        {
          id: 'hist-002',
          equipmentId: 'e6',
          action: 'Check Out' as const,
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
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'sm':
        return <ShipManagement vessels={vessels} certificates={certificates} />;
      case 'pmt':
        return <CertificateManagement certificates={certificates} vessels={vessels} />;
      case 'uwc':
        return <EquipmentInventory equipment={equipment} />;
      default:
        return <ShipManagement vessels={vessels} certificates={certificates} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center">
              <Anchor className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-[#002147]">Pacific Marine</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72">
          <div className="p-6 lg:p-8">{renderModule()}</div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#002147] text-white mt-auto">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Anchor className="h-5 w-5" />
              <span className="font-semibold">PT. Pacific Marine Technology</span>
            </div>
            <p className="text-sm opacity-90 text-center sm:text-right">
              © 2024 Pacific Marine Technology. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
