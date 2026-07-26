import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Calendar, Users, ClipboardList, BarChart3, LogOut } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Clinic Appointment Register</h1>
          <p className="text-xl text-gray-600 mb-8">
            Streamlined appointment management with intelligent no-show prediction
          </p>
          <Button
            onClick={() => window.location.href = "/api/oauth/login"}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Clinic Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Your Clinic Dashboard</h2>
          <p className="text-lg text-gray-600">Manage patients, appointments, and follow-ups with ease</p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Dashboard Card */}
          <Card
            className="border-0 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setLocation("/dashboard")}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg text-gray-900">Dashboard</CardTitle>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View key metrics, today's appointments, and pending follow-ups at a glance
              </p>
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Patients Card */}
          <Card
            className="border-0 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setLocation("/patients")}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg text-gray-900">Patients</CardTitle>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Add, edit, and manage patient profiles with medical history
              </p>
              <Button variant="outline" className="w-full">
                Manage Patients
              </Button>
            </CardContent>
          </Card>

          {/* Appointments Card */}
          <Card
            className="border-0 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setLocation("/appointments")}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg text-gray-900">Appointments</CardTitle>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Schedule appointments with no-show risk predictions
              </p>
              <Button variant="outline" className="w-full">
                Schedule Appointment
              </Button>
            </CardContent>
          </Card>

          {/* Follow-ups Card */}
          <Card
            className="border-0 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setLocation("/follow-ups")}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg text-gray-900">Follow-ups</CardTitle>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Track and manage patient follow-up appointments
              </p>
              <Button variant="outline" className="w-full">
                View Follow-ups
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart Predictions</h4>
              <p className="text-gray-600">
                ML-powered no-show risk scoring helps you identify high-risk appointments and reduce no-shows
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Patient Profiles</h4>
              <p className="text-gray-600">
                Comprehensive patient management with contact information and medical history tracking
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Appointment Scheduling</h4>
              <p className="text-gray-600">
                Easy-to-use scheduling with status tracking and appointment history
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Follow-up Management</h4>
              <p className="text-gray-600">
                Track pending, completed, and overdue follow-ups with detailed notes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
