import { useState, useEffect } from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import UserManagement from "./pages/UserManagement";
import CourseManagement from "./pages/CourseManagement";

function App() {
  const [admin, setAdmin] = useState(null);
  const [tab, setTab] = useState("users");
  const [page, setPage] = useState("login"); // ← QUAN TRỌNG

  useEffect(() => {
    const saved = localStorage.getItem("admin");
    if (saved) setAdmin(JSON.parse(saved));
  }, []);

  // -------------------------
  // Nếu chưa đăng nhập admin
  // -------------------------
  if (!admin) {
    return (
      <>
        {page === "login" && (
          <AdminLogin
            onLogin={setAdmin}
            goRegister={() => setPage("register")}
          />
        )}

        {page === "register" && (
          <AdminRegister goLogin={() => setPage("login")} />
        )}
      </>
    );
  }

  // -------------------------
  // Đăng xuất
  // -------------------------
  function logout() {
    localStorage.removeItem("admin");
    setAdmin(null);
    setPage("login");
  }

  return (
    <div>
      <header
        style={{
          padding: 16,
          borderBottom: "1px solid #ccc",
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <button onClick={() => setTab("users")}>👥 Người dùng</button>
          <button onClick={() => setTab("courses")} style={{ marginLeft: 10 }}>
            📘 Khóa học
          </button>
        </div>

        <button
          style={{
            background: "#DC2626",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: 8,
          }}
          onClick={logout}
        >
          Đăng xuất
        </button>
      </header>

      {tab === "users" && <UserManagement />}
      {tab === "courses" && <CourseManagement />}
    </div>
  );
}

export default App;
