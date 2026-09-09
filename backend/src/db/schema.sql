-- ============================================================================
-- APPOINTMENT BOOKING ASSISTANT - DATABASE SCHEMA (DDL)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS & CUSTOM TYPES
-- ----------------------------------------------------------------------------

-- Cryptographic extension for gen_random_uuid() and bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Custom status enum for appointment lifecycle management
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM (
        'scheduled',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ----------------------------------------------------------------------------
-- 2. TABLE DEFINITIONS (DDL)
-- ----------------------------------------------------------------------------

-- 2.1 Users Table: Authentication & User Profile Information
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Appointments Table: Scheduling Data and Status
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,

    description TEXT,
    status appointment_status NOT NULL DEFAULT 'scheduled',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 Chat Sessions Table: AI Multi-Turn Conversation History & Metadata
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Conversation messages stored as structured JSONB array
    -- Format: [{"id": "...", "sender": "user"|"ai", "text": "...", "timestamp": "..."}]
    messages JSONB NOT NULL DEFAULT '[]',

    -- Extracted parameters accumulated across multi-turn dialogs
    -- Format: {"extracted": {"appointment_date": "...", "appointment_time": "..."}, "isComplete": bool}
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ----------------------------------------------------------------------------
-- 3. INDEXING STRATEGY
-- ----------------------------------------------------------------------------

-- 3.1 Partial Unique Index: Zero-Conflict Slot Booking Guarantee
-- Enforces that no two active ('scheduled') appointments can book the exact same date and time.
-- Cancelled or completed appointments do NOT block future bookings for that slot.
CREATE UNIQUE INDEX IF NOT EXISTS unique_scheduled_appointment_slot
ON appointments (appointment_date, appointment_time)
WHERE status = 'scheduled';

-- 3.2 Foreign Key Index: User Appointments Lookup
-- PostgreSQL does NOT index foreign keys by default.
-- Eliminates full-table sequential scans when loading user dashboards.
CREATE INDEX IF NOT EXISTS idx_appointments_user_id
ON appointments (user_id);

-- 3.3 Composite Index: User Appointments by Date
-- Optimizes filtered dashboard queries and chronological ordering (ORDER BY appointment_date, appointment_time).
CREATE INDEX IF NOT EXISTS idx_appointments_user_date
ON appointments (user_id, appointment_date);

-- 3.4 Composite Index: Date & Status Availability Checks
-- Accelerates live AI slot checks ('SELECT appointment_time FROM appointments WHERE appointment_date = $1 AND status = scheduled').
CREATE INDEX IF NOT EXISTS idx_appointments_date_status
ON appointments (appointment_date, status);

-- 3.5 Foreign Key & Session History Index
-- Optimizes fetching recent chat sessions for a user (ORDER BY updated_at DESC).
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id
ON chat_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_updated
ON chat_sessions (user_id, updated_at DESC);


-- ----------------------------------------------------------------------------
-- 4. PERFORMANCE CONSIDERATIONS & ARCHITECTURAL NOTES
-- ----------------------------------------------------------------------------
/*
 1. Partial Indexing Efficiency:
    - Instead of indexing all rows in `appointments`, `unique_scheduled_appointment_slot` uses
      `WHERE status = 'scheduled'`.
    - In a high-traffic system, completed and cancelled rows constitute >80% of historical records.
    - Partial indexing shrinks index size by up to 80%, keeping the index cached in RAM (buffer pool)
      and drastically reducing B-tree rebalancing overhead on status updates.

 2. JSONB vs Normalized Messages Table:
    - Chat history is stored as a JSONB document rather than a separate 1:N normalized table.
    - Read Latency: Fetching an entire chat session requires a single fast primary key lookup (O(1))
      without requiring expensive table JOINs and row aggregations.
    - Schema Flexibility: AI payloads, token metadata, extraction confidence, and function-call
      debug info can evolve without requiring costly DDL migrations.

 3. Connection Pooling:
    - The Node.js API uses `pg.Pool` with connection reuse (`max: 20`, `idleTimeoutMillis: 30000`).
    - Prevents connection exhaustion on PostgreSQL under spike loads and avoids process-forking overhead.

 4. Scaling Strategy & Table Partitioning:
    - For high-volume scale, `appointments` can be partitioned by RANGE on `appointment_date`:
      e.g., `CREATE TABLE appointments (...) PARTITION BY RANGE (appointment_date);`
      with monthly partitions (e.g. `appointments_2026_09`).
    - PostgreSQL partition pruning ensures queries checking availability for this week completely
      ignore historical partition tables, maintaining sub-millisecond query execution.
*/


-- ----------------------------------------------------------------------------
-- 5. SAMPLE SEED DATA
-- ----------------------------------------------------------------------------
-- Out-of-the-box sample insert statements are separated into:
--   backend/src/db/seed.sql
--
-- To seed the database:
-- $ npm run db:seed
-- ----------------------------------------------------------------------------
