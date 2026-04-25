'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Vault, Package, AlertTriangle, CheckCircle2, Wrench, Anchor, Settings } from 'lucide-react';
import { Vessel, CertificateWithVessel, Equipment } from '@/types/maritime';
import { calculateCertificateHealth } from '@/lib/certificate-utils';
import { useMaritimeStore } from '@/store/maritime-store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DashboardSummaryProps {
  vessels: Vessel[];
  certificates: CertificateWithVessel[];
  equipment: Equipment[];
}

export function DashboardSummary({ vessels, certificates, equipment }: DashboardSummaryProps) {
  const setActiveModule = useMaritimeStore(state => state.setActiveModule);

  // Calculations
  const activeVessels = vessels.filter(v => v.status === 'Underway' || v.status === 'At Anchor').length;
  
  const expiringCertificates = certificates.filter(cert => {
    const health = calculateCertificateHealth(new Date(cert.expiryDate));
    return health.health === 'critical' || health.health === 'warning';
  }).length;

  const equipmentInUse = equipment.filter(e => e.status === 'In Use').length;
  const equipmentMaintenance = equipment.filter(e => e.status === 'Maintenance' || e.status === 'Broken').length;

  // Chart Data
  const equipmentStatusData = [
    { name: 'Available', value: equipment.filter(e => e.status === 'Available').length, color: '#10b981' }, // green
    { name: 'In Use', value: equipmentInUse, color: '#3b82f6' }, // blue
    { name: 'Maintenance', value: equipment.filter(e => e.status === 'Maintenance').length, color: '#f59e0b' }, // orange
    { name: 'Broken', value: equipment.filter(e => e.status === 'Broken').length, color: '#ef4444' } // red
  ].filter(d => d.value > 0);

  const vesselStatusData = [
    { name: 'Underway', count: vessels.filter(v => v.status === 'Underway').length },
    { name: 'At Anchor', count: vessels.filter(v => v.status === 'At Anchor').length },
    { name: 'Under Repair', count: vessels.filter(v => v.status === 'Under Repair').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            Dashboard Summary
          </h2>
          <p className="text-gray-600 mt-1">Overview of your maritime operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Vessels */}
        <Card className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveModule('sm')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Vessels</CardTitle>
            <Ship className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVessels}</div>
            <p className="text-xs text-gray-500 mt-1">out of {vessels.length} total vessels</p>
          </CardContent>
        </Card>

        {/* Expiring Certificates */}
        <Card className="border-l-4 border-l-red-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveModule('pmt')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Expiring Certificates</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiringCertificates}</div>
            <p className="text-xs text-gray-500 mt-1">require immediate attention</p>
          </CardContent>
        </Card>

        {/* Equipment In Use */}
        <Card className="border-l-4 border-l-green-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveModule('uwc')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Equipment Deployed</CardTitle>
            <Anchor className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipmentInUse}</div>
            <p className="text-xs text-gray-500 mt-1">currently active on vessels</p>
          </CardContent>
        </Card>

        {/* Equipment Maintenance */}
        <Card className="border-l-4 border-l-orange-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveModule('uwc')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Maintenance/Broken</CardTitle>
            <Wrench className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{equipmentMaintenance}</div>
            <p className="text-xs text-gray-500 mt-1">unavailable for deployment</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Vessel Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vesselStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#002147" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Equipment Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={equipmentStatusData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {equipmentStatusData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip />
                   <Legend />
                 </PieChart>
               </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
