'use client';
import React from 'react';
import * as LucideIcons from 'lucide-react';

// Define the mapping of categories to Lucide React icons
const categoryIconMap = {
  // Core Academic
  'Programming': LucideIcons.Code,
  'Mathematics': LucideIcons.Calculator,
  'Physics': LucideIcons.Atom,
  'Chemistry': LucideIcons.FlaskConical,
  'Biology': LucideIcons.Dna,
  'History': LucideIcons.ScrollText,
  'Literature': LucideIcons.BookText,
  'Art': LucideIcons.Palette,
  'Music': LucideIcons.Music,
  'Philosophy': LucideIcons.Lightbulb,
  'Psychology': LucideIcons.Brain,
  'Sociology': LucideIcons.Users,
  'Economics': LucideIcons.LineChart,
  'Finance': LucideIcons.Banknote,
  'Business': LucideIcons.Briefcase,
  'Marketing': LucideIcons.Megaphone,

  // Tech & Data
  'Data Science': LucideIcons.Database,
  'Machine Learning': LucideIcons.Bot, // Changed from Robot to Bot
  'Web Development': LucideIcons.Globe,
  'Mobile Development': LucideIcons.Smartphone,
  'Cybersecurity': LucideIcons.ShieldCheck,
  'Networking': LucideIcons.Cable,
  'Cloud Computing': LucideIcons.Cloud,
  'Game Development': LucideIcons.Gamepad2,
  'Blockchain': LucideIcons.Blocks,
  'UI/UX Design': LucideIcons.Layout,
  'DevOps': LucideIcons.CloudCog,
  'Database Management': LucideIcons.Server,
  'Big Data': LucideIcons.HardDrive,
  'Data Visualization': LucideIcons.BarChart2,
  'Business Intelligence': LucideIcons.Presentation,
  'Fintech': LucideIcons.Wallet,
  'E-commerce': LucideIcons.ShoppingCart,
  'Digital Marketing': LucideIcons.Laptop,
  'SEO': LucideIcons.Search,
  'Content Creation': LucideIcons.PenTool,
  'Animation': LucideIcons.Film,
  'Robotics': LucideIcons.Factory,
  'Electronics': LucideIcons.CircuitBoard,
  'Quantum Computing': LucideIcons.Binary,
  'Cryptography': LucideIcons.Key,

  // Creative & Arts
  'Graphic Design': LucideIcons.Paintbrush,
  'Video Editing': LucideIcons.Video,
  'Photography': LucideIcons.Camera,
  'Creative Writing': LucideIcons.Feather,
  'Sculpting': LucideIcons.Hammer,
  'Drawing': LucideIcons.Pencil,
  'Painting': LucideIcons.Brush,
  'Theater': LucideIcons.Mask, // Confirmed Mask exists
  'Dance': LucideIcons.Footprints,
  'Film Production': LucideIcons.Clapperboard,
  'Music Production': LucideIcons.Headphones,
  'Songwriting': LucideIcons.Mic,
  'Instrument Learning': LucideIcons.Guitar,
  'Illustration': LucideIcons.PenLine,
  'Digital Painting': LucideIcons.Tablet, // Changed from TabletPen to Tablet
  'Concept Art': LucideIcons.Brush,
  'Fashion Design': LucideIcons.Shirt,
  'Interior Design': LucideIcons.Sofa,

  // Health & Wellness
  'Health & Fitness': LucideIcons.HeartPulse,
  'Nutrition': LucideIcons.Apple,
  'Public Health': LucideIcons.Hospital,
  'Epidemiology': LucideIcons.Virus, // Confirmed Virus exists
  'Anatomy': LucideIcons.Bone,
  'Physiology': LucideIcons.Lungs, // Confirmed Lungs exists
  'Pharmacology': LucideIcons.Pill,
  'Veterinary Science': LucideIcons.PawPrint,
  'Yoga': LucideIcons.Lotus, // Confirmed Lotus exists
  'Meditation & Mindfulness': LucideIcons.Leaf,
  'Sports Science': LucideIcons.Dumbbell,

  // Environmental & Earth
  'Environmental Science': LucideIcons.LeafyGreen,
  'Agriculture': LucideIcons.Sprout,
  'Geology': LucideIcons.Mountain,
  'Oceanography': LucideIcons.Waves,
  'Climate Change': LucideIcons.CloudSun,
  'Renewable Energy': LucideIcons.SolarPanel, // Confirmed SolarPanel exists
  'Urban Planning': LucideIcons.Building2,

  // Social & Humanities
  'Law': LucideIcons.Scale,
  'Medicine': LucideIcons.Stethoscope,
  'Education': LucideIcons.GraduationCap,
  'Astronomy': LucideIcons.Star,
  'Anthropology': LucideIcons.UsersRound,
  'Political Science': LucideIcons.Landmark,
  'Journalism': LucideIcons.Newspaper,
  'Culinary Arts': LucideIcons.Utensils,
  'Personal Finance': LucideIcons.PiggyBank,
  'Investing': LucideIcons.TrendingUp,
  'Entrepreneurship': LucideIcons.Rocket,
  'Public Speaking': LucideIcons.MicVocal,
  'Risk Management': LucideIcons.ShieldAlert,
  'Human Resources': LucideIcons.UserCog,
  'Project Management': LucideIcons.ClipboardCheck,
  'Supply Chain Management': LucideIcons.Truck,
  'International Relations': LucideIcons.Globe2,
  'Criminology': LucideIcons.Gavel,
  'Ethics': LucideIcons.Scale,
  'Logic': LucideIcons.Puzzle,
  'Negotiation': LucideIcons.Handshake,
  'Emotional Intelligence': LucideIcons.Heart,
  'Critical Thinking': LucideIcons.Lightbulb,
  'Public Administration': LucideIcons.Building,

  // DIY & Practical
  'Gardening': LucideIcons.Flower2,
  'DIY & Home Improvement': LucideIcons.Hammer,
  'Automotive': LucideIcons.Car,
  'Woodworking': LucideIcons.Axe,
  'Plumbing': LucideIcons.Droplet,
  'Electrical Wiring': LucideIcons.Bolt,
  'Carpentry': LucideIcons.Saw, // Confirmed Saw exists
  'Welding': LucideIcons.Flame,

  // Default for unrecognized categories
  'Default': LucideIcons.BookOpen
};

