// src/types/index.ts

export interface ArtisanRegistrationData {
  // Basic Info (Required)
  name: string;
  phone: string;
  password: string;
  
  // Personal Details
  email?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  
  // Location (Required for local discovery)
  city: string;
  state: string;
  address?: string;
  district?: string;
  pincode?: string;
  
  // Artisan Details
  craftType?: string;
  experience?: number;
  languages?: string[];
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  gender?: string;
  age?: number;
  city: string;
  state: string;
  district?: string;
  address?: string;
  pincode?: string;
  craftType?: string;
  experience?: number;
  languages?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Common craft types for dropdown
export const CRAFT_TYPES = [
  'Pottery',
  'Weaving', 
  'Jewelry Making',
  'Wood Carving',
  'Metal Work',
  'Painting',
  'Embroidery',
  'Leather Work',
  'Stone Carving',
  'Textile',
  'Other'
] as const;

// Indian states for dropdown
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh', 
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh'
] as const;