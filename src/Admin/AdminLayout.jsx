import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";

const NAV_ITEMS = [
  { path: "/admin/stats", icon: "📊", label: "Thống kê hệ thống" },
  { path: "/admin/complexes", icon: "🏟️", label: "Quản lý khu" },
  { path: "/admin/discount", icon: "🏷️", label: "Chiết khấu" },
  { path: "/admin/notify", icon: "📣", label: "Gửi thông báo" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("pb_user") || "{}");
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("pb_token");
    localStorage.removeItem("pb_user");
    navigate("/login");
  };

  const pageLabel = NAV_ITEMS.find(n => location.pathname.startsWith(n.path))?.label || "Admin";

  return (
    <div style={S.layout}>
      {/* SIDEBAR */}
      <aside style={{ ...S.sidebar, ...(collapsed ? S.sidebarCollapsed : {}) }}>
        <div style={S.sidebarLogo}>
          <div style={S.logoIcon}>🏓</div>
          {!collapsed && <span style={S.logoTxt}>PickleZone</span>}
        </div>
        {!collapsed && <p style={S.navGroup}>QUẢN TRỊ HỆ THỐNG</p>}
        <nav style={S.sidebarNav}>
          {NAV_ITEMS.map(item => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
                <div style={{ ...S.navItem, ...(active ? S.navItemActive : {}) }}>
                  <span style={S.navIcon}>{item.icon}</span>
                  {!collapsed && <span style={S.navLabel}>{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
        <div style={S.sidebarUser}>
          <div style={S.userAv}>{user.fullName?.[0] || "A"}</div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.fullName || "Admin"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Quản trị viên</div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div style={S.main}>
        <header style={S.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setCollapsed(!collapsed)} style={S.menuBtn}>
              {collapsed ? "▶" : "◀"}
            </button>
            <div>
              <h1 style={S.pageTitle}>{pageLabel}</h1>
              <p style={S.breadcrumb}>Admin / {pageLabel}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={S.logoutBtn}>Đăng xuất</button>
        </header>
        <div style={S.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const S = {
  layout: { display: "flex", height: "100vh", background: "#080c17", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "#fff", overflow: "hidden" },
  sidebar: { width: 240, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", transition: "width 0.25s", flexShrink: 0, overflow: "hidden" },
  sidebarCollapsed: { width: 64 },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 12, padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 },
  logoIcon: { fontSize: 22, background: "linear-gradient(135deg,#00c864,#00a0e9)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoTxt: { fontSize: 16, fontWeight: 800, background: "linear-gradient(90deg,#00c864,#00a0e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap" },
  navGroup: { fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", padding: "14px 16px 4px", margin: 0 },
  sidebarNav: { flex: 1, padding: "8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" },
  navItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, cursor: "pointer", transition: "all 0.15s" },
  navItemActive: { background: "rgba(0,200,100,0.12)", border: "1px solid rgba(0,200,100,0.2)" },
  navIcon: { fontSize: 18, flexShrink: 0, width: 20, textAlign: "center" },
  navLabel: { fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap" },
  sidebarUser: { display: "flex", alignItems: "center", gap: 10, padding: "14px 12px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 },
  userAv: { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#ff8800,#ff4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: 68, background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 },
  menuBtn: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 12 },
  pageTitle: { fontSize: 20, fontWeight: 800, margin: 0, color: "#fff" },
  breadcrumb: { fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" },
  logoutBtn: { padding: "8px 16px", background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.2)", borderRadius: 10, color: "#ff6b6b", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  content: { flex: 1, overflowY: "auto", padding: "28px" },
};
