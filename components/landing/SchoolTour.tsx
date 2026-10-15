import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { 
  ArrowRight, 
  Building2,
  BookOpen, 
  Trees, 
  Cake, 
  UtensilsCrossed,
  ChefHat,
  Sparkles,
  CheckCircle2, 
  Camera, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Eye,
  Award
} from 'lucide-react';

export interface TourImage {
  src: string;
  title: string;
  caption: string;
  tag: string;
}

export interface TourSectionData {
  id: string;
  number: string;
  icon: React.ElementType;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  tagColor: string;
  highlights: string[];
  featuredImage: TourImage;
  images: TourImage[];
}

export const TOUR_SECTIONS: TourSectionData[] = [
  {
    id: 'about-school',
    number: '01',
    icon: Building2,
    badge: 'Campus & School Ethos',
    title: 'About Defined Domains',
    subtitle: 'A Sanctuary of Inclusion, Care & Academic Dignity',
    description:
      'Defined Domains Inclusive School is dedicated to providing specialized, compassionate, and holistic developmental day services. From our official school publications to our purpose-built campus and accredited educators, every detail is engineered to empower each child to thrive with dignity.',
    accentColor: 'from-blue-600 to-indigo-700',
    tagColor: 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-600/20',
    highlights: [
      'Accredited inclusive education & developmental day services',
      'Official School Magazine documenting student progress & advocacy',
      'Comprehensive multidisciplinary specialist & educator training',
      'Safe, enclosed campus grounds with secure perimeter and play lawns',
      'Official student uniforms, branded backpacks & developmental gear',
      'Compassionate mobility care and wheelchair-accessible infrastructure'
    ],
    featuredImage: {
      src: '/tour/school-students-hula-hoops.jpg',
      title: 'Student Joy & Friendship',
      caption: 'Students in official Defined Domains purple uniform celebrating school life with colorful hula hoops.',
      tag: 'Student Life'
    },
    images: [
      {
        src: '/tour/school-magazine-cover.jpg',
        title: 'Official School Magazine',
        caption: 'The Defined Domains Inclusive School Magazine highlighting school ethos, achievements, and family guidance.',
        tag: 'Publication'
      },
      {
        src: '/tour/school-inclusive-care-wheelchair.jpg',
        title: 'Compassionate Inclusive Care',
        caption: 'Individualized mobility support and dedicated care ensuring every learner participates fully in daily activities.',
        tag: 'Inclusion'
      },
      {
        src: '/tour/school-bags-gear.jpg',
        title: 'Official School Bags & Gear',
        caption: 'Custom Defined Domains backpacks and lunch packs designed for student identity and readiness.',
        tag: 'Uniform & Gear'
      },
      {
        src: '/tour/school-backpacks-desk.jpg',
        title: 'Daily Student Readiness',
        caption: 'Neatly organized school bags ready for morning arrival and personalized student learning plans.',
        tag: 'Campus Care'
      },
      {
        src: '/tour/school-staff-presentation.jpg',
        title: 'Educator & Specialist Training',
        caption: 'Continuous professional development sessions for our teaching team and pediatric specialists.',
        tag: 'Faculty'
      },
      {
        src: '/tour/playground-yellow-slide.jpg',
        title: 'Campus Adventure Playground',
        caption: 'Bright yellow lawn slide on safe, manicured grass for recreation and motor development.',
        tag: 'Grounds'
      },
      {
        src: '/tour/playground-swings-lawn.jpg',
        title: 'Campus Swings & Greenery',
        caption: 'Outdoor sensory swings surrounded by lush trees and natural Zimbabwean sunshine.',
        tag: 'Recreation'
      }
    ]
  },
  {
    id: 'learning-environment',
    number: '02',
    icon: BookOpen,
    badge: 'Therapeutic Classrooms',
    title: 'The Learning Environment',
    subtitle: 'Sensory-Attuned Spaces Built for Focus & Fine-Motor Mastery',
    description:
      'Our classrooms blend pedagogical structure with sensory comfort. With low-stimulus lighting, ergonomic circular discussion desks, posture-support high seating, fine-motor task baskets, and clean hydration dispensers, students receive the exact sensory diet they need to engage and achieve.',
    accentColor: 'from-emerald-600 to-teal-700',
    tagColor: 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-600/20',
    highlights: [
      'Color-coded collaborative tables fostering interaction and social dialogue',
      'Tactile floor puzzle mats for spatial reasoning and gross motor coordination',
      'Specialized posture-support high chairs and soothing developmental rockers',
      'Structured fine-motor peg sorting, bead threading, and manipulative baskets',
      'Accessible clean drinking water stations promoting hydration and autonomy',
      'Visual charts, alphabet guides, and individualized visual scheduling aids'
    ],
    featuredImage: {
      src: '/tour/classroom-tables-charts.jpg',
      title: 'Vibrant Multi-Sensory Classroom',
      caption: 'Circular collaboration desks, alphabet wall displays, and soft natural lighting calibrated for student focus.',
      tag: 'Classroom'
    },
    images: [
      {
        src: '/tour/learning-sensory-puzzle-mat.jpg',
        title: 'Floor Sensory Puzzle Mat',
        caption: 'Student assembling tactile interlocking alphabet and number floor tiles for sensory-motor coordination.',
        tag: 'Sensory Play'
      },
      {
        src: '/tour/learning-motor-skills-basket.jpg',
        title: 'Fine-Motor Skill Station',
        caption: 'Hands-on peg and bead sorting basket designed to cultivate grasp, precision, and hand-eye coordination.',
        tag: 'Motor Skills'
      },
      {
        src: '/tour/learning-motor-skills-beads.jpg',
        title: 'Cognitive Peg Sorting',
        caption: 'Focused developmental activity strengthening finger strength, color matching, and concentration.',
        tag: 'Fine Motor'
      },
      {
        src: '/tour/classroom-round-table-chairs.jpg',
        title: 'Collaborative Group Table',
        caption: 'Ergonomic round table with vibrant chairs encouraging shared activities and gentle peer interaction.',
        tag: 'Classroom'
      },
      {
        src: '/tour/classroom-desks-alphabet.jpg',
        title: 'Structured Learning Bay',
        caption: 'Individual learning desks with easy visual access to numeracy, alphabet, and behavior visual cues.',
        tag: 'Focus Area'
      },
      {
        src: '/tour/learning-sensory-rocker.jpg',
        title: 'Calming Sensory Rocker',
        caption: 'Therapeutic developmental rocker providing vestibular calming for younger learners.',
        tag: 'Therapy'
      },
      {
        src: '/tour/learning-support-chair-1.jpg',
        title: 'Adaptive Posture High-Chair',
        caption: 'Supportive high-seating station for stable posture during feeding, fine-motor tasks, and desktop work.',
        tag: 'Adaptive Care'
      },
      {
        src: '/tour/learning-support-chair-2.jpg',
        title: 'Developmental High Seat',
        caption: 'Comfortable positioning seat with safety harness tailored to support early learners.',
        tag: 'Supportive Seating'
      },
      {
        src: '/tour/learning-workstation-blue.jpg',
        title: 'Individual Activity Desk',
        caption: 'Single-student workstation with color-segmented storage for distraction-free task completion.',
        tag: 'Study Desk'
      },
      {
        src: '/tour/learning-sensory-trays.jpg',
        title: 'Tactile Activity Trays',
        caption: 'Stackable multi-colored trays organizing sensory materials, sorting sets, and craft resources.',
        tag: 'Sensory Tools'
      },
      {
        src: '/tour/facilities-water-dispenser-1.jpg',
        title: 'Accessible Hydration Station',
        caption: 'Child-accessible purified water station teaching independent hydration habits throughout the day.',
        tag: 'Health & Wellness'
      },
      {
        src: '/tour/facilities-water-dispenser-2.jpg',
        title: 'Fresh Water Hygiene Station',
        caption: 'Dedicated drinking and hand-hygiene point promoting daily cleanliness and self-care routines.',
        tag: 'Campus Wellness'
      }
    ]
  },
  {
    id: 'school-trips',
    number: '03',
    icon: Trees,
    badge: 'Outdoor & Nature Excursions',
    title: 'School Trips & Outdoor Adventures',
    subtitle: 'Connecting With Nature, Physical Freedom & World Discovery',
    description:
      'Learning extends far past the four walls of the school. Our guided outdoor trips to botanical gardens and nature trails provide students with sensory exploration, physical vitality, and real-world socialization, paired with on-campus gross-motor trampolines and sensory swings.',
    accentColor: 'from-amber-600 to-orange-700',
    tagColor: 'bg-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-600/20',
    highlights: [
      'Scenic park & botanical garden expeditions exploring indigenous flora',
      'Enclosed safety trampolines offering essential vestibular bounce therapy',
      'Wide open green lawn trails encouraging group walking and friendship',
      'Safe outdoor swing frames developing vestibular balance and calm rhythm',
      'Motor agility obstacle courses strengthening leg muscles and balance',
      'High educator-to-student supervision ratio on all external field excursions'
    ],
    featuredImage: {
      src: '/tour/school-trip-botanical-walk.jpg',
      title: 'Botanical Gardens Excursion',
      caption: 'Students walking through lush greenery on an experiential nature trail discovering trees and fresh park air.',
      tag: 'Field Excursion'
    },
    images: [
      {
        src: '/tour/school-trip-park-greenery.jpg',
        title: 'Nature Park Exploration',
        caption: 'Expansive green lawns where students enjoy outdoor recreation, picnics, and group nature walks.',
        tag: 'Park Trip'
      },
      {
        src: '/tour/school-trip-nature-trail.jpg',
        title: 'Scenic Walking Trail',
        caption: 'Guided nature walk cultivating environmental curiosity, sensory grounding, and physical fitness.',
        tag: 'Outdoor Adventure'
      },
      {
        src: '/tour/school-trip-park-smile.jpg',
        title: 'Smiles in the Fresh Air',
        caption: 'A joyous moment outdoors enjoying nature, sunshine, and companionship during a school field day.',
        tag: 'Student Joy'
      },
      {
        src: '/tour/outdoor-trampoline-large.jpg',
        title: 'Large Enclosed Safety Trampoline',
        caption: 'Heavy-duty trampoline with full safety net enclosure for high-energy vestibular bounce therapy.',
        tag: 'Vestibular Therapy'
      },
      {
        src: '/tour/outdoor-trampoline-enclosed.jpg',
        title: 'Safe Gross-Motor Bouncing',
        caption: 'Enclosed bounce arena supporting core muscle development, sensory regulation, and pure fun.',
        tag: 'Motor Play'
      },
      {
        src: '/tour/outdoor-trampoline-net.jpg',
        title: 'Protective Safety Enclosure',
        caption: 'High-density safety mesh ensuring maximum security during every jump and rebound exercise.',
        tag: 'Safety'
      },
      {
        src: '/tour/outdoor-swing-frame.jpg',
        title: 'Heavy-Duty Swing Frame',
        caption: 'Reinforced dual swings set on safe turf, offering calming rhythmic sensory input.',
        tag: 'Sensory Swings'
      },
      {
        src: '/tour/outdoor-swing-play.jpg',
        title: 'Outdoor Play Swings',
        caption: 'Students enjoying active swing time under the open sky with full staff guidance.',
        tag: 'Playground'
      },
      {
        src: '/tour/playground-lawn-swings.jpg',
        title: 'Garden Lawn Swings',
        caption: 'Peaceful garden swing corner framed by shady trees and green hedges.',
        tag: 'Garden Swings'
      },
      {
        src: '/tour/outdoor-agility-obstacle.jpg',
        title: 'Agility & Motor Obstacles',
        caption: 'Outdoor obstacle course components helping students develop balance, coordination, and agility.',
        tag: 'Physical Agility'
      }
    ]
  },
  {
    id: 'birthdays',
    number: '04',
    icon: Cake,
    badge: 'Milestone Celebrations',
    title: "Children's Birthdays",
    subtitle: 'Celebrating Every Unique Milestone With Love & Warmth',
    description:
      'Every single student is a treasured part of the Defined Domains family. We celebrate birthdays with tailor-made cakes, vibrant balloon arches, joyful party banners, cuddly teddy bears, and themed treat tables where peers share in the happiness.',
    accentColor: 'from-rose-500 to-pink-600',
    tagColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    highlights: [
      'Custom artisan birthday cakes personalized for each celebrated child',
      'Vibrant balloon arches, photo backdrops, and commemorative photo booths',
      'Party treat tables loaded with colorful cupcakes, desserts, and party snacks',
      'Gift presentation corners featuring soft teddy bears and festive favors',
      'Inclusive peer celebrations where classmates sing, cheer, and share cake',
      'Indoor and outdoor garden party setups tailored to each child’s sensory preferences'
    ],
    featuredImage: {
      src: '/tour/birthday-celebration-balloon-arch.jpg',
      title: 'Birthday Celebration Showcase',
      caption: 'Spectacular red & white balloon arch, teddy bear gift corner, and personalized party backdrop honoring our birthday stars.',
      tag: 'Party Setup'
    },
    images: [
      {
        src: '/tour/birthday-cake-kian.jpg',
        title: 'Personalized Birthday Cake',
        caption: 'Handcrafted celebratory cake iced with "Happy Birthday Kian" and celebration candles.',
        tag: 'Birthday Cake'
      },
      {
        src: '/tour/birthday-cupcakes-decor.jpg',
        title: 'Cupcake & Dessert Display',
        caption: 'Festive tiered dessert table with brightly frosted cupcakes, treats, and party tableware.',
        tag: 'Party Treats'
      },
      {
        src: '/tour/birthday-party-outdoor-setup.jpg',
        title: 'Outdoor Garden Party Setup',
        caption: 'Sunshine party area on the lawn featuring colorful balloon towers and celebratory displays.',
        tag: 'Garden Party'
      },
      {
        src: '/tour/birthday-gift-table-bears.jpg',
        title: 'Gifts & Teddy Bear Corner',
        caption: 'Charming gift station with plush teddy bears, personalized party boxes, and colorful balloons.',
        tag: 'Gifts & Memories'
      },
      {
        src: '/tour/birthday-buffet-treats.jpg',
        title: 'Celebratory Feast Buffet',
        caption: 'Delicious party spread with mini burgers, fruit skewers, wraps, and wholesome celebratory refreshments.',
        tag: 'Party Feast'
      }
    ]
  },
  {
    id: 'foodies',
    number: '05',
    icon: UtensilsCrossed,
    badge: 'Culinary & Practical Life-Skills',
    title: 'Foodies & Cooking Class',
    subtitle: 'Hands-On Culinary Skills, Dough Rolling & Fresh Kitchen Joy',
    description:
      'Cooking is one of our most beloved life-skills programs. Wearing authentic chef hats and bright green aprons, students measure ingredients, roll pizza dough, arrange savory toppings, and bake fresh artisan pizzas, learning kitchen safety, tactile motor control, and communal table etiquette.',
    accentColor: 'from-amber-500 to-yellow-600',
    tagColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    highlights: [
      'Authentic mini-chef attire: bright green aprons and professional chef hats',
      'Tactile dough rolling cultivating fine-motor grip, wrist strength, and bilateral coordination',
      'Fresh homemade pizza baking from yeast dough to savory melted cheese',
      'Kitchen safety, food hygiene, and measuring spoon life-skills education',
      'Communal dining experience where students serve and dine together with pride',
      'Nutrition awareness through balanced fresh fruits, artisan bread, and wholesome meals'
    ],
    featuredImage: {
      src: '/tour/foodies-baking-pizza-group.jpg',
      title: 'Artisan Pizza Baking Masterclass',
      caption: 'Students in chef hats and aprons actively assembling fresh pizzas on baking trays under caring teacher guidance.',
      tag: 'Culinary Class'
    },
    images: [
      {
        src: '/tour/foodies-chef-student-smile.jpg',
        title: 'Proud Young Chef',
        caption: 'Student proudly wearing chef hat and green apron, smiling brightly at the culinary workstation.',
        tag: 'Student Chef'
      },
      {
        src: '/tour/foodies-chef-portrait-joy.jpg',
        title: 'Confidence in the Kitchen',
        caption: 'Joy and culinary pride shine as students master new kitchen skills and prepare food for their peers.',
        tag: 'Life Skills'
      },
      {
        src: '/tour/foodies-rolling-dough-team.jpg',
        title: 'Rolling Pizza Dough',
        caption: 'Hands-on sensory motor lesson: rolling out fresh pizza dough and spreading savory tomato toppings.',
        tag: 'Hands-On'
      },
      {
        src: '/tour/foodies-fresh-baked-pizzas.jpg',
        title: 'Fresh From the Oven',
        caption: 'Golden-crusted, bubbling hot homemade pizzas fresh off the baking sheets ready to enjoy.',
        tag: 'Oven Fresh'
      },
      {
        src: '/tour/foodies-dining-table-setup.jpg',
        title: 'Wholesome Dining Table',
        caption: 'Elegantly arranged communal dining table featuring fresh fruit platters, bread, and wholesome refreshments.',
        tag: 'Healthy Dining'
      }
    ]
  }
];

