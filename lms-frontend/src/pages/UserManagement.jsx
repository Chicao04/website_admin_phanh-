// src/pages/UserManagement.jsx
import { useEffect, useState } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../api';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'student',
    });

    // ====== LOAD USERS ======
    const loadUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await fetchUsers({ search, role: roleFilter });
            setUsers(data || []);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Lỗi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetForm = () => {
        setFormMode('create');
        setEditingId(null);
        setForm({
            name: '',
            email: '',
            password: '',
            phone: '',
            role: 'student',
        });
    };

    const handleAddClick = () => {
        resetForm();
        setShowForm(true);
    };

    // const handleFormSubmit = async () => {
    //     if (!form.name || !form.email) {
    //         alert('Vui lòng điền tên và email');
    //         return;
    //     }

    //     if (formMode === 'create' && !form.password) {
    //         alert('Vui lòng nhập mật khẩu');
    //         return;
    //     }

    //     try {
    //         setSubmitting(true);
    //         if (formMode === 'create') {
    //             await createUser(form);
    //         } else {
    //             const { password, ...rest } = form;
    //             await updateUser(editingId, rest);
    //         }
    //         setShowForm(false);
    //         resetForm();
    //         await loadUsers();
    //     } catch (err) {
    //         console.error(err);
    //         alert(err.message || 'Lỗi khi lưu tài khoản');
    //     } finally {
    //         setSubmitting(false);
    //     }
    // };
    const handleFormSubmit = async () => {
        if (!form.name || !form.email) {
            alert('Vui lòng điền tên và email');
            return;
        }

        // Chỉ bắt buộc mật khẩu khi tạo mới
        if (formMode === 'create' && !form.password) {
            alert('Vui lòng nhập mật khẩu');
            return;
        }

        try {
            setSubmitting(true);

            if (formMode === 'create') {
                // tạo mới: gửi full form
                await createUser(form);
            } else {
                // edit: chỉ gửi password nếu có nhập (đổi mật khẩu)
                const payload = { ...form };
                if (!payload.password) {
                    delete payload.password; // để trống thì không đổi mật khẩu
                }
                await updateUser(editingId, payload);
            }

            setShowForm(false);
            resetForm();
            await loadUsers();
        } catch (err) {
            console.error(err);
            alert(err.message || 'Lỗi khi lưu tài khoản');
        } finally {
            setSubmitting(false);
        }
    };


    const handleEditClick = (user) => {
        setFormMode('edit');
        setEditingId(user.id);
        setForm({
            name: user.name || '',
            email: user.email || '',
            password: user.password || '',
            phone: user.phone || '',
            role: user.role || 'student',
        });
        setShowForm(true);
    };

    const handleDeleteClick = async (user) => {
        const ok = window.confirm(
            `Bạn có chắc muốn xóa tài khoản "${user.name}"?`
        );
        if (!ok) return;

        try {
            await deleteUser(user.id);
            await loadUsers();
        } catch (err) {
            console.error(err);
            alert(err.message || 'Lỗi khi xóa tài khoản');
        }
    };

    // ====== FILTERED LIST ======
    const filteredUsers = users.filter((u) => {
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const phone = u.phone || '';

        const q = search.toLowerCase();
        const matchSearch =
            name.includes(q) || email.includes(q) || phone.includes(search);

        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const getRoleColor = (role) => {
        const colors = {
            student: { bg: '#EFF6FF', text: '#1E40AF', label: 'Học sinh' },
            lecture: { bg: '#F3E8FF', text: '#6B21A8', label: 'Giáo viên' },
            admin: { bg: '#FEE2E2', text: '#991B1B', label: 'Quản trị viên' },
        };
        return colors[role] || colors.student;
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background:
                    'linear-gradient(to bottom right, #F8FAFC, #EFF6FF, #F1F5F9)',
            }}
        >
            {/* HEADER */}
            <header
                style={{
                    background: 'white',
                    borderBottom: '1px solid #E2E8F0',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    backdropFilter: 'blur(4px)',
                }}
            >
                <div
                    style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: '24px 32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                            style={{
                                padding: '10px',
                                background:
                                    'linear-gradient(to bottom right, #2563EB, #1D4ED8)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '28px',
                            }}
                        >
                            👥
                        </div>
                        <div>
                            <h1
                                style={{
                                    fontSize: '30px',
                                    fontWeight: 'bold',
                                    color: '#0F172A',
                                    margin: 0,
                                }}
                            >
                                Quản lý Người dùng
                            </h1>
                            <p
                                style={{
                                    fontSize: '14px',
                                    color: '#64748B',
                                    margin: '4px 0 0 0',
                                }}
                            >
                                Quản lý tài khoản hệ thống LMS
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleAddClick}
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: loading
                                ? '#94A3B8'
                                : 'linear-gradient(to right, #2563EB, #1D4ED8)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            opacity: loading ? 0.5 : 1,
                        }}
                    >
                        ➕ Thêm tài khoản
                    </button>
                </div>
            </header>

            {/* MAIN */}
            <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '32px' }}>
                {/* SEARCH + FILTER */}
                <div
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #E2E8F0',
                        padding: '24px',
                        marginBottom: '24px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <span
                                style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '12px',
                                    fontSize: '20px',
                                }}
                            >
                                🔍
                            </span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    paddingLeft: '44px',
                                    paddingRight: '16px',
                                    paddingTop: '12px',
                                    paddingBottom: '12px',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    background: loading ? '#F8FAFC' : 'white',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>⚙️</span>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                disabled={loading}
                                style={{
                                    padding: '10px 16px',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#1E293B',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    background: loading ? '#F8FAFC' : 'white',
                                    opacity: loading ? 0.5 : 1,
                                }}
                            >
                                <option value="all">Tất cả vai trò</option>
                                <option value="student">Học sinh</option>
                                <option value="lecture">Giáo viên</option>
                                <option value="admin">Quản trị viên</option>
                            </select>
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '14px',
                                color: '#475569',
                                fontWeight: '500',
                                margin: 0,
                            }}
                        >
                            📊 Tìm thấy{' '}
                            <span
                                style={{
                                    color: '#2563EB',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                }}
                            >
                                {filteredUsers.length}
                            </span>{' '}
                            tài khoản
                        </p>
                        {filteredUsers.length > 0 && (
                            <p
                                style={{
                                    fontSize: '12px',
                                    color: '#64748B',
                                    margin: 0,
                                }}
                            >
                                Hiển thị {Math.min(filteredUsers.length, 50)} trên{' '}
                                {filteredUsers.length}
                            </p>
                        )}
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <div
                        style={{
                            background: '#FEE2E2',
                            border: '1px solid #FECACA',
                            color: '#991B1B',
                            padding: '16px 24px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>⚠️</span>
                        <p style={{ fontWeight: '500', margin: 0 }}>{error}</p>
                    </div>
                )}

                {/* MODAL FORM */}
                {showForm && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 50,
                            padding: '16px',
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
                                width: '100%',
                                maxWidth: '448px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                            }}
                        >
                            <div
                                style={{
                                    position: 'sticky',
                                    top: 0,
                                    background:
                                        'linear-gradient(to right, #2563EB, #1D4ED8)',
                                    color: 'white',
                                    padding: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottom: '1px solid #E2E8F0',
                                }}
                            >
                                <h2
                                    style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        margin: 0,
                                    }}
                                >
                                    {formMode === 'create'
                                        ? '➕ Thêm tài khoản mới'
                                        : '✏️ Chỉnh sửa tài khoản'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                    disabled={submitting}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '24px',
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        padding: '4px',
                                        opacity: submitting ? 0.5 : 1,
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div
                                style={{
                                    padding: '24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#1E293B',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        👤 Họ tên <span style={{ color: '#DC2626' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({ ...form, name: e.target.value })
                                        }
                                        placeholder="Nhập họ tên"
                                        disabled={submitting}
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            border: '1px solid #CBD5E1',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            outline: 'none',
                                            background: submitting ? '#F8FAFC' : 'white',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#1E293B',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        📧 Email <span style={{ color: '#DC2626' }}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({ ...form, email: e.target.value })
                                        }
                                        placeholder="example@email.com"
                                        disabled={submitting}
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            border: '1px solid #CBD5E1',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            outline: 'none',
                                            background: submitting ? '#F8FAFC' : 'white',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#1E293B',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        🔐 Mật khẩu{' '}
                                        {formMode === 'create' ? (
                                            <span style={{ color: '#DC2626' }}>*</span>
                                        ) : (
                                            <span
                                                style={{
                                                    fontSize: '12px',
                                                    color: '#6B7280',
                                                    fontWeight: '400',
                                                    marginLeft: '4px',
                                                }}
                                            >
                                                (để trống nếu không đổi)
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({ ...form, password: e.target.value })
                                        }
                                        placeholder={
                                            formMode === 'create'
                                                ? 'Nhập mật khẩu'
                                                : 'Nhập mật khẩu mới (tùy chọn)'
                                        }
                                        disabled={submitting}
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            border: '1px solid #CBD5E1',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            outline: 'none',
                                            background: submitting ? '#F8FAFC' : 'white',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>


                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#1E293B',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        📱 Số điện thoại
                                    </label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(e) =>
                                            setForm({ ...form, phone: e.target.value })
                                        }
                                        placeholder="0901234567"
                                        disabled={submitting}
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            border: '1px solid #CBD5E1',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            outline: 'none',
                                            background: submitting ? '#F8FAFC' : 'white',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#1E293B',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        🎯 Vai trò <span style={{ color: '#DC2626' }}>*</span>
                                    </label>
                                    <select
                                        value={form.role}
                                        onChange={(e) =>
                                            setForm({ ...form, role: e.target.value })
                                        }
                                        disabled={submitting}
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            border: '1px solid #CBD5E1',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            outline: 'none',
                                            background: submitting ? '#F8FAFC' : 'white',
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        <option value="student">👨‍🎓 Học sinh</option>
                                        <option value="lecture">👨‍🏫 Giáo viên</option>
                                        <option value="admin">👨‍💼 Quản trị viên</option>
                                    </select>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        paddingTop: '16px',
                                    }}
                                >
                                    <button
                                        onClick={handleFormSubmit}
                                        disabled={submitting}
                                        style={{
                                            flex: 1,
                                            background: submitting
                                                ? '#94A3B8'
                                                : 'linear-gradient(to right, #16A34A, #15803D)',
                                            color: 'white',
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            cursor: submitting ? 'not-allowed' : 'pointer',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            opacity: submitting ? 0.5 : 1,
                                        }}
                                    >
                                        {submitting
                                            ? '⏳ Đang lưu...'
                                            : formMode === 'create'
                                                ? '✓ Tạo mới'
                                                : '✓ Lưu thay đổi'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            resetForm();
                                        }}
                                        disabled={submitting}
                                        style={{
                                            flex: 1,
                                            background: '#E2E8F0',
                                            color: '#1E293B',
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            cursor: submitting ? 'not-allowed' : 'pointer',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            opacity: submitting ? 0.5 : 1,
                                        }}
                                    >
                                        ✕ Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TABLE */}
                <div
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden',
                    }}
                >
                    {loading ? (
                        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                            <div
                                style={{
                                    fontSize: '48px',
                                    animation: 'spin 1s linear infinite',
                                    marginBottom: '16px',
                                    display: 'inline-block',
                                }}
                            >
                                ⏳
                            </div>
                            <p
                                style={{
                                    color: '#64748B',
                                    fontWeight: '600',
                                    fontSize: '18px',
                                    margin: 0,
                                }}
                            >
                                Đang tải danh sách...
                            </p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '60px', marginBottom: '16px' }}>
                                📭
                            </div>
                            <p
                                style={{
                                    color: '#64748B',
                                    fontWeight: '600',
                                    fontSize: '18px',
                                    margin: 0,
                                }}
                            >
                                Không có tài khoản nào
                            </p>
                            <p
                                style={{
                                    color: '#94A3B8',
                                    fontSize: '14px',
                                    marginTop: '8px',
                                }}
                            >
                                Bắt đầu bằng cách thêm tài khoản mới
                            </p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table
                                style={{ width: '100%', borderCollapse: 'collapse' }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            background:
                                                'linear-gradient(to right, #F1F5F9, #F8FAFC)',
                                            borderBottom: '2px solid #E2E8F0',
                                        }}
                                    >
                                        <th style={thStyle}>Mã</th>
                                        <th style={thStyle}>Họ tên</th>
                                        <th style={thStyle}>Email</th>
                                        <th style={thStyle}>Số ĐT</th>
                                        <th style={thStyle}>Vai trò</th>
                                        <th style={thStyle}>Ngày tạo</th>
                                        <th style={{ ...thStyle, textAlign: 'center' }}>
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, idx) => {
                                        const roleColor = getRoleColor(user.role);
                                        const baseBg = idx % 2 === 0 ? 'white' : '#F8FAFC';
                                        return (
                                            <tr
                                                key={user.id}
                                                style={{
                                                    borderBottom: '1px solid #E2E8F0',
                                                    background: baseBg,
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.background = '#EFF6FF')
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.background = baseBg)
                                                }
                                            >
                                                <td style={tdStyleBold}>
                                                    #{String(user.id).padStart(3, '0')}
                                                </td>
                                                <td style={tdStyleName}>{user.name}</td>
                                                <td style={tdStyle}>{user.email}</td>
                                                <td style={tdStyleStrong}>{user.phone}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            padding: '6px 12px',
                                                            borderRadius: '9999px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            background: roleColor.bg,
                                                            color: roleColor.text,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                width: '8px',
                                                                height: '8px',
                                                                borderRadius: '50%',
                                                                background: roleColor.text,
                                                            }}
                                                        />
                                                        {roleColor.label}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    {user.created_at
                                                        ? new Date(
                                                            user.created_at
                                                        ).toLocaleDateString('vi-VN', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                        })
                                                        : '-'}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '16px 24px',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px',
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() => handleEditClick(user)}
                                                            disabled={loading}
                                                            style={{
                                                                padding: '10px',
                                                                color: '#B45309',
                                                                background: '#FEF3C7',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                cursor: loading
                                                                    ? 'not-allowed'
                                                                    : 'pointer',
                                                                fontSize: '18px',
                                                                opacity: loading ? 0.5 : 1,
                                                            }}
                                                            onMouseEnter={(e) =>
                                                            (e.currentTarget.style.background =
                                                                '#FCD34D')
                                                            }
                                                            onMouseLeave={(e) =>
                                                            (e.currentTarget.style.background =
                                                                '#FEF3C7')
                                                            }
                                                            title="Chỉnh sửa"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(user)}
                                                            disabled={loading}
                                                            style={{
                                                                padding: '10px',
                                                                color: '#DC2626',
                                                                background: '#FEE2E2',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                cursor: loading
                                                                    ? 'not-allowed'
                                                                    : 'pointer',
                                                                fontSize: '18px',
                                                                opacity: loading ? 0.5 : 1,
                                                            }}
                                                            onMouseEnter={(e) =>
                                                            (e.currentTarget.style.background =
                                                                '#FECACA')
                                                            }
                                                            onMouseLeave={(e) =>
                                                            (e.currentTarget.style.background =
                                                                '#FEE2E2')
                                                            }
                                                            title="Xóa"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div
                        style={{
                            background:
                                'linear-gradient(to right, #F1F5F9, #EFF6FF)',
                            borderTop: '2px solid #E2E8F0',
                            padding: '16px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '14px',
                                color: '#475569',
                                fontWeight: 'bold',
                                margin: 0,
                            }}
                        >
                            📋 Tổng cộng:{' '}
                            <span
                                style={{
                                    color: '#2563EB',
                                    fontSize: '16px',
                                }}
                            >
                                {filteredUsers.length}
                            </span>{' '}
                            tài khoản
                        </p>
                        {filteredUsers.length > 0 && (
                            <span
                                style={{
                                    fontSize: '12px',
                                    background: '#DBEAFE',
                                    color: '#1E40AF',
                                    padding: '6px 12px',
                                    borderRadius: '9999px',
                                    fontWeight: '600',
                                }}
                            >
                                Cập nhật lần cuối
                            </span>
                        )}
                    </div>
                </div>
            </main>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

const thStyle = {
    padding: '16px 24px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const tdStyle = {
    padding: '16px 24px',
    fontSize: '14px',
    color: '#64748B',
};

const tdStyleBold = {
    ...tdStyle,
    fontWeight: 'bold',
};

const tdStyleName = {
    ...tdStyle,
    fontWeight: '600',
    color: '#0F172A',
};

const tdStyleStrong = {
    ...tdStyle,
    fontWeight: '500',
};
