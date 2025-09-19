// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, caption, hashtags, imageUrl, userId } = body;

    // Validate required fields
    if (!title || !description || !caption || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the post in database
    const post = await db.post.create({
      data: {
        title,
        description,
        caption,
        hashtags: JSON.stringify(hashtags || []), // Store as JSON string
        imageUrl: imageUrl || null,
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
      }
    });

    // Return post with parsed hashtags for immediate use
    const postWithParsedHashtags = {
      ...post,
      hashtags: JSON.parse(post.hashtags || '[]')
    };

    return NextResponse.json(postWithParsedHashtags);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
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
        { error: "userId is required" },
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
        createdAt: 'desc'
      }
    });

    // Parse hashtags for all posts
    const postsWithParsedHashtags = posts.map(post => ({
      ...post,
      hashtags: JSON.parse(post.hashtags || '[]')
    }));

    return NextResponse.json(postsWithParsedHashtags);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}