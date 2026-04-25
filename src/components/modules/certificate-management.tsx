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
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import { Certificate, CertificateWithVessel, Vessel } from '@/types/maritime';
import { calculateCertificateHealth, getHealthBadgeColorClass } from '@/lib/certificate-utils';
import * as XLSX from 'xlsx';

interface CertificateManagementProps {
  certificates: CertificateWithVessel[];
  vessels: Vessel[];
}

export function CertificateManagement({
  certificates,
  vessels,
}: CertificateManagementProps) {
  const { toast } = useToast();
  const userRole = useMaritimeStore((state) => state.userRole);
  const addCertificate = useMaritimeStore((state) => state.addCertificate);
  const updateCertificate = useMaritimeStore((state) => state.updateCertificate);
  const deleteCertificate = useMaritimeStore((state) => state.deleteCertificate);
  const isReadOnly = userRole === 'Viewer' || userRole === 'Warehouse';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    certificateNumber: '',
    vesselId: '',
    type: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    notes: '',
    attachmentUrl: '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, attachmentUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadCert = (cert: Certificate) => {
    if (!cert.attachmentUrl) {
      toast({ title: 'No Attachment', description: 'This certificate has no file attached.', variant: 'destructive' });
      return;
    }
    const a = document.createElement('a');
    a.href = cert.attachmentUrl;
    a.download = `Certificate_${cert.certificateNumber}.png`;
    a.click();
  };

  const filteredCertificates = certificates.filter((cert) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      cert.certificateNumber.toLowerCase().includes(searchLower) ||
      cert.type.toLowerCase().includes(searchLower) ||
      cert.issuingAuthority.toLowerCase().includes(searchLower) ||
      cert.vessel?.name?.toLowerCase().includes(searchLower)
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
        attachmentUrl: certificate.attachmentUrl || '',
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
        attachmentUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.certificateNumber || !formData.type || !formData.vesselId || !formData.issueDate || !formData.expiryDate) {
      toast({ title: 'Error', description: 'Please fill in all required fields (*).', variant: 'destructive' });
      return;
    }

    if (editingCertificate) {
      updateCertificate(editingCertificate.id, {
        certificateNumber: formData.certificateNumber,
        type: formData.type,
        vesselId: formData.vesselId,
        issuingAuthority: formData.issuingAuthority,
        issueDate: new Date(formData.issueDate),
        expiryDate: new Date(formData.expiryDate),
        notes: formData.notes,
        attachmentUrl: formData.attachmentUrl
      });
      toast({
        title: 'Certificate Updated',
        description: `Certificate ${formData.certificateNumber} has been updated successfully.`,
      });
    } else {
      addCertificate({
        id: `c${Date.now()}`,
        certificateNumber: formData.certificateNumber,
        type: formData.type,
        vesselId: formData.vesselId,
        issuingAuthority: formData.issuingAuthority,
        issueDate: new Date(formData.issueDate),
        expiryDate: new Date(formData.expiryDate),
        notes: formData.notes,
        attachmentUrl: formData.attachmentUrl,
        version: 1,
        isCopy: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast({
        title: 'Certificate Created',
        description: `Certificate ${formData.certificateNumber} has been created successfully.`,
      });
    }
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(certificates.map(c => ({
      'Certificate Number': c.certificateNumber,
      'Type': c.type,
      'Vessel': c.vessel?.name || 'Unknown',
      'Issuing Authority': c.issuingAuthority,
      'Issue Date': new Date(c.issueDate).toLocaleDateString(),
      'Expiry Date': new Date(c.expiryDate).toLocaleDateString(),
      'Notes': c.notes || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Certificates");
    XLSX.writeFile(wb, "Certificates_Report.xlsx");
    toast({
      title: 'Export Complete',
      description: 'The certificate report has been downloaded.',
    });
  };

  const handlePreview = (cert: Certificate) => {
    setPreviewCert(cert);
    setIsPreviewOpen(true);
  };

  const handleCopy = (certificate: Certificate) => {
    addCertificate({
      ...certificate,
      id: `c${Date.now()}`,
      isCopy: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    toast({
      title: 'Certificate Copied',
      description: `${certificate.certificateNumber} (Copy) has been created.`,
    });
  };

  const handleDelete = (certificate: Certificate) => {
    deleteCertificate(certificate.id);
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
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="hidden sm:flex">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {!isReadOnly && (
            <Button
              onClick={() => handleOpenModal()}
              className="bg-[#002147] hover:bg-[#00152e]"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Certificate
            </Button>
          )}
        </div>
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
                      <TableCell>{cert.vessel?.name || 'Unknown Vessel'}</TableCell>
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
                          <Button variant="outline" size="sm" onClick={() => handleDownloadCert(cert)} title="Download Attachment">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handlePreview(cert)} title="Preview Document">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!isReadOnly && (
                            <>
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(cert)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">Attachment (Image)</Label>
              <Input
                id="attachment"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
              />
              {formData.attachmentUrl && (
                <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Image attached successfully
                </div>
              )}
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

      {/* Document Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Document Preview - {previewCert?.certificateNumber}</DialogTitle>
            <DialogDescription>Viewing certificate document</DialogDescription>
          </DialogHeader>
          <div className="flex-1 bg-gray-100 flex items-center justify-center rounded-md border border-dashed overflow-hidden">
            {previewCert?.attachmentUrl ? (
              <img src={previewCert.attachmentUrl} alt="Certificate Attachment" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-center text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-2 opacity-20" />
                <p>No Attachment Found</p>
                <p className="text-xs mt-2">Upload an image when editing the certificate.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
