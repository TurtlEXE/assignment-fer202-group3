import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const COURTS = [
  { id:1, name:"Sân Pickleball Thủ Đức Sport", address:"123 Võ Văn Ngân, Thủ Đức, TP.HCM", area:"Thủ Đức", price:120000, rating:4.8, reviews:128, courts:6, surface:"Sàn nhựa PVC", lighting:true, parking:true, shower:true, status:"available", image:"🏟️", tags:["Có mái che","Sân trong nhà"], openTime:"06:00", closeTime:"22:00" },
  { id:2, name:"PicklePark Quận 7", address:"45 Nguyễn Thị Thập, Quận 7, TP.HCM", area:"Quận 7", price:150000, rating:4.9, reviews:215, courts:8, surface:"Acrylic", lighting:true, parking:true, shower:true, status:"available", image:"⚡", tags:["Tiêu chuẩn QT","VIP"], openTime:"05:30", closeTime:"23:00" },
  { id:3, name:"Green Court Bình Thạnh", address:"78 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM", area:"Bình Thạnh", price:100000, rating:4.5, reviews:89, courts:4, surface:"Sàn nhựa PVC", lighting:true, parking:false, shower:false, status:"available", image:"🌿", tags:["Ngoài trời","Giá rẻ"], openTime:"06:00", closeTime:"21:00" },
  { id:4, name:"VIP Pickle Phú Nhuận", address:"12 Hoàng Văn Thụ, Phú Nhuận, TP.HCM", area:"Phú Nhuận", price:180000, rating:4.7, reviews:156, courts:5, surface:"Sàn gỗ", lighting:true, parking:true, shower:true, status:"busy", image:"🏆", tags:["Cao cấp","Có HLV"], openTime:"06:00", closeTime:"22:00" },
  { id:5, name:"Sunrise Pickle Gò Vấp", address:"234 Quang Trung, Gò Vấp, TP.HCM", area:"Gò Vấp", price:90000, rating:4.3, reviews:64, courts:3, surface:"Sàn nhựa PVC", lighting:false, parking:true, shower:false, status:"available", image:"🌅", tags:["Ngoài trời","Ban ngày"], openTime:"06:00", closeTime:"18:00" },
  { id:6, name:"Elite Court Tân Bình", address:"56 Trường Chinh, Tân Bình, TP.HCM", area:"Tân Bình", price:130000, rating:4.6, reviews:102, courts:6, surface:"Acrylic", lighting:true, parking:true, shower:true, status:"available", image:"🎯", tags:["Thi đấu","Giải đấu"], openTime:"06:00", closeTime:"22:00" },
  { id:7, name:"FunPlay Pickle Bình Tân", address:"89 Kinh Dương Vương, Bình Tân, TP.HCM", area:"Bình Tân", price:80000, rating:4.2, reviews:47, courts:4, surface:"Sàn nhựa PVC", lighting:true, parking:false, shower:false, status:"available", image:"🎮", tags:["Giá rẻ","Gia đình"], openTime:"07:00", closeTime:"21:00" },
  { id:8, name:"CloudCourt Quận 12", address:"167 Lê Văn Khương, Quận 12, TP.HCM", area:"Quận 12", price:110000, rating:4.4, reviews:73, courts:5, surface:"Sàn nhựa PVC", lighting:true, parking:true, shower:true, status:"maintenance", image:"☁️", tags:["Trong nhà","Điều hòa"], openTime:"06:00", closeTime:"22:00" },
  { id:9, name:"Dragon Pickle Quận 1", address:"34 Lý Tự Trọng, Quận 1, TP.HCM", area:"Quận 1", price:200000, rating:5.0, reviews:312, courts:10, surface:"Sàn gỗ", lighting:true, parking:true, shower:true, status:"available", image:"🐉", tags:["Premium","Trung tâm"], openTime:"05:00", closeTime:"24:00" },
  { id:10, name:"ActiveZone Nhà Bè", address:"22 Huỳnh Tấn Phát, Nhà Bè, TP.HCM", area:"Nhà Bè", price:85000, rating:4.1, reviews:38, courts:3, surface:"Acrylic", lighting:false, parking:true, shower:false, status:"available", image:"🌊", tags:["Ngoài trời","Mát mẻ"], openTime:"06:30", closeTime:"20:00" },
  { id:11, name:"SportHub Quận 3", address:"78 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM", area:"Quận 3", price:160000, rating:4.7, reviews:189, courts:7, surface:"Sàn gỗ", lighting:true, parking:true, shower:true, status:"available", image:"🏙️", tags:["Cao cấp","Trung tâm"], openTime:"06:00", closeTime:"22:00" },
  { id:12, name:"ProCourt Thủ Thiêm", address:"15 Thủ Thiêm, TP. Thủ Đức, TP.HCM", area:"Thủ Đức", price:170000, rating:4.9, reviews:241, courts:9, surface:"Acrylic", lighting:true, parking:true, shower:true, status:"available", image:"🌟", tags:["Mới","Tiêu chuẩn QT"], openTime:"06:00", closeTime:"23:00" },
];

