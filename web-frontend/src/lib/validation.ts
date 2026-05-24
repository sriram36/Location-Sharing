import { z } from "zod";

const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = loginSchema.extend({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s'\-]+$/, "Name can only contain letters, spaces, hyphens and apostrophes"),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z
    .string()
    .regex(phoneRegex, "Enter a valid phone number (digits, spaces, +, -, parentheses)")
    .optional()
    .or(z.literal("")),
  role: z.enum(["admin", "driver", "parent"], { message: "Select a valid role" }),
});

export const editUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  phone: z
    .string()
    .regex(phoneRegex, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  role: z.enum(["admin", "driver", "parent"], { message: "Select a valid role" }),
});

export const busSchema = z.object({
  name: z
    .string()
    .min(1, "Bus name is required")
    .max(50, "Bus name must be 50 characters or less"),
  driver_id: z.string().uuid().nullable().optional(),
  status: z.enum(["active", "inactive", "maintenance"]),
});

export const routeSchema = z.object({
  name: z.string().min(1, "Route name is required").max(100, "Route name is too long"),
  description: z.string().max(500, "Description must be 500 characters or less").optional().or(z.literal("")),
  bus_id: z.string().uuid().nullable().optional(),
});

export const stopSchema = z.object({
  name: z.string().min(1, "Stop name is required").max(100, "Stop name is too long"),
  latitude: z
    .number()
    .min(-90, "Latitude must be between −90 and 90")
    .max(90, "Latitude must be between −90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between −180 and 180")
    .max(180, "Longitude must be between −180 and 180"),
});

export const assignmentSchema = z.object({
  parent_id: z.string().uuid("Please select a parent"),
  bus_id: z.string().uuid("Please select a bus"),
  student_name: z
    .string()
    .min(2, "Student name must be at least 2 characters")
    .max(100, "Student name is too long"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput      = z.infer<typeof loginSchema>;
export type SignupInput      = z.infer<typeof signupSchema>;
export type CreateUserInput  = z.infer<typeof createUserSchema>;
export type EditUserInput    = z.infer<typeof editUserSchema>;
export type BusInput         = z.infer<typeof busSchema>;
export type RouteInput       = z.infer<typeof routeSchema>;
export type StopInput        = z.infer<typeof stopSchema>;
export type AssignmentInput  = z.infer<typeof assignmentSchema>;
