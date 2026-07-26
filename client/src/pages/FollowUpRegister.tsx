import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FollowUpRegister() {
  const { data: followUps, isLoading, refetch } = trpc.followUp.list.useQuery();
  const { data: appointments } = trpc.appointment.list.useQuery();
  const createMutation = trpc.followUp.create.useMutation();
  const updateMutation = trpc.followUp.update.useMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<any>(null);
  const [formData, setFormData] = useState({
    appointmentId: '',
    followUpDate: '',
    status: 'pending' as const,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingFollowUp) {
        await updateMutation.mutateAsync({
          id: editingFollowUp.id,
          appointmentId: parseInt(formData.appointmentId),
          followUpDate: new Date(formData.followUpDate),
          status: formData.status,
          notes: formData.notes,
        });
        toast.success('Follow-up updated successfully');
      } else {
        await createMutation.mutateAsync({
          appointmentId: parseInt(formData.appointmentId),
          followUpDate: new Date(formData.followUpDate),
          status: 'pending',
          notes: formData.notes,
        });
        toast.success('Follow-up created successfully');
      }

      setFormData({
        appointmentId: '',
        followUpDate: '',
        status: 'pending',
        notes: '',
      });
      setEditingFollowUp(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to save follow-up');
    }
  };

  const handleEdit = (followUp: any) => {
    setEditingFollowUp(followUp);
    setFormData({
      appointmentId: followUp.appointmentId.toString(),
      followUpDate: new Date(followUp.followUpDate).toISOString().split('T')[0],
      status: followUp.status,
      notes: followUp.notes || '',
    });
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingFollowUp(null);
      setFormData({
        appointmentId: '',
        followUpDate: '',
        status: 'pending',
        notes: '',
      });
    }
    setIsOpen(open);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Calendar className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Group follow-ups by status
  const pendingFollowUps = followUps?.filter((f) => f.status === 'pending') || [];
  const completedFollowUps = followUps?.filter((f) => f.status === 'completed') || [];
  const overdueFollowUps = followUps?.filter((f) => f.status === 'overdue') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Follow-Up Register</h1>
            <p className="text-gray-600">Track and manage patient follow-up appointments</p>
          </div>

          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Create Follow-up
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingFollowUp ? 'Edit Follow-up' : 'Create New Follow-up'}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="appointmentId">Appointment *</Label>
                  <Select value={formData.appointmentId} onValueChange={(value) => setFormData({ ...formData, appointmentId: value })}>
                    <SelectTrigger id="appointmentId">
                      <SelectValue placeholder="Select an appointment" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointments?.map((appointment) => (
                        <SelectItem key={appointment.id} value={appointment.id.toString()}>
                          Apt #{appointment.id} - Patient {appointment.patientId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="followUpDate">Follow-up Date *</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Follow-up instructions or notes..."
                    className="h-20"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {editingFollowUp ? 'Update' : 'Create'} Follow-up
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-amber-600">{pendingFollowUps.length}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedFollowUps.length}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Overdue</p>
                  <p className="text-3xl font-bold text-red-600">{overdueFollowUps.length}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Follow-ups List */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-900">All Follow-ups</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-center text-gray-500 py-8">Loading follow-ups...</p>
            ) : followUps && followUps.length > 0 ? (
              <div className="space-y-3">
                {followUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(followUp.status)}
                        <p className="font-medium text-gray-900">Appointment #{followUp.appointmentId}</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Follow-up Date: {new Date(followUp.followUpDate).toLocaleDateString()}
                      </p>
                      {followUp.notes && <p className="text-sm text-gray-700 mt-1">{followUp.notes}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getStatusColor(followUp.status)}>
                        {followUp.status}
                      </Badge>

                      <Button
                        onClick={() => handleEdit(followUp)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No follow-ups recorded</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
