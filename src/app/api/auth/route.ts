// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { artisanRegistrationSchema } from '@/lib/validations';
import { ApiResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    let body;
    
    // Handle both JSON and form data
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else if (contentType?.includes('application/x-www-form-urlencoded') || contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {};
      
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          body[key] = value || undefined;
        }
      }
      
      // Remove empty string values
      Object.keys(body).forEach(key => {
        if (body[key] === '') {
          body[key] = undefined;
        }
      });
    } else {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: 'Unsupported content type',
        error: 'Content-Type must be application/json or application/x-www-form-urlencoded',
        data: null
      }, { status: 400 });
    }

    // Add default values for required fields if not present
    const processedBody = {
      ...body,
      city: body.city || "Not Specified",
      state: body.state || "Not Specified",
      // Convert empty email to null
      email: body.email || null,
    };

    // Validate input data with a more flexible schema for basic signup
    const basicSignupData = {
      name: processedBody.name,
      email: processedBody.email,
      phone: processedBody.phone,
      password: processedBody.password,
      city: processedBody.city,
      state: processedBody.state,
    };

    // Basic validation without the full artisan schema
    if (!basicSignupData.name || !basicSignupData.phone || !basicSignupData.password) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: 'Missing required fields',
        error: 'Name, phone, and password are required',
        data: null
      }, { status: 400 });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(basicSignupData.phone)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: 'Invalid phone number format',
        error: 'Please enter a valid phone number',
        data: null
      }, { status: 400 });
    }

    // Validate email if provided
    if (basicSignupData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(basicSignupData.email)) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          message: 'Invalid email format',
          error: 'Please enter a valid email address',
          data: null
        }, { status: 400 });
      }
    }

    const { name, email, phone, password, city, state } = basicSignupData;

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

    // Create new user with minimal required data
    const created = await db.user.create({
      data: {
        name,
        email: email || null,
        phone,
        password: hashedPassword,
        city,
        state,
        role: "artisan",
        // Set optional fields to null
        gender: null,
        age: null,
        address: null,
        district: null,
        pincode: null,
        craftType: null,
        experience: null,
        languages: null,
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
      createdAt: created.createdAt as unknown as Date,
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
    
    // More detailed error logging
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