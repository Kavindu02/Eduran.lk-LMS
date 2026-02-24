import { useEffect, useState } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, LayoutDashboard, Users, BookOpen, Video, GraduationCap, Layers, ShieldCheck, CreditCard } from 'lucide-react';

export default function ProtectedLayout({ children, requiredRole, title = 'Dashboard' }) {
    const navigate = useNavigate();
    const { user, logout, isLoading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col z-30`}>
                {/* User Profile */}
                <div className="p-4 border-b border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 min-w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shadow-sm">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="text-sm text-sidebar-foreground font-bold truncate leading-tight">{user.name}</p>
                                <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest mt-0.5">{user.role}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {links.map((link) => (
                        <NavLink 
                            key={link.to}
                            to={link.to} 
                            className={({ isActive }) => `
                                flex items-center p-2.5 rounded-xl transition-all duration-200 group
                                ${isActive 
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}
                            `}
                        >
                            <link.icon className={`w-5 h-5 shrink-0 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                            {sidebarOpen && <span className="text-sm font-semibold tracking-tight">{link.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-sidebar-border">
                    <Button 
                        variant="ghost" 
                        onClick={handleLogout}
                        className={`w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 group transition-colors ${!sidebarOpen && 'px-0 justify-center'}`}
                    >
                        <LogOut className={`w-5 h-5 ${sidebarOpen && 'mr-3'}`} />
                        {sidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Logout</span>}
                    </Button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-muted-foreground"
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                        <h1 className="text-lg font-black text-foreground uppercase tracking-tight italic">
                            {title}
                        </h1>
                    </div>
                </header>

                {/* Body */}
                <main className="flex-1 overflow-y-auto bg-slate-50/30">
                    <div className="p-4 md:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
