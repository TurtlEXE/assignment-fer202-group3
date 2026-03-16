import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const COURTS = [
  { id:1, name:"Sân Pickleball Thủ Đức Sport", address:"123 Võ Văn Ngân, Thủ Đức", price:120000, courts:6, image:"🏟️", openTime:"06:00", closeTime:"22:00" },
  { id:2, name:"PicklePark Quận 7", address:"45 Nguyễn Thị Thập, Quận 7", price:150000, courts:8, image:"⚡", openTime:"05:30", closeTime:"23:00" },
  { id:9, name:"Dragon Pickle Quận 1", address:"34 Lý Tự Trọng, Quận 1", price:200000, courts:10, image:"🐉", openTime:"05:00", closeTime:"24:00" },
];

const TIME_SLOTS = ["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"];
const BOOKED_SLOTS = { 1:["09:00","10:00","18:00","19:00"], 2:["08:00","14:00","15:00"], 3:["07:00","16:00","17:00","18:00"] };

const PROMOS = [
  { code:"NEWMEMBER", desc:"Giảm 15% cho khách hàng mới", discount:0.15 },
  { code:"WEEKEND20", desc:"Giảm 20% cuối tuần", discount:0.20 },
  { code:"PICKLE10", desc:"Giảm 10% cho mọi đơn", discount:0.10 },
];

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("pb_user")||"{}");
  const court = COURTS.find(c=>c.id===Number(id))||COURTS[0];

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    date: today,
    courtNum: 1,
    startTime: "",
    hours: 1,
    players: 2,
    note: "",
    promo: "",
  });
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [step, setStep] = useState(1); // 1=choose, 2=confirm, 3=success
  const [loading, setLoading] = useState(false);

  const bookedForCourt = BOOKED_SLOTS[form.courtNum] || [];
  const isBooked = (slot) => bookedForCourt.includes(slot);

  const price = court.price * form.hours;
  const discount = promoApplied ? Math.round(price * promoApplied.discount) : 0;
  const total = price - discount;

  const handleApplyPromo = () => {
    const promo = PROMOS.find(p=>p.code===form.promo.toUpperCase());
    if (promo) { setPromoApplied(promo); setPromoError(""); }
    else { setPromoApplied(null); setPromoError("Mã khuyến mãi không hợp lệ"); }
  };

  const canProceed = form.date && form.startTime;

