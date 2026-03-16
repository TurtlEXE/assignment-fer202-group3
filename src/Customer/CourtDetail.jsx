import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const COURTS = [
  { id:1, name:"Sân Pickleball Thủ Đức Sport", address:"123 Võ Văn Ngân, Thủ Đức, TP.HCM", area:"Thủ Đức", price:120000, rating:4.8, reviews:128, courts:6, surface:"Sàn nhựa PVC", lighting:true, parking:true, shower:true, wifi:true, status:"available", image:"🏟️", tags:["Có mái che","Sân trong nhà"], openTime:"06:00", closeTime:"22:00", phone:"028 1234 5678", description:"Hệ thống sân pickleball hiện đại với 6 sân tiêu chuẩn, sàn nhựa PVC chuyên dụng, đèn chiếu sáng LED hiện đại. Không gian thoáng mát, sạch sẽ với đầy đủ tiện nghi phục vụ người chơi. Thích hợp cho mọi lứa tuổi từ người mới bắt đầu đến vận động viên chuyên nghiệp." },
  { id:2, name:"PicklePark Quận 7", address:"45 Nguyễn Thị Thập, Quận 7, TP.HCM", area:"Quận 7", price:150000, rating:4.9, reviews:215, courts:8, surface:"Acrylic", lighting:true, parking:true, shower:true, wifi:true, status:"available", image:"⚡", tags:["Tiêu chuẩn QT","VIP"], openTime:"05:30", closeTime:"23:00", phone:"028 9876 5432", description:"Cụm 8 sân pickleball đạt chuẩn quốc tế, sàn acrylic cao cấp chống trượt, hệ thống đèn LED 4 chiều chuyên dụng. Khu vực VIP riêng biệt với phòng thay đồ sang trọng, canteen phục vụ đồ uống thể thao." },
  { id:9, name:"Dragon Pickle Quận 1", address:"34 Lý Tự Trọng, Quận 1, TP.HCM", area:"Quận 1", price:200000, rating:5.0, reviews:312, courts:10, surface:"Sàn gỗ", lighting:true, parking:true, shower:true, wifi:true, status:"available", image:"🐉", tags:["Premium","Trung tâm"], openTime:"05:00", closeTime:"24:00", phone:"028 8888 9999", description:"Trung tâm pickleball cao cấp nhất Quận 1 với 10 sân đạt chuẩn thi đấu quốc tế. Sàn gỗ tổng hợp nhập khẩu, hệ thống điều hòa trung tâm, camera an ninh 24/7. Nơi tổ chức các giải đấu lớn tại TP.HCM." },
];

const COMMENTS = [
  { id:1, user:"Nguyễn Văn A", avatar:"A", rating:5, date:"15/01/2024", content:"Sân rất đẹp, nhân viên thân thiện. Sàn nhựa chất lượng tốt, không bị trơn trượt. Sẽ quay lại lần sau!", likes:24, courtUsed:"Sân số 2" },
  { id:2, user:"Trần Thị B", avatar:"T", rating:4, date:"12/01/2024", content:"Không gian sạch sẽ, có đủ tiện nghi. Bãi đỗ xe rộng rãi. Chỉ hơi tiếc là giờ cao điểm khó đặt sân.", likes:18, courtUsed:"Sân số 1" },
  { id:3, user:"Lê Hoàng C", avatar:"L", rating:5, date:"10/01/2024", content:"Đặt sân online rất tiện, không phải chờ đợi. Ánh sáng tốt, chơi buổi tối cũng rõ ràng.", likes:31, courtUsed:"Sân số 4" },
  { id:4, user:"Phạm Quốc D", avatar:"P", rating:3, date:"08/01/2024", content:"Sân ổn nhưng phòng tắm hơi nhỏ. Hy vọng ban quản lý cải thiện thêm khu vực thay đồ.", likes:7, courtUsed:"Sân số 3" },
  { id:5, user:"Hoàng Minh E", avatar:"H", rating:5, date:"05/01/2024", content:"Địa điểm thuận tiện, dễ tìm. Nhân viên hỗ trợ nhiệt tình, giúp tôi (người mới) hiểu luật chơi cơ bản.", likes:42, courtUsed:"Sân số 1" },
  { id:6, user:"Võ Thị F", avatar:"V", rating:4, date:"02/01/2024", content:"Giá hợp lý so với chất lượng. Sân thoáng, mát, có điều hòa. Rất phù hợp cho buổi chơi buổi chiều.", likes:15, courtUsed:"Sân số 5" },
  { id:7, user:"Đặng Văn G", avatar:"Đ", rating:5, date:"29/12/2023", content:"Đã chơi ở nhiều sân tại HCM nhưng đây là sân mình thích nhất. Chất lượng phòng tắm tốt, có máy sấy tóc.", likes:28, courtUsed:"Sân số 2" },
  { id:8, user:"Ngô Thị H", avatar:"N", rating:4, date:"27/12/2023", content:"Đặt online dễ dàng qua app. Tuy nhiên wi-fi hơi chậm. Tổng thể vẫn rất hài lòng với dịch vụ.", likes:11, courtUsed:"Sân số 6" },
  { id:9, user:"Bùi Văn I", avatar:"B", rating:5, date:"24/12/2023", content:"Chơi ở đây đêm Giáng Sinh, không khí vui vẻ. Ban quản lý có trang trí Noel rất đẹp. Ủng hộ!", likes:56, courtUsed:"Sân số 3" },
  { id:10, user:"Dương Thị J", avatar:"D", rating:4, date:"20/12/2023", content:"Sân đẹp, vệ sinh sạch sẽ. Có bán đồ uống và đồ ăn nhẹ tại quầy. Nhạc nền hay, không gian năng động.", likes:19, courtUsed:"Sân số 1" },
];

