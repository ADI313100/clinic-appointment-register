import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createPatient, getPatientById, updatePatient, listPatients, createDoctor, getDoctorById, listDoctors, createAppointment, getAppointmentById, updateAppointment, cancelAppointment, listAppointments, createFollowUp, getFollowUpById, updateFollowUp, listFollowUps, listAppointmentsWithFilters, getTodaysAppointments, getPendingFollowUps } from "./db";
import { calculateNoShowRiskHeuristic } from "./ml_predictor";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Patient Router
  patient: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        contactNumber: z.string().optional(),
        email: z.string().email().optional(),
        dateOfBirth: z.preprocess((arg) => new Date(arg as string), z.date()).optional(),
        medicalHistoryNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createPatient(input);
      }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getPatientById(input.id);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        contactNumber: z.string().optional(),
        email: z.string().email().optional(),
        dateOfBirth: z.preprocess((arg) => new Date(arg as string), z.date()).optional(),
        medicalHistoryNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updatePatient(id, data);
      }),
    list: protectedProcedure.query(async () => {
      return listPatients();
    }),
  }),

  // Doctor Router
  doctor: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        specialty: z.string().optional(),
        contactNumber: z.string().optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        return createDoctor(input);
      }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getDoctorById(input.id);
      }),
    list: protectedProcedure.query(async () => {
      return listDoctors();
    }),
  }),

  // Appointment Router
  appointment: router({
    create: protectedProcedure
      .input(z.object({
        patientId: z.number(),
        doctorId: z.number(),
        appointmentDateTime: z.preprocess((arg) => new Date(arg as string), z.date()),
        reason: z.string().optional(),
        status: z.enum(["scheduled", "completed", "cancelled", "no-show"]),
        noShowRiskScore: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return createAppointment(input);
      }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getAppointmentById(input.id);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        patientId: z.number().optional(),
        doctorId: z.number().optional(),
        appointmentDateTime: z.preprocess((arg) => new Date(arg as string), z.date()).optional(),
        reason: z.string().optional(),
        status: z.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
        noShowRiskScore: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateAppointment(id, data);
      }),
    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return cancelAppointment(input.id);
      }),
    list: protectedProcedure
      .input(z.object({
        status: z.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
        doctorId: z.number().optional(),
        patientId: z.number().optional(),
        date: z.preprocess((arg) => new Date(arg as string), z.date()).optional(),
      }).optional())
      .query(async ({ input }) => {
        return listAppointmentsWithFilters(input || {});
      }),
    todays: protectedProcedure.query(async () => {
      return getTodaysAppointments();
    }),
  }),

  // ML Prediction Router
  prediction: router({
    noShowRisk: protectedProcedure
      .input(z.object({
        dayOfWeek: z.number().min(0).max(6),
        leadTimeDays: z.number().min(1),
        priorNoShows: z.number().min(0),
        timeOfDay: z.number().min(0).max(23),
      }))
      .query(async ({ input }) => {
        const riskScore = calculateNoShowRiskHeuristic(input);
        return { riskScore };
      }),
  }),

  // FollowUp Router
  followUp: router({
    create: protectedProcedure
      .input(z.object({
        appointmentId: z.number(),
        followUpDate: z.preprocess((arg) => new Date(arg as string), z.date()),
        status: z.enum(["pending", "completed", "overdue"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createFollowUp(input);
      }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getFollowUpById(input.id);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        appointmentId: z.number().optional(),
        followUpDate: z.preprocess((arg) => new Date(arg as string), z.date()).optional(),
        status: z.enum(["pending", "completed", "overdue"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateFollowUp(id, data);
      }),
    list: protectedProcedure.query(async () => {
      return listFollowUps();
    }),
    pending: protectedProcedure.query(async () => {
      return getPendingFollowUps();
    }),
  }),
});

export type AppRouter = typeof appRouter;