// Define color gradients for categories (no changes needed here, as they are not causing errors)
const categoryColorMap = {
  // Core Academic
  'Programming': ['#4CAF50', '#2E7D32'], // Green
  'Mathematics': ['#2196F3', '#1976D2'], // Blue
  'Physics': ['#FF9800', '#F57C00'], // Orange
  'Chemistry': ['#9C27B0', '#7B1FA2'], // Purple
  'Biology': ['#8BC34A', '#689F38'], // Light Green
  'History': ['#795548', '#5D4037'], // Brown
  'Literature': ['#607D8B', '#455A64'], // Blue Grey
  'Art': ['#E91E63', '#C2185B'], // Pink
  'Music': ['#00BCD4', '#0097A7'], // Cyan
  'Philosophy': ['#673AB7', '#512DA8'], // Deep Purple
  'Psychology': ['#FFC107', '#FFB300'], // Amber
  'Sociology': ['#9E9E9E', '#616161'], // Grey
  'Economics': ['#CDDC39', '#AFB42B'], // Lime
  'Finance': ['#4CAF50', '#2E7D32'], // Green (Money)
  'Business': ['#607D8B', '#455A64'], // Blue Grey
  'Marketing': ['#FF5722', '#E64A19'], // Deep Orange

  // Tech & Data
  'Data Science': ['#00BCD4', '#0097A7'], // Cyan
  'Machine Learning': ['#F44336', '#D32F2F'], // Red
  'Web Development': ['#2196F3', '#1976D2'], // Blue
  'Mobile Development': ['#3F51B5', '#303F9F'], // Indigo
  'Cybersecurity': ['#616161', '#424242'], // Dark Grey
  'Networking': ['#795548', '#5D4037'], // Brown
  'Cloud Computing': ['#90CAF9', '#64B5F6'], // Light Blue
  'Game Development': ['#673AB7', '#512DA8'], // Deep Purple
  'Blockchain': ['#FFEB3B', '#FBC02D'], // Yellow (Gold)
  'UI/UX Design': ['#FF9800', '#F57C00'], // Orange
  'DevOps': ['#4CAF50', '#2E7D32'], // Green
  'Database Management': ['#795548', '#5D4037'], // Brown
  'Big Data': ['#F44336', '#D32F2F'], // Red
  'Data Visualization': ['#2196F3', '#1976D2'], // Blue
  'Business Intelligence': ['#607D8B', '#455A64'], // Blue Grey
  'Fintech': ['#4CAF50', '#2E7D32'], // Green
  'E-commerce': ['#FF5722', '#E64A19'], // Deep Orange
  'Digital Marketing': ['#00BCD4', '#0097A7'], // Cyan
  'SEO': ['#FFC107', '#FFB300'], // Amber
  'Content Creation': ['#E91E63', '#C2185B'], // Pink
  'Animation': ['#9C27B0', '#7B1FA2'], // Purple
  'Robotics': ['#3F51B5', '#303F9F'], // Indigo
  'Electronics': ['#CDDC39', '#AFB42B'], // Lime
  'Quantum Computing': ['#673AB7', '#512DA8'], // Deep Purple
  'Cryptography': ['#616161', '#424242'], // Dark Grey

  // Creative & Arts
  'Graphic Design': ['#E91E63', '#C2185B'], // Pink
  'Video Editing': ['#FF5722', '#E64A19'], // Deep Orange
  'Photography': ['#9E9E9E', '#616161'], // Grey
  'Creative Writing': ['#795548', '#5D4037'], // Brown
  'Sculpting': ['#BDBDBD', '#9E9E9E'], // Light Grey
  'Drawing': ['#607D8B', '#455A64'], // Blue Grey
  'Painting': ['#FFC107', '#FFB300'], // Amber
  'Theater': ['#9C27B0', '#7B1FA2'], // Purple
  'Dance': ['#00BCD4', '#0097A7'], // Cyan
  'Film Production': ['#F44336', '#D32F2F'], // Red
  'Music Production': ['#673AB7', '#512DA8'], // Deep Purple
  'Songwriting': ['#8BC34A', '#689F38'], // Light Green
  'Instrument Learning': ['#FFEB3B', '#FBC02D'], // Yellow
  'Illustration': ['#E91E63', '#C2185B'], // Pink
  'Digital Painting': ['#FF9800', '#F57C00'], // Orange
  'Concept Art': ['#607D8B', '#455A64'], // Blue Grey
  'Fashion Design': ['#E91E63', '#C2185B'], // Pink
  'Interior Design': ['#795548', '#5D4037'], // Brown

  // Health & Wellness
  'Health & Fitness': ['#4CAF50', '#2E7D32'], // Green
  'Nutrition': ['#8BC34A', '#689F38'], // Light Green
  'Public Health': ['#00BCD4', '#0097A7'], // Cyan
  'Epidemiology': ['#F44336', '#D32F2F'], // Red
  'Anatomy': ['#9C27B0', '#7B1FA2'], // Purple
  'Physiology': ['#2196F3', '#1976D2'], // Blue
  'Pharmacology': ['#FF5722', '#E64A19'], // Deep Orange
  'Veterinary Science': ['#795548', '#5D4037'], // Brown
  'Yoga': ['#8BC34A', '#689F38'], // Light Green
  'Meditation & Mindfulness': ['#CDDC39', '#AFB42B'], // Lime
  'Sports Science': ['#FFC107', '#FFB300'], // Amber

  // Environmental & Earth
  'Environmental Science': ['#4CAF50', '#2E7D32'], // Green
  'Agriculture': ['#8BC34A', '#689F38'], // Light Green
  'Geology': ['#795548', '#5D4037'], // Brown
  'Oceanography': ['#2196F3', '#1976D2'], // Blue
  'Climate Change': ['#607D8B', '#455A64'], // Blue Grey
  'Renewable Energy': ['#FF9800', '#F57C00'], // Orange
  'Urban Planning': ['#9E9E9E', '#616161'], // Grey

  // Social & Humanities
  'Law': ['#3F51B5', '#303F9F'], // Indigo
  'Medicine': ['#F44336', '#D32F2F'], // Red
  'Education': ['#9C27B0', '#7B1FA2'], // Purple
  'Astronomy': ['#673AB7', '#512DA8'], // Deep Purple
  'Anthropology': ['#795548', '#5D4037'], // Brown
  'Political Science': ['#00BCD4', '#0097A7'], // Cyan
  'Journalism': ['#FFC107', '#FFB300'], // Amber
  'Culinary Arts': ['#FF5722', '#E64A19'], // Deep Orange
  'Personal Finance': ['#4CAF50', '#2E7D32'], // Green
  'Investing': ['#8BC34A', '#689F38'], // Light Green
  'Entrepreneurship': ['#FF9800', '#F57C00'], // Orange
  'Public Speaking': ['#2196F3', '#1976D2'], // Blue
  'Risk Management': ['#616161', '#424242'], // Dark Grey (New)
  'Human Resources': ['#E91E63', '#C2185B'], // Pink
  'Project Management': ['#00BCD4', '#0097A7'], // Cyan
  'Supply Chain Management': ['#795548', '#5D4037'], // Brown
  'International Relations': ['#3F51B5', '#303F9F'], // Indigo
  'Criminology': ['#F44336', '#D32F2F'], // Red
  'Ethics': ['#673AB7', '#512DA8'], // Deep Purple
  'Logic': ['#FFC107', '#FFB300'], // Amber
  'Negotiation': ['#4CAF50', '#2E7D32'], // Green
  'Emotional Intelligence': ['#E91E63', '#C2185B'], // Pink
  'Critical Thinking': ['#00BCD4', '#0097A7'], // Cyan
  'Public Administration': ['#9E9E9E', '#616161'], // Grey

  // DIY & Practical
  'Gardening': ['#8BC34A', '#689F38'], // Light Green
  'DIY & Home Improvement': ['#795548', '#5D4037'], // Brown
  'Automotive': ['#607D8B', '#455A64'], // Blue Grey
  'Woodworking': ['#795548', '#5D4037'], // Brown
  'Plumbing': ['#2196F3', '#1976D2'], // Blue
  'Electrical Wiring': ['#FFC107', '#FFB300'], // Amber
  'Carpentry': ['#795548', '#5D4037'], // Brown
  'Welding': ['#FF5722', '#E64A19'], // Deep Orange

  // Default for unrecognized categories
  'Default': ['#A7A7A7', '#7C7C7C'] // Neutral Grey
};

// Helper function to get icon and colors based on category string
const getCategoryIconAndColors = (categoryString) => {
  const categories = categoryString.split(',').map(c => c.trim());
  let IconComponent = categoryIconMap['Default'];
  let colors = categoryColorMap['Default'];

  for (const cat of categories) {
    const matchedCategory = Object.keys(categoryIconMap).find(key => 
      key.toLowerCase() === cat.toLowerCase()
    );
    if (matchedCategory) {
      IconComponent = categoryIconMap[matchedCategory];
      colors = categoryColorMap[matchedCategory];
      break; 
    }
  }

  return { IconComponent, colors };
};

const CategoryIconCard = ({ category, className = '' }) => {
  const { IconComponent, colors } = getCategoryIconAndColors(category);
  const gradientStyle = {
    backgroundImage: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})`,
  };

  return (
    <div
      className={`w-full h-48 rounded-lg flex items-center justify-center overflow-hidden ${className}`}
      style={gradientStyle}
      aria-label={`Category icon for ${category}`}
    >
      {IconComponent && <IconComponent className="w-24 h-24 text-white opacity-80" />}
    </div>
  );
};

export default CategoryIconCard;
