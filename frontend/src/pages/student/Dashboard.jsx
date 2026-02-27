import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { useAuth } from '@/lib/auth-context';
import { 
    Video as VideoIcon, 
    BookOpen, 
    User, 
    Phone, 
    MapPin, 
    School, 
    Calendar, 
    Info, 
    Mail, 
    UserCircle, 
    CreditCard,
    Zap,
    Trophy,
    Target,
    ChevronRight,
    ArrowUpRight,
    ShieldCheck,
    Layers,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function StudentDashboard() {
    const { user, updateCurrentUser } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [userSubjects, setUserSubjects] = useState([]); // Grouped: { subjectId, subjectName, teachers: [{id, name}] }

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) {
                return;
            }
            try {
                const res = await fetch(`${API_URL}/users/profile?id=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    updateCurrentUser(data);
                    
                    const grouped = {};
                    (data.selectedSubjects || []).forEach(item => {
                        const sid = item.subjectId;
                        if (!grouped[sid]) {
                            grouped[sid] = {
                                id: sid,
                                name: item.subjectName,
                                batchName: item.batchName,
                                teachers: []
                            };
                        }
                        if (item.teacherId) {
                            grouped[sid].teachers.push({
                                id: item.teacherId,
                                name: item.teacherName,
                                paymentStatus: item.paymentStatus
                            });
                        } else {
                            // Track general status for subject (without teacher)
                            grouped[sid].generalPaymentStatus = item.paymentStatus;
                        }
                    });

                    const subjectsList = Object.values(grouped);
                    setUserSubjects(subjectsList);
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user?.id]);

    if (loading) {
        return (
            <ProtectedLayout requiredRole="student" title="Dashboard">
                <div className="flex items-center justify-center py-20 min-h-[60vh]">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full" />
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-slate-500 font-bold tracking-[0.3em] uppercase text-[10px] animate-pulse">Initializing Dashboard</p>
                    </div>
                </div>
            </ProtectedLayout>
        );
    }

    const totalTeachers = userSubjects.reduce((acc, sub) => acc + sub.teachers.length, 0);
    const paidSubjects = userSubjects.filter(sub => sub.teachers.some(t => t.paymentStatus === 'paid')).length;

    return (
        <ProtectedLayout requiredRole="student" title="Student Dashboard">
            <div className="space-y-8 pb-10 animate-in fade-in duration-700">
                
                {/* Modern Hero Section */}
                <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-950 border border-white/5 shadow-2xl">
                    {/* Animated Background Gradients */}
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />
                    
                    <div className="relative z-10 p-6 md:p-10">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="max-w-2xl">
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[0.9] mb-4">
                                    Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Master</span> your studies?
                                </h1>
                                <p className="text-slate-400 text-base md:text-lg font-medium max-w-lg leading-relaxed">
                                    Welcome back, {user?.name?.split(' ')[0]}. You have {paidSubjects} active learning paths waiting for you today.
                                </p>
                            </div>
                            
                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                                <div className="bg-white/5 border border-white/10 backdrop-blur-md p-4 md:p-6 rounded-[2rem] flex flex-col justify-center items-center text-center group hover:border-emerald-500/50 transition-colors">
                                    <div className="bg-emerald-500/20 p-2.5 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
                                        <BookOpen className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <span className="text-2xl font-black text-white">{userSubjects.length}</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Subjects</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 backdrop-blur-md p-4 md:p-6 rounded-[2rem] flex flex-col justify-center items-center text-center group hover:border-blue-500/50 transition-colors">
                                    <div className="bg-blue-500/20 p-2.5 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
                                        <Trophy className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <span className="text-2xl font-black text-white">{paidSubjects}</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="flex flex-col gap-10">
                    
                    {/* Full Width Profile Section */}
                    <div id="profile-section">
                        {/* Enhanced Profile Card */}
                        <div className="group relative bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 transition-all hover:shadow-emerald-500/5">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-[100px] -mr-40 -mt-40 opacity-50 group-hover:opacity-100 transition-all duration-700" />
                            
                            <div className="p-8 md:p-14 relative z-10">
                                <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start md:items-center">
                                    {/* Avatar/Initial Circle */}
                                    <div className="relative shrink-0">
                                        <div className="w-28 h-28 md:w-40 md:h-40 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] rotate-3 flex items-center justify-center shadow-2xl shadow-emerald-500/20 transition-transform group-hover:rotate-6">
                                            <span className="text-5xl md:text-6xl font-black text-white -rotate-3">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                                        </div>
                                        <div className="absolute -bottom-3 -right-3 bg-slate-900 border-4 border-white p-3 rounded-2xl shadow-lg">
                                            <Target className="w-5 h-5 text-emerald-400" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-4 mb-3">
                                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{user?.firstName} {user?.lastName}</h2>
                                            <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 tracking-[0.2em]">
                                                Verified Student
                                            </span>
                                        </div>
                                        <p className="text-slate-500 font-bold text-xl md:text-2xl flex items-center gap-3">
                                            <School className="w-6 h-6 text-emerald-500" />
                                            {user?.school || 'Not Enrolled in School'}
                                        </p>
                                        
                                        <div className="mt-10 flex flex-wrap gap-8 text-slate-400">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-emerald-50 p-2 rounded-xl">
                                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <span className="text-sm md:text-base font-bold uppercase tracking-tight text-slate-700 underline decoration-emerald-500/30 decoration-[3px] underline-offset-8">G.C.E A/L {user?.alYear || 'N/A'} Exam</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 p-2 rounded-xl">
                                                    <MapPin className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <span className="text-sm md:text-base font-bold uppercase tracking-tight text-slate-700 underline decoration-blue-500/30 decoration-[3px] underline-offset-8">{user?.district || 'No District'} District</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-slate-100 pt-16">
                                    <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-colors">
                                        <div className="bg-white shadow-md p-3 rounded-2xl">
                                            <Mail className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Official Email</p>
                                            <p className="text-slate-950 font-black text-sm break-all">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-colors">
                                        <div className="bg-white shadow-md p-3 rounded-2xl">
                                            <CreditCard className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Identification (NIC)</p>
                                            <p className="text-slate-950 font-black text-sm">{user?.nic || '---'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-colors">
                                        <div className="bg-white shadow-md p-3 rounded-2xl">
                                            <Phone className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Contact Line</p>
                                            <p className="text-slate-950 font-black text-sm">{user?.phoneNumber1}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-colors">
                                        <div className="bg-white shadow-md p-3 rounded-2xl">
                                            <MapPin className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Primary Location</p>
                                            <p className="text-slate-950 font-black text-sm line-clamp-1">{user?.homeAddress || '---'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Learning Path - Now prominently below the profile */}
                    <div className="space-y-8">
                        <div className="bg-slate-950 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] p-8 md:p-14 border border-white/5 relative overflow-hidden group">
                            {/* Sophisticated Background Effects */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.1),transparent)]" />
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                            
                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">Your Learning Path</h3>
                                        </div>
                                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs max-w-xl">
                                            Track your enrolled subjects and manage your academic progress in one place.
                                        </p>
                                    </div>
                                    
                                    <Link to="/student/lessons">
                                        <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl px-8 py-4 font-black uppercase tracking-[0.1em] text-xs shadow-2xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 group/go">
                                            Enter Classrooms
                                            <ChevronRight className="w-4 h-4 group-hover/go:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                </div>
                                
                                {userSubjects.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
                                        <div className="w-24 h-24 bg-slate-900 border border-white/10 rounded-[2.5rem] flex items-center justify-center text-slate-600 mb-6 shadow-2xl relative">
                                            <Layers className="w-12 h-12 opacity-50" />
                                            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                                        </div>
                                        <p className="text-white text-xl font-black uppercase tracking-widest mb-2">No active enrollments</p>
                                        <p className="text-slate-500 font-medium max-w-xs mx-auto">Visit our course catalog to select your subjects and start learning.</p>
                                    </div>
                                ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {userSubjects.map((sub, idx) => (
                                            <div key={sub.id} className="relative group/item bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-emerald-500/30 rounded-3xl p-5 transition-all duration-500">
                                                <div className="flex items-start justify-between mb-5">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-emerald-500/60 text-[8px] font-black uppercase tracking-widest">Active</span>
                                                        </div>
                                                        <h4 className="text-xl font-black text-white tracking-tight leading-none uppercase group-hover/item:text-emerald-400 transition-colors">{sub.name}</h4>
                                                        {sub.batchName && (
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 group-hover/item:text-slate-400 transition-colors">{sub.batchName}</p>
                                                        )}
                                                    </div>
                                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-xs text-slate-500 border border-white/10 group-hover/item:border-emerald-500/20 transition-colors">
                                                        0{idx + 1}
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    {sub.generalPaymentStatus === 'paid' && sub.teachers.length === 0 && (
                                                        <div className="flex items-center gap-3 p-3 rounded-2xl border bg-emerald-500/5 border-emerald-500/20">
                                                            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                                                                <Check className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <span className="text-[11px] font-black uppercase text-white">Full Access Granted</span>
                                                                <div className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 w-fit mt-1">
                                                                    Unlocked
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {sub.teachers.map(t => {
                                                        const isPaid = t.paymentStatus === 'paid' || sub.generalPaymentStatus === 'paid';
                                                        return (
                                                            <div 
                                                                key={t.id} 
                                                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                                                                    isPaid
                                                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                                                    : 'bg-black/20 border-white/5 opacity-50 hover:opacity-100'
                                                                }`}
                                                            >
                                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-xl transition-all ${
                                                                    isPaid 
                                                                    ? 'bg-emerald-500 text-slate-950 scale-100 group-hover/item:scale-105' 
                                                                    : 'bg-slate-800 text-slate-500'
                                                                }`}>
                                                                    <User className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <span className={`text-[11px] font-black uppercase tracking-tight block truncate ${isPaid ? 'text-white' : 'text-slate-500'}`}>{t.name}</span>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${
                                                                            isPaid 
                                                                            ? 'bg-emerald-500/20 text-emerald-400' 
                                                                            : 'bg-slate-800 text-slate-700'
                                                                        }`}>
                                                                            {isPaid ? 'Unlocked' : 'Locked'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {isPaid && (
                                                                    <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                                                                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    );
}
