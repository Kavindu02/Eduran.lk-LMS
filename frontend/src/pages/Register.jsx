import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { AlertCircle, User, Mail, Lock, Phone, GraduationCap, School, UserCircle, ChevronRight, MapPin, Check } from 'lucide-react';
import { HydrationWrapper } from '@/components/hydration-wrapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phoneNumber1: '', phoneNumber2: '',
    nic: '', school: '', alYear: '', homeAddress: '', gender: '',
    district: '', batchId: '', password: '', confirmPassword: '',
  });

  // Unified mapping state for subjects: { subjectId: selectedTeacherId | null }
  const [selectedMapping, setSelectedMapping] = useState({});

  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    }
    
    // Fetch real batches from backend
    fetch('http://localhost:5000/api/batches')
      .then(res => res.json())
      .then(data => {
        setBatches(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error fetching batches:', err);
        setBatches([]);
      });
    
    // Fetch all teachers to have them available for filtering
    fetch('http://localhost:5000/api/teachers')
      .then(res => res.json())
      .then(data => setAllTeachers(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Error fetching teachers:', err);
        setAllTeachers([]);
      });
  }, [user, navigate]);

  // Fetch subjects when batch changes
  useEffect(() => {
    if (formData.batchId) {
      setLoading(true);
      fetch(`http://localhost:5000/api/subjects?batchId=${formData.batchId}`)
        .then(res => res.json())
        .then(data => {
          setSubjects(Array.isArray(data) ? data : []);
          setSelectedMapping(prev => Object.keys(prev).length === 0 ? prev : {}); // Avoid redundant resets
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching subjects:', err);
          setLoading(false);
        });
    } else {
      setSubjects(prev => prev.length === 0 ? prev : []);
      setSelectedMapping(prev => Object.keys(prev).length === 0 ? prev : {});
    }
  }, [formData.batchId]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      if (prev[id] === value) return prev;
      return { ...prev, [id]: value };
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      if (prev[name] === value) return prev;
      // If changing alYear, reset batchId
      if (name === 'alYear' && prev.batchId !== '') {
        return { ...prev, [name]: value, batchId: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const toggleSubject = (subId) => {
    if (!subId) return;
    const sid = String(subId);
    setSelectedMapping(prev => {
      const next = { ...prev };
      if (sid in next) {
        delete next[sid]; // De-select
      } else {
        next[sid] = []; // Select with no teachers chosen yet
      }
      return next;
    });
    if (error) setError('');
  };

  const toggleTeacher = (subId, teacherId) => {
    if (!subId || !teacherId) return;
    const sid = String(subId);
    const tid = String(teacherId);
    setSelectedMapping(prev => {
      const currentTeachers = prev[sid] || [];
      const nextTeachers = currentTeachers.includes(tid)
        ? currentTeachers.filter(id => id !== tid)
        : [...currentTeachers, tid];
      return { ...prev, [sid]: nextTeachers };
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    const selectedIds = Object.keys(selectedMapping);
    if (selectedIds.length === 0) {
      setError('Please select at least one subject');
      toast.error('Please select at least one subject');
      return;
    }
    
    // Check if each selected subject has at least one teacher
    const missingTeacher = selectedIds.find(sid => (selectedMapping[sid] || []).length === 0);
    if (missingTeacher) {
      const sub = subjects.find(s => String(s.id) === missingTeacher);
      setError(`Please select at least one teacher for ${sub?.name || 'subject'}`);
      toast.error(`Please select at least one teacher for ${sub?.name || 'subject'}`);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { email, password, firstName, lastName, ...rest } = formData;
      
      // Prepare selected subjects with their teachers
      const subjectData = [];
      selectedIds.forEach(sId => {
        const teachers = selectedMapping[sId] || [];
        teachers.forEach(tId => {
          subjectData.push({
            subjectId: sId,
            teacherId: tId
          });
        });
      });

      const result = await register(email, password, `${firstName} ${lastName}`, { 
        firstName, 
        lastName, 
        selectedSubjects: subjectData,
        ...rest 
      });

      if (result.success) {
        toast.success('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      setError('An error occurred during registration.');
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"];

  return (
    <div className="min-h-screen bg-[#06120c] flex items-center justify-center py-12 px-4 relative overflow-hidden font-sans">
      
      {/* --- Background Elements --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/color.png')" }}
        >
          <div className="absolute inset-0 bg-[#0a261a]/90 backdrop-blur-sm" />
        </div>
        
        {/* Background Tiled Logos */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-8 p-5 rotate-12 scale-150">
            {Array.from({ length: 120 }).map((_, i) => (
              <img 
                key={i}
                src="/logo.png" 
                alt="" 
                className="w-12 h-auto grayscale invert opacity-50" 
              />
            ))}
          </div>
        </div>
        
        {/* Floating Math/Edu Symbols */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 gap-10 p-10 rotate-12 scale-150">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="text-white text-3xl font-serif">
                {['+', '∑', '?', '!', '{', '}', '×'][i % 7]}
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px]" />
      </div>

      <HydrationWrapper className="w-full max-w-4xl relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 animate-fadeIn text-center">
          <h2 className="text-white text-4xl md:text-5xl font-black tracking-tighter uppercase leading-tight">
            Join the <span className="text-emerald-500">Academy</span>
          </h2>
          <p className="text-white/60 font-serif italic text-lg mt-2 underline decoration-emerald-500/30 underline-offset-4">
            start your learning journey today
          </p>
        </div>

        {/* Registration Card */}
        <Card className="bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl animate-scaleIn overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleRegister} className="space-y-10">
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex gap-3 items-center animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-xs font-bold text-red-200 uppercase tracking-widest">{error}</p>
                </div>
              )}

              {/* Personal Info Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                  <UserCircle className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-white font-black uppercase tracking-[0.2em] text-[11px]">Identity Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormInput label="First Name" id="firstName" placeholder="JOHN" icon={<User />} value={formData.firstName} onChange={handleInputChange} />
                  <FormInput label="Last Name" id="lastName" placeholder="DOE" icon={<User />} value={formData.lastName} onChange={handleInputChange} />
                  <FormInput label="NIC Number" id="nic" placeholder="2001XXXXXXXX" icon={<Lock className="w-3 h-3"/>} value={formData.nic} onChange={handleInputChange} />
                </div>
              </div>

              {/* Contact Info Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                  <Phone className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-white font-black uppercase tracking-[0.2em] text-[11px]">Communication</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput label="Email Address" id="email" type="email" placeholder="HELLO@EDURA.COM" icon={<Mail />} value={formData.email} onChange={handleInputChange} />
                  <FormInput label="Primary Phone" id="phoneNumber1" placeholder="+94 7X XXX XXXX" icon={<Phone />} value={formData.phoneNumber1} onChange={handleInputChange} />
                  <FormInput label="Home Address" id="homeAddress" placeholder="STREET, CITY" icon={<MapPin />} value={formData.homeAddress} onChange={handleInputChange} isFullWidth />
                </div>
              </div>

              {/* Academic Info Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                  <GraduationCap className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-white font-black uppercase tracking-[0.2em] text-[11px]">Academic Background</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <FormInput label="School" id="school" placeholder="SCHOOL NAME" icon={<School />} value={formData.school} onChange={handleInputChange} />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-1">AL Year</label>
                    <Select onValueChange={(v) => handleSelectChange('alYear', v)} value={formData.alYear}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl">
                        <SelectValue placeholder="YEAR" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1b4332] border-white/10 text-white font-sans">
                        {["2024", "2025", "2026", "2027", "2028"].map(year => (
                           <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-1">District</label>
                    <Select onValueChange={(v) => handleSelectChange('district', v)} value={formData.district}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl">
                        <SelectValue placeholder="LOCATION" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1b4332] border-white/10 text-white h-60">
                        {districts.map(d => <SelectItem key={d} value={d.toLowerCase()}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-1">Gender</label>
                    <Select onValueChange={(v) => handleSelectChange('gender', v)} value={formData.gender}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl">
                        <SelectValue placeholder="GENDER" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1b4332] border-white/10 text-white">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-1">Active Batch</label>
                    <Select onValueChange={(v) => handleSelectChange('batchId', v)} value={formData.batchId}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl">
                        <SelectValue placeholder={formData.alYear ? "CHOOSE BATCH" : "SELECT YEAR FIRST"} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1b4332] border-white/10 text-white font-sans">
                        {(batches || [])
                          .filter(b => formData.alYear ? String(b.year) === String(formData.alYear) : true)
                          .map(b => (
                          <SelectItem key={`batch-opt-${b.id}`} value={String(b.id)}>
                            {b.name.toUpperCase()} ({b.year})
                          </SelectItem>
                        ))}
                        {(batches || []).filter(b => formData.alYear ? String(b.year) === String(formData.alYear) : true).length === 0 && (
                          <SelectItem disabled value="none">
                            {formData.alYear ? `NO BATCHES FOR ${formData.alYear}` : "SELECT YEAR FIRST"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Subscriptions Section - Multi-select subjects and teachers */}
                {formData.batchId && subjects.length > 0 && (
                  <div className="space-y-6 mt-8 animate-fadeInUp">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                      <GraduationCap className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-white font-black uppercase tracking-[0.2em] text-[11px]">Select Subjects & Teachers</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Subject List with Checkboxes */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 ml-1">Available Subjects</p>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                          {(subjects || []).filter(s => s && s.id).map((sub) => {
                            const sid = String(sub.id);
                            const isSelected = sid in selectedMapping;
                            return (
                                <div 
                                  key={`sub-row-${sid}`} 
                                  className={`flex items-center justify-between group cursor-pointer p-4 rounded-2xl transition-all duration-300 border-2 select-none ${isSelected ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`} 
                                  onClick={() => toggleSubject(sub.id)}
                                >
                                  <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${isSelected ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 rotate-[360deg]' : 'bg-white/5 text-white/40'}`}>
                                      {isSelected ? <Check className="w-6 h-6 flex-shrink-0" /> : <School className="w-5 h-5 flex-shrink-0" />}
                                    </div>
                                    <div>
                                      <p className="text-sm md:text-md font-black text-white uppercase leading-none font-sans tracking-tight mb-1">{sub.name || 'Unknown'}</p>
                                      <p className="text-[10px] text-emerald-500/60 font-black tracking-widest uppercase mt-1 leading-none">{sub.code || 'CODE ---'}</p>
                                    </div>
                                  </div>
                                  <div className="ml-4 flex-shrink-0 pointer-events-none">
                                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-transparent border-white/20'}`}>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                                    </div>
                                  </div>
                                </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Teacher Selection */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 ml-1">Teacher Preferences</p>
                        <div className="space-y-4">
                          {Object.keys(selectedMapping).length === 0 ? (
                            <div className="h-[120px] border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center text-center p-6">
                              <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em]">Select subjects to choose teachers</p>
                            </div>
                          ) : (
                            Object.keys(selectedMapping).map(sid => {
                              const sub = (subjects || []).find(s => s && String(s.id) === sid);
                              if (!sub) return null;
                              
                              const subTeachers = (allTeachers || []).filter(t => t && String(t.subjectId) === sid);
                              const selectedTeachers = selectedMapping[sid] || [];
                              
                              return (
                                <div key={`t-sel-${sid}`} className="bg-black/60 border border-white/10 rounded-2xl p-4 space-y-3">
                                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                    <h4 className="text-emerald-500 font-black uppercase tracking-widest text-[9px]">{sub.name || 'Subject'} Teachers</h4>
                                    <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">Click to Select</span>
                                  </div>
                                  
                                  <div className="grid gap-2">
                                    {subTeachers.map(t => {
                                      const tid = String(t.id);
                                      const isChosen = selectedTeachers.includes(tid);
                                      return (
                                        <div 
                                          key={`t-opt-${sid}-${t.id}`} 
                                          className={`group flex items-center justify-between p-3 rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none ${isChosen ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTeacher(sid, t.id);
                                          }}
                                        >
                                          <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isChosen ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-white/40'}`}>
                                              <User className="w-5 h-5 flex-shrink-0" />
                                            </div>
                                            <div className="overflow-hidden">
                                              <p className="text-[12px] font-black text-white hover:text-emerald-500 transition-colors uppercase truncate tracking-tight">{t.name}</p>
                                              <p className="text-[9px] text-emerald-500/40 font-black tracking-[0.2em] uppercase truncate">{t.qualification || 'LEVEL EXPERT'}</p>
                                            </div>
                                          </div>
                                          <div className="ml-3 flex-shrink-0 pointer-events-none">
                                            <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${isChosen ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-transparent border-white/20'}`}>
                                              {isChosen && <Check className="w-3.5 h-3.5 text-black" />}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {subTeachers.length === 0 && (
                                      <p className="text-[10px] text-white/20 italic p-2 text-center">No teachers registered for this subject</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                  <Lock className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-white font-black uppercase tracking-[0.2em] text-[11px]">Security Keys</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput label="Create Password" id="password" type="password" placeholder="••••••••" icon={<Lock />} value={formData.password} onChange={handleInputChange} />
                  <FormInput label="Confirm Password" id="confirmPassword" type="password" placeholder="••••••••" icon={<Lock />} value={formData.confirmPassword} onChange={handleInputChange} />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-14 bg-white hover:bg-emerald-500 text-black hover:text-white font-black uppercase tracking-[0.3em] text-sm transition-all duration-500 rounded-xl group relative overflow-hidden"
                >
                  <div className="absolute -inset-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] duration-1000 transition-transform" />
                  <span className="relative flex items-center justify-center gap-3">
                    {loading ? 'Processing...' : 'Complete Registration'}
                    {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </span>
                </Button>
                
                <p className="mt-8 text-center text-white/40 text-[11px] font-bold uppercase tracking-widest">
                  Already registered?{' '}
                  <Link to="/login" className="text-emerald-500 hover:text-emerald-400 underline underline-offset-4 transition-colors">
                    Sign In Here
                  </Link>
                </p>
              </div>

            </form>
          </CardContent>
        </Card>
      </HydrationWrapper>
    </div>
  );
}

// Reusable Sub-component for Inputs to keep code clean
function FormInput({ label, id, type = "text", placeholder, icon, value, onChange, isFullWidth = false }) {
  return (
    <div className={`space-y-2 group ${isFullWidth ? 'md:col-span-2' : ''}`}>
      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-emerald-500 transition-colors">
          {icon}
        </div>
        <Input 
          id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} required
          className="h-12 bg-white/5 border-white/10 pl-12 text-white placeholder:text-white/10 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all rounded-xl text-sm"
        />
      </div>
    </div>
  );
}