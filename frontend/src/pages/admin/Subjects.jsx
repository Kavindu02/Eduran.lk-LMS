import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { getAllBatches, getSubjectsByBatch, createSubject, updateSubject, deleteSubject } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, ArrowLeft, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function SubjectsPage() {
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '', description: '', batchId: '' });

    useEffect(() => {
        fetch('/api/batches')
            .then(res => res.json())
            .then(data => {
                console.log('Batches from backend:', data); // Debug log
                setBatches(data);
                if (data.length > 0) setSelectedBatch(data[0].id);
            });
    }, []);

    useEffect(() => {
        if (selectedBatch) {
            fetch(`/api/subjects?batchId=${selectedBatch}`)
                .then(res => res.json())
                .then(data => {
                    console.log('Subjects from backend:', data); // Debug log
                    setSubjects(data);
                });
        } else {
            setSubjects([]);
        }
    }, [selectedBatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedBatch) {
            alert('Please select a batch');
            return;
        }
        const data = { ...formData, batchId: selectedBatch };
        if (editingSubject) {
            fetch(`/api/subjects/${editingSubject.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(() => reloadSubjects());
        } else {
            fetch('/api/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(() => reloadSubjects());
        }
        closeDialog();
    };

    const reloadSubjects = () => {
        fetch(`/api/subjects?batchId=${selectedBatch}`)
            .then(res => res.json())
            .then(data => setSubjects(data));
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setFormData({ name: subject.name, code: subject.code, description: subject.description, batchId: subject.batchId });
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this subject?')) {
            fetch(`/api/subjects/${id}`, { method: 'DELETE' })
                .then(() => reloadSubjects());
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingSubject(null);
        setFormData({ name: '', code: '', description: '', batchId: '' });
    };

    return (
        <ProtectedLayout requiredRole="admin" title="Manage Subjects">
            <div className="space-y-6">
                <Link to="/admin/dashboard">
                    <Button variant="outline" className="border-border/50 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Subjects</h2>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="w-4 h-4 mr-2" />
                                New Subject
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-border/50">
                            <DialogHeader>
                                <DialogTitle className="text-foreground">{editingSubject ? 'Edit' : 'Add'} Subject</DialogTitle>
                                <DialogDescription id="subject-dialog-desc">
                                    {editingSubject ? 'Update subject details' : 'Add a new subject to the batch'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="subject-dialog-desc">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Subject Name</label>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Mathematics" className="border-border/50" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Subject Code</label>
                                    <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., MATH-101" className="border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Description</label>
                                    <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Subject description" className="border-border/50" />
                                </div>
                                <div className="flex gap-2 justify-end pt-4">
                                    <Button variant="outline" onClick={closeDialog} className="border-border/50">Cancel</Button>
                                    <Button type="submit" className="bg-primary hover:bg-primary/90">{editingSubject ? 'Update' : 'Add'}</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="mb-4">
                    <label className="text-sm font-medium text-foreground">Select Batch:</label>
                    <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full md:w-64 border border-border/50 rounded-md px-3 py-2 bg-background text-foreground text-sm mt-1">
                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>

                <div className="space-y-4">
                    {subjects.map(subject => (
                        <Card key={subject.id} className="border-border/50">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-foreground">{subject.name}</CardTitle>
                                        <CardDescription>{subject.code}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-foreground/70">{subject.description}</p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(subject)} className="flex-1 border-border/50">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleDelete(subject.id)} className="flex-1 border-destructive/30 text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {subjects.length === 0 && (
                    <Card className="border-border/50">
                        <CardContent className="py-12 text-center text-foreground/70">
                            No subjects for this batch
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProtectedLayout>
    );
}
