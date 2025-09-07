"use client";

import { useState, useEffect } from 'react';
import TranslatedText from '@/components/TranslatedText';
import LanguageSelector from '@/components/LanguageSelector';
import MapView from '../MapView';

interface CustomerInsights {
  topRegions: Array<{ region: string; orders: number; sales: number }>;
  topProducts: Array<{ name: string; sales: number; orders: number }>;
  buyerPreferences: {
    priceRange: { min: number; max: number; avg: number };
    popularCategories: Array<{ category: string; count: number }>;
    seasonalTrends: Array<{ month: string; orders: number }>;
  };
  totalCustomers: number;
  repeatCustomers: number;
  averageOrderValue: number;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<CustomerInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/insights/customer');
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
      } else {
        // Fallback to sample data if API fails
        setInsights(getSampleInsights());
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsights(getSampleInsights());
    } finally {
      setLoading(false);
    }
  };

  const getSampleInsights = (): CustomerInsights => ({
    topRegions: [
      { region: 'Mumbai, Maharashtra', orders: 12, sales: 45000 },
      { region: 'Delhi, Delhi', orders: 8, sales: 32000 },
      { region: 'Bangalore, Karnataka', orders: 6, sales: 28000 },
      { region: 'Pune, Maharashtra', orders: 5, sales: 22000 },
      { region: 'Chennai, Tamil Nadu', orders: 4, sales: 18000 }
    ],
    topProducts: [
      { name: 'Hand-painted Diyas', sales: 25000, orders: 15 },
      { name: 'Block-printed Scarves', sales: 18000, orders: 12 },
      { name: 'Terracotta Planters', sales: 15000, orders: 8 },
      { name: 'Bamboo Baskets', sales: 12000, orders: 6 },
      { name: 'Handwoven Rugs', sales: 10000, orders: 5 }
    ],
    buyerPreferences: {
      priceRange: { min: 300, max: 1200, avg: 650 },
      popularCategories: [
        { category: 'Home Decor', count: 25 },
        { category: 'Textiles', count: 18 },
        { category: 'Kitchenware', count: 12 },
        { category: 'Jewelry', count: 8 }
      ],
      seasonalTrends: [
        { month: 'Jan', orders: 8 },
        { month: 'Feb', orders: 12 },
        { month: 'Mar', orders: 15 },
        { month: 'Apr', orders: 10 },
        { month: 'May', orders: 18 },
        { month: 'Jun', orders: 22 }
      ]
    },
    totalCustomers: 46,
    repeatCustomers: 12,
    averageOrderValue: 650
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-amber-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-amber-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-amber-200 rounded"></div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-amber-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-amber-200 rounded w-full"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-amber-100 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="text-amber-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-amber-800 mb-2">
            <TranslatedText translationKey="noInsightsAvailable" />
          </h3>
          <p className="text-amber-600">
            <TranslatedText translationKey="startSellingToSeeInsights" />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-800 mb-2">
              <TranslatedText translationKey="customerInsights" />
            </h1>
            <p className="text-amber-600">
              <TranslatedText translationKey="understandYourCustomers" />
            </p>
          </div>
          <LanguageSelector />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                  <p className="text-sm font-medium text-amber-800">
                  <TranslatedText translationKey="totalCustomers" />
                </p>
                <p className="text-2xl font-semibold text-amber-800">{insights.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-amber-800">
                  <TranslatedText translationKey="repeatCustomers" />
                </p>
                <p className="text-2xl font-semibold text-amber-800">{insights.repeatCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-amber-800">
                  <TranslatedText translationKey="averageOrderValue" />
                </p>
                <p className="text-2xl font-semibold text-amber-800">₹{insights.averageOrderValue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-amber-800">
                  <TranslatedText translationKey="retentionRate" />
                </p>
                <p className="text-2xl font-semibold text-amber-800">
                  {Math.round((insights.repeatCustomers / insights.totalCustomers) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-amber-800">
                <TranslatedText translationKey="locationWiseDemand" />
              </h2>
              <p className="text-sm text-amber-800">
                <TranslatedText translationKey="customerLocations" />
              </p>
            </div>
            <div className="p-6">
              <MapView />
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-amber-800">
              <TranslatedText translationKey="topProducts" />
            </h2>
            <div className="space-y-4">
              {insights.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-amber-800">{product.name}</p>
                      <p className="text-xs text-amber-500">{product.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-800">₹{product.sales}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Top Regions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-amber-800">
              <TranslatedText translationKey="topRegions" />
            </h2>
            <div className="space-y-4">
              {insights.topRegions.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-600">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-amber-800">{region.region}</p>
                      <p className="text-xs text-amber-500">{region.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-800">₹{region.sales}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buyer Preferences */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-amber-800">
              <TranslatedText translationKey="buyerPreferences" />
            </h2>
            
            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-amber-800 mb-2">
                <TranslatedText translationKey="priceRange" />
              </h3>
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>₹{insights.buyerPreferences.priceRange.min}</span>
                  <span className="font-medium">₹{insights.buyerPreferences.priceRange.avg} avg</span>
                  <span>₹{insights.buyerPreferences.priceRange.max}</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${((insights.buyerPreferences.priceRange.avg - insights.buyerPreferences.priceRange.min) / 
                        (insights.buyerPreferences.priceRange.max - insights.buyerPreferences.priceRange.min)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="mb-6">
                <h3 className="text-sm font-medium text-amber-800 mb-2">
                <TranslatedText translationKey="popularCategories" />
              </h3>
              <div className="space-y-2">
                {insights.buyerPreferences.popularCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-amber-600">{category.category}</span>
                    <span className="text-sm font-medium text-amber-800">{category.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seasonal Trends */}
            <div>
              <h3 className="text-sm font-medium text-amber-800 mb-2">
                <TranslatedText translationKey="seasonalTrends" />
              </h3>
              <div className="flex items-end justify-between h-20">
                {insights.buyerPreferences.seasonalTrends.map((trend, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-blue-500 rounded-t w-6 mb-1"
                      style={{ height: `${(trend.orders / Math.max(...insights.buyerPreferences.seasonalTrends.map(t => t.orders))) * 60}px` }}
                    ></div>
                    <span className="text-xs text-amber-500">{trend.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 