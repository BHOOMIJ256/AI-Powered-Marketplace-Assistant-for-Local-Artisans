// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { artisanRegistrationSchema } from '@/lib/validations';
import { ApiResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input data
    const validationResult = artisanRegistrationSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error);
      
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Validation failed',
        error: validationResult.error.issues?.[0]?.message || 'Invalid input data',
        data: validationResult.error.issues // Send all validation issues
      }, { status: 400 });
    }

    const {
      name,
      email,
      phone,
      password,
      gender,
      age,
      address,
      city,
      state,
      district,
      pincode,
      craftType,
      experience,
      languages
    } = validationResult.data;

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { phone: phone },
          ...(email ? [{ email: email }] : [])
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: "User already exists with this phone number or email"
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await db.user.create({
      data: {
        name,
        email: email || null, // Ensure null if undefined
        phone,
        password: hashedPassword,
        gender: gender || null,
        age: age || null,
        address: address || null,
        city,
        state,
        district: district || null,
        pincode: pincode || null,
        craftType: craftType || null,
        experience: experience || null,
        languages: languages || null,
        role: "artisan"
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        craftType: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json<ApiResponse<Partial<User>>>({
      success: true,
      data: newUser,
      message: "Artisan registered successfully"
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined
    }, { status: 500 });
  }
}