export default function CourtDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const court = COURTS.find(c => c.id === Number(id)) || COURTS[0];
  const [activeTab, setActiveTab] = useState("info");
  const [newComment, setNewComment] = useState({ rating: 5, content: "" });
  const [comments, setComments] = useState(COMMENTS);
  const [likedIds, setLikedIds] = useState(new Set());

  const handleLike = (cid) => {
    setLikedIds(prev => {
      const s = new Set(prev);
      s.has(cid) ? s.delete(cid) : s.add(cid);
      return s;
    });
    setComments(prev => prev.map(c =>
      c.id === cid ? { ...c, likes: likedIds.has(cid) ? c.likes - 1 : c.likes + 1 } : c
    ));
  };

  const handleSubmitComment = () => {
    if (!newComment.content.trim()) return;
    const nc = {
      id: comments.length + 1,
      user: "Bạn",
      avatar: "B",
      rating: newComment.rating,
      date: new Date().toLocaleDateString("vi-VN"),
      content: newComment.content,
      likes: 0,
      courtUsed: "Sân số 1",
    };
    setComments([nc, ...comments]);
    setNewComment({ rating: 5, content: "" });
  };

  const avgRating = (comments.reduce((s, c) => s + c.rating, 0) / comments.length).toFixed(1);
  const ratingDist = [5,4,3,2,1].map(r => ({
    r, count: comments.filter(c => c.rating === r).length,
    pct: Math.round(comments.filter(c => c.rating === r).length / comments.length * 100)
  }));

  return (
    <div style={S.page}>
      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navWrap}>
          <button onClick={() => navigate("/")} style={S.backBtn}>← Quay lại</button>
          <div style={S.logo}><span>🏓</span><span style={S.logoTxt}>PickleZone</span></div>
          <button onClick={() => navigate(`/booking/${court.id}`)} style={S.navBook}
            disabled={court.status !== "available"}>
            🏸 Đặt sân ngay
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={S.hero}>
        <div style={S.heroEmoji}>{court.image}</div>
        <div style={S.heroContent}>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            {court.tags.map(t=><span key={t} style={S.tag}>{t}</span>)}
            <span style={{...S.statusBadge,
              color:court.status==="available"?"#00c864":court.status==="busy"?"#ff8800":"#888",
              background:court.status==="available"?"rgba(0,200,100,0.12)":court.status==="busy"?"rgba(255,136,0,0.12)":"rgba(136,136,136,0.12)"}}>
              {court.status==="available"?"● Còn sân":court.status==="busy"?"● Hết sân":"● Bảo trì"}
            </span>
          </div>
          <h1 style={S.heroH}>{court.name}</h1>
          <p style={S.heroAddr}>📍 {court.address}</p>
          <div style={S.heroMeta}>
            <div style={S.metaBlock}>
              <span style={S.metaBig}>{court.rating}</span>
              <div>
                <div style={{color:"#ffcc00",fontSize:16}}>{"★".repeat(Math.round(court.rating))}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>{court.reviews} đánh giá</div>
              </div>
            </div>
            <div style={S.metaDivider}/>
            <div style={S.metaBlock}>
              <span style={S.metaBig}>{court.courts}</span>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>Sân thi đấu</div>
            </div>
            <div style={S.metaDivider}/>
            <div style={S.metaBlock}>
              <span style={{...S.metaBig,color:"#00c864"}}>{court.price.toLocaleString("vi-VN")}đ</span>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>mỗi giờ</div>
            </div>
          </div>
        </div>
        <button onClick={()=>navigate(`/booking/${court.id}`)} style={S.heroBook}
          disabled={court.status!=="available"}>
          🏸 Đặt sân ngay →
        </button>
      </div>

      {/* TABS */}
      <div style={S.tabs}>
        {[{v:"info",l:"📋 Thông tin"},  {v:"reviews",l:`💬 Đánh giá (${comments.length})`}].map(t=>(
          <button key={t.v} onClick={()=>setActiveTab(t.v)}
            style={{...S.tab,...(activeTab===t.v?S.tabA:{})}}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={S.content}>
        {/* ── INFO TAB ── */}
        {activeTab==="info" && (
          <div style={S.infoGrid}>
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {/* Description */}
              <div style={S.section}>
                <h3 style={S.sectionH}>Giới thiệu</h3>
                <p style={{fontSize:14,color:"rgba(255,255,255,0.7)",lineHeight:1.8,margin:0}}>{court.description}</p>
              </div>

              {/* Amenities */}
              <div style={S.section}>
                <h3 style={S.sectionH}>Tiện ích & Dịch vụ</h3>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[
                    {icon:"💡",label:"Đèn chiếu sáng LED",ok:court.lighting},
                    {icon:"🚗",label:"Bãi đỗ xe miễn phí",ok:court.parking},
                    {icon:"🚿",label:"Phòng tắm & thay đồ",ok:court.shower},
                    {icon:"📶",label:"WiFi miễn phí",ok:court.wifi},
                    {icon:"🏬",label:"Căn tin & giải khát",ok:true},
                    {icon:"🎯",label:"Cho thuê vợt & bóng",ok:true},
                    {icon:"🏆",label:"Huấn luyện viên",ok:court.price>=150000},
                    {icon:"📹",label:"Camera an ninh 24/7",ok:true},
                  ].map(({icon,label,ok})=>(
                    <div key={label} style={{...S.amenityRow,...(!ok?{opacity:0.4}:{})}}>
                      <span style={{fontSize:18}}>{icon}</span>
                      <span style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>{label}</span>
                      <span style={{marginLeft:"auto",color:ok?"#00c864":"#666",fontWeight:700}}>{ok?"✓":"✗"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Court list */}
              <div style={S.section}>
                <h3 style={S.sectionH}>Danh sách sân ({court.courts} sân)</h3>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {Array.from({length:court.courts},(_,i)=>({
                    num:i+1,
                    status:["available","available","available","busy","available","available"][i]||"available",
                    surface:court.surface,
                  })).map(s=>(
                    <div key={s.num} style={S.courtRow}>
                      <span style={{fontWeight:700,color:"#fff",fontSize:14}}>Sân số {s.num}</span>
                      <span style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>{s.surface}</span>
                      <span style={{
                        padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:700,marginLeft:"auto",
                        color:s.status==="available"?"#00c864":"#ff8800",
                        background:s.status==="available"?"rgba(0,200,100,0.12)":"rgba(255,136,0,0.12)"}}>
                        {s.status==="available"?"Còn trống":"Đang dùng"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={S.sidebar}>
                <h4 style={{margin:"0 0 14px",fontSize:15,fontWeight:700}}>📞 Thông tin liên hệ</h4>
                {[
                  ["Điện thoại",court.phone||"028 1234 5678"],
                  ["Email","booking@picklezone.vn"],
                  ["Giờ mở cửa",`${court.openTime} – ${court.closeTime}`],
                  ["Bề mặt sân",court.surface],
                  ["Số sân",`${court.courts} sân`],
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.06)",alignItems:"center"}}>
                    <span style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>{k}</span>
                    <span style={{fontSize:13,color:"#fff",fontWeight:500,textAlign:"right",maxWidth:180}}>{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>navigate(`/booking/${court.id}`)}
                style={{...S.heroBook,fontSize:15,padding:"14px 20px"}}
                disabled={court.status!=="available"}>
                🏸 Đặt sân ngay →
              </button>
              <div style={{...S.sidebar,background:"rgba(0,200,100,0.06)",border:"1px solid rgba(0,200,100,0.15)"}}>
                <h4 style={{margin:"0 0 12px",fontSize:14,fontWeight:700,color:"#00c864"}}>🎁 Ưu đãi hiện có</h4>
                {["Giảm 10% cho booking từ 2 giờ trở lên","Free 30 phút cho lần đặt đầu tiên","Miễn phí mượn vợt cho nhóm 4 người"].map((o,i)=>(
                  <div key={i} style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginBottom:8,display:"flex",gap:8}}>
                    <span style={{color:"#00c864"}}>•</span>{o}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEWS TAB ── */}
        {activeTab==="reviews" && (
          <div style={{display:"flex",flexDirection:"column",gap:24}}>
            {/* Rating summary */}
            <div style={S.ratingSummary}>
              <div style={S.ratingBig}>
                <span style={{fontSize:52,fontWeight:900,color:"#ffcc00"}}>{avgRating}</span>
                <div style={{color:"#ffcc00",fontSize:22}}>{"★".repeat(Math.round(avgRating))}</div>
                <span style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>{comments.length} đánh giá</span>
              </div>
              <div style={{flex:1}}>
                {ratingDist.map(({r,count,pct})=>(
                  <div key={r} style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                    <span style={{fontSize:12,color:"rgba(255,255,255,0.6)",width:20}}>{r}★</span>
                    <div style={{flex:1,height:8,borderRadius:4,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
                      <div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#ffcc00,#ff8800)",borderRadius:4,transition:"width 0.5s"}}/>
                    </div>
                    <span style={{fontSize:12,color:"rgba(255,255,255,0.5)",width:30}}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Write comment */}
            <div style={S.writeComment}>
              <h4 style={{margin:"0 0 14px",fontSize:15,fontWeight:700}}>✍️ Viết đánh giá của bạn</h4>
              <div style={{display:"flex",gap:6,marginBottom:14}}>
                {[1,2,3,4,5].map(r=>(
                  <button key={r} onClick={()=>setNewComment({...newComment,rating:r})}
                    style={{fontSize:24,background:"none",border:"none",cursor:"pointer",
                      color:r<=newComment.rating?"#ffcc00":"rgba(255,255,255,0.2)",transition:"color 0.15s"}}>
                    ★
                  </button>
                ))}
                <span style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginLeft:8,alignSelf:"center"}}>
                  {["","Rất tệ","Tệ","Bình thường","Tốt","Xuất sắc"][newComment.rating]}
                </span>
              </div>
              <textarea
                value={newComment.content}
                onChange={e=>setNewComment({...newComment,content:e.target.value})}
                placeholder="Chia sẻ trải nghiệm của bạn về sân này..."
                rows={3}
                style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,color:"#fff",fontSize:14,resize:"none",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
              />
              <button onClick={handleSubmitComment}
                style={{marginTop:10,padding:"10px 22px",background:"linear-gradient(135deg,#00c864,#00a0e9)",border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                Gửi đánh giá
              </button>
            </div>

            {/* Comment list */}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {comments.map(c=>(
                <div key={c.id} style={S.commentCard}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#00c864,#00a0e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,flexShrink:0}}>
                      {c.avatar}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontWeight:700,fontSize:14}}>{c.user}</span>
                          <span style={{color:"#ffcc00",fontSize:13}}>{"★".repeat(c.rating)}{"☆".repeat(5-c.rating)}</span>
                        </div>
                        <div style={{display:"flex",gap:10}}>
                          <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{c.courtUsed}</span>
                          <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{c.date}</span>
                        </div>
                      </div>
                      <p style={{fontSize:14,color:"rgba(255,255,255,0.75)",lineHeight:1.6,margin:"0 0 10px"}}>{c.content}</p>
                      <button onClick={()=>handleLike(c.id)}
                        style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"4px 12px",cursor:"pointer",fontSize:12,color:likedIds.has(c.id)?"#ff6b8a":"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",gap:5}}>
                        {likedIds.has(c.id)?"❤️":"🤍"} {c.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page:{minHeight:"100vh",background:"#0a0e1a",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#fff"},
  nav:{background:"rgba(10,14,26,0.96)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.08)",position:"sticky",top:0,zIndex:100},
  navWrap:{maxWidth:1280,margin:"0 auto",padding:"0 24px",height:62,display:"flex",alignItems:"center",justifyContent:"space-between"},
  backBtn:{padding:"8px 16px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"rgba(255,255,255,0.7)",fontSize:14,fontWeight:600,cursor:"pointer"},
  logo:{display:"flex",alignItems:"center",gap:10},
  logoTxt:{fontSize:20,fontWeight:800,background:"linear-gradient(90deg,#00c864,#00a0e9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  navBook:{padding:"9px 18px",background:"linear-gradient(135deg,#00c864,#00a0e9)",border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,200,100,0.3)"},
  hero:{display:"flex",gap:28,padding:"36px 40px",background:"linear-gradient(135deg,rgba(0,200,100,0.06),rgba(0,160,233,0.06))",borderBottom:"1px solid rgba(255,255,255,0.07)",maxWidth:1280,margin:"0 auto",width:"100%",boxSizing:"border-box",flexWrap:"wrap",alignItems:"center"},
  heroEmoji:{fontSize:96,lineHeight:1,flexShrink:0},
  heroContent:{flex:1,minWidth:260},
  tag:{padding:"4px 10px",background:"rgba(0,200,100,0.15)",borderRadius:12,fontSize:12,color:"#00c864",fontWeight:600},
  statusBadge:{padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700},
  heroH:{fontSize:30,fontWeight:900,margin:"0 0 8px",letterSpacing:"-0.5px",lineHeight:1.3},
  heroAddr:{fontSize:14,color:"rgba(255,255,255,0.55)",margin:"0 0 18px"},
  heroMeta:{display:"flex",alignItems:"center",gap:24},
  metaBlock:{display:"flex",alignItems:"center",gap:10},
  metaBig:{fontSize:28,fontWeight:900,color:"#fff"},
  metaDivider:{width:1,height:40,background:"rgba(255,255,255,0.1)"},
  heroBook:{padding:"14px 28px",background:"linear-gradient(135deg,#00c864,#00a0e9)",border:"none",borderRadius:16,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 8px 24px rgba(0,200,100,0.35)",whiteSpace:"nowrap",alignSelf:"flex-start"},
  tabs:{maxWidth:1280,margin:"0 auto",padding:"0 40px",display:"flex",gap:4,borderBottom:"1px solid rgba(255,255,255,0.08)"},
  tab:{padding:"16px 20px",background:"none",border:"none",color:"rgba(255,255,255,0.5)",fontSize:14,fontWeight:600,cursor:"pointer",borderBottom:"2px solid transparent",transition:"all 0.2s"},
  tabA:{color:"#00c864",borderBottomColor:"#00c864"},
  content:{maxWidth:1280,margin:"0 auto",padding:"28px 40px 48px"},
  infoGrid:{display:"grid",gridTemplateColumns:"1fr 320px",gap:28},
  section:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"22px 24px"},
  sectionH:{fontSize:16,fontWeight:700,margin:"0 0 16px",color:"#fff"},
  amenityRow:{display:"flex",alignItems:"center",gap:12,padding:"9px 12px",background:"rgba(255,255,255,0.03)",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)"},
  courtRow:{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"rgba(255,255,255,0.03)",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)"},
  sidebar:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"20px 22px"},
  ratingSummary:{display:"flex",gap:32,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"24px",alignItems:"center",flexWrap:"wrap"},
  ratingBig:{display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:100},
  writeComment:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"22px 24px"},
  commentCard:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"18px 20px"},
};