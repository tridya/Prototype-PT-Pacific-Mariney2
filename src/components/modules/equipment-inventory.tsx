'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Equipment, EquipmentHistory, EquipmentStatus } from '@/types/maritime';
import { getStatusColorClass } from '@/lib/certificate-utils';

interface EquipmentInventoryProps {
  equipment: Equipment[];
}

type ViewMode = 'warehouse' | 'deployed';

export function EquipmentInventory({ equipment: initialEquipment }: EquipmentInventoryProps) {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('warehouse');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [formData, setFormData] = useState({
    assignee: '',
    project: '',
    vessel: '',
    notes: '',
  });

  const getStatusIcon = (status: EquipmentStatus) => {
    switch (status) {
      case 'Available':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'In Use':
        return <Anchor className="h-4 w-4" />;
      case 'Maintenance':
        return <Settings className="h-4 w-4" />;
      case 'Broken':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const filteredEquipment = equipment.filter((eq) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      eq.name.toLowerCase().includes(searchLower) ||
      eq.type.toLowerCase().includes(searchLower) ||
      eq.serialNumber?.toLowerCase().includes(searchLower);

    const matchesView =
      viewMode === 'warehouse' ? eq.location === 'Warehouse' : eq.location !== 'Warehouse';

    return matchesSearch && matchesView;
  });

  const handleCheckout = () => {
    if (!selectedEquipment) return;

    // Simulate check-out action
    const newHistory: EquipmentHistory = {
      id: `hist-${Date.now()}`,
      equipmentId: selectedEquipment.id,
      action: 'Check Out',
      assignee: formData.assignee,
      project: formData.project,
      vessel: formData.vessel,
      location: formData.vessel,
      notes: formData.notes,
      createdAt: new Date(),
    };

    setEquipment((prev) =>
      prev.map((eq) =>
        eq.id === selectedEquipment.id
          ? {
              ...eq,
              status: 'In Use',
              location: formData.vessel,
              histories: [...eq.histories, newHistory],
            }
          : eq
      )
    );

    toast({
      title: 'Equipment Checked Out',
      description: `${selectedEquipment.name} has been deployed to ${formData.vessel}`,
    });

    setIsCheckoutModalOpen(false);
    setFormData({ assignee: '', project: '', vessel: '', notes: '' });
    setSelectedEquipment(null);
  };

  const handleCheckin = (item: Equipment) => {
    // Simulate check-in action
    const newHistory: EquipmentHistory = {
      id: `hist-${Date.now()}`,
      equipmentId: item.id,
      action: 'Check In',
      assignee: '',
      project: '',
      vessel: '',
      location: 'Warehouse',
      notes: 'Returned from deployment',
      createdAt: new Date(),
    };

    setEquipment((prev) =>
      prev.map((eq) =>
        eq.id === item.id
          ? {
              ...eq,
              status: 'Available',
              location: 'Warehouse',
              histories: [...eq.histories, newHistory],
            }
          : eq
      )
    );

    toast({
      title: 'Equipment Checked In',
      description: `${item.name} has been returned to the warehouse`,
    });
  };

  const openCheckoutModal = (item: Equipment) => {
    setSelectedEquipment(item);
    setIsCheckoutModalOpen(true);
  };

  const warehouseItems = filteredEquipment.filter((eq) => eq.location === 'Warehouse');
  const deployedItems = filteredEquipment.filter((eq) => eq.location !== 'Warehouse');

  const renderEquipmentList = (items: Equipment[], isWarehouse: boolean) => (
    <div className="space-y-4">
      {items.length > 0 ? (
        items.map((item) => (
          <Card key={item.id} className="transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="h-5 w-5 text-gray-600" />
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.type}</p>
                    </div>
                  </div>
                  {item.serialNumber && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Serial:</span> {item.serialNumber}
                    </p>
                  )}
                  {!isWarehouse && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <Anchor className="h-4 w-4" />
                      <span>Deployed to: {item.location}</span>
                    </div>
                  )}
                  {item.histories.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2 font-medium">Last Action:</p>
                      <div className="flex items-center gap-2 text-sm">
                        {item.histories[item.histories.length - 1].action === 'Check Out' ? (
                          <ArrowRight className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ArrowLeft className="h-4 w-4 text-green-600" />
                        )}
                        <span>{item.histories[item.histories.length - 1].action}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.histories[item.histories.length - 1].assignee && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.histories[item.histories.length - 1].assignee}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(item.histories[item.histories.length - 1].createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <Badge className={getStatusColorClass(item.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      {item.status}
                    </div>
                  </Badge>
                  {isWarehouse ? (
                    <Button
                      onClick={() => openCheckoutModal(item)}
                      disabled={item.status !== 'Available'}
                      className="bg-[#002147] hover:bg-[#00152e]"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Check Out
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCheckin(item)}
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Check In
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-12 text-gray-500">
          {isWarehouse ? (
            <div className="flex flex-col items-center">
              <Warehouse className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No equipment in warehouse</p>
              <p className="text-sm">All equipment is deployed or check equipment is needed.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Anchor className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No deployed equipment</p>
              <p className="text-sm">All equipment is in the warehouse.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Equipment Inventory
          </h2>
          <p className="text-gray-600 mt-1">In-Out Management System</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="h-4 w-4" />
          <span>Total: {equipment.length}</span>
          <span className="mx-2">|</span>
          <span>Available: {equipment.filter((e) => e.status === 'Available').length}</span>
          <span className="mx-2">|</span>
          <span>In Use: {equipment.filter((e) => e.status === 'In Use').length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search equipment by name, type, or serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="warehouse" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Warehouse
          </TabsTrigger>
          <TabsTrigger value="deployed" className="flex items-center gap-2">
            <Anchor className="h-4 w-4" />
            Deployed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="warehouse" className="mt-6">
          <ScrollArea className="h-[calc(100vh-26rem)]">
            {renderEquipmentList(warehouseItems, true)}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="deployed" className="mt-6">
          <ScrollArea className="h-[calc(100vh-26rem)]">
            {renderEquipmentList(deployedItems, false)}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Check Out Modal */}
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              Check Out Equipment
            </DialogTitle>
            <DialogDescription>
              Deploy {selectedEquipment?.name} from warehouse to a vessel
            </DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">{selectedEquipment.name}</p>
                    <p className="text-sm text-blue-700">{selectedEquipment.type}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee">
                  <User className="h-4 w-4 inline mr-1" />
                  Assignee Name *
                </Label>
                <Input
                  id="assignee"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">
                  <Building2 className="h-4 w-4 inline mr-1" />
                  Project *
                </Label>
                <Input
                  id="project"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  placeholder="e.g., Pipeline Inspection 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vessel">
                  <Anchor className="h-4 w-4 inline mr-1" />
                  Target Vessel *
                </Label>
                <Input
                  id="vessel"
                  value={formData.vessel}
                  onChange={(e) => setFormData({ ...formData, vessel: e.target.value })}
                  placeholder="e.g., MV Pacific Voyager"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about the deployment..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={!formData.assignee || !formData.project || !formData.vessel}
              className="bg-[#002147] hover:bg-[#00152e]"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Deploy Equipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