const AREAS = ["Tất cả","Thủ Đức","Quận 7","Bình Thạnh","Phú Nhuận","Gò Vấp","Tân Bình","Bình Tân","Quận 12","Quận 1","Nhà Bè","Quận 3"];
const STATUS_MAP = {
  available:{label:"Còn sân",color:"#00c864",bg:"rgba(0,200,100,0.12)"},
  busy:{label:"Hết sân",color:"#ff8800",bg:"rgba(255,136,0,0.12)"},
  maintenance:{label:"Bảo trì",color:"#888",bg:"rgba(136,136,136,0.12)"},
};

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("pb_user")||"{}");
  const [area, setArea]     = useState("Tất cả");
  const [sort, setSort]     = useState("rating");
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("pb_token");
    localStorage.removeItem("pb_user");
    navigate("/login");
  };

  let list = COURTS.filter(c => {
    if (area !== "Tất cả" && c.area !== area) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.address.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  if (sort==="rating")     list.sort((a,b)=>b.rating-a.rating);
  if (sort==="price_asc")  list.sort((a,b)=>a.price-b.price);
  if (sort==="price_desc") list.sort((a,b)=>b.price-a.price);
  if (sort==="reviews")    list.sort((a,b)=>b.reviews-a.reviews);

  return (
    <div style={S.page}>
      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navWrap}>
          <div style={S.logo}><span style={{fontSize:22}}>🏓</span><span style={S.logoTxt}>PickleZone</span></div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={S.chip}>
              <div style={S.chipAv}>{user.name?.[0]||"U"}</div>
              <span style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)"}}>{user.name||"Người dùng"}</span>
            </div>
            <button onClick={handleLogout} style={S.logoutBtn}>Đăng xuất</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={S.hero}>
        <span style={S.heroBadge}>🏆 Hệ thống đặt sân #1 tại TP.HCM</span>
        <h1 style={S.heroH}>Tìm & Đặt Sân Pickleball<br/><span style={S.heroAcc}>Ngay Hôm Nay</span></h1>
        <p style={S.heroP}>Hơn 120 sân chất lượng cao — đặt chỗ chỉ trong 30 giây</p>
        <div style={S.searchWrap}>
          <span style={S.sIcon}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Tìm theo tên sân, địa chỉ, khu vực..." style={S.sInp}/>
          {search && <button onClick={()=>setSearch("")} style={S.sClear}>✕</button>}
        </div>
        <div style={S.statsRow}>
          {[["120+","Sân hoạt động"],["15","Khu vực"],["8,500+","Lượt đặt"],["4.7★","Đánh giá TB"]].map(([n,l])=>(
            <div key={l} style={S.stat}><span style={S.statN}>{n}</span><span style={S.statL}>{l}</span></div>
          ))}
        </div>
      </section>

      {/* MAIN */}
      <main style={S.main}>
        {/* Area filter */}
        <div style={S.areaScroll}>
          {AREAS.map(a=>(
            <button key={a} onClick={()=>setArea(a)}
              style={{...S.areaBtn,...(area===a?S.areaBtnA:{})}}>{a}</button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={S.toolbar}>
          <span style={{fontSize:14,color:"rgba(255,255,255,0.6)"}}>
            Tìm thấy <b style={{color:"#00c864"}}>{list.length}</b> sân{area!=="Tất cả"&&` tại ${area}`}
          </span>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={S.sortSel}>
            <option value="rating">⭐ Đánh giá cao nhất</option>
            <option value="price_asc">💰 Giá thấp nhất</option>
            <option value="price_desc">💎 Giá cao nhất</option>
            <option value="reviews">💬 Nhiều đánh giá nhất</option>
          </select>
        </div>

        {/* Grid */}
        <div style={S.grid}>
          {list.map(c=>{
            const st = STATUS_MAP[c.status];
            return (
              <div key={c.id} style={S.card} onClick={()=>navigate(`/court/${c.id}`)}>
                <div style={S.cardImg}>
                  <span style={{fontSize:52}}>{c.image}</span>
                  <span style={{...S.stBadge,color:st.color,background:st.bg}}>{st.label}</span>
                  <div style={{position:"absolute",bottom:10,left:12,display:"flex",gap:5,flexWrap:"wrap"}}>
                    {c.tags.slice(0,2).map(t=><span key={t} style={S.tag}>{t}</span>)}
                  </div>
                </div>
                <div style={S.cardBody}>
                  <h3 style={S.cName}>{c.name}</h3>
                  <p style={S.cAddr}>📍 {c.address}</p>
                  <div style={{marginBottom:9}}>
                    <div style={S.cMeta}>🏸 {c.courts} sân &nbsp;•&nbsp; 🕐 {c.openTime}–{c.closeTime}</div>
                    <div style={S.cMeta}>🏋️ {c.surface}</div>
                  </div>
                  <div style={S.amen}>
                    {c.lighting&&<span style={S.amenItem}>💡 Đèn chiếu</span>}
                    {c.parking&&<span style={S.amenItem}>🚗 Đỗ xe</span>}
                    {c.shower&&<span style={S.amenItem}>🚿 Phòng tắm</span>}
                  </div>
                  <div style={S.cardFoot}>
                    <div>
                      <div style={S.price}>
                        {c.price.toLocaleString("vi-VN")}đ
                        <span style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:400}}>/giờ</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                        <span style={{fontSize:12}}>⭐</span>
                        <span style={{fontSize:13,fontWeight:700,color:"#ffcc00"}}>{c.rating}</span>
                        <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>({c.reviews})</span>
                      </div>
                    </div>
                    <button
                      onClick={e=>{e.stopPropagation();navigate(`/booking/${c.id}`);}}
                      style={{...S.bookBtn,...(c.status!=="available"?S.bookDis:{})}}
                      disabled={c.status!=="available"}>
                      {c.status==="available"?"Đặt sân →":c.status==="busy"?"Hết sân":"Bảo trì"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {list.length===0&&(
          <div style={{textAlign:"center",padding:"80px 0"}}>
            <div style={{fontSize:56,marginBottom:14}}>🔍</div>
            <h3 style={{color:"#fff",margin:"0 0 8px"}}>Không tìm thấy sân nào</h3>
            <p style={{color:"rgba(255,255,255,0.5)"}}>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </main>

      <footer style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"26px 24px",textAlign:"center"}}>
        <p style={{color:"rgba(255,255,255,0.3)",fontSize:13,margin:0}}>
          © 2024 PickleZone. Hệ thống đặt sân pickleball hàng đầu Việt Nam.
        </p>
      </footer>
    </div>
  );
}

const S = {
  page:{minHeight:"100vh",background:"#0a0e1a",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#fff"},
  nav:{background:"rgba(10,14,26,0.96)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.08)",position:"sticky",top:0,zIndex:100},
  navWrap:{maxWidth:1280,margin:"0 auto",padding:"0 24px",height:62,display:"flex",alignItems:"center",justifyContent:"space-between"},
  logo:{display:"flex",alignItems:"center",gap:10},
  logoTxt:{fontSize:20,fontWeight:800,background:"linear-gradient(90deg,#00c864,#00a0e9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  chip:{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.06)",borderRadius:20,padding:"6px 14px 6px 6px",border:"1px solid rgba(255,255,255,0.1)"},
  chipAv:{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#00c864,#00a0e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700},
  logoutBtn:{padding:"7px 14px",background:"rgba(255,80,80,0.12)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:8,color:"#ff6b6b",fontSize:13,fontWeight:600,cursor:"pointer"},
  hero:{background:"linear-gradient(180deg,rgba(0,200,100,0.07) 0%,transparent 100%)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"56px 24px 44px",textAlign:"center"},
  heroBadge:{display:"inline-block",background:"rgba(0,200,100,0.12)",border:"1px solid rgba(0,200,100,0.25)",borderRadius:20,padding:"6px 16px",fontSize:13,color:"#00c864",fontWeight:600,marginBottom:16},
  heroH:{fontSize:40,fontWeight:900,letterSpacing:"-1.5px",lineHeight:1.15,margin:"0 0 14px"},
  heroAcc:{background:"linear-gradient(90deg,#00c864,#00d4aa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  heroP:{fontSize:15,color:"rgba(255,255,255,0.6)",margin:"0 auto 24px",maxWidth:480},
  searchWrap:{position:"relative",display:"flex",alignItems:"center",maxWidth:500,margin:"0 auto 24px"},
  sIcon:{position:"absolute",left:16,fontSize:17,pointerEvents:"none"},
  sInp:{width:"100%",padding:"14px 46px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:16,color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box",boxShadow:"0 4px 24px rgba(0,0,0,0.3)"},
  sClear:{position:"absolute",right:14,background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.4)",fontSize:16},
  statsRow:{display:"flex",justifyContent:"center",gap:40},
  stat:{display:"flex",flexDirection:"column",gap:2},
  statN:{fontSize:20,fontWeight:800,color:"#00c864"},
  statL:{fontSize:12,color:"rgba(255,255,255,0.5)"},
  main:{maxWidth:1280,margin:"0 auto",padding:"0 24px 48px"},
  areaScroll:{padding:"22px 0 14px",display:"flex",gap:8,overflowX:"auto",flexWrap:"wrap"},
  areaBtn:{padding:"7px 16px",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,background:"transparent",color:"rgba(255,255,255,0.6)",fontSize:13,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s"},
  areaBtnA:{background:"linear-gradient(135deg,#00c864,#00a0e9)",borderColor:"transparent",color:"#fff",fontWeight:700,boxShadow:"0 4px 12px rgba(0,200,100,0.3)"},
  toolbar:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,padding:"6px 0"},
  sortSel:{padding:"8px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"#fff",fontSize:13,outline:"none",cursor:"pointer"},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:22},
  card:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,overflow:"hidden",cursor:"pointer",transition:"transform 0.15s,box-shadow 0.15s"},
  cardImg:{height:150,background:"linear-gradient(135deg,rgba(0,200,100,0.08),rgba(0,160,233,0.08))",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",borderBottom:"1px solid rgba(255,255,255,0.06)"},
  stBadge:{position:"absolute",top:12,right:12,padding:"4px 10px",borderRadius:20,fontSize:12,fontWeight:700},
  tag:{padding:"3px 8px",background:"rgba(0,200,100,0.15)",borderRadius:12,fontSize:11,color:"#00c864",fontWeight:600},
  cardBody:{padding:"15px 17px"},
  cName:{fontSize:15,fontWeight:700,margin:"0 0 5px",lineHeight:1.3},
  cAddr:{fontSize:12,color:"rgba(255,255,255,0.5)",margin:"0 0 10px"},
  cMeta:{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:3},
  amen:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:13},
  amenItem:{padding:"3px 8px",background:"rgba(255,255,255,0.06)",borderRadius:8,fontSize:11,color:"rgba(255,255,255,0.6)"},
  cardFoot:{display:"flex",alignItems:"flex-end",justifyContent:"space-between"},
  price:{fontSize:17,fontWeight:800,color:"#00c864"},
  bookBtn:{padding:"9px 17px",background:"linear-gradient(135deg,#00c864,#00a0e9)",border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,200,100,0.3)"},
  bookDis:{background:"rgba(255,255,255,0.1)",boxShadow:"none",cursor:"not-allowed",color:"rgba(255,255,255,0.4)"},
};