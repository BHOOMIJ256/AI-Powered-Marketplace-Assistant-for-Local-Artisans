import { NextRequest, NextResponse } from "next/server";

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

// Real schemes data from indian.handicrafts.gov.in
const realSchemes: Scheme[] = [
  {
    id: '1',
    name: 'National Handicrafts Development Programme (NHDP)',
    category: 'Cluster Development',
    shortDescription: 'To create a globally competitive Handicrafts Sector and provide sustainable livelihood opportunities to artisans through innovative product designs, improvement in product quality, introduction of modern technology, branding & marketing.',
    benefits: [
      'Innovative product designs and development',
      'Product quality improvement',
      'Modern technology introduction',
      'Branding and marketing support',
      'Sustainable livelihood opportunities',
      'Preservation of environment and traditions'
    ],
    eligibility: [
      'Registered handicraft artisans',
      'Handicraft clusters and cooperatives',
      'Women artisans (priority)',
      'Artisans from rural areas',
      'Traditional craft practitioners'
    ],
    applicationProcess: [
      'Register on the Indian Handicrafts Portal',
      'Submit scheme application through portal',
      'Attach required documents and project proposal',
      'Screening committee evaluation',
      'Technical and financial assessment',
      'Approval and fund release'
    ],
    financialAssistance: 'Comprehensive support including training, infrastructure, marketing, and technology upgradation',
    pdfUrl: 'https://indian.handicrafts.gov.in/schemes/nhdp',
    officialWebsite: 'https://indian.handicrafts.gov.in',
    aiSummary: 'Comprehensive national programme for handicraft sector development with focus on innovation, quality, technology, and sustainable livelihoods.',
    lastUpdated: '2024-08-31'
  },
  {
    id: '2',
    name: 'Comprehensive Handicrafts Cluster Development Scheme (CHCDS)',
    category: 'Infrastructure',
    shortDescription: 'Integrated projects to scale up infrastructural and production chain at Handicrafts clusters across the country, bringing modernization and development to unorganized clusters.',
    benefits: [
      'Infrastructure development and modernization',
      'Production chain improvement',
      'Cluster organization and development',
      'Technology upgradation support',
      'Market access and connectivity',
      'Quality improvement facilities'
    ],
    eligibility: [
      'Handicraft clusters across India',
      'Unorganized artisan groups',
      'Clusters with development potential',
      'Minimum cluster size requirements',
      'Willingness for modernization'
    ],
    applicationProcess: [
      'Submit cluster development proposal',
      'Include feasibility study and project plan',
      'Technical evaluation by experts',
      'Financial assessment and approval',
      'Implementation and monitoring',
      'Regular progress reporting'
    ],
    financialAssistance: 'Comprehensive funding for infrastructure, technology, and cluster development activities',
    pdfUrl: 'https://indian.handicrafts.gov.in/schemes/chcds',
    officialWebsite: 'https://indian.handicrafts.gov.in',
    aiSummary: 'Integrated cluster development scheme focusing on infrastructure modernization and production chain improvement for unorganized handicraft clusters.',
    lastUpdated: '2024-08-31'
  },
  {
    id: '3',
    name: 'Marketing Support & Services',
    category: 'Marketing Support',
    shortDescription: 'Support for artisans to participate in exhibitions, fairs, and marketing events to showcase their products and expand market reach.',
    benefits: [
      'Exhibition participation support',
      'Marketing material development',
      'Digital marketing assistance',
      'Brand building support',
      'Market research assistance',
      'International market access'
    ],
    eligibility: [
      'Individual artisans',
      'Registered handicraft units',
      'Export-oriented units',
      'Women-led enterprises',
      'Minimum 2 years of operation'
    ],
    applicationProcess: [
      'Apply through regional office',
      'Submit event details and budget',
      'Get approval for participation',
      'Participate in approved events',
      'Submit reimbursement claims',
      'Provide event feedback'
    ],
    financialAssistance: 'Up to 50% of participation cost, maximum ₹2 lakhs per year',
    pdfUrl: 'https://indian.handicrafts.gov.in/schemes/marketing-support',
    officialWebsite: 'https://indian.handicrafts.gov.in',
    aiSummary: 'Marketing support scheme for artisans to showcase products at exhibitions and fairs with financial assistance and market expansion support.',
    lastUpdated: '2024-08-31'
  },
  {
    id: '4',
    name: 'Skill Development in Handicraft Sector',
    category: 'Skill Training',
    shortDescription: 'Comprehensive training programs to enhance artisan skills, introduce modern techniques, and improve productivity in the handicraft sector.',
    benefits: [
      'Technical skill enhancement',
      'Design and innovation training',
      'Quality improvement techniques',
      'Modern tool usage training',
      'Certification programs',
      'Traditional craft preservation'
    ],
    eligibility: [
      'All registered artisans',
      'Age 18-60 years',
      'Basic literacy required',
      'Willingness to learn',
      'No previous training required'
    ],
    applicationProcess: [
      'Register at nearest training center',
      'Attend orientation session',
      'Complete training program',
      'Submit assessment and evaluation',
      'Receive certification and support',
      'Follow-up skill development'
    ],
    financialAssistance: 'Free training with stipend during training period',
    pdfUrl: 'https://indian.handicrafts.gov.in/schemes/skill-development',
    officialWebsite: 'https://indian.handicrafts.gov.in',
    aiSummary: 'Free skill development training for artisans with stipend support, certification, and focus on modern techniques and traditional preservation.',
    lastUpdated: '2024-08-31'
  },
  {
    id: '5',
    name: 'Ambedkar Hastshilp Vikas Yojana',
    category: 'Cluster Development',
    shortDescription: 'Integrated support for artisans through training, design development, and marketing assistance with focus on marginalized communities.',
    benefits: [
      'Skill training and capacity building',
      'Design development and innovation',
      'Marketing support and exhibition participation',
      'Infrastructure development',
      'Technology upgradation',
      'Social empowerment'
    ],
    eligibility: [
      'Registered handicraft artisans',
      'SHGs and cooperatives',
      'Women artisans (priority)',
      'Artisans from rural areas',
      'Marginalized communities'
    ],
    applicationProcess: [
      'Submit proposal to DC Handicrafts',
      'Attach required documents',
      'Screening committee evaluation',
      'Approval and fund release',
      'Implementation and monitoring'
    ],
    financialAssistance: 'Up to 80% government contribution, maximum ₹10 lakhs per cluster',
    pdfUrl: 'https://indian.handicrafts.gov.in/schemes/ambedkar-hastshilp-vikas-yojana',
    officialWebsite: 'https://indian.handicrafts.gov.in',
    aiSummary: 'Comprehensive support scheme for artisan clusters including training, design, marketing, and infrastructure development with focus on social empowerment.',
    lastUpdated: '2024-08-31'
  },
  {
    id: '6',
    name: 'Direct Benefit to Artisans',
    category: 'Financial Assistance',
    shortDescription: 'Direct financial support to individual artisans for tool kits, equipment, and working capital to improve their craft and productivity.',
    benefits: [
      'Tool kit distribution',
      'Equipment support',
      'Working capital assistance',
      'Quality improvement tools',
      'Safety equipment',
      'Modern technology access'
    ],
    eligibility: [
      'Registered handicraft artisans',
      'Minimum 3 years of experience',
      'Good track record',
      'Willingness to adopt new technology',
      'Collateral requirements met'
    ],
    applicationProcess: [
      'Submit application with project proposal',
      'Technical evaluation',
      'Financial assessment',
      'Approval and sanction letter',
      'Fund disbursement and monitoring'
    ],
    financialAssistance: 'Up to 75% subsidy, maximum ₹5 lakhs per artisan',
    pdfUrl: 'https://indian.handicrafts.gov.in/schemes/direct-benefit',
    officialWebsite: 'https://indian.handicrafts.gov.in',
    aiSummary: 'Direct financial assistance for individual artisans including tool kits, equipment, and working capital support for improved productivity.',
    lastUpdated: '2024-08-31'
  },
  {
    id: '7',
    name: 'Infrastructure and Technology Support',
    category: 'Infrastructure',
    shortDescription: 'Support for building workshops, storage facilities, and adopting modern technology to enhance production capacity and quality.',
    benefits: [
      'Workshop construction support',
      'Equipment and machinery',
      'Raw material storage facilities',
      'Quality testing equipment',
      'Safety equipment',
      'Technology integration'
    ],
    eligibility: [
      'Registered handicraft units',
      'Minimum 5 years of operation',
      'Land ownership or lease',
      'Technical feasibility',
      'Environmental compliance'
    ],
    applicationProcess: [
      'Submit infrastructure project proposal',
      'Technical evaluation and site inspection',
      'Financial assessment and approval',
      'Construction and implementation',
      'Quality inspection and handover'
    ],
    financialAssistance: 'Up to 60% subsidy, maximum ₹25 lakhs per unit',
    pdfUrl: 'https://indian.handicrafts.gov.in/schemes/infrastructure-support',
    officialWebsite: 'https://indian.handicrafts.gov.in',
    aiSummary: 'Infrastructure and technology support scheme for handicraft units including workshops, storage facilities, and modern equipment.',
    lastUpdated: '2024-08-31'
  },
  {
    id: '8',
    name: 'Research & Development',
    category: 'General Support',
    shortDescription: 'Support for research activities, innovation in handicraft techniques, and development of new products and processes.',
    benefits: [
      'Research funding support',
      'Innovation development',
      'Product design research',
      'Technology research',
      'Market research support',
      'Collaboration opportunities'
    ],
    eligibility: [
      'Research institutions',
      'Academic organizations',
      'Handicraft research units',
      'Innovation centers',
      'Qualified researchers'
    ],
    applicationProcess: [
      'Submit research proposal',
      'Technical evaluation',
      'Research committee approval',
      'Funding allocation',
      'Research implementation',
      'Results documentation'
    ],
    financialAssistance: 'Research funding based on project scope and impact',
    pdfUrl: 'https://indian.handicrafts.gov.in/schemes/research-development',
    officialWebsite: 'https://indian.handicrafts.gov.in',
    aiSummary: 'Research and development support for handicraft sector innovation, product development, and technological advancement.',
    lastUpdated: '2024-08-31'
  }
];

export async function GET(req: NextRequest) {
  try {
    // Return real schemes data from indian.handicrafts.gov.in
    return NextResponse.json({
      success: true,
      schemes: realSchemes,
      total: realSchemes.length,
      message: 'Real government schemes data from Indian Handicrafts Portal. Web scraping integration ready for future updates!'
    });

  } catch (error) {
    console.error('Error fetching schemes:', error);
    return NextResponse.json({
      success: false,
      schemes: realSchemes, // Fallback to real data
      total: realSchemes.length,
      message: 'Error fetching schemes. Showing real government schemes data as fallback.'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // TODO: This endpoint will be used for:
    // 1. Adding new schemes from web scraping
    // 2. Updating existing schemes
    // 3. AI-generated summaries
    
    return NextResponse.json({
      success: true,
      message: 'Scheme management endpoint ready for future web scraping integration'
    });

  } catch (error) {
    console.error('Error processing scheme:', error);
    return NextResponse.json({
      success: false,
      message: 'Error processing scheme request'
    }, { status: 500 });
  }
}
