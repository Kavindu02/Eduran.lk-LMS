import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { AlertCircle, User, Mail, Lock, Phone, GraduationCap, School, UserCircle, ChevronRight, MapPin, Check, Plus, Minus } from 'lucide-react';
import { HydrationWrapper } from '@/components/hydration-wrapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_BASE_URL;

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
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    }
    
    // Fetch real batches from backend
    fetch(`${API_URL}/batches`)
      .then(res => res.json())
      .then(data => {
        setBatches(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error fetching batches:', err);
        setBatches([]);
      });
    
    // Fetch all teachers to have them available for filtering
    fetch(`${API_URL}/teachers`)
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
      fetch(`${API_URL}/subjects?batchId=${formData.batchId}`)
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
    setShowValidation(true);
    // Check for duplicate NIC before any other validation
    try {
      const res = await fetch(`${API_URL}/users?nic=${formData.nic}`);
      const existing = await res.json();
      if (Array.isArray(existing) && existing.length > 0) {
        setError('NIC number already registered');
        toast.error('NIC number already registered');
        return;
      }
    } catch (err) {
      // If error, allow registration (or handle as needed)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-[#2eb341] via-[#259334] to-[#15541c] flex items-center justify-center py-8 sm:py-12 md:py-20 px-4 sm:px-6 relative overflow-hidden font-sans">
      
      {/* --- Background Elements --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2eb341] via-[#259334] to-[#15541c]" />
        
        {/* Background Tiled Logos */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-8 p-5 rotate-12 scale-150">
            {Array.from({ length: 60 }).map((_, i) => (
              <img 
                key={i}
                src="/logo.png" 
                alt="" 
                className="w-10 sm:w-12 h-auto grayscale invert opacity-50" 
              />
            ))}
          </div>
        </div>
        
        {/* Floating Math/Edu Symbols */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none select-none z-0 overflow-hidden">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-12 p-5 rotate-12 scale-[1.8]">
            {Array.from({ length: 60 }).map((_, i) => (
              <div 
                key={i} 
                className="text-white text-2xl sm:text-3xl font-serif animate-floating"
                style={{ 
                    animationDelay: `${(i % 8) * 1.5}s`,
                    animationDuration: `${10 + (i % 5) * 2}s`
                }}
              >
                {['+', '∑', '?', '!', '{', '}', '×', 'π', 'θ', 'λ'][i % 10]}
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute top-[-10%] right-[-10%] w-64 sm:w-96 h-64 sm:h-96 bg-green-500/20 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-64 sm:w-96 h-64 sm:h-96 bg-green-400/10 rounded-full blur-[80px] sm:blur-[100px]" />
      </div>

      <HydrationWrapper className="w-full max-w-5xl relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 sm:mb-10 animate-fadeIn text-center">
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-tight px-2">
            Join the <span className="text-green-500">Academy</span>
          </h2>
          <p className="text-white/60 font-serif italic text-base sm:text-lg mt-2 underline decoration-green-500/30 underline-offset-4">
            start your learning journey today
          </p>
        </div>

        {/* Registration Card */}
        <Card className="bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl animate-scaleIn overflow-hidden rounded-2xl sm:rounded-3xl">
          <CardContent className="p-5 sm:p-8 md:p-12">
            <form onSubmit={handleRegister} className="space-y-8 sm:space-y-10">
              
              <div className={error ? "bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex gap-3 items-center animate-shake" : "hidden"}>
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-[10px] sm:text-xs font-bold text-red-200 uppercase tracking-widest leading-normal">{error}</p>
              </div>

              {/* Personal Info Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                  <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] sm:text-[11px]">Identity Details</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  <FormInput label="First Name" id="firstName" placeholder="First Name" icon={<User />} value={formData.firstName} onChange={handleInputChange} showValidation={showValidation} />
                  <FormInput label="Last Name" id="lastName" placeholder="Last Name" icon={<User />} value={formData.lastName} onChange={handleInputChange} showValidation={showValidation} />
                  <FormInput label="NIC Number" id="nic" placeholder="2001XXXXXXXX" icon={<Lock className="w-3 h-3"/>} value={formData.nic} onChange={handleInputChange} showValidation={showValidation} maxLength={12} />
                </div>
              </div>

              {/* Contact Info Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] sm:text-[11px]">Communication</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <FormInput label="Email Address" id="email" type="email" placeholder="your@gmail.com" icon={<Mail />} value={formData.email} onChange={handleInputChange} showValidation={showValidation} />
                  <FormInput label="Phone Number" id="phoneNumber1" placeholder="+94 7X XXX XXXX" icon={<Phone />} value={formData.phoneNumber1} onChange={handleInputChange} showValidation={showValidation} />
                  <FormInput label="Home Address" id="homeAddress" placeholder="STREET, CITY" icon={<MapPin />} value={formData.homeAddress} onChange={handleInputChange} isFullWidth showValidation={showValidation} />
                </div>
              </div>

              {/* Academic Info Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] sm:text-[11px]">Academic Background</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6">
                  <FormInput label="School" id="school" placeholder="SCHOOL NAME" icon={<School />} value={formData.school} onChange={handleInputChange} showValidation={showValidation} />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-green-500 ml-1">AL Year</label>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden transition-all h-9 w-full sm:w-32 lg:w-full">
                      <button 
                        type="button" 
                        className="w-8 h-full flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-black transition-all border-r border-white/10"
                        onClick={() => {
                          const current = formData.alYear ? parseInt(formData.alYear) : 2026;
                          handleSelectChange('alYear', String(Math.max(2020, current - 1)));
                        }}
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <div className="flex-1 flex items-center justify-center text-white font-black tracking-widest text-[11px] bg-transparent">
                        {formData.alYear || '2026'}
                      </div>

                      <button 
                        type="button" 
                        className="w-8 h-full flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-black transition-all border-l border-white/10"
                        onClick={() => {
                          const current = formData.alYear ? parseInt(formData.alYear) : 2025;
                          handleSelectChange('alYear', String(Math.min(2040, current + 1)));
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-green-500 ml-1">District</label>
                    <Select onValueChange={(v) => handleSelectChange('district', v)} value={formData.district}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-green-500/20">
                        <SelectValue placeholder="LOCATION" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1b4332] border-white/10 text-white h-60">
                        {districts.map(d => <SelectItem key={d} value={d.toLowerCase()}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-green-500 ml-1">Gender</label>
                    <Select onValueChange={(v) => handleSelectChange('gender', v)} value={formData.gender}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-green-500/20">
                        <SelectValue placeholder="GENDER" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1b4332] border-white/10 text-white">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-green-500 ml-1">Active Batch</label>
                    <Select onValueChange={(v) => handleSelectChange('batchId', v)} value={formData.batchId}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-green-500/20">
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
                  <div className="space-y-8 mt-10 sm:mt-12 animate-fadeInUp">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] sm:text-[11px]">Select Subjects & Teachers</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
                      {/* Subject List with Checkboxes */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-green-500/60 ml-1">Available Subjects</p>
                        <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 space-y-3">
                          {(subjects || []).filter(s => s && s.id).map((sub) => {
                            const sid = String(sub.id);
                            const isSelected = sid in selectedMapping;
                            return (
                                <div 
                                  key={`sub-row-${sid}`} 
                                  className={`flex items-center justify-between group cursor-pointer p-4 rounded-2xl transition-all duration-300 border-2 select-none ${isSelected ? 'bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`} 
                                  onClick={() => toggleSubject(sub.id)}
                                >
                                  <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${isSelected ? 'bg-green-500 text-black shadow-lg shadow-green-500/20 rotate-[360deg]' : 'bg-white/5 text-white/40'}`}>
                                      {isSelected ? <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" /> : <School className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                                    </div>
                                    <div>
                                      <p className="text-xs sm:text-sm md:text-md font-black text-white uppercase leading-none font-sans tracking-tight mb-1">{sub.name || 'Unknown'}</p>
                                      <p className="text-[9px] sm:text-[10px] text-green-500/60 font-black tracking-widest uppercase mt-1 leading-none">{sub.code || 'CODE ---'}</p>
                                    </div>
                                  </div>
                                  <div className="ml-3 sm:ml-4 flex-shrink-0 pointer-events-none">
                                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${isSelected ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/20' : 'bg-transparent border-white/20'}`}>
                                      {isSelected && <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-black" />}
                                    </div>
                                  </div>
                                </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Teacher Selection */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-green-500/60 ml-1">Teacher Preferences</p>
                        <div className="space-y-6">
                          {Object.keys(selectedMapping).length === 0 ? (
                            <div className="h-[120px] border-2 border-dashed border-white/5 rounded-2xl sm:rounded-3xl flex items-center justify-center text-center p-6">
                              <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">Select subjects to choose teachers</p>
                            </div>
                          ) : (
                            Object.keys(selectedMapping).map(sid => {
                              const sub = (subjects || []).find(s => s && String(s.id) === sid);
                              if (!sub) return null;
                              
                              const subTeachers = (allTeachers || []).filter(t => t && String(t.subjectId) === sid);
                              const selectedTeachers = selectedMapping[sid] || [];
                              
                              return (
                                <div key={`t-sel-${sid}`} className="bg-black/40 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 animate-fadeIn">
                                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                    <h4 className="text-green-500 font-black uppercase tracking-widest text-[9px] sm:text-[10px]">{sub.name || 'Subject'} Teachers</h4>
                                    <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">Choose One or More</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                                    {subTeachers.map(t => {
                                      const tid = String(t.id);
                                      const isChosen = selectedTeachers.includes(tid);
                                      return (
                                        <div 
                                          key={`t-opt-${sid}-${t.id}`} 
                                          className={`group flex items-center justify-between p-3.5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none ${isChosen ? 'bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTeacher(sid, t.id);
                                          }}
                                        >
                                          <div className="flex items-center gap-3.5 flex-1 overflow-hidden">
                                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isChosen ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-white/5 text-white/40'}`}>
                                              <User className="w-4.5 h-4.5 sm:w-5 sm:h-5 flex-shrink-0" />
                                            </div>
                                            <div className="overflow-hidden">
                                              <p className="text-[11px] sm:text-[12px] font-black text-white hover:text-green-500 transition-colors uppercase truncate tracking-tight mb-0.5">{t.name}</p>
                                              <p className="text-[8px] sm:text-[9px] text-green-500/40 font-black tracking-[0.2em] uppercase truncate">{t.qualification || 'LEVEL EXPERT'}</p>
                                            </div>
                                          </div>
                                          <div className="ml-3 flex-shrink-0 pointer-events-none">
                                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${isChosen ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/20' : 'bg-transparent border-white/20'}`}>
                                              {isChosen && <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-black" />}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {subTeachers.length === 0 && (
                                      <p className="text-[10px] text-white/20 italic p-4 text-center border border-dashed border-white/5 rounded-2xl">No teachers registered for this subject</p>
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
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] sm:text-[11px]">Security Keys</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <FormInput label="Create Password" id="password" type="password" placeholder="••••••••" icon={<Lock />} value={formData.password} onChange={handleInputChange} showValidation={showValidation} />
                  <FormInput label="Confirm Password" id="confirmPassword" type="password" placeholder="••••••••" icon={<Lock />} value={formData.confirmPassword} onChange={handleInputChange} showValidation={showValidation} />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8 w-full">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-14 sm:h-16 bg-white hover:bg-green-500 text-black hover:text-white font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-xs sm:text-sm transition-all duration-500 rounded-2xl group relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.3)] shadow-green-500/0 hover:shadow-green-500/20 active:scale-[0.98]"
                >
                  <div className="absolute -inset-full bg-gradient-to-r from-transparent via-green-500/20 to-transparent rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] duration-1000 transition-transform" />
                  <span className="relative flex items-center justify-center gap-3">
                    {loading ? 'Processing...' : 'Complete Registration'}
                    {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </span>
                </Button>
                
                <p className="mt-8 text-center text-white/40 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                  Already registered?{' '}
                  <Link to="/login" className="text-green-500 hover:text-green-400 underline underline-offset-4 transition-colors">
                    Sign In Here
                  </Link>
                </p>
                
                {/* Only one Link, not nested */}
               
              </div>

            </form>
          </CardContent>
        </Card>
      </HydrationWrapper>
    </div>
  );
}

// Reusable Sub-component for Inputs to keep code clean
function FormInput({ label, id, type = "text", placeholder, icon, value, onChange, isFullWidth = false, showValidation = false, ...props }) {
  // Add red border if showValidation is true and value is empty
  const isInvalid = showValidation && !value;
  return (
    <div className={`space-y-2 group ${isFullWidth ? 'sm:col-span-2' : ''}`}>
      <label className="text-[10px] font-black uppercase tracking-widest text-green-500 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-green-500 transition-colors pointer-events-none">
          {icon}
        </div>
        <Input 
          id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} required
          className={`h-12 sm:h-13 bg-white/5 border-white/10 pl-12 text-white placeholder:text-white/10 focus:ring-green-500/20 focus:border-green-500/50 transition-all rounded-xl text-xs sm:text-sm ${isInvalid ? 'border-red-500 ring-2 ring-red-500/40 shadow-[0_0_0_2px_rgba(239,68,68,0.3)]' : ''}`}
          aria-invalid={isInvalid}
          {...props}
        />
      </div>
    </div>
  );
}