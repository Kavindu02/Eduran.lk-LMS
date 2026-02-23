import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Eye, Search, UserCheck, Calendar, BookOpen, GraduationCap, MapPin, School, Phone, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function StudentsPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = () => {
        setLoading(true);
        fetch('/api/users/students')
            .then(res => res.json())
            .then(data => {
                setStudents(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setStudents([]);
                setLoading(false);
            });
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
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Registered Students</h2>
                        <p className="text-slate-500 text-sm">View and manage all students enrolled in the system.</p>
                    </div>
                    
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Search name, email or NIC..." 
                            className="pl-10 border-slate-200 focus:ring-emerald-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-slate-700 uppercase tracking-wider text-[11px] py-4 px-6">Student</TableHead>
                                    <TableHead className="font-bold text-slate-700 uppercase tracking-wider text-[11px] py-4 px-6">Contact Info</TableHead>
                                    <TableHead className="font-bold text-slate-700 uppercase tracking-wider text-[11px] py-4 px-6">Batch / A/L Year</TableHead>
                                    <TableHead className="font-bold text-slate-700 uppercase tracking-wider text-[11px] py-4 px-6 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-48 text-center text-slate-400">Loading students...</TableCell>
                                    </TableRow>
                                ) : filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-48 text-center text-slate-400">No students found.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id} className="group hover:bg-emerald-50/30 border-slate-50 transition-colors">
                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                                                        {student.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{student.firstName} {student.lastName}</div>
                                                        <div className="text-xs text-slate-500 font-medium">{student.name}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <div className="text-sm text-slate-600 font-medium">{student.email}</div>
                                                <div className="text-xs text-slate-400">{student.phoneNumber1}</div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px] uppercase">
                                                    {student.batchName || student.batchId}
                                                </Badge>
                                                <div className="text-[10px] text-slate-400 font-bold mt-1 ml-1 uppercase">{student.alYear} A/L</div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-right">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50 rounded-full w-9 h-9 p-0"
                                                            onClick={() => setSelectedStudent(student)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl border-slate-200 max-h-[90vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <div className="flex items-center gap-4 mb-4">
                                                                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl shadow-sm border border-emerald-200">
                                                                    {student.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <DialogTitle className="text-2xl text-slate-900 italic font-black uppercase tracking-tight">
                                                                        {student.firstName} {student.lastName}
                                                                    </DialogTitle>
                                                                    <DialogDescription className="text-emerald-600 font-bold text-xs uppercase tracking-widest">
                                                                        Registration ID: {student.id}
                                                                    </DialogDescription>
                                                                </div>
                                                            </div>
                                                        </DialogHeader>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                            {/* Personal Info */}
                                                            <div className="space-y-4">
                                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
                                                                    <UserCheck className="w-3 h-3" /> Personal Information
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Username</label>
                                                                        <p className="text-sm font-semibold text-slate-700">{student.name}</p>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Gender</label>
                                                                        <p className="text-sm font-semibold text-slate-700 capitalize">{student.gender || 'N/A'}</p>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">NIC Number</label>
                                                                        <p className="text-sm font-semibold text-slate-700">{student.nic || 'N/A'}</p>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">District</label>
                                                                        <p className="text-sm font-semibold text-slate-700 capitalize">{student.district || 'N/A'}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Home Address</label>
                                                                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{student.homeAddress || 'N/A'}</p>
                                                                </div>
                                                            </div>

                                                            {/* Academic Info */}
                                                            <div className="space-y-4">
                                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
                                                                    <Calendar className="w-3 h-3" /> Academic Details
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Batch</label>
                                                                        <p className="text-sm font-semibold text-emerald-600">{student.batchName}</p>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">A/L Year</label>
                                                                        <p className="text-sm font-semibold text-emerald-600">{student.alYear}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">School</label>
                                                                    <p className="text-sm font-semibold text-slate-700">{student.school || 'N/A'}</p>
                                                                </div>
                                                            </div>

                                                            {/* Contact Info */}
                                                            <div className="space-y-4">
                                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
                                                                    <Phone className="w-3 h-3" /> Contact Details
                                                                </h4>
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-6 h-6 rounded bg-slate-50 flex items-center justify-center text-slate-400">
                                                                            <Phone size={14} />
                                                                        </div>
                                                                        <span className="text-sm text-slate-700">{student.phoneNumber1}</span>
                                                                        <Badge variant="outline" className="text-[8px] h-4">Primary</Badge>
                                                                    </div>
                                                                    {student.phoneNumber2 && (
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-6 h-6 rounded bg-slate-50 flex items-center justify-center text-slate-400">
                                                                                <Phone size={14} />
                                                                            </div>
                                                                            <span className="text-sm text-slate-700">{student.phoneNumber2}</span>
                                                                            <Badge variant="outline" className="text-[8px] h-4">Alt</Badge>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Selected Subjects */}
                                                            <div className="space-y-4">
                                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
                                                                    <BookOpen className="w-3 h-3" /> Selected Subjects
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {student.selectedSubjects?.length > 0 ? (
                                                                        student.selectedSubjects.map((sub, idx) => (
                                                                            <div key={idx} className="bg-slate-50/50 border border-slate-100 p-2 rounded-lg flex justify-between items-center group/sub">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                                                    <span className="text-sm font-bold text-slate-800">{sub.subjectName}</span>
                                                                                </div>
                                                                                <span className="text-[10px] font-medium text-slate-500 italic flex items-center gap-1">
                                                                                    <GraduationCap size={10} /> {sub.teacherName || 'Self Study'}
                                                                                </span>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-xs text-slate-400 italic">No subjects selected</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </ProtectedLayout>
    );
}
