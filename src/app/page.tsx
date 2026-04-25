'use client';

import { ShipManagement } from '@/components/modules/ship-management';
import { CertificateManagement } from '@/components/modules/certificate-management';
import { EquipmentInventory } from '@/components/modules/equipment-inventory';
import { DashboardSummary } from '@/components/modules/dashboard-summary';
import { useMaritimeStore, UserRole } from '@/store/maritime-store';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Ship,
  Vault,
  Package,
  Menu,
  Anchor,
  Building,
  LayoutDashboard,
  Bell,
  UserCircle,
  Check
} from 'lucide-react';
import Image from 'next/image';

// Sidebar component
function SidebarContent() {
  const activeModule = useMaritimeStore((state) => state.activeModule);
  const setActiveModule = useMaritimeStore((state) => state.setActiveModule);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Image src="/logo.svg" alt="PT. Pacific Marine Technology]" width={40} height={40} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#002147]">PT. Pacific Mariney</h1>
            <p className="text-xs text-gray-600">Technology</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
          Management Modules
        </p>

        <button
          onClick={() => setActiveModule('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${activeModule === 'dashboard'
            ? 'bg-[#002147] text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="font-medium">Dashboard Summary</span>
        </button>

        <button
          onClick={() => setActiveModule('sm')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${activeModule === 'sm'
            ? 'bg-[#002147] text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
          <Ship className="h-5 w-5" />
          <span className="font-medium">Ship Management</span>
        </button>

        <button
          onClick={() => setActiveModule('pmt')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${activeModule === 'pmt'
            ? 'bg-[#002147] text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
          <Vault className="h-5 w-5" />
          <span className="font-medium">Certificate Data</span>
        </button>

        <button
          onClick={() => setActiveModule('uwc')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${activeModule === 'uwc'
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
            <span className="font-semibold text-sm">PT Padepokan Tujuh Sembilan</span>
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
  const userRole = useMaritimeStore((state) => state.userRole);
  const setUserRole = useMaritimeStore((state) => state.setUserRole);
  const notifications = useMaritimeStore((state) => state.notifications);
  const markNotificationAsRead = useMaritimeStore((state) => state.markNotificationAsRead);
  const clearNotifications = useMaritimeStore((state) => state.clearNotifications);

  const vessels = useMaritimeStore((state) => state.vessels);
  const certificates = useMaritimeStore((state) => state.certificates);
  const equipment = useMaritimeStore((state) => state.equipment);

  const certificatesWithVessels = certificates.map((cert) => ({
    ...cert,
    vessel: vessels.find((v) => v.id === cert.vesselId) as any,
  }));

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardSummary vessels={vessels} certificates={certificatesWithVessels} equipment={equipment} />;
      case 'sm':
        return <ShipManagement vessels={vessels} certificates={certificates} />;
      case 'pmt':
        return <CertificateManagement certificates={certificatesWithVessels} vessels={vessels} />;
      case 'uwc':
        return <EquipmentInventory equipment={equipment} />;
      default:
        return <DashboardSummary vessels={vessels} certificates={certificatesWithVessels} equipment={equipment} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          </div>
          <span className="font-bold text-[#002147]">PT Padepokan</span>
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

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 flex flex-col h-screen">
          {/* Top Navbar */}
          <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-40">
            <div className="font-semibold text-gray-700">
              {activeModule === 'dashboard' && 'Dashboard Summary'}
              {activeModule === 'sm' && 'Ship Management'}
              {activeModule === 'pmt' && 'Certificate Data'}
              {activeModule === 'uwc' && 'Equipment Inventory'}
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Notifications</h3>
                    <Button variant="ghost" size="sm" onClick={clearNotifications} className="h-auto p-1 text-xs">Clear All</Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(notif => (
                      <div key={notif.id} className={`p-3 rounded border text-sm ${notif.isRead ? 'bg-gray-50 opacity-70' : 'bg-white'}`}>
                        <div className="flex justify-between">
                          <strong className={notif.type === 'warning' ? 'text-orange-600' : notif.type === 'error' ? 'text-red-600' : 'text-blue-600'}>
                            {notif.title}
                          </strong>
                          {!notif.isRead && <span onClick={() => markNotificationAsRead(notif.id)} className="cursor-pointer text-xs text-blue-500 hover:underline">Mark read</span>}
                        </div>
                        <p className="text-gray-600 mt-1">{notif.message}</p>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* User Role Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <UserCircle className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{userRole}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {['Admin', 'Manager', 'Staff', 'Warehouse', 'Viewer'].map((role) => (
                    <DropdownMenuItem key={role} onClick={() => setUserRole(role as UserRole)} className="justify-between">
                      {role}
                      {userRole === role && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Module Content */}
          <div className="p-6 lg:p-8 flex-1 overflow-y-auto bg-gray-50">
            {renderModule()}
          </div>
        </main>
      </div>

      {/* Toaster placed centrally */}
      <Toaster />
    </div>
  );
}
