import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { getAllBatches, createBatch, updateBatch, deleteBatch, getSubjectsByBatch } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function BatchesPage() {
    const [batches, setBatches] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);
    const [formData, setFormData] = useState({ year: new Date().getFullYear(), name: '', description: '' });

    useEffect(() => {
        loadBatches();
    }, []);

    const loadBatches = () => {
        fetch('/api/batches')
            .then(res => res.json())
            .then(data => setBatches(data))
            .catch(() => setBatches([]));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBatch) {
            fetch(`/api/batches/${editingBatch.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(() => loadBatches());
        } else {
            fetch('/api/batches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(() => loadBatches());
        }
        setIsDialogOpen(false);
        setEditingBatch(null);
        setFormData({ year: new Date().getFullYear(), name: '', description: '' });
    };

    const handleEdit = (batch) => {
        setEditingBatch(batch);
        setFormData({ year: batch.year, name: batch.name, description: batch.description });
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this batch?')) {
            fetch(`/api/batches/${id}`, { method: 'DELETE' })
                .then(() => loadBatches());
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingBatch(null);
        setFormData({ year: new Date().getFullYear(), name: '', description: '' });
    };

    return (
        <ProtectedLayout requiredRole="admin" title="Manage Batches">
            <div className="space-y-6">
                <Link to="/admin/dashboard">
                    <Button variant="outline" className="border-border/50 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>

                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-foreground">Academic Batches</h2>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="w-4 h-4 mr-2" />
                                New Batch
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-border/50">
                            <DialogHeader>
                                <DialogTitle className="text-foreground">
                                    {editingBatch ? 'Edit Batch' : 'Create New Batch'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingBatch ? 'Update batch details' : 'Add a new academic batch'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Batch Year</label>
                                    <Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} className="border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Batch Name</label>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Class 10 - 2024" className="border-border/50" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Description</label>
                                    <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Batch description" className="border-border/50" />
                                </div>
                                <div className="flex gap-2 justify-end pt-4">
                                    <Button variant="outline" onClick={closeDialog} className="border-border/50">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                                        {editingBatch ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batches.map(batch => (
                        <Card key={batch.id} className="border-border/50">
                            <CardHeader>
                                <CardTitle className="text-foreground text-lg">{batch.name}</CardTitle>
                                <CardDescription>Year: {batch.year}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-foreground/70">{batch.description || 'No description'}</p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(batch)} className="flex-1 border-border/50">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleDelete(batch.id)} className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {batches.length === 0 && (
                    <Card className="border-border/50">
                        <CardContent className="py-12 text-center">
                            <p className="text-foreground/70 mb-4">No batches created yet</p>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-primary hover:bg-primary/90">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create First Batch
                                    </Button>
                                </DialogTrigger>
                            </Dialog>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProtectedLayout>
    );
}
