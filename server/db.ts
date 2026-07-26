import { and, eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, patients, doctors, appointments, followUps, InsertPatient, InsertDoctor, InsertAppointment, InsertFollowUp, Patient, Doctor, Appointment, FollowUp } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Patient Queries
export async function createPatient(patient: InsertPatient): Promise<Patient | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create patient: database not available");
    return undefined;
  }
  const result = await db.insert(patients).values(patient);
  const [insertedPatient] = await db.select().from(patients).where(eq(patients.id, (result as any).insertId));
  return insertedPatient;
}

export async function getPatientById(id: number): Promise<Patient | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get patient: database not available");
    return undefined;
  }
  const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePatient(id: number, patient: Partial<InsertPatient>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update patient: database not available");
    return;
  }
  await db.update(patients).set(patient).where(eq(patients.id, id));
}

export async function listPatients(): Promise<Patient[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list patients: database not available");
    return [];
  }
  return db.select().from(patients);
}

// Doctor Queries
export async function createDoctor(doctor: InsertDoctor): Promise<Doctor | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create doctor: database not available");
    return undefined;
  }
  const result = await db.insert(doctors).values(doctor);
  const [insertedDoctor] = await db.select().from(doctors).where(eq(doctors.id, (result as any).insertId));
  return insertedDoctor;
}

export async function getDoctorById(id: number): Promise<Doctor | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get doctor: database not available");
    return undefined;
  }
  const result = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listDoctors(): Promise<Doctor[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list doctors: database not available");
    return [];
  }
  return db.select().from(doctors);
}

// Appointment Queries
export async function createAppointment(appointment: InsertAppointment): Promise<Appointment | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create appointment: database not available");
    return undefined;
  }
  try {
    const result = await db.insert(appointments).values(appointment);
    const insertId = (result as any).insertId;
    if (!insertId) {
      console.warn("[Database] No insertId returned from appointment creation");
      return undefined;
    }
    const [insertedAppointment] = await db.select().from(appointments).where(eq(appointments.id, insertId));
    return insertedAppointment;
  } catch (error) {
    console.error("[Database] Failed to create appointment:", error);
    return undefined;
  }
}

export async function getAppointmentById(id: number): Promise<Appointment | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get appointment: database not available");
    return undefined;
  }
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update appointment: database not available");
    return;
  }
  await db.update(appointments).set(appointment).where(eq(appointments.id, id));
}

export async function listAppointments(): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list appointments: database not available");
    return [];
  }
  return db.select().from(appointments);
}

// FollowUp Queries
export async function createFollowUp(followUp: InsertFollowUp): Promise<FollowUp | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create follow-up: database not available");
    return undefined;
  }
  const result = await db.insert(followUps).values(followUp);
  const [insertedFollowUp] = await db.select().from(followUps).where(eq(followUps.id, (result as any).insertId));
  return insertedFollowUp;
}

export async function getFollowUpById(id: number): Promise<FollowUp | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get follow-up: database not available");
    return undefined;
  }
  const result = await db.select().from(followUps).where(eq(followUps.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateFollowUp(id: number, followUp: Partial<InsertFollowUp>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update follow-up: database not available");
    return;
  }
  await db.update(followUps).set(followUp).where(eq(followUps.id, id));
}

export async function listFollowUps(): Promise<FollowUp[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list follow-ups: database not available");
    return [];
  }
  return db.select().from(followUps);
}

export async function cancelAppointment(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot cancel appointment: database not available");
    throw new Error("Database not available");
  }

  const existingAppointment = await getAppointmentById(id);
  if (!existingAppointment) {
    throw new Error("Appointment not found");
  }

  if (existingAppointment.status === "completed" || existingAppointment.status === "cancelled" || existingAppointment.status === "no-show") {
    throw new Error(`Appointment is already in a terminal state: ${existingAppointment.status}`);
  }

  await db.update(appointments).set({ status: "cancelled" }).where(eq(appointments.id, id));
}

export async function listAppointmentsWithFilters(filters: { status?: Appointment['status'], doctorId?: number, patientId?: number, date?: Date }): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list appointments with filters: database not available");
    return [];
  }

  let query = db.select().from(appointments).$dynamic();

  if (filters.status) {
    query = query.where(eq(appointments.status, filters.status));
  }
  if (filters.doctorId) {
    query = query.where(eq(appointments.doctorId, filters.doctorId));
  }
  if (filters.patientId) {
    query = query.where(eq(appointments.patientId, filters.patientId));
  }
  if (filters.date) {
    const startOfDay = new Date(filters.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(filters.date);
    endOfDay.setHours(23, 59, 59, 999);
    query = query.where(and(gte(appointments.appointmentDateTime, startOfDay), lte(appointments.appointmentDateTime, endOfDay)));
  }

  return query.execute();
}

export async function getTodaysAppointments(): Promise<Appointment[]> {
  const today = new Date();
  return listAppointmentsWithFilters({ date: today });
}

export async function getPendingFollowUps(): Promise<FollowUp[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get pending follow-ups: database not available");
    return [];
  }
  return db.select().from(followUps).where(eq(followUps.status, "pending")).execute();
}

// TODO: add feature queries here as your schema grows.
