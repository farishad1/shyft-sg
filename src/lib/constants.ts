/**
 * Shyft Sg - Application Constants
 * Centralized configuration for tier thresholds, bcrypt rounds, and other business logic
 */

// ============================================
// TIER THRESHOLDS (Hours)
// ============================================

export const TIER_THRESHOLDS = {
    WORKER: {
        SILVER: 0,      // 0 - 50 hours
        GOLD: 51,       // 51 - 200 hours
        PLATINUM: 201,  // 200+ hours
    },
    HOTEL: {
        SILVER: 0,      // 0 - 50 hours hired
        GOLD: 51,       // 51 - 200 hours hired
        PLATINUM: 201,  // 200+ hours hired
    },
} as const;

// ============================================
// AUTHENTICATION
// ============================================

export const AUTH_CONFIG = {
    BCRYPT_SALT_ROUNDS: 12,
    SESSION_MAX_AGE: 30 * 24 * 60 * 60, // 30 days in seconds
} as const;

// ============================================
// BUSINESS RULES
// ============================================

export const BUSINESS_RULES = {
    // Minimum age to use the platform
    MIN_AGE: 13,

    // Age threshold for minor protections
    MINOR_AGE_THRESHOLD: 16,

    // Minor work restrictions (Singapore-based)
    MINOR_RESTRICTIONS: {
        // Cannot work between these hours (24-hour format)
        NIGHT_SHIFT_START: 23, // 11:00 PM
        NIGHT_SHIFT_END: 6,    // 6:00 AM

        // Maximum shift duration in hours
        MAX_SHIFT_HOURS: 6,
    },

    // 12-hour rule for application lockout
    APPLICATION_LOCK_HOURS: 12,

    // Training completion requirement
    TRAINING_COMPLETION_THRESHOLD: 100, // percentage

    // Strike thresholds (for cancellations)
    MAX_STRIKES_BEFORE_WARNING: 2,
    MAX_STRIKES_BEFORE_BAN: 5,
} as const;

// ============================================
// UI / BRANDING
// ============================================

export const BRAND = {
    NAME: 'Shyft Sg',
    SLOGAN: 'Unlock shifts at unique stays',
    COLORS: {
        BACKGROUND: '#000000',      // Deep Black
        CARD: '#1a1a1a',            // Industrial Grey
        ACCENT: '#EFBF04',          // Shyft Gold
        ACCENT_HOVER: '#D4A804',    // Darker gold for hover states
        TEXT_PRIMARY: '#FFFFFF',
        TEXT_SECONDARY: '#9CA3AF',
        SUCCESS: '#22C55E',
        WARNING: '#F59E0B',
        ERROR: '#EF4444',
    },
} as const;

// ============================================
// TRAINING CATEGORIES
// ============================================

export const TRAINING_CATEGORIES = {
    BOUTIQUE_HOTELS: 'boutique_hotels',
    CAPSULE_HOTELS: 'capsule_hotels',
    SERVICED_APARTMENTS: 'serviced_apartments',
} as const;

// ============================================
// WORK PASS TYPES (Singapore)
// ============================================

export const WORK_PASS_LABELS = {
    CITIZEN: 'Singapore Citizen',
    PERMANENT_RESIDENT: 'Permanent Resident',
    STUDENT_PASS: 'Student Pass',
    LTVP: 'Long Term Visit Pass',
} as const;

// ============================================
// API RESPONSE MESSAGES
// ============================================

export const MESSAGES = {
    AUTH: {
        INVALID_CREDENTIALS: 'Invalid email or password',
        EMAIL_EXISTS: 'An account with this email already exists',
        NOT_AUTHENTICATED: 'You must be logged in to perform this action',
        NOT_AUTHORIZED: 'You do not have permission to perform this action',
    },
    VERIFICATION: {
        PENDING: 'Your account is pending verification',
        DECLINED: 'Your verification was declined. Please contact support.',
        TRAINING_INCOMPLETE: 'You must complete training before accessing this feature',
    },
    APPLICATION: {
        LOCKED: 'This application is locked and cannot be modified within 12 hours of shift start',
        ALREADY_APPLIED: 'You have already applied for this shift',
        SHIFT_FILLED: 'This shift has already been filled',
    },
} as const;
