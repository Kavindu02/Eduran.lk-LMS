import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShieldCheck, Plus, Trash2, Mail, Lock, User, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function AdminsPage() {
    const { user: currentUser } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = () => {
        setLoading(true);
        fetch('/api/users/admins')
            .then(res => res.json())
            .then(data => {
                setAdmins(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setAdmins([]);
                setLoading(false);
            });
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            // Default name from email if not provided
            const name = formData.email.split('@')[0];
            const res = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, name, role: 'admin' })
            });

            if (res.ok) {
                toast.success("Admin created successfully!");
                setIsDialogOpen(false);
                setFormData({ email: '', password: '' });
                loadAdmins();
            } else {
                const err = await res.json();
                toast.error(err.message || "Failed to create admin");
            }
        } catch (error) {
            toast.error("Connection error");
        }
    };

    const handleDeleteAdmin = async (id) => {
        if (id === currentUser.id) {
            toast.error("You cannot delete yourself!");
            return;
        }

        if (!confirm("Are you sure you want to delete this admin? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Admin deleted");
                loadAdmins();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <ProtectedLayout requiredRole="admin" title="Admin Management">
            <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
                            System <span className="text-emerald-500">Administrators</span>
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">Manage top-level access and system controls.</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 font-bold uppercase tracking-widest text-xs px-6">
                                <Plus className="w-4 h-4 mr-2" />
                                New Admin
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-slate-200">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase italic tracking-tight">Create <span className="text-emerald-500">New Admin</span></DialogTitle>
                                <DialogDescription className="font-medium">
                                    Fill in the details below to grant administrative access.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateAdmin} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input 
                                            type="email"
                                            placeholder="admin@academy.com" 
                                            className="pl-10 border-slate-200 bg-slate-50/50"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input 
                                            type="password"
                                            placeholder="••••••••" 
                                            className="pl-10 border-slate-200 bg-slate-50/50"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-3 animate-pulse mt-4">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                    <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-tight">
                                        Warning: Administrators have full access to manage students, content, and system settings.
                                    </p>
                                </div>
                                <Button type="submit" className="w-full bg-slate-900 border-none hover:bg-emerald-600 transition-all duration-300 py-6 font-black uppercase tracking-[0.2em] text-xs">
                                    Initialize Account
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-100">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-black text-slate-800 uppercase tracking-widest text-[10px] py-4 px-6">Administrator</TableHead>
                                <TableHead className="font-black text-slate-800 uppercase tracking-widest text-[10px] py-4 px-6">Email</TableHead>
                                <TableHead className="font-black text-slate-800 uppercase tracking-widest text-[10px] py-4 px-6">Access Level</TableHead>
                                <TableHead className="font-black text-slate-800 uppercase tracking-widest text-[10px] py-4 px-6 text-right">Settings</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="h-40 text-center text-slate-400 font-medium">Syncing administrators...</TableCell></TableRow>
                            ) : admins.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="h-40 text-center text-slate-400 font-medium">No other admins found.</TableCell></TableRow>
                            ) : (
                                admins.map((admin) => (
                                    <TableRow key={admin.id} className="group hover:bg-slate-50 border-slate-50 transition-colors duration-200">
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold shadow-md group-hover:bg-emerald-600 transition-colors">
                                                    {admin.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 uppercase italic text-sm tracking-tight">{admin.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{admin.id === currentUser.id ? 'Active (You)' : 'Admin Agent'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 font-medium text-slate-600 text-sm">
                                            {admin.email}
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Superuser</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                disabled={admin.id === currentUser.id || isDeleting}
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                onClick={() => handleDeleteAdmin(admin.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
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
