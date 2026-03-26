import React, { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/admin/courts", icon: "🏸", label: "Quản lý sân", badge: null },
  { path: "/admin/adminreport", icon: "📊", label: "Báo cáo & Thống kê", badge: "Mới" },
  { path: "/admin/bookings", icon: "📅", label: "Lịch đặt sân", badge: 12 },
  { path: "/admin/adminregistration", icon: "", label: "Đơn đăng ký khu", badge: null }
];

const NOTIFICATIONS = [
  { id: 1, msg: "Đơn đặt mới: Sân số 3 - 15:00 hôm nay", time: "2 phút trước", read: false },
  { id: 2, msg: "Khách hủy lịch: Sân số 1 - 09:00 ngày mai", time: "15 phút trước", read: false },
  { id: 3, msg: "Bảo trì sân số 5 hoàn tất", time: "1 giờ trước", read: true },
  { id: 4, msg: "Doanh thu hôm nay đạt 4.2 triệu đồng", time: "3 giờ trước", read: true },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("pb_user") || "{}");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFICATIONS);

  const unread = notifs.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem("pb_token");
    localStorage.removeItem("pb_user");
    navigate("/login");
  };

  const markRead = (id) => setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, read: true })));

  const getPageTitle = () => {
    const item = NAV_ITEMS.find(n => location.pathname.startsWith(n.path));
    return item ? item.label : "Dashboard";
  };

  return (
    <div style={S.layout}>
      {/* SIDEBAR */}
      <aside style={{ ...S.sidebar, ...(!sidebarOpen ? S.sidebarCollapsed : {}) }}>
        {/* Logo */}
        <div style={S.sidebarLogo}>
          <div style={S.logoIcon}>🏓</div>
          {sidebarOpen && <span style={S.logoTxt}>PickleZone</span>}
        </div>

        {/* Nav */}
        <nav style={S.sidebarNav}>
          {sidebarOpen && <p style={S.navGroup}>QUẢN LÝ</p>}
          {NAV_ITEMS.map(item => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
                <div style={{ ...S.navItem, ...(active ? S.navItemActive : {}) }}>
                  <span style={S.navIcon}>{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span style={S.navLabel}>{item.label}</span>
                      {item.badge && (
                        <span style={{
                          ...S.badge,
                          background: typeof item.badge === "number" ? "rgba(0,200,100,0.2)" : "rgba(0,120,255,0.2)",
                          color: typeof item.badge === "number" ? "#00c864" : "#00a0e9"
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={S.sidebarUser}>
          <div style={S.userAv}>{user.name?.[0] || "S"}</div>
          {sidebarOpen && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name || "Staff"}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{user.email || "staff@picklezone.vn"}</div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div style={S.main}>
        {/* TOPBAR */}
        <header style={S.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={S.menuBtn}>
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <div>
              <h1 style={S.pageTitle}>{getPageTitle()}</h1>
              <p style={S.pageBreadcrumb}>Dashboard / {getPageTitle()}</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          
            {/* Notification bell */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowNotif(!showNotif)} style={S.notifBtn}>
                🔔
                {unread > 0 && <span style={S.notifBadge}>{unread}</span>}
              </button>
              {showNotif && (
                <div style={S.notifDropdown}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Thông báo</span>
                    <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#00c864" }}>Đọc tất cả</button>
                  </div>
                  {notifs.map(n => (
                    <div key={n.id} onClick={() => markRead(n.id)}
                      style={{ ...S.notifItem, ...(!n.read ? S.notifUnread : {}) }}>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.4, marginBottom: 4 }}>{n.msg}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleLogout} style={S.logoutBtn}>Đăng xuất</button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={S.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const S = {
  layout: { display: "flex", height: "100vh", background: "#080c17", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "#fff", overflow: "hidden" },
  sidebar: { width: 240, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 0, transition: "width 0.25s", flexShrink: 0, overflow: "hidden" },
  sidebarCollapsed: { width: 64 },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 12, padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 },
  logoIcon: { fontSize: 22, background: "linear-gradient(135deg,#00c864,#00a0e9)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoTxt: { fontSize: 16, fontWeight: 800, background: "linear-gradient(90deg,#00c864,#00a0e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap" },
  sidebarNav: { flex: 1, padding: "14px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" },
  navGroup: { fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", padding: "4px 10px", margin: "8px 0 4px" },
  navItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, cursor: "pointer", transition: "all 0.15s" },
  navItemActive: { background: "rgba(0,200,100,0.12)", border: "1px solid rgba(0,200,100,0.2)" },
  navIcon: { fontSize: 18, flexShrink: 0, width: 20, textAlign: "center" },
  navLabel: { fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.75)", flex: 1, whiteSpace: "nowrap" },
  badge: { padding: "2px 7px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  sidebarUser: { display: "flex", alignItems: "center", gap: 10, padding: "14px 12px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 },
  userAv: { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#00c864,#00a0e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: 68, background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 },
  menuBtn: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 12 },
  pageTitle: { fontSize: 20, fontWeight: 800, margin: 0, color: "#fff" },
  pageBreadcrumb: { fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" },
  quickStats: { display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "8px 16px", border: "1px solid rgba(255,255,255,0.08)" },
  qStat: { display: "flex", flexDirection: "column", gap: 1, alignItems: "center" },
  qLabel: { fontSize: 10, color: "rgba(255,255,255,0.4)" },
  qDivider: { width: 1, height: 28, background: "rgba(255,255,255,0.1)" },
  notifBtn: { position: "relative", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontSize: 17, color: "rgba(255,255,255,0.8)" },
  notifBadge: { position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: "#ff4444", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  notifDropdown: { position: "absolute", top: "calc(100% + 10px)", right: 0, width: 320, background: "#141826", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,0.5)", zIndex: 1000, overflow: "hidden" },
  notifItem: { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" },
  notifUnread: { background: "rgba(0,200,100,0.06)" },
  logoutBtn: { padding: "8px 16px", background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.2)", borderRadius: 10, color: "#ff6b6b", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  content: { flex: 1, overflowY: "auto", padding: "28px" },
};