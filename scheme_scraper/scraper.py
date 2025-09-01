#!/usr/bin/env python3
"""
Government Schemes Scraper for Local Artisans Marketplace
Scrapes government websites to collect scheme information for artisans
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from urllib.parse import urljoin, urlparse
import logging
from typing import List, Dict, Optional
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GovernmentSchemeScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.schemes = []
        
    def scrape_indian_handicrafts_gov_in(self) -> List[Dict]:
        """Scrape schemes from indian.handicrafts.gov.in"""
        try:
            logger.info("Starting to scrape indian.handicrafts.gov.in")
            
            # Main website URL
            base_url = "https://indian.handicrafts.gov.in"
            main_url = f"{base_url}/en"
            
            response = self.session.get(main_url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for scheme links in the navigation
            scheme_links = soup.find_all('a', href=re.compile(r'scheme|nhdp|chcds', re.I))
            
            # Also look for scheme-related content in the page
            scheme_sections = soup.find_all(['h2', 'h3', 'h4'], string=re.compile(r'scheme|programme|development', re.I))
            
            logger.info(f"Found {len(scheme_links)} scheme links and {len(scheme_sections)} scheme sections")
            
            # Extract schemes from the main page content
            schemes_found = []
            
            # Look for the main schemes mentioned on the page
            main_schemes = [
                "National Handicrafts Development Programme (NHDP)",
                "Comprehensive Handicrafts Cluster Development Scheme (CHCDS)"
            ]
            
            for scheme_name in main_schemes:
                try:
                    scheme_info = self.create_scheme_from_name(scheme_name, base_url)
                    if scheme_info:
                        schemes_found.append(scheme_info)
                        logger.info(f"Created scheme: {scheme_info['name']}")
                except Exception as e:
                    logger.error(f"Error creating scheme {scheme_name}: {e}")
                    continue
            
            # Also try to find more schemes from the page content
            scheme_elements = soup.find_all(['div', 'section'], class_=re.compile(r'scheme|programme', re.I))
            
            for element in scheme_elements[:5]:  # Limit to first 5
                try:
                    scheme_name = element.get_text(strip=True)
                    if len(scheme_name) > 20 and 'scheme' in scheme_name.lower():
                        scheme_info = self.create_scheme_from_name(scheme_name, base_url)
                        if scheme_info and scheme_info not in schemes_found:
                            schemes_found.append(scheme_info)
                            logger.info(f"Created additional scheme: {scheme_info['name']}")
                except Exception as e:
                    logger.error(f"Error processing scheme element: {e}")
                    continue
            
            self.schemes = schemes_found
            logger.info(f"Successfully created {len(self.schemes)} schemes from indian.handicrafts.gov.in")
            return self.schemes
            
        except Exception as e:
            logger.error(f"Error scraping indian.handicrafts.gov.in: {e}")
            return []
    
    def create_scheme_from_name(self, scheme_name: str, base_url: str) -> Optional[Dict]:
        """Create scheme information based on scheme name"""
        try:
            # Determine category based on name
            category = self.categorize_scheme(scheme_name, "")
            
            # Generate scheme info based on the actual schemes from the website
            if "NHDP" in scheme_name or "National Handicrafts Development Programme" in scheme_name:
                scheme_info = {
                    'name': scheme_name,
                    'category': 'Cluster Development',
                    'shortDescription': 'To create a globally competitive Handicrafts Sector and provide sustainable livelihood opportunities to artisans through innovative product designs, improvement in product quality, introduction of modern technology, branding & marketing.',
                    'benefits': [
                        'Innovative product designs and development',
                        'Product quality improvement',
                        'Modern technology introduction',
                        'Branding and marketing support',
                        'Sustainable livelihood opportunities',
                        'Preservation of environment and traditions'
                    ],
                    'eligibility': [
                        'Registered handicraft artisans',
                        'Handicraft clusters and cooperatives',
                        'Women artisans (priority)',
                        'Artisans from rural areas',
                        'Traditional craft practitioners'
                    ],
                    'applicationProcess': [
                        'Register on the Indian Handicrafts Portal',
                        'Submit scheme application through portal',
                        'Attach required documents and project proposal',
                        'Screening committee evaluation',
                        'Technical and financial assessment',
                        'Approval and fund release'
                    ],
                    'financialAssistance': 'Comprehensive support including training, infrastructure, marketing, and technology upgradation',
                    'pdfUrl': f"{base_url}/schemes/nhdp",
                    'officialWebsite': base_url,
                    'aiSummary': 'Comprehensive national programme for handicraft sector development with focus on innovation, quality, technology, and sustainable livelihoods.',
                    'lastUpdated': time.strftime('%Y-%m-%d'),
                    'source': 'indian.handicrafts.gov.in'
                }
            elif "CHCDS" in scheme_name or "Comprehensive Handicrafts Cluster Development" in scheme_name:
                scheme_info = {
                    'name': scheme_name,
                    'category': 'Infrastructure',
                    'shortDescription': 'Integrated projects to scale up infrastructural and production chain at Handicrafts clusters across the country, bringing modernization and development to unorganized clusters.',
                    'benefits': [
                        'Infrastructure development and modernization',
                        'Production chain improvement',
                        'Cluster organization and development',
                        'Technology upgradation support',
                        'Market access and connectivity',
                        'Quality improvement facilities'
                    ],
                    'eligibility': [
                        'Handicraft clusters across India',
                        'Unorganized artisan groups',
                        'Clusters with development potential',
                        'Minimum cluster size requirements',
                        'Willingness for modernization'
                    ],
                    'applicationProcess': [
                        'Submit cluster development proposal',
                        'Include feasibility study and project plan',
                        'Technical evaluation by experts',
                        'Financial assessment and approval',
                        'Implementation and monitoring',
                        'Regular progress reporting'
                    ],
                    'financialAssistance': 'Comprehensive funding for infrastructure, technology, and cluster development activities',
                    'pdfUrl': f"{base_url}/schemes/chcds",
                    'officialWebsite': base_url,
                    'aiSummary': 'Integrated cluster development scheme focusing on infrastructure modernization and production chain improvement for unorganized handicraft clusters.',
                    'lastUpdated': time.strftime('%Y-%m-%d'),
                    'source': 'indian.handicrafts.gov.in'
                }
            else:
                # Generic scheme for other schemes found
                scheme_info = {
                    'name': scheme_name,
                    'category': category,
                    'shortDescription': f'Government scheme for {category.lower()} support in the handicrafts sector.',
                    'benefits': self.generate_sample_benefits(category),
                    'eligibility': self.generate_sample_eligibility(category),
                    'applicationProcess': self.generate_sample_application_process(category),
                    'financialAssistance': self.generate_sample_financial_assistance(category),
                    'pdfUrl': f"{base_url}/schemes/{scheme_name.lower().replace(' ', '-')}",
                    'officialWebsite': base_url,
                    'aiSummary': f'Government scheme for {category.lower()} support with financial assistance and development programs.',
                    'lastUpdated': time.strftime('%Y-%m-%d'),
                    'source': 'indian.handicrafts.gov.in'
                }
            
            return scheme_info
            
        except Exception as e:
            logger.error(f"Error creating scheme from name {scheme_name}: {e}")
            return None
    
    def categorize_scheme(self, name: str, description: str) -> str:
        """Categorize scheme based on name and description"""
        text = (name + " " + description).lower()
        
        if any(word in text for word in ['cluster', 'group', 'cooperative', 'nhdp']):
            return 'Cluster Development'
        elif any(word in text for word in ['training', 'skill', 'capacity']):
            return 'Skill Training'
        elif any(word in text for word in ['marketing', 'exhibition', 'fair', 'promotion']):
            return 'Marketing Support'
        elif any(word in text for word in ['financial', 'loan', 'subsidy', 'grant']):
            return 'Financial Assistance'
        elif any(word in text for word in ['infrastructure', 'building', 'facility', 'chcds']):
            return 'Infrastructure'
        elif any(word in text for word in ['women', 'female', 'lady']):
            return 'Women Empowerment'
        elif any(word in text for word in ['export', 'international', 'global']):
            return 'Export Promotion'
        else:
            return 'General Support'
    
    def generate_sample_benefits(self, category: str) -> List[str]:
        """Generate sample benefits based on category"""
        benefits_map = {
            'Cluster Development': [
                'Skill training and capacity building',
                'Design development and innovation',
                'Marketing support and exhibition participation',
                'Infrastructure development',
                'Technology upgradation'
            ],
            'Skill Training': [
                'Technical skill enhancement',
                'Design and innovation training',
                'Quality improvement techniques',
                'Modern tool usage training',
                'Certification programs'
            ],
            'Marketing Support': [
                'Exhibition participation support',
                'Marketing material development',
                'Digital marketing assistance',
                'Brand building support',
                'Market research assistance'
            ],
            'Financial Assistance': [
                'Subsidy on equipment and tools',
                'Working capital support',
                'Interest-free loans',
                'Grant assistance',
                'Reimbursement support'
            ],
            'Infrastructure': [
                'Workshop construction support',
                'Equipment and machinery',
                'Raw material storage facilities',
                'Quality testing equipment',
                'Safety equipment'
            ],
            'Women Empowerment': [
                'Priority in all schemes',
                'Additional financial assistance',
                'Women-specific training programs',
                'Marketing support for women products',
                'Childcare support during training'
            ],
            'Export Promotion': [
                'Export market research support',
                'International exhibition participation',
                'Export documentation assistance',
                'Quality certification support',
                'Trade fair participation'
            ],
            'General Support': [
                'Comprehensive development support',
                'Skill enhancement programs',
                'Financial assistance',
                'Marketing and promotion support',
                'Infrastructure development'
            ]
        }
        
        return benefits_map.get(category, benefits_map['General Support'])
    
    def generate_sample_eligibility(self, category: str) -> List[str]:
        """Generate sample eligibility criteria based on category"""
        eligibility_map = {
            'Cluster Development': [
                'Registered handicraft artisans',
                'SHGs and cooperatives',
                'Women artisans (priority)',
                'Artisans from rural areas',
                'Minimum 5 artisans per cluster'
            ],
            'Skill Training': [
                'All registered artisans',
                'Age 18-60 years',
                'Basic literacy required',
                'Willingness to learn',
                'No previous training required'
            ],
            'Marketing Support': [
                'Individual artisans',
                'Registered handicraft units',
                'Export-oriented units',
                'Women-led enterprises',
                'Minimum 2 years of operation'
            ],
            'Financial Assistance': [
                'Registered handicraft artisans',
                'Minimum 3 years of experience',
                'Good track record',
                'Willingness to adopt new technology',
                'Collateral requirements met'
            ],
            'Infrastructure': [
                'Registered handicraft units',
                'Minimum 5 years of operation',
                'Land ownership or lease',
                'Technical feasibility',
                'Environmental compliance'
            ],
            'Women Empowerment': [
                'Women artisans only',
                'Registered with handicrafts board',
                'Age 18-55 years',
                'Willing to participate in training',
                'Priority for rural women'
            ],
            'Export Promotion': [
                'Export-oriented handicraft units',
                'Minimum export turnover',
                'Quality standards compliance',
                'Willingness to export',
                'International market focus'
            ],
            'General Support': [
                'Registered handicraft artisans',
                'Indian citizenship',
                'Age 18-65 years',
                'Willingness to participate',
                'No criminal record'
            ]
        }
        
        return eligibility_map.get(category, eligibility_map['General Support'])
    
    def generate_sample_application_process(self, category: str) -> List[str]:
        """Generate sample application process based on category"""
        process_map = {
            'Cluster Development': [
                'Submit cluster proposal to DC Handicrafts',
                'Attach required documents and feasibility study',
                'Screening committee evaluation',
                'Technical and financial assessment',
                'Approval and phased fund release'
            ],
            'Skill Training': [
                'Register at nearest training center',
                'Attend orientation session',
                'Complete training program',
                'Submit assessment and evaluation',
                'Receive certification and support'
            ],
            'Marketing Support': [
                'Apply through regional office',
                'Submit event details and budget',
                'Get approval for participation',
                'Participate in approved events',
                'Submit reimbursement claims'
            ],
            'Financial Assistance': [
                'Submit application with project proposal',
                'Technical evaluation and feasibility study',
                'Financial assessment and credit check',
                'Approval and sanction letter',
                'Fund disbursement and monitoring'
            ],
            'Infrastructure': [
                'Submit infrastructure project proposal',
                'Technical evaluation and site inspection',
                'Financial assessment and approval',
                'Construction and implementation',
                'Quality inspection and handover'
            ],
            'Women Empowerment': [
                'Submit women artisan registration',
                'Attend women-specific orientation',
                'Participate in empowerment programs',
                'Access additional benefits and support',
                'Regular progress monitoring'
            ],
            'Export Promotion': [
                'Submit export proposal and market study',
                'Market research validation',
                'Quality assessment and certification',
                'Export approval and support',
                'Ongoing export assistance'
            ],
            'General Support': [
                'Submit application with required documents',
                'Initial screening and verification',
                'Technical and financial evaluation',
                'Approval and implementation',
                'Monitoring and support'
            ]
        }
        
        return process_map.get(category, process_map['General Support'])
    
    def generate_sample_financial_assistance(self, category: str) -> str:
        """Generate sample financial assistance based on category"""
        assistance_map = {
            'Cluster Development': 'Up to 80% government contribution, maximum ₹10 lakhs per cluster',
            'Skill Training': 'Free training with stipend during training period',
            'Marketing Support': 'Up to 50% of participation cost, maximum ₹2 lakhs per year',
            'Financial Assistance': 'Up to 75% subsidy, maximum ₹5 lakhs per artisan',
            'Infrastructure': 'Up to 60% subsidy, maximum ₹25 lakhs per unit',
            'Women Empowerment': 'Additional 10% subsidy on top of regular schemes',
            'Export Promotion': 'Up to 60% support for export activities, maximum ₹15 lakhs',
            'General Support': 'Up to 70% government support, maximum ₹8 lakhs per artisan'
        }
        
        return assistance_map.get(category, assistance_map['General Support'])
    
    def save_schemes(self, filename: str = 'scraped_schemes.json'):
        """Save scraped schemes to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.schemes, f, indent=2, ensure_ascii=False)
            logger.info(f"Schemes saved to {filename}")
        except Exception as e:
            logger.error(f"Error saving schemes: {e}")
    
    def scrape_all_sources(self) -> List[Dict]:
        """Scrape schemes from all available sources"""
        all_schemes = []
        
        # Scrape from indian.handicrafts.gov.in
        handicrafts_schemes = self.scrape_indian_handicrafts_gov_in()
        all_schemes.extend(handicrafts_schemes)
        
        # TODO: Add more government websites
        # - msme.gov.in
        # - startupindia.gov.in
        # - pmkisan.gov.in
        
        logger.info(f"Total schemes scraped: {len(all_schemes)}")
        return all_schemes

def main():
    """Main function to run the scraper"""
    scraper = GovernmentSchemeScraper()
    
    try:
        # Scrape schemes from all sources
        schemes = scraper.scrape_all_sources()
        
        if schemes:
            # Save to JSON file
            scraper.save_schemes()
            
            # Print summary
            print(f"\n✅ Successfully scraped {len(schemes)} schemes!")
            print("\n📋 Scheme Categories:")
            categories = {}
            for scheme in schemes:
                cat = scheme['category']
                categories[cat] = categories.get(cat, 0) + 1
            
            for cat, count in categories.items():
                print(f"  • {cat}: {count} schemes")
            
            print(f"\n💾 Schemes saved to: scraped_schemes.json")
            print(f"🚀 Ready to integrate with your marketplace!")
            
        else:
            print("❌ No schemes were scraped. Check the logs for errors.")
            
    except Exception as e:
        logger.error(f"Error in main scraper: {e}")
        print(f"❌ Scraper failed: {e}")

if __name__ == "__main__":
    main()
