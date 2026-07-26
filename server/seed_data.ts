import { getDb, createPatient, createDoctor, createAppointment, createFollowUp } from './db';
import { InsertPatient, InsertDoctor, InsertAppointment, InsertFollowUp } from '../drizzle/schema';

/**
 * Seed Data Generator
 * Populates the database with realistic demo data for testing and demonstration
 */

async function seedDatabase() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  console.log('Starting database seeding...');

  // Create doctors
  const doctors = [
    { name: 'Dr. Sarah Johnson', specialty: 'General Practitioner', contactNumber: '555-0101', email: 'sarah.johnson@clinic.com' },
    { name: 'Dr. Michael Chen', specialty: 'Cardiology', contactNumber: '555-0102', email: 'michael.chen@clinic.com' },
    { name: 'Dr. Emily Rodriguez', specialty: 'Dermatology', contactNumber: '555-0103', email: 'emily.rodriguez@clinic.com' },
    { name: 'Dr. James Wilson', specialty: 'Orthopedics', contactNumber: '555-0104', email: 'james.wilson@clinic.com' },
    { name: 'Dr. Lisa Anderson', specialty: 'Pediatrics', contactNumber: '555-0105', email: 'lisa.anderson@clinic.com' },
  ];

  const createdDoctors = [];
  for (const doctor of doctors) {
    const result = await createDoctor(doctor);
    createdDoctors.push(result);
    console.log(`Created doctor: ${doctor.name}`);
  }

  // Create patients
  const patients = [
    { name: 'John Smith', contactNumber: '555-1001', email: 'john.smith@email.com', dateOfBirth: new Date('1985-03-15'), medicalHistoryNotes: 'Hypertension, takes medication regularly' },
    { name: 'Mary Johnson', contactNumber: '555-1002', email: 'mary.johnson@email.com', dateOfBirth: new Date('1990-07-22'), medicalHistoryNotes: 'Asthma, uses inhaler as needed' },
    { name: 'Robert Brown', contactNumber: '555-1003', email: 'robert.brown@email.com', dateOfBirth: new Date('1978-11-08'), medicalHistoryNotes: 'Diabetes type 2, controlled with diet' },
    { name: 'Jennifer Davis', contactNumber: '555-1004', email: 'jennifer.davis@email.com', dateOfBirth: new Date('1992-05-30'), medicalHistoryNotes: 'Allergies to penicillin and shellfish' },
    { name: 'William Miller', contactNumber: '555-1005', email: 'william.miller@email.com', dateOfBirth: new Date('1988-09-12'), medicalHistoryNotes: 'Previous knee surgery, physical therapy ongoing' },
    { name: 'Patricia Wilson', contactNumber: '555-1006', email: 'patricia.wilson@email.com', dateOfBirth: new Date('1995-02-18'), medicalHistoryNotes: 'Anxiety disorder, on medication' },
    { name: 'Christopher Moore', contactNumber: '555-1007', email: 'christopher.moore@email.com', dateOfBirth: new Date('1980-12-25'), medicalHistoryNotes: 'High cholesterol, diet and exercise plan' },
    { name: 'Linda Taylor', contactNumber: '555-1008', email: 'linda.taylor@email.com', dateOfBirth: new Date('1987-06-10'), medicalHistoryNotes: 'Thyroid condition, stable on medication' },
    { name: 'David Anderson', contactNumber: '555-1009', email: 'david.anderson@email.com', dateOfBirth: new Date('1983-04-20'), medicalHistoryNotes: 'No known allergies or conditions' },
    { name: 'Susan Thomas', contactNumber: '555-1010', email: 'susan.thomas@email.com', dateOfBirth: new Date('1991-08-05'), medicalHistoryNotes: 'Migraines, takes preventive medication' },
    { name: 'Joseph Jackson', contactNumber: '555-1011', email: 'joseph.jackson@email.com', dateOfBirth: new Date('1986-01-14'), medicalHistoryNotes: 'Back pain, physical therapy recommended' },
    { name: 'Barbara White', contactNumber: '555-1012', email: 'barbara.white@email.com', dateOfBirth: new Date('1989-10-28'), medicalHistoryNotes: 'Seasonal allergies, manages with antihistamines' },
  ];

  const createdPatients = [];
  for (const patient of patients) {
    const result = await createPatient(patient);
    createdPatients.push(result);
    console.log(`Created patient: ${patient.name}`);
  }

  // Create appointments
  const now = new Date();
  const appointments: InsertAppointment[] = [];

  // Generate appointments for the past 3 months and next 3 months
  for (let i = -90; i <= 90; i += 7) {
    const appointmentDate = new Date(now);
    appointmentDate.setDate(appointmentDate.getDate() + i);
    appointmentDate.setHours(Math.floor(Math.random() * 18) + 8, 0, 0, 0); // 8 AM to 2 PM

    const patientIndex = Math.floor(Math.random() * createdPatients.length);
    const doctorIndex = Math.floor(Math.random() * createdDoctors.length);
    const patient = createdPatients[patientIndex];
    const doctor = createdDoctors[doctorIndex];

    if (!patient || !doctor) continue;

    // Determine status based on date
    let status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' = 'scheduled';
    if (appointmentDate < now) {
      const rand = Math.random();
      if (rand < 0.85) status = 'completed';
      else if (rand < 0.92) status = 'no-show';
      else status = 'cancelled';
    }

    // Calculate lead time
    const leadTime = Math.floor((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate no-show risk
    const dayOfWeek = appointmentDate.getDay();
    const timeOfDay = appointmentDate.getHours();
    let noShowRiskScore = 0.1;

    if (dayOfWeek === 0 || dayOfWeek === 5) noShowRiskScore += 0.1;
    if (leadTime < 7) noShowRiskScore += 0.15;
    if (timeOfDay >= 15 && timeOfDay <= 18) noShowRiskScore += 0.08;

    noShowRiskScore = Math.min(0.4, noShowRiskScore);

    appointments.push({
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentDateTime: appointmentDate,
      reason: ['General checkup', 'Follow-up', 'Consultation', 'Procedure', 'Lab work'][Math.floor(Math.random() * 5)],
      status,
      noShowRiskScore,
    });
  }

  const createdAppointments = [];
  for (const appointment of appointments) {
    const result = await createAppointment(appointment);
    if (result) {
      createdAppointments.push(result);
    }
    console.log(`Created appointment for patient ${appointment.patientId} with doctor ${appointment.doctorId}`);
  }

  // Create follow-ups
  const followUps: InsertFollowUp[] = [];

  for (let i = 0; i < createdAppointments.length; i++) {
    const appointmentIndex = Math.floor(Math.random() * createdAppointments.length);
    const appointment = createdAppointments[appointmentIndex];

    // Only create follow-ups for completed appointments
    if (!appointment || appointment.status !== 'completed') continue;

    const followUpDate = new Date(appointment.appointmentDateTime);
    followUpDate.setDate(followUpDate.getDate() + (Math.floor(Math.random() * 14) + 3)); // 3-17 days after appointment

    const status: 'pending' | 'completed' | 'overdue' = followUpDate < now ? 'completed' : 'pending';

    followUps.push({
      appointmentId: appointment.id || 1, // Fallback to 1 if id is undefined
      followUpDate,
      status,
      notes: ['Patient improving well', 'Continue medication', 'Schedule next visit', 'Refer to specialist'][Math.floor(Math.random() * 4)],
    });
  }

  for (const followUp of followUps) {
    await createFollowUp(followUp);
    console.log(`Created follow-up for appointment ${followUp.appointmentId}`);
  }

  console.log('Database seeding completed successfully!');
  console.log(`Created ${createdDoctors.length} doctors`);
  console.log(`Created ${createdPatients.length} patients`);
  console.log(`Created ${appointments.length} appointments`);
  console.log(`Created ${followUps.length} follow-ups`);
}

// Run seeding
seedDatabase().catch(console.error);

export { seedDatabase };
