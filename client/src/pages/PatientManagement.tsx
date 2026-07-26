import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientManagement() {
  const { data: patients, isLoading, refetch } = trpc.patient.list.useQuery();
  const createMutation = trpc.patient.create.useMutation();
  const updateMutation = trpc.patient.update.useMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    dateOfBirth: '',
    medicalHistoryNotes: '',
  });

  const filteredPatients = patients?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contactNumber?.includes(searchTerm)
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPatient) {
        await updateMutation.mutateAsync({
          id: editingPatient.id,
          ...formData,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        });
        toast.success('Patient updated successfully');
      } else {
        await createMutation.mutateAsync({
          ...formData,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        });
        toast.success('Patient created successfully');
      }

      setFormData({
        name: '',
        contactNumber: '',
        email: '',
        dateOfBirth: '',
        medicalHistoryNotes: '',
      });
      setEditingPatient(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to save patient');
    }
  };

  const handleEdit = (patient: any) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      contactNumber: patient.contactNumber || '',
      email: patient.email || '',
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
      medicalHistoryNotes: patient.medicalHistoryNotes || '',
    });
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingPatient(null);
      setFormData({
        name: '',
        contactNumber: '',
        email: '',
        dateOfBirth: '',
        medicalHistoryNotes: '',
      });
    }
    setIsOpen(open);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Patient Management</h1>
            <p className="text-gray-600">Manage patient profiles and medical history</p>
          </div>

          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="555-0123"
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="medicalHistoryNotes">Medical History Notes</Label>
                  <Textarea
                    id="medicalHistoryNotes"
                    value={formData.medicalHistoryNotes}
                    onChange={(e) => setFormData({ ...formData, medicalHistoryNotes: e.target.value })}
                    placeholder="Allergies, conditions, medications..."
                    className="h-24"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {editingPatient ? 'Update' : 'Create'} Patient
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">Loading patients...</p>
            </div>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <Card key={patient.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-gray-900">{patient.name}</CardTitle>
                  <p className="text-sm text-gray-500">ID: {patient.id}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patient.email && (
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{patient.email}</p>
                    </div>
                  )}

                  {patient.contactNumber && (
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{patient.contactNumber}</p>
                    </div>
                  )}

                  {patient.dateOfBirth && (
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="text-sm text-gray-900">
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {patient.medicalHistoryNotes && (
                    <div>
                      <p className="text-xs text-gray-500">Medical History</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{patient.medicalHistoryNotes}</p>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <Button
                      onClick={() => handleEdit(patient)}
                      variant="outline"
                      className="w-full text-sm"
                    >
                      Edit Patient
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No patients found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
