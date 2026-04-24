'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Ship, Anchor, Wrench, MapPin, Calendar, FileText } from 'lucide-react';
import { Vessel, VesselStatus, Certificate, CertificateHealthResult } from '@/types/maritime';
import { calculateCertificateHealth, getHealthBadgeColorClass, getStatusColorClass } from '@/lib/certificate-utils';

interface ShipManagementProps {
  vessels: Vessel[];
  certificates: Certificate[];
}

export function ShipManagement({ vessels, certificates }: ShipManagementProps) {
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

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

  return (
    <div className="flex gap-6 h-full">
      {/* Vessel List */}
      <div className="w-1/2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Fleet Overview
            </CardTitle>
            <CardDescription>Track and monitor vessel status</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-4">
                {vessels.map((vessel) => (
                  <div key={vessel.id}>
                    <div
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedVessel?.id === vessel.id
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
                        <Badge className={getStatusColorClass(vessel.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(vessel.status)}
                            {vessel.status}
                          </div>
                        </Badge>
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
      <div className="w-1/2 flex flex-col gap-6">
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
  );
}
