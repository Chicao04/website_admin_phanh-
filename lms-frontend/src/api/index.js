// src/api/index.js
// const API_URL = 'http://localhost:4000/api';
const API_URL = 'http://203.145.47.207:4000/api';

/* ================================
    USERS
================================ */
export async function fetchUsers({ search = '', role = 'all' } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role) params.set('role', role);

    const res = await fetch(`${API_URL}/users?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
}

export async function createUser(payload) {
    const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to create user');
    return data;
}

export async function updateUser(id, payload) {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to update user');
    return data;
}

export async function deleteUser(id) {
    const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete user');
}

/* ================================
    COURSES
================================ */
export async function fetchCourses({ search = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);

    const res = await fetch(`${API_URL}/courses?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
}

export async function createCourse(payload) {
    const res = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to create course');
    return data;
}
// ví dụ trong src/api/index.js
export async function updateCourse(id, body) {
    const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error updating course');
    }
    return res.json();
}

export async function deleteCourse(id) {
    const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error deleting course');
    }
    return true;
}


/* ================================
    ADMIN LOGIN / REGISTER
================================ */

// LOGIN ADMIN (email + password + role='admin')
export async function loginAdmin(body) {
    const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Sai email hoặc mật khẩu");
    return data;
}

// REGISTER ADMIN (tạo user có role='admin')
export async function registerAdmin(body) {
    const res = await fetch(`${API_URL}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Không thể tạo admin");
    return data;
}
