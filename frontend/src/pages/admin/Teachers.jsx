import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeachersPage() {
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', qualification: '', batchId: '', subjectId: '' });

    // Fetch batches and teachers on mount
    useEffect(() => {
        fetch('/api/batches')
            .then(res => res.json())
            .then(data => setBatches(data));
        
        fetch('/api/teachers')
            .then(res => res.json())
            .then(data => setTeachers(data));
    }, []);

    // Update subjects when batchId changes in the form
    useEffect(() => {
        if (formData.batchId) {
            fetch(`/api/subjects?batchId=${formData.batchId}`)
                .then(res => res.json())
                .then(data => setSubjects(data));
        } else {
            setSubjects([]);
        }
    }, [formData.batchId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.subjectId) {
            alert('Please select a subject');
            return;
        }
        
        const data = { 
            name: formData.name, 
            email: formData.email, 
            qualification: formData.qualification, 
            subjectId: formData.subjectId 
        };

        if (editingTeacher) {
            fetch(`/api/teachers/${editingTeacher.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(() => reloadTeachers());
        } else {
            fetch('/api/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(() => reloadTeachers());
        }
        closeDialog();
    };

    const reloadTeachers = () => {
        fetch('/api/teachers')
            .then(res => res.json())
            .then(data => setTeachers(data));
    };

    const handleEdit = (teacher) => {
        setEditingTeacher(teacher);
        // Find batchId of this teacher's subject if possible
        // For now, reset it so user can choose. 
        // Better: Fetch all subjects to find the matching batchId
        setFormData({ 
            name: teacher.name, 
            email: teacher.email, 
            qualification: teacher.qualification, 
            batchId: '', // Reset batch selection on edit for now
            subjectId: teacher.subjectId 
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this teacher?')) {
            fetch(`/api/teachers/${id}`, { method: 'DELETE' })
                .then(() => reloadTeachers());
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingTeacher(null);
        setFormData({ name: '', email: '', qualification: '', batchId: '', subjectId: '' });
    };

    return (
        <ProtectedLayout requiredRole="admin" title="Manage Teachers">
            <div className="space-y-6">
                <Link to="/admin/dashboard">
                    <Button variant="outline" className="border-border/50 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>

                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-foreground">Teachers</h2>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Teacher
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-border/50">
                            <DialogHeader>
                                <DialogTitle className="text-foreground">{editingTeacher ? 'Edit' : 'Add'} Teacher</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Name</label>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" className="border-border/50" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Email</label>
                                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" className="border-border/50" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Qualification</label>
                                    <Input value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} placeholder="e.g., M.Sc Physics" className="border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Batch</label>
                                    <select 
                                        value={formData.batchId} 
                                        onChange={e => setFormData({ ...formData, batchId: e.target.value, subjectId: '' })} 
                                        className="w-full border border-border/50 rounded-md px-3 py-2 bg-background text-foreground text-sm" 
                                        required
                                    >
                                        <option value="">Choose batch...</option>
                                        {batches.map(batch => (
                                            <option key={batch.id} value={batch.id}>{batch.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Subject</label>
                                    <select 
                                        value={formData.subjectId} 
                                        onChange={e => setFormData({ ...formData, subjectId: e.target.value })} 
                                        className="w-full border border-border/50 rounded-md px-3 py-2 bg-background text-foreground text-sm" 
                                        required
                                        disabled={!formData.batchId}
                                    >
                                        <option value="">Choose subject...</option>
                                        {subjects.map(subject => (
                                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2 justify-end pt-4">
                                    <Button variant="outline" onClick={closeDialog} className="border-border/50">Cancel</Button>
                                    <Button type="submit" className="bg-primary hover:bg-primary/90">{editingTeacher ? 'Update' : 'Add'}</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-4">
                    {teachers.map(teacher => (
                        <Card key={teacher.id} className="border-border/50">
                            <CardHeader>
                                <CardTitle className="text-foreground">{teacher.name}</CardTitle>
                                <CardDescription>{teacher.email}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-foreground/70">{teacher.qualification || 'No qualification'}</p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(teacher)} className="flex-1 border-border/50">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleDelete(teacher.id)} className="flex-1 border-destructive/30 text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {teachers.length === 0 && (
                    <Card className="border-border/50">
                        <CardContent className="py-12 text-center text-foreground/70">
                            No teachers registered.
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProtectedLayout>
    );
}