const handleConfirm = () => {
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    navigate("/payment", {
      state: {
        booking: {
          bookingId: "BK" + Math.floor(Math.random() * 900000 + 100000),
          courtName: court.name,
          courtAddress: court.address,
          courtImage: court.image,
          date: form.date,
          startTime: form.startTime,
          hours: form.hours,
          courtNum: form.courtNum,
          players: form.players,
          pricePerHour: court.price,
          discount: discount,
          total: total,
          promoCode: promoApplied?.code || "",
        }
      }
    });
  }, 1500);
};

 

  return (
    <div style={S.page}>
      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navWrap}>
          <button onClick={()=>step===2?setStep(1):navigate(`/court/${court.id}`)} style={S.backBtn}>← Quay lại</button>
          <div style={S.logo}><span>🏓</span><span style={S.logoTxt}>PickleZone</span></div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>
            Bước {step}/2: {step===1?"Chọn lịch":"Xác nhận"}
          </div>
        </div>
      </nav>

      {/* Progress */}
      <div style={S.progress}>
        {[{n:1,l:"Chọn lịch & sân"},{n:2,l:"Xác nhận & thanh toán"}].map((s,i)=>(
          <React.Fragment key={s.n}>
            {i>0&&<div style={{flex:1,height:2,background:step>1?"linear-gradient(90deg,#00c864,#00a0e9)":"rgba(255,255,255,0.1)",margin:"0 12px",borderRadius:1}}/>}
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,
                background:step>=s.n?"linear-gradient(135deg,#00c864,#00a0e9)":"rgba(255,255,255,0.08)",
                color:step>=s.n?"#fff":"rgba(255,255,255,0.3)",
                boxShadow:step===s.n?"0 0 14px rgba(0,200,100,0.4)":"none"}}>
                {step>s.n?"✓":s.n}
              </div>
              <span style={{fontSize:13,fontWeight:600,color:step>=s.n?"#fff":"rgba(255,255,255,0.3)"}}>{s.l}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div style={S.mainGrid}>
        {/* LEFT: Form */}
        <div style={{display:"flex",flexDirection:"column",gap:20}}>

          {step===1 && (
            <>
              {/* Court info banner */}
              <div style={S.courtBanner}>
                <span style={{fontSize:40}}>{court.image}</span>
                <div>
                  <h3 style={{margin:"0 0 4px",fontSize:17,fontWeight:700}}>{court.name}</h3>
                  <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.55)"}}>📍 {court.address}</p>
                </div>
                <div style={{marginLeft:"auto",textAlign:"right"}}>
                  <div style={{fontSize:18,fontWeight:800,color:"#00c864"}}>{court.price.toLocaleString("vi-VN")}đ</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>mỗi giờ</div>
                </div>
              </div>

              {/* Date & court */}
              <div style={S.section}>
                <h4 style={S.sH}>📅 Chọn ngày & sân</h4>
                <div style={S.twoCol}>
                  <div style={S.fg}>
                    <label style={S.lbl}>Ngày đặt sân</label>
                    <input type="date" value={form.date} min={today}
                      onChange={e=>setForm({...form,date:e.target.value})} style={S.inp}/>
                  </div>
                  <div style={S.fg}>
                    <label style={S.lbl}>Số sân</label>
                    <select value={form.courtNum} onChange={e=>setForm({...form,courtNum:Number(e.target.value)})} style={S.inp}>
                      {Array.from({length:court.courts},(_,i)=>(
                        <option key={i+1} value={i+1}>Sân số {i+1}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Time slots */}
              <div style={S.section}>
                <h4 style={S.sH}>🕐 Chọn giờ bắt đầu</h4>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
                  {TIME_SLOTS.map(slot=>{
                    const booked = isBooked(slot);
                    const selected = form.startTime === slot;
                    return (
                      <button key={slot} onClick={()=>!booked&&setForm({...form,startTime:slot})}
                        style={{
                          padding:"9px 14px",borderRadius:10,border:"1px solid",fontSize:13,fontWeight:600,cursor:booked?"not-allowed":"pointer",
                          background:selected?"linear-gradient(135deg,#00c864,#00a0e9)":booked?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.06)",
                          borderColor:selected?"transparent":booked?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.12)",
                          color:selected?"#fff":booked?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.8)",
                          boxShadow:selected?"0 4px 12px rgba(0,200,100,0.3)":"none",
                          textDecoration:booked?"line-through":"none",
                        }}>
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:16,fontSize:12,color:"rgba(255,255,255,0.4)"}}>
                  <span>⬜ Còn trống</span>
                  <span style={{color:"rgba(255,255,255,0.2)"}}>⬛ Đã đặt</span>
                  <span style={{color:"#00c864"}}>🟩 Đang chọn</span>
                </div>
              </div>

              {/* Duration & players */}
              <div style={S.section}>
                <h4 style={S.sH}>⚙️ Tùy chọn thêm</h4>
                <div style={S.twoCol}>
                  <div style={S.fg}>
                    <label style={S.lbl}>Thời gian thuê (giờ)</label>
                    <select value={form.hours} onChange={e=>setForm({...form,hours:Number(e.target.value)})} style={S.inp}>
                      {[1,1.5,2,2.5,3,4].map(h=><option key={h} value={h}>{h} giờ</option>)}
                    </select>
                  </div>
                  <div style={S.fg}>
                    <label style={S.lbl}>Số người chơi</label>
                    <select value={form.players} onChange={e=>setForm({...form,players:Number(e.target.value)})} style={S.inp}>
                      {[2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} người</option>)}
                    </select>
                  </div>
                </div>
                <div style={{...S.fg,marginTop:12}}>
                  <label style={S.lbl}>Ghi chú (tùy chọn)</label>
                  <textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})}
                    placeholder="Yêu cầu đặc biệt, mượn vợt, ..."
                    rows={2} style={{...S.inp,resize:"none",fontFamily:"inherit"}}/>
                </div>
              </div>

              <button onClick={()=>canProceed&&setStep(2)}
                style={{...S.nextBtn,...(!canProceed?{opacity:0.4,cursor:"not-allowed"}:{})}}
                disabled={!canProceed}>
                Tiếp tục xác nhận →
              </button>
            </>
          )}

          {step===2 && (
            <>
              <div style={S.section}>
                <h4 style={S.sH}>📋 Xác nhận thông tin đặt sân</h4>
                {[
                  ["Sân",court.name],
                  ["Địa chỉ",court.address],
                  ["Ngày",form.date],
                  ["Giờ bắt đầu",form.startTime],
                  ["Thời gian",`${form.hours} giờ`],
                  ["Sân số",`Sân số ${form.courtNum}`],
                  ["Số người",`${form.players} người`],
                  ...(form.note?[["Ghi chú",form.note]]:[]),
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",gap:12,padding:"11px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <span style={{fontSize:13,color:"rgba(255,255,255,0.45)",width:110,flexShrink:0}}>{k}</span>
                    <span style={{fontSize:14,color:"#fff",fontWeight:500}}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Promo */}
              <div style={S.section}>
                <h4 style={S.sH}>🎁 Mã khuyến mãi</h4>
                <div style={{display:"flex",gap:10}}>
                  <input value={form.promo} onChange={e=>setForm({...form,promo:e.target.value})}
                    placeholder="Nhập mã khuyến mãi (VD: NEWMEMBER)"
                    style={{...S.inp,flex:1}}/>
                  <button onClick={handleApplyPromo}
                    style={{padding:"11px 18px",background:"rgba(0,200,100,0.15)",border:"1px solid rgba(0,200,100,0.3)",borderRadius:12,color:"#00c864",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                    Áp dụng
                  </button>
                </div>
                {promoApplied && (
                  <div style={{marginTop:10,padding:"10px 14px",background:"rgba(0,200,100,0.1)",border:"1px solid rgba(0,200,100,0.25)",borderRadius:10,fontSize:13,color:"#00c864"}}>
                    ✓ {promoApplied.desc} — Tiết kiệm {discount.toLocaleString("vi-VN")}đ
                  </div>
                )}
                {promoError && <p style={{fontSize:13,color:"#ff6b6b",marginTop:6}}>{promoError}</p>}
              </div>

              {/* Payment method */}
              <div style={S.section}>
                <h4 style={S.sH}>💳 Phương thức thanh toán</h4>
                {[{icon:"💵",label:"Thanh toán tại sân"},{icon:"🏦",label:"Chuyển khoản ngân hàng"},{icon:"📱",label:"Ví điện tử (MoMo, ZaloPay)"}].map((m,i)=>(
                  <label key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"rgba(255,255,255,0.04)",borderRadius:12,marginBottom:8,cursor:"pointer",border:`1px solid ${i===0?"rgba(0,200,100,0.4)":"rgba(255,255,255,0.08)"}`}}>
                    <input type="radio" name="payment" defaultChecked={i===0} style={{accentColor:"#00c864"}}/>
                    <span style={{fontSize:18}}>{m.icon}</span>
                    <span style={{fontSize:14,color:"rgba(255,255,255,0.85)"}}>{m.label}</span>
                  </label>
                ))}
              </div>

              <button onClick={handleConfirm} style={S.nextBtn} disabled={loading}>
                {loading?"⟳ Đang xử lý...":"✅ Xác nhận đặt sân"}
              </button>
            </>
          )}
        </div>

        {/* RIGHT: Price summary */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={S.priceSummary}>
            <h4 style={{margin:"0 0 16px",fontSize:16,fontWeight:700}}>💰 Tổng cộng</h4>
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
              <span style={{fontSize:13,color:"rgba(255,255,255,0.55)"}}>{court.price.toLocaleString("vi-VN")}đ × {form.hours}h</span>
              <span style={{fontSize:13,color:"#fff"}}>{price.toLocaleString("vi-VN")}đ</span>
            </div>
            {promoApplied && (
              <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                <span style={{fontSize:13,color:"#00c864"}}>Giảm giá ({(promoApplied.discount*100).toFixed(0)}%)</span>
                <span style={{fontSize:13,color:"#00c864"}}>-{discount.toLocaleString("vi-VN")}đ</span>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0 0",marginTop:4}}>
              <span style={{fontSize:15,fontWeight:700}}>Tổng thanh toán</span>
              <span style={{fontSize:22,fontWeight:900,color:"#00c864"}}>{total.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          <div style={{...S.priceSummary,background:"rgba(0,200,100,0.06)",border:"1px solid rgba(0,200,100,0.15)"}}>
            <h4 style={{margin:"0 0 12px",fontSize:14,fontWeight:700,color:"#00c864"}}>📌 Chính sách đặt sân</h4>
            {["Hủy trước 2 giờ: hoàn 100%","Hủy trước 1 giờ: hoàn 50%","Hủy dưới 1 giờ: không hoàn tiền","Trễ giờ quá 15 phút: mất sân"].map((p,i)=>(
              <div key={i} style={{fontSize:12,color:"rgba(255,255,255,0.65)",marginBottom:7,display:"flex",gap:8,lineHeight:1.5}}>
                <span style={{color:"#00c864",fontWeight:700}}>•</span>{p}
              </div>
            ))}
          </div>

          <div style={S.priceSummary}>
            <h4 style={{margin:"0 0 12px",fontSize:14,fontWeight:700}}>🎁 Mã gợi ý</h4>
            {PROMOS.map(p=>(
              <div key={p.code} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#00c864",fontFamily:"monospace"}}>{p.code}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>{p.desc}</div>
                </div>
                <button onClick={()=>setForm({...form,promo:p.code})} style={{padding:"4px 10px",background:"rgba(0,200,100,0.12)",border:"1px solid rgba(0,200,100,0.25)",borderRadius:8,color:"#00c864",fontSize:12,cursor:"pointer"}}>
                  Dùng
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page:{minHeight:"100vh",background:"#0a0e1a",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#fff"},
  nav:{background:"rgba(10,14,26,0.96)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.08)",position:"sticky",top:0,zIndex:100},
  navWrap:{maxWidth:1200,margin:"0 auto",padding:"0 24px",height:62,display:"flex",alignItems:"center",justifyContent:"space-between"},
  backBtn:{padding:"8px 16px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"rgba(255,255,255,0.7)",fontSize:14,fontWeight:600,cursor:"pointer"},
  logo:{display:"flex",alignItems:"center",gap:10},
  logoTxt:{fontSize:20,fontWeight:800,background:"linear-gradient(90deg,#00c864,#00a0e9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  progress:{maxWidth:600,margin:"0 auto",padding:"24px 24px 0",display:"flex",alignItems:"center"},
  mainGrid:{maxWidth:1200,margin:"0 auto",padding:"24px",display:"grid",gridTemplateColumns:"1fr 340px",gap:24},
  courtBanner:{display:"flex",alignItems:"center",gap:16,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"16px 20px"},
  section:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"20px 22px"},
  sH:{fontSize:15,fontWeight:700,margin:"0 0 16px",color:"#fff"},
  twoCol:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14},
  fg:{display:"flex",flexDirection:"column",gap:6},
  lbl:{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.6)"},
  inp:{width:"100%",padding:"11px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"},
  nextBtn:{width:"100%",padding:"14px",background:"linear-gradient(135deg,#00c864,#00a0e9)",border:"none",borderRadius:16,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 8px 24px rgba(0,200,100,0.35)"},
  priceSummary:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"20px 22px"},
  successIcon:{fontSize:64,marginBottom:16},
  bookingSummaryCard:{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:"14px 18px",textAlign:"left"},
 
};