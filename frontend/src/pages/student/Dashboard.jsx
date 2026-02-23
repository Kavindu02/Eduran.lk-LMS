import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { useAuth } from '@/lib/auth-context';
import { getVideosByBatch, getSubjectsByBatch, getAllBatches } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export default function StudentDashboard() {
    const { user, updateCurrentUser } = useAuth();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [videos, setVideos] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Refresh User Data from API on mount
        const refreshUser = async () => {
            try {
                // We'll need a profile endpoint that uses the current user's session
                // For now, we'll fetch by the user's ID
                const res = await fetch(`/api/users/profile?id=${user.id}`);
                if (res.ok) {
                    const latestUser = await res.json();
                    updateCurrentUser(latestUser);
                }
            } catch (error) {
                console.error('Failed to refresh user data');
            }
        };
        
        if (user?.id) refreshUser();
    }, [user?.id]);

    useEffect(() => {
        if (!user?.batchId)
            return;
        const batchData = getAllBatches().find(b => b.id === user.batchId);
        setBatch(batchData || null);
        const batchSubjects = getSubjectsByBatch(user.batchId);
        setSubjects(batchSubjects);
        
        // Normalize selected subjects to IDs
        const selected = (user.selectedSubjects || []).map(s => typeof s === 'object' ? s.subjectId : s);
        setSelectedSubjects(selected);
        
        if (selected.length > 0) {
            const batchVideos = getVideosByBatch(user.batchId);
            const filteredVideos = batchVideos.filter(v => selected.includes(v.subjectId));
            setVideos(filteredVideos);
        }
        setLoading(false);
    }, [user]);
    const toggleSubject = (subjectId) => {
        const updated = selectedSubjects.includes(subjectId)
            ? selectedSubjects.filter(s => s !== subjectId)
            : [...selectedSubjects, subjectId];
        setSelectedSubjects(updated);
        updateCurrentUser({ selectedSubjects: updated });
        if (user?.batchId) {
            const batchVideos = getVideosByBatch(user.batchId);
            const filteredVideos = batchVideos.filter(v => updated.includes(v.subjectId));
            setVideos(filteredVideos);
        }
    };
    if (loading) {
        return (<ProtectedLayout requiredRole="student" title="Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full animate-spin"/>
            <p className="text-foreground/70">Loading your learning dashboard...</p>
          </div>
        </div>
      </ProtectedLayout>);
    }
    return (<ProtectedLayout requiredRole="student" title="Learning Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-green-gradient opacity-90"/>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_60%)]"/>
          <div className="relative p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 text-balance">
              Welcome back, <span className="text-white/90">{user?.name}!</span> 👋
              {user?.payment_status === 'paid' ? (
                <span className="ml-3 inline-flex items-center px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 text-xs font-black uppercase tracking-widest rounded-full backdrop-blur-sm">
                  ✓ Paid Account
                </span>
              ) : (
                <span className="ml-3 inline-flex items-center px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-100 text-xs font-black uppercase tracking-widest rounded-full backdrop-blur-sm animate-pulse">
                  Unpaid
                </span>
              )}
            </h2>
            <p className="text-lg text-white/80">
              {batch && <span className="font-semibold text-white/90">{batch.name}</span>}
              {batch && videos.length > 0 && ' • '}
              {videos.length > 0 && <span>{videos.length} video{videos.length !== 1 ? 's' : ''} ready to learn</span>}
              {videos.length === 0 && 'Select subjects to get started'}
            </p>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-primary"/>
            <h3 className="text-2xl font-bold text-foreground">Select Your Subjects</h3>
          </div>

          {subjects.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject, idx) => (<Card key={subject.id} className={`cursor-pointer border-border/50 transition-smooth hover-lift ${selectedSubjects.includes(subject.id)
                    ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/30'
                    : 'hover:border-primary/30'}`} onClick={() => toggleSubject(subject.id)}>
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">{subject.name}</CardTitle>
                    <CardDescription className="font-mono">{subject.code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/70 mb-4 leading-relaxed">{subject.description}</p>
                    <Button size="sm" variant={selectedSubjects.includes(subject.id) ? 'default' : 'outline'} className={`w-full transition-smooth ${selectedSubjects.includes(subject.id) ? 'bg-primary hover:bg-primary/90' : 'hover:bg-muted'}`} onClick={(e) => {
                    e.stopPropagation();
                    toggleSubject(subject.id);
                }}>
                      {selectedSubjects.includes(subject.id) ? '✓ Selected' : 'Select Subject'}
                    </Button>
                  </CardContent>
                </Card>))}
            </div>) : (<Card className="border-border/50 animate-slideInUp">
              <CardContent className="py-12 text-center">
                <p className="text-foreground/70">No subjects available for your batch</p>
              </CardContent>
            </Card>)}
        </div>

        {/* Videos Section */}
        {selectedSubjects.length > 0 && (<div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <Video className="w-6 h-6 text-primary"/>
              <h3 className="text-2xl font-bold text-foreground">Your Learning Materials</h3>
              {videos.length > 0 && (<span className="ml-auto bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {videos.length} video{videos.length !== 1 ? 's' : ''}
                </span>)}
            </div>

            {videos.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, idx) => (<Card key={video.id} className="border-border/50 overflow-hidden hover-lift transition-smooth cursor-pointer group" onClick={() => navigate(`/student/watch/${video.id}`)}>
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-smooth flex items-center justify-center">
                        <div className="w-14 h-14 bg-primary/30 rounded-full flex items-center justify-center group-hover:bg-primary/50 transition-smooth">
                          <Video className="w-7 h-7 text-primary-foreground"/>
                        </div>
                      </div>
                      <span className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs px-2.5 py-1 rounded-full font-medium">
                        {video.duration}
                      </span>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground line-clamp-2 group-hover:text-primary transition-smooth">{video.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-primary hover:bg-primary/90 transition-smooth group-hover:shadow-lg" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student/watch/${video.id}`);
                    }}>
                        Watch Video
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/>
                      </Button>
                    </CardContent>
                  </Card>))}
              </div>) : (<Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <div className="space-y-3">
                    <p className="text-lg text-foreground/70">No videos available yet</p>
                    <p className="text-sm text-foreground/50">Check back soon for new content</p>
                  </div>
                </CardContent>
              </Card>)}
          </div>)}

        {selectedSubjects.length === 0 && (<Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <div className="space-y-3">
                <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto"/>
                <p className="text-lg text-foreground/70">Select subjects to get started</p>
                <p className="text-sm text-foreground/50">Choose at least one subject to see your personalized learning materials</p>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </ProtectedLayout>);
}
