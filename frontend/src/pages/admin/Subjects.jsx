import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2, ArrowLeft, BookOpen, Search, Hash, FileText, Layers, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function SubjectsPage() {
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '', description: '', batchId: '' });

    useEffect(() => {
        loadBatches();
    }, []);

    const loadBatches = () => {
        fetch('/api/batches')
            .then(res => res.json())
            .then(data => {
                setBatches(Array.isArray(data) ? data : []);
                if (data.length > 0 && !selectedBatch) setSelectedBatch(data[0].id);
            });
    };

    useEffect(() => {
        if (selectedBatch) {
            loadSubjects();
        } else {
            setSubjects([]);
            setLoading(false);
        }
    }, [selectedBatch]);

    const loadSubjects = () => {
        setLoading(true);
        fetch(`/api/subjects?batchId=${selectedBatch}`)
            .then(res => res.json())
            .then(data => {
                setSubjects(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setSubjects([]);
                setLoading(false);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.batchId) {
            toast.error('Please select a batch');
            return;
        }

        const method = editingSubject ? 'PUT' : 'POST';
        const url = editingSubject ? `/api/subjects/${editingSubject.id}` : '/api/subjects';
        const payload = { ...formData };

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (res.ok) {
                toast.success(editingSubject ? 'Subject updated' : 'Subject created');
                loadSubjects();
                closeDialog();
            } else {
                toast.error('Failed to save subject');
            }
        })
        .catch(() => toast.error('Error saving subject'));
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setFormData({ 
            name: subject.name, 
            code: subject.code || '', 
            description: subject.description || '',
            batchId: subject.batchId
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this subject? All linked videos and teacher assignments will be removed.')) return;
        
        fetch(`/api/subjects/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    toast.success('Subject deleted');
                    loadSubjects();
                } else {
                    toast.error('Failed to delete subject');
                }
            })
            .catch(() => toast.error('Error deleting subject'));
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingSubject(null);
        setFormData({ name: '', code: '', description: '', batchId: '' });
    };

    const filteredSubjects = subjects.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedLayout requiredRole="admin" title="Subject Management">
            <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Academic Subjects</h2>
                        <p className="text-slate-500 text-sm">Manage curriculum subjects for each academic batch.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder="Search subject or code..." 
                                className="pl-10 border-slate-200 focus:ring-emerald-500 h-9 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!open) closeDialog(); else setIsDialogOpen(true); }}>
                            <DialogTrigger asChild>
                                <Button 
                                    className="bg-emerald-600 hover:bg-emerald-700 h-9 font-bold text-xs uppercase tracking-wider px-4"
                                    onClick={() => {
                                        if (!isDialogOpen) {
                                            setFormData({ ...formData, batchId: selectedBatch });
                                        }
                                    }}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> New Subject
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] border-slate-200">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black italic uppercase text-slate-900 tracking-tight">
                                        {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                                    </DialogTitle>
                                    <DialogDescription className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest text-wrap">
                                        Configure subject details and assign to an academic batch.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                            <Layers className="w-3 h-3 text-emerald-500" /> Academic Batch
                                        </label>
                                        <Select 
                                            value={formData.batchId} 
                                            onValueChange={(val) => setFormData({ ...formData, batchId: val })}
                                        >
                                            <SelectTrigger className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 font-bold text-slate-700">
                                                <SelectValue placeholder="Select Batch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {batches.map(b => (
                                                    <SelectItem key={b.id} value={b.id} className="font-medium text-slate-700">{b.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                            <Tag className="w-3 h-3 text-emerald-500" /> Subject Name
                                        </label>
                                        <Input 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                            placeholder="e.g. Combined Mathematics" 
                                            className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                            <Hash className="w-3 h-3 text-emerald-500" /> Subject Code
                                        </label>
                                        <Input 
                                            value={formData.code} 
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })} 
                                            placeholder="e.g. CM-2026" 
                                            className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                            <FileText className="w-3 h-3 text-emerald-500" /> Description
                                        </label>
                                        <Input 
                                            value={formData.description} 
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                                            placeholder="Brief overview of the subject" 
                                            className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                    <DialogFooter className="pt-4 border-t border-slate-50">
                                        <Button variant="ghost" type="button" onClick={closeDialog} className="text-slate-400 hover:text-slate-600">
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 px-8 font-bold">
                                            {editingSubject ? 'Update Subject' : 'Create Subject'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card className="border-slate-200 shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Filtered by Batch</h3>
                        </div>
                        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                            <SelectTrigger className="w-64 h-9 border-slate-200 bg-white text-emerald-700 font-bold">
                                <SelectValue placeholder="Select Batch" />
                            </SelectTrigger>
                            <SelectContent>
                                {batches.map(b => (
                                    <SelectItem key={b.id} value={b.id} className="font-medium">{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {loading ? (
                                [1,2,3].map(i => <div key={i} className="h-32 bg-slate-50 rounded-xl animate-pulse" />)
                            ) : filteredSubjects.length === 0 ? (
                                <div className="col-span-full py-12 text-center">
                                    <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400 font-medium italic">No subjects found for this selection.</p>
                                </div>
                            ) : (
                                filteredSubjects.map(subject => (
                                    <div key={subject.id} className="group p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(subject)} className="h-7 w-7 text-emerald-600 hover:bg-emerald-50">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(subject.id)} className="h-7 w-7 text-red-500 hover:bg-red-50">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800 uppercase italic tracking-tight">{subject.name}</h4>
                                                <Badge variant="outline" className="text-[9px] font-black h-4 mt-1 bg-slate-50 text-slate-400 border-slate-100">
                                                    {subject.code || 'NO CODE'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium mt-3 leading-relaxed line-clamp-2">
                                            {subject.description || 'No description provided for this subject.'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedLayout>
    );
}
