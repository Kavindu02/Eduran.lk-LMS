import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video as VideoIcon, BookOpen, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const getYoutubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
};

export default function StudentLessons() {
    const { user, updateCurrentUser } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [userSubjects, setUserSubjects] = useState([]); // Grouped: { subjectId, subjectName, teachers: [{id, name}] }
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState('all');
    const [videos, setVideos] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const res = await fetch(`${API_URL}/users/profile?id=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    // Sync the global user state with latest data (batchId, role, etc.)
                    updateCurrentUser(data);
                    
                    // Group subjects by ID
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
                            // Avoid adding duplicate teachers if they somehow appear
                            const teacherExists = grouped[sid].teachers.some(t => String(t.id) === String(item.teacherId));
                            if (!teacherExists) {
                                grouped[sid].teachers.push({
                                    id: item.teacherId,
                                    name: item.teacherName,
                                    paymentStatus: item.paymentStatus
                                });
                            }
                        }
                    });

                    const subjectsList = Object.values(grouped);
                    setUserSubjects(subjectsList);
                    
                    // Default selection
                    if (subjectsList.length > 0 && !selectedSubjectId) {
                        setSelectedSubjectId(subjectsList[0].id);
                        setSelectedTeacherId('all');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user?.id]);

    // Fetch videos when subject or teacher changes
    useEffect(() => {
        const fetchVideos = async () => {
            // Only fetch if a subject is selected
            if (!selectedSubjectId) {
                setVideos([]);
                return;
            }
            
            setIsRefreshing(true);
            try {
                // Determine if we need to filter by a specific teacher or show all registered ones
                const isAllTeachers = !selectedTeacherId || selectedTeacherId === 'all';
                const teacherParam = !isAllTeachers ? `&teacherId=${selectedTeacherId}` : '';
                
                // Fetch videos for this subject, batch and potentially teacher
                const url = `${API_URL}/videos?subjectId=${selectedSubjectId}${teacherParam}&batchId=${user?.batchId || ''}`;
                const res = await fetch(url);
                
                if (res.ok) {
                    const data = await res.json();
                    
                    const currentSub = userSubjects.find(s => String(s.id) === String(selectedSubjectId));
                    const paidTeacherIds = (currentSub?.teachers || [])
                        .filter(t => t.paymentStatus === 'paid')
                        .map(t => String(t.id));
                    
                    let filteredData = [];
                    
                    if (isAllTeachers) {
                        filteredData = data.filter(v => v.teacherId && paidTeacherIds.includes(String(v.teacherId)));
                    } else {
                        // If specific teacher is selected, check if THEY are paid
                        const isSelectedTeacherPaid = (currentSub?.teachers || []).some(t => String(t.id) === String(selectedTeacherId) && t.paymentStatus === 'paid');
                        if (isSelectedTeacherPaid) {
                            filteredData = data;
                        } else {
                            filteredData = []; // No videos if not paid
                        }
                    }
                    
                    setVideos(filteredData);
                }
            } catch (error) {
                console.error('Error fetching videos:', error);
                setVideos([]);
            } finally {
                setIsRefreshing(false);
            }
        };

        fetchVideos();
    }, [selectedSubjectId, selectedTeacherId, user?.batchId, userSubjects]);

    const handleSubjectChange = (sid) => {
        setSelectedSubjectId(sid);
        setSelectedTeacherId('all'); // Reset teacher filter when subject changes
    };

    if (loading) {
        return (
            <ProtectedLayout requiredRole="student" title="Lessons">
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-[10px]">Loading Lessons...</p>
                    </div>
                </div>
            </ProtectedLayout>
        );
    }

    return (
        <ProtectedLayout requiredRole="student" title="My Lessons">
            <div className="space-y-10 animate-fadeIn">
                
                {/* Modern Hero Section */}
                <div className="relative rounded-[2.5rem] overflow-hidden bg-white border border-slate-200 p-8 md:p-12 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-[80px] -ml-32 -mb-32" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                                    <VideoIcon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Course Materials</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                                Your <span className="text-emerald-500">Learning</span> Library
                            </h1>
                            <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-[10px]">
                                Pick a subject and continue where you left off
                            </p>
                        </div>
                        
                        <div className="hidden lg:flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Subjects</p>
                                <p className="text-2xl font-black text-slate-800">{userSubjects.length}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-100" />
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Content</p>
                                <p className="text-2xl font-black text-emerald-500">{videos.length} Videos</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Subject Select - Takes more space on large screens */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Select Subject</label>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userSubjects.length} Registers</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                            {userSubjects.map(sub => {
                                const isSelected = String(selectedSubjectId) === String(sub.id);
                                return (
                                    <button
                                        key={sub.id}
                                        onClick={() => handleSubjectChange(sub.id)}
                                        className={`group relative p-5 rounded-3xl border-2 transition-all duration-300 text-left overflow-hidden ${
                                            isSelected 
                                            ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-500/20 translate-y-[-4px]' 
                                            : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/30'
                                        }`}
                                    >
                                        <BookOpen className={`w-6 h-6 mb-3 transition-colors ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                                        <p className="text-[11px] font-black uppercase leading-tight tracking-tight line-clamp-2">{sub.name}</p>
                                        
                                        {!isSelected && (
                                            <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowRight className="w-4 h-4 text-emerald-500" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                            {userSubjects.length === 0 && (
                                <p className="col-span-full text-slate-400 text-[11px] font-bold uppercase tracking-widest p-12 bg-white border-2 border-dashed border-slate-100 rounded-[2rem] text-center">
                                    No subjects registered yet.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Teacher Select Dropdown */}
                    <div className="lg:col-span-4 space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 px-2">Choose Teacher</label>
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 h-full flex flex-col justify-center">
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-6 text-center leading-relaxed">
                                Filter content by your <br/> preferred <span className="text-emerald-500">Professor</span>
                            </p>
                            <Select 
                                value={String(selectedTeacherId)} 
                                onValueChange={v => setSelectedTeacherId(v)}
                                disabled={!selectedSubjectId}
                            >
                                <SelectTrigger className="h-16 bg-slate-50 border-slate-200 text-slate-800 rounded-2xl font-bold px-6 shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <SelectValue placeholder="All Registered Teachers" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 text-slate-800 font-sans p-2 rounded-2xl shadow-2xl">
                                    <SelectItem value="all" className="rounded-xl font-bold py-3">ALL REGISTERED TEACHERS</SelectItem>
                                    {(userSubjects.find(s => String(s.id) === String(selectedSubjectId))?.teachers || []).map(t => (
                                        <SelectItem key={t.id} value={String(t.id)} className="rounded-xl font-bold py-3 uppercase">
                                            <div className="flex items-center justify-between w-full">
                                                <span>{t.name}</span>
                                                {t.paymentStatus !== 'paid' && (
                                                    <div className="ml-2 bg-red-50 text-red-500 text-[8px] px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                                                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0z" /><path d="M8 11V7a4 4 0 118 0v4M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" /></svg>
                                                        PENDING
                                                    </div>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Videos Display Section */}
                <div className="space-y-8 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                                <VideoIcon className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                                    Available Lessons
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">High Quality Video Content</p>
                            </div>
                        </div>
                        {videos.length > 0 && (
                            <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                {videos.length} Sessions
                            </div>
                        )}
                    </div>

                    {isRefreshing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-72 bg-white border border-slate-100 rounded-[2.5rem] animate-pulse" />
                            ))}
                        </div>
                    ) : videos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {videos.map((video) => {
                                const ytId = getYoutubeId(video.youtubeUrl);
                                const thumbnailUrl = ytId 
                                    ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` 
                                    : null;

                                return (
                                    <div 
                                        key={video.id} 
                                        className="group bg-white border border-slate-100 overflow-hidden rounded-[2.5rem] hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-500 cursor-pointer"
                                        onClick={() => window.open(video.youtubeUrl, '_blank', 'noopener,noreferrer')}
                                    >
                                        <div className="aspect-video bg-slate-900 relative overflow-hidden m-4 rounded-[1.5rem] group-hover:m-2 transition-all duration-500 shadow-lg">
                                            {/* Thumbnail Image */}
                                            {thumbnailUrl ? (
                                                <img 
                                                    src={thumbnailUrl} 
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => {
                                                        // Fallback to hqdefault if maxresdefault doesn't exist
                                                        e.target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-emerald-500/20">
                                                    <VideoIcon className="w-16 h-16" />
                                                </div>
                                            )}

                                            {/* Play Overlay */}
                                            <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/20 transition-all duration-500 flex items-center justify-center z-10">
                                                <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 rotate-[-45deg] group-hover:rotate-0 transition-all duration-500 shadow-xl shadow-emerald-500/40">
                                                    <ArrowRight className="w-7 h-7" />
                                                </div>
                                            </div>

                                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xl text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border border-white/10 z-20">
                                                {video.duration || '00:00'}
                                            </div>
                                        </div>
                                    
                                    <div className="px-8 pb-8 pt-2">
                                        <h3 className="text-base font-black text-slate-800 group-hover:text-emerald-600 transition-colors uppercase tracking-tight line-clamp-2 leading-snug">
                                            {video.title}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-medium line-clamp-2 mt-3 leading-relaxed mb-6">
                                            {video.description || 'Watch the full video session to complete your syllabus lessons for this topic.'}
                                        </p>
                                        
                                        <Button 
                                            className="w-full bg-slate-900 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-[10px] h-12 rounded-2xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/30"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(video.youtubeUrl, '_blank', 'noopener,noreferrer');
                                            }}
                                        >
                                            Start Learning
                                        </Button>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] py-32 text-center shadow-inner relative overflow-hidden group">
                            {/* Check if payment is pending */}
                            {(() => {
                                const currentSub = userSubjects.find(s => String(s.id) === String(selectedSubjectId));
                                const isAllTeachers = !selectedTeacherId || selectedTeacherId === 'all';
                                
                                let isPaymentPending = false;
                                let pendingReason = "";
                                
                                if (selectedSubjectId) {
                                    if (isAllTeachers) {
                                        const hasAnyPaid = (currentSub?.teachers || []).some(t => t.paymentStatus === 'paid');
                                        if (!hasAnyPaid && (currentSub?.teachers || []).length > 0) {
                                            isPaymentPending = true;
                                            pendingReason = "No active subscriptions found for this subject.";
                                        }
                                    } else {
                                        const teacher = (currentSub?.teachers || []).find(t => String(t.id) === String(selectedTeacherId));
                                        if (teacher && teacher.paymentStatus !== 'paid') {
                                            isPaymentPending = true;
                                            pendingReason = `Payment for ${teacher.name.toUpperCase()}'s lessons is currently pending.`;
                                        }
                                    }
                                }

                                if (isPaymentPending) {
                                    return (
                                        <div className="relative z-10 animate-in fade-in zoom-in duration-500">
                                            <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/10 group-hover:scale-110 transition-transform">
                                                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0v4M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-2 italic">ACCESS RESTRICTED</h3>
                                            <p className="text-red-500 font-black uppercase tracking-[0.2em] text-[10px] mb-4">{pendingReason}</p>
                                            <p className="text-slate-400 text-[11px] font-bold uppercase max-w-sm mx-auto leading-relaxed">
                                                Once your payment is verified by the administration, your lessons will appear here automatically.
                                            </p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="relative z-10">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <VideoIcon className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[11px]">No content available</p>
                                        <p className="text-slate-300 text-[10px] font-bold uppercase mt-2 tracking-widest">Select a different teacher or check back later</p>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedLayout>
    );
}
