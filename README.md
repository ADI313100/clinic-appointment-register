# Clinic Appointment and Follow-Up Register

A modern, full-stack web application for managing clinic appointments, patient profiles, and follow-up tracking with intelligent no-show risk prediction powered by machine learning.

## Features

### 1. **Dashboard Overview**
- Real-time statistics: total patients, no-show rate, pending follow-ups, and today's appointments
- Quick access to today's scheduled appointments with no-show risk scores
- Pending follow-ups summary with due dates and notes

### 2. **Patient Management**
- Add, edit, and view patient profiles
- Store comprehensive medical history and contact information
- Search patients by name, email, or phone number
- Track date of birth and medical conditions

### 3. **Appointment Scheduling**
- Schedule appointments with date, time, doctor, and reason
- Track appointment status: scheduled, completed, cancelled, no-show
- View all appointments with filtering and sorting
- Cancel scheduled appointments
- ML-powered no-show risk scoring for each appointment

### 4. **Follow-Up Register**
- Log follow-up requirements after appointments
- Track follow-up status: pending, completed, overdue
- Add detailed follow-up notes and instructions
- Overview of pending, completed, and overdue follow-ups

### 5. **ML-Powered No-Show Prediction**
- Intelligent risk scoring based on:
  - Day of week (Monday/Friday higher risk)
  - Lead time (shorter lead times higher risk)
  - Prior no-show history
  - Time of day (late afternoon appointments higher risk)
- Risk scores displayed on each appointment
- Helps identify high-risk appointments for proactive outreach

## Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling with OKLCH color system
- **shadcn/ui** - High-quality UI components
- **tRPC** - End-to-end type-safe APIs
- **Wouter** - Lightweight routing

### Backend
- **Express.js** - Web server framework
- **tRPC** - Type-safe RPC framework
- **Drizzle ORM** - Type-safe database access
- **MySQL** - Relational database

### ML & Data Science
- **scikit-learn** - Machine learning library
- **Python** - ML model training and prediction

## Design System

The application follows a **Scandinavian minimalist aesthetic**:
- **Color Palette**: Pale cool grays (oklch 0.98 0.001 265) as background, deep cool grays for text
- **Typography**: Bold, black sans-serif headings (Syne font) with delicate subtitles (Inter font)
- **Accents**: Soft pastel blue (oklch 0.75 0.12 265) and blush pink (oklch 0.78 0.08 15)
- **Spacing**: Generous negative space and clean layouts
- **Components**: Subtle shadows, rounded corners, and smooth transitions

## Database Schema

### Tables

**Patients**
- id, name, contactNumber, email, dateOfBirth, medicalHistoryNotes
- Tracks all patient information and medical history

**Doctors**
- id, name, specialty, contactNumber, email
- Stores doctor profiles and specialties

**Appointments**
- id, patientId, doctorId, appointmentDateTime, reason, status, noShowRiskScore
- Manages all appointments with status tracking and risk scores

**FollowUps**
- id, appointmentId, followUpDate, status, notes
- Tracks follow-up requirements and completion status

**Users**
- id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn
- Manages user authentication and authorization

## API Endpoints (tRPC)

### Patient Router
- `patient.create` - Create new patient
- `patient.get` - Get patient by ID
- `patient.update` - Update patient information
- `patient.list` - List all patients

### Doctor Router
- `doctor.create` - Create new doctor
- `doctor.get` - Get doctor by ID
- `doctor.list` - List all doctors

### Appointment Router
- `appointment.create` - Schedule new appointment
- `appointment.get` - Get appointment by ID
- `appointment.update` - Update appointment
- `appointment.cancel` - Cancel appointment
- `appointment.list` - List appointments with filters (status, doctor, patient, date)
- `appointment.todays` - Get today's appointments

### FollowUp Router
- `followUp.create` - Create follow-up record
- `followUp.get` - Get follow-up by ID
- `followUp.update` - Update follow-up status
- `followUp.list` - List all follow-ups
- `followUp.pending` - Get pending follow-ups

### Prediction Router
- `prediction.noShowRisk` - Calculate no-show risk score

## Seed Data

The application comes pre-populated with demo data:
- **5 Doctors** with various specialties (GP, Cardiology, Dermatology, Orthopedics, Pediatrics)
- **12 Patients** with realistic profiles and medical histories
- **26 Appointments** spanning 3 months (past, present, and future)
- **Follow-ups** for completed appointments

This demo data covers all appointment statuses and scenarios to meaningfully demonstrate the ML prediction model.

## Getting Started

### Prerequisites
- Node.js 22.13.0 or higher
- MySQL database
- Python 3.11+ (for ML model training)

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   - Database connection string in `DATABASE_URL`
   - OAuth credentials for authentication
   - API keys for external services

3. **Run database migrations**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

4. **Seed the database with demo data**
   ```bash
   npx tsx server/seed_data_sql.ts
   ```

5. **Train the ML model**
   ```bash
   python3 server/ml_model.py
   ```

### Development

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Production Build

Build for production:
```bash
pnpm build
```

Start the production server:
```bash
pnpm start
```

## Testing

Run the test suite:
```bash
pnpm test
```

## File Structure

```
clinic-appointment-register/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utilities and helpers
│   │   └── index.css         # Global styles with Scandinavian design
│   └── index.html
├── server/                    # Express backend
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   ├── ml_model.py           # ML model training
│   ├── ml_predict.py         # ML prediction script
│   └── seed_data_sql.ts      # Database seeding script
├── drizzle/                   # Database schema and migrations
│   ├── schema.ts             # Drizzle ORM schema
│   └── migrations/           # SQL migration files
└── shared/                    # Shared types and constants
```

## Key Features Explained

### No-Show Risk Prediction

The ML model uses logistic regression to predict appointment no-show risk based on:

1. **Day of Week**: Monday and Friday appointments have higher no-show rates
2. **Lead Time**: Appointments scheduled less than 7 days in advance have higher risk
3. **Prior No-Shows**: Patients with history of no-shows are flagged as higher risk
4. **Time of Day**: Late afternoon appointments (3-6 PM) have higher no-show rates

Risk scores range from 0 (low risk) to 1 (high risk) and are displayed on each appointment for quick identification of high-risk bookings.

### Appointment Status Workflow

- **Scheduled**: Initial status when appointment is created
- **Completed**: Appointment was attended by the patient
- **No-Show**: Patient did not attend the appointment
- **Cancelled**: Appointment was cancelled by clinic or patient

### Follow-Up Status Tracking

- **Pending**: Follow-up is due or upcoming
- **Completed**: Follow-up has been completed
- **Overdue**: Follow-up is past the scheduled date

## Performance Considerations

- Database queries are optimized with proper indexing
- Frontend uses React Query for efficient data fetching and caching
- ML predictions are cached to avoid redundant calculations
- Lazy loading of components for faster initial page load

## Security

- User authentication via Manus OAuth
- Role-based access control (admin/user roles)
- Protected API endpoints require authentication
- SQL injection prevention through parameterized queries
- CSRF protection enabled

## Future Enhancements

- SMS/Email reminders for upcoming appointments
- Automated no-show follow-up workflows
- Advanced analytics and reporting
- Integration with external calendar systems
- Video consultation support
- Patient self-service booking portal
- Mobile app for patients and staff

## Support

For issues, questions, or feature requests, please contact the development team or submit an issue in the project repository.

## License

This project is proprietary and confidential.

---

**Version**: 1.0.0  
**Last Updated**: July 26, 2026  
**Status**: Demo-Ready
