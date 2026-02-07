import { z } from 'zod';
import { WorkPassType } from '@prisma/client';
import { BUSINESS_RULES } from './constants';
import { differenceInYears } from 'date-fns';

// Base User Registration Schema
export const userRegisterSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['WORKER', 'HOTEL']),
});

// Worker Profile Schema
export const workerProfileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
        return arg;
    }, z.date()),
    phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
    workPassType: z.nativeEnum(WorkPassType),
    workPassNumber: z.string().optional(), // Optional generally, but admin might verify

    // Specific requirements
    schoolName: z.string().optional(),

    // Mandatory Checkboxes
    hasBasicEnglish: z.boolean().refine(val => val === true, {
        message: 'You must confirm you possess basic English skills',
    }),
    hasComputerSkills: z.boolean().refine(val => val === true, {
        message: 'You must confirm you possess basic Computer skills',
    }),
}).refine((data) => {
    // Requirement: School Name required for Student Pass
    if (data.workPassType === 'STUDENT_PASS' && !data.schoolName) {
        return false;
    }
    return true;
}, {
    message: "School name is required for Student Pass holders",
    path: ["schoolName"],
}).refine((data) => {
    // Requirement: Age 13+
    const age = differenceInYears(new Date(), data.dateOfBirth);
    return age >= BUSINESS_RULES.MIN_AGE;
}, {
    message: `You must be at least ${BUSINESS_RULES.MIN_AGE} years old to join Shyft Sg`,
    path: ["dateOfBirth"],
});

// Hotel Profile Schema
export const hotelProfileSchema = z.object({
    hotelName: z.string().min(1, 'Hotel name is required'),
    uen: z.string().min(1, 'UEN is required'),
    location: z.string().min(1, 'Location is required'),
    description: z.string().optional(),
});

// Combined Schemas for API validation
export const registerWorkerSchema = userRegisterSchema.merge(workerProfileSchema);
export const registerHotelSchema = userRegisterSchema.merge(hotelProfileSchema);
