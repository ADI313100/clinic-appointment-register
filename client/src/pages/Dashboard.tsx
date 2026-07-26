import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { data: todaysAppointments, isLoading: loadingTodays } = trpc.appointment.todays.useQuery();
  const { data: pendingFollowUps, isLoading: loadingFollowUps } = trpc.followUp.pending.useQuery();
  const { data: allPatients, isLoading: loadingPatients } = trpc.patient.list.useQuery();
  const { data: allAppointments, isLoading: loadingAppointments } = trpc.appointment.list.useQuery();

  const [stats, setStats] = useState({
    totalPatients: 0,
    noShowRate: 0,
    pendingFollowUps: 0,
    todaysAppointments: 0,
  });

  useEffect(() => {
    if (allPatients && allAppointments && pendingFollowUps) {
      const totalPatients = allPatients.length;
      const noShowCount = allAppointments.filter((a) => a.status === 'no-show').length;
      const noShowRate = allAppointments.length > 0 ? ((noShowCount / allAppointments.length) * 100).toFixed(1) : '0';
      const pendingCount = pendingFollowUps.length;
      const todaysCount = todaysAppointments?.length || 0;

      setStats({
        totalPatients,
        noShowRate: parseFloat(noShowRate),
        pendingFollowUps: pendingCount,
        todaysAppointments: todaysCount,
      });
    }
  }, [allPatients, allAppointments, pendingFollowUps, todaysAppointments]);

  const StatCard = ({ icon: Icon, title, value, unit }: any) => (
    <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <div className="text-3xl font-bold text-gray-900">
              {value}
              {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Clinic Dashboard</h1>
          <p className="text-gray-600">Welcome to your appointment management system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={Users}
            title="Total Patients"
            value={loadingPatients ? <Skeleton className="w-12 h-8" /> : stats.totalPatients}
          />
          <StatCard
            icon={AlertCircle}
            title="No-Show Rate"
            value={loadingAppointments ? <Skeleton className="w-12 h-8" /> : stats.noShowRate}
            unit="%"
          />
          <StatCard
            icon={Calendar}
            title="Pending Follow-ups"
            value={loadingFollowUps ? <Skeleton className="w-12 h-8" /> : stats.pendingFollowUps}
          />
          <StatCard
            icon={CheckCircle}
            title="Today's Appointments"
            value={loadingTodays ? <Skeleton className="w-12 h-8" /> : stats.todaysAppointments}
          />
        </div>

        {/* Today's Appointments Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-900">Today's Appointments</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingTodays ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="w-full h-16" />
                    ))}
                  </div>
                ) : todaysAppointments && todaysAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {todaysAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Patient ID: {appointment.patientId}</p>
                          <p className="text-sm text-gray-600">{appointment.reason}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={`${
                              appointment.status === 'scheduled'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : appointment.status === 'completed'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {appointment.status}
                          </Badge>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(appointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-gray-500">Risk: {(appointment.noShowRiskScore * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No appointments scheduled for today</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending Follow-ups Section */}
          <div>
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-bold text-gray-900">Pending Follow-ups</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingFollowUps ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="w-full h-12" />
                    ))}
                  </div>
                ) : pendingFollowUps && pendingFollowUps.length > 0 ? (
                  <div className="space-y-3">
                    {pendingFollowUps.slice(0, 5).map((followUp) => (
                      <div key={followUp.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-sm font-medium text-gray-900">Appointment {followUp.appointmentId}</p>
                        <p className="text-xs text-gray-600 mt-1">{followUp.notes}</p>
                        <p className="text-xs text-amber-700 mt-2">
                          Due: {new Date(followUp.followUpDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {pendingFollowUps.length > 5 && (
                      <p className="text-xs text-gray-500 text-center py-2">+{pendingFollowUps.length - 5} more</p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No pending follow-ups</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
