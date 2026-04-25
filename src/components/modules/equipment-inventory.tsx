'use client';

import { useState } from 'react';
import { useMaritimeStore } from '@/store/maritime-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Package,
  ArrowRight,
  ArrowLeft,
  Search,
  Warehouse,
  Anchor,
  User,
  Building2,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { Equipment, EquipmentHistory, EquipmentStatus } from '@/types/maritime';
import { getStatusColorClass } from '@/lib/certificate-utils';
import * as XLSX from 'xlsx';

interface EquipmentInventoryProps {
  equipment: Equipment[];
}

type ViewMode = 'warehouse' | 'deployed';

export function EquipmentInventory({ equipment }: EquipmentInventoryProps) {
  const { toast } = useToast();
  const userRole = useMaritimeStore((state) => state.userRole);
  const updateEquipment = useMaritimeStore((state) => state.updateEquipment);
  const addEquipment = useMaritimeStore((state) => state.addEquipment);
  const deleteEquipment = useMaritimeStore((state) => state.deleteEquipment);
  const isReadOnly = userRole === 'Viewer';
  
  const [viewMode, setViewMode] = useState<ViewMode>('warehouse');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Checkout Modal
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [checkoutData, setCheckoutData] = useState({ assignee: '', project: '', vessel: '', notes: '' });

  // Add/Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editData, setEditData] = useState({ name: '', type: '', serialNumber: '', status: 'Available' as EquipmentStatus });

  const getStatusIcon = (status: EquipmentStatus) => {
    switch (status) {
      case 'Available': return <CheckCircle2 className="h-4 w-4" />;
      case 'In Use': return <Anchor className="h-4 w-4" />;
      case 'Maintenance': return <Settings className="h-4 w-4" />;
      case 'Broken': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const filteredEquipment = equipment.filter((eq) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = eq.name.toLowerCase().includes(searchLower) || eq.type.toLowerCase().includes(searchLower) || eq.serialNumber?.toLowerCase().includes(searchLower);
    const matchesView = viewMode === 'warehouse' ? eq.location === 'Warehouse' : eq.location !== 'Warehouse';
    return matchesSearch && matchesView;
  });

  const handleCheckout = () => {
    if (!selectedEquipment) return;
    const newHistory: EquipmentHistory = {
      id: `hist-${Date.now()}`,
      equipmentId: selectedEquipment.id,
      action: 'Check Out',
      assignee: checkoutData.assignee,
      project: checkoutData.project,
      vessel: checkoutData.vessel,
      location: checkoutData.vessel,
      notes: checkoutData.notes,
      createdAt: new Date(),
    };
    updateEquipment(selectedEquipment.id, {
      status: 'In Use',
      location: checkoutData.vessel,
      histories: [newHistory, ...selectedEquipment.histories]
    });
    toast({ title: 'Equipment Checked Out', description: `${selectedEquipment.name} deployed.` });
    setIsCheckoutModalOpen(false);
    setCheckoutData({ assignee: '', project: '', vessel: '', notes: '' });
  };

  const handleCheckin = (item: Equipment) => {
    const newHistory: EquipmentHistory = {
      id: `hist-${Date.now()}`,
      equipmentId: item.id,
      action: 'Check In',
      assignee: '', project: '', vessel: '',
      location: 'Warehouse',
      notes: 'Returned from deployment',
      createdAt: new Date(),
    };
    updateEquipment(item.id, {
      status: 'Available',
      location: 'Warehouse',
      histories: [newHistory, ...item.histories]
    });
    toast({ title: 'Equipment Checked In', description: `${item.name} returned.` });
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(equipment.map(e => ({
      ID: e.id,
      Name: e.name,
      Type: e.type,
      Status: e.status,
      Location: e.location,
      SerialNumber: e.serialNumber
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipment");
    XLSX.writeFile(wb, "Equipment_Inventory.xlsx");
    toast({ title: 'Export Complete', description: 'Equipment downloaded.' });
  };

  const handleOpenEdit = (item?: Equipment) => {
    if (item) {
      setEditingEquipment(item);
      setEditData({ name: item.name, type: item.type, serialNumber: item.serialNumber || '', status: item.status });
    } else {
      setEditingEquipment(null);
      setEditData({ name: '', type: '', serialNumber: '', status: 'Available' });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editData.name || !editData.type) {
      toast({ title: 'Error', description: 'Name and Type are required', variant: 'destructive' });
      return;
    }
    if (editingEquipment) {
      updateEquipment(editingEquipment.id, {
        name: editData.name, type: editData.type, serialNumber: editData.serialNumber, status: editData.status
      });
      toast({ title: 'Updated', description: 'Equipment updated successfully.' });
    } else {
      addEquipment({
        id: `e${Date.now()}`,
        name: editData.name, type: editData.type, serialNumber: editData.serialNumber, status: editData.status,
        location: 'Warehouse', purchaseDate: new Date(), lastMaintenance: new Date(), histories: [], createdAt: new Date(), updatedAt: new Date()
      });
      toast({ title: 'Created', description: 'Equipment created successfully.' });
    }
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteEquipment(id);
    toast({ title: 'Deleted', description: 'Equipment removed.', variant: 'destructive' });
  };

  const changeStatus = (id: string, status: EquipmentStatus) => {
    updateEquipment(id, { status });
    toast({ title: 'Status Updated', description: `Status changed to ${status}.` });
  };

  const warehouseItems = filteredEquipment.filter((eq) => eq.location === 'Warehouse');
  const deployedItems = filteredEquipment.filter((eq) => eq.location !== 'Warehouse');

  const renderEquipmentList = (items: Equipment[], isWarehouse: boolean) => (
    <div className="space-y-4">
      {items.length > 0 ? items.map((item) => (
        <Card key={item.id} className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.type}</p>
                  </div>
                </div>
                {item.serialNumber && <p className="text-sm text-gray-600"><span className="font-medium">Serial:</span> {item.serialNumber}</p>}
                {!isWarehouse && <div className="flex items-center gap-2 text-sm text-gray-600 mt-2"><Anchor className="h-4 w-4" /><span>Deployed to: {item.location}</span></div>}
              </div>
              <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto">
                <Badge className={getStatusColorClass(item.status)}>
                  <div className="flex items-center gap-1">{getStatusIcon(item.status)}{item.status}</div>
                </Badge>
                {!isReadOnly && (
                  <div className="flex gap-2 items-center">
                    {isWarehouse && item.status === 'Available' && (
                      <Button onClick={() => { setSelectedEquipment(item); setIsCheckoutModalOpen(true); }} className="bg-[#002147] hover:bg-[#00152e] h-8">
                        <ArrowRight className="h-4 w-4 mr-2" /> Check Out
                      </Button>
                    )}
                    {!isWarehouse && item.status === 'In Use' && (
                      <Button onClick={() => handleCheckin(item)} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 h-8">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Check In
                      </Button>
                    )}
                    {isWarehouse && (
                      <>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                      </>
                    )}
                  </div>
                )}
                {!isReadOnly && isWarehouse && (
                  <div className="flex gap-2 mt-2">
                    {item.status === 'Available' && <Button variant="ghost" size="sm" onClick={() => changeStatus(item.id, 'Maintenance')} className="text-orange-500 text-xs">Set Maintenance</Button>}
                    {item.status === 'Maintenance' && <Button variant="ghost" size="sm" onClick={() => changeStatus(item.id, 'Available')} className="text-green-500 text-xs">Fix Complete</Button>}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )) : (
        <div className="text-center py-12 text-gray-500">
          <Warehouse className="h-12 w-12 mb-4 mx-auto opacity-50" />
          <p className="text-lg font-medium">No equipment found</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><Package className="h-6 w-6 sm:h-8 sm:w-8" /> Equipment Inventory</h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">In-Out Management System</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button onClick={handleExport} variant="outline" className="flex-1 sm:flex-none"><Download className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Export</span></Button>
          {!isReadOnly && <Button onClick={() => handleOpenEdit()} className="bg-[#002147] flex-1 sm:flex-none"><Plus className="h-4 w-4 mr-2" /> Add Item</Button>}
        </div>
      </div>

      <Card><CardContent className="pt-6"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" /><Input placeholder="Search equipment..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div></CardContent></Card>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="warehouse" className="flex items-center gap-2"><Warehouse className="h-4 w-4" /> Warehouse</TabsTrigger>
          <TabsTrigger value="deployed" className="flex items-center gap-2"><Anchor className="h-4 w-4" /> Deployed</TabsTrigger>
        </TabsList>
        <TabsContent value="warehouse" className="mt-6"><ScrollArea className="h-[calc(100vh-26rem)]">{renderEquipmentList(warehouseItems, true)}</ScrollArea></TabsContent>
        <TabsContent value="deployed" className="mt-6"><ScrollArea className="h-[calc(100vh-26rem)]">{renderEquipmentList(deployedItems, false)}</ScrollArea></TabsContent>
      </Tabs>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Check Out Equipment</DialogTitle></DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Assignee Name *</Label><Input value={checkoutData.assignee} onChange={(e) => setCheckoutData({ ...checkoutData, assignee: e.target.value })} /></div>
              <div className="space-y-2"><Label>Project *</Label><Input value={checkoutData.project} onChange={(e) => setCheckoutData({ ...checkoutData, project: e.target.value })} /></div>
              <div className="space-y-2"><Label>Target Vessel *</Label><Input value={checkoutData.vessel} onChange={(e) => setCheckoutData({ ...checkoutData, vessel: e.target.value })} /></div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={checkoutData.notes} onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })} rows={3} /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setIsCheckoutModalOpen(false)}>Cancel</Button><Button onClick={handleCheckout} className="bg-[#002147]">Deploy Equipment</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingEquipment ? 'Edit Equipment' : 'Add Equipment'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Type *</Label><Input value={editData.type} onChange={(e) => setEditData({ ...editData, type: e.target.value })} /></div>
            <div className="space-y-2"><Label>Serial Number</Label><Input value={editData.serialNumber} onChange={(e) => setEditData({ ...editData, serialNumber: e.target.value })} /></div>
            {editingEquipment && (
              <div className="space-y-2"><Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border bg-background px-3" value={editData.status} onChange={e => setEditData({...editData, status: e.target.value as EquipmentStatus})}>
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Broken">Broken</option>
                  <option value="In Use">In Use</option>
                </select>
              </div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button onClick={handleSaveEdit} className="bg-[#002147]">Save Equipment</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
