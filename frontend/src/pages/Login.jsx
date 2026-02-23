import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { AlertCircle, ChevronRight, GraduationCap, Lock, Mail } from 'lucide-react';
import { HydrationWrapper } from '@/components/hydration-wrapper';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            user.role?.toLowerCase() === 'admin' ? navigate('/admin/dashboard') : navigate('/student/dashboard');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const result = await login(email, password);
            if (result.success) {
                // Determine redirect based on role
                const currentUser = JSON.parse(localStorage.getItem('lms_current_user'));
                if (currentUser) {
                    if (currentUser.role?.toLowerCase() === 'admin') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/student/dashboard');
                    }
                }
            } else {
                setError(result.message || 'Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#06120c] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            
            {/* --- Background Elements --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/color.png')" }}
                >
                    <div className="absolute inset-0 bg-[#0a261a]/90 backdrop-blur-sm" />
                </div>
                
                {/* Background Tiled Logos */}
                <div className="absolute inset-0 opacity-10">
                    <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-8 p-5 rotate-12 scale-150">
                        {Array.from({ length: 120 }).map((_, i) => (
                            <img 
                                key={i}
                                src="/logo.png" 
                                alt="" 
                                className="w-12 h-auto grayscale invert opacity-50" 
                            />
                        ))}
                    </div>
                </div>
                
                {/* Floating Math/Edu Symbols */}
                <div className="absolute inset-0 opacity-5">
                    <div className="grid grid-cols-8 gap-10 p-10 rotate-12 scale-150">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} className="text-white text-3xl font-serif">
                                {['+', '∑', '?', '!', '{', '}', '×'][i % 7]}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decorative Blurs */}
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px]" />
            </div>

            <HydrationWrapper className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10 animate-fadeIn text-center">
                    <h2 className="text-white text-4xl md:text-5xl font-black tracking-tighter uppercase leading-tight">
                        Welcome <span className="text-emerald-500">Back</span>
                    </h2>
                    <p className="text-white/60 font-serif italic text-lg mt-2 underline decoration-emerald-500/30 underline-offset-4">
                        are you ready to continue?
                    </p>
                </div>

                {/* Login Card - Glassmorphism Look */}
                <Card className="bg-black/40 backdrop-blur-2xl border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-scaleIn">
                    <CardContent className="pt-8 px-8 pb-10">
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex gap-3 items-center animate-shake">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <p className="text-xs font-bold text-red-200 uppercase tracking-wider">{error}</p>
                                </div>
                            )}

                            {/* Email Input */}
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-emerald-500 transition-colors" />
                                    <Input 
                                        type="email" 
                                        placeholder="STUDENT@EDURA.COM" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-14 bg-white/5 border-white/10 pl-12 text-white placeholder:text-white/20 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all rounded-xl"
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 ml-1">Secret Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-emerald-500 transition-colors" />
                                    <Input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-14 bg-white/5 border-white/10 pl-12 text-white placeholder:text-white/20 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all rounded-xl"
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Sign In Button */}
                            <Button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full h-14 bg-white hover:bg-emerald-500 text-black hover:text-white font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 rounded-xl shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] group overflow-hidden relative"
                            >
                                <div className="absolute -inset-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] duration-1000 transition-transform" />
                                <span className="relative flex items-center justify-center gap-2">
                                    {loading ? 'Authenticating...' : 'Enter Dashboard'}
                                    {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                </span>
                            </Button>
                        </form>

                        <div className="mt-8 flex flex-col items-center gap-4 text-center">
                            <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">
                                New here?{' '}
                                <Link to="/register" className="text-emerald-500 hover:text-emerald-400 transition-colors underline underline-offset-4">
                                    Create Account
                                </Link>
                            </p>
                            <Link to="/" className="text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-[0.3em]">
                                ← Back to home
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </HydrationWrapper>
        </div>
    );
}