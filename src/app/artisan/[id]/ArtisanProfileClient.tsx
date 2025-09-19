// ArtisanProfileClient.tsx - Updated with better integration
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
  const [isLoading, setIsLoading] = useState(false);

  // Function to add new post from StoryTool
  const handleNewPost = async (newPostData: {
    title: string;
    description: string;
    caption: string;
    hashtags: string[];
    imageUrl?: string;
  }) => {
    setIsLoading(true);
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

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      const savedPost = await response.json();
      
      // Add to local state at the beginning
      setPosts(prev => [savedPost, ...prev]);
      
      // Switch to posts tab to show the new post
      setActiveTab("posts");
      
      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'posts');
      window.history.pushState({}, '', url.toString());

    } catch (error) {
      console.error('Failed to save post:', error);
      throw error; // Let StoryTool handle the error display
    } finally {
      setIsLoading(false);
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
          className={`px-3 py-2 text-sm transition-colors ${
            activeTab === 'posts' 
              ? 'border-b-2 border-foreground font-medium text-foreground' 
              : 'text-gray-500 hover:text-foreground'
          }`}
        >
          Posts ({posts.length})
        </button>
        <button 
          onClick={() => handleTabChange("shop")}
          className={`px-3 py-2 text-sm transition-colors ${
            activeTab === 'shop' 
              ? 'border-b-2 border-foreground font-medium text-foreground' 
              : 'text-gray-500 hover:text-foreground'
          }`}
        >
          Shop ({shopProducts.length})
        </button>
      </nav>

      {activeTab === 'posts' ? (
        <section className="space-y-4">
          {isLoading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving post...
              </div>
            </div>
          )}
          
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {posts.map((post, i) => (
                  <div 
                    key={post.id} 
                    className="group aspect-square rounded border bg-foreground/5 overflow-hidden cursor-pointer hover:shadow-lg transition-all relative shadow-md shadow-amber-900/30"
                  >
                    {post.imageUrl ? (
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                        <div className="text-center p-2">
                          <div className="text-2xl mb-1">📝</div>
                          <h4 className="text-xs font-medium line-clamp-2">{post.title}</h4>
                        </div>
                      </div>
                    )}
                    
                    {/* Hover overlay with post details */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 flex flex-col justify-between text-white">
                      <div>
                        <h4 className="text-xs font-semibold line-clamp-2 mb-1">{post.title}</h4>
                        <p className="text-xs opacity-90 line-clamp-3">{post.description}</p>
                        {post.hashtags.length > 0 && (
                          <div className="mt-1">
                            <span className="text-xs text-blue-200">
                              #{post.hashtags.slice(0, 2).join(' #')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs opacity-75">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    
                    {/* New post indicator */}
                    {i === 0 && posts.length > initialPosts.length && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Detailed view option */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-3 text-gray-700">Recent Posts - Detailed View</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {posts.slice(0, 3).map((post) => (
                    <div key={`detailed-${post.id}`} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        {post.imageUrl && (
                          <img 
                            src={post.imageUrl} 
                            alt={post.title}
                            className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                            loading="lazy"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{post.title}</h4>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{post.description}</p>
                          <p className="text-xs text-gray-500 mb-2 italic">"{post.caption}"</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.hashtags.slice(0, 4).map((tag, i) => (
                              <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                #{tag}
                              </span>
                            ))}
                            {post.hashtags.length > 4 && (
                              <span className="text-xs text-gray-500">+{post.hashtags.length - 4} more</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
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
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-amber-100 to-orange-200 rounded-md flex items-center justify-center">
                        <span className="text-amber-600 text-4xl">🏺</span>
                      </div>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                        <span className="text-white font-medium text-sm bg-red-600 px-3 py-1 rounded">Out of Stock</span>
                      </div>
                    )}
                    {product.category && (
                      <span className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-1 rounded-full font-medium">
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
              <Link 
                href="/dashboard/products/new"
                className="mt-4 inline-block rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90"
              >
                Add Product
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Story Tool - Always visible at bottom */}
      <div className="border-t pt-6 mt-6">
        <StoryTool onPostCreated={handleNewPost} />
      </div>
    </>
  );
}