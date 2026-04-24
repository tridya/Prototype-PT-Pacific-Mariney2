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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Vault,
  Plus,
  Edit,
  Copy,
  Search,
  FileText,
  Calendar,
  Building2,
} from 'lucide-react';
import { Certificate, CertificateWithVessel, Vessel } from '@/types/maritime';
import { calculateCertificateHealth, getHealthBadgeColorClass } from '@/lib/certificate-utils';

interface CertificateManagementProps {
  certificates: CertificateWithVessel[];
  vessels: Vessel[];
}

export function CertificateManagement({
  certificates,
  vessels,
}: CertificateManagementProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    certificateNumber: '',
    vesselId: '',
    type: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    notes: '',
  });

  const filteredCertificates = certificates.filter((cert) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      cert.certificateNumber.toLowerCase().includes(searchLower) ||
      cert.type.toLowerCase().includes(searchLower) ||
      cert.issuingAuthority.toLowerCase().includes(searchLower) ||
      cert.vessel.name.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenModal = (certificate?: Certificate) => {
    if (certificate) {
      setEditingCertificate(certificate);
      setFormData({
        certificateNumber: certificate.certificateNumber,
        vesselId: certificate.vesselId,
        type: certificate.type,
        issuingAuthority: certificate.issuingAuthority,
        issueDate: certificate.issueDate.toISOString().split('T')[0],
        expiryDate: certificate.expiryDate.toISOString().split('T')[0],
        notes: certificate.notes || '',
      });
    } else {
      setEditingCertificate(null);
      setFormData({
        certificateNumber: '',
        vesselId: '',
        type: '',
        issuingAuthority: '',
        issueDate: '',
        expiryDate: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    // Simulate save action
    toast({
      title: editingCertificate ? 'Certificate Updated' : 'Certificate Created',
      description: `Certificate ${formData.certificateNumber} has been ${editingCertificate ? 'updated' : 'created'} successfully.`,
    });
    setIsModalOpen(false);
  };

  const handleCopy = (certificate: Certificate) => {
    // Simulate copy action
    toast({
      title: 'Certificate Copied',
      description: `${certificate.certificateNumber} (Copy) has been created.`,
    });
  };

  const handleDelete = (certificate: Certificate) => {
    // Simulate delete action
    toast({
      title: 'Certificate Deleted',
      description: `${certificate.certificateNumber} has been removed.`,
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Vault className="h-8 w-8" />
            Digital Vault
          </h2>
          <p className="text-gray-600 mt-1">Certificate Data Management</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[#002147] hover:bg-[#00152e]"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Certificate
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by certificate number, type, authority, or vessel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Certificate Table */}
      <Card>
        <CardHeader>
          <CardTitle>Certificates</CardTitle>
          <CardDescription>
            {filteredCertificates.length} certificate(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-24rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead>Issuing Authority</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map((cert) => {
                  const health = calculateCertificateHealth(new Date(cert.expiryDate));
                  return (
                    <TableRow key={cert.id} className={cert.isCopy ? 'bg-gray-50' : ''}>
                      <TableCell className="font-medium">
                        {cert.certificateNumber}
                        {cert.isCopy && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Copy
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{cert.type}</TableCell>
                      <TableCell>{cert.vessel.name}</TableCell>
                      <TableCell>{cert.issuingAuthority}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(cert.issueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(cert.expiryDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getHealthBadgeColorClass(health.health)}>
                          {health.daysRemaining > 0 ? `${health.daysRemaining} days` : 'Expired'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenModal(cert)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(cert)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredCertificates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No certificates found. Add your first certificate to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingCertificate ? 'Edit Certificate' : 'Add Certificate'}
            </DialogTitle>
            <DialogDescription>
              {editingCertificate
                ? 'Update the certificate information below.'
                : 'Fill in the details to add a new certificate to the vault.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certificateNumber">Certificate Number *</Label>
                <Input
                  id="certificateNumber"
                  value={formData.certificateNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, certificateNumber: e.target.value })
                  }
                  placeholder="e.g., IOPP-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Certificate Type *</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., IOPP Certificate"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vesselId">Vessel *</Label>
              <select
                id="vesselId"
                value={formData.vesselId}
                onChange={(e) => setFormData({ ...formData, vesselId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a vessel...</option>
                {vessels.map((vessel) => (
                  <option key={vessel.id} value={vessel.id}>
                    {vessel.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issuingAuthority">Issuing Authority *</Label>
                <Input
                  id="issuingAuthority"
                  value={formData.issuingAuthority}
                  onChange={(e) =>
                    setFormData({ ...formData, issuingAuthority: e.target.value })
                  }
                  placeholder="e.g., BKI, ABS, LR"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, issueDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or remarks..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#002147] hover:bg-[#00152e]"
            >
              {editingCertificate ? 'Update Certificate' : 'Create Certificate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
