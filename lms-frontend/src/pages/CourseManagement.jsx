// src/pages/CourseManagement.jsx
import { useEffect, useState } from 'react';
import {
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    fetchUsers,
} from '../api';

export default function CourseManagement() {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [lecturers, setLecturers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
    const [editingId, setEditingId] = useState(null);

    const [courseForm, setCourseForm] = useState({
        course_name: '',
        lecture_id: '',
        semester: '',
        description: '',
    });

    // ===== LOAD DATA =====
    const loadCourses = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await fetchCourses({ search: '' }); // lấy tất cả, search filter ở FE
            setCourses(data || []);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Lỗi tải danh sách khóa học');
        } finally {
            setLoading(false);
        }
    };

    const loadLecturers = async () => {
        try {
            const data = await fetchUsers({ search: '', role: 'lecture' });
            setLecturers(data || []);
        } catch (err) {
            console.error('Error loading lecturers', err);
        }
    };

    useEffect(() => {
        loadCourses();
        loadLecturers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ===== FILTER COURSES (client side) =====
    const filteredCourses = courses.filter((c) => {
        const q = search.toLowerCase();
        const name = (c.course_name || '').toLowerCase();
        const lecturer = (c.lecturer_name || '').toLowerCase();
        const sem = (c.semester || '').toLowerCase();
        return name.includes(q) || lecturer.includes(q) || sem.includes(q);
    });

    // ===== FORM =====
    const resetForm = () => {
        setFormMode('create');
        setEditingId(null);
        setCourseForm({
            course_name: '',
            lecture_id: '',
            semester: '',
            description: '',
        });
    };

    const handleOpenForm = () => {
        resetForm();
        setShowForm(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!courseForm.course_name.trim()) {
            alert('Tên khóa học là bắt buộc');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...courseForm,
                lecture_id: courseForm.lecture_id
                    ? Number(courseForm.lecture_id)
                    : null,
            };

            if (formMode === 'create') {
                await createCourse(payload);
            } else {
                await updateCourse(editingId, payload);
            }

            resetForm();
            setShowForm(false);
            await loadCourses();
        } catch (err) {
            console.error(err);
            alert(err.message || 'Lưu khóa học thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (course) => {
        setFormMode('edit');
        setEditingId(course.id);
        setCourseForm({
            course_name: course.course_name || '',
            lecture_id: course.lecture_id || '',
            semester: course.semester || '',
            description: course.description || '',
        });
        setShowForm(true);
    };

    const handleDeleteClick = async (course) => {
        const ok = window.confirm(
            `Bạn có chắc muốn xóa khóa học "${course.course_name}"?`
        );
        if (!ok) return;

        try {
            await deleteCourse(course.id);
            await loadCourses();
        } catch (err) {
            console.error(err);
            alert(err.message || 'Xóa khóa học thất bại');
        }
    };

    const getSemesterBadge = (semester) => {
        if (!semester) {
            return {
                bg: '#E2E8F0',
                text: '#475569',
                label: 'Chưa đặt',
            };
        }
        return {
            bg: '#ECFEFF',
            text: '#0E7490',
            label: semester,
        };
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background:
                    'linear-gradient(to bottom right, #F8FAFC, #EEF2FF, #E0F2FE)',
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
                                    'linear-gradient(to bottom right, #7C3AED, #4F46E5)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '28px',
                            }}
                        >
                            📚
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
                                Quản lý Khóa học
                            </h1>
                            <p
                                style={{
                                    fontSize: '14px',
                                    color: '#64748B',
                                    margin: '4px 0 0 0',
                                }}
                            >
                                Quản lý môn học, giảng viên và số lượng sinh viên
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleOpenForm}
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: loading
                                ? '#94A3B8'
                                : 'linear-gradient(to right, #7C3AED, #4F46E5)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            opacity: loading ? 0.5 : 1,
                            transition: 'all 0.2s',
                        }}
                    >
                        ➕ Thêm khóa học
                    </button>
                </div>
            </header>

            {/* MAIN */}
            <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '32px' }}>
                {/* SEARCH */}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ position: 'relative' }}>
                            <span
                                style={{
                                    position: 'absolute',
                                    left: 16,
                                    top: 11,
                                    fontSize: 20,
                                }}
                            >
                                🔎
                            </span>
                            <input
                                type="text"
                                placeholder="Tìm theo tên khóa học, giảng viên hoặc học kỳ..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    paddingLeft: 44,
                                    paddingRight: 16,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    borderRadius: 12,
                                    border: '1px solid #CBD5E1',
                                    fontSize: 16,
                                    outline: 'none',
                                    background: loading ? '#F8FAFC' : 'white',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: 8,
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 14,
                                    color: '#475569',
                                    fontWeight: 500,
                                }}
                            >
                                📊 Tìm thấy{' '}
                                <span
                                    style={{
                                        color: '#4F46E5',
                                        fontWeight: 'bold',
                                        fontSize: 16,
                                    }}
                                >
                                    {filteredCourses.length}
                                </span>{' '}
                                khóa học
                            </p>
                            {filteredCourses.length > 0 && (
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 12,
                                        color: '#94A3B8',
                                    }}
                                >
                                    Hiển thị {Math.min(filteredCourses.length, 50)} trên{' '}
                                    {filteredCourses.length}
                                </p>
                            )}
                        </div>
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
                        <span style={{ fontSize: 20 }}>⚠️</span>
                        <p style={{ margin: 0, fontWeight: 500 }}>{error}</p>
                    </div>
                )}

                {/* MODAL FORM THÊM / SỬA KHÓA HỌC */}
                {showForm && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 16,
                            zIndex: 50,
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        <div
                            style={{
                                background: 'white',
                                borderRadius: 16,
                                boxShadow: '0 20px 25px rgba(0,0,0,0.2)',
                                width: '100%',
                                maxWidth: 500,
                                maxHeight: '90vh',
                                overflowY: 'auto',
                            }}
                        >
                            <div
                                style={{
                                    padding: 24,
                                    background:
                                        'linear-gradient(to right, #7C3AED, #4F46E5)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <h2
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                        margin: 0,
                                    }}
                                >
                                    {formMode === 'create'
                                        ? '➕ Thêm khóa học mới'
                                        : '✏️ Chỉnh sửa khóa học'}
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
                                        fontSize: 24,
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        opacity: submitting ? 0.5 : 1,
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} style={{ padding: 24 }}>
                                <div
                                    style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                                >
                                    <div>
                                        <label
                                            style={{
                                                display: 'block',
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: '#1E293B',
                                                marginBottom: 8,
                                            }}
                                        >
                                            📘 Tên khóa học{' '}
                                            <span style={{ color: '#DC2626' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={courseForm.course_name}
                                            onChange={(e) =>
                                                setCourseForm((prev) => ({
                                                    ...prev,
                                                    course_name: e.target.value,
                                                }))
                                            }
                                            placeholder="VD: Lập trình Web căn bản"
                                            disabled={submitting}
                                            style={{
                                                width: '100%',
                                                padding: '10px 16px',
                                                borderRadius: 8,
                                                border: '1px solid #CBD5E1',
                                                fontSize: 16,
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
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: '#1E293B',
                                                marginBottom: 8,
                                            }}
                                        >
                                            👨‍🏫 Giảng viên phụ trách
                                        </label>
                                        <select
                                            value={courseForm.lecture_id}
                                            onChange={(e) =>
                                                setCourseForm((prev) => ({
                                                    ...prev,
                                                    lecture_id: e.target.value,
                                                }))
                                            }
                                            disabled={submitting}
                                            style={{
                                                width: '100%',
                                                padding: '10px 16px',
                                                borderRadius: 8,
                                                border: '1px solid #CBD5E1',
                                                fontSize: 16,
                                                outline: 'none',
                                                background: submitting ? '#F8FAFC' : 'white',
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            <option value="">-- Chọn giảng viên --</option>
                                            {lecturers.map((lec) => (
                                                <option key={lec.id} value={lec.id}>
                                                    {lec.name} ({lec.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            style={{
                                                display: 'block',
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: '#1E293B',
                                                marginBottom: 8,
                                            }}
                                        >
                                            🗓 Học kỳ / Semester
                                        </label>
                                        <input
                                            type="text"
                                            value={courseForm.semester}
                                            onChange={(e) =>
                                                setCourseForm((prev) => ({
                                                    ...prev,
                                                    semester: e.target.value,
                                                }))
                                            }
                                            placeholder="VD: 2025-1"
                                            disabled={submitting}
                                            style={{
                                                width: '100%',
                                                padding: '10px 16px',
                                                borderRadius: 8,
                                                border: '1px solid #CBD5E1',
                                                fontSize: 16,
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
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: '#1E293B',
                                                marginBottom: 8,
                                            }}
                                        >
                                            📝 Mô tả
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={courseForm.description}
                                            onChange={(e) =>
                                                setCourseForm((prev) => ({
                                                    ...prev,
                                                    description: e.target.value,
                                                }))
                                            }
                                            placeholder="Mục tiêu môn học, nội dung chính..."
                                            disabled={submitting}
                                            style={{
                                                width: '100%',
                                                padding: '10px 16px',
                                                borderRadius: 8,
                                                border: '1px solid #CBD5E1',
                                                fontSize: 14,
                                                outline: 'none',
                                                background: submitting ? '#F8FAFC' : 'white',
                                                boxSizing: 'border-box',
                                                resize: 'vertical',
                                            }}
                                        />
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: 12,
                                            paddingTop: 16,
                                        }}
                                    >
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            style={{
                                                flex: 1,
                                                background: submitting
                                                    ? '#94A3B8'
                                                    : 'linear-gradient(to right, #22C55E, #16A34A)',
                                                color: 'white',
                                                padding: '10px 16px',
                                                borderRadius: 8,
                                                border: 'none',
                                                cursor: submitting ? 'not-allowed' : 'pointer',
                                                fontSize: 16,
                                                fontWeight: 600,
                                                opacity: submitting ? 0.5 : 1,
                                            }}
                                        >
                                            {submitting
                                                ? '⏳ Đang lưu...'
                                                : formMode === 'create'
                                                    ? '✓ Tạo khóa học'
                                                    : '✓ Lưu thay đổi'}
                                        </button>
                                        <button
                                            type="button"
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
                                                borderRadius: 8,
                                                border: 'none',
                                                cursor: submitting ? 'not-allowed' : 'pointer',
                                                fontSize: 16,
                                                fontWeight: 600,
                                                opacity: submitting ? 0.5 : 1,
                                            }}
                                        >
                                            ✕ Hủy
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* TABLE COURSES */}
                <div
                    style={{
                        background: 'white',
                        borderRadius: 16,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden',
                    }}
                >
                    {loading ? (
                        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                            <div
                                style={{
                                    fontSize: 48,
                                    animation: 'spin 1s linear infinite',
                                    display: 'inline-block',
                                    marginBottom: 16,
                                }}
                            >
                                ⏳
                            </div>
                            <p
                                style={{
                                    margin: 0,
                                    color: '#64748B',
                                    fontWeight: 600,
                                    fontSize: 18,
                                }}
                            >
                                Đang tải danh sách khóa học...
                            </p>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: 58, marginBottom: 16 }}>📭</div>
                            <p
                                style={{
                                    margin: 0,
                                    color: '#64748B',
                                    fontWeight: 600,
                                    fontSize: 18,
                                }}
                            >
                                Chưa có khóa học nào
                            </p>
                            <p
                                style={{
                                    marginTop: 8,
                                    color: '#94A3B8',
                                    fontSize: 14,
                                }}
                            >
                                Hãy thêm khóa học mới để bắt đầu
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
                                                'linear-gradient(to right, #EEF2FF, #F5F3FF)',
                                            borderBottom: '2px solid #E2E8F0',
                                        }}
                                    >
                                        <th style={thStyle}>Mã</th>
                                        <th style={thStyle}>Tên khóa học</th>
                                        <th style={thStyle}>Giảng viên</th>
                                        <th style={thStyle}>Học kỳ</th>
                                        <th style={thStyle}>Số SV</th>
                                        <th style={thStyle}>Ngày tạo</th>
                                        <th style={{ ...thStyle, textAlign: 'center' }}>
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCourses.map((c, idx) => {
                                        const baseBg = idx % 2 === 0 ? 'white' : '#F9FAFB';
                                        const badge = getSemesterBadge(c.semester);
                                        return (
                                            <tr
                                                key={c.id}
                                                style={{
                                                    borderBottom: '1px solid #E2E8F0',
                                                    background: baseBg,
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.background = '#EEF2FF')
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.background = baseBg)
                                                }
                                            >
                                                <td style={tdStyleBold}>
                                                    #{String(c.id).padStart(3, '0')}
                                                </td>
                                                <td style={tdStyleName}>{c.course_name}</td>
                                                <td style={tdStyle}>
                                                    {c.lecturer_name || (
                                                        <span style={{ color: '#9CA3AF' }}>
                                                            Chưa gán
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            padding: '6px 12px',
                                                            borderRadius: 9999,
                                                            background: badge.bg,
                                                            color: badge.text,
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td style={tdStyleCenter}>
                                                    {c.student_count ?? 0}
                                                </td>
                                                <td style={tdStyle}>
                                                    {c.created_at
                                                        ? new Date(
                                                            c.created_at
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
                                                            onClick={() => handleEditClick(c)}
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
                                                            onClick={() => handleDeleteClick(c)}
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
                            padding: '16px 24px',
                            borderTop: '2px solid #E2E8F0',
                            background:
                                'linear-gradient(to right, #EEF2FF, #E0F2FE)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontSize: 14,
                                color: '#475569',
                                fontWeight: 'bold',
                            }}
                        >
                            📚 Tổng số khóa học:{' '}
                            <span style={{ color: '#4F46E5', fontSize: 16 }}>
                                {filteredCourses.length}
                            </span>
                        </p>
                        {filteredCourses.length > 0 && (
                            <span
                                style={{
                                    fontSize: 12,
                                    background: '#DDD6FE',
                                    color: '#4C1D95',
                                    padding: '6px 12px',
                                    borderRadius: 9999,
                                    fontWeight: 600,
                                }}
                            >
                                Dữ liệu khóa học hiện tại
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
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const tdStyle = {
    padding: '16px 24px',
    fontSize: 14,
    color: '#6B7280',
};

const tdStyleBold = {
    ...tdStyle,
    fontWeight: 700,
    color: '#4B5563',
};

const tdStyleName = {
    ...tdStyle,
    fontWeight: 600,
    color: '#111827',
};

const tdStyleCenter = {
    ...tdStyle,
    textAlign: 'center',
    fontWeight: 600,
};
