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
  LayoutDashboard
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const progressCircleRef = useRef(null);

  // Constants for the circular progress (based on r=260)
  const CIRCUMFERENCE = 2 * Math.PI * 260;

  // Force logout on home hit to clear stuck sessions
  useEffect(() => {
    if (user) {
      logout();
      window.location.reload();
    }
  }, []);

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[850px] flex flex-col overflow-hidden">
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
              <div className="relative group hidden md:block animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full py-2 pl-5 pr-2 focus-within:w-72 w-56 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_0_40px_rgba(0,0,0,0.2)] group-hover:border-emerald-500/30 group-hover:bg-white/10">
                  <input 
                    type="text" 
                    placeholder="Search Lessons..." 
                    className="bg-transparent border-none outline-none text-[11px] font-bold tracking-widest text-white placeholder:text-white/30 w-full uppercase"
                  />
                  <button className="h-9 w-9 bg-emerald-500 rounded-full flex items-center justify-center text-black hover:scale-110 hover:rotate-12 transition-all duration-500 shadow-lg shadow-emerald-500/20 active:scale-90">
                    <Search className="w-4 h-4" />
                  </button>
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
          <div className="absolute inset-0 bg-[#1b4332]/60 backdrop-blur-[4px]" />
        </div>

        {/* Background Pattern Elements (Similar to the image dots/symbols) */}
        <div className="absolute inset-x-0 inset-y-0 opacity-[0.08] pointer-events-none select-none z-0 overflow-hidden">
          <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-12 p-5 rotate-12 scale-[1.8]">
            {Array.from({ length: 120 }).map((_, i) => (
              <div 
                key={i} 
                className="text-white text-3xl font-serif animate-floating"
                style={{ 
                  animationDelay: `${(i % 8) * 1.5}s`,
                  animationDuration: `${10 + (i % 5) * 2}s`
                }}
              >
                {['+', '×', '∑', '?', '!', '}', '{', 'π', 'θ', 'λ'][i % 10]}
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Splashes / Circles */}
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
        <div className="absolute top-[15%] right-[40%] w-10 h-10 rounded-full bg-green-300 animate-bounce-subtle opacity-60" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 w-full flex-grow flex items-center pt-2 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            
            {/* Left Content: Advanced Modern Typography & Animations */}
            <div className="space-y-12 pt-0 z-20 lg:-ml-12">
              {/* Advanced Text with Word-by-Word Animation Style */}
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
              
              {/* Refined "are you ready to learn?" script style from image */}
              <div className="relative animate-fadeInLeft" style={{ animationDelay: '0.4s' }}>
                <p className="text-4xl md:text-5xl italic font-serif text-white underline underline-offset-[16px] decoration-2 decoration-white/40 tracking-wider">
                  are you ready to learn?
                </p>
              </div>

              {/* Advanced Button with Glow & Scale Entry */}
              <div className="flex flex-wrap items-center gap-8 pt-0 animate-scaleIn" style={{ animationDelay: '0.6s' }}>
                <Link to="/register">
                  <Button size="lg" className="relative h-14 px-9 bg-white hover:bg-emerald-600 text-black hover:text-white text-sm font-black rounded-sm shadow-[6px_6px_0_0_rgba(16,185,129,0.3)] transition-all duration-500 hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95 group overflow-hidden border-none uppercase tracking-[0.2em]">
                    {/* Background Shine Effect */}
                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] duration-1000 transition-transform" />
                    
                    <span className="relative flex items-center gap-4">
                      Learn More
                      <div className="bg-emerald-500/10 group-hover:bg-white/20 p-1.5 rounded-sm group-hover:translate-x-1 transition-all duration-500">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side: Circular Advanced Image Rotator */}
            <div className="relative hidden lg:block h-[650px] animate-fadeIn">
              {/* Complex Wave Backgrounds (Advanced Modern Look) */}
              <div className="absolute -right-20 -bottom-20 w-[120%] h-[120%] pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-emerald-500 opacity-10 rounded-full blur-[80px]" />
              </div>

              {/* Main Circular Rotator with Advanced Progress Path */}
              <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative group p-6">
                  {/* SVG Circular Progress Path (Very Modern) */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 550 550">
                    <circle
                      cx="275"
                      cy="275"
                      r="260"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="2"
                      fill="none"
                    />
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

                  {/* Outer White Glow/Ring */}
                  <div className="absolute inset-0 rounded-full border-[10px] border-white/5 shadow-[0_0_80px_rgba(16,185,129,0.1)] scale-[1.08]" />
                  
                  {/* Main Circle Container */}
                  <div className="relative w-[480px] h-[480px] rounded-full border-[15px] border-white/10 overflow-hidden shadow-[0_45px_100px_-20px_rgba(0,0,0,0.6)] bg-black/40 backdrop-blur-3xl group">
                    {/* Inner Rotating Background (Modern Gradient) */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-black to-green-950 opacity-40 animate-gradient-shift" />
                    
                    {/* Rotating Image Layer */}
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

                    {/* Progress Dots Overlaid inside Circle */}
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

                  {/* Play/Search Icon badge (Modern) */}
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl flex items-center justify-center animate-pulse cursor-pointer hover:bg-emerald-500 hover:border-emerald-400 transition-all duration-500 group z-50">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-90 transition-transform">
                      <Video className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimalist Controls Section */}
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

        {/* Navigation Arrows (From the image) */}
        {/* Global arrows removed as they are now integrated into the RHS advanced component */}

        {/* Bottom Curve Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
          <svg className="relative block w-[calc(100%+1.3px)] h-[80px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="white"></path>
          </svg>
        </div>
      </section>

      {/* Features - Maintaining compatibility with previous structure while styling for KIPSO */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover-lift group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Quality Content</h3>
              <p className="text-muted-foreground">Expertly curated subjects and materials designed to maximize your learning efficiency.</p>
            </div>

            <div className="p-8 rounded-3xl border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover-lift group">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <Video className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4">Video Lessons</h3>
              <p className="text-muted-foreground">High-quality video content that you can watch at your own pace, on any device.</p>
            </div>

            <div className="p-8 rounded-3xl border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover-lift group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Community Support</h3>
              <p className="text-muted-foreground">Learn together with thousands of students and get support from expert teachers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>© 2026 EduLearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
