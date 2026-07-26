import { getDb } from './db';

/**
 * Seed Data Generator using SQL
 * Populates the database with realistic demo data for testing and demonstration
 */

async function seedDatabase() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  console.log('Starting database seeding with SQL...');

  try {
    // Create doctors
    const doctorInserts = [
      "INSERT INTO doctors (name, specialty, contactNumber, email, createdAt, updatedAt) VALUES ('Dr. Sarah Johnson', 'General Practitioner', '555-0101', 'sarah.johnson@clinic.com', NOW(), NOW())",
      "INSERT INTO doctors (name, specialty, contactNumber, email, createdAt, updatedAt) VALUES ('Dr. Michael Chen', 'Cardiology', '555-0102', 'michael.chen@clinic.com', NOW(), NOW())",
      "INSERT INTO doctors (name, specialty, contactNumber, email, createdAt, updatedAt) VALUES ('Dr. Emily Rodriguez', 'Dermatology', '555-0103', 'emily.rodriguez@clinic.com', NOW(), NOW())",
      "INSERT INTO doctors (name, specialty, contactNumber, email, createdAt, updatedAt) VALUES ('Dr. James Wilson', 'Orthopedics', '555-0104', 'james.wilson@clinic.com', NOW(), NOW())",
      "INSERT INTO doctors (name, specialty, contactNumber, email, createdAt, updatedAt) VALUES ('Dr. Lisa Anderson', 'Pediatrics', '555-0105', 'lisa.anderson@clinic.com', NOW(), NOW())",
    ];

    for (const insert of doctorInserts) {
      await db.execute(insert);
    }
    console.log('Created 5 doctors');

    // Create patients
    const patientInserts = [
      "INSERT INTO patients (name, contactNumber, email, dateOfBirth, medicalHistoryNotes, createdAt, updatedAt) VALUES ('John Smith', '555-1001', 'john.smith@email.com', '1985-03-15', 'Hypertension, takes medication regularly', NOW(), NOW())",
      "INSERT INTO patients (name, contactNumber, email, dateOfBirth, medicalHistoryNotes, createdAt, updatedAt) VALUES ('Mary Johnson', '555-1002', 'mary.johnson@email.com', '1990-07-22', 'Asthma, uses inhaler as needed', NOW(), NOW())",
      "INSERT INTO patients (name, contactNumber, email, dateOfBirth, medicalHistoryNotes, createdAt, updatedAt) VALUES ('Robert Brown', '555-1003', 'robert.brown@email.com', '1978-11-08', 'Diabetes type 2, controlled with diet', NOW(), NOW())",
      "INSERT INTO patients (name, contactNumber, email, dateOfBirth, medicalHistoryNotes, createdAt, updatedAt) VALUES ('Jennifer Davis', '555-1004', 'jennifer.davis@email.com', '1992-05-30', 'Allergies to penicillin and shellfish', NOW(), NOW())",
      "INSERT INTO patients (name, contactNumber, email, dateOfBirth, medicalHistoryNotes, createdAt, updatedAt) VALUES ('William Miller', '555-1005', 'william.miller@email.com', '1988-09-12', 'Previous knee surgery, physical therapy ongoing', NOW(), NOW())",
      "INSERT INTO patients (name, contactNumber, email, dateOfBirth, medicalHistoryNotes, createdAt, updatedAt) VALUES ('Patricia Wilson', '555-1006', 'patricia.wilson@email.com', '1995-02-18', 'Anxiety disorder, on medication', NOW(), NOW())",
      "INSERT INTO patients (name, contactNumber, email, dateOfBirth, medicalHistoryNotes, createdAt, updatedAt) VALUES ('Christopher Moore', '555-1007', 'christopher.moore@email.com', '1980-12-25', 'High cholesterol, diet and exercise plan', NOW(), NOW())",
      "INSERT INTO patients (name, contactNumber, email, dateOfBirth, medicalHistoryNotes, createdAt, updatedAt) VALUES ('Linda Taylor', '555-1008', 'linda.taylor@email.com', '1987-06-10', 'Thyroid condition, stable on medication', NOW(), NOW())",
      "INSERT INTO patients (name, contactNumber, email, dateOfBirth, medicalHistoryNotes, createdAt, updatedAt) VALUES ('David Anderson', '555-1009', 'david.anderson@email.com', '1983-04-20', 'No known allergies or conditions', NOW(), NOW())",
      "INSERT INTO patients (name, contactNumber, email, dateOfBirth, medicalHistoryNotes, createdAt, updatedAt) VALUES ('Susan Thomas', '555-1010', 'susan.thomas@email.com', '1991-08-05', 'Migraines, takes preventive medication', NOW(), NOW())",
      "INSERT INTO patients (name, contactNumber, email, dateOfBirth, medicalHistoryNotes, createdAt, updatedAt) VALUES ('Joseph Jackson', '555-1011', 'joseph.jackson@email.com', '1986-01-14', 'Back pain, physical therapy recommended', NOW(), NOW())",
      "INSERT INTO patients (name, contactNumber, email, dateOfBirth, medicalHistoryNotes, createdAt, updatedAt) VALUES ('Barbara White', '555-1012', 'barbara.white@email.com', '1989-10-28', 'Seasonal allergies, manages with antihistamines', NOW(), NOW())",
    ];

    for (const insert of patientInserts) {
      await db.execute(insert);
    }
    console.log('Created 12 patients');

    // Create appointments
    const now = new Date();
    let appointmentCount = 0;

    for (let i = -90; i <= 90; i += 7) {
      const appointmentDate = new Date(now);
      appointmentDate.setDate(appointmentDate.getDate() + i);
      appointmentDate.setHours(Math.floor(Math.random() * 18) + 8, 0, 0, 0);

      const patientId = Math.floor(Math.random() * 12) + 1;
      const doctorId = Math.floor(Math.random() * 5) + 1;

      let status = 'scheduled';
      if (appointmentDate < now) {
        const rand = Math.random();
        if (rand < 0.85) status = 'completed';
        else if (rand < 0.92) status = 'no-show';
        else status = 'cancelled';
      }

      const leadTime = Math.floor((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const dayOfWeek = appointmentDate.getDay();
      const timeOfDay = appointmentDate.getHours();

      let noShowRiskScore = 0.1;
      if (dayOfWeek === 0 || dayOfWeek === 5) noShowRiskScore += 0.1;
      if (leadTime < 7) noShowRiskScore += 0.15;
      if (timeOfDay >= 15 && timeOfDay <= 18) noShowRiskScore += 0.08;
      noShowRiskScore = Math.min(0.4, noShowRiskScore);

      const reasons = ['General checkup', 'Follow-up', 'Consultation', 'Procedure', 'Lab work'];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];

      const dateStr = appointmentDate.toISOString().slice(0, 19).replace('T', ' ');
      const insert = `INSERT INTO appointments (patientId, doctorId, appointmentDateTime, reason, status, noShowRiskScore, createdAt, updatedAt) VALUES (${patientId}, ${doctorId}, '${dateStr}', '${reason}', '${status}', ${noShowRiskScore}, NOW(), NOW())`;

      await db.execute(insert);
      appointmentCount++;
    }
    console.log(`Created ${appointmentCount} appointments`);

    // Create follow-ups for completed appointments
    try {
      const appointmentsResult = await db.execute('SELECT id, appointmentDateTime, status FROM appointments WHERE status = "completed"');
      const appointments = appointmentsResult as any[];

      let followUpCount = 0;
      for (const appointment of appointments) {
        if (!appointment.appointmentDateTime) continue;
        
        const followUpDate = new Date(appointment.appointmentDateTime);
        if (isNaN(followUpDate.getTime())) continue;
        
        followUpDate.setDate(followUpDate.getDate() + (Math.floor(Math.random() * 14) + 3));

        const status = followUpDate < now ? 'completed' : 'pending';
        const notes = ['Patient improving well', 'Continue medication', 'Schedule next visit', 'Refer to specialist'][Math.floor(Math.random() * 4)];

        const followUpDateStr = followUpDate.toISOString().slice(0, 19).replace('T', ' ');
        const insert = `INSERT INTO followUps (appointmentId, followUpDate, status, notes, createdAt, updatedAt) VALUES (${appointment.id}, '${followUpDateStr}', '${status}', '${notes}', NOW(), NOW())`;

        await db.execute(insert);
        followUpCount++;
      }
      console.log(`Created ${followUpCount} follow-ups`);
    } catch (error) {
      console.warn('Could not create follow-ups:', error);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

seedDatabase().catch(console.error);

export { seedDatabase };
