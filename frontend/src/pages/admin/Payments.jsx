import { useState, useEffect } from 'react';
// ...existing code...
import ProtectedLayout from '@/components/protected-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ShieldAlert, ShieldCheck, Ban, ChevronDown, Check, Settings2, ShieldOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Popover, 
    PopoverContent, 
    PopoverTrigger 
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function PaymentsPage() {
        const [students, setStudents] = useState([]);
        const [loading, setLoading] = useState(true);
        const [searchTerm, setSearchTerm] = useState('');
        const [processingId, setProcessingId] = useState(null);
        // Month Modal State (must be inside component)
        const [monthModal, setMonthModal] = useState({ open: false });

        // Month names
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];


        // Paid months state (real data)
        const [paidMonths, setPaidMonths] = useState([]);

        // Fetch paid months from backend when modal opens
        useEffect(() => {
            if (monthModal.open && monthModal.studentId && monthModal.subjectId) {
                const params = new URLSearchParams({
                    userId: monthModal.studentId,
                    subjectId: monthModal.subjectId,
                    teacherId: monthModal.teacherId || ''
                });
                fetch(`/api/users/subject-month-payments?${params.toString()}`)
                    .then(res => res.json())
                    .then(data => {
                        setPaidMonths(Array.isArray(data.months) ? data.months : []);
                    })
                    .catch(() => setPaidMonths([]));
            } else {
                setPaidMonths([]);
            }
        }, [monthModal]);

        // Month Modal UI (must be inside component)
        const MonthModal = () => {
            if (!monthModal.open) return null;
            // Build a map for quick lookup
            const paidMap = {};
            paidMonths.forEach(m => {
                const key = `${m.year}-${String(m.month).padStart(2, '0')}`;
                paidMap[key] = m.status === 'paid';
            });
            const year = 2026; // For now, static year

            // Toggle paid/unpaid for a month
            const handleToggleMonth = async (idx) => {
                const monthNum = String(idx + 1).padStart(2, '0');
                const key = `${year}-${monthNum}`;
                const paid = paidMap[key] || false;
                const newStatus = paid ? 'unpaid' : 'paid';
                try {
                    const res = await fetch('/api/users/subject-month-payments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: monthModal.studentId,
                            subjectId: monthModal.subjectId,
                            teacherId: monthModal.teacherId,
                            year,
                            month: idx + 1,
                            status: newStatus
                        })
                    });
                    if (res.ok) {
                        // Update UI
                        setPaidMonths(prev => {
                            const updated = prev.filter(m => !(m.year === year && m.month === idx + 1));
                            updated.push({ year, month: idx + 1, status: newStatus });
                            return updated;
                        });
                        toast.success(`Marked as ${newStatus.toUpperCase()} for ${monthNames[idx]}`);
                    } else {
                        toast.error('Failed to update payment status');
                    }
                } catch {
                    toast.error('Network error');
                }
            };

            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-[340px] relative">
                        <button
                            className="absolute top-2 right-3 text-slate-400 hover:text-red-500 font-bold text-lg"
                            onClick={() => setMonthModal({ open: false })}
                        >
                            ×
                        </button>
                        <div className="mb-4">
                            <div className="font-black text-slate-900 text-lg">{monthModal.subjectName}</div>
                            <div className="text-xs text-slate-500 font-bold">{monthModal.teacherName}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {monthNames.map((name, idx) => {
                                const monthNum = String(idx + 1).padStart(2, '0');
                                const key = `${year}-${monthNum}`;
                                const paid = paidMap[key] || false;
                                return (
                                    <div
                                        key={key}
                                        onClick={() => handleToggleMonth(idx)}
                                        className={`rounded-lg px-2 py-2 text-center text-xs font-bold cursor-pointer border transition-all ${
                                            paid ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'bg-red-50 border-red-200 text-red-500'
                                        }`}
                                    >
                                        {name}
                                        <div className="text-[10px] font-black mt-1">{paid ? 'PAID' : 'UNPAID'}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        };

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

    const handleUpdateStatus = async (userId, updates) => {
        setProcessingId(userId);
        try {
            const response = await fetch(`/api/users/${userId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                toast.success('Access updated successfully');
                setStudents(prev => prev.map(s => 
                    s.id === userId ? { ...s, ...updates } : s
                ));
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('Error updating status');
        } finally {
            setProcessingId(null);
        }
    };

    const handleUpdateSubjectStatus = async (userId, subjectId, teacherId, newStatus) => {
        setProcessingId(`${userId}-${subjectId}-${teacherId}`);
        try {
            const response = await fetch('/api/users/subject-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, subjectId, teacherId, status: newStatus })
            });

            if (response.ok) {
                toast.success(`Subject access: ${newStatus.toUpperCase()}`);
                setStudents(prev => prev.map(s => {
                    if (s.id !== userId) return s;
                    return {
                        ...s,
                        selectedSubjects: s.selectedSubjects.map(sub => {
                            if (sub.subjectId === subjectId && sub.teacherId === teacherId) {
                                return { ...sub, paymentStatus: newStatus };
                            }
                            return sub;
                        })
                    };
                }));
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to update subject');
            }
        } catch (error) {
            toast.error('Network error during update');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredStudents = students.filter(s => 
        (s.firstName + ' ' + s.lastName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nic?.includes(searchTerm) ||
        s.batchName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedLayout requiredRole="admin" title="Payments Registry">
            <MonthModal />
            <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
                            Subject <span className="text-emerald-600">Access Management</span>
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">Control student granular access per course.</p>
                    </div>
                    
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input 
                            placeholder="Search Name, NIC, or Batch ID..." 
                            className="pl-11 h-12 rounded-2xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-100">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-black text-slate-800 uppercase tracking-widest text-[10px] py-4 px-6">Student Info</TableHead>
                                <TableHead className="font-black text-slate-800 uppercase tracking-widest text-[10px] py-4 px-6">Identities</TableHead>
                                <TableHead className="font-black text-slate-800 uppercase tracking-widest text-[10px] py-4 px-6 text-center">Subject Access</TableHead>
                                <TableHead className="font-black text-slate-800 uppercase tracking-widest text-[10px] py-4 px-6 text-right">Settings</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Data...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center">
                                        <p className="text-sm font-bold text-slate-300 italic uppercase tracking-widest">No matching records</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student) => (
                                    <TableRow key={student.id} className="group hover:bg-slate-50 border-slate-50 transition-colors duration-200">
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm transition-colors ${student.is_blocked ? 'bg-red-50 text-red-600' : 'bg-slate-900 text-white group-hover:bg-emerald-600'}`}>
                                                    {student.firstName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 uppercase italic text-sm tracking-tight">{student.firstName} {student.lastName}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                                    NIC: {student.nic || 'N/A'}
                                                </div>
                                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-200 text-slate-400">
                                                    {student.batchName} ({student.alYear})
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-center">
                                            {student.selectedSubjects?.length > 0 ? (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button 
                                                            variant="outline" 
                                                            className="h-8 px-4 rounded-lg transition-all gap-3 border-slate-200 bg-white hover:border-emerald-500 hover:text-emerald-700 shadow-sm"
                                                        >
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                student.selectedSubjects.every(s => s.paymentStatus === 'paid') 
                                                                ? 'bg-emerald-500' 
                                                                : student.selectedSubjects.some(s => s.paymentStatus === 'paid')
                                                                ? 'bg-amber-400'
                                                                : 'bg-red-500'
                                                            }`} />
                                                            <span className="font-black text-[10px] uppercase tracking-widest">
                                                                {student.selectedSubjects.length} SUBJECTS
                                                            </span>
                                                            <Settings2 className="w-3 h-3 text-slate-400" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[280px] p-0 border-none shadow-xl rounded-xl bg-white overflow-hidden" side="top">
                                                        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 leading-none">Access List</span>
                                                            </div>
                                                            <Badge className="bg-emerald-500 text-slate-900 border-none text-[9px] font-black h-5 px-2">
                                                                {student.selectedSubjects.filter(s => s.paymentStatus === 'paid').length}/{student.selectedSubjects.length} PAID
                                                            </Badge>
                                                        </div>
                                                        <div className="p-2 space-y-2 max-h-[260px] overflow-y-auto bg-slate-50/20">
                                                            {Object.values(student.selectedSubjects.reduce((acc, sub) => {
                                                                if (!acc[sub.subjectId]) acc[sub.subjectId] = { id: sub.subjectId, name: sub.subjectName, teachers: [] };
                                                                acc[sub.subjectId].teachers.push(sub);
                                                                return acc;
                                                            }, {})).map((group) => (
                                                                <div key={group.id} className="space-y-1">
                                                                    <div className="px-1 flex items-center gap-1.5 mb-1">
                                                                        <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                                                                        <span className="text-[10px] font-black uppercase italic tracking-tight text-slate-900">{group.name}</span>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        {group.teachers.map((sub) => (
                                                                            <div key={`${student.id}-${sub.subjectId}-${sub.teacherId}`}
                                                                                className={`flex items-center justify-between gap-3 p-2 rounded-lg border transition-all ${
                                                                                    sub.paymentStatus === 'paid' ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 hover:border-emerald-200'
                                                                                }`}
                                                                            >
                                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                                    <span className={`text-[9px] font-black uppercase tracking-tight truncate ${sub.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-slate-600'}`}>
                                                                                        {(sub.teacherName || 'N/A').replace(/PROF\.\s/i, '')}
                                                                                    </span>
                                                                                    {/* Paid months summary (if available) */}
                                                                                    {sub.paidMonthsSummary && (
                                                                                        <span className="ml-2 text-[9px] font-bold text-emerald-700 bg-emerald-100 rounded px-1">
                                                                                            {sub.paidMonthsSummary}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                {/* Remove old paid badge, now handled by summary */}
                                                                                {/* View Months Button */}
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="xs"
                                                                                    className="ml-2 px-2 py-1 text-[9px] font-bold border-emerald-200"
                                                                                    onClick={() => {
                                                                                        setMonthModal({
                                                                                            open: true,
                                                                                            studentId: student.id,
                                                                                            subjectId: sub.subjectId,
                                                                                            teacherId: sub.teacherId,
                                                                                            subjectName: group.name,
                                                                                            teacherName: sub.teacherName || 'N/A',
                                                                                        });
                                                                                    }}
                                                                                >
                                                                                    View Months
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            ) : (
                                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-slate-300 border-dashed">No Subjects</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Badge className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${student.is_blocked ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                    {student.is_blocked ? 'Blocked' : 'Active'}
                                                </Badge>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    disabled={processingId === student.id}
                                                    onClick={() => handleUpdateStatus(student.id, { is_blocked: !student.is_blocked })}
                                                    className={`h-8 w-8 rounded-lg hover:bg-slate-100 ${student.is_blocked ? 'text-emerald-600' : 'text-red-500'}`}
                                                >
                                                    {student.is_blocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
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
        </ProtectedLayout>
    );
}

