import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
    Plus, 
    Trash2, 
    Edit2, 
    ArrowLeft, 
    Search, 
    User, 
    Mail, 
    GraduationCap, 
    BookOpen, 
    Users,
    MoreVertical,
    CheckCircle2,
    Briefcase,
    Layers,
    ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function TeachersPage() {
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        qualification: '', 
        batchId: '', 
        subjectId: '' 
    });

    // Fetch batches and teachers on mount
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [batchesRes, teachersRes] = await Promise.all([
                fetch('/api/batches'),
                fetch('/api/teachers')
            ]);
            const batchesData = await batchesRes.json();
            const teachersData = await teachersRes.json();
            setBatches(Array.isArray(batchesData) ? batchesData : []);
            setTeachers(Array.isArray(teachersData) ? teachersData : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load instructor data');
        } finally {
            setLoading(false);
        }
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
        if (!formData.subjectId) {
            toast.error('Please select a subject');
            return;
        }
        
        const payload = { 
            name: formData.name, 
            email: formData.email, 
            qualification: formData.qualification, 
            subjectId: formData.subjectId 
        };

        try {
            const url = editingTeacher ? `/api/teachers/${editingTeacher.id}` : '/api/teachers';
            const method = editingTeacher ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(`Teacher ${editingTeacher ? 'updated' : 'registered'} successfully`);
                fetchInitialData();
                closeDialog();
            } else {
                toast.error('Operation failed');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const handleEdit = (teacher) => {
        setEditingTeacher(teacher);
        setFormData({ 
            name: teacher.name, 
            email: teacher.email, 
            qualification: teacher.qualification, 
            batchId: teacher.batchId || '', 
            subjectId: teacher.subjectId 
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to revoke access? This action is permanent.')) return;
        try {
            const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Access revoked');
                fetchInitialData();
            } else {
                toast.error('Failed to revoke access');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingTeacher(null);
        setFormData({ name: '', email: '', qualification: '', batchId: '', subjectId: '' });
    };

    const filteredTeachers = teachers.filter(t => 
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedLayout requiredRole="admin" title="Teacher Management">
            <div className="space-y-6 animate-fadeIn">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Academic Staff</h2>
                        <p className="text-slate-500 text-sm">Manage faculty assignments and professional profiles.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                placeholder="Search instructors..." 
                                className="w-full pl-10 h-9 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none pr-3"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!open) closeDialog(); else setIsDialogOpen(true); }}>
                            <DialogTrigger asChild>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 h-9 font-bold text-xs uppercase tracking-wider px-4">
                                    <Plus className="w-4 h-4 mr-2" /> Hire Teacher
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] border-slate-200">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black italic uppercase text-slate-900 tracking-tight">
                                        {editingTeacher ? 'Edit Instructor' : 'Add New Instructor'}
                                    </DialogTitle>
                                    <DialogDescription className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                                        Professional credentials & subject mapping
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                            <User className="w-3 h-3 text-emerald-500" /> Full Name
                                        </label>
                                        <Input 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                            placeholder="e.g. Dr. John Doe" 
                                            className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                            <Mail className="w-3 h-3 text-emerald-500" /> Professional Email
                                        </label>
                                        <Input 
                                            type="email" 
                                            value={formData.email} 
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                            placeholder="johnsmith@academy.com" 
                                            className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                            <GraduationCap className="w-3 h-3 text-emerald-500" /> Qualification
                                        </label>
                                        <Input 
                                            value={formData.qualification} 
                                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} 
                                            placeholder="e.g. M.Sc. Physics" 
                                            className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                                <Users className="w-3 h-3 text-emerald-500" /> Batch
                                            </label>
                                            <select 
                                                value={formData.batchId} 
                                                onChange={e => setFormData({ ...formData, batchId: e.target.value, subjectId: '' })} 
                                                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                required
                                            >
                                                <option value="">Select Batch</option>
                                                {batches.map(batch => (
                                                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                                <BookOpen className="w-3 h-3 text-emerald-500" /> Subject
                                            </label>
                                            <select 
                                                value={formData.subjectId} 
                                                onChange={e => setFormData({ ...formData, subjectId: e.target.value })} 
                                                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50"
                                                required
                                                disabled={!formData.batchId}
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map(subject => (
                                                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <DialogFooter className="pt-4 border-t border-slate-50">
                                        <Button variant="ghost" type="button" onClick={closeDialog} className="text-slate-400 hover:text-slate-600">
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 px-8 font-bold">
                                            {editingTeacher ? 'Update Profile' : 'Confirm Hiring'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Teachers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1,2,3].map(i => (
                            <div key={i} className="h-64 bg-slate-50/50 rounded-xl border border-slate-100 animate-pulse" />
                        ))
                    ) : filteredTeachers.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white/50 backdrop-blur-sm rounded-xl border border-dashed border-slate-200">
                            <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900">No Instructors Registered</h3>
                            <p className="text-sm text-slate-500">Start building your faculty roster by clicking 'Hire Teacher'.</p>
                        </div>
                    ) : (
                        filteredTeachers.map(teacher => (
                            <Card key={teacher.id} className="group border-slate-200/60 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 bg-white/50 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="pb-3 relative">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-lg border border-emerald-200 shadow-sm transition-transform group-hover:scale-110">
                                            {teacher.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold text-[10px] py-0 h-5">
                                            ACTIVE STAFF
                                        </Badge>
                                    </div>
                                    <div className="pt-3">
                                        <CardTitle className="text-lg text-slate-900 italic font-black uppercase tracking-tight group-hover:text-emerald-700 transition-colors">
                                            {teacher.name}
                                        </CardTitle>
                                        <CardDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                            {teacher.email}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                            <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                                            <span>{teacher.qualification || "Credentials Pending"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 border-none text-[9px] font-black px-2 py-0">
                                                {teacher.batchName && `${teacher.batchName} - `}{teacher.subjectName || "Unassigned"}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 pt-2 border-t border-slate-50">
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => handleEdit(teacher)} 
                                            className="flex-1 h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold text-[10px] uppercase tracking-tighter gap-1.5"
                                        >
                                            <Edit2 className="w-3 h-3" /> Edit Profile
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => handleDelete(teacher.id)} 
                                            className="flex-1 h-8 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase tracking-tighter gap-1.5"
                                        >
                                            <Trash2 className="w-3 h-3" /> Revoke
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
