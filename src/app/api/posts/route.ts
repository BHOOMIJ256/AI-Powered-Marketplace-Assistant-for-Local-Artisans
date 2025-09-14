// app/api/posts/route.ts - Updated for SQLite schema
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, caption, hashtags, imageUrl, userId } = body;

    if (!title || !description || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert hashtags array to JSON string for SQLite
    const hashtagsJson = hashtags ? JSON.stringify(hashtags) : '[]';

    const post = await db.post.create({
      data: {
        title,
        description,
        caption: caption || '',
        hashtags: hashtagsJson,
        imageUrl,
        userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        caption: true,
        hashtags: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    // Parse hashtags back to array for response
    const responsePost = {
      ...post,
      hashtags: JSON.parse(post.hashtags)
    };

    return NextResponse.json(responsePost);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const posts = await db.post.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        caption: true,
        hashtags: true,
        imageUrl: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse hashtags JSON strings back to arrays
    const postsWithParsedHashtags = posts.map(post => ({
      ...post,
      hashtags: JSON.parse(post.hashtags)
    }));

    return NextResponse.json(postsWithParsedHashtags);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}