# AI Appointment Assistant — Technical Assessment Prototype

A modern, full-stack appointment scheduling web application featuring an AI-assisted conversational booking assistant, manual calendar booking, JWT authentication, and a PostgreSQL database.

Built as a submission for the **Full Stack Developer — Technical Skills Assessment**.

---

## Table of Contents

1. [Overview](#overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [How to Run the Project Locally](#how-to-run-the-project-locally)
6. [Recommended Evaluation Flow](#recommended-evaluation-flow)
7. [API Reference](#api-reference)
8. [Key Design Decisions & Tradeoffs](#key-design-decisions--tradeoffs)
9. [Assumptions & Known Limitations](#assumptions--known-limitations)
10. [Database Schema & Indexing](#database-schema--indexing)

---

## Overview

The goal of this application is to deliver a simplified, end-to-end appointment scheduling workflow that combines **conversational AI booking** with a **structured fallback UI**.

Users can either:

1. **Chat with an AI Assistant** to extract desired dates, times, and reason for appointment with live database slot conflict detection.
2. **Use a manual booking modal** directly or switch to it seamlessly if AI extraction is incomplete or ambiguous (with pre-filled parameters).

---

## High-Level Architecture

The system follows a clean client-server architecture with strict separation of concerns across four distinct layers:

```
+-------------------------------------------------------------------------+
|                       FRONTEND (React 19 + Vite)                        |
+------------------------------------+------------------------------------+
                                     |  HTTP REST (JSON)
                                     v
+------------------------------------+------------------------------------+
|                       BACKEND API (Node.js + Express 5)                 |
+------------------+----------------------------------+-------------------+
                   |                                  |
                   v                                  v
+------------------+----------------+  +--------------+-------------------+
|     DATABASE (PostgreSQL 14+)     |  |      AI INTEGRATION SERVICE       |
+-----------------------------------+  |   Groq API (qwen/qwen3.8-27b)    |
                                       +-----------------------------------+
```

### Component Breakdown:

- **Frontend Layer**: Built with React 19 and Vite. State is managed through custom hooks (`useAppointments`, `useAuth`) and React Context, completely decoupling UI rendering from network transport.
- **Backend Layer**: Express 5 application structured using the Controller-Service-Model design pattern. Business logic is isolated from HTTP transport in dedicated service modules.
- **Database Layer**: Relational PostgreSQL database utilizing connection pooling (`pg.Pool`), partial indexing for concurrency safety, and foreign key constraints with cascade deletes.
- **AI Service Layer**: LLM-powered extraction with live PostgreSQL slot availability injection, paired with a deterministic fallback rule parser when the AI service is unavailable or unconfigured.

---

## Features

- 🔐 **Authentication**: Complete signup and login flow with salted bcrypt password hashing and signed JWT bearer tokens.
- 🤖 **AI Conversational Booking**: Multi-turn dialogue with memory that extracts `appointment_date`, `appointment_time`, and `description`.
- 🛡️ **Live Slot Conflict Guard**: Extracted appointment details are validated against live PostgreSQL availability before booking, preventing the assistant from suggesting or creating conflicting appointments.
- 🔄 **Deterministic Rule-Based Fallback**: If the AI service is unavailable or unconfigured, the backend attempts basic date/time/reason extraction using a deterministic parser and can direct the user to the manual booking flow when information is incomplete.
- 📋 **Manual Form Fallback**: Users can open a manual booking modal anytime; if switched from chat, all previously extracted parameters are automatically pre-filled.
- 📊 **Dashboard & Metrics**: Visual counters for upcoming and total appointments, status badges (`scheduled`, `completed`, `cancelled`), and detailed appointment inspection.
- ⚡ **Security & Reliability Measures**: General rate limiter (100 req/15min) and strict authentication rate limiter (10 req/15min), centralized error handling, and request duration logging.

---

## Tech Stack

| Domain                    | Technologies Used                                                                |
| :------------------------ | :------------------------------------------------------------------------------- |
| **Frontend**              | React 19, Vite, Vanilla CSS (modular design system), Lucide React                |
| **Backend**               | Node.js, Express 5, CORS, Dotenv                                                 |
| **Database**              | PostgreSQL, `pg` (node-postgres connection pool), `pgcrypto`                     |
| **Authentication**        | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`                                     |
| **AI Integration**        | Groq API (`qwen/qwen3.8-27b`) with JSON mode + Deterministic Rule-Based Fallback |
| **Security & Middleware** | `express-rate-limit`, Request Duration Logger, Centralized Error Handler         |

---

## How to Run the Project Locally

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v14.0 or higher (running locally or accessible remotely)
- **npm**: v9.0.0 or higher

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/eishsiddiqui/booking-assistant.git
cd booking-assistant
```

---

### Step 2: Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE appointment_app;
```

2. Run the database schema (DDL & Indexes):

```bash
psql -U postgres -d appointment_app -f backend/src/db/schema.sql
```

---

### Step 3: Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
npm install
```

2. Configure environment variables:
   Create a `.env` file in the `backend/` folder (or copy from `.env.example`):

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=appointment_app
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# AI Service (Optional - A fallback parser runs if key is omitted)
GROQ_API_KEY=your_groq_api_key_here
AI_MODEL=qwen/qwen3.8-27b
```

3. **Seed Sample Data (Out-of-the-Box Evaluator Accounts)**:

```bash
npm run db:seed
```

_This populates the database with sample appointments (upcoming, completed, and cancelled) and test user accounts._

4. Start the backend server:

```bash
npm start
# Server runs on http://localhost:5000
```

---

### Step 4: Frontend Setup

1. In a new terminal tab, navigate to the frontend directory:

```bash
cd ../frontend
npm install
```

2. Configure frontend environment:
   Create a `.env` file in the `frontend/` folder (or copy from `.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

3. Start the Vite development server:

```bash
npm run dev
# Frontend runs on http://localhost:5173
```

---

### Step 5: Test Credentials (Ready Out-of-the-Box)

You can log in immediately using the pre-seeded evaluator account:

| Account                       | Email                      | Password       | Role                                      |
| :---------------------------- | :------------------------- | :------------- | :---------------------------------------- |
| **Primary Evaluator Account** | `demo@example.com`         | `Password123!` | Has pre-seeded active & past appointments |
| **Secondary Test Account**    | `sarah.connor@example.com` | `Password123!` | Used for testing user isolation           |

_(Alternatively, you can sign up with a new account via the UI)._

---

## Recommended Evaluation Flow

The application can be evaluated using the following workflow:

1. **Login**: Sign in using the pre-seeded demo credentials (`demo@example.com` / `Password123!`).
2. **Dashboard Overview**: Review the pre-seeded upcoming, completed, and cancelled appointments.
3. **Conversational Booking**: Open the AI assistant and request an appointment using natural language (e.g. *"Book a consultation tomorrow at 2 PM"*).
4. **Field Extraction**: Verify that the assistant extracts the date, time, and description into a suggested booking card.
5. **Conflict Prevention**: Attempt to book an already occupied slot and verify that the conflict is detected and alternative slots are offered.
6. **Manual Form Fallback**: Switch from AI booking to the manual calendar form and verify that previously extracted fields are pre-filled.
7. **User Isolation**: Log in with the secondary account (`sarah.connor@example.com` / `Password123!`) and verify that users can only access their own appointments.
8. **Offline Fallback**: Disable or omit the `GROQ_API_KEY` in `.env` and verify that the deterministic rule parser and manual booking remain fully available.

---

## API Reference

All protected endpoints require the HTTP header:  
`Authorization: Bearer <JWT_TOKEN>`

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint           | Description                         | Rate Limit      |
| :----- | :----------------- | :---------------------------------- | :-------------- |
| `POST` | `/api/auth/signup` | Create user account & return JWT    | 10 req / 15 min |
| `POST` | `/api/auth/login`  | Authenticate user & return JWT      | 10 req / 15 min |
| `GET`  | `/api/auth/me`     | Retrieve authenticated user profile | General limit   |

### 2. Appointments Endpoints (`/api/appointments`)

| Method | Endpoint                | Description                                                        | Auth Required |
| :----- | :---------------------- | :----------------------------------------------------------------- | :-----------: |
| `POST` | `/api/appointments`     | Book a new appointment (validates future date & slot availability) |      Yes      |
| `GET`  | `/api/appointments`     | Retrieve appointments for current user (filters: `status`, `date`) |      Yes      |
| `GET`  | `/api/appointments/:id` | Retrieve single appointment details                                |      Yes      |

### 3. Chat & AI Endpoints (`/api/chat`)

| Method | Endpoint                       | Description                                                  | Auth Required |
| :----- | :----------------------------- | :----------------------------------------------------------- | :-----------: |
| `POST` | `/api/chat/message`            | Process message with AI, extract slots & detect availability |      Yes      |
| `GET`  | `/api/chat/history/:sessionId` | Retrieve message history for a chat session                  |      Yes      |
| `GET`  | `/api/chat/sessions`           | Retrieve all chat sessions for current user                  |      Yes      |

---

## Key Design Decisions & Tradeoffs

### 1. Hybrid AI Architecture (LLM + Deterministic Rule Fallback)

- **Decision**: Integrated an LLM via Groq (`qwen/qwen3.8-27b`) for contextual conversation, backed by an internal deterministic fallback parser (`fallbackParser.js`).
- **Tradeoff Analysis**:
  - Relying solely on external AI APIs creates a single point of failure (rate-limits, network latency, API outages).
  - Deterministic Rule-Based Fallback: If the AI service is unavailable, rate-limited, or unconfigured, the backend attempts basic date, time, and reason extraction using a deterministic parser and directs the user to the manual booking flow when information is incomplete or ambiguous.
  - Live database slot availability is dynamically injected into the AI context prompt, ensuring the model never hallucinates available slots that are already booked.

### 2. Communication Protocol: HTTP REST

- **Decision**: Implemented asynchronous HTTP REST endpoints for conversational interactions. Typing and loading states are handled client-side while requests are processed asynchronously.
- **Tradeoff Analysis**:
  - Appointment booking is **transactional and episodic** (short exchanges of 2–4 messages), unlike continuous real-time chat platforms (e.g., Slack, WhatsApp).
  - HTTP REST provides:
    - **Stateless Horizontal Scalability**: Any server instance behind a load balancer can handle any request without sticky WebSocket sessions.
    - **Lower Server Resource Footprint**: Does not hold persistent TCP socket connections open in server memory.
    - **Simpler Fault Tolerance**: Automatic client-side retry without connection drop / reconnect handling.

### 3. Database Modeling: JSONB for Chat Sessions

- **Decision**: Stored conversation history and AI extraction metadata as `JSONB` within `chat_sessions` rather than a separate 1:N normalized `chat_messages` table.
- **Tradeoff Analysis**:
  - **Efficient Thread Retrieval**: A conversation can be retrieved with a single indexed row lookup instead of joining and sorting a separate message table.
  - **Schema Flexibility**: AI payloads, token counts, extraction confidence, and function calls evolve rapidly. JSONB accommodates changes without running heavy database migrations.

### 4. Concurrency Safety: Partial Unique Index for Double-Booking Prevention

- **Decision**: Enforced appointment slot uniqueness via PostgreSQL partial unique index:
  ```sql
  CREATE UNIQUE INDEX unique_scheduled_appointment_slot
  ON appointments (appointment_date, appointment_time)
  WHERE status = 'scheduled';
  ```
- **Tradeoff Analysis**:
  - Enforcing uniqueness at the application layer alone is vulnerable to race conditions under concurrent booking requests.
  - The database partial unique index provides an absolute ACID guarantee at the storage engine level.
  - Because the index only applies to `status = 'scheduled'`, cancelled and completed appointments do not prevent the same time slot from being booked again.

---

## Assumptions & Known Limitations

1. **Single-Schedule Scope**: The prototype assumes a single shared service schedule (e.g., a single doctor or clinic schedule). In a multi-provider SaaS, slot uniqueness would be scoped to a `provider_id` or `staff_id`.
2. **Fixed Time Slot Increments**: Slots are evaluated in discrete hourly/half-hourly blocks (`HH:MM`). Dynamic duration appointments (e.g., 15m quick check vs. 90m surgery) would require PostgreSQL timestamp range types (`tsrange`) with exclusion constraints.
3. **Timezone Evaluation**: Dates and times are evaluated relative to the server's local operating system date. A global production deployment would store UTC timestamps and map them against user IANA timezone identifiers (e.g. `America/New_York`).
4. **Token Storage**: JWT tokens are stored in browser `localStorage` for rapid prototyping and ease of evaluation. In high-security production environments, `httpOnly`, `SameSite=Strict` secure cookies are recommended to eliminate XSS token theft vectors.

---

## Database Schema & Indexing

The schema definition is maintained in `backend/src/db/schema.sql` and sample seed data in `backend/src/db/seed.sql`.

### Indexing Strategy Applied:

- `unique_scheduled_appointment_slot`: Partial unique index on `(appointment_date, appointment_time) WHERE status = 'scheduled'`.
- `idx_appointments_user_id`: Foreign key B-tree index on `appointments(user_id)` to eliminate sequential table scans on user dashboard queries.
- `idx_appointments_user_date`: Composite index on `appointments(user_id, appointment_date)` for chronological ordering and date range filters.
- `idx_appointments_date_status`: Composite index on `appointments(appointment_date, status)` to accelerate live AI availability lookups.
- `idx_chat_sessions_user_id` & `idx_chat_sessions_user_updated`: Foreign key and descending timestamp index for fast session history retrieval.
