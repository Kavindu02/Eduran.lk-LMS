import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
    Plus, 
    Trash2, 
    Edit2, 
    ArrowLeft, 
    Layers, 
    BookOpen, 
    User, 
    PlayCircle, 
    Search, 
    Type, 
    Youtube, 
    Clock, 
    ExternalLink,
    Filter,
    Calendar,
    Award
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function VideosPage() {
    const [videos, setVideos] = useState([]);
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [selectedBatchId, setSelectedBatchId] = useState('all');
    const [selectedTeacherId, setSelectedTeacherId] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        youtubeUrl: '',
        subjectId: '',
        batchId: '',
        teacherId: '',
        duration: '',
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [batchesRes, teachersRes, videosRes] = await Promise.all([
                fetch('/api/batches'),
                fetch('/api/teachers'),
                fetch('/api/videos')
            ]);
            const batchesData = await batchesRes.json();
            const teachersData = await teachersRes.json();
            const videosData = await videosRes.json();
            setBatches(Array.isArray(batchesData) ? batchesData : []);
            setTeachers(Array.isArray(teachersData) ? teachersData : []);
            setVideos(Array.isArray(videosData) ? videosData : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    const loadVideos = () => {
        fetch('/api/videos')
            .then(res => res.json())
            .then(data => setVideos(Array.isArray(data) ? data : []))
            .catch(() => toast.error('Error fetching video content'));
    };

    // Update subjects when batchId changes in the form
    useEffect(() => {
        if (formData.batchId) {
            fetch(`/api/subjects?batchId=${formData.batchId}`)
                .then(res => res.json())
                .then(data => setSubjects(Array.isArray(data) ? data : []));
        } else {
            setSubjects([]);
        }
    }, [formData.batchId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.batchId || !formData.subjectId) {
            toast.error('Batch and Subject are mandatory');
            return;
        }

        const method = editingVideo ? 'PUT' : 'POST';
        const url = editingVideo ? `/api/videos/${editingVideo.id}` : '/api/videos';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingVideo ? 'Video lesson updated' : 'New video session published');
                loadVideos();
                closeDialog();
            } else {
                toast.error('Failed to save video record');
            }
        } catch (error) {
            toast.error('Network error while saving video');
        }
    };

    const handleEdit = (video) => {
        setEditingVideo(video);
        setFormData({
            title: video.title,
            description: video.description || '',
            youtubeUrl: video.youtubeUrl,
            subjectId: video.subjectId,
            batchId: video.batchId,
            teacherId: video.teacherId || '',
            duration: video.duration || '',
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you certain you want to remove this video permanently?')) return;
        try {
            const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Video lesson archived');
                loadVideos();
            } else {
                toast.error('Removal failed');
            }
        } catch (error) {
            toast.error('Network error during archival');
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingVideo(null);
        setFormData({ title: '', description: '', youtubeUrl: '', subjectId: '', batchId: '', teacherId: '', duration: '' });
    };

    const filteredVideos = videos.filter(v => {
        const matchesBatch = selectedBatchId === 'all' || v.batchId === selectedBatchId;
        const matchesTeacher = selectedTeacherId === 'all' || v.teacherId === String(selectedTeacherId);
        const matchesSearch = v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.subjectName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesBatch && matchesTeacher && matchesSearch;
    });

    const getThumbnail = (url) => {
        if (!url) return null;
        const match = url.match(/(?:embed\/|v=|vi\/|youtu\.be\/|\/v\/|shorts\/)([^#?&]*)/);
        return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
    };

    return (
        <ProtectedLayout requiredRole="admin" title="Video Management">
            <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Video Lessons</h2>
                        <p className="text-slate-500 text-sm">Manage academic video resources and live session recordings.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder="Search videos..." 
                                className="pl-10 border-slate-200 focus:ring-emerald-500 h-9 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!open) closeDialog(); else setIsDialogOpen(true); }}>
                            <DialogTrigger asChild>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 h-9 font-bold text-xs uppercase tracking-wider px-4">
                                    <Plus className="w-4 h-4 mr-2" /> New Video
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[550px] border-slate-200">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black italic uppercase text-slate-900 tracking-tight">
                                        {editingVideo ? 'Edit Video Session' : 'Add New Video'}
                                    </DialogTitle>
                                    <DialogDescription className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                                        Fill in the video details below
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                                <Layers className="w-3 h-3 text-emerald-500" /> Target Batch
                                            </label>
                                            <select 
                                                value={formData.batchId} 
                                                onChange={(e) => setFormData({ ...formData, batchId: e.target.value, subjectId: '' })} 
                                                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                required
                                            >
                                                <option value="">Select Batch Profile</option>
                                                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                                <BookOpen className="w-3 h-3 text-emerald-500" /> Academic Module
                                            </label>
                                            <select 
                                                value={formData.subjectId} 
                                                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} 
                                                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50"
                                                required 
                                                disabled={!formData.batchId}
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                            <User className="w-3 h-3 text-emerald-500" /> Assigned Lecturers
                                        </label>
                                        <select 
                                            value={formData.teacherId} 
                                            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })} 
                                            className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50"
                                            required 
                                            disabled={!formData.subjectId}
                                        >
                                            <option value="">Select Teacher</option>
                                            {teachers
                                                .filter(t => t.subjectId === formData.subjectId)
                                                .map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                                            }
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                            <Type className="w-3 h-3 text-emerald-500" /> Lecture Title
                                        </label>
                                        <Input 
                                            value={formData.title} 
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                                            placeholder="e.g. Newton's Laws of Motion - Part 01" 
                                            className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 font-bold"
                                            required 
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                            <Youtube className="w-3 h-3 text-emerald-500" /> YouTube Endpoint URL
                                        </label>
                                        <Input 
                                            value={formData.youtubeUrl} 
                                            onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })} 
                                            placeholder="https://www.youtube.com/watch?v=..." 
                                            className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                            required 
                                        />
                                    </div>

                                    <div className="space-y-1 pt-2">
                                        <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-wider">
                                            <span className="text-emerald-500">Notice:</span> Thumbnail will be generated automatically based on the YouTube ID.
                                        </p>
                                    </div>

                                    <DialogFooter className="pt-4 border-t border-slate-50">
                                        <Button variant="ghost" type="button" onClick={closeDialog} className="text-slate-400 hover:text-slate-600">
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 px-8 font-bold">
                                            {editingVideo ? 'Update Video' : 'Create Video'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="bg-white border border-slate-200 px-3 py-1 rounded-md flex items-center gap-2 h-9 w-full md:w-64 shadow-sm">
                        <Filter className="w-3.5 h-3.5 text-emerald-600" />
                        <select 
                            value={selectedBatchId} 
                            onChange={(e) => {
                                setSelectedBatchId(e.target.value);
                                setSelectedTeacherId('all'); // Reset teacher filter when batch changes
                            }}
                            className="bg-transparent text-sm font-bold text-slate-700 w-full outline-none"
                        >
                            <option value="all">All Batches</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className="bg-white border border-slate-200 px-3 py-1 rounded-md flex items-center gap-2 h-9 w-full md:w-64 shadow-sm">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <select 
                            value={selectedTeacherId} 
                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-700 w-full outline-none"
                        >
                            <option value="all">All Faculty</option>
                            {teachers
                                .filter(t => selectedBatchId === 'all' || t.batchId === selectedBatchId)
                                .map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.subjectName})</option>
                                ))
                            }
                        </select>
                    </div>

                    <Badge variant="outline" className="h-9 px-4 rounded-md bg-white border-slate-200 text-emerald-800 text-xs font-black uppercase hidden lg:flex items-center gap-2 shadow-sm ml-auto">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {videos.length} Lectures Total
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="h-72 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />)
                    ) : filteredVideos.length === 0 ? (
                        <div className="col-span-full py-24 text-center bg-white/50 backdrop-blur-sm rounded-xl border border-dashed border-slate-200">
                             <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PlayCircle className="w-10 h-10 text-emerald-200" />
                             </div>
                             <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">No sessions indexed</h3>
                             <p className="text-slate-500 max-w-xs mx-auto text-sm mt-2">Adjust your filters or synchronize with the video hosting repository.</p>
                             <Button variant="ghost" className="mt-4 text-emerald-600 font-bold" onClick={() => { setSearchTerm(''); setSelectedBatchId('all'); setSelectedTeacherId('all'); }}>Reset Filter Registry</Button>
                        </div>
                    ) : (
                        filteredVideos.map(video => (
                            <Card key={video.id} className="group border-slate-200/60 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 bg-white overflow-hidden flex flex-col">
                                <div className="relative aspect-video">
                                    <img 
                                        src={getThumbnail(video.youtubeUrl) || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"} 
                                        alt={video.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-4">
                                        <div className="flex justify-between items-center w-full">
                                            <Badge className="bg-emerald-600 text-white border-none font-black text-[9px] px-2 py-0.5 tracking-widest">
                                                {video.duration || '--:--'} MIN
                                            </Badge>
                                            <a 
                                                href={video.youtubeUrl} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-emerald-500 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 left-2 flex gap-1">
                                         <Badge variant="outline" className="bg-white/90 text-slate-900 border-none font-black text-[8px] py-0 h-4">
                                            UID: {video.id.split('_')[1]?.substring(0, 4) || 'VOD'}
                                        </Badge>
                                    </div>
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[8px] font-black tracking-tighter h-4">
                                            {video.batchName || 'GLOBAL'}
                                        </Badge>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 text-[8px] font-black tracking-tighter h-4 uppercase">
                                            {video.subjectName || 'GENERAL'}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-md font-black uppercase italic tracking-tighter text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1 leading-tight">
                                        {video.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                                    <p className="text-[11px] text-slate-500 font-medium mb-4 line-clamp-2 leading-tight">
                                        {video.description || 'System academic resource categorized under departmental repository.'}
                                    </p>
                                    
                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                                            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                                                {video.teacherName?.charAt(0) || 'L'}
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">Lecturer: <span className="text-slate-700">{video.teacherName || 'Academy Specialist'}</span></span>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => handleEdit(video)} 
                                                className="flex-1 h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold text-[10px] uppercase tracking-tighter gap-1.5"
                                            >
                                                <Edit2 className="w-3 h-3" /> Update Video
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => handleDelete(video.id)} 
                                                className="flex-1 h-8 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase tracking-tighter gap-1.5"
                                            >
                                                <Trash2 className="w-3 h-3" /> remove
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </ProtectedLayout>
    );
}
