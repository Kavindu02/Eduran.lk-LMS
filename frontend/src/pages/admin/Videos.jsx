import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { getAllVideos, createVideo, updateVideo, deleteVideo, getSubjectsByBatch, getAllBatches } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function VideosPage() {
    const [videos, setVideos] = useState([]);
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        youtubeUrl: '',
        subjectId: '',
        batchId: '',
        duration: '',
    });

    useEffect(() => {
        fetch('/api/batches')
            .then(res => res.json())
            .then(data => setBatches(data));
        loadVideos();
    }, []);

    useEffect(() => {
        if (selectedBatch) {
            fetch(`/api/subjects?batchId=${selectedBatch}`)
                .then(res => res.json())
                .then(data => setSubjects(data));
        } else {
            setSubjects([]);
        }
    }, [selectedBatch]);

    const loadVideos = () => {
        fetch('/api/videos')
            .then(res => res.json())
            .then(data => setVideos(data));
    };

    const handleBatchChange = (batchId) => {
        setSelectedBatch(batchId);
        setFormData({ ...formData, batchId, subjectId: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.batchId || !formData.subjectId) {
            alert('Please select batch and subject');
            return;
        }
        if (editingVideo) {
            fetch(`/api/videos/${editingVideo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(() => loadVideos());
        } else {
            fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(() => loadVideos());
        }
        closeDialog();
    };

    const handleEdit = (video) => {
        setEditingVideo(video);
        setSelectedBatch(video.batchId);
        setFormData({
            title: video.title,
            description: video.description,
            youtubeUrl: video.youtubeUrl,
            subjectId: video.subjectId,
            batchId: video.batchId,
            duration: video.duration,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this video?')) {
            fetch(`/api/videos/${id}`, { method: 'DELETE' })
                .then(() => loadVideos());
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingVideo(null);
        setSelectedBatch('');
        setFormData({ title: '', description: '', youtubeUrl: '', subjectId: '', batchId: '', duration: '' });
    };

    const filteredVideos = selectedBatch ? videos.filter(v => v.batchId === selectedBatch) : videos;
    return (<ProtectedLayout requiredRole="admin" title="Manage Videos">
      <div className="space-y-6">
        <Link to="/admin/dashboard">
          <Button variant="outline" className="border-border/50 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2"/>
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Video Lessons</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2"/>
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border/50 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {editingVideo ? 'Edit Video' : 'Upload Video'}
                </DialogTitle>
                <DialogDescription>
                  Add or edit a video lesson
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Select Batch</label>
                    <select value={selectedBatch} onChange={(e) => handleBatchChange(e.target.value)} className="w-full border border-border/50 rounded-md px-3 py-2 bg-background text-foreground text-sm" required>
                      <option value="">Choose batch...</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Select Subject</label>
                    <select value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} className="w-full border border-border/50 rounded-md px-3 py-2 bg-background text-foreground text-sm" required disabled={!selectedBatch}>
                      <option value="">Choose subject...</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Video Title</label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Algebra Basics" className="border-border/50" required/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Video description" className="border-border/50"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">YouTube URL</label>
                    <Input value={formData.youtubeUrl} onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })} placeholder="https://www.youtube.com/embed/..." className="border-border/50" required/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Duration</label>
                    <Input value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g., 12:45" className="border-border/50"/>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={closeDialog} className="border-border/50">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingVideo ? 'Update' : 'Add'} Video
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-foreground">Filter by Batch:</label>
          <select value={selectedBatch} onChange={(e) => handleBatchChange(e.target.value)} className="w-full md:w-64 border border-border/50 rounded-md px-3 py-2 bg-background text-foreground text-sm mt-1">
            <option value="">All Batches</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVideos.map(video => (<Card key={video.id} className="border-border/50">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-xs text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">{video.duration}</div>
              </div>
              <CardHeader>
                <CardTitle className="text-foreground">{video.title}</CardTitle>
                <CardDescription className="line-clamp-2">{video.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(video)} className="flex-1 border-border/50">
                    <Edit2 className="w-4 h-4"/>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(video.id)} className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4"/>
                  </Button>
                </div>
              </CardContent>
            </Card>))}
        </div>

        {filteredVideos.length === 0 && (<Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <p className="text-foreground/70">No videos available</p>
            </CardContent>
          </Card>)}
      </div>
    </ProtectedLayout>);
}
