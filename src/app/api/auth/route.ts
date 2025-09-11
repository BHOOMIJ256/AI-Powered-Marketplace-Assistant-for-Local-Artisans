// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { artisanRegistrationSchema } from '@/lib/validations';
import { ApiResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    let body: any;
    
    // Check content type and parse accordingly
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Handle JSON data
      body = await request.json();
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      // Handle form data
      const formData = await request.formData();
      body = {};
      
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        if (key === 'languages') {
          // Handle languages as array if it's sent as comma-separated or multiple values
          if (body[key]) {
            // If key already exists, make it an array
            body[key] = Array.isArray(body[key]) ? [...body[key], value] : [body[key], value];
          } else {
            // Try to parse as JSON array first, fallback to splitting by comma
            try {
              body[key] = JSON.parse(value as string);
            } catch {
              body[key] = (value as string).split(',').map(lang => lang.trim()).filter(Boolean);
            }
          }
        } else if (key === 'age') {
          // Convert age to number
          body[key] = value ? parseInt(value as string, 10) : undefined;
        } else {
          body[key] = value === '' ? undefined : value;
        }
      }
    } else {
      // Handle raw form data (URLSearchParams)
      const formData = await request.text();
      const params = new URLSearchParams(formData);
      body = {};
      
      for (const [key, value] of params.entries()) {
        if (key === 'languages') {
          // Handle languages array
          try {
            body[key] = JSON.parse(value);
          } catch {
            body[key] = value.split(',').map(lang => lang.trim()).filter(Boolean);
          }
        } else if (key === 'age') {
          body[key] = value ? parseInt(value, 10) : undefined;
        } else {
          body[key] = value === '' ? undefined : value;
        }
      }
    }

    console.log('Parsed body:', body); // Debug log

    // Validate input data
    const validationResult = artisanRegistrationSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error);
      
      return NextResponse.json<ApiResponse<any>>({
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
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: 'User already exists with this phone number or email',
        error: 'User already exists with this phone number or email',
        data: null
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const created = await db.user.create({
      data: {
        name,
        email: email || null,
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
        languages: Array.isArray(languages) ? JSON.stringify(languages) : (languages ?? null),
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

    const newUser: Partial<User> = {
      id: created.id,
      name: created.name,
      email: created.email ?? undefined,
      phone: created.phone,
      city: created.city,
      state: created.state,
      craftType: created.craftType ?? undefined,
      role: created.role,
      isVerified: created.isVerified,
      isActive: created.isActive,
      createdAt: created.createdAt,
    };

    const res = NextResponse.json<ApiResponse<Partial<User>>>(
      {
        success: true,
        data: newUser,
        message: "Artisan registered successfully"
      },
      { status: 201 }
    );

    res.cookies.set('session_user', created.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? (error as Error)?.message : 'Internal server error',
      data: null
    }, { status: 500 });
  }
}