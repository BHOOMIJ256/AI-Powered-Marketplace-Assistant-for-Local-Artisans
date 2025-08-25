// src/lib/validations.ts
import { z } from 'zod';

export const artisanRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  gender: z.enum(["male", "female", "other"]).optional(),
  age: z.number().min(18).max(100).optional(),
  address: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  district: z.string().optional(),
  pincode: z.string().optional(),
  craftType: z.string().optional(),
  experience: z.number().min(0).optional(),
  // Change this line - accept either string or array
  languages: z.union([
    z.string(), // JSON string like "[\"Hindi\", \"English\"]"
    z.array(z.string()) // or array like ["Hindi", "English"]
  ]).optional(),
});

export type ArtisanRegistrationData = z.infer<typeof artisanRegistrationSchema>;