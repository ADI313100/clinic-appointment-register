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
import { Plus, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AppointmentScheduling() {
  const { data: appointments, isLoading, refetch } = trpc.appointment.list.useQuery();
  const { data: patients } = trpc.patient.list.useQuery();
  const { data: doctors } = trpc.doctor.list.useQuery();
  const createMutation = trpc.appointment.create.useMutation();
  const updateMutation = trpc.appointment.update.useMutation();
  const cancelMutation = trpc.appointment.cancel.useMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDateTime: '',
    reason: '',
    status: 'scheduled' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAppointment) {
        await updateMutation.mutateAsync({
          id: editingAppointment.id,
          patientId: parseInt(formData.patientId),
          doctorId: parseInt(formData.doctorId),
          appointmentDateTime: new Date(formData.appointmentDateTime),
          reason: formData.reason,
          status: formData.status,
        });
        toast.success('Appointment updated successfully');
      } else {
        await createMutation.mutateAsync({
          patientId: parseInt(formData.patientId),
          doctorId: parseInt(formData.doctorId),
          appointmentDateTime: new Date(formData.appointmentDateTime),
          reason: formData.reason,
          status: 'scheduled',
        });
        toast.success('Appointment created successfully');
      }

      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDateTime: '',
        reason: '',
        status: 'scheduled',
      });
      setEditingAppointment(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to save appointment');
    }
  };

  const handleCancel = async (appointmentId: number) => {
    try {
      await cancelMutation.mutateAsync({ id: appointmentId });
      toast.success('Appointment cancelled successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      appointmentDateTime: new Date(appointment.appointmentDateTime).toISOString().slice(0, 16),
      reason: appointment.reason || '',
      status: appointment.status,
    });
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingAppointment(null);
      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDateTime: '',
        reason: '',
        status: 'scheduled',
      });
    }
    setIsOpen(open);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'no-show':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Appointment Scheduling</h1>
            <p className="text-gray-600">Schedule and manage patient appointments</p>
          </div>

          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="patientId">Patient *</Label>
                  <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
                    <SelectTrigger id="patientId">
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients?.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="doctorId">Doctor *</Label>
                  <Select value={formData.doctorId} onValueChange={(value) => setFormData({ ...formData, doctorId: value })}>
                    <SelectTrigger id="doctorId">
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors?.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="appointmentDateTime">Date & Time *</Label>
                  <Input
                    id="appointmentDateTime"
                    type="datetime-local"
                    value={formData.appointmentDateTime}
                    onChange={(e) => setFormData({ ...formData, appointmentDateTime: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Input
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="e.g., General checkup, Follow-up"
                  />
                </div>

                {editingAppointment && (
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="no-show">No-Show</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {editingAppointment ? 'Update' : 'Schedule'} Appointment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments List */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-900">All Appointments</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-center text-gray-500 py-8">Loading appointments...</p>
            ) : appointments && appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="font-medium text-gray-900">
                          {new Date(appointment.appointmentDateTime).toLocaleDateString()}
                        </p>
                        <Clock className="w-4 h-4 text-gray-400 ml-2" />
                        <p className="text-gray-600">
                          {new Date(appointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Patient ID: {appointment.patientId} | Doctor ID: {appointment.doctorId}
                      </p>
                      {appointment.reason && <p className="text-sm text-gray-600">{appointment.reason}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant="outline" className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">Risk: {(appointment.noShowRiskScore * 100).toFixed(0)}%</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(appointment)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Edit
                        </Button>
                        {appointment.status === 'scheduled' && (
                          <Button
                            onClick={() => handleCancel(appointment.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No appointments scheduled</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
