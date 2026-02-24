import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { useAuth } from '@/lib/auth-context';
import { Video as VideoIcon, BookOpen, User, Phone, MapPin, School, Calendar, Info, Mail, UserCircle, CreditCard } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function StudentDashboard() {
    const { user, updateCurrentUser } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [userSubjects, setUserSubjects] = useState([]); // Grouped: { subjectId, subjectName, teachers: [{id, name}] }

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) {
                // Keep loading true but don't try to fetch yet
                return;
            }
            try {
                const res = await fetch(`${API_URL}/users/profile?id=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    // Sync the global user state with latest data (batchId, role, etc.)
                    updateCurrentUser(data);
                    
                    // Group subjects by ID because user might have multiple teachers for one subject
                    const grouped = {};
                    (data.selectedSubjects || []).forEach(item => {
                        const sid = item.subjectId;
                        if (!grouped[sid]) {
                            grouped[sid] = {
                                id: sid,
                                name: item.subjectName,
                                teachers: []
                            };
                        }
                        if (item.teacherId) {
                            grouped[sid].teachers.push({
                                id: item.teacherId,
                                name: item.teacherName,
                                paymentStatus: item.paymentStatus // Included from backend
                            });
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
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-[10px]">Loading Dashboard...</p>
                    </div>
                </div>
            </ProtectedLayout>
        );
    }

    return (
        <ProtectedLayout requiredRole="student" title="Student Dashboard">
            <div className="space-y-8 animate-fadeIn">
                
                {/* Modern Hero Section */}
                <div className="relative rounded-3xl overflow-hidden bg-[#0a1a12] border border-white/5 p-8 md:p-12 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-[80px] -ml-32 -mb-32" />
                    
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                                    Hello, <span className="text-emerald-500">{user?.name?.split(' ')[0]}!</span>
                                </h1>
                                <p className="text-white/50 mt-3 font-medium uppercase tracking-[0.2em] text-[10px]">
                                    WELCOME TO YOUR LEARNING HUB
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {userSubjects.some(s => s.teachers.some(t => t.paymentStatus === 'paid')) ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Active Lessons Available</span>
                                    </div>
                                ) : (
                                    <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Payment Verification Required</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="bg-emerald-50 border-b border-slate-100 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-500 p-1.5 rounded-lg shadow-sm">
                                        <UserCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-base font-black text-slate-800 uppercase tracking-[0.2em]">Student Profile</h2>
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-100/50 px-3 py-1 rounded-full border border-emerald-200">
                                    Official Records
                                </span>
                            </div>
                            
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                                {/* Personal Info */}
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                                            <Info className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1.5">Full Name</p>
                                            <p className="text-black text-lg font-bold tracking-tight">{user?.firstName} {user?.lastName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                                            <Mail className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1.5">Email Address</p>
                                            <p className="text-black text-lg font-bold tracking-tight">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                                            <CreditCard className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1.5">NIC Number</p>
                                            <p className="text-black text-lg font-bold tracking-tight">{user?.nic || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                                            <Phone className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1.5">Contact Numbers</p>
                                            <div className="space-y-1">
                                                <p className="text-black text-lg font-bold tracking-tight">{user?.phoneNumber1}</p>
                                                {user?.phoneNumber2 && (
                                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{user?.phoneNumber2} (Secondary)</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Academic & Location */}
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                                            <School className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1.5">School / Institute</p>
                                            <p className="text-black text-lg font-bold tracking-tight uppercase leading-tight">{user?.school || 'Not Provided'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                                            <Calendar className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1.5">A/L Examination Year</p>
                                            <p className="text-black text-lg font-bold tracking-tight">{user?.alYear ? `${user.alYear} Examination` : 'Not Provided'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                                            <MapPin className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1.5">Official Address</p>
                                            <div className="space-y-1">
                                                <p className="text-black text-lg font-bold tracking-tight leading-snug">{user?.homeAddress || 'Not Provided'}</p>
                                                {user?.district && (
                                                    <p className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md inline-block tracking-[0.2em] mt-2 shadow-sm">
                                                        {user?.district} District
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats or Additional Info */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 p-8 rounded-3xl h-full flex flex-col justify-center shadow-xl">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                                <BookOpen className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">My Learning Path</h3>
                            <p className="text-slate-500 text-[11px] leading-relaxed mb-6 font-medium italic uppercase tracking-wider">
                                You are currently registered for <span className="text-emerald-600 font-black">{userSubjects.length} subjects</span> across various categories.
                            </p>
                            <div className="space-y-4">
                                {userSubjects.map(sub => (
                                    <div key={sub.id} className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-700 tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                                            {sub.name}
                                        </div>
                                        <div className="ml-3.5 flex flex-wrap gap-1.5 mt-1">
                                            {sub.teachers.map(t => (
                                                <span 
                                                    key={t.id} 
                                                    className={`text-[9px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1.5 uppercase transition-all ${
                                                        t.paymentStatus === 'paid'
                                                        ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                                                        : 'text-slate-400 bg-slate-50 border-slate-100 grayscale opacity-60'
                                                    }`}
                                                >
                                                    <User className="w-2.5 h-2.5" />
                                                    {t.name}
                                                    {t.paymentStatus === 'paid' ? (
                                                        <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                                    ) : (
                                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    );
}
