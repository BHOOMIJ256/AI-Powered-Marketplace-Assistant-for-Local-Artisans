// lib/types.ts
export interface Post {
  id: string;
  title: string;
  description: string;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in rupees (converted from paise)
  imageUrl?: string;
  category?: string;
  inStock: boolean;
  stock?: number;
}

export interface Artisan {
  id: string;
  name: string;
  city: string;
  state: string;
  craftType?: string;
}

export interface StoryResult {
  title: string;
  description: string;
  caption: string;
  hashtags: string[];
}

export interface NewPostData {
  title: string;
  description: string;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
}