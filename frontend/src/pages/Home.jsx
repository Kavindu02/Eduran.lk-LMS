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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Teachers Data for Expert Faculty Section
  const teachers = [
    { name: "Positha THENNAKOON", subject: "Physics", qual: "B.Sc in PHYSICS", img: "/posithathennkoon.png" },
    { name: "Pramil Wijerathne", subject: "Combined Maths", qual: "Bsc. Engineering (Hons) University of Peradeniya", img: "/PramilWijerathne.png" },
    { name: "Lahiru Liyanarachchi", subject: "Economics", qual: "BBA.Mgt.SP University of Peradeniya | MAAT", img: "/LahiruLiyanarachchi.png" },
    { name: "MAHESH BAJJALA", subject: "Biology", qual: "B.Sc.(Biological Science) Hons. Special in Botany (Upper Division)", img: "/MAHESHBAJJALA.png" },
    { name: "CHANAKA WIJESINGHE", subject: "Biology", qual: "B.Sc (University of Colombo)", img: "/CHANAKAWIJESINGHE.png" },
    { name: "THUSHARA SAMPATH", subject: "Accounting", qual: "B.Sc Finance Special (SJP) | AAT Lecturer / Part Qualified ICASL", img: "/thushara.png" },
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
    <div className="min-h-screen bg-white selection:bg-emerald-500/30">
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
                     className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-500 group-hover:drop-shadow-[0_0_20px_#10b981]" 
                   />
                </div>
              </Link>
            </div>

            {/* Actions Section - Staggered Advanced Entrance */}
            <div className="flex items-center gap-6">
              
              {/* Modern Search Bar - Kinetic Design */}
              <div 
                className={`relative hidden md:flex items-center justify-end overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] animate-fadeIn ${
                  isSearchExpanded 
                  ? 'w-[420px] bg-white/10 border-emerald-500/50 ring-4 ring-emerald-500/5 shadow-[0_0_50px_rgba(16,185,129,0.1)]' 
                  : 'w-12 h-12 bg-white/5 border-white/10 hover:border-emerald-500/30 hover:bg-white/10'
                } backdrop-blur-2xl border rounded-full p-1.5 shadow-[0_0_40px_rgba(0,0,0,0.2)] cursor-pointer group`}
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
                      placeholder="SEARCH LESSONS..." 
                      className="bg-transparent border-none outline-none text-[10px] font-black tracking-[0.2em] text-white placeholder:text-white/30 w-full ml-4 uppercase"
                      onBlur={() => {
                        if (!searchInputRef.current?.value) {
                           setIsSearchExpanded(false);
                        }
                      }}
                    />
                  </div>
                  <div className={`h-9 w-9 bg-emerald-500 rounded-full flex-shrink-0 flex items-center justify-center text-black transition-all duration-500 shadow-lg shadow-emerald-500/20 active:scale-95 ${
                    !isSearchExpanded ? 'mx-auto' : 'group-hover:rotate-12'
                  }`}>
                    <Search className="w-4 h-4" />
                  </div>
              </div>

              <div className="flex items-center gap-8 animate-fadeInRight" style={{ animationDelay: '0.5s' }}>
                <Link 
                  to={user ? (user.role?.toLowerCase() === 'admin' ? "/admin/dashboard" : "/student/dashboard") : "/login"} 
                  className="group relative block"
                >
                  {/* Outer Glow Effect */}
                  <div className="absolute -inset-0.5 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-40 blur transition duration-500" />
                  
                  {/* Styled Button */}
                  <Button className="relative h-12 px-10 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black tracking-[0.25em] rounded-full transition-all duration-500 uppercase shadow-[4px_4px_0_0_rgba(16,185,129,0.3)] active:scale-95 border-none flex items-center gap-2 pointer-events-none">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="relative">GET STARTED</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Background Image with Green Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/color.png')",
          }}
        >
          {/* Optimization: Use simple overlay instead of heavy backdrop-blur */}
          <div className="absolute inset-0 bg-[#0d2b16]/75" />
        </div>

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
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
        <div className="absolute top-[15%] right-[40%] w-10 h-10 rounded-full bg-green-300 animate-bounce-subtle opacity-60" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 w-full flex-grow flex items-center pt-2 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            
            {/* Left Content */}
            <div className="space-y-12 pt-0 z-20 lg:-ml-12">
              <div className="space-y-4 -mt-44">
                <h1 className="text-7xl md:text-[110px] font-black leading-[0.98] tracking-tighter text-white uppercase drop-shadow-2xl">
                  <div className="overflow-hidden">
                    <span className="block animate-slideInUp" style={{ animationDelay: '0.1s' }}>WE CAN</span>
                  </div>
                  <div className="overflow-hidden">
                    <span className="block animate-slideInUp" style={{ animationDelay: '0.2s' }}>
                      TEACH <span className="text-emerald-500">YOU</span>
                    </span>
                  </div>
                </h1>
              </div>
              
              <div className="relative animate-fadeInLeft" style={{ animationDelay: '0.4s' }}>
                <p className="text-4xl md:text-5xl italic font-serif text-white underline underline-offset-[16px] decoration-2 decoration-white/40 tracking-wider">
                  are you ready to learn?
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-8 pt-0 animate-scaleIn" style={{ animationDelay: '0.6s' }}>
                <Button 
                  size="lg" 
                  onClick={scrollToWhyChoose}
                  className="relative h-14 px-9 bg-white hover:bg-emerald-600 text-black hover:text-white text-sm font-black rounded-sm shadow-[6px_6px_0_0_rgba(16,185,129,0.3)] transition-all duration-500 hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95 group overflow-hidden border-none uppercase tracking-[0.2em]"
                >
                  <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] duration-1000 transition-transform" />
                  <span className="relative flex items-center gap-4">
                    Learn More
                    <div className="bg-emerald-500/10 group-hover:bg-white/20 p-1.5 rounded-sm group-hover:translate-x-1 transition-all duration-500">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </span>
                </Button>
              </div>
            </div>

            {/* Right Side: Circular Rotator */}
            <div className="relative hidden lg:block h-[650px] animate-fadeIn">
              <div className="absolute -right-20 -bottom-20 w-[120%] h-[120%] pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-emerald-500 opacity-10 rounded-full blur-[80px]" />
              </div>

              <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative group p-6">
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 550 550">
                    <circle cx="275" cy="275" r="260" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
                    <circle
                      ref={progressCircleRef}
                      cx="275"
                      cy="275"
                      r="260"
                      stroke="#10b981"
                      strokeWidth="6"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={CIRCUMFERENCE}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 rounded-full border-[10px] border-white/5 shadow-[0_0_80px_rgba(16,185,129,0.1)] scale-[1.08]" />
                  <div className="relative w-[480px] h-[480px] rounded-full border-[15px] border-white/10 overflow-hidden shadow-[0_45px_100px_-20px_rgba(0,0,0,0.6)] bg-black/40 backdrop-blur-3xl group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-black to-green-950 opacity-40 animate-gradient-shift" />
                    <div className="absolute inset-0 w-full h-full p-3 transition-all duration-1000">
                      {heroImages.map((img, index) => (
                        <div 
                          key={index}
                          className={`absolute inset-0 w-full h-full transition-all duration-1000 transform flex items-center justify-center
                            ${currentImage === index ? 'opacity-100 scale-100' : 'opacity-0 scale-110 blur-xl pointer-events-none'}`}
                        >
                          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/20 shadow-inner">
                             <img 
                               src={img} 
                               alt="Modern Education" 
                               className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110" 
                             />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40 bg-black/40 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10">
                      {heroImages.map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => setCurrentImage(i)}
                          className={`h-2.5 rounded-full transition-all duration-500 ${currentImage === i ? 'w-10 bg-emerald-500' : 'w-2.5 bg-white/20 hover:bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl flex items-center justify-center animate-pulse cursor-pointer hover:bg-emerald-500 hover:border-emerald-400 transition-all duration-500 group z-50">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-90 transition-transform">
                      <Video className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-[20%] -right-12 flex flex-col gap-6 z-40 items-end">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setCurrentImage((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
                    className="w-14 h-14 rounded-2xl border border-white/10 bg-black/40 text-white flex items-center justify-center backdrop-blur-xl hover:bg-emerald-600 hover:border-emerald-500 transition-all shadow-2xl active:scale-90"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>
                  <button 
                    onClick={() => setCurrentImage((prev) => (prev + 1) % heroImages.length)}
                    className="w-14 h-14 rounded-2xl border border-white/10 bg-black/40 text-white flex items-center justify-center backdrop-blur-xl hover:bg-emerald-600 hover:border-emerald-500 transition-all shadow-2xl active:scale-90"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
          <svg className="relative block w-[calc(100%+1.3px)] h-[80px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="white"></path>
          </svg>
        </div>
      </section>

      {/* NEW SECTION: Why Choose Us (Zoomy-Style Layout) */}
      <section id="why-choose-section" className="py-32 bg-emerald-50/20 relative overflow-hidden transform-gpu">
        {/* Background Decorative patterns */}
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px] opacity-40 -z-10" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            
            {/* Left Column: Visual Stack */}
            <div className="relative flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[550px] aspect-square flex items-center justify-center">
                
                {/* 1. Main Emerald Container */}
                <div className="absolute w-[80%] h-[75%] bg-emerald-500 rounded-[60px] rotate-[-5deg] shadow-2xl animate-floating" />
                
                {/* 2. Main Character Image */}
                <div className="relative w-[90%] h-[90%] z-10 overflow-hidden flex items-end justify-center">
                  <img 
                    src="/leisure-activity-women-cute-grass-technology.jpg" 
                    alt="Student" 
                    loading="lazy"
                    className="w-full h-full object-cover rounded-[50px] transform transition-transform duration-700 hover:scale-105"
                  />
                </div>

                {/* 3. Floating Card: Island Rankings */}
                <div className="absolute -top-10 -left-12 z-20 bg-white p-5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-4 animate-bounce-subtle">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <span className="font-bold text-[#0A1D15] whitespace-nowrap">Island Rankings</span>
                </div>

                {/* 4. Floating Card: 200+ Video Lessons */}
                <div className="absolute top-10 -right-8 z-20 bg-white p-5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-4 animate-bounce-subtle" style={{ animationDelay: '1s' }}>
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-xl font-bold">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-[#0A1D15] whitespace-nowrap">200+ Video Lessons</span>
                </div>

                {/* 5. Floating Card: Active Learners */}
                <div className="absolute top-1/2 -left-20 -translate-y-1/2 z-20 bg-white p-6 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col gap-3 animate-floating" style={{ animationDelay: '0.5s' }}>
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Learners</span>
                  <div className="flex items-center">
                    <div className="flex -space-x-3">
                       <div className="w-10 h-10 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                         <img src="/heroimage.jpg" alt="Learner" className="w-full h-full object-cover" />
                       </div>
                       <div className="w-10 h-10 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                         <img src="/about1.jpg" alt="Learner" className="w-full h-full object-cover" />
                       </div>
                       <div className="w-10 h-10 rounded-full border-4 border-white overflow-hidden flex items-center justify-center bg-emerald-500 text-white text-[10px] font-bold">
                         3.5k+
                       </div>
                    </div>
                  </div>
                </div>

                {/* 6. Floating Card: Premium Study Tutes */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20 bg-white px-8 py-5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-4 animate-bounce-subtle" style={{ animationDelay: '1.5s' }}>
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <span className="font-bold text-[#0A1D15] whitespace-nowrap">Premium Study Tutes</span>
                </div>

                {/* 7. Dot Pattern */}
                <div className="absolute bottom-[-20px] right-[20%] w-32 h-32 opacity-20 -z-10 grid grid-cols-5 gap-3">
                   {Array.from({ length: 25 }).map((_, i) => (
                     <div key={i} className="w-2 h-2 rounded-full bg-emerald-500" />
                   ))}
                </div>

              </div>
            </div>

            {/* Right Column: Text Content */}
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-emerald-500 font-black tracking-[0.2em] uppercase text-sm block">Explore Eduran.lk</span>
                <h2 className="text-5xl md:text-6xl font-black text-[#0A1D15] leading-[1.1]">
                  Why Choose <br /> <span className="text-emerald-500">Eduran.lk?</span>
                </h2>
                <div className="w-20 h-1.5 bg-emerald-500 rounded-full" />
              </div>
              
              <p className="text-lg text-gray-500 leading-relaxed max-w-xl">
                We believe that education should be accessible, engaging, and specifically designed for success. Our mission is to provide the highest quality learning materials tailored for your academic growth.
              </p>

              <ul className="space-y-6">
                {[
                  { text: "Tailored courses designed for the Sri Lankan syllabus.", color: "text-emerald-500", bg: "bg-emerald-100" },
                  { text: "Expert educators with proven track records in A/L success.", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { text: "Learn together with 10k+ students on a modern platform.", color: "text-emerald-700", bg: "bg-emerald-100/50" }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-5 group">
                    <div className={`w-8 h-8 ${item.bg} rounded-full flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                      <CheckCircle2 className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-gray-700 font-bold text-lg">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-6">
                <Button 
                  onClick={scrollToAbout}
                  className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-black rounded-full shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 uppercase tracking-widest border-none"
                >
                  More Details
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* NEW ADDED: ABOUT SECTION */}
      <section id="about-section" className="relative py-40 overflow-hidden bg-[#1b4332] contain-paint transform-gpu">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Left: Vision Content */}
            <div className="space-y-10 animate-fadeInLeft">
              
              <h2 className="text-6xl md:text-7xl font-black text-white leading-[0.95] uppercase tracking-tighter">
                Sri Lanka's <br />
                <span className="text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">Premier Online</span> <br />
                Academy
              </h2>

              <div className="relative p-10 bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl group overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 transition-all duration-500 group-hover:w-3" />
                <p className="text-2xl md:text-3xl text-emerald-50/90 font-medium leading-relaxed italic relative z-10">
                  "Eduran.lk specializes in A/L private education and tuition. With tailored courses and expert educators, we empower students to excel, offering a pathway to academic success."
                </p>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="flex items-start gap-5 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 group">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-black shrink-0 group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">
                    <Target className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase text-sm tracking-widest mb-2">Tailored Learning</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">Courses designed specifically for the Sri Lankan syllabus and exam patterns.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 group">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-black shrink-0 group-hover:rotate-12 transition-transform shadow-lg shadow-white/10">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase text-sm tracking-widest mb-2">Expert Educators</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">Learn from the best teachers with proven track records in A/L success.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Modern Precisely Layered Composition - Precisely matching requested design */}
            <div className="relative hidden lg:flex items-center justify-center animate-fadeInRight" style={{ animationDelay: '0.4s' }}>
              <div className="relative w-full aspect-square max-w-[650px] flex items-center justify-center">
                
                {/* Background Book/Page Outline Graphic (Faint) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] opacity-10 pointer-events-none -z-10">
                   <div className="w-full h-full border-[1.5px] border-emerald-500 rounded-[40px] relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-full bg-emerald-500/50" />
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1.5px] bg-emerald-500/50 opacity-30" />
                   </div>
                </div>

                {/* Main Large Image (Top-Left Position) */}
                <div className="absolute top-0 left-4 w-[460px] h-[380px] rounded-[32px] overflow-hidden shadow-2xl z-20 animate-floating border-[12px] border-white">
                  <img 
                    src="/black-hat-university-graduates-is-placed-green-leaves.jpg" 
                    alt="Students Collaboration" 
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlapping Image (Bottom-Right Position) */}
                <div className="absolute bottom-4 right-4 w-[360px] h-[300px] rounded-[32px] overflow-hidden shadow-2xl z-30 animate-floating border-[12px] border-white" style={{ animationDelay: '1s' }}>
                  <img 
                    src="/rear-view-man-graduation-gown-standing-against-sky.jpg" 
                    alt="Academic Study" 
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Official Stat Card (Top-Right) */}
                <div className="absolute top-8 right-8 w-[160px] h-[220px] bg-[#1a4b8f] rounded-[24px] shadow-2xl z-40 flex flex-col items-center justify-center text-center p-6 animate-bounce-subtle">
                  <div className="relative mb-2">
                    <span className="text-white text-6xl font-black tracking-tighter">3.5k</span>
                    <span className="absolute -top-1 -right-5 text-blue-400 text-4xl font-bold">+</span>
                  </div>
                  <div className="text-white text-[10px] font-black tracking-[0.2em] uppercase leading-[1.5] opacity-90">
                    Students Active <br /> Our Courses
                  </div>
                </div>

                {/* Stylized Circle Graphics (Bottom-Left) - Now with smooth kinetic motion */}
                <div className="absolute bottom-16 left-[-60px] z-40 animate-floating">
                   <div className="relative group">
                      {/* Blue Circle Outline - Slow Rotation */}
                      <div className="w-44 h-44 border-[10px] border-[#1a4b8f] rounded-full animate-[spin_10s_linear_infinite]" />
                      
                      {/* Red Intersecting Circle Outline - Opposite Drift */}
                      <div className="absolute bottom-4 left-[75%] w-20 h-20 border-[8px] border-[#ef4444] rounded-full animate-bounce-subtle" style={{ animationDelay: '0.5s' }} />
                      
                      {/* Interactive Glow on Hover */}
                      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 rounded-full blur-2xl transition-colors duration-1000" />
                   </div>
                </div>

                {/* Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/5 rounded-full blur-[120px] -z-20" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* NEW SECTION: Expert Faculty (Customized to match requested "Latest News" style) */}
      <section id="faculty-section" className="relative pt-32 pb-40 overflow-hidden bg-white transform-gpu">
        
        {/* BOTTOM Colored Branding Section (Moved from top as requested) */}
        <div 
          className="absolute bottom-0 left-0 w-full h-[550px] -z-10 overflow-hidden"
          style={{ backgroundColor: '#13471E' }}
        >
           {/* Patterned Background Overlay - Performance Optimized to 15 symbols */}
           <div className="absolute inset-0 opacity-[0.1] mix-blend-overlay pointer-events-none transform-gpu">
              <div className="grid grid-cols-4 md:grid-cols-5 gap-32 p-10 rotate-12 scale-[1.5]">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="text-white text-6xl font-serif animate-floating will-change-transform"
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
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-400/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16 space-y-4"> <span className="text-[#00BC7D] font-black tracking-[0.2em] uppercase text-sm block">Expert Faculty</span>
            <h2 className="text-6xl md:text-7xl font-black text-[#0A1D15] leading-[1.1] tracking-tighter uppercase animate-fadeIn">
              Our Expert <span style={{ color: '#00BC7D' }}>Faculty</span> <br /> 
              <span style={{ color: '#00BC7D' }}>&</span> Educators
            </h2>
            <div className="w-24 h-2 mx-auto rounded-full" style={{ backgroundColor: '#1E6635' }} />
          </div>

          {/* Marquee/Scroll Container for Teachers - Styling matched to image cards */}
          <div className="relative group">
            <div className="flex gap-8 animate-scroll-x hover:[animation-play-state:paused] py-10">
              {[...teachers, ...teachers].map((teacher, idx) => (
                <div 
                  key={idx} 
                  className="flex-shrink-0 w-[380px] h-[480px] bg-white rounded-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] group/card relative overflow-hidden transition-all duration-700 hover:-translate-y-4"
                >
                  {/* Background Image with Dark Overlay */}
                  <img 
                    src={teacher.img} 
                    alt={teacher.name} 
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover/card:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 group-hover/card:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  {/* Content (Matching image detail) */}
                  <div className="absolute bottom-10 left-10 right-10 z-20 space-y-3">
                    <h3 className="text-3xl font-black text-white leading-none uppercase tracking-tighter line-clamp-2">
                      {teacher.name}
                    </h3>

                    <div className="w-12 h-1 rounded-full transition-all duration-700 group-hover/card:w-full" style={{ backgroundColor: '#1E6635' }} />

                    <p className="text-[11px] font-bold text-gray-300 uppercase leading-relaxed tracking-wider">
                       {teacher.qual}
                    </p>
                    
                    <div className="pt-2">
                      <span className="px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: 'rgba(30, 102, 53, 0.2)', borderColor: 'rgba(30, 102, 53, 0.3)', color: '#4cc977' }}>
                        {teacher.subject}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Border on Hover */}
                  <div className="absolute inset-0 border-[0px] transition-all duration-500 group-hover/card:border-[12px]" style={{ borderColor: 'rgba(30, 102, 53, 0.2)' }} />
                </div>
              ))}
            </div>

            {/* Pagination Dots (Visual only, to match image style) */}
            <div className="flex justify-center gap-2 mt-8 opacity-40">
               <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#0D2B16' }} />
               <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(13, 43, 22, 0.4)' }} />
               <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(13, 43, 22, 0.4)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Modern Compact Footer */}
      <footer className="relative bg-[#0A1D15] pt-8 pb-4 overflow-hidden border-t border-white/5">
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 pb-6 border-b border-white/5">
            {/* Brand Section */}
            <div className="space-y-6 text-center md:text-left">
              <Link to="/" className="inline-block transition-transform hover:scale-105">
                <div className="relative overflow-hidden w-32 h-auto md:w-36">
                  <img src="/logo.png" alt="Eduran.lk" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                </div>
              </Link>
              <p className="text-gray-400 text-[13px] max-w-[280px] leading-relaxed">
                Sri Lanka's premier academy. Empowering students with the highest quality education and expert faculty support.
              </p>
            </div>

            {/* Contact info links */}
            <div className="flex flex-wrap items-center justify-center gap-10">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-[#0A1D15] transition-all duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Email Support</h4>
                  <p className="text-white text-[13px] font-medium group-hover:text-emerald-400 transition-colors">eduranonlineeducationacademy@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-[#0A1D15] transition-all duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Call Center</h4>
                  <p className="text-white text-[13px] font-medium group-hover:text-emerald-400 transition-colors">074 351 1396</p>
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
                  className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white ${social.hoverColor} hover:border-transparent hover:text-white transition-all duration-300 group hover:-translate-y-1`}
                >
                  {social.isCustom ? <social.Icon /> : <social.Icon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />}
                </a>
              ))}
            </div>
          </div>

          {/* Copyright bar */}
          <div className="mt-4 flex flex-col items-center justify-center gap-6">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} <span className="text-emerald-500">EDURAN.LK</span> — ALL RIGHTS RESERVED
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
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
        </span>
      </a>
    </div>
  );
}