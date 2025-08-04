'use client';
import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkle, Check, ChevronsUpDown, XCircle } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Define suggested chapter options
const CHAPTER_OPTIONS = [
  { label: "3 Chapters (Not Complex)", value: 3 },
  { label: "6 Chapters (Average Detail)", value: 6 },
  { label: "10 Chapters (Detailed Course)", value: 10 },
];

// Define a comprehensive list of categories
const CATEGORIES = [
  "Programming", "Mathematics", "Physics", "Chemistry", "Biology", "History",
  "Literature", "Art", "Music", "Philosophy", "Psychology", "Sociology",
  "Economics", "Finance", "Business", "Marketing", "Data Science",
  "Machine Learning", "Web Development", "Mobile Development", "Cybersecurity",
  "Networking", "Cloud Computing", "Game Development", "Graphic Design",
  "Video Editing", "Photography", "Creative Writing", "Foreign Languages",
  "Health & Fitness", "Nutrition", "Environmental Science", "Agriculture",
  "Engineering", "Architecture", "Law", "Medicine", "Education", "Astronomy",
  "Geology", "Anthropology", "Political Science", "Journalism", "Culinary Arts",
  "Personal Finance", "Investing", "Entrepreneurship", "Public Speaking",
  "Meditation & Mindfulness", "Yoga", "Gardening", "DIY & Home Improvement",
  "Automotive", "Electronics", "Robotics", "Blockchain", "UI/UX Design",
  "Project Management", "Supply Chain Management", "Human Resources", "Sales",
  "Customer Service", "Digital Marketing", "SEO", "Content Creation", "Animation",
  "Sculpting", "Drawing", "Painting", "Theater", "Dance", "Film Production",
  "Music Production", "Songwriting", "Instrument Learning", "Philosophy of Mind",
  "Ethics", "Logic", "Metaphysics", "Epistemology", "Cognitive Science",
  "Neuroscience", "Child Development", "Social Psychology", "Abnormal Psychology",
  "Statistics", "Calculus", "Algebra", "Geometry", "Trigonometry", "Discrete Math",
  "Quantum Mechanics", "Thermodynamics", "Electromagnetism", "Organic Chemistry",
  "Inorganic Chemistry", "Biochemistry", "Genetics", "Ecology", "Evolution",
  "World History", "Ancient History", "Modern History", "Art History", "Mythology",
  "Comparative Literature", "Poetry", "Fiction Writing", "Screenwriting",
  "Public Health", "Epidemiology", "Anatomy", "Physiology", "Pharmacology",
  "Veterinary Science", "Forestry", "Horticulture", "Animal Science",
  // Added more categories
  "Risk Management", "Supply Chain", "Logistics", "Operations Management",
  "Quality Assurance", "Compliance", "Data Privacy", "Cyber Law", "Forensic Science",
  "Biotechnology", "Nanotechnology", "Renewable Energy", "Urban Planning",
  "Social Work", "Criminology", "International Relations", "Public Administration",
  "Non-profit Management", "Fundraising", "Sports Science", "Coaching",
  "Mindfulness Coaching", "Life Coaching", "Conflict Resolution", "Negotiation",
  "Emotional Intelligence", "Critical Thinking", "Problem Solving", "Innovation",
  "Design Thinking", "Product Management", "Scrum", "Agile Methodologies",
  "DevOps", "Cloud Security", "Ethical Hacking", "Penetration Testing",
  "Digital Forensics", "Incident Response", "IT Audit", "Network Security",
  "Database Management", "Big Data", "Data Visualization", "Business Intelligence",
  "Financial Modeling", "Investment Banking", "Wealth Management", "Fintech",
  "E-commerce", "Brand Management", "Public Relations", "Crisis Communication",
  "Social Media Marketing", "Email Marketing", "Affiliate Marketing",
  "Search Engine Marketing (SEM)", "User Research", "Usability Testing",
  "Information Architecture", "Interaction Design", "Prototyping",
  "Illustration", "Digital Painting", "Concept Art", "Sculpture", "Ceramics",
  "Textile Arts", "Jewelry Design", "Fashion Design", "Interior Design",
  "Landscape Design", "Screen Printing", "Printmaking", "Calligraphy",
  "Photography Editing", "Lighting Techniques", "Portrait Photography",
  "Landscape Photography", "Street Photography", "Documentary Photography",
  "Journalistic Photography", "Creative Nonfiction", "Playwriting", "Songwriting",
  "Music Theory", "Composition", "Orchestration", "Sound Design", "Audio Engineering",
  "Vocal Training", "Choir", "Band Instruments", "Orchestral Instruments",
  "World Music", "Music History", "Film Scoring", "Acting", "Directing",
  "Stage Management", "Costume Design", "Set Design", "Lighting Design (Theater)",
  "Cinematography", "Film Editing", "Sound Editing (Film)", "Screenwriting (Film)",
  "Documentary Filmmaking", "Animation (2D)", "Animation (3D)", "Stop Motion",
  "Character Animation", "Rigging", "Modeling (3D)", "Texturing (3D)",
  "Rendering (3D)", "Visual Effects (VFX)", "Motion Graphics", "Compositing",
  "Drawing Fundamentals", "Perspective Drawing", "Figure Drawing", "Still Life Drawing",
  "Watercolor Painting", "Oil Painting", "Acrylic Painting", "Digital Painting",
  "Abstract Painting", "Sculpting (Traditional)", "Sculpting (Digital)",
  "Ceramic Arts", "Pottery", "Weaving", "Knitting", "Crochet", "Embroidery",
  "Quilting", "Jewelry Making", "Metalworking", "Glassblowing", "Woodworking",
  "Upholstery", "Plumbing", "Electrical Wiring", "Carpentry", "Masonry",
  "HVAC", "Welding", "Auto Mechanics", "Engine Repair", "Brake Systems",
  "Electrical Systems (Auto)", "Robotics Programming", "Robotics Design",
  "Drone Piloting", "3D Printing", "Circuit Design", "Microcontrollers",
  "Embedded Systems", "Quantum Computing", "Cryptography", "Distributed Ledger Tech",
  "Smart Contracts", "Decentralized Finance (DeFi)", "NFTs", "Web3 Development",
  "Data Structures", "Algorithms", "Operating Systems", "Compilers",
  "Computer Architecture", "Parallel Computing", "Distributed Systems",
  "Software Testing", "Quality Assurance (Software)", "DevOps Tools",
  "Containerization (Docker)", "Orchestration (Kubernetes)", "CI/CD",
  "Cloud Security (AWS/Azure/GCP)", "Network Forensics", "Malware Analysis",
  "Incident Response (Cybersecurity)", "Threat Intelligence", "Security Auditing",
  "Compliance (IT)", "GDPR", "HIPAA", "PCI DSS", "ISO 27001", "Risk Assessment",
  "Disaster Recovery", "Business Continuity Planning", "Ethical Leadership",
  "Organizational Behavior", "Change Management", "Talent Acquisition",
  "Performance Management", "Employee Relations", "Compensation & Benefits",
  "Training & Development", "Customer Relationship Management (CRM)",
  "Sales Strategy", "Negotiation Skills", "Persuasion", "Active Listening",
  "Conflict Resolution (Business)", "Cross-cultural Communication",
  "Digital Analytics", "Google Analytics", "Social Media Analytics",
  "Email Marketing Automation", "CRM Marketing", "Affiliate Program Management",
  "Search Engine Optimization (SEO)", "Pay-Per-Click (PPC)", "Display Advertising",
  "Video Advertising", "Mobile Advertising", "Influencer Marketing",
  "Community Management", "Public Relations Strategy", "Media Relations",
  "Copywriting", "Editing", "Proofreading", "Technical Writing",
  "Grant Writing", "Journalism Ethics", "Investigative Journalism",
  "Broadcast Journalism", "Photojournalism", "Documentary Filmmaking",
  "Short Film Production", "Feature Film Production", "Screenwriting (TV)",
  "Storyboarding", "Character Design (Animation)", "Environment Design (Animation)",
  "Prop Design (Animation)", "Layout (Animation)", "Background Painting (Animation)",
  "Inbetweening", "Clean-up Animation", "Coloring (Animation)",
  "Rigging (Animation)", "Skinning (Animation)", "Motion Capture",
  "Virtual Reality (VR) Development", "Augmented Reality (AR) Development",
  "Mixed Reality (MR) Development", "Game Design", "Level Design",
  "Game Programming", "Game Art", "Game Audio", "Game Testing",
  "Esports Management", "Streaming (Gaming)", "Content Creation (Gaming)",
  "Game Monetization", "Game Analytics", "Game Marketing",
  "Financial Literacy", "Budgeting", "Debt Management", "Retirement Planning",
  "Stock Market", "Bonds", "Mutual Funds", "ETFs", "Real Estate Investing",
  "Options Trading", "Futures Trading", "Commodities Trading", "Cryptocurrency Trading",
  "Venture Capital", "Angel Investing", "Startup Funding", "Pitching",
  "Business Plan Development", "Market Research", "Competitive Analysis",
  "Product Development", "Lean Startup", "Agile Product Management",
  "Supply Chain Optimization", "Inventory Management", "Logistics Management",
  "Warehouse Management", "Transportation Management", "Global Supply Chains",
  "Quality Control", "Quality Management Systems (QMS)", "Six Sigma",
  "Lean Manufacturing", "Total Quality Management (TQM)", "ISO Standards",
  "Environmental Regulations", "Sustainability", "Climate Change",
  "Conservation", "Renewable Energy Systems", "Solar Power", "Wind Power",
  "Geothermal Energy", "Hydropower", "Biofuels", "Energy Efficiency",
  "Green Building", "Sustainable Agriculture", "Permaculture", "Hydroponics",
  "Aquaponics", "Animal Welfare", "Veterinary Medicine", "Zoology", "Botany",
  "Mycology", "Microbiology", "Immunology", "Virology", "Parasitology",
  "Genomic Sequencing", "Bioinformatics", "Computational Biology",
  "Biostatistics", "Clinical Trials", "Drug Discovery", "Medical Ethics",
  "Public Health Policy", "Health Education", "Community Health",
  "Global Health", "Epidemiological Methods", "Disease Surveillance",
  "Health Informatics", "Nursing", "Dentistry", "Pharmacy", "Physical Therapy",
  "Occupational Therapy", "Speech Therapy", "Chiropractic", "Optometry",
  "Podiatry", "Dietetics", "Nutrition Science", "Sports Nutrition",
  "Weight Management", "Food Science", "Food Safety", "Food Production",
  "Food Service Management", "Hospitality Management", "Tourism Management",
  "Event Planning", "Hotel Management", "Restaurant Management",
  "Catering Management", "Baking & Pastry Arts", "Culinary Techniques",
  "International Cuisine", "Wine & Spirits", "Mixology", "Bartending",
  "Coffee Making", "Tea Ceremony", "Gardening (Organic)", "Composting",
  "Pest Control (Organic)", "Landscaping", "Interior Decorating",
  "Home Staging", "Real Estate Sales", "Property Management",
  "Building Codes", "Construction Management", "Blueprint Reading",
  "Architectural History", "Urban Design", "Landscape Architecture",
  "Sustainable Architecture", "Civil Engineering", "Mechanical Engineering",
  "Electrical Engineering", "Chemical Engineering", "Biomedical Engineering",
  "Aerospace Engineering", "Industrial Engineering", "Materials Science",
  "Nanomaterials", "Robotics Engineering", "Automation", "Mechatronics",
  "Control Systems", "Digital Electronics", "Analog Electronics",
  "Microprocessor Design", "FPGA Design", "Embedded Software",
  "Wireless Communication", "Optical Communication", "Satellite Communication",
  "Radar Systems", "Antenna Design", "Signal Processing",
  "Digital Image Processing", "Computer Vision", "Natural Language Processing (NLP)",
  "Speech Recognition", "Reinforcement Learning", "Deep Learning",
  "Neural Networks", "Generative AI", "Ethical AI", "AI Governance",
  "Data Ethics", "Privacy Engineering", "Quantum Cryptography",
  "Post-Quantum Cryptography", "Cyber-Physical Systems Security",
  "IoT Security", "Cloud Forensics", "Blockchain Security",
  "Cryptocurrency Security", "Decentralized Applications (DApps)",
  "Smart Contract Auditing", "Tokenomics", "Community Building (Web3)",
  "Decentralized Autonomous Organizations (DAOs)", "Game Theory (Blockchain)",
  "Financial Regulations", "Corporate Governance", "Business Ethics",
  "Corporate Social Responsibility (CSR)", "Organizational Development",
  "Leadership Development", "Team Building", "Workplace Diversity & Inclusion",
  "Employee Engagement", "Performance Appraisal", "Talent Management",
  "Recruitment & Selection", "Onboarding", "Training Needs Analysis",
  "Learning & Development", "Workplace Safety", "Industrial Relations",
  "Labor Law", "Compensation Design", "Benefits Administration",
  "Payroll Management", "HR Analytics", "HR Technology", "HR Best Practices",
  "Sales Management", "Key Account Management", "Sales Forecasting",
  "Sales Training", "Customer Experience (CX)", "Customer Success",
  "Service Design", "User Interface (UI) Design", "User Experience (UX) Design",
  "Wireframing", "Mockups", "Prototyping (UI/UX)", "Design Systems",
  "Accessibility (UI/UX)", "Responsive Design", "Mobile-First Design",
  "Web Accessibility", "Inclusive Design", "Interaction Design Principles",
  "Visual Design Principles", "Typography (Design)", "Color Theory (Design)",
  "Layout Design", "Branding", "Logo Design", "Packaging Design",
  "Print Design", "Digital Illustration", "Vector Graphics", "Raster Graphics",
  "Photo Manipulation", "Digital Compositing", "Matte Painting",
  "3D Modeling (Art)", "Digital Sculpting", "Character Modeling",
  "Prop Modeling", "Environment Modeling", "Hard Surface Modeling",
  "Organic Modeling", "Retopology", "UV Mapping", "Texturing (Art)",
  "Shading", "Lighting (3D Art)", "Rendering (3D Art)", "Animation Principles",
  "Character Animation (3D)", "Creature Animation", "Vehicle Animation",
  "Facial Animation", "Lip Sync", "Walk Cycles", "Run Cycles",
  "Motion Graphics (Advanced)", "Broadcast Design", "Title Sequences",
  "Visual Effects Compositing", "Green Screen Keying", "Matchmoving",
  "Rotoscoping", "Digital Painting (Advanced)", "Concept Art (Advanced)",
  "Storyboarding (Advanced)", "Comic Book Art", "Manga Art", "Graphic Novels",
  "Children's Book Illustration", "Scientific Illustration",
  "Medical Illustration", "Fashion Illustration", "Technical Illustration",
  "Architectural Illustration", "Botanical Illustration", "Zoological Illustration",
  "Figure Painting", "Portrait Painting", "Landscape Painting",
  "Still Life Painting", "Abstract Expressionism", "Impressionism",
  "Cubism", "Surrealism", "Pop Art", "Street Art", "Graffiti Art",
  "Art Curation", "Gallery Management", "Art Marketing", "Art History (Advanced)",
  "Art Criticism", "Art Theory", "Aesthetics", "Museum Studies",
  "Conservation-Restoration", "Archaeology", "Paleontology", "Oceanography",
  "Climatology", "Meteorology", "Seismology", "Volcanology", "Glaciology",
  "Hydrology", "Geophysics", "Geochemistry", "Mineralogy", "Petrology",
  "Sedimentology", "Stratigraphy", "Structural Geology", "Planetary Science",
  "Astrophysics", "Cosmology", "Exoplanets", "Space Exploration",
  "Rocketry", "Satellite Technology", "Telescope Operation",
  "Observational Astronomy", "Theoretical Astronomy", "Ethnobotany",
  "Ethnozoology", "Cultural Anthropology", "Linguistic Anthropology",
  "Archaeological Field Methods", "Human Evolution", "Primatology",
  "Forensic Anthropology", "Sociological Theory", "Social Research Methods",
  "Demography", "Urban Sociology", "Rural Sociology", "Sociology of Family",
  "Sociology of Education", "Sociology of Health", "Sociology of Religion",
  "Sociology of Work", "Sociology of Crime", "Sociology of Race & Ethnicity",
  "Sociology of Gender", "Social Movements", "Community Development",
  "Social Policy", "Public Opinion", "Political Theory", "Comparative Politics",
  "International Law", "Diplomacy", "Conflict Studies", "Peace Studies",
  "Human Rights", "Global Governance", "Political Economy",
  "Public Policy Analysis", "Policy Implementation", "Program Evaluation",
  "Public Sector Management", "Nonprofit Governance", "Grant Management",
  "Volunteer Management", "Fundraising Strategy", "Philanthropy",
  "Sports Psychology", "Exercise Physiology", "Kinesiology",
  "Biomechanics", "Sports Medicine", "Athletic Training", "Physical Therapy (Sports)",
  "Coaching Theory", "Leadership (Sports)", "Team Dynamics",
  "Sports Management", "Sports Marketing", "Sports Law", "Sports Ethics",
  "Mindfulness-Based Stress Reduction (MBSR)", "Cognitive Behavioral Therapy (CBT)",
  "Dialectical Behavior Therapy (DBT)", "Acceptance and Commitment Therapy (ACT)",
  "Trauma-Informed Care", "Grief Counseling", "Addiction Counseling",
  "Family Therapy", "Couples Counseling", "Child Psychology",
  "Adolescent Psychology", "Geriatric Psychology", "Neuropsychology",
  "Forensic Psychology", "Clinical Psychology", "Counseling Psychology",
  "Developmental Psychology", "Social Psychology Research Methods",
  "Personality Psychology", "Abnormal Psychology (Advanced)",
  "Psychological Assessment", "Research Methods (Psychology)",
  "Statistical Analysis (Psychology)", "Experimental Psychology",
  "Cognitive Psychology", "Learning Theories", "Memory & Cognition",
  "Perception", "Emotion", "Motivation", "Intelligence",
  "Creativity", "Problem Solving (Psychology)", "Decision Making (Psychology)",
  "Judgment", "Reasoning", "Language Acquisition", "Bilingualism",
  "Neuroscience of Learning", "Brain Imaging", "Neuroanatomy",
  "Neurophysiology", "Neuropharmacology", "Behavioral Neuroscience",
  "Cognitive Neuroscience", "Affective Neuroscience", "Social Neuroscience",
  "Neurodegenerative Diseases", "Neurological Disorders",
  "Child Development Stages", "Adolescent Development", "Adult Development",
  "Aging & Gerontology", "Family Systems Theory", "Parenting Styles",
  "Attachment Theory", "Social Learning Theory", "Group Dynamics",
  "Intergroup Relations", "Prejudice & Discrimination", "Stereotypes",
  "Conformity", "Obedience", "Altruism", "Aggression", "Attitudes & Persuasion",
  "Social Influence", "Social Cognition", "Self-Concept", "Identity",
  "Health Psychology", "Environmental Psychology", "Legal Psychology",
  "Organizational Psychology", "Industrial-Organizational Psychology",
  "Consumer Psychology", "Educational Psychology", "School Psychology",
  "Rehabilitation Psychology", "Sport Psychology", "Positive Psychology",
  "Community Psychology", "Cross-Cultural Psychology", "Evolutionary Psychology",
  "Forensic Psychology (Advanced)", "Psychopathology", "Diagnostic Criteria",
  "Treatment Modalities", "Psychopharmacology", "Psychotherapy Techniques",
  "Crisis Intervention", "Suicide Prevention", "Trauma Recovery",
  "Eating Disorders", "Anxiety Disorders", "Mood Disorders",
  "Personality Disorders", "Schizophrenia", "Substance Use Disorders",
  "Developmental Disabilities", "Autism Spectrum Disorder", "ADHD",
  "Learning Disabilities", "Biostatistics (Advanced)", "Regression Analysis",
  "ANOVA", "Chi-Square Tests", "Hypothesis Testing", "Data Collection Methods",
  "Survey Design", "Experimental Design", "Qualitative Research Methods",
  "Mixed Methods Research", "Research Ethics", "Scientific Writing",
  "Academic Publishing", "Presentation Skills", "Public Speaking (Advanced)",
  "Debate", "Argumentation", "Critical Reading", "Critical Writing",
  "Information Literacy", "Media Literacy", "Digital Literacy",
  "Financial Literacy (Advanced)", "Investment Strategies", "Portfolio Management",
  "Financial Planning", "Retirement Planning (Advanced)", "Estate Planning",
  "Tax Planning", "Risk Management (Finance)", "Derivatives", "Options",
  "Futures", "Swaps", "Foreign Exchange (Forex)", "Cryptocurrency Analysis",
  "Blockchain Technology", "Decentralized Finance (DeFi) Strategies",
  "NFT Investing", "Web3 Business Models", "Startup Ecosystems",
  "Venture Capital Funding", "Angel Investor Networks", "Crowdfunding",
  "Business Model Canvas", "Value Proposition Design", "Customer Segmentation",
  "Market Sizing", "Competitive Intelligence", "SWOT Analysis",
  "Porter's Five Forces", "Strategic Planning", "Organizational Structure",
  "Leadership Styles", "Motivation Theories", "Team Leadership",
  "Conflict Management", "Negotiation Strategies", "Decision Making (Business)",
  "Problem Solving (Business)", "Innovation Management", "Change Leadership",
  "Organizational Culture", "Employee Engagement Strategies",
  "Performance Management Systems", "Talent Development", "Succession Planning",
  "Workforce Planning", "Recruitment Marketing", "Employer Branding",
  "Candidate Experience", "Interviewing Skills", "Onboarding Programs",
  "Training Program Design", "Learning Technologies", "HR Information Systems (HRIS)",
  "HR Metrics & Analytics", "Compensation & Benefits Management",
  "Global HR", "Diversity & Inclusion Programs", "Workplace Wellness",
  "Employee Relations Management", "Labor Law Compliance",
  "Collective Bargaining", "Sales Funnel Management", "Lead Generation",
  "Sales Prospecting", "Sales Presentation Skills", "Closing Techniques",
  "Customer Service Excellence", "Service Recovery", "Complaint Handling",
  "Customer Loyalty Programs", "Net Promoter Score (NPS)",
  "Customer Journey Mapping", "Service Blueprinting", "User Interface (UI) Prototyping",
  "User Experience (UX) Research", "Heuristic Evaluation", "A/B Testing (UI/UX)",
  "Information Architecture (Advanced)", "Interaction Design Patterns",
  "Usability Principles", "Accessibility Standards (WCAG)", "Design Thinking Workshops",
  "Service Design Principles", "User-Centered Design", "Design Sprint",
  "Visual Design Theory", "Grid Systems", "Layout Principles",
  "Color Psychology", "Branding Strategy", "Brand Identity Design",
  "Packaging Design Principles", "Print Production", "Digital Publishing",
  "Editorial Design", "Magazine Design", "Book Design", "Poster Design",
  "Typography Design", "Illustration Techniques", "Digital Painting Techniques",
  "Concept Art Workflow", "Character Design Workflow", "Environment Design Workflow",
  "Prop Design Workflow", "Hard Surface Modeling Techniques",
  "Organic Modeling Techniques", "Retopology Workflow", "UV Mapping Workflow",
  "Texturing Techniques", "Shading Networks", "Lighting Techniques (3D)",
  "Rendering Techniques", "Animation Principles (Advanced)",
  "Character Rigging", "Character Skinning", "Motion Capture Data Processing",
  "Facial Rigging", "Lip Sync Animation", "Walk Cycle Variations",
  "Run Cycle Variations", "Motion Graphics Software (e.g., After Effects)",
  "Broadcast Graphics", "Title Sequence Design", "Visual Effects Compositing (Advanced)",
  "Green Screen Compositing", "Matchmoving Techniques", "Rotoscoping Techniques",
  "Digital Painting (Masterclass)", "Concept Art (Masterclass)",
  "Storyboarding (Masterclass)", "Comic Book Creation", "Manga Drawing",
  "Graphic Novel Writing", "Children's Book Illustration (Advanced)",
  "Scientific Illustration (Advanced)", "Medical Illustration (Advanced)",
  "Fashion Illustration (Advanced)", "Technical Illustration (Advanced)",
  "Architectural Illustration (Advanced)", "Botanical Illustration (Advanced)",
  "Zoological Illustration (Advanced)", "Figure Painting (Advanced)",
  "Portrait Painting (Advanced)", "Landscape Painting (Advanced)",
  "Still Life Painting (Advanced)", "Abstract Art Theory",
  "Art History (Specialized)", "Art Conservation", "Museum Education",
  "Gallery Operations", "Art Market Analysis", "Art Law", "Art Ethics",
  "Aesthetics (Advanced)", "Archaeological Excavation", "Paleontology Fieldwork",
  "Oceanographic Research", "Climatology Modeling", "Meteorological Forecasting",
  "Seismology Research", "Volcanology Field Studies", "Glaciology Research",
  "Hydrology Modeling", "Geophysics Research", "Geochemistry Analysis",
  "Mineralogy Identification", "Petrology Analysis", "Sedimentology Research",
  "Stratigraphy Analysis", "Structural Geology Mapping", "Planetary Geology",
  "Exoplanet Detection", "Spacecraft Design", "Rocket Propulsion",
  "Satellite Systems", "Telescope Design", "Radio Astronomy",
  "Gravitational Waves", "Dark Matter", "Dark Energy", "Cosmic Microwave Background",
  "Human Evolution (Advanced)", "Primate Behavior", "Forensic Anthropology Techniques",
  "Sociological Research Design", "Quantitative Sociology", "Qualitative Sociology",
  "Urban Development", "Rural Development", "Family Dynamics",
  "Sociology of Education Policy", "Health Disparities", "Sociology of Religion (Advanced)",
  "Workplace Sociology", "Criminology Theory", "Social Deviance",
  "Race & Ethnicity Studies", "Gender Studies", "Social Justice",
  "Community Organizing", "Public Policy Formulation", "Policy Analysis (Advanced)",
  "Program Management (Public Sector)", "Nonprofit Fundraising",
  "Philanthropic Strategy", "Sports Psychology (Advanced)",
  "Exercise Physiology (Advanced)", "Kinesiology (Advanced)",
  "Biomechanics (Advanced)", "Sports Medicine (Advanced)",
  "Athletic Training (Advanced)", "Physical Therapy (Sports) (Advanced)",
  "Coaching Leadership", "Team Cohesion", "Sports Management (Advanced)",
  "Sports Marketing (Advanced)", "Sports Law (Advanced)", "Sports Ethics (Advanced)",
  "Mindfulness-Based Cognitive Therapy (MBCT)", "Acceptance and Commitment Therapy (ACT) (Advanced)",
  "Trauma Therapy", "Grief & Loss Counseling", "Addiction Recovery",
  "Family Systems Therapy (Advanced)", "Couples Counseling (Advanced)",
  "Child & Adolescent Therapy", "Geriatric Mental Health", "Neuropsychological Assessment",
  "Forensic Psychology (Clinical)", "Clinical Supervision",
  "Counseling Theories", "Developmental Psychopathology",
  "Social Psychology Experiments", "Personality Assessment",
  "Psychopathology (Advanced)", "Diagnostic & Statistical Manual (DSM)",
  "Evidence-Based Treatments", "Psychopharmacology (Advanced)",
  "Psychotherapy Integration", "Crisis Management", "Suicide Risk Assessment",
  "Trauma-Focused CBT", "Eating Disorder Treatment", "Anxiety Disorder Treatment",
  "Mood Disorder Treatment", "Personality Disorder Treatment",
  "Schizophrenia Treatment", "Substance Use Disorder Treatment",
  "Developmental Disabilities Assessment", "Autism Spectrum Disorder Intervention",
  "ADHD Management", "Learning Disabilities Intervention",
  "Advanced Biostatistics", "Multivariate Analysis", "Structural Equation Modeling",
  "Meta-Analysis", "Advanced Research Ethics", "Grant Writing (Research)",
  "Academic Presentation Skills", "Public Speaking Coaching",
  "Debate Coaching", "Argumentation Theory", "Critical Thinking Skills",
  "Information Literacy (Advanced)", "Media Production", "Digital Storytelling",
  "Financial Modeling (Advanced)", "Valuation", "Mergers & Acquisitions",
  "Private Equity", "Hedge Funds", "Venture Capital (Advanced)",
  "Angel Investing (Advanced)", "Startup Valuation", "Pitch Deck Design",
  "Business Strategy", "Competitive Advantage", "Disruptive Innovation",
  "Blue Ocean Strategy", "Scenario Planning", "Risk Management (Enterprise)",
  "Business Process Management (BPM)", "Supply Chain Analytics",
  "Inventory Optimization", "Logistics Technology", "Warehouse Automation",
  "Transportation Logistics", "Global Sourcing", "Supplier Relationship Management",
  "Quality Auditing", "Lean Six Sigma", "Statistical Process Control (SPC)",
  "Total Productive Maintenance (TPM)", "ISO Certification",
  "Environmental Impact Assessment", "Carbon Footprint Management",
  "Climate Change Adaptation", "Biodiversity Conservation",
  "Renewable Energy Project Management", "Solar Panel Installation",
  "Wind Turbine Technology", "Geothermal Energy Systems",
  "Hydropower Engineering", "Biofuel Production", "Energy Policy",
  "Green Building Certification", "Sustainable Land Use", "Agroecology",
  "Precision Agriculture", "Urban Farming", "Animal Breeding",
  "Animal Nutrition", "Veterinary Pathology", "Veterinary Surgery",
  "Zoological Research", "Botanical Research", "Mycology Research",
  "Microbiology Techniques", "Immunology Research", "Virology Research",
  "Parasitology Research", "Genomics", "Proteomics", "Metabolomics",
  "Bioinformatics Tools", "Computational Neuroscience",
  "Biomedical Signal Processing", "Medical Devices", "Biomaterials",
  "Tissue Engineering", "Regenerative Medicine", "Clinical Research",
  "Drug Development", "Pharmacovigilance", "Medical Ethics (Advanced)",
  "Public Health Law", "Health Communication", "Community Health Programs",
  "Global Health Challenges", "Epidemiological Studies",
  "Disease Outbreak Investigation", "Health Information Systems",
  "Nursing Specialties", "Dental Specialties", "Pharmacy Practice",
  "Physical Therapy Techniques", "Occupational Therapy Techniques",
  "Speech-Language Pathology", "Chiropractic Techniques", "Optometry Practice",
  "Podiatry Practice", "Dietary Counseling", "Nutritional Assessment",
  "Sports Nutrition (Advanced)", "Weight Management Programs",
  "Food Chemistry", "Food Microbiology", "Food Engineering",
  "Food Service Operations", "Hospitality Operations", "Tourism Marketing",
  "Event Management", "Hotel Operations", "Restaurant Operations",
  "Catering Operations", "Baking & Pastry Techniques", "Culinary Arts (Advanced)",
  "International Cuisine (Advanced)", "Wine Tasting", "Spirits Production",
  "Mixology (Advanced)", "Bartending Techniques", "Coffee Roasting",
  "Tea Cultivation", "Permaculture Design", "Organic Gardening",
  "Composting Systems", "Pest Management (Integrated)", "Landscape Design Principles",
  "Interior Decorating Styles", "Home Staging Techniques",
  "Real Estate Investment", "Property Development", "Building Regulations",
  "Construction Project Management", "Blueprint Interpretation",
  "Architectural Styles", "Urban Planning Policy", "Landscape Architecture Design",
  "Sustainable Architecture Principles", "Civil Engineering Structures",
  "Mechanical Engineering Design", "Electrical Engineering Systems",
  "Chemical Engineering Processes", "Biomedical Engineering Devices",
  "Aerospace Engineering Systems", "Industrial Engineering Optimization",
  "Materials Science Research", "Nanomaterials Applications",
  "Robotics Control", "Automation Systems", "Mechatronics Design",
  "Control Systems Engineering", "Digital Electronics Design",
  "Analog Electronics Design", "Microprocessor Architecture",
  "FPGA Programming", "Embedded Systems Development",
  "Wireless Communication Systems", "Optical Communication Systems",
  "Satellite Communication Systems", "Radar System Design",
  "Antenna Theory", "Signal Processing Algorithms",
  "Digital Image Processing Algorithms", "Computer Vision Applications",
  "Natural Language Processing (NLP) Applications", "Speech Recognition Systems",
  "Reinforcement Learning Algorithms", "Deep Learning Architectures",
  "Neural Network Training", "Generative Adversarial Networks (GANs)",
  "Transformer Models", "Ethical AI Development", "AI Policy",
  "Data Governance", "Privacy by Design", "Homomorphic Encryption",
  "Quantum Key Distribution", "Cyber-Physical Systems Security (Advanced)",
  "IoT Device Security", "Cloud Security Auditing", "Blockchain Forensics",
  "Cryptocurrency Forensics", "Decentralized Autonomous Organizations (DAOs) Governance",
  "Game Theory (Advanced)", "Financial Regulations Compliance",
  "Corporate Governance Best Practices", "Business Ethics Case Studies",
  "CSR Reporting", "Organizational Development Interventions",
  "Leadership Coaching", "Team Facilitation", "Workplace Conflict Resolution",
  "Diversity & Inclusion Training", "Employee Engagement Measurement",
  "Performance Management Strategies", "Talent Acquisition Best Practices",
  "Recruitment Technology", "Onboarding Experience",
  "Training Needs Assessment", "Learning Management Systems (LMS)",
  "HR Analytics Tools", "HR Technology Implementation", "Global Compensation",
  "Benefits Strategy", "Payroll Systems", "HR Compliance",
  "Labor Relations", "Sales Operations", "Sales Performance Management",
  "Sales Enablement", "Customer Relationship Management (CRM) Systems",
  "Customer Service Training", "Service Quality Management",
  "Customer Feedback Analysis", "Customer Retention Strategies",
  "Net Promoter Score (NPS) Implementation", "Customer Journey Optimization",
  "Service Design Methodology", "User Interface (UI) Testing",
  "User Experience (UX) Metrics", "Heuristic Evaluation (Advanced)",
  "A/B Testing (Advanced)", "Information Architecture (Expert)",
  "Interaction Design (Expert)", "Usability Testing (Expert)",
  "Accessibility Auditing", "Responsive Web Design", "Mobile App Design",
  "Web Accessibility Best Practices", "Inclusive Design Principles",
  "Interaction Design Theory", "Visual Design Theory (Advanced)",
  "Typography (Expert)", "Color Theory (Expert)", "Layout Design (Advanced)",
  "Brand Management Strategy", "Logo Design Principles",
  "Packaging Design Trends", "Print Production Management",
  "Digital Publishing Workflows", "Editorial Design Principles",
  "Magazine Layout", "Book Design Principles", "Poster Design Techniques",
  "Calligraphy Styles", "Illustration Software", "Digital Painting Software",
  "Concept Art Software", "Character Design Software", "Environment Design Software",
  "Prop Design Software", "Hard Surface Modeling Software",
  "Organic Modeling Software", "Retopology Software", "UV Mapping Software",
  "Texturing Software", "Shading Software", "Lighting Software (3D)",
  "Rendering Software", "Animation Software", "Character Rigging Software",
  "Character Skinning Software", "Motion Capture Software",
  "Facial Rigging Software", "Lip Sync Software", "Walk Cycle Software",
  "Run Cycle Software", "Motion Graphics Software (Expert)",
  "Broadcast Graphics Design", "Title Sequence Animation",
  "Visual Effects Compositing (Expert)", "Green Screen Techniques",
  "Matchmoving Software", "Rotoscoping Software", "Digital Painting (Professional)",
  "Concept Art (Professional)", "Storyboarding (Professional)",
  "Comic Book Production", "Manga Drawing (Advanced)", "Graphic Novel Production",
  "Children's Book Illustration (Professional)", "Scientific Illustration (Professional)",
  "Medical Illustration (Professional)", "Fashion Illustration (Professional)",
  "Technical Illustration (Professional)", "Architectural Illustration (Professional)",
  "Botanical Illustration (Professional)", "Zoological Illustration (Professional)",
  "Figure Painting (Professional)", "Portrait Painting (Professional)",
  "Landscape Painting (Professional)", "Abstract Art Techniques",
  "Art History (Specialized Research)", "Art Conservation Techniques",
  "Museum Exhibition Design", "Gallery Marketing", "Art Market Trends",
  "Art Law (Advanced)", "Art Ethics (Advanced)", "Aesthetics (Expert)",
  "Museum Management", "Conservation-Restoration (Advanced)",
  "Archaeological Survey", "Paleontology Lab Techniques", "Oceanographic Instrumentation",
  "Climatology Data Analysis", "Meteorological Modeling", "Seismology Data Interpretation",
  "Volcanology Hazard Assessment", "Glaciology Field Studies",
  "Hydrology Data Collection", "Geophysics Survey Methods",
  "Geochemistry Lab Analysis", "Mineralogy Identification Techniques",
  "Petrology Lab Methods", "Sedimentology Field Techniques",
  "Stratigraphy Interpretation", "Structural Geology Analysis",
  "Planetary Geology Research", "Exoplanet Characterization",
  "Spacecraft Operations", "Rocket Launch Systems", "Satellite Data Analysis",
  "Radio Telescope Operation", "Gravitational Wave Detection",
  "Dark Matter Research", "Dark Energy Research", "Cosmic Microwave Background Analysis",
  "Human Evolution Research", "Primate Conservation", "Forensic Anthropology Research",
  "Sociological Theory (Advanced)", "Social Research Methods (Advanced)",
  "Demographic Analysis", "Urban Sociology (Advanced)", "Rural Sociology (Advanced)",
  "Family Sociology", "Sociology of Education (Advanced)", "Sociology of Health (Advanced)",
  "Sociology of Religion (Expert)", "Sociology of Work (Advanced)",
  "Criminology Research", "Social Deviance Theory", "Race & Ethnicity Studies (Advanced)",
  "Gender Studies (Advanced)", "Social Justice Movements",
  "Community Development Planning", "Public Policy Analysis (Expert)",
  "Policy Implementation (Expert)", "Program Evaluation (Expert)",
  "Public Sector Leadership", "Nonprofit Governance (Advanced)",
  "Grant Writing (Advanced)", "Volunteer Management (Advanced)",
  "Fundraising Campaigns", "Philanthropic Advising",
  "Sports Psychology (Clinical)", "Exercise Physiology (Clinical)",
  "Kinesiology (Clinical)", "Biomechanics (Clinical)",
  "Sports Medicine (Clinical)", "Athletic Training (Clinical)",
  "Physical Therapy (Sports) (Clinical)", "Coaching Ethics",
  "Team Performance Optimization", "Sports Management (Expert)",
  "Sports Marketing (Expert)", "Sports Law (Expert)", "Sports Ethics (Expert)",
  "Mindfulness-Based Stress Reduction (MBSR) Teaching",
  "Cognitive Behavioral Therapy (CBT) (Expert)", "Dialectical Behavior Therapy (DBT) (Expert)",
  "Acceptance and Commitment Therapy (ACT) (Expert)", "Trauma-Informed Practice",
  "Grief Counseling (Advanced)", "Addiction Counseling (Advanced)",
  "Family Therapy (Expert)", "Couples Counseling (Expert)",
  "Child & Adolescent Psychopathology", "Geriatric Mental Health (Advanced)",
  "Neuropsychological Assessment (Advanced)", "Forensic Psychology (Expert)",
  "Clinical Psychology (Expert)", "Counseling Psychology (Expert)",
  "Developmental Psychology (Advanced)", "Social Psychology (Expert)",
  "Personality Psychology (Advanced)", "Abnormal Psychology (Expert)",
  "Psychological Assessment (Expert)", "Research Methods (Psychology) (Expert)",
  "Statistical Analysis (Psychology) (Expert)", "Experimental Psychology (Expert)",
  "Cognitive Psychology (Advanced)", "Learning Theories (Advanced)",
  "Memory & Cognition (Advanced)", "Perception (Advanced)",
  "Emotion (Advanced)", "Motivation (Advanced)", "Intelligence (Advanced)",
  "Creativity (Advanced)", "Problem Solving (Psychology) (Advanced)",
  "Decision Making (Psychology) (Advanced)", "Judgment (Advanced)",
  "Reasoning (Advanced)", "Language Acquisition (Advanced)",
  "Bilingualism (Advanced)", "Neuroscience of Learning (Advanced)",
  "Brain Imaging (Advanced)", "Neuroanatomy (Advanced)",
  "Neurophysiology (Advanced)", "Neuropharmacology (Advanced)",
  "Behavioral Neuroscience (Advanced)", "Cognitive Neuroscience (Advanced)",
  "Affective Neuroscience (Advanced)", "Social Neuroscience (Advanced)",
  "Neurodegenerative Diseases (Advanced)", "Neurological Disorders (Advanced)",
  "Child Development Stages (Advanced)", "Adolescent Development (Advanced)",
  "Adult Development (Advanced)", "Aging & Gerontology (Advanced)",
  "Family Systems Theory (Advanced)", "Parenting Styles (Advanced)",
  "Attachment Theory (Advanced)", "Social Learning Theory (Advanced)",
  "Group Dynamics (Advanced)", "Intergroup Relations (Advanced)",
  "Prejudice & Discrimination (Advanced)", "Stereotypes (Advanced)",
  "Conformity (Advanced)", "Obedience (Advanced)", "Altruism (Advanced)",
  "Aggression (Advanced)", "Attitudes & Persuasion (Advanced)",
  "Social Influence (Advanced)", "Social Cognition (Advanced)",
  "Self-Concept (Advanced)", "Identity (Advanced)",
  "Health Psychology (Advanced)", "Environmental Psychology (Advanced)",
  "Legal Psychology (Advanced)", "Organizational Psychology (Advanced)",
  "Industrial-Organizational Psychology (Advanced)", "Consumer Psychology (Advanced)",
  "Educational Psychology (Advanced)", "School Psychology (Advanced)",
  "Rehabilitation Psychology (Advanced)", "Sport Psychology (Advanced)",
  "Positive Psychology (Advanced)", "Community Psychology (Advanced)",
  "Cross-Cultural Psychology (Advanced)", "Evolutionary Psychology (Advanced)",
  "Forensic Psychology (Clinical) (Advanced)", "Psychopathology (Expert)",
  "Diagnostic Criteria (Expert)", "Treatment Modalities (Expert)",
  "Psychopharmacology (Expert)", "Psychotherapy Techniques (Expert)",
  "Crisis Intervention (Expert)", "Suicide Prevention (Expert)",
  "Trauma Recovery (Expert)", "Eating Disorders (Expert)",
  "Anxiety Disorders (Expert)", "Mood Disorders (Expert)",
  "Personality Disorders (Expert)", "Schizophrenia (Expert)",
  "Substance Use Disorders (Expert)", "Developmental Disabilities (Expert)",
  "Autism Spectrum Disorder (Expert)", "ADHD (Expert)",
  "Learning Disabilities (Expert)", "Biostatistics (Expert)",
  "Regression Analysis (Expert)", "ANOVA (Expert)", "Chi-Square Tests (Expert)",
  "Hypothesis Testing (Expert)", "Data Collection Methods (Expert)",
  "Survey Design (Expert)", "Experimental Design (Expert)",
  "Qualitative Research Methods (Expert)", "Mixed Methods Research (Expert)",
  "Research Ethics (Expert)", "Scientific Writing (Expert)",
  "Academic Publishing (Expert)", "Presentation Skills (Expert)",
  "Public Speaking (Expert)", "Debate (Expert)", "Argumentation (Expert)",
  "Critical Reading (Expert)", "Critical Writing (Expert)",
  "Information Literacy (Expert)", "Media Literacy (Expert)", "Digital Literacy (Expert)",
  "Financial Literacy (Expert)", "Investment Strategies (Expert)",
  "Portfolio Management (Expert)", "Financial Planning (Expert)",
  "Retirement Planning (Expert)", "Estate Planning (Expert)",
  "Tax Planning (Expert)", "Risk Management (Finance) (Expert)",
  "Derivatives (Expert)", "Options (Expert)", "Futures (Expert)",
  "Swaps (Expert)", "Foreign Exchange (Forex) (Expert)",
  "Cryptocurrency Analysis (Expert)", "Blockchain Technology (Expert)",
  "Decentralized Finance (DeFi) Strategies (Expert)", "NFT Investing (Expert)",
  "Web3 Business Models (Expert)", "Startup Ecosystems (Expert)",
  "Venture Capital Funding (Expert)", "Angel Investor Networks (Expert)",
  "Crowdfunding (Expert)", "Business Model Canvas (Expert)",
  "Value Proposition Design (Expert)", "Customer Segmentation (Expert)",
  "Market Sizing (Expert)", "Competitive Intelligence (Expert)",
  "SWOT Analysis (Expert)", "Porter's Five Forces (Expert)",
  "Strategic Planning (Expert)", "Organizational Structure (Expert)",
  "Leadership Styles (Expert)", "Motivation Theories (Expert)",
  "Team Leadership (Expert)", "Conflict Management (Expert)",
  "Negotiation Strategies (Expert)", "Decision Making (Business) (Expert)",
  "Problem Solving (Business) (Expert)", "Innovation Management (Expert)",
  "Change Leadership (Expert)", "Organizational Culture (Expert)",
  "Employee Engagement Strategies (Expert)", "Performance Management Systems (Expert)",
  "Talent Development (Expert)", "Succession Planning (Expert)",
  "Workforce Planning (Expert)", "Recruitment Marketing (Expert)",
  "Employer Branding (Expert)", "Candidate Experience (Expert)",
  "Interviewing Skills (Expert)", "Onboarding Programs (Expert)",
  "Training Program Design (Expert)", "Learning Technologies (Expert)",
  "HR Information Systems (HRIS) (Expert)", "HR Metrics & Analytics (Expert)",
  "Compensation & Benefits Management (Expert)", "Global HR (Expert)",
  "Diversity & Inclusion Programs (Expert)", "Workplace Wellness (Expert)",
  "Employee Relations Management (Expert)", "Labor Law Compliance (Expert)",
  "Collective Bargaining (Expert)", "Sales Funnel Management (Expert)",
  "Lead Generation (Expert)", "Sales Prospecting (Expert)",
  "Sales Presentation Skills (Expert)", "Closing Techniques (Expert)",
  "Customer Service Excellence (Expert)", "Service Recovery (Expert)",
  "Complaint Handling (Expert)", "Customer Loyalty Programs (Expert)",
  "Net Promoter Score (NPS) Implementation (Expert)",
  "Customer Journey Optimization (Expert)", "Service Design Methodology (Expert)",
  "User Interface (UI) Testing (Expert)", "User Experience (UX) Metrics (Expert)",
  "Heuristic Evaluation (Expert)", "A/B Testing (Expert)",
  "Information Architecture (Expert)", "Interaction Design Patterns (Expert)",
  "Usability Principles (Expert)", "Accessibility Standards (WCAG) (Expert)",
  "Design Thinking Workshops (Expert)", "Service Design Principles (Expert)",
  "User-Centered Design (Expert)", "Design Sprint (Expert)",
  "Visual Design Theory (Expert)", "Grid Systems (Expert)",
  "Layout Principles (Expert)", "Color Psychology (Expert)",
  "Branding Strategy (Expert)", "Brand Identity Design (Expert)",
  "Packaging Design Principles (Expert)", "Print Production (Expert)",
  "Digital Publishing (Expert)", "Editorial Design (Expert)",
  "Magazine Layout (Expert)", "Book Design Principles (Expert)",
  "Poster Design Techniques (Expert)", "Calligraphy Styles (Expert)",
  "Illustration Software (Expert)", "Digital Painting Software (Expert)",
  "Concept Art Software (Expert)", "Character Design Software (Expert)",
  "Environment Design Software (Expert)", "Prop Design Software (Expert)",
  "Hard Surface Modeling Software (Expert)", "Organic Modeling Software (Expert)",
  "Retopology Software (Expert)", "UV Mapping Software (Expert)",
  "Texturing Software (Expert)", "Shading Software (Expert)",
  "Lighting Software (3D) (Expert)", "Rendering Software (Expert)",
  "Animation Software (Expert)", "Character Rigging Software (Expert)",
  "Character Skinning Software (Expert)", "Motion Capture Software (Expert)",
  "Facial Rigging Software (Expert)", "Lip Sync Software (Expert)",
  "Walk Cycle Software (Expert)", "Run Cycle Software (Expert)",
  "Motion Graphics Software (Expert)", "Broadcast Graphics Design (Expert)",
  "Title Sequence Animation (Expert)", "Visual Effects Compositing (Expert)",
  "Green Screen Techniques (Expert)", "Matchmoving Software (Expert)",
  "Rotoscoping Software (Expert)", "Digital Painting (Expert)",
  "Concept Art (Expert)", "Storyboarding (Expert)", "Comic Book Production (Expert)",
  "Manga Drawing (Expert)", "Graphic Novel Production (Expert)",
  "Children's Book Illustration (Expert)", "Scientific Illustration (Expert)",
  "Medical Illustration (Expert)", "Fashion Illustration (Expert)",
  "Technical Illustration (Expert)", "Architectural Illustration (Expert)",
  "Botanical Illustration (Expert)", "Zoological Illustration (Expert)",
  "Figure Painting (Expert)", "Portrait Painting (Expert)",
  "Landscape Painting (Expert)", "Still Life Painting (Expert)",
  "Abstract Art Techniques (Expert)", "Art History (Expert)",
  "Art Conservation (Expert)", "Museum Exhibition Design (Expert)",
  "Gallery Marketing (Expert)", "Art Market Trends (Expert)",
  "Art Law (Expert)", "Art Ethics (Expert)", "Aesthetics (Expert)",
  "Museum Management (Expert)", "Conservation-Restoration (Expert)",
  "Archaeological Survey (Expert)", "Paleontology Lab Techniques (Expert)",
  "Oceanographic Instrumentation (Expert)", "Climatology Data Analysis (Expert)",
  "Meteorological Modeling (Expert)", "Seismology Data Interpretation (Expert)",
  "Volcanology Hazard Assessment (Expert)", "Glaciology Field Studies (Expert)",
  "Hydrology Data Collection (Expert)", "Geophysics Survey Methods (Expert)",
  "Geochemistry Lab Analysis (Expert)", "Mineralogy Identification Techniques (Expert)",
  "Petrology Lab Methods (Expert)", "Sedimentology Field Techniques (Expert)",
  "Stratigraphy Interpretation (Expert)", "Structural Geology Analysis (Expert)",
  "Planetary Geology (Expert)", "Exoplanet Characterization (Expert)",
  "Spacecraft Operations (Expert)", "Rocket Launch Systems (Expert)",
  "Satellite Data Analysis (Expert)", "Radio Telescope Operation (Expert)",
  "Gravitational Wave Detection (Expert)", "Dark Matter Research (Expert)",
  "Dark Energy Research (Expert)", "Cosmic Microwave Background Analysis (Expert)",
  "Human Evolution Research (Expert)", "Primate Conservation (Expert)",
  "Forensic Anthropology Research (Expert)", "Sociological Theory (Expert)",
  "Social Research Methods (Expert)", "Demographic Analysis (Expert)",
  "Urban Sociology (Expert)", "Rural Sociology (Expert)",
  "Family Sociology (Expert)", "Sociology of Education (Expert)",
  "Sociology of Health (Expert)", "Sociology of Religion (Expert)",
  "Sociology of Work (Expert)", "Criminology Research (Expert)",
  "Social Deviance Theory (Expert)", "Race & Ethnicity Studies (Expert)",
  "Gender Studies (Expert)", "Social Justice Movements (Expert)",
  "Community Development Planning (Expert)", "Public Policy Analysis (Expert)",
  "Policy Implementation (Expert)", "Program Evaluation (Expert)",
  "Public Sector Leadership (Expert)", "Nonprofit Governance (Expert)",
  "Grant Writing (Expert)", "Volunteer Management (Expert)",
  "Fundraising Campaigns (Expert)", "Philanthropic Advising (Expert)",
  "Sports Psychology (Expert)", "Exercise Physiology (Expert)",
  "Kinesiology (Expert)", "Biomechanics (Expert)",
  "Sports Medicine (Expert)", "Athletic Training (Expert)",
  "Physical Therapy (Sports) (Expert)", "Coaching Ethics (Expert)",
  "Team Performance Optimization (Expert)", "Sports Management (Expert)",
  "Sports Marketing (Expert)", "Sports Law (Expert)", "Sports Ethics (Expert)",
  "Mindfulness-Based Stress Reduction (MBSR) Teaching (Expert)",
  "Cognitive Behavioral Therapy (CBT) (Expert)", "Dialectical Behavior Therapy (DBT) (Expert)",
  "Acceptance and Commitment Therapy (ACT) (Expert)", "Trauma-Informed Practice (Expert)",
  "Grief & Loss Counseling (Expert)", "Addiction Counseling (Expert)",
  "Family Therapy (Expert)", "Couples Counseling (Expert)",
  "Child & Adolescent Psychopathology (Expert)", "Geriatric Mental Health (Expert)",
  "Neuropsychological Assessment (Expert)", "Forensic Psychology (Expert)",
  "Clinical Psychology (Expert)", "Counseling Psychology (Expert)",
  "Developmental Psychology (Expert)", "Social Psychology (Expert)",
  "Personality Psychology (Expert)", "Abnormal Psychology (Expert)",
  "Psychological Assessment (Expert)", "Research Methods (Psychology) (Expert)",
  "Statistical Analysis (Psychology) (Expert)", "Experimental Psychology (Expert)",
  "Cognitive Psychology (Expert)", "Learning Theories (Expert)",
  "Memory & Cognition (Expert)", "Perception (Expert)",
  "Emotion (Expert)", "Motivation (Expert)", "Intelligence (Expert)",
  "Creativity (Expert)", "Problem Solving (Psychology) (Expert)",
  "Decision Making (Psychology) (Expert)", "Judgment (Expert)",
  "Reasoning (Expert)", "Language Acquisition (Expert)",
  "Bilingualism (Expert)", "Neuroscience of Learning (Expert)",
  "Brain Imaging (Expert)", "Neuroanatomy (Expert)",
  "Neurophysiology (Expert)", "Neuropharmacology (Expert)",
  "Behavioral Neuroscience (Expert)", "Cognitive Neuroscience (Expert)",
  "Affective Neuroscience (Expert)", "Social Neuroscience (Expert)",
  "Neurodegenerative Diseases (Expert)", "Neurological Disorders (Expert)",
  "Child Development Stages (Expert)", "Adolescent Development (Expert)",
  "Adult Development (Expert)", "Aging & Gerontology (Expert)",
  "Family Systems Theory (Expert)", "Parenting Styles (Expert)",
  "Attachment Theory (Expert)", "Social Learning Theory (Expert)",
  "Group Dynamics (Expert)", "Intergroup Relations (Expert)",
  "Prejudice & Discrimination (Expert)", "Stereotypes (Expert)",
  "Conformity (Expert)", "Obedience (Expert)", "Altruism (Expert)",
  "Aggression (Expert)", "Attitudes & Persuasion (Expert)",
  "Social Influence (Expert)", "Social Cognition (Expert)",
  "Self-Concept (Expert)", "Identity (Expert)",
  "Health Psychology (Expert)", "Environmental Psychology (Expert)",
  "Legal Psychology (Expert)", "Organizational Psychology (Expert)",
  "Industrial-Organizational Psychology (Expert)", "Consumer Psychology (Expert)",
  "Educational Psychology (Expert)", "School Psychology (Expert)",
  "Rehabilitation Psychology (Expert)", "Sport Psychology (Expert)",
  "Positive Psychology (Expert)", "Community Psychology (Expert)",
  "Cross-Cultural Psychology (Expert)", "Evolutionary Psychology (Expert)",
].sort(); // Sort alphabetically for better UX

