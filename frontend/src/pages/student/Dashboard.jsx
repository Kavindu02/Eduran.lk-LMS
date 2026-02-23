import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video as VideoIcon, BookOpen, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

export default function StudentDashboard() {
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
                                name: item.teacherName
                            });
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
                    
                    let filteredData = data;
                    
                    // If "all" is selected, we must ensure we only show videos from teachers the student is REGISTERED with.
                    // This prevents them from seeing videos of other teachers for the same subject if they didn't pay/select them.
                    if (isAllTeachers) {
                        const currentSub = userSubjects.find(s => String(s.id) === String(selectedSubjectId));
                        const registeredTeacherIds = (currentSub?.teachers || []).map(t => String(t.id));
                        
                        // Only show videos if the teacher is in the student's registered list
                        filteredData = data.filter(v => {
                            // If video has no teacherId, it's public (or legacy), so we show it? 
                            // Usually better to be strict: only show if teacherId is assigned and matches.
                            return v.teacherId && registeredTeacherIds.includes(String(v.teacherId));
                        });
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
            <ProtectedLayout requiredRole="student" title="Dashboard">
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-white/60 font-medium tracking-widest uppercase text-[10px]">Loading Dashboard...</p>
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
                                    READY FOR YOUR NEXT LESSON?
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {user?.payment_status === 'paid' ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Active Subscription</span>
                                    </div>
                                ) : (
                                    <div className="bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Payment Pending</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subject Select */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-1">Current Subject</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {userSubjects.map(sub => {
                                const isSelected = String(selectedSubjectId) === String(sub.id);
                                return (
                                    <button
                                        key={sub.id}
                                        onClick={() => handleSubjectChange(sub.id)}
                                        className={`p-4 rounded-2xl border transition-all text-left group ${isSelected ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                    >
                                        <BookOpen className={`w-5 h-5 mb-2 ${isSelected ? 'text-black' : 'text-emerald-500'}`} />
                                        <p className="text-[11px] font-black uppercase leading-tight line-clamp-1">{sub.name}</p>
                                    </button>
                                );
                            })}
                            {userSubjects.length === 0 && (
                                <p className="col-span-full text-white/30 text-[11px] italic p-8 border border-dashed border-white/10 rounded-2xl text-center">
                                    No subjects registered yet.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Teacher Select Dropdown */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-1">Select Professor</label>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <Select 
                                value={String(selectedTeacherId)} 
                                onValueChange={v => setSelectedTeacherId(v)}
                                disabled={!selectedSubjectId}
                            >
                                <SelectTrigger className="h-14 bg-black/40 border-white/10 text-white rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-emerald-500" />
                                        <SelectValue placeholder="All Registered Teachers" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-[#1b4332] border-white/10 text-white font-sans">
                                    <SelectItem value="all">ALL REGISTERED TEACHERS</SelectItem>
                                    {(userSubjects.find(s => String(s.id) === String(selectedSubjectId))?.teachers || []).map(t => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name.toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Videos Display Section */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <VideoIcon className="w-6 h-6 text-emerald-500" />
                            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
                                Learning Materials
                            </h2>
                        </div>
                        {videos.length > 0 && (
                            <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                {videos.length} Lessons Available
                            </span>
                        )}
                    </div>

                    {isRefreshing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : videos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videos.map((video) => (
                                <Card 
                                    key={video.id} 
                                    className="bg-black/40 border-white/5 overflow-hidden group hover:border-emerald-500/50 transition-all duration-500 cursor-pointer rounded-3xl"
                                    onClick={() => navigate(`/student/watch/${video.id}`)}
                                >
                                    <div className="aspect-video bg-[#0a1a12] relative overflow-hidden">
                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-all duration-500 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-emerald-500 text-black rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-all duration-500 shadow-xl shadow-emerald-500/20">
                                                <ArrowRight className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase px-2 py-1 rounded-lg">
                                            {video.duration || '00:00'}
                                        </div>
                                    </div>
                                    <CardHeader className="p-6">
                                        <CardTitle className="text-sm font-black text-white group-hover:text-emerald-500 transition-colors uppercase tracking-tight line-clamp-2">
                                            {video.title}
                                        </CardTitle>
                                        <CardDescription className="text-[11px] text-white/40 line-clamp-2 mt-2 leading-relaxed italic font-serif">
                                            {video.description || 'Access full educational content for this session.'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6 mt-auto">
                                        <Button className="w-full bg-white/5 hover:bg-emerald-500 border border-white/10 hover:border-emerald-400 text-white hover:text-black font-black uppercase tracking-widest text-[9px] h-10 rounded-xl transition-all">
                                            Watch Session
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl py-24 text-center">
                            <VideoIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-white/30 font-bold uppercase tracking-widest text-[11px]">No videos uploaded by this teacher yet.</p>
                            <p className="text-white/10 text-[9px] uppercase mt-1">Check back later for updates</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedLayout>
    );
}
