import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Users, Eye, Edit2, Search, UserCheck, Calendar, BookOpen, GraduationCap, MapPin, School, Phone, CreditCard, Trash2, Plus, Save, X, ChevronLeft, ShieldCheck, UserPlus, Filter, Download, Mail, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function StudentsPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    
    // For editing
    const [editData, setEditData] = useState({});
    const [allBatches, setAllBatches] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]);

    // Add Subject Selection State
    const [isAddingSubject, setIsAddingSubject] = useState(false);
    const [newSubBatch, setNewSubBatch] = useState('');
    const [newSubId, setNewSubId] = useState('');
    const [newTeacherId, setNewTeacherId] = useState('');

    useEffect(() => {
        loadStudents();
        loadMetadata();
    }, []);

    const loadMetadata = async () => {
        try {
            const [bRes, sRes, tRes] = await Promise.all([
                fetch('/api/batches'),
                fetch('/api/subjects'),
                fetch('/api/teachers')
            ]);
            setAllBatches(await bRes.json());
            setAllSubjects(await sRes.json());
            setAllTeachers(await tRes.json());
        } catch (err) {
            console.error('Failed to load metadata:', err);
        }
    };

    const loadStudents = () => {
        setLoading(true);
        fetch('/api/users/students')
            .then(res => res.json())
            .then(data => {
                const refreshedStudents = Array.isArray(data) ? data : [];
                setStudents(refreshedStudents);
                
                // Keep selected student updated if dialog is open
                if (selectedStudent) {
                    const updated = refreshedStudents.find(s => s.id === selectedStudent.id);
                    if (updated) setSelectedStudent(updated);
                }
                
                setLoading(false);
            })
            .catch(() => {
                setStudents([]);
                setLoading(false);
            });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this student? This will remove all their records and payment history.')) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Student deleted successfully');
                loadStudents();
            } else {
                toast.error('Failed to delete student');
            }
        } catch (err) {
            toast.error('Error deleting student');
        }
    };

    const handleUpdate = async () => {
        try {
            const res = await fetch(`/api/users/${selectedStudent.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            if (res.ok) {
                toast.success('Student updated successfully');
                setIsEditDialogOpen(false);
                loadStudents();
            } else {
                toast.error('Failed to update student');
            }
        } catch (err) {
            toast.error('Error updating student');
        }
    };

    const handleAddSubject = async (subjectId, teacherId = null) => {
        try {
            const res = await fetch('/api/users/add-subject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedStudent.id, subjectId, teacherId })
            });
            if (res.ok) {
                toast.success('Subject added/updated');
                loadStudents(); // Refresh to update subjects list
            } else {
                toast.error('Failed to add subject');
            }
        } catch (err) {
            toast.error('Error adding subject');
        }
    };

    const handleRemoveSubject = async (subjectId, teacherId = null) => {
        try {
            const res = await fetch('/api/users/remove-subject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedStudent.id, subjectId, teacherId })
            });
            if (res.ok) {
                toast.success('Subject removed');
                loadStudents();
            } else {
                toast.error('Failed to remove subject');
            }
        } catch (err) {
            toast.error('Error removing subject');
        }
    };

    const openEdit = (student) => {
        setSelectedStudent(student);
        setEditData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            name: student.name || '',
            email: student.email || '',
            phoneNumber1: student.phoneNumber1 || '',
            phoneNumber2: student.phoneNumber2 || '',
            nic: student.nic || '',
            school: student.school || '',
            alYear: student.alYear || '',
            homeAddress: student.homeAddress || '',
            gender: student.gender || '',
            district: student.district || '',
            batchId: student.batchId || ''
        });
        setIsEditDialogOpen(true);
    };

    const filteredStudents = students.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nic?.includes(searchTerm)
    );

    return (
        <ProtectedLayout requiredRole="admin" title="Student Management">
            <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Student Registry</h2>
                        <p className="text-slate-500 text-sm">Manage student profiles and enrollments.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder="Search students..." 
                                className="pl-10 border-slate-200 focus:ring-emerald-500 h-9 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-100">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-800 py-4 px-6">Identity Reference</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-800 py-4 px-6">Contact Vector</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-800 py-4 px-6">Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-800 py-4 px-6 text-right">Settings</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Records...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="w-8 h-8 text-slate-200" />
                                            <p className="text-sm font-bold text-slate-400 uppercase italic">No students indexed</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student) => (
                                    <TableRow key={student.id} className="group hover:bg-slate-50 border-slate-50 transition-colors duration-200">
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shadow-sm group-hover:bg-emerald-600 transition-colors">
                                                    {(student.firstName || student.name || 'S').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="font-black text-slate-900 uppercase italic tracking-tight text-sm">
                                                        {student.firstName || student.name} {student.lastName || ''}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        ID: {student.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4 px-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                                    <Phone className="w-3 h-3 text-emerald-500" />
                                                    {student.phoneNumber1 || 'NO LINE'}
                                                </div>
                                                <div className="text-[10px] font-medium text-slate-400 lowercase italic">
                                                    {student.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <Badge className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full ${student.status === 'suspended' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                {student.status || 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => openEdit(student)}
                                                    className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>

                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => handleDelete(student.id)}
                                                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>


            {/* Edit Student Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-slate-200">
                    <DialogHeader className="border-b border-slate-100 pb-4">
                        <DialogTitle className="text-xl font-black italic uppercase text-slate-900 tracking-tight">
                            Edit Student Profile
                        </DialogTitle>
                        <DialogDescription className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                            Update academic and contact information
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                        {/* Column 1: Core Fields */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                        <User className="w-3 h-3 text-emerald-500" /> First Name
                                    </label>
                                    <Input 
                                        className="h-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        value={editData.firstName}
                                        onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                        <User className="w-3 h-3 text-emerald-500" /> Last Name
                                    </label>
                                    <Input 
                                        className="h-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        value={editData.lastName}
                                        onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-emerald-500" /> Primary Contact
                                    </label>
                                    <Input 
                                        className="h-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        value={editData.phoneNumber1}
                                        onChange={(e) => setEditData({...editData, phoneNumber1: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                        <Users className="w-3 h-3 text-emerald-500" /> Current Batch
                                    </label>
                                    <Select 
                                        value={editData.batchId} 
                                        onValueChange={(val) => setEditData({...editData, batchId: val})}
                                    >
                                        <SelectTrigger className="h-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20">
                                            <SelectValue placeholder="Select Batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allBatches.map(b => (
                                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-emerald-500" /> Email Endpoint
                                </label>
                                <Input 
                                    className="h-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                    value={editData.email}
                                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-emerald-500" /> Residency Address
                                </label>
                                <Input 
                                    className="h-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                    value={editData.homeAddress}
                                    onChange={(e) => setEditData({...editData, homeAddress: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                    <CreditCard className="w-3 h-3 text-emerald-500" /> NIC Identifier
                                </label>
                                <Input 
                                    className="h-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                    value={editData.nic}
                                    onChange={(e) => setEditData({...editData, nic: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Column 2: Academic & Subjects */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-emerald-500" /> A/L Year
                                    </label>
                                    <Input 
                                        type="number"
                                        className="h-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        value={editData.alYear}
                                        onChange={(e) => setEditData({...editData, alYear: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                        <BookOpen className="w-3 h-3 text-emerald-500" /> School
                                    </label>
                                    <Input 
                                        className="h-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        value={editData.school}
                                        onChange={(e) => setEditData({...editData, school: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Subjects Section */}
                            <div className="space-y-4 pt-24 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-emerald-600" /> Academic Enrolments
                                    </h4>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className={`h-7 w-7 rounded-full transition-all duration-300 ${isAddingSubject ? 'rotate-45 bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}
                                        onClick={() => setIsAddingSubject(!isAddingSubject)}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {isAddingSubject && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2">
                                        <div className="grid grid-cols-1 gap-3">
                                            <Select value={newSubBatch} onValueChange={(val) => { setNewSubBatch(val); setNewSubId(''); setNewTeacherId(''); }}>
                                                <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                                                    <SelectValue placeholder="Select Batch Reference" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allBatches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>

                                            <Select value={newSubId} disabled={!newSubBatch} onValueChange={(val) => { setNewSubId(val); setNewTeacherId(''); }}>
                                                <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                                                    <SelectValue placeholder="Select Subject Entity" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allSubjects.filter(s => s.batchId === newSubBatch).map(s => (
                                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Select value={newTeacherId} disabled={!newSubId} onValueChange={setNewTeacherId}>
                                                <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                                                    <SelectValue placeholder="Assign Faculty Specialist" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allTeachers.filter(t => t.subjectId === newSubId).map(t => (
                                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button 
                                            className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/10"
                                            onClick={() => {
                                                handleAddSubject(newSubId, newTeacherId);
                                                setIsAddingSubject(false);
                                                setNewSubBatch('');
                                                setNewSubId('');
                                                setNewTeacherId('');
                                            }}
                                        >
                                            Confirm Enrollment
                                        </Button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {Object.values(selectedStudent?.selectedSubjects?.reduce((acc, sub) => {
                                        const key = `${sub.subjectId}-${sub.subjectName}`;
                                        if (!acc[key]) {
                                            acc[key] = { subjectName: sub.subjectName, enrollments: [] };
                                        }
                                        acc[key].enrollments.push(sub);
                                        return acc;
                                    }, {}) || {}).map((group, gIdx) => (
                                        <div key={gIdx} className="bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                            <div className="bg-slate-100/50 px-3 py-1.5 border-b border-slate-100 flex items-center gap-2">
                                                <BookOpen className="w-3 h-3 text-slate-400" />
                                                <div className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{group.subjectName}</div>
                                            </div>
                                            <div className="p-2 space-y-1.5">
                                                {group.enrollments.map((sub, sIdx) => (
                                                    <div key={sIdx} className="bg-white border border-slate-100 p-2 px-3 rounded-xl flex justify-between items-center group/card hover:border-emerald-200 transition-all duration-300">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                            </div>
                                                            <div className="space-y-0 text-left">
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none block">Assigned Faculty</span>
                                                                <span className="text-[11px] font-black text-emerald-700 uppercase italic leading-tight">
                                                                    {sub.teacherName || 'Master Faculty'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-7 w-7 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg group-hover/card:scale-105 transition-transform"
                                                            onClick={() => handleRemoveSubject(sub.subjectId, sub.teacherId)}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-slate-50">
                        <Button 
                            variant="ghost" 
                            type="button"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="text-slate-400 hover:text-slate-600 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8"
                            onClick={handleUpdate}
                        >
                            Update Student
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ProtectedLayout>
    );
}

const ProfileStat = ({ icon: Icon, label, value, color = "text-slate-400" }) => (
    <div className="space-y-1">
        <div className="flex items-center gap-1.5">
            <Icon className="w-3 h-3 text-slate-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
        </div>
        <div className={`text-[11px] font-black uppercase tracking-tight italic ${color}`}>{value || 'N/A'}</div>
    </div>
);

const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
            <Icon className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{label}</div>
            <div className="text-xs font-black text-slate-300 uppercase tracking-tight">{value || 'NOT DECLARED'}</div>
        </div>
    </div>
);

const ProfileDialog = ({ student }) => {
    if (!student) return null;
    return (
        <div className="flex flex-col h-full bg-slate-950">
            {/* Profile Header */}
            <div className="relative p-8 pb-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/20 to-transparent" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-32 h-32 rounded-[2rem] bg-slate-900 border-4 border-slate-800 flex items-center justify-center text-white text-5xl font-black italic shadow-2xl ring-4 ring-emerald-500/20">
                        {student.firstName?.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                                {student.firstName} <span className="text-emerald-500">{student.lastName}</span>
                            </h2>
                            <Badge className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
                                Level 4 Access
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <ProfileStat icon={Calendar} label="Reg Date" value={new Date(student.createdAt).toLocaleDateString()} />
                            <ProfileStat icon={ShieldCheck} label="Security Status" value={student.status || 'Verified'} color="text-emerald-500" />
                            <ProfileStat icon={Phone} label="Contact" value={student.phoneNumber1} />
                            <ProfileStat icon={Mail} label="Encryption" value="AES-256" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <BookOpen className="w-5 h-5 text-emerald-500" />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Curriculum Matrix</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {student.selectedSubjects?.map((sub, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl group hover:border-emerald-500/50 transition-colors">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Node</div>
                                        <div className="text-xs font-black text-emerald-50 uppercase italic">{sub.subjectName}</div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:animate-ping" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard icon={MapPin} label="Identity Residence" value={student.homeAddress} />
                        <InfoCard icon={CreditCard} label="Identification Token" value={student.nic} />
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="bg-emerald-500 p-6 border-none shadow-[0_20px_40px_-15px_rgba(16,185,129,0.4)]">
                        <div className="flex justify-between items-start mb-8 text-black">
                            <Cpu className="w-8 h-8" />
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Access Card</div>
                        </div>
                        <div className="space-y-4 text-black">
                            <div className="text-2xl font-black uppercase tracking-tighter italic leading-none">
                                {student.firstName}<br/>{student.lastName}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-1.5 bg-black/20 rounded-full" />
                                <div className="w-4 h-1.5 bg-black/20 rounded-full" />
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">ID-{student.id}</div>
                            </div>
                        </div>
                    </Card>

                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Protocol Actions</h4>
                        <div className="space-y-2">
                            <Button className="w-full bg-slate-950 border border-slate-800 text-slate-300 hover:text-emerald-500 hover:border-emerald-500 font-black text-[10px] uppercase tracking-widest h-10 rounded-xl">Generate PDF Log</Button>
                            <Button className="w-full bg-slate-950 border border-slate-800 text-slate-300 hover:text-red-500 hover:border-red-500 font-black text-[10px] uppercase tracking-widest h-10 rounded-xl">Freeze Access</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

