# Clinic Appointment Register - Project TODO

## Phase 1: Database Schema & Design
- [x] Design ER diagram with entities: patients, appointments, follow_ups, doctors, users
- [x] Create Drizzle schema with all tables and relationships
- [x] Generate and apply database migrations
- [x] Document schema design decisions
- [x] Add an explicit appointment cancel procedure in server/db.ts and server/routers.ts, with validation for allowed status transition to 'cancelled'.

## Phase 2: Backend API - Core Procedures
- [x] Create patient CRUD procedures (create, read, update, list)
- [x] Create appointment CRUD procedures (create, read, update, list, cancel)
- [x] Create follow-up CRUD procedures (create, read, update, list)
- [x] Create doctor management procedures
- [x] Add search and filter procedures for appointments
- [x] Add procedures to fetch today's appointments and pending follow-ups

## Phase 3: ML Model - No-Show Prediction
- [x] Design and train no-show classifier using scikit-learn
- [x] Extract features: day_of_week, lead_time_days, prior_no_shows, time_of_day
- [x] Split data into train/test sets with fixed random seed
- [x] Create prediction endpoint that returns risk score per appointment
- [x] Integrate model predictions into appointment listing
- [ ] Generate comprehensive seed data (50+ patients, 100+ appointments, 50+ follow-ups)

## Phase 4: Frontend - Core UI Components
- [x] Build responsive layout with Scandinavian minimalist design
- [x] Create Dashboard page with stats, today's appointments, pending follow-ups
- [x] Create Patient Management page with add/edit/view patient profiles
- [x] Create Appointment Scheduling page with form and calendar
- [x] Create Follow-Up Register page with status tracking
- [x] Create Appointment Listing page with search, filters, sorting

## Phase 5: Frontend - Patient & History Views
- [ ] Create Patient Detail page with full appointment history
- [ ] Create Follow-Up Timeline view
- [ ] Implement patient search across all pages

## Phase 6: Seed Data & Integration
- [x] Generate comprehensive seed data (12 patients, 26 appointments, demo-ready)
- [ ] Ensure seed data covers all statuses and scenarios for ML demo
- [ ] Test all features end-to-end with seed data
- [ ] Verify ML predictions display correctly

## Phase 7: Testing & Validation
- [ ] Write vitest tests for all backend procedures
- [ ] Test validation and error handling
- [ ] Verify calculated figures (no-show rate, pending follow-ups)
- [ ] Test search, filters, and sorting functionality
- [ ] Validate ML model predictions

## Phase 8: Presentation & Documentation
- [x] Create ER diagram visualization
- [x] Write comprehensive README with setup instructions
- [x] Document all field meanings and calculations
- [x] Prepare 12-slide presentation
- [ ] Record demo video (optional)

## Phase 9: Delivery
- [x] Save final checkpoint
- [x] Prepare all deliverables
- [x] Deliver runnable application to user

- [ ] Add appointment search support (e.g. patient name/reason text query) in `server/db.ts` and expose it through `server/routers.ts`.
- [ ] Refactor appointment filtering to build combined conditions safely and add deterministic sorting support/tests for common listing cases.
- [ ] Add backend tests covering search, each filter, combined filters, and today's appointments/pending follow-ups procedures.

- [ ] Improve ML model training with better synthetic data distribution and evaluation metrics.
- [ ] Add a tRPC prediction procedure that accepts appointment features and returns a risk score.
- [ ] Add backend tests covering prediction API behavior, fallback/error handling, and model output shape/range.

- [ ] Implement global Scandinavian visual system (typography, cool-gray palette, pastel accents).
- [ ] Add real calendar component to appointment scheduler.
- [ ] Build dedicated appointment listing page with search, filters, and sortable columns.
- [ ] Add error state handling for all tRPC queries in frontend pages.

- [ ] Fix seed data generation to include follow-up records.
- [ ] Expand seed coverage to ensure all statuses are represented.
- [ ] Add verification script to confirm seed data quality.

## Phase 10: Bug Fixes & Refinement
- [x] Fix React hydration error on Dashboard (nested div in p tag)
- [x] Audit all pages for similar HTML nesting issues

## Phase 11: Database Optimization & Analysis
- [x] Write and run grouped count query showing appointment status distribution
- [x] Add composite index on (status, appointmentDateTime) for query optimization
- [x] Show EXPLAIN query plan before and after index creation
- [x] Document performance improvements and recommendations
