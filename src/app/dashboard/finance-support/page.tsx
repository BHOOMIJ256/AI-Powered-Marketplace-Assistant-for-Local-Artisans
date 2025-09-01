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
        // Fallback to sample data if API fails
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

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(scheme => scheme.category === selectedCategory);
    }

    // Filter by search term
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
    {
      id: '1',
      name: 'Ambedkar Hastshilp Vikas Yojana',
      category: 'Cluster Development',
      shortDescription: 'Integrated support for artisans through training, design development, and marketing assistance.',
      benefits: [
        'Skill training and capacity building',
        'Design development and innovation',
        'Marketing support and exhibition participation',
        'Infrastructure development',
        'Technology upgradation'
      ],
      eligibility: [
        'Registered handicraft artisans',
        'SHGs and cooperatives',
        'Women artisans (priority)',
        'Artisans from rural areas'
      ],
      applicationProcess: [
        'Submit proposal to DC Handicrafts',
        'Attach required documents',
        'Screening committee evaluation',
        'Approval and fund release'
      ],
      financialAssistance: 'Up to 80% government contribution, maximum ₹10 lakhs per cluster',
      pdfUrl: '#',
      officialWebsite: 'https://handicrafts.gov.in',
      aiSummary: 'Comprehensive support scheme for artisan clusters including training, design, marketing, and infrastructure development.',
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      name: 'Marketing Support Scheme',
      category: 'Marketing Support',
      shortDescription: 'Financial assistance for artisans to participate in exhibitions, fairs, and marketing events.',
      benefits: [
        'Exhibition participation support',
        'Marketing material development',
        'Digital marketing assistance',
        'Brand building support'
      ],
      eligibility: [
        'Individual artisans',
        'Registered handicraft units',
        'Export-oriented units',
        'Women-led enterprises'
      ],
      applicationProcess: [
        'Apply through regional office',
        'Submit event details',
        'Get approval for participation',
        'Submit reimbursement claims'
      ],
      financialAssistance: 'Up to 50% of participation cost, maximum ₹2 lakhs per year',
      pdfUrl: '#',
      officialWebsite: 'https://handicrafts.gov.in',
      aiSummary: 'Marketing support for artisans to showcase products at exhibitions and fairs with financial assistance.',
      lastUpdated: '2024-01-10'
    },
    {
      id: '3',
      name: 'Skill Training for Artisans',
      category: 'Skill Training',
      shortDescription: 'Comprehensive training programs to enhance artisan skills and productivity.',
      benefits: [
        'Technical skill enhancement',
        'Design and innovation training',
        'Quality improvement techniques',
        'Modern tool usage training'
      ],
      eligibility: [
        'All registered artisans',
        'Age 18-60 years',
        'Basic literacy required',
        'Willingness to learn'
      ],
      applicationProcess: [
        'Register at nearest training center',
        'Attend orientation session',
        'Complete training program',
        'Receive certification'
      ],
      financialAssistance: 'Free training with stipend during training period',
      pdfUrl: '#',
      officialWebsite: 'https://handicrafts.gov.in',
      aiSummary: 'Free skill development training for artisans with stipend support and certification.',
      lastUpdated: '2024-01-20'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
                         <h1 className="text-3xl font-bold text-gray-900 mb-2">
               <TranslatedText translationKey="financeSupport" />
             </h1>
             <p className="text-gray-600">
               <TranslatedText translationKey="discoverGovernmentSchemes" />
             </p>
          </div>
          <LanguageSelector />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                 <TranslatedText translationKey="searchSchemes" />
               </label>
              <input
                type="text"
                placeholder="Search by scheme name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                 <TranslatedText translationKey="filterByCategory" />
               </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
                     <div className="mt-4 text-sm text-gray-600">
             <TranslatedText translationKey="showingResults" />: {filteredSchemes.length} {filteredSchemes.length === 1 ? 'scheme' : 'schemes'}
           </div>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <div key={scheme.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Category Badge */}
                <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mb-3">
                  {scheme.category}
                </span>

                {/* Scheme Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                  {scheme.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {scheme.shortDescription}
                </p>

                {/* Key Benefits */}
                                 <div className="mb-4">
                   <h4 className="text-sm font-medium text-gray-700 mb-2">
                     <TranslatedText translationKey="keyBenefits" />:
                   </h4>
                  <ul className="space-y-1">
                    {scheme.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Financial Assistance */}
                <div className="mb-4 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">₹</span> {scheme.financialAssistance}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <TranslatedText textKey="readMore" />
                  </button>
                  <button
                    onClick={() => window.open(scheme.pdfUrl, '_blank')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    📄
                  </button>
                </div>

                {/* Last Updated */}
                <div className="mt-3 text-xs text-gray-500">
                  <TranslatedText textKey="lastUpdated" />: {new Date(scheme.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredSchemes.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              <TranslatedText textKey="noSchemesFound" />
            </h3>
            <p className="text-gray-600">
              <TranslatedText textKey="tryDifferentSearch" />
            </p>
          </div>
        )}
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mb-2">
                    {selectedScheme.category}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedScheme.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* AI Summary */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-blue-900 mb-2">🤖 AI Summary</h3>
                <p className="text-blue-800">{selectedScheme.aiSummary}</p>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Benefits */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    <TranslatedText textKey="benefits" />
                  </h3>
                  <ul className="space-y-2">
                    {selectedScheme.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Eligibility */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    <TranslatedText textKey="eligibility" />
                  </h3>
                  <ul className="space-y-2">
                    {selectedScheme.eligibility.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Application Process */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    <TranslatedText textKey="howToApply" />
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ol className="space-y-3">
                      {selectedScheme.applicationProcess.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="bg-blue-600 text-white text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    <TranslatedText textKey="financialAssistance" />
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 font-medium">{selectedScheme.financialAssistance}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => window.open(selectedScheme.pdfUrl, '_blank')}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  📄 <TranslatedText textKey="downloadFullPDF" />
                </button>
                <button
                  onClick={() => window.open(selectedScheme.officialWebsite, '_blank')}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700 transition-colors"
                >
                  🔗 <TranslatedText textKey="visitOfficialWebsite" />
                </button>
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                >
                  <TranslatedText textKey="close" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
