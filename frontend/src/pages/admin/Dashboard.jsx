import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/protected-layout';
import { useAuth } from '@/lib/auth-context';
import { getAllBatches, getSubjectsByBatch, getAllVideos, getVideosByBatch } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, Users, Settings, ArrowRight, Activity, LayoutDashboard, GraduationCap, Layers, ShieldCheck, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [batches] = useState(getAllBatches());
  const [allVideos] = useState(getAllVideos());
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    fetch('/api/users/students')
      .then(res => res.json())
      .then(data => setStudentCount(data.length))
      .catch(() => setStudentCount(0));
  }, []);

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="h-full flex flex-col space-y-4 animate-fadeIn overflow-hidden">
        
        {/* Advanced Hero Header Section - High Density */}
        <div className="relative overflow-hidden rounded-[1.2rem] bg-[#1b4332] min-h-[120px] flex items-center group shrink-0">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3" />
          </div>
          
          <div className="relative z-10 p-5 md:p-6 w-full flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1 animate-slideInUp">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                Welcome, <span className="text-emerald-400">{user?.name}</span>!
              </h2>
              <p className="text-emerald-100/60 max-w-md text-sm font-medium leading-relaxed">
                Your learning management hub is ready. Monitor, manage, and scale your education platform.
              </p>
            </div>
            
            <div className="hidden lg:flex items-center gap-6 animate-scaleIn">
               <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Students</p>
                  <p className="text-3xl font-black text-white">{studentCount}</p>
               </div>
               <div className="w-12 h-12 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[1rem] flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-700">
                  <LayoutDashboard className="w-6 h-6 text-emerald-400" />
               </div>
            </div>
          </div>
        </div>

        {/* Management Tools - Kinetic Design */}
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-[0.2em] italic">
                Management <span className="text-emerald-500">Tools</span>
              </h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 uppercase tracking-widest hidden md:block">
              Control Panel
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
            {[
              { title: 'Batches', icon: Layers, link: '/admin/batches', desc: 'Manage student cycles', color: 'text-blue-500' },
              { title: 'Students', icon: Users, link: '/admin/students', desc: 'Enrolled individuals', color: 'text-orange-500' },
              { title: 'Subjects', icon: BookOpen, link: '/admin/subjects', desc: 'Curriculum planning', color: 'text-emerald-500' },
              { title: 'Teachers', icon: GraduationCap, link: '/admin/teachers', desc: 'Faculty assignments', color: 'text-amber-500' },
              { title: 'Videos', icon: Video, link: '/admin/videos', desc: 'Content library', color: 'text-purple-500' },
              { title: 'Admins', icon: ShieldCheck, link: '/admin/admins', desc: 'System control', color: 'text-red-500' },
              { title: 'Payments', icon: CreditCard, link: '/admin/payments', desc: 'Fee & Access mgmt', color: 'text-emerald-500' }
            ].map((item, i) => (
              <Link to={item.link} key={i} className="group h-full flex flex-col">
                <div className="relative flex-1 p-0.5 rounded-[1.5rem] bg-gradient-to-b from-slate-200 to-transparent group-hover:from-emerald-400 group-hover:to-emerald-600 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/20">
                  <div className="h-full bg-white group-hover:bg-emerald-600/95 backdrop-blur-xl rounded-[1.4rem] p-5 flex flex-col transition-all duration-500">
                    <div className="flex-1 flex flex-col">
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors duration-500 uppercase tracking-tight italic">
                          {item.title}
                        </h4>
                        <p className="text-sm text-slate-500 group-hover:text-emerald-50/80 transition-colors duration-500 line-clamp-2 leading-snug">
                          {item.desc}
                        </p>
                      </div>

                      {/* Icon in the middle */}
                      <div className="flex-1 flex items-center justify-center py-6">
                        <div className={`w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner`}>
                          <item.icon className={`w-8 h-8 ${item.color} group-hover:text-white transition-colors duration-500`} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 group-hover:border-white/10 transition-colors">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-200 transition-colors">
                        Manage Now
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-white/10 flex items-center justify-center transition-all duration-500 group-hover:translate-x-1">
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}