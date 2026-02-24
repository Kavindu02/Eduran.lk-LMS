import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, ArrowLeft, Search, Calendar, Hash, FileText, Layers, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function BatchesPage() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);
    const [formData, setFormData] = useState({ year: new Date().getFullYear(), name: '', description: '' });

    useEffect(() => {
        loadBatches();
    }, []);

    const loadBatches = () => {
        setLoading(true);
        fetch('/api/batches')
            .then(res => res.json())
            .then(data => {
                setBatches(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setBatches([]);
                setLoading(false);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const method = editingBatch ? 'PUT' : 'POST';
        const url = editingBatch ? `/api/batches/${editingBatch.id}` : '/api/batches';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(res => {
            if (res.ok) {
                toast.success(editingBatch ? 'Batch updated' : 'Batch created');
                loadBatches();
                closeDialog();
            } else {
                toast.error('Failed to save batch');
            }
        })
        .catch(() => toast.error('Error saving batch'));
    };

    const handleEdit = (batch) => {
        setEditingBatch(batch);
        setFormData({ year: batch.year, name: batch.name, description: batch.description || '' });
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this batch? All subjects and student links for this batch might be affected.')) return;
        
        fetch(`/api/batches/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    toast.success('Batch deleted');
                    loadBatches();
                } else {
                    toast.error('Failed to delete batch');
                }
            })
            .catch(() => toast.error('Error deleting batch'));
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingBatch(null);
        setFormData({ year: new Date().getFullYear(), name: '', description: '' });
    };

    const filteredBatches = batches.filter(b => 
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.year?.toString().includes(searchTerm)
    );

    return (
        <ProtectedLayout requiredRole="admin" title="Batch Management">
            <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Academic Batches</h2>
                        <p className="text-slate-500 text-sm">Organize and manage student groups by academic year.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder="Search batch or year..." 
                                className="pl-10 border-slate-200 focus:ring-emerald-500 h-9 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!open) closeDialog(); else setIsDialogOpen(true); }}>
                            <DialogTrigger asChild>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 h-9 font-bold text-xs uppercase tracking-wider px-4">
                                    <Plus className="w-4 h-4 mr-2" /> New Batch
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] border-slate-200">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black italic uppercase text-slate-900 tracking-tight">
                                        {editingBatch ? 'Edit Batch' : 'Add New Batch'}
                                    </DialogTitle>
                                    <DialogDescription className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                                        Fill in the academic details below
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-emerald-500" /> Academic Year
                                        </label>
                                        <Input 
                                            type="number" 
                                            value={formData.year} 
                                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} 
                                            className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                            <Hash className="w-3 h-3 text-emerald-500" /> Batch Name
                                        </label>
                                        <Input 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                            placeholder="e.g. 2026 A/L Combined Maths" 
                                            className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                            <FileText className="w-3 h-3 text-emerald-500" /> Description
                                        </label>
                                        <Input 
                                            value={formData.description} 
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                                            placeholder="Brief overview of the batch" 
                                            className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                    <DialogFooter className="pt-4 border-t border-slate-50">
                                        <Button variant="ghost" type="button" onClick={closeDialog} className="text-slate-400 hover:text-slate-600">
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 px-8 font-bold">
                                            {editingBatch ? 'Update Batch' : 'Create Batch'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1,2,3].map(i => (
                            <Card key={i} className="border-slate-100 shadow-sm animate-pulse">
                                <CardContent className="h-40 bg-slate-50/50" />
                            </Card>
                        ))
                    ) : filteredBatches.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                                <Layers className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No Batches Found</h3>
                            <p className="text-sm text-slate-500">Try adjusting your search or create a new batch.</p>
                        </div>
                    ) : (
                        filteredBatches.map(batch => (
                            <Card key={batch.id} className="group border-slate-200/60 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 bg-white/50 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="pb-3 relative">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-lg border border-emerald-200 shadow-sm transition-transform group-hover:scale-110">
                                            {batch.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold text-[10px] py-0 h-5">
                                            {batch.year} YEAR
                                        </Badge>
                                    </div>
                                    <div className="pt-3">
                                        <CardTitle className="text-lg text-slate-900 italic font-black uppercase tracking-tight group-hover:text-emerald-700 transition-colors">
                                            {batch.name}
                                        </CardTitle>
                                        <CardDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                            Batch ID: {batch.id}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed min-h-[32px]">
                                        {batch.description || 'No description provided for this batch.'}
                                    </p>
                                    <div className="flex gap-2 pt-2 border-t border-slate-50">
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => handleEdit(batch)} 
                                            className="flex-1 h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold text-[10px] uppercase tracking-tighter gap-1.5"
                                        >
                                            <Edit2 className="w-3 h-3" /> Edit Profile
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => handleDelete(batch.id)} 
                                            className="flex-1 h-8 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase tracking-tighter gap-1.5"
                                        >
                                            <Trash2 className="w-3 h-3" /> Remove
                                        </Button>
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
