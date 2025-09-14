"use client";

import { useState } from "react";
import Link from "next/link";
import StoryTool from "./StoryTool";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  title: string;
  description: string;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  createdAt: Date;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
  inStock: boolean;
}

interface Artisan {
  id: string;
  name: string;
  city: string;
  state: string;
  craftType?: string;
}

interface Props {
  artisan: Artisan;
  initialPosts: Post[];
  shopProducts: Product[];
  activeTab: "posts" | "shop";
}

export default function ArtisanProfileClient({ 
  artisan, 
  initialPosts, 
  shopProducts, 
  activeTab: initialActiveTab 
}: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeTab, setActiveTab] = useState<"posts" | "shop">(initialActiveTab);

  // Function to add new post from StoryTool
  const handleNewPost = async (newPostData: {
    title: string;
    description: string;
    caption: string;
    hashtags: string[];
    imageUrl?: string;
  }) => {
    try {
      // Save to database
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPostData,
          userId: artisan.id
        }),
      });

      if (response.ok) {
        const savedPost = await response.json();
        // Add to local state
        setPosts(prev => [savedPost, ...prev]);
        
        // Switch to posts tab to show the new post
        setActiveTab("posts");
      }
    } catch (error) {
      console.error('Failed to save post:', error);
    }
  };

  const handleTabChange = (tab: "posts" | "shop") => {
    setActiveTab(tab);
    // Update URL without page refresh
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <>
      <nav className="flex gap-3 border-b">
        <button 
          onClick={() => handleTabChange("posts")}
          className={`px-3 py-2 text-sm ${
            activeTab === 'posts' 
              ? 'border-b-2 border-foreground font-medium' 
              : 'text-gray-500 hover:text-foreground'
          }`}
        >
          Posts ({posts.length})
        </button>
        <button 
          onClick={() => handleTabChange("shop")}
          className={`px-3 py-2 text-sm ${
            activeTab === 'shop' 
              ? 'border-b-2 border-foreground font-medium' 
              : 'text-gray-500 hover:text-foreground'
          }`}
        >
          Shop ({shopProducts.length})
        </button>
      </nav>

      {activeTab === 'posts' ? (
        <section className="space-y-4">
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {posts.map((post, i) => (
                  <div 
                    key={post.id} 
                    className="group aspect-square rounded border bg-foreground/5 overflow-hidden cursor-pointer hover:shadow-md transition-all relative"
                  >
                    {post.imageUrl ? (
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                        <div className="text-center p-2">
                          <h4 className="text-xs font-medium line-clamp-2">{post.title}</h4>
                        </div>
                      </div>
                    )}
                    
                    {/* Hover overlay with post details */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 flex flex-col justify-between text-white">
                      <div>
                        <h4 className="text-xs font-semibold line-clamp-2 mb-1">{post.title}</h4>
                        <p className="text-xs opacity-90 line-clamp-3">{post.description}</p>
                      </div>
                      <div className="text-xs opacity-75">
                        {formatDistanceToNow(new Date(post.createdAt))} ago
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Detailed view option */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-3 text-gray-700">Recent Posts - Detailed View</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {posts.slice(0, 3).map((post) => (
                    <div key={`detailed-${post.id}`} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex gap-4">
                        {post.imageUrl && (
                          <img 
                            src={post.imageUrl} 
                            alt={post.title}
                            className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{post.title}</h4>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{post.description}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.hashtags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                #{tag}
                              </span>
                            ))}
                            {post.hashtags.length > 3 && (
                              <span className="text-xs text-gray-500">+{post.hashtags.length - 3} more</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(post.createdAt))} ago
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                📝
              </div>
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p className="text-sm">Create your first post using the story generator below!</p>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          {shopProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative mb-3">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-gray-400 text-4xl">🏺</span>
                      </div>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                        <span className="text-white font-medium text-sm">Out of Stock</span>
                      </div>
                    )}
                    {product.category && (
                      <span className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-green-600">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <button 
                        className={`rounded-md px-4 py-2 text-xs font-medium transition-colors ${
                          product.inStock 
                            ? 'bg-foreground text-background hover:bg-foreground/90' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!product.inStock}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                🏪
              </div>
              <h3 className="text-lg font-medium mb-2">No products yet</h3>
              <p className="text-sm">Add products to your shop to start selling!</p>
              <button className="mt-4 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium">
                Add Product
              </button>
            </div>
          )}
        </section>
      )}

      {/* Story Tool - Always visible at bottom */}
      <div className="border-t pt-6">
        <StoryTool onPostCreated={handleNewPost} />
      </div>
    </>
  );
}