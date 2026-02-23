import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';
// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminBatches from '@/pages/admin/Batches';
import AdminSubjects from '@/pages/admin/Subjects';
import AdminTeachers from '@/pages/admin/Teachers';
import AdminVideos from '@/pages/admin/Videos';
import AdminStudents from '@/pages/admin/Students';
import AdminAdmins from '@/pages/admin/Admins';
import AdminPayments from '@/pages/admin/Payments';
import StudentDashboard from '@/pages/student/Dashboard';
import StudentWatch from '@/pages/student/Watch';
function App() {
    return (<BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Home />}/>
                    <Route path="/login" element={<Login />}/>
                    <Route path="/register" element={<Register />}/>
                    <Route path="/admin/dashboard" element={<AdminDashboard />}/>
                    <Route path="/admin/batches" element={<AdminBatches />}/>
                    <Route path="/admin/subjects" element={<AdminSubjects />}/>
                    <Route path="/admin/teachers" element={<AdminTeachers />}/>
                    <Route path="/admin/videos" element={<AdminVideos />}/>
                    <Route path="/admin/students" element={<AdminStudents />}/>
                    <Route path="/admin/admins" element={<AdminAdmins />}/>
                    <Route path="/admin/payments" element={<AdminPayments />}/>
                    <Route path="/student/dashboard" element={<StudentDashboard />}/>
                    <Route path="/student/watch/:id" element={<StudentWatch />}/>
                </Routes>
                <Toaster />
            </AuthProvider>
        </BrowserRouter>);
}
export default App;
