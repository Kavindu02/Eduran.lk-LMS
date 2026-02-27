import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Video,
  Users,
  LayoutDashboard,
  Target,
  Award,
  CheckCircle2,
  Play,
  ShieldCheck,
  GraduationCap,
  ArrowUp,
  Mail,
  Phone,
  MessageCircle,
  Youtube
} from 'lucide-react';

export default function Home() {
    // Scroll to hero section if hash is present in URL
    useEffect(() => {
      if (window.location.hash === '#hero-section') {
        setTimeout(() => {
          document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100); // Wait for page render
      }
    }, []);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Teachers Data for Expert Faculty Section
  const teachers = [
    { name: "Positha THENNAKOON", subject: "Physics", qual: "B.Sc in PHYSICS", img: "/posithathennkoon.png" },
    { name: "Pramil Wijerathne", subject: "Combined Maths", qual: "Bsc. Engineering (Hons) University of Peradeniya", img: "/PramilWijerathne.png" },
    { name: "Chanaka Wijesinghe", subject: "Chemistry", qual: "B.Sc (University of colombo)", img: "/chanaka.png" },
    { name: "MAHESH BAJJALA", subject: "Biology", qual: "B.Sc (Biological Science) Hons. Special in Botany (Upper Division)", img: "/MAHESHBAJJALA.png" },
    { name: "Dinuka Dilhara", subject: "Biology", qual: "B.Sc (University of Colombo)", img: "/DinukaDilhara.png" },
    { name: "THUSHARA SAMPATH", subject: "Accounting", qual: "B.Sc Finance Special (SJP) | AAT Lecturer / Part Qualified ICASL", img: "/thushara.png" },
    { name: "Lahiru Liyanarachchi", subject: "Economics", qual: "BBA.Mgt.SP University of Peradeniya | MAAT", img: "/LahiruLiyanarachchi.png" },
    { name: "DILAN WIJERATHNE", subject: "Business Studies", qual: "BBA, Mgt (UOC), CBF, DBF, Dip in HR", img: "/dialn.png" },
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);
  const progressCircleRef = useRef(null);

  // Constants for the circular progress (based on r=260)
  const CIRCUMFERENCE = 2 * Math.PI * 260;

  // Track page scroll for scroll-to-top button - High performance implementation
  useEffect(() => {
    let frameId;
    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        if (totalHeight > 0) {
          setScrollProgress((scrollY / totalHeight) * 100);
        }
        
        // Use a threshold to show/hide to avoid flicker
        setShowScrollTop(curr => {
          if (scrollY > 600 && !curr) return true;
          if (scrollY <= 600 && curr) return false;
          return curr;
        });
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Smooth scroll function for one-page navigation
  const scrollToAbout = () => {
    document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToWhyChoose = () => {
    document.getElementById('why-choose-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFaculty = () => {
    document.getElementById('faculty-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Redirect to register page
  const goToRegister = () => {
    navigate('/register');
  };

  // Optimize smooth scrolling and session management
  useEffect(() => {
    // If user is present on home hit, simply logout to reset
    if (user) {
      logout();
    }
  }, [user, logout]);

  const heroImages = [
    '/hero.jpg',
    '/male-scientist-carefully-studies-his-data.jpg',
    '/heroimage.jpg',
    '/group-friends-planning-trip-cafe.jpg',
  ];

  // Robust animation loop using ref to avoid React render cycles for progress
  useEffect(() => {
    const duration = 4000;
    const startTime = performance.now();
    let frameId;

    const tick = (now) => {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);

      // Update the circle's SVG attribute DIRECTLY for max performance (60fps)
      if (progressCircleRef.current) {
        const offset = CIRCUMFERENCE * (1 - pct / 100);
        progressCircleRef.current.style.strokeDashoffset = offset;
      }

      if (pct >= 100) {
        // Advance to next image only when cycle finishes
        setCurrentImage((curr) => (curr + 1) % heroImages.length);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [currentImage, heroImages.length, CIRCUMFERENCE]);

  return (
    <div className="min-h-screen bg-white selection:bg-green-500/30">
      {/* Hero Section */}
      <section id="hero-section" className="relative min-h-[850px] flex flex-col overflow-hidden transform-gpu">
        {/* Integrated Navigation Header (Floating Transparent) */}
        <header className="relative z-50 w-full -mt-14">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
            {/* Logo Section - Advanced Animated Entrance with Custom logo.png */}
            <div className="flex items-center animate-fadeInLeft -ml-6" style={{ animationDelay: '0.1s' }}>
              <Link to="/" className="group flex items-center transition-transform duration-500 hover:scale-105">
                <div className="relative overflow-hidden w-32 h-auto md:w-40">
                   <img 
                     src="/logo.png" 
                     alt="EDURA Logo" 
                     className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-500 group-hover:drop-shadow-[0_0_20px_#22c55e]" 
                   />
                </div>
              </Link>
            </div>

            {/* Actions Section - Staggered Advanced Entrance */}
            <div className="flex items-center gap-3 md:gap-10">
              
              {/* Navigation Link - Mobile only */}
              <button 
                onClick={scrollToFaculty}
                className="block lg:hidden text-[10px] font-black tracking-[0.25em] text-white/80 hover:text-green-500 transition-all duration-300 uppercase"
              >
                Our Teachers
              </button>
              {/* Navigation Link - Desktop only */}
              <button 
                onClick={scrollToFaculty}
                className="hidden lg:block text-[10px] font-black tracking-[0.25em] text-white/80 hover:text-green-500 transition-all duration-300 uppercase"
              >
                Our Teachers
              </button>
              
              {/* Modern Search Bar - Kinetic Design - Hidden on mobile */}
              <div 
                className={`relative hidden md:flex items-center justify-end overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] animate-fadeIn ${
                  isSearchExpanded 
                  ? 'w-[calc(100vw-180px)] sm:w-[320px] md:w-[420px] bg-white/10 border-green-500/50 ring-4 ring-green-500/5 shadow-[0_0_50px_rgba(34,197,94,0.1)]' 
                  : 'w-10 h-10 md:w-12 md:h-12 bg-white/5 border-white/10 hover:border-green-500/30 hover:bg-white/10'
                } backdrop-blur-2xl border rounded-full p-1 md:p-1.5 shadow-[0_0_40px_rgba(0,0,0,0.2)] cursor-pointer group`}
                onClick={() => {
                  if (!isSearchExpanded) {
                    setIsSearchExpanded(true);
                    setTimeout(() => searchInputRef.current?.focus(), 200);
                  }
                }}
                style={{ animationDelay: '0.3s' }}
              >
                  <div className={`flex items-center w-full transition-opacity duration-500 delay-100 ${isSearchExpanded ? 'opacity-100' : 'opacity-0'}`}>
                    <input 
                      ref={searchInputRef}
                      type="text" 
                      placeholder="SEARCH..." 
                      className="bg-transparent border-none outline-none text-[8px] md:text-[10px] font-black tracking-[0.2em] text-white placeholder:text-white/30 w-full ml-3 md:ml-4 uppercase"
                      onBlur={() => {
                        if (!searchInputRef.current?.value) {
                           setIsSearchExpanded(false);
                        }
                      }}
                    />
                  </div>
                  <div className={`h-8 w-8 md:h-9 md:w-9 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center text-black transition-all duration-500 shadow-lg shadow-green-500/20 active:scale-95 ${
                    !isSearchExpanded ? 'mx-auto' : 'group-hover:rotate-12'
                  }`}>
                    <Search className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
              </div>

              <div className="flex items-center gap-4 md:gap-8 animate-fadeInRight" style={{ animationDelay: '0.5s' }}>
                <Link 
                  to={user ? (user.role?.toLowerCase() === 'admin' ? "/admin/dashboard" : "/student/dashboard") : "/login"} 
                  className="group relative block"
                >
                  <div className="absolute -inset-0.5 bg-green-500 rounded-full opacity-0 group-hover:opacity-40 blur transition duration-500" />
                  <Button className="relative h-10 md:h-12 px-5 md:px-10 bg-green-600 hover:bg-green-700 text-white text-[9px] md:text-[11px] font-black tracking-[0.25em] rounded-full transition-all duration-500 uppercase shadow-[4px_4px_0_0_rgba(34,197,94,0.3)] active:scale-95 border-none flex items-center gap-2 pointer-events-none">
                    <LayoutDashboard className="w-4 h-4 md:w-4 md:h-4" />
                    <span className="relative hidden md:inline">GET STARTED</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Gradient Background for Hero section */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#2eb341] via-[#259334] to-[#15541c]" />

        {/* Background Pattern Elements - Performance Optimized to 12 symbols */}
        <div className="absolute inset-x-0 inset-y-0 opacity-[0.06] pointer-events-none select-none z-0 overflow-hidden transform-gpu">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-32 p-10 rotate-12 scale-[1.5]">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className="text-white text-5xl font-serif animate-floating will-change-transform"
                style={{ 
                  animationDelay: `${(i % 4) * 3}s`,
                  animationDuration: `${20 + (i % 6) * 5}s`
                }}
              >
                {['+', '×', '∑', 'π', 'θ', 'λ'][i % 6]}
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Splashes / Circles */}
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-green-400/20 blur-3xl animate-pulse" />
        <div className="absolute top-[15%] right-[40%] w-10 h-10 rounded-full bg-green-400 opacity-60 animate-bounce-subtle" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 w-full flex-grow flex items-center pt-10 lg:pt-2 pb-16 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-center w-full">
            
            {/* Left Content */}
            <div className="order-2 lg:order-1 space-y-8 lg:space-y-12 pt-0 z-20 text-center lg:text-left lg:-ml-12 -mt-16 lg:mt-0">
              <div className="space-y-4 mt-0 lg:-mt-44">
                <h1 className="text-4xl sm:text-6xl lg:text-[70px] font-black leading-[1.05] lg:leading-[1.05] tracking-tighter text-white uppercase drop-shadow-2xl">
                  <div className="overflow-hidden">
                    <span
                      className="block animate-slideInUp text-white font-serif font-bold normal-case"
                      style={{ animationDelay: '0.1s' }}
                    >
                      <span className="block sm:inline">Sri Lanka’s</span>
                      <span className="block sm:inline sm:ml-2">No 01</span>
                    </span>
                  </div>
                  <div className="overflow-hidden">
                    <span
                      className="block animate-slideInUp text-green-500 font-black uppercase"
                      style={{ animationDelay: '0.2s' }}
                    >
                      <span className="text-[2.8rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[7.5rem] xl:text-[9rem] 2xl:text-[10rem] leading-none">ONLINE</span>
                    </span>
                  </div>
                  <div className="overflow-hidden">
                    <span
                      className="block animate-slideInUp text-white font-extrabold uppercase"
                      style={{ animationDelay: '0.3s' }}
                    >
                      <span className="text-[1.5rem] sm:text-[2.2rem] md:text-[2.8rem]">LEARNING ACADEMY</span>
                    </span>
                  </div>
                </h1>
              </div>
              
              <div className="relative animate-fadeInLeft" style={{ animationDelay: '0.4s' }}>
                {/* Removed 'are you ready to learn?' as requested */}
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-0 animate-scaleIn" style={{ animationDelay: '0.6s' }}>
                <Button 
                  size="lg" 
                  onClick={goToRegister}
                  className="relative h-14 px-9 bg-white hover:bg-green-600 text-black hover:text-white text-sm font-black rounded-sm shadow-[6px_6px_0_0_rgba(34,197,94,0.3)] transition-all duration-500 hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95 group overflow-hidden border-none uppercase tracking-[0.2em]"
                >
                  <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] duration-1000 transition-transform" />
                  <span className="relative flex items-center gap-4">
                    Register Now
                    <div className="bg-green-500/10 group-hover:bg-white/20 p-1.5 rounded-sm group-hover:translate-x-1 transition-all duration-500">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </span>
                </Button>
              </div>
            </div>

            {/* Right Side: Circular Rotator - Visible on All Screens now */}
            <div className="order-1 lg:order-2 relative block h-[380px] sm:h-[500px] lg:h-[650px] animate-fadeIn -mt-16 lg:mt-0">
              <div className="absolute -right-20 -bottom-20 w-[120%] h-[120%] pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] right-[-10%] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-white opacity-5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[200px] lg:w-[300px] h-[200px] lg:h-[300px] bg-green-500 opacity-10 rounded-full blur-[80px]" />
              </div>

              <div className="absolute top-[40%] lg:top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative group p-4 lg:p-6 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none scale-[1.05] sm:scale-[1.08] lg:scale-110 transform-gpu" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }} viewBox="0 0 550 550">
                    <circle cx="275" cy="275" r="260" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
                    <circle
                      ref={progressCircleRef}
                      cx="275"
                      cy="275"
                      r="260"
                      stroke="#22c55e"
                      strokeWidth="8"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={CIRCUMFERENCE}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 rounded-full border-[6px] lg:border-[10px] border-white/5 shadow-[0_0_80px_rgba(34,197,94,0.1)] scale-[1.05] lg:scale-[1.08]" />
                  <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] lg:w-[480px] lg:h-[480px] rounded-full border-[10px] lg:border-[15px] border-white/10 overflow-hidden shadow-[0_45px_100px_-20px_rgba(0,0,0,0.6)] bg-black/20 backdrop-blur-3xl group transform-gpu" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-black to-black opacity-20 animate-gradient-shift transform-gpu" />
                    <div className="absolute inset-0 w-full h-full p-2 lg:p-3 transition-all duration-1000 transform-gpu">
                      {heroImages.map((img, index) => (
                        <div 
                          key={index}
                          className={`absolute inset-0 w-full h-full transition-all duration-1000 transform flex items-center justify-center transform-gpu
                            ${currentImage === index ? 'opacity-100 scale-100' : 'opacity-0 scale-105 lg:scale-110 md:blur-lg lg:blur-xl pointer-events-none'}`}
                        >
                          <div className="relative w-full h-full rounded-full overflow-hidden border border-white/20 shadow-inner transform-gpu" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                             <img 
                               src={img} 
                               alt="Modern Education" 
                               className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110 transform-gpu" 
                             />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-6 lg:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 lg:gap-4 z-40 bg-black/40 backdrop-blur-md px-4 lg:px-6 py-2 lg:py-2.5 rounded-full border border-white/10">
                      {heroImages.map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => setCurrentImage(i)}
                          className={`h-2 lg:h-2.5 rounded-full transition-all duration-500 ${currentImage === i ? 'w-6 lg:w-10 bg-green-500' : 'w-2 lg:w-2.5 bg-white/20 hover:bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="absolute -top-2 lg:-top-6 -left-2 lg:-left-6 w-16 h-16 lg:w-24 lg:h-24 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl flex items-center justify-center animate-pulse cursor-pointer hover:bg-green-500 hover:border-green-400 transition-all duration-500 group z-50">
                    <div className="w-10 h-10 lg:w-16 lg:h-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-90 transition-transform">
                      <Video className="w-5 h-5 lg:w-8 lg:h-8 text-white fill-current" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-[5%] sm:bottom-[10%] lg:bottom-[20%] right-0 lg:-right-12 hidden lg:flex flex-col gap-6 z-40 items-end">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setCurrentImage((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
                    className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl border border-white/10 bg-black/40 text-white flex items-center justify-center backdrop-blur-xl hover:bg-green-600 hover:border-green-500 transition-all shadow-2xl active:scale-90"
                  >
                    <ChevronLeft className="w-5 h-5 lg:w-7 lg:h-7" />
                  </button>
                  <button 
                    onClick={() => setCurrentImage((prev) => (prev + 1) % heroImages.length)}
                    className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl border border-white/10 bg-black/40 text-white flex items-center justify-center backdrop-blur-xl hover:bg-green-600 hover:border-green-500 transition-all shadow-2xl active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5 lg:w-7 lg:h-7" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Wave Divider - Hidden on mobile to keep solid green background and avoid white mixing as requested */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180 hidden lg:block">
          <svg className="relative block w-[calc(100%+1.3px)] h-[80px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="white"></path>
          </svg>
        </div>
      </section>

      {/* NEW SECTION: Why Choose Us (Zoomy-Style Layout) */}
      <section id="why-choose-section" className="py-20 lg:py-32 bg-green-50/20 relative overflow-hidden transform-gpu">
        {/* Background Decorative patterns */}
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-green-100 rounded-full blur-[120px] opacity-40 -z-10" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left Column: Visual Stack */}
            <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
              <div className="relative w-full max-w-[450px] lg:max-w-[550px] aspect-square flex items-center justify-center">
                
                {/* 1. Main Green Container */}
                <div className="absolute w-[80%] h-[75%] bg-green-500 rounded-[40px] lg:rounded-[60px] rotate-[-5deg] shadow-2xl animate-floating" />
                
                {/* 2. Main Character Image */}
                <div className="relative w-[90%] h-[90%] z-10 overflow-hidden flex items-end justify-center">
                  <img 
                    src="/leisure-activity-women-cute-grass-technology.jpg" 
                    alt="Student" 
                    loading="lazy"
                    className="w-full h-full object-cover rounded-[35px] lg:rounded-[50px] transform transition-transform duration-700 hover:scale-105"
                  />
                </div>

                {/* 3. Floating Card: Island Rankings - Hid on extra small, repositioned for mobile */}
                <div className="absolute -top-6 lg:-top-10 -left-6 lg:-left-12 z-20 bg-white p-3 lg:p-5 rounded-[18px] lg:rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-3 lg:gap-4 animate-bounce-subtle">
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-100 rounded-xl lg:rounded-2xl flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-5 h-5 lg:w-7 lg:h-7" />
                  </div>
                  <span className="font-bold text-[#0A1D15] text-xs lg:text-base whitespace-nowrap">Island Rankings</span>
                </div>

                {/* 4. Floating Card: 200+ Video Lessons */}
                <div className="absolute top-4 lg:top-10 -right-4 lg:-right-8 z-20 bg-white p-3 lg:p-5 rounded-[18px] lg:rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-3 lg:gap-4 animate-bounce-subtle" style={{ animationDelay: '1s' }}>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-100 rounded-xl lg:rounded-2xl flex items-center justify-center text-blue-600">
                    <Video className="w-4 h-4 lg:w-6 lg:h-6" />
                  </div>
                  <span className="font-bold text-[#0A1D15] text-xs lg:text-base whitespace-nowrap">200+ Lessons</span>
                </div>

                {/* 5. Floating Card: Active Learners - Optimized for mobile */}
                <div className="absolute top-1/2 -left-4 lg:-left-20 -translate-y-1/2 z-20 bg-white p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col gap-2 lg:gap-3 animate-floating" style={{ animationDelay: '0.5s' }}>
                  <span className="text-[8px] lg:text-sm font-bold text-gray-400 uppercase tracking-widest">Active Learners</span>
                  <div className="flex items-center">
                    <div className="flex -space-x-2 lg:-space-x-3">
                       <div className="w-7 h-7 lg:w-10 lg:h-10 rounded-full border-2 lg:border-4 border-white overflow-hidden bg-gray-200">
                         <img src="/heroimage.jpg" alt="Learner" className="w-full h-full object-cover" />
                       </div>
                       <div className="w-7 h-7 lg:w-10 lg:h-10 rounded-full border-2 lg:border-4 border-white overflow-hidden bg-gray-200">
                         <img src="/about1.jpg" alt="Learner" className="w-full h-full object-cover" />
                       </div>
                       <div className="w-7 h-7 lg:w-10 lg:h-10 rounded-full border-2 lg:border-4 border-white overflow-hidden flex items-center justify-center bg-green-500 text-white text-[8px] lg:text-[10px] font-bold">
                         3.5k+
                       </div>
                    </div>
                  </div>
                </div>

                {/* 6. Floating Card: Premium Study Tutes */}
                <div className="absolute -bottom-6 lg:-bottom-12 left-1/2 -translate-x-1/2 z-20 bg-white px-5 lg:px-8 py-3 lg:py-5 rounded-[18px] lg:rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-3 lg:gap-4 animate-bounce-subtle" style={{ animationDelay: '1.5s' }}>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-100 rounded-xl lg:rounded-2xl flex items-center justify-center text-green-500">
                    <BookOpen className="w-5 h-5 lg:w-7 lg:h-7" />
                  </div>
                  <span className="font-bold text-[#0A1D15] text-xs lg:text-base whitespace-nowrap">Premium Study Tutes</span>
                </div>

                {/* 7. Dot Pattern */}
                <div className="absolute bottom-[-10px] lg:bottom-[-20px] right-[15%] lg:right-[20%] w-24 h-24 lg:w-32 lg:h-32 opacity-20 -z-10 grid grid-cols-5 gap-2 lg:gap-3">
                   {Array.from({ length: 25 }).map((_, i) => (
                     <div key={i} className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-green-500" />
                   ))}
                </div>

              </div>
            </div>

            {/* Right Column: Text Content */}
            <div className="space-y-8 lg:space-y-10 order-1 lg:order-2 text-center lg:text-left">
              <div className="space-y-4">
                <span className="text-green-500 font-black tracking-[0.2em] uppercase text-xs lg:text-sm block">Explore Eduran.lk</span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0A1D15] leading-[1.1]">
                  Why Choose <br className="hidden sm:block" /> <span className="text-green-500">Eduran.lk?</span>
                </h2>
                <div className="w-16 lg:w-20 h-1 lg:h-1.5 bg-green-500 rounded-full mx-auto lg:mx-0" />
              </div>
              
              <p className="text-base lg:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                We believe that education should be accessible, engaging, and specifically designed for success. Our mission is to provide the highest quality learning materials tailored for your academic growth.
              </p>

              <ul className="space-y-4 lg:space-y-6 text-left max-w-md mx-auto lg:mx-0">
                {[
                  { text: "Tailored courses designed for the Sri Lankan syllabus.", color: "text-green-500", bg: "bg-green-100" },
                  { text: "Expert educators with proven track records in A/L success.", color: "text-green-600", bg: "bg-green-50" },
                  { text: "Learn together with 10k+ students on a modern platform.", color: "text-green-700", bg: "bg-green-100/50" }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 lg:gap-5 group">
                    <div className={`w-7 h-7 lg:w-8 lg:h-8 ${item.bg} rounded-full flex-shrink-0 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                      <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 fill-current" />
                    </div>
                    <span className="text-gray-700 font-bold text-sm lg:text-lg">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 lg:pt-6">
                <Button 
                  onClick={scrollToAbout}
                  className="h-14 lg:h-16 px-10 lg:px-12 bg-green-600 hover:bg-green-700 text-white text-base lg:text-lg font-black rounded-full shadow-[0_20px_40px_rgba(34,197,94,0.3)] transition-all hover:scale-105 active:scale-95 uppercase tracking-widest border-none"
                >
                  More Details
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* NEW ADDED: ABOUT SECTION */}
      <section id="about-section" className="relative py-20 lg:py-40 overflow-hidden bg-[#1b4332] contain-paint transform-gpu">
        {/* Background Image - Optimized: removed fixed attachment due to scroll jank */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={{ 
            backgroundImage: "url('/about1.jpg')",
          }}
        >
          {/* Optimization: Use simple overlay to prevent scroll stutter */}
          <div className="absolute inset-0 bg-[#0a1d15]/95 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1b4332]/50 via-transparent to-[#1b4332]/50 pointer-events-none" />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            
            {/* Left: Vision Content */}
            <div className="space-y-8 lg:space-y-10 animate-fadeInLeft text-center lg:text-left">
              
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] lg:leading-[0.95] uppercase tracking-tighter">
                Sri Lanka's <br />
                <span className="text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]">Premier Online</span> <br />
                Academy
              </h2>

              <div className="relative p-7 lg:p-10 bg-white/5 backdrop-blur-xl rounded-[30px] lg:rounded-[40px] border border-white/10 shadow-2xl group overflow-hidden mx-auto lg:mx-0">
                <div className="absolute top-0 left-0 w-2 h-full bg-green-500 transition-all duration-500 group-hover:w-3" />
                <p className="text-xl sm:text-2xl lg:text-3xl text-green-50/90 font-medium leading-relaxed italic relative z-10 text-pretty">
                  "Eduran.lk specializes in A/L private education and tuition. With tailored courses and expert educators, we empower students to excel, offering a pathway to academic success."
                </p>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-4">
                <div className="flex items-start gap-4 lg:gap-5 p-5 lg:p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-green-500/10 hover:border-green-500/30 transition-all duration-500 group text-left">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-green-500 flex items-center justify-center text-black shrink-0 group-hover:rotate-12 transition-transform shadow-lg shadow-green-500/20">
                    <Target className="w-6 h-6 lg:w-7 lg:h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase text-xs lg:text-sm tracking-widest mb-1 lg:mb-2">Tailored Learning</h4>
                    <p className="text-xs lg:text-sm text-gray-400 leading-relaxed">Courses designed specifically for the Sri Lankan syllabus and exam patterns.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 lg:gap-5 p-5 lg:p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-green-500/10 hover:border-green-500/30 transition-all duration-500 group text-left">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white flex items-center justify-center text-black shrink-0 group-hover:rotate-12 transition-transform shadow-lg shadow-white/10">
                    <Award className="w-6 h-6 lg:w-7 lg:h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase text-xs lg:text-sm tracking-widest mb-1 lg:mb-2">Expert Educators</h4>
                    <p className="text-xs lg:text-sm text-gray-400 leading-relaxed">Learn from the best teachers with proven track records in A/L success.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Modern Precisely Layered Composition - Responsive for all screens */}
            <div className="relative flex items-center justify-center animate-fadeInRight" style={{ animationDelay: '0.4s' }}>
              <div className="relative w-full aspect-square max-w-[400px] sm:max-w-[500px] lg:max-w-[650px] flex items-center justify-center">
                
                {/* Background Book/Page Outline Graphic (Faint) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] opacity-10 pointer-events-none -z-10">
                   <div className="w-full h-full border-[1.5px] border-green-500 rounded-[30px] lg:rounded-[40px] relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-full bg-green-500/50" />
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1.5px] bg-green-500/50 opacity-30" />
                   </div>
                </div>

                {/* Main Large Image (Top-Left Position) */}
                <div className="absolute top-0 left-0 w-[70%] h-[60%] sm:w-[460px] sm:h-[380px] rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-2xl z-20 animate-floating border-[6px] lg:border-[12px] border-white">
                  <img 
                    src="/black-hat-university-graduates-is-placed-green-leaves.jpg" 
                    alt="Students Collaboration" 
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlapping Image (Bottom-Right Position) */}
                <div className="absolute bottom-0 right-0 w-[60%] h-[50%] sm:w-[360px] sm:h-[300px] rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-2xl z-30 animate-floating border-[6px] lg:border-[12px] border-white" style={{ animationDelay: '1s' }}>
                  <img 
                    src="/rear-view-man-graduation-gown-standing-against-sky.jpg" 
                    alt="Academic Study" 
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Official Stat Card (Top-Right) */}
                <div className="absolute top-[5%] right-[5%] w-[80px] h-[110px] sm:w-[130px] sm:h-[180px] lg:w-[160px] lg:h-[220px] bg-[#1a4b8f] rounded-[15px] lg:rounded-[24px] shadow-2xl z-40 flex flex-col items-center justify-center text-center p-3 lg:p-6 animate-bounce-subtle">
                  <div className="relative mb-1 lg:mb-2">
                    <span className="text-white text-2xl sm:text-4xl lg:text-6xl font-black tracking-tighter">3.5k</span>
                    <span className="absolute -top-1 -right-3 sm:-right-4 lg:-right-5 text-blue-400 text-xl sm:text-3xl lg:text-4xl font-bold">+</span>
                  </div>
                  <div className="text-white text-[6px] sm:text-[8px] lg:text-[10px] font-black tracking-[0.1em] lg:tracking-[0.2em] uppercase leading-[1.3] lg:leading-[1.5] opacity-90">
                    Students Active <br /> Our Courses
                  </div>
                </div>

                {/* Stylized Circle Graphics (Bottom-Left) */}
                <div className="absolute bottom-[5%] left-[-10%] sm:left-[-30px] lg:left-[-60px] z-40 animate-floating scale-50 sm:scale-75 lg:scale-100">
                   <div className="relative group">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-44 lg:h-44 border-[6px] lg:border-[10px] border-[#1a4b8f] rounded-full animate-[spin_10s_linear_infinite]" />
                      <div className="absolute bottom-2 lg:bottom-4 left-[75%] w-12 h-12 lg:w-20 lg:h-20 border-[4px] lg:border-[8px] border-[#ef4444] rounded-full animate-bounce-subtle" style={{ animationDelay: '0.5s' }} />
                      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 rounded-full blur-2xl transition-colors duration-1000" />
                   </div>
                </div>

                {/* Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-green-500/5 rounded-full blur-[80px] lg:blur-[120px] -z-20" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* NEW SECTION: Expert Faculty (Customized to match requested "Latest News" style) */}
      <section id="faculty-section" className="relative pt-16 lg:pt-32 pb-24 lg:pb-40 overflow-x-hidden bg-white transform-gpu">
        
        {/* BOTTOM Colored Branding Section */}
        <div 
          className="absolute bottom-0 left-0 w-full h-[400px] lg:h-[550px] -z-10 overflow-hidden bg-gradient-to-br from-[#2eb341] via-[#259334] to-[#15541c]"
        >
           {/* Patterned Background Overlay - Performance Optimized to 15 symbols */}
           <div className="absolute inset-0 opacity-[0.1] mix-blend-overlay pointer-events-none transform-gpu">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-20 lg:gap-32 p-10 rotate-12 scale-[1.5]">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="text-white text-3xl lg:text-6xl font-serif animate-floating will-change-transform"
                    style={{ 
                      animationDelay: `${(i % 5) * 4}s`,
                      animationDuration: `${18 + (i % 6) * 6}s`
                    }}
                  >
                    {['∑', 'π', 'θ', 'λ', '×'][i % 5]}
                  </div>
                ))}
              </div>
           </div>
           {/* Ambient Glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-green-400/10 rounded-full blur-[80px] lg:blur-[120px]" />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-10 lg:mb-16 space-y-3 lg:space-y-4"> 
            <span className="text-[#22c55e] font-black tracking-[0.2em] uppercase text-[10px] lg:text-sm block">Expert Faculty</span>
            <h2 className="text-3xl sm:text-6xl lg:text-7xl font-black text-[#0A1D15] leading-[1.1] tracking-tighter uppercase animate-fadeIn">
              Our Expert <span style={{ color: '#22c55e' }}>Faculty</span> <br className="sm:hidden" /> 
              <span className="hidden sm:inline"> </span><span style={{ color: '#22c55e' }}>&</span> Educators
            </h2>
            <div className="w-12 lg:w-24 h-1 lg:h-2 mx-auto rounded-full" style={{ backgroundColor: '#22c55e' }} />
          </div>

          {/* Marquee/Scroll Container for Teachers - Stable Infinite Loop */}
          <div className="relative group overflow-hidden">
            <div className="flex animate-scroll-x hover:[animation-play-state:paused] py-10 transform-gpu" style={{ 
              width: 'max-content',
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden'
            }}>
              {[...teachers, ...teachers].map((teacher, idx) => (
                <div 
                  key={idx} 
                  className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[380px] h-[380px] sm:h-[420px] lg:h-[480px] bg-white rounded-none shadow-[10px_10px_20px_-5px_rgba(0,0,0,0.3)] group/card relative overflow-hidden transition-all duration-700 hover:-translate-y-4 transform-gpu backface-hidden mr-4 lg:mr-8 p-4 sm:p-0 flex flex-col sm:block"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden',
                    contain: 'paint'
                  }}
                >
                  {/* Image Container - Smaller on mobile, full background on desktop */}
                  <div className="relative h-56 sm:h-full w-full overflow-hidden rounded-2xl sm:rounded-none sm:absolute sm:inset-0">
                    <img 
                      src={teacher.img} 
                      alt={teacher.name} 
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[2000ms] group-hover/card:scale-110 transform-gpu"
                      style={{ imageRendering: 'auto', backfaceVisibility: 'hidden' }}
                    />
                    {/* Dark Overlays - Only visible on desktop background style */}
                    <div className="absolute inset-0 bg-[#0A1D15]/40 group-hover/card:bg-[#0A1D15]/30 transition-colors duration-500 hidden sm:block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1D15] via-[#0A1D15]/20 to-transparent hidden sm:block" />
                  </div>

                  {/* Content - Moved below image on mobile, overlay on desktop */}
                  <div className="relative mt-5 sm:mt-0 sm:absolute sm:bottom-10 sm:left-10 sm:right-10 z-20 space-y-2 lg:space-y-3 transform-gpu">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0A1D15] sm:text-white leading-none uppercase tracking-tighter line-clamp-2 drop-shadow-none sm:drop-shadow-lg">
                      {teacher.name}
                    </h3>

                    <div className="w-8 lg:w-12 h-1 lg:h-1.5 rounded-full transition-all duration-700 group-hover/card:w-full" style={{ backgroundColor: '#22c55e' }} />

                    <p className="text-[10px] lg:text-[11px] font-bold text-gray-600 sm:text-gray-200 uppercase leading-relaxed tracking-wider line-clamp-2">
                       {teacher.qual}
                    </p>
                    
                    <div className="pt-1">
                      <span className="px-2 lg:px-3 py-1 border rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-widest inline-block" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#15803d' }}>
                        {teacher.subject}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Border on Hover - Hidden on mobile view padding */}
                  <div className="absolute inset-0 border-[0px] transition-all duration-500 group-hover/card:border-[8px] lg:group-hover/card:border-[12px] hidden sm:block" style={{ borderColor: 'rgba(34, 197, 94, 0.2)' }} />
                </div>
              ))}
            </div>

            {/* Pagination Dots (Visual only, to match image style) */}
            <div className="flex justify-center gap-2 mt-4 lg:mt-8 opacity-40">
               <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full" style={{ backgroundColor: '#15803d' }} />
               <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full" style={{ backgroundColor: 'rgba(21, 128, 61, 0.4)' }} />
               <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full" style={{ backgroundColor: 'rgba(21, 128, 61, 0.4)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Modern Compact Footer */}
      <footer className="relative bg-[#0A1D15] pt-12 lg:pt-16 pb-6 lg:pb-8 overflow-hidden border-t border-white/5">
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-green-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12 pb-8 lg:pb-10 border-b border-white/5">
            {/* Brand Section */}
            <div className="space-y-4 lg:space-y-6 text-center lg:text-left">
              <Link to="/" className="inline-block transition-transform hover:scale-105">
                <div className="relative overflow-hidden w-32 h-auto md:w-36 lg:w-40">
                  <img src="/logo.png" alt="Eduran.lk" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
                </div>
              </Link>
              <p className="text-gray-400 text-xs lg:text-[13px] max-w-[320px] leading-relaxed mx-auto lg:mx-0">
                Sri Lanka's premier academy. Empowering students with the highest quality education and expert faculty support.
              </p>
            </div>

            {/* Contact info links - Responsive stacking */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6 lg:gap-10">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 group-hover:bg-green-500 group-hover:text-[#0A1D15] transition-all duration-300">
                  <Mail className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Email Support</h4>
                  <p className="text-white text-xs lg:text-[13px] font-medium group-hover:text-green-400 transition-colors">eduranonlineeducationacademy@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 group-hover:bg-green-500 group-hover:text-[#0A1D15] transition-all duration-300">
                  <Phone className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Call Center</h4>
                  <p className="text-white text-xs lg:text-[13px] font-medium group-hover:text-green-400 transition-colors">074 351 1396</p>
                </div>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-4">
              {[
                { 
                  Icon: Facebook, 
                  href: "https://www.facebook.com/eduranonlineacademy/",
                  hoverColor: "hover:bg-blue-600"
                },
                { 
                  Icon: Instagram, 
                  href: "https://www.instagram.com/eduran.lk/",
                  hoverColor: "hover:bg-pink-600"
                },
                { 
                  Icon: Youtube, 
                  href: "https://www.youtube.com/@EduranOnlineAcademy",
                  hoverColor: "hover:bg-red-600"
                },
                {
                  isCustom: true,
                  Icon: () => (
                    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .8.11V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.51A6.25 6.25 0 0 0 15.82 16V6.26a8.27 8.27 0 0 0 5.18 1.84V4.65a4.83 4.83 0 0 1-1.41-.26 4.83 4.83 0 0 1-1.41-.26z"/>
                    </svg>
                  ),
                  href: "https://www.tiktok.com/@eduran.lk?is_from_webapp=1&sender_device=pc",
                  hoverColor: "hover:bg-black"
                }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white ${social.hoverColor} hover:border-transparent hover:text-white transition-all duration-300 group hover:-translate-y-1`}
                >
                  {social.isCustom ? <social.Icon /> : <social.Icon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />}
                </a>
              ))}
            </div>
          </div>

          {/* Copyright bar */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <p className="text-gray-500 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.3em] text-center">
              © {new Date().getFullYear()} <span className="text-green-500 font-black">EDURAN.LK</span> — ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Join Button - Icon expands to text on hover */}
      <a 
        href="https://wa.me/94743511396"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[100] flex items-center bg-[#25D366] text-white h-14 px-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] transition-all duration-500 hover:scale-110 hover:bg-[#20ba59] active:scale-95 group overflow-hidden"
      >
        <svg 
          viewBox="0 0 24 24" 
          className="w-7 h-7 fill-white shrink-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-3 transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap font-bold text-sm tracking-wide">
          Click now to join the class!
        </span>
        
        {/* Pulsing indicator */}
        <span className="absolute -top-1 -left-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
        </span>
      </a>
    </div>
  );
}