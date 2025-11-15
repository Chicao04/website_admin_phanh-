import { useState } from "react";
import { registerAdmin } from "../api";

export default function AdminRegister({ goLogin }) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    async function handleRegister(e) {
        e.preventDefault();
        try {
            setLoading(true);

            await registerAdmin({
                ...form,
                role: "admin",
            });

            alert("✅ Tạo admin thành công!");
            window.location.href = "/admin-login";
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.logoIcon}>👨‍💼</div>
                    <h1 style={styles.title}>Tạo tài khoản Admin</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Họ tên</label>
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Nhập họ tên"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="Nhập email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Số điện thoại</label>
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Nhập số điện thoại"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Mật khẩu</label>
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>

                    <button style={styles.submitBtn} type="submit" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Đăng ký"}
                    </button>
                </form>

                {/* Login Link */}
                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Đã có tài khoản?
                        <span
                            onClick={goLogin}
                            style={styles.link}
                        >
                            {" "}Quay lại đăng nhập
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #e0f2fe, #eef2ff)",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
    },

    container: {
        width: "100%",
        maxWidth: "450px",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
        padding: "40px",
    },

    header: {
        textAlign: "center",
        marginBottom: "32px",
    },

    logoIcon: {
        fontSize: "48px",
        marginBottom: "16px",
        display: "block",
    },

    title: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#1F2937",
        margin: "0",
        letterSpacing: "-0.5px",
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        marginBottom: "24px",
    },

    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },

    label: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#374151",
        paddingLeft: "2px",
    },

    input: {
        width: "100%",
        padding: "12px 14px",
        fontSize: "15px",
        border: "1.5px solid #D1D5DB",
        borderRadius: "8px",
        outline: "none",
        background: "#FFFFFF",
        boxSizing: "border-box",
        transition: "all 0.2s ease",
    },

    submitBtn: {
        width: "100%",
        padding: "12px 0",
        fontSize: "15px",
        fontWeight: "600",
        color: "white",
        background: "#16A34A",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        marginTop: "8px",
    },

    footer: {
        textAlign: "center",
        paddingTop: "24px",
        borderTop: "1px solid #E5E7EB",
    },

    footerText: {
        fontSize: "14px",
        color: "#6B7280",
        margin: "0",
    },

    link: {
        color: "#4F46E5",
        fontWeight: "600",
        cursor: "pointer",
        transition: "color 0.2s ease",
    },
};