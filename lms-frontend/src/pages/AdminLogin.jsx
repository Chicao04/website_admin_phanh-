import { useState } from "react";
import { loginAdmin } from "../api";

export default function AdminLogin({ onLogin, goRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);

            const admin = await loginAdmin({ email, password });

            if (admin.role !== "admin") {
                alert("🚫 Tài khoản này không phải quản trị viên!");
                return;
            }

            localStorage.setItem("admin", JSON.stringify(admin));
            onLogin(admin);
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
                    <div style={styles.logoIcon}>🔐</div>
                    <h1 style={styles.title}>Admin Login</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="Nhập email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Mật khẩu</label>
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button style={styles.submitBtn} type="submit" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Đăng nhập"}
                    </button>
                </form>

                {/* Register Link */}
                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Chưa có tài khoản?
                        <span
                            onClick={goRegister}
                            style={styles.link}
                        >
                            {" "}Tạo tài khoản admin
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
        background: "linear-gradient(to right, #eef2ff, #e0f2fe)",
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
        background: "#4F46E5",
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