export const SchoolTour: React.FC = () => {
  const { setView } = useStore();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [drawer, setDrawer] = useState<{
    section: TourSectionData;
    images: TourImage[];
    currentIndex: number;
  } | null>(null);

  // Keyboard navigation for drawer
  useEffect(() => {
    if (!drawer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawer(null);
      } else if (e.key === 'ArrowRight') {
        setDrawer(prev => prev ? {
          ...prev,
          currentIndex: (prev.currentIndex + 1) % prev.images.length
        } : null);
      } else if (e.key === 'ArrowLeft') {
        setDrawer(prev => prev ? {
          ...prev,
          currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
        } : null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawer]);

  const openDrawer = (section: TourSectionData, imageIndex: number) => {
    const allSectionImages = [section.featuredImage, ...section.images];
    setDrawer({
      section,
      images: allSectionImages,
      currentIndex: imageIndex,
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    if (sectionId === 'all') {
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const totalPhotosCount = TOUR_SECTIONS.reduce((acc, sec) => acc + sec.images.length + 1, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ── DRAWER / BOTTOM SHEET ───────────────────────────────────────────────── */}
      {/* Backdrop */}
      {drawer && (
        <div
          className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawer(null)}
        />
      )}

      {/* Desktop: right-side slide-in panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[1000] w-full max-w-[480px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out hidden md:flex ${
          drawer ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {drawer && (
          <>
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                {(() => { const Icon = drawer.section.icon; return <Icon size={16} className="text-blue-600" />; })()}
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${drawer.section.tagColor}`}>
                  {drawer.section.badge}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {drawer.currentIndex + 1} / {drawer.images.length}
                </span>
              </div>
              <button
                onClick={() => setDrawer(null)}
                className="p-2 rounded-[9px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main image */}
            <div className="relative overflow-hidden shrink-0 bg-slate-950" style={{ height: '260px' }}>
              <img
                key={drawer.currentIndex}
                src={drawer.images[drawer.currentIndex].src}
                alt={drawer.images[drawer.currentIndex].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-black text-sm uppercase tracking-tight leading-snug line-clamp-1">
                  {drawer.images[drawer.currentIndex].title}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                  {drawer.images[drawer.currentIndex].caption}
                </p>
              </div>
              {/* Prev / Next */}
              <button
                onClick={() => setDrawer(prev => prev ? { ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length } : null)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-blue-600 text-white transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setDrawer(prev => prev ? { ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length } : null)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-blue-600 text-white transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Section title + description */}
              <div className="space-y-1.5">
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  {drawer.section.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {drawer.section.description}
                </p>
              </div>

              {/* Highlights pills */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Highlights</p>
                <div className="flex flex-wrap gap-2">
                  {drawer.section.highlights.map((h, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Thumbnail strip */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">All Photos</p>
                <div className="grid grid-cols-4 gap-2">
                  {drawer.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setDrawer(prev => prev ? { ...prev, currentIndex: i } : null)}
                      className={`relative aspect-square rounded-[9px] overflow-hidden border-2 transition-all ${
                        drawer.currentIndex === i
                          ? 'border-blue-500 shadow-md shadow-blue-500/30'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.src} alt={img.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile: bottom sheet slide-up */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[1000] bg-white dark:bg-slate-900 rounded-t-[20px] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          drawer ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '88vh' }}
      >
        {drawer && (
          <>
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Mobile header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                {(() => { const Icon = drawer.section.icon; return <Icon size={14} className="text-blue-600" />; })()}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${drawer.section.tagColor}`}>
                  {drawer.section.badge}
                </span>
              </div>
              <button
                onClick={() => setDrawer(null)}
                className="p-1.5 rounded-[9px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Main image */}
            <div className="relative overflow-hidden shrink-0 bg-slate-950" style={{ height: '220px' }}>
              <img
                key={drawer.currentIndex}
                src={drawer.images[drawer.currentIndex].src}
                alt={drawer.images[drawer.currentIndex].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-black text-sm uppercase tracking-tight line-clamp-1">
                  {drawer.images[drawer.currentIndex].title}
                </h3>
              </div>
              <button
                onClick={() => setDrawer(prev => prev ? { ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length } : null)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-blue-600 text-white transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setDrawer(prev => prev ? { ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length } : null)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-blue-600 text-white transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Scrollable mobile content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  {drawer.section.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {drawer.section.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {drawer.section.highlights.map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {h}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {drawer.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setDrawer(prev => prev ? { ...prev, currentIndex: i } : null)}
                    className={`relative aspect-square rounded-[9px] overflow-hidden border-2 transition-all ${
                      drawer.currentIndex === i
                        ? 'border-blue-500'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.src} alt={img.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── HERO BANNER ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-slate-950 pt-32 pb-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="/tour/school-students-hula-hoops.jpg" 
            alt="Defined Domains Students" 
            className="w-full h-full object-cover object-center brightness-[0.35] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600/30 border border-blue-400/50 text-blue-200 backdrop-blur-md shadow-lg">
            <Sparkles size={16} className="animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">
              Virtual Campus & Community Tour
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white leading-[0.95]">
            Welcome to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-400">
              Defined Domains
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-100 max-w-3xl mx-auto font-medium leading-relaxed">
            Take an authentic visual walkthrough of our specialized inclusive day center. Explore our therapeutic classrooms, open-air field trips, birthday celebrations, and practical culinary masterclasses.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 text-left">
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-600 shadow-lg">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Camera size={18} />
                <span className="text-[10px] font-black uppercase tracking-wider">Photo Gallery</span>
              </div>
              <p className="text-2xl font-black text-white">{totalPhotosCount} Photos</p>
              <p className="text-[11px] text-slate-300">Authentic school moments</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-600 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-black uppercase tracking-wider">Accredited</span>
              </div>
              <p className="text-2xl font-black text-white">Inclusive Care</p>
              <p className="text-[11px] text-slate-300">Rhodene, Masvingo & Harare</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-600 shadow-lg">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <ChefHat size={18} />
                <span className="text-[10px] font-black uppercase tracking-wider">Life-Skills</span>
              </div>
              <p className="text-2xl font-black text-white">Cooking & Baking</p>
              <p className="text-[11px] text-slate-300">Hands-on autonomy</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-600 shadow-lg">
              <div className="flex items-center gap-2 text-rose-400 mb-1">
                <Cake size={18} />
                <span className="text-[10px] font-black uppercase tracking-wider">Milestones</span>
              </div>
              <p className="text-2xl font-black text-white">Birthdays & Joy</p>
              <p className="text-[11px] text-slate-300">Honoring every learner</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => scrollToSection('about-school')}
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-600/30 active:scale-95 flex items-center gap-3"
            >
              Start Tour <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => setView('apply')}
              className="px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 flex items-center gap-3"
            >
              Apply for Enrollment
            </button>
          </div>
        </div>
      </section>

      {/* ── STICKY SECTION NAV TABS ─────────────────────────────────────────────── */}
      <div className="sticky top-16 lg:top-20 z-40 bg-white dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800 shadow-md py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollToSection('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === 'all' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Sections
            </button>
            {TOUR_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={14} />
                  <span>{sec.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                    {sec.images.length + 1}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800 shrink-0">
            <button 
              onClick={() => setView('apply')}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>

      {/* ── TOUR SECTIONS ──────────────────────────────────────────────────────── */}
      <div className="space-y-28 md:space-y-36 py-20">
        {TOUR_SECTIONS.map((section, sectionIdx) => {
          const SectionIcon = section.icon;

          return (
            <section 
              key={section.id} 
              id={section.id}
              className="px-12 scroll-mt-36"
            >
              {/* Section Header Card — trimmed */}
              <div className="relative mb-10 overflow-hidden rounded-[9px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-lg shadow-slate-200/50 dark:shadow-none">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-xs font-black text-slate-500 dark:text-slate-400">
                    {section.number}
                  </span>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wider ${section.tagColor}`}>
                    <SectionIcon size={13} />
                    <span>{section.badge}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                  <span className="ml-auto text-xs font-bold text-slate-400">
                    {section.images.length + 1} Photos
                  </span>
                </div>
              </div>

              {/* Dynamic Photo Showcase */}
              <div className="space-y-5">
                
                {/* Featured Hero Photo */}
                <div 
                  onClick={() => openDrawer(section, 0)}
                  className="group relative cursor-pointer overflow-hidden rounded-[9px] bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl transition-all hover:border-blue-500"
                >
                  <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
                    <img 
                      src={section.featuredImage.src} 
                      alt={section.featuredImage.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Floating Zoom Button */}
                    <div className="absolute top-5 right-5 p-2.5 rounded-[9px] bg-black/50 hover:bg-blue-600 text-white backdrop-blur-md transition-all shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-105">
                      <Maximize2 size={18} />
                    </div>

                    {/* Featured Tag */}
                    <div className="absolute top-5 left-5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg">
                      {section.featuredImage.tag}
                    </div>

                    {/* Captions */}
                    <div className="absolute bottom-5 left-5 right-5 md:bottom-7 md:left-7 md:right-7 text-white space-y-1.5">
                      <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight">
                        {section.featuredImage.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Sub Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {section.images.map((img, imgIdx) => {
                    const globalIdx = imgIdx + 1; // 0 was featured
                    return (
                      <div
                        key={imgIdx}
                        onClick={() => openDrawer(section, globalIdx)}
                        className="group relative cursor-pointer overflow-hidden rounded-[9px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500"
                      >
                        {/* Image Frame */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                          <img 
                            src={img.src} 
                            alt={img.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="p-2.5 rounded-full bg-white/90 text-slate-900 shadow-xl">
                              <Eye size={18} />
                            </span>
                          </div>
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                            {img.tag}
                          </span>
                        </div>

                        {/* Card Info — title only */}
                        <div className="px-3 py-2.5 flex items-center justify-between">
                          <h4 className="font-black text-xs uppercase tracking-tight text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {img.title}
                          </h4>
                          <ChevronRight size={13} className="text-blue-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </section>
          );
        })}
      </div>

      {/* ── TESTIMONIAL & CERTIFICATION BANNER ───────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 py-24 border-y border-slate-200 dark:border-slate-800 my-16">
        <div className="px-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 text-xs font-black uppercase tracking-wider">
              <Award size={14} />
              Quality &amp; Compassion
            </div>
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
              An Environment Where <br />
              <span className="text-blue-600">Every Learner Belongs</span>
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              "At Defined Domains, inclusion is not merely a policy—it is our daily heartbeat. From therapeutic sensory classrooms and park walks to culinary life-skills and joyous birthday parties, we nurture every child's confidence, self-worth, and developmental growth."
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                DD
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase">The Defined Domains Team</p>
                <p className="text-xs text-slate-500">Multidisciplinary Educators &amp; Developmental Specialists</p>
              </div>
            </div>
          </div>

          {/* Quick Contact & Visit Info */}
          <div className="p-8 md:p-10 rounded-[9px] bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-6 shadow-2xl">
            <h4 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-blue-400">
              <MapPin size={20} /> Campus Visits &amp; Inquiries
            </h4>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Campus Locations</p>
                  <p>24 Eliot Street, Rhodene, Masvingo &amp; 27 Colnebrook Lane, Harare</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Direct Phone</p>
                  <p>+263 775 926 454</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Official Email</p>
                  <p>admin@defineddomain.org</p>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setView('apply')}
                className="w-full py-4 rounded-[9px] bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95"
              >
                Schedule an In-Person Campus Tour
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION ─────────────────────────────────────────────────── */}
      <section className="px-12 pb-28">
        <div className="relative overflow-hidden rounded-[9px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-10 md:p-16 text-center space-y-8 shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-widest backdrop-blur-md">
              Admissions Open
            </span>

            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight">
              Begin Your Child's Journey With Defined Domains
            </h2>

            <p className="text-base md:text-xl text-blue-100 font-medium leading-relaxed">
              We welcome new applications year-round. Connect with our admissions team to explore enrollment, schedule an individualized assessment, and discover how our inclusive programs can nurture your child's future.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button 
                onClick={() => setView('apply')}
                className="px-8 py-4 rounded-[9px] bg-white text-blue-900 hover:bg-slate-100 font-black uppercase tracking-widest text-xs transition-all shadow-2xl active:scale-95 flex items-center gap-3"
              >
                Apply for Enrollment <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => {
                  setView('landing');
                  setTimeout(() => {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="px-8 py-4 rounded-[9px] bg-black/30 hover:bg-black/40 text-white border border-white/30 font-black uppercase tracking-widest text-xs transition-all backdrop-blur-md active:scale-95"
              >
                Contact Admissions
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
