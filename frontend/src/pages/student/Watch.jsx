import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProtectedLayout from '@/components/protected-layout';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function WatchVideoPage() {
    const params = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const videoId = params.id;
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await fetch(`${API_URL}/videos/${videoId}`);
                if (res.ok) {
                    const data = await res.json();
                    setVideo(data);
                }
            } catch (error) {
                console.error('Error fetching video:', error);
            } finally {
                setLoading(false);
            }
        };

        if (videoId) fetchVideo();
    }, [videoId]);

    const getYoutubeId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    };

    if (loading) {
        return (
            <ProtectedLayout requiredRole="student">
                <div className="flex items-center justify-center py-20">
                    <p className="text-white/60 uppercase tracking-[0.2em] text-[10px] font-black animate-pulse">Initializing Interface...</p>
                </div>
            </ProtectedLayout>
        );
    }

    if (!video) {
        return (
            <ProtectedLayout requiredRole="student">
                <div className="text-center py-24 space-y-6">
                    <p className="text-white/30 font-bold uppercase tracking-widest text-[11px]">Material Missing or Removed</p>
                    <Button variant="outline" onClick={() => navigate('/student/dashboard')} className="border-white/10 hover:bg-white/5 text-white bg-transparent rounded-xl px-10 h-14 uppercase font-black tracking-widest text-[10px]">
                        <ArrowLeft className="w-4 h-4 mr-3 text-emerald-500" />
                        Return to Command Center
                    </Button>
                </div>
            </ProtectedLayout>
        );
    }

    const embedUrl = `https://www.youtube.com/embed/${getYoutubeId(video.youtubeUrl)}`;

    return (
        <ProtectedLayout requiredRole="student" title={video.title}>
            <div className="space-y-6 md:space-y-10 animate-fadeIn font-sans">
                {/* Back Button */}
                <button 
                  onClick={() => navigate('/student/dashboard')} 
                  className="flex items-center gap-2 text-white/40 hover:text-emerald-500 transition-colors uppercase font-black tracking-[0.3em] text-[8px] md:text-[10px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Back Access
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-10">
                    {/* Video Player */}
                    <div className="lg:col-span-3 space-y-6 md:space-y-8">
                        <div className="rounded-2xl md:rounded-3xl overflow-hidden aspect-video bg-black/40 border border-white/5 shadow-2xl relative">
                            {video.youtubeUrl ? (
                              <iframe 
                                width="100%" height="100%" 
                                src={embedUrl} 
                                title={video.title} 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#0a1a12]">
                                <p className="text-white/20 uppercase font-black tracking-widest text-[10px] md:text-xs">Video Feed Offline</p>
                              </div>
                            )}
                        </div>

                        {/* Video Info */}
                        <div className="bg-black/20 border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-10 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-1 h-6 md:h-8 bg-emerald-500 rounded-full mt-1 md:mt-0" />
                                  <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight">{video.title}</h1>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-2.5 md:px-3 py-1 rounded-lg w-fit">
                                        <Clock className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{video.duration || 'Full Session'}</span>
                                    </div>
                                    <span className="text-white/30 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Recorded: {new Date(video.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-6 md:pt-8">
                                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-3 md:mb-4">Lesson Abstract</h4>
                                <p className="text-white/60 leading-relaxed font-medium italic font-serif text-base md:text-lg">
                                    {video.description || 'Access complete educational support materials through our student portal.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Placeholder / Controls */}
                    <div className="space-y-6">
                        <div className="bg-[#0a1a12] border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6">
                            <h3 className="text-white font-black uppercase tracking-widest text-[10px] md:text-[11px] mb-4 pb-2 border-b border-white/5">Quick Navigation</h3>
                            <div className="space-y-3">
                                <Button 
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[8px] md:text-[9px] rounded-xl h-10 md:h-11"
                                    onClick={() => navigate('/student/lessons')}
                                >
                                    Switch Subject
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    );
}
