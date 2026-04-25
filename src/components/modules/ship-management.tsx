'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Ship, Anchor, Wrench, MapPin, Calendar, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { Vessel, VesselStatus, Certificate } from '@/types/maritime';
import { calculateCertificateHealth, getHealthBadgeColorClass, getStatusColorClass } from '@/lib/certificate-utils';
import { useMaritimeStore } from '@/store/maritime-store';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ShipManagementProps {
  vessels: Vessel[];
  certificates: Certificate[];
}

export function ShipManagement({ vessels, certificates }: ShipManagementProps) {
  const { toast } = useToast();
  const userRole = useMaritimeStore((state) => state.userRole);
  const isReadOnly = userRole === 'Viewer' || userRole === 'Warehouse';
  const addVessel = useMaritimeStore((state) => state.addVessel);
  const updateVessel = useMaritimeStore((state) => state.updateVessel);
  const deleteVessel = useMaritimeStore((state) => state.deleteVessel);

  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    imoNumber: '',
    type: '',
    status: 'Underway' as VesselStatus,
    latitude: 0,
    longitude: 0,
  });

  const getStatusIcon = (status: VesselStatus) => {
    switch (status) {
      case 'Underway':
        return <Ship className="h-4 w-4" />;
      case 'At Anchor':
        return <Anchor className="h-4 w-4" />;
      case 'Under Repair':
        return <Wrench className="h-4 w-4" />;
      default:
        return <Ship className="h-4 w-4" />;
    }
  };

  const getVesselCertificates = (vesselId: string) => {
    return certificates.filter(cert => cert.vesselId === vesselId);
  };

  const handleOpenModal = (vessel?: Vessel) => {
    if (vessel) {
      setEditingVessel(vessel);
      setFormData({
        name: vessel.name,
        imoNumber: vessel.imoNumber,
        type: vessel.type,
        status: vessel.status,
        latitude: vessel.latitude,
        longitude: vessel.longitude,
      });
    } else {
      setEditingVessel(null);
      setFormData({
        name: '',
        imoNumber: '',
        type: '',
        status: 'Underway',
        latitude: 0,
        longitude: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.type) {
      toast({ title: 'Error', description: 'Name and Type are required', variant: 'destructive' });
      return;
    }
    if (editingVessel) {
      updateVessel(editingVessel.id, {
        name: formData.name,
        imoNumber: formData.imoNumber,
        type: formData.type,
        status: formData.status,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude)
      });
      toast({ title: 'Success', description: 'Vessel updated successfully' });
      if (selectedVessel?.id === editingVessel.id) {
        setSelectedVessel({ ...editingVessel, ...formData, latitude: Number(formData.latitude), longitude: Number(formData.longitude) });
      }
    } else {
      addVessel({
        id: `v${Date.now()}`,
        name: formData.name,
        imoNumber: formData.imoNumber,
        type: formData.type,
        status: formData.status,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast({ title: 'Success', description: 'Vessel created successfully' });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteVessel(id);
    if (selectedVessel?.id === id) setSelectedVessel(null);
    toast({ title: 'Deleted', description: 'Vessel has been removed', variant: 'destructive' });
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Ship className="h-6 w-6 sm:h-8 sm:w-8" />
            Ship Management
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Fleet tracking and management</p>
        </div>
        {!isReadOnly && (
          <Button onClick={() => handleOpenModal()} className="bg-[#002147] hover:bg-[#00152e] w-full sm:w-auto" size="lg">
            <Plus className="h-5 w-5 mr-2" /> Add Vessel
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Vessel List */}
        <div className="w-full lg:w-1/2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Fleet Overview
              </CardTitle>
              <CardDescription>Track and monitor vessel status</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-4">
                  {vessels.map((vessel) => (
                    <div key={vessel.id}>
                      <div
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedVessel?.id === vessel.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                        onClick={() => setSelectedVessel(vessel)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{vessel.name}</h3>
                            <p className="text-sm text-gray-600">{vessel.type}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColorClass(vessel.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(vessel.status)}
                                {vessel.status}
                              </div>
                            </Badge>
                            {!isReadOnly && (
                              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenModal(vessel)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete(vessel.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {vessel.latitude.toFixed(4)}, {vessel.longitude.toFixed(4)}
                            </span>
                          </div>
                          {vessel.imoNumber && (
                            <div className="text-gray-600">
                              <span className="font-medium">IMO:</span> {vessel.imoNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Vessel Details & Map */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          {/* Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {selectedVessel ? selectedVessel.name : 'Select a Vessel'}
              </CardTitle>
              <CardDescription>Real-time GPS tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Ship className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Interactive Map</p>
                  <p className="text-sm opacity-75">Real-time vessel positioning</p>
                  {selectedVessel && (
                    <div className="mt-4 p-3 bg-black/20 rounded">
                      <p className="text-sm font-mono">
                        Lat: {selectedVessel.latitude.toFixed(6)} | Lon: {selectedVessel.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Health Check */}
          {selectedVessel && (
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Compliance Health Check
                </CardTitle>
                <CardDescription>Certificate expiry monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {getVesselCertificates(selectedVessel.id).length > 0 ? (
                      getVesselCertificates(selectedVessel.id).map((cert) => {
                        const health = calculateCertificateHealth(new Date(cert.expiryDate));
                        return (
                          <div
                            key={cert.id}
                            className={`p-3 rounded-lg border ${getHealthBadgeColorClass(
                              health.health
                            )}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold">{cert.type}</p>
                                <p className="text-sm opacity-90">{cert.certificateNumber}</p>
                              </div>
                              <Badge className={getHealthBadgeColorClass(health.health)}>
                                {health.daysRemaining > 0
                                  ? `${health.daysRemaining} days`
                                  : 'Expired'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm opacity-90">
                              <Calendar className="h-3 w-3" />
                              <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                            </div>
                            <div className="text-sm opacity-90 mt-1">
                              Issuing Authority: {cert.issuingAuthority}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-center py-4">No certificates on record</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVessel ? 'Edit Vessel' : 'Add Vessel'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
              <Label className="text-left sm:text-right">Name *</Label>
              <Input className="col-span-1 sm:col-span-3" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
              <Label className="text-left sm:text-right">IMO</Label>
              <Input className="col-span-1 sm:col-span-3" value={formData.imoNumber} onChange={e => setFormData({ ...formData, imoNumber: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
              <Label className="text-left sm:text-right">Type *</Label>
              <Input className="col-span-1 sm:col-span-3" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
              <Label className="text-left sm:text-right">Status</Label>
              <select className="col-span-1 sm:col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as VesselStatus })}>
                <option value="Underway">Underway</option>
                <option value="At Anchor">At Anchor</option>
                <option value="Under Repair">Under Repair</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
              <Label className="text-left sm:text-right">Lat</Label>
              <Input className="col-span-1 sm:col-span-3" type="number" step="0.0001" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: Number(e.target.value) })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
              <Label className="text-left sm:text-right">Lon</Label>
              <Input className="col-span-1 sm:col-span-3" type="number" step="0.0001" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#002147] hover:bg-[#00152e]">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
