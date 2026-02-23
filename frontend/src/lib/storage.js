// Storage utilities
const STORAGE_KEYS = {
    USERS: 'lms_users',
    BATCHES: 'lms_batches',
    SUBJECTS: 'lms_subjects',
    TEACHERS: 'lms_teachers',
    VIDEOS: 'lms_videos',
    CURRENT_USER: 'lms_current_user',
};
function getFromStorage(key, defaultValue) {
    if (typeof window === 'undefined')
        return defaultValue;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    }
    catch {
        return defaultValue;
    }
}
function setToStorage(key, value) {
    if (typeof window === 'undefined')
        return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}
// Initialize default data if empty
export function initializeDefaultData() {
    if (typeof window === 'undefined')
        return;
    const existingUsers = getFromStorage(STORAGE_KEYS.USERS, []);
    if (existingUsers.length === 0) {
        const defaultUsers = [
            {
                id: 'admin1',
                email: 'admin@lms.com',
                password: 'admin123',
                name: 'Admin User',
                role: 'admin',
                createdAt: new Date().toISOString(),
            }
        ];
        setToStorage(STORAGE_KEYS.USERS, defaultUsers);
    }
    if (getFromStorage(STORAGE_KEYS.BATCHES, []).length === 0) {
        setToStorage(STORAGE_KEYS.BATCHES, []);
    }
    if (getFromStorage(STORAGE_KEYS.SUBJECTS, []).length === 0) {
        setToStorage(STORAGE_KEYS.SUBJECTS, []);
    }
    if (getFromStorage(STORAGE_KEYS.TEACHERS, []).length === 0) {
        setToStorage(STORAGE_KEYS.TEACHERS, []);
    }
    if (getFromStorage(STORAGE_KEYS.VIDEOS, []).length === 0) {
        setToStorage(STORAGE_KEYS.VIDEOS, []);
    }
}
// User operations
export function createUser(user) {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const newUser = {
        ...user,
        id: 'user_' + Date.now(),
        createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setToStorage(STORAGE_KEYS.USERS, users);
    return newUser;
}
export function getUserByEmail(email) {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    return users.find(u => u.email === email) || null;
}
export function updateUser(id, updates) {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === id);
    if (index === -1)
        return null;
    users[index] = { ...users[index], ...updates };
    setToStorage(STORAGE_KEYS.USERS, users);
    return users[index];
}
export function setCurrentUser(user) {
    if (user === null) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    else {
        setToStorage(STORAGE_KEYS.CURRENT_USER, user);
    }
}
export function getCurrentUser() {
    return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
}
// Batch operations
export function getAllBatches() {
    return getFromStorage(STORAGE_KEYS.BATCHES, []);
}
export function createBatch(batch) {
    const batches = getFromStorage(STORAGE_KEYS.BATCHES, []);
    const newBatch = {
        ...batch,
        id: 'batch_' + Date.now(),
        createdAt: new Date().toISOString(),
    };
    batches.push(newBatch);
    setToStorage(STORAGE_KEYS.BATCHES, batches);
    return newBatch;
}
export function updateBatch(id, updates) {
    const batches = getFromStorage(STORAGE_KEYS.BATCHES, []);
    const index = batches.findIndex(b => b.id === id);
    if (index === -1)
        return null;
    batches[index] = { ...batches[index], ...updates };
    setToStorage(STORAGE_KEYS.BATCHES, batches);
    return batches[index];
}
export function deleteBatch(id) {
    const batches = getFromStorage(STORAGE_KEYS.BATCHES, []);
    const filtered = batches.filter(b => b.id !== id);
    if (filtered.length === batches.length)
        return false;
    setToStorage(STORAGE_KEYS.BATCHES, filtered);
    return true;
}
// Subject operations
export function getSubjectsByBatch(batchId) {
    const subjects = getFromStorage(STORAGE_KEYS.SUBJECTS, []);
    return subjects.filter(s => s.batchId === batchId);
}
export function createSubject(subject) {
    const subjects = getFromStorage(STORAGE_KEYS.SUBJECTS, []);
    const newSubject = {
        ...subject,
        id: 'subject_' + Date.now(),
        createdAt: new Date().toISOString(),
    };
    subjects.push(newSubject);
    setToStorage(STORAGE_KEYS.SUBJECTS, subjects);
    return newSubject;
}
export function updateSubject(id, updates) {
    const subjects = getFromStorage(STORAGE_KEYS.SUBJECTS, []);
    const index = subjects.findIndex(s => s.id === id);
    if (index === -1)
        return null;
    subjects[index] = { ...subjects[index], ...updates };
    setToStorage(STORAGE_KEYS.SUBJECTS, subjects);
    return subjects[index];
}
export function deleteSubject(id) {
    const subjects = getFromStorage(STORAGE_KEYS.SUBJECTS, []);
    const filtered = subjects.filter(s => s.id !== id);
    if (filtered.length === subjects.length)
        return false;
    setToStorage(STORAGE_KEYS.SUBJECTS, filtered);
    return true;
}
// Teacher operations
export function getTeachersBySubject(subjectId) {
    const teachers = getFromStorage(STORAGE_KEYS.TEACHERS, []);
    return teachers.filter(t => t.subjectId === subjectId);
}
export function createTeacher(teacher) {
    const teachers = getFromStorage(STORAGE_KEYS.TEACHERS, []);
    const newTeacher = {
        ...teacher,
        id: 'teacher_' + Date.now(),
        createdAt: new Date().toISOString(),
    };
    teachers.push(newTeacher);
    setToStorage(STORAGE_KEYS.TEACHERS, teachers);
    return newTeacher;
}
export function updateTeacher(id, updates) {
    const teachers = getFromStorage(STORAGE_KEYS.TEACHERS, []);
    const index = teachers.findIndex(t => t.id === id);
    if (index === -1)
        return null;
    teachers[index] = { ...teachers[index], ...updates };
    setToStorage(STORAGE_KEYS.TEACHERS, teachers);
    return teachers[index];
}
export function deleteTeacher(id) {
    const teachers = getFromStorage(STORAGE_KEYS.TEACHERS, []);
    const filtered = teachers.filter(t => t.id !== id);
    if (filtered.length === teachers.length)
        return false;
    setToStorage(STORAGE_KEYS.TEACHERS, filtered);
    return true;
}
// Video operations
export function getVideosBySubject(subjectId) {
    const videos = getFromStorage(STORAGE_KEYS.VIDEOS, []);
    return videos.filter(v => v.subjectId === subjectId);
}
export function getVideosByBatch(batchId) {
    const videos = getFromStorage(STORAGE_KEYS.VIDEOS, []);
    return videos.filter(v => v.batchId === batchId);
}
export function getVideosBySubjectAndBatch(subjectId, batchId) {
    const videos = getFromStorage(STORAGE_KEYS.VIDEOS, []);
    return videos.filter(v => v.subjectId === subjectId && v.batchId === batchId);
}
export function createVideo(video) {
    const videos = getFromStorage(STORAGE_KEYS.VIDEOS, []);
    const newVideo = {
        ...video,
        id: 'video_' + Date.now(),
        createdAt: new Date().toISOString(),
    };
    videos.push(newVideo);
    setToStorage(STORAGE_KEYS.VIDEOS, videos);
    return newVideo;
}
export function updateVideo(id, updates) {
    const videos = getFromStorage(STORAGE_KEYS.VIDEOS, []);
    const index = videos.findIndex(v => v.id === id);
    if (index === -1)
        return null;
    videos[index] = { ...videos[index], ...updates };
    setToStorage(STORAGE_KEYS.VIDEOS, videos);
    return videos[index];
}
export function deleteVideo(id) {
    const videos = getFromStorage(STORAGE_KEYS.VIDEOS, []);
    const filtered = videos.filter(v => v.id !== id);
    if (filtered.length === videos.length)
        return false;
    setToStorage(STORAGE_KEYS.VIDEOS, filtered);
    return true;
}
export function getAllVideos() {
    return getFromStorage(STORAGE_KEYS.VIDEOS, []);
}
export function getSubjectById(id) {
    const subjects = getFromStorage(STORAGE_KEYS.SUBJECTS, []);
    return subjects.find(s => s.id === id) || null;
}
export function getBatchById(id) {
    const batches = getFromStorage(STORAGE_KEYS.BATCHES, []);
    return batches.find(b => b.id === id) || null;
}
