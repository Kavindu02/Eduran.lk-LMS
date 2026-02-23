import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ShieldAlert, ShieldCheck, CreditCard, Ban, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function PaymentsPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

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
                toast.success('Status updated successfully');
                // Optimistically update the UI
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

    const filteredStudents = students.filter(s => 
        (s.firstName + ' ' + s.lastName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nic?.includes(searchTerm) ||
        s.batchName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedLayout requiredRole="admin" title="Payments & Access Registry">
            <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
                            Payments & <span className="text-emerald-600">Access Control</span>
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">Manage student financial status and system access permissions.</p>
                    </div>
                    
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Search by Name, NIC or Batch..." 
                            className="pl-10 border-slate-200 focus:ring-emerald-500 bg-white/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden bg-white/80 backdrop-blur-md rounded-[1.5rem]">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-900">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] py-5 px-6">Student Registry</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] py-5 px-6">NIC / Batch</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] py-5 px-6">Payment Status</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] py-5 px-6">Access Security</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] py-5 px-6 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center text-slate-400 font-bold italic uppercase tracking-widest">Hydrating student records...</TableCell>
                                    </TableRow>
                                ) : filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center text-slate-400 font-bold italic uppercase tracking-widest">No matching records found</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id} className="group hover:bg-slate-50/80 border-slate-100 transition-all duration-300">
                                            <TableCell className="py-5 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border ${student.is_blocked ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                                        {student.firstName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 uppercase italic tracking-tight">{student.firstName} {student.lastName}</div>
                                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{student.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5 px-6">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-bold text-slate-700 font-mono tracking-tighter">{student.nic || 'NO NIC'}</div>
                                                    <Badge variant="outline" className="bg-slate-100/50 text-[9px] font-black uppercase tracking-widest border-slate-200">
                                                        {student.batchName} ({student.alYear})
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5 px-6">
                                                {student.payment_status === 'paid' ? (
                                                    <div className="flex items-center gap-2 text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-xl w-fit border border-emerald-100">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Verified Paid</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-red-500 px-3 py-1.5 bg-red-50 rounded-xl w-fit border border-red-100">
                                                        <XCircle className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-5 px-6">
                                                {student.is_blocked ? (
                                                    <div className="flex items-center gap-2 text-red-600">
                                                        <ShieldAlert className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-red-100 rounded">Blocked</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-emerald-600">
                                                        <ShieldCheck className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-100 rounded">Access Active</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-5 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Payment Toggle */}
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(student.id, { 
                                                            payment_status: student.payment_status === 'paid' ? 'unpaid' : 'paid' 
                                                        })}
                                                        disabled={processingId === student.id}
                                                        className={`rounded-xl h-10 px-4 border shadow-sm transition-all duration-300 font-bold uppercase text-[10px] tracking-widest ${
                                                            student.payment_status === 'paid' 
                                                            ? 'hover:bg-red-50 hover:text-red-600 bg-white text-slate-600' 
                                                            : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                                                        }`}
                                                    >
                                                        <CreditCard className="w-3 h-3 mr-2" />
                                                        {student.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                                                    </Button>

                                                    {/* Block Toggle */}
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        disabled={processingId === student.id}
                                                        onClick={() => handleUpdateStatus(student.id, { is_blocked: !student.is_blocked })}
                                                        className={`w-10 h-10 rounded-xl transition-all duration-300 border ${
                                                            student.is_blocked 
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                                                            : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                                        }`}
                                                    >
                                                        {student.is_blocked ? <ShieldCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                                                    </Button>
                                                </div>
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
