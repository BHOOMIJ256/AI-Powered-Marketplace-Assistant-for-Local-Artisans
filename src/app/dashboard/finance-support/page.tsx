"use client";

import { useState, useEffect } from 'react';
import TranslatedText from '@/components/TranslatedText';
import LanguageSelector from '@/components/LanguageSelector';

interface Scheme {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  benefits: string[];
  eligibility: string[];
  applicationProcess: string[];
  financialAssistance: string;
  pdfUrl: string;
  officialWebsite: string;
  aiSummary: string;
  lastUpdated: string;
}

export default function FinanceSupportPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  const categories = [
    'all',
    'Cluster Development',
    'Skill Training',
    'Marketing Support',
    'Financial Assistance',
    'Infrastructure',
    'Women Empowerment',
    'Export Promotion'
  ];

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [schemes, searchTerm, selectedCategory]);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schemes');
      if (response.ok) {
        const data = await response.json();
        setSchemes(data.schemes || []);
      } else {
        setSchemes(getSampleSchemes());
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
      setSchemes(getSampleSchemes());
    } finally {
      setLoading(false);
    }
  };

  const filterSchemes = () => {
    let filtered = schemes;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(scheme => scheme.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(scheme =>
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredSchemes(filtered);
  };

  const getSampleSchemes = (): Scheme[] => [
    // your existing sample data
  ];

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-[rgba(139,69,19,0.1)]">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-amber-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-amber-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-amber-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-amber-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-[rgba(139,69,19,0.1)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-800 mb-2">
              <TranslatedText translationKey="financeSupport" />
            </h1>
            <p className="text-amber-800">
              <TranslatedText translationKey="discoverGovernmentSchemes" />
            </p>
          </div>
          <LanguageSelector />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-amber-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                <TranslatedText translationKey="searchSchemes" />
              </label>
              <input
                type="text"
                placeholder="Search by scheme name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-amber-700 rounded-md focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] text-black"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                <TranslatedText translationKey="filterByCategory" />
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-amber-700 rounded-md focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] text-black"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-amber-600">
            <TranslatedText translationKey="showingResults" />: {filteredSchemes.length} {filteredSchemes.length === 1 ? 'scheme' : 'schemes'}
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <div key={scheme.id} className="bg-amber-50 rounded-lg shadow-sm hover:shadow-md transition-shadow border-2 border-amber-600">
              <div className="p-6">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full mb-3">
                  {scheme.category}
                </span>
                <h3 className="text-lg font-semibold text-amber-800 mb-3 line-clamp-2">
                  {scheme.name}
                </h3>
                <p className="text-amber-600 text-sm mb-4 line-clamp-3">
                  {scheme.shortDescription}
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">
                    <TranslatedText translationKey="keyBenefits" />:
                  </h4>
                  <ul className="space-y-1">
                    {scheme.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="text-xs text-amber-600 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">₹</span> {scheme.financialAssistance}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="flex-1 bg-[#A67B5B] text-[#F5F5DC] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#8B5E3C] transition-colors"
                  >
                    <TranslatedText translationKey="readMore" />
                  </button>
                  <button
                    onClick={() => window.open(scheme.pdfUrl, '_blank')}
                    className="px-4 py-2 border border-amber-700 text-amber-700 rounded-md text-sm font-medium hover:bg-amber-50 transition-colors"
                  >
                    📄
                  </button>
                </div>

                <div className="mt-3 text-xs text-amber-500">
                  <TranslatedText translationKey="lastUpdated" />: {new Date(scheme.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredSchemes.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-amber-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-amber-800 mb-2">
              <TranslatedText translationKey="noSchemesFound" />
            </h3>
            <p className="text-amber-600">
              <TranslatedText translationKey="tryDifferentSearch" />
            </p>
          </div>
        )}
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header and content unchanged */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