function AddCourseDialog({ children }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    chapters: 0,
    includeVideo: false,
    difficulty: "",
    category: "", // This will be the comma-separated string
  });

  // State for chapters dropdown and custom input
  const [selectedChapterOption, setSelectedChapterOption] = useState('');
  const [customChapters, setCustomChapters] = useState('');

  // State for category multi-select combobox
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);
  const [categoryInputSearch, setCategoryInputSearch] = useState(''); // For the CommandInput
  const [selectedCategories, setSelectedCategories] = useState([]); // Array of selected categories
  const [customCategoryValue, setCustomCategoryValue] = useState(''); // For the "Other" input

  // Effect to update formData.chapters
  useEffect(() => {
    if (selectedChapterOption === 'other') {
      const num = parseInt(customChapters, 10);
      setFormData((prev) => ({ ...prev, chapters: isNaN(num) ? 0 : num }));
    } else if (selectedChapterOption) {
      setFormData((prev) => ({ ...prev, chapters: parseInt(selectedChapterOption, 10) }));
    } else {
      setFormData((prev) => ({ ...prev, chapters: 0 }));
    }
  }, [selectedChapterOption, customChapters]);

  // Effect to update formData.category from selectedCategories and customCategoryValue
  useEffect(() => {
    let allCategories = [...selectedCategories];
    if (customCategoryValue.trim() && !allCategories.includes(customCategoryValue.trim())) {
      allCategories.push(customCategoryValue.trim());
    }
    setFormData((prev) => ({ ...prev, category: allCategories.join(', ') }));
  }, [selectedCategories, customCategoryValue]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = useCallback((categoryValue) => {
    if (categoryValue === "Other") {
      // "Other" is selected, just open the custom input, don't add "Other" to list
      setCustomCategoryValue(''); // Clear previous custom value
      setSelectedCategories([]); // Clear standard selections if "Other" is chosen
      setOpenCategoryCombobox(false);
      // The custom input will handle its value and add it to formData via useEffect
    } else {
      // Toggle selection for standard categories
      setSelectedCategories((prevSelected) => {
        const isSelected = prevSelected.includes(categoryValue);
        if (isSelected) {
          return prevSelected.filter((c) => c !== categoryValue);
        } else {
          return [...prevSelected, categoryValue];
        }
      });
      setCategoryInputSearch(''); // Clear search input after selection
      // Keep popover open for multi-select, or close if you prefer single select then re-open
      // setOpenCategoryCombobox(false); // Uncomment to close after each selection
    }
  }, []);

  const handleRemoveCategory = useCallback((categoryToRemove) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.filter((c) => c !== categoryToRemove)
    );
    if (customCategoryValue === categoryToRemove) {
      setCustomCategoryValue('');
    }
  }, [customCategoryValue]);


  const onGenerateCourse = async () => {
    // Basic validation
    const finalCategory = formData.category.trim();
    if (!formData.name || !formData.chapters || formData.chapters <= 0 || !formData.difficulty || !finalCategory) {
      alert("Please fill in all required fields: Course Name, Chapters, Difficulty, and at least one Category.");
      return;
    }

    const courseId = uuidv4();
    try {
      setLoading(true);
      const result = await axios.post("/api/generate-course-layout", {
        ...formData,
        courseId,
      });
      router.push("/workspace/edit-course/" + result.data?.courseId);
    } catch (error) {
      console.error("Error generating course:", error);
      alert("Failed to generate course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="
        backdrop-blur-md bg-[var(--card)]/90 border border-[var(--border)] shadow-2xl
        rounded-2xl p-6 text-[var(--foreground)]
        w-[95vw] md:max-w-lg max-h-[90vh] overflow-y-auto
      ">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading text-[var(--foreground)] mb-2">
            Generate New Course
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-6 mt-4 text-sm text-[var(--muted-foreground)]">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Course Name</label>
                <Input
                  placeholder="Enter course name, e.g., 'Introduction to Quantum Physics'"
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Course Description (optional)</label>
                <Textarea
                  placeholder="Provide a brief description of what the course will cover."
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                />
              </div>

              {/* Number of Chapters - Dropdown with "Other" input */}
              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Number of Chapters</label>
                <Select onValueChange={(value) => {
                  setSelectedChapterOption(value);
                  if (value !== 'other') {
                    setCustomChapters('');
                  }
                }} value={selectedChapterOption} required>
                  <SelectTrigger className="w-full bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]">
                    <SelectValue placeholder="Select number of chapters" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--popover)] border-[var(--border)] text-[var(--popover-foreground)]">
                    {CHAPTER_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                        className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                    <SelectItem
                      value="other"
                      className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                    >
                      Other (Enter Manually)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {selectedChapterOption === 'other' && (
                  <Input
                    type="number"
                    placeholder="Enter custom number of chapters"
                    value={customChapters}
                    onChange={(e) => setCustomChapters(e.target.value)}
                    className="mt-2 bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                    min="1"
                    required
                  />
                )}
              </div>

              {/* Include Video Lessons - Switch with improved neutral state */}
              <div className="flex items-center justify-between py-2">
                <label className="font-medium text-[var(--foreground)]">Include video lessons?</label>
                <Switch
                  checked={formData.includeVideo}
                  onCheckedChange={(checked) => handleInputChange("includeVideo", checked)}
                  className="data-[state=unchecked]:bg-[var(--muted-foreground)] data-[state=checked]:bg-[var(--primary)]"
                />
              </div>

              {/* Difficulty Level */}
              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Difficulty Level</label>
                <Select onValueChange={(val) => handleInputChange("difficulty", val)} required>
                  <SelectTrigger className="w-full bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--popover)] border-[var(--border)] text-[var(--popover-foreground)]">
                    <SelectItem value="beginner" className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]">Beginner</SelectItem>
                    <SelectItem value="intermediate" className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]">Intermediate</SelectItem>
                    <SelectItem value="advanced" className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category - Searchable Combobox with Multi-Select and "Other" input */}
              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Category (select multiple or type custom)</label>
                <Popover open={openCategoryCombobox} onOpenChange={setOpenCategoryCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCategoryCombobox}
                      className="w-full justify-between bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--input)]/80 focus:ring-[var(--ring)] focus:border-[var(--primary)] min-h-[40px] flex-wrap h-auto" // Added min-h and flex-wrap
                    >
                      <div className="flex flex-wrap gap-1">
                        {selectedCategories.length > 0 ? (
                          selectedCategories.map((category) => (
                            <span
                              key={category}
                              className="flex items-center gap-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full px-2 py-0.5 text-xs"
                            >
                              {category}
                              <XCircle
                                className="w-3 h-3 cursor-pointer hover:text-[var(--destructive)]"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent popover from closing
                                  handleRemoveCategory(category);
                                }}
                              />
                            </span>
                          ))
                        ) : customCategoryValue.trim() ? (
                          <span className="flex items-center gap-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full px-2 py-0.5 text-xs">
                            {customCategoryValue} (Custom)
                            <XCircle
                              className="w-3 h-3 cursor-pointer hover:text-[var(--destructive)]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomCategoryValue('');
                              }}
                            />
                          </span>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">Select category(s)...</span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[var(--popover)] border-[var(--border)] text-[var(--popover-foreground)] max-h-60 overflow-y-auto">
                    <Command className="bg-[var(--popover)]">
                      <CommandInput
                        placeholder="Search category..."
                        value={categoryInputSearch}
                        onValueChange={setCategoryInputSearch}
                        className="h-9 bg-[var(--input)] border-b border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                      />
                      <CommandEmpty className="py-4 text-center text-[var(--muted-foreground)]">No category found.</CommandEmpty>
                      <CommandGroup>
                        {CATEGORIES.filter(category =>
                          category.toLowerCase().includes(categoryInputSearch.toLowerCase())
                        ).map((category) => (
                          <CommandItem
                            key={category}
                            value={category}
                            onSelect={() => handleCategorySelect(category)} // Use new handler
                            className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCategories.includes(category) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {category}
                          </CommandItem>
                        ))}
                        <CommandItem
                          value="Other"
                          onSelect={() => handleCategorySelect("Other")} // Use new handler
                          className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] cursor-pointer font-semibold text-[var(--primary)]"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              customCategoryValue.trim() ? "opacity-100" : "opacity-0" // Check if custom value exists
                            )}
                          />
                          Other (Enter Manually)
                        </CommandItem>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {/* Custom Category Input (always visible if "Other" is selected, or if a custom value exists) */}
                {selectedCategories.length === 0 && ( // Only show custom input if no standard categories are selected
                  <Input
                    placeholder="Enter custom category"
                    value={customCategoryValue}
                    onChange={(e) => setCustomCategoryValue(e.target.value)}
                    className="mt-2 bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                    required={selectedCategories.length === 0} // Required if no standard categories are selected
                  />
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={onGenerateCourse}
                  disabled={loading || !formData.name || !formData.chapters || formData.chapters <= 0 || !formData.difficulty || (!selectedCategories.length && !customCategoryValue.trim())} // Updated validation
                  className="btn-primary gap-2 !text-base !h-12 !px-6"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkle className="w-5 h-5" />
                  )}
                  {loading ? "Generating..." : "Generate Course"}
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default AddCourseDialog;
