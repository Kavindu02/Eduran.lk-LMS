import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProtectedLayout from '@/components/protected-layout';
import { useAuth } from '@/lib/auth-context';
import { getAllVideos, getSubjectById } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock } from 'lucide-react';
export default function WatchVideoPage() {
    const params = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const videoId = params.id;
    const [video, setVideo] = useState(null);
    const [subject, setSubject] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!user?.batchId)
            return;
        const allVideos = getAllVideos();
        const foundVideo = allVideos.find(v => v.id === videoId && v.batchId === user.batchId);
        if (foundVideo) {
            setVideo(foundVideo);
            const subjectData = getSubjectById(foundVideo.subjectId);
            setSubject(subjectData);
            const relatedVids = allVideos.filter(v => v.subjectId === foundVideo.subjectId && v.batchId === user.batchId && v.id !== videoId);
            setRelatedVideos(relatedVids);
        }
        setLoading(false);
    }, [videoId, user?.batchId]);
    if (loading) {
        return (<ProtectedLayout requiredRole="student">
        <div className="flex items-center justify-center py-12">
          <p className="text-foreground/70">Loading...</p>
        </div>
      </ProtectedLayout>);
    }
    if (!video) {
        return (<ProtectedLayout requiredRole="student">
        <div className="text-center py-12 space-y-4">
          <p className="text-foreground/70">Video not found</p>
          <Button variant="outline" onClick={() => navigate('/student/dashboard')} className="border-border/50">
            <ArrowLeft className="w-4 h-4 mr-2"/>
            Back to Dashboard
          </Button>
        </div>
      </ProtectedLayout>);
    }
    return (<ProtectedLayout requiredRole="student" title={video.title}>
      <div className="space-y-8">
        {/* Back Button */}
        <Button variant="outline" onClick={() => navigate('/student/dashboard')} className="border-border/50">
          <ArrowLeft className="w-4 h-4 mr-2"/>
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center">
              <iframe width="100%" height="100%" src={video.youtubeUrl} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>

            {/* Video Info */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="text-2xl text-foreground">{video.title}</CardTitle>
                  <CardDescription className="text-base">{subject?.name}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-foreground/70">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4"/>
                    <span>Duration: {video.duration}</span>
                  </div>
                </div>

                <div className="border-t border-border/30 pt-4">
                  <h4 className="font-semibold text-foreground mb-2">About this video</h4>
                  <p className="text-foreground/70 leading-relaxed">{video.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Related Videos Sidebar */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-4">More from {subject?.name}</h3>
              {relatedVideos.length > 0 ? (<div className="space-y-3">
                  {relatedVideos.map(relatedVideo => (<Card key={relatedVideo.id} className="border-border/50 overflow-hidden cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/student/watch/${relatedVideo.id}`)}>
                      <div className="aspect-video bg-muted flex items-center justify-center relative">
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">{relatedVideo.duration}</span>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium text-foreground line-clamp-2">{relatedVideo.title}</p>
                      </CardContent>
                    </Card>))}
                </div>) : (<Card className="border-border/50">
                  <CardContent className="py-6 text-center text-sm text-foreground/70">
                    No related videos
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>);
}
