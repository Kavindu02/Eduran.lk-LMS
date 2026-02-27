import { useEffect, useState } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, LayoutDashboard, Users, BookOpen, Video, GraduationCap, Layers, ShieldCheck, CreditCard } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function ProtectedLayout({ children, requiredRole, title = 'Dashboard' }) {
    // All hooks must be called unconditionally and in the same order
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const navigate = useNavigate();
    const { user, logout, isLoading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                navigate('/login');
            } else if (requiredRole && user.role?.toLowerCase() !== requiredRole.toLowerCase()) {
                navigate('/');
            }
        }
    }, [user, isLoading, requiredRole, navigate]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto animate-bounce shadow-lg">
                        <LayoutDashboard className="text-white w-8 h-8" />
                    </div>
                    <p className="text-foreground/70 font-medium">Loading session...</p>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const adminLinks = [
        { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/admin/batches", icon: Layers, label: "Batches" },
        { to: "/admin/students", icon: Users, label: "Students" },
        { to: "/admin/subjects", icon: BookOpen, label: "Subjects" },
        { to: "/admin/teachers", icon: GraduationCap, label: "Teachers" },
        { to: "/admin/videos", icon: Video, label: "Videos" },
        { to: "/admin/admins", icon: ShieldCheck, label: "Admins" },
        { to: "/admin/payments", icon: CreditCard, label: "Payments" },
    ];

    const studentLinks = [
        { to: "/student/dashboard", icon: LayoutDashboard, label: "My Dashboard" },
        { to: "/student/lessons", icon: Video, label: "Lessons" },
    ];

    const links = user?.role?.toLowerCase() === 'admin' ? adminLinks : studentLinks;

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            {/* Sidebar - Hidden on mobile, visible on desktop */}
            <aside className={`${sidebarOpen ? 'w-64' : 'hidden md:flex w-20'} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col z-30`}>
                {/* User Profile */}
                <div className={`p-3 md:p-4 border-b border-sidebar-border flex items-center ${!sidebarOpen && 'justify-center'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 min-w-8 md:min-w-10 bg-emerald-600/20 rounded-full flex items-center justify-center text-emerald-500 font-bold shadow-sm border border-emerald-500/10">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="text-sm text-sidebar-foreground font-bold truncate leading-tight uppercase tracking-tight">{user.name}</p>
                                <p className="text-[10px] text-sidebar-foreground/40 uppercase tracking-[0.2em] mt-0.5">{user.role}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-2 md:p-3 space-y-1 overflow-y-auto mt-2">
                    {links.map((link) => (
                        <NavLink 
                            key={link.to}
                            to={link.to} 
                            className={({ isActive }) => `
                                flex items-center p-2.5 rounded-xl transition-all duration-200 group
                                ${isActive 
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                                    : 'text-sidebar-foreground/40 hover:bg-emerald-500/5 hover:text-emerald-500'}
                            `}
                        >
                            <link.icon className={`w-5 h-5 shrink-0 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                            {sidebarOpen && <span className="text-sm font-bold tracking-tight">{link.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer / Logout */}
                <div className="p-3 md:p-4 border-t border-sidebar-border">
                    <Button 
                        variant="ghost" 
                        onClick={handleLogout}
                        className={`w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/5 group transition-all duration-200 ${!sidebarOpen && 'px-0 justify-center'}`}
                    >
                        <LogOut className={`w-5 h-5 ${sidebarOpen && 'mr-3'}`} />
                        {sidebarOpen && <span className="font-bold text-[10px] uppercase tracking-[0.2em]">Logout</span>}
                    </Button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-background/50 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hidden md:inline-flex text-muted-foreground hover:bg-slate-100 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                        <h1 className="text-base md:text-xl font-black text-slate-800 uppercase tracking-tighter leading-none md:leading-[0.9] italic flex flex-col md:flex-row md:gap-2">
                            <span>{title.split(' ')[0]}</span>
                            {title.split(' ')[1] && <span className="text-emerald-500">{title.split(' ')[1]}</span>}
                        </h1>
                    </div>
                </header>

                {/* Body */}
                <main className="flex-1 overflow-y-auto bg-slate-50/20 scroll-smooth pb-20 md:pb-0">
                    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-center gap-1 py-3 px-1 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] overflow-x-auto no-scrollbar">
                    {links.map((link) => (
                        <NavLink 
                            key={link.to}
                            to={link.to} 
                            className={({ isActive }) => `
                                flex flex-col items-center justify-center min-w-[40px] min-h-[40px] transition-all duration-200
                                ${isActive ? 'text-emerald-500 scale-110' : 'text-slate-400'}
                            `}
                        >
                            <link.icon className="w-5 h-5" />
                        </NavLink>
                    ))}
                    <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                        <DialogTrigger asChild>
                            <button 
                                className="flex flex-col items-center justify-center min-w-[40px] min-h-[40px] text-red-400 transition-all duration-200"
                                onClick={() => setShowLogoutDialog(true)}
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </DialogTrigger>
                        <DialogContent showCloseButton={false}>
                            <DialogHeader>
                                <DialogTitle>Are you sure?</DialogTitle>
                                <DialogDescription>
                                    Do you want to logout?
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setShowLogoutDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </nav>
            </div>
        </div>
    );
}
