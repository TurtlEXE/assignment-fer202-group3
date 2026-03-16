import React, { useState } from "react";

const INIT_COURTS = [
  { id:1, name:"Sân số 1 - Khu A", surface:"Sàn nhựa PVC", status:"active", pricePerHour:120000, area:"Khu A", capacity:4, lighting:true, notes:"Sân tiêu chuẩn, phù hợp cho người mới", createdAt:"01/01/2024", totalBookings:234 },
  { id:2, name:"Sân số 2 - Khu A", surface:"Sàn nhựa PVC", status:"active", pricePerHour:120000, area:"Khu A", capacity:4, lighting:true, notes:"Sân tiêu chuẩn", createdAt:"01/01/2024", totalBookings:198 },
  { id:3, name:"Sân số 3 - Khu B", surface:"Acrylic cao cấp", status:"active", pricePerHour:150000, area:"Khu B", capacity:4, lighting:true, notes:"Sân thi đấu chuẩn quốc tế", createdAt:"15/02/2024", totalBookings:312 },
  { id:4, name:"Sân số 4 - Khu B", surface:"Acrylic cao cấp", status:"maintenance", pricePerHour:150000, area:"Khu B", capacity:4, lighting:true, notes:"Đang bảo trì mặt sân", createdAt:"15/02/2024", totalBookings:276 },
  { id:5, name:"Sân số 5 - Khu C", surface:"Sàn gỗ tổng hợp", status:"active", pricePerHour:180000, area:"Khu C", capacity:4, lighting:true, notes:"Sân VIP, có điều hòa", createdAt:"01/03/2024", totalBookings:145 },
  { id:6, name:"Sân số 6 - Khu C", surface:"Sàn gỗ tổng hợp", status:"active", pricePerHour:180000, area:"Khu C", capacity:4, lighting:true, notes:"Sân VIP, có điều hòa", createdAt:"01/03/2024", totalBookings:162 },
  { id:7, name:"Sân số 7 - Khu D", surface:"Sàn nhựa PVC", status:"inactive", pricePerHour:100000, area:"Khu D", capacity:4, lighting:false, notes:"Sân ngoài trời, tạm đóng cửa", createdAt:"01/04/2024", totalBookings:87 },
  { id:8, name:"Sân số 8 - Khu D", surface:"Sàn nhựa PVC", status:"active", pricePerHour:100000, area:"Khu D", capacity:4, lighting:false, notes:"Sân ngoài trời", createdAt:"01/04/2024", totalBookings:103 },
  { id:9, name:"Sân số 9 - Khu E", surface:"Acrylic cao cấp", status:"active", pricePerHour:160000, area:"Khu E", capacity:4, lighting:true, notes:"Sân mới, còn bảo hành", createdAt:"01/05/2024", totalBookings:67 },
  { id:10, name:"Sân số 10 - Khu E", surface:"Acrylic cao cấp", status:"active", pricePerHour:160000, area:"Khu E", capacity:4, lighting:true, notes:"Sân mới, còn bảo hành", createdAt:"01/05/2024", totalBookings:72 },
];

const EMPTY_FORM = { name:"", surface:"Sàn nhựa PVC", status:"active", pricePerHour:"", area:"Khu A", capacity:4, lighting:true, notes:"" };
const STATUS_CONF = { active:{label:"Hoạt động",color:"#00c864",bg:"rgba(0,200,100,0.12)"}, maintenance:{label:"Bảo trì",color:"#ffcc00",bg:"rgba(255,204,0,0.12)"}, inactive:{label:"Tạm đóng",color:"#ff6b6b",bg:"rgba(255,107,107,0.12)"} };

export default function CourtList() {
  const [courts, setCourts] = useState(INIT_COURTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modal, setModal] = useState(null); // null | "add" | "edit" | "delete" | "view"
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewCourt, setViewCourt] = useState(null);

  const filtered = courts.filter(c => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal("add"); };
  const openEdit = (c) => { setForm({...c,pricePerHour:c.pricePerHour}); setEditId(c.id); setModal("edit"); };
  const openDelete = (id) => { setDeleteId(id); setModal("delete"); };
  const openView = (c) => { setViewCourt(c); setModal("view"); };

  const handleSave = () => {
    if (!form.name || !form.pricePerHour) return;
    if (editId) {
      setCourts(courts.map(c=>c.id===editId?{...c,...form,pricePerHour:Number(form.pricePerHour)}:c));
    } else {
      const newCourt = { ...form, id:Date.now(), pricePerHour:Number(form.pricePerHour), createdAt:new Date().toLocaleDateString("vi-VN"), totalBookings:0 };
      setCourts([newCourt,...courts]);
    }
    setModal(null);
  };

  const handleDelete = () => {
    setCourts(courts.filter(c=>c.id!==deleteId));
    setModal(null);
  };

  const summary = {
    total:courts.length,
    active:courts.filter(c=>c.status==="active").length,
    maintenance:courts.filter(c=>c.status==="maintenance").length,
    inactive:courts.filter(c=>c.status==="inactive").length,
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      {/* Summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {[
          {label:"Tổng số sân",value:summary.total,icon:"🏸",color:"#00a0e9"},
          {label:"Đang hoạt động",value:summary.active,icon:"✅",color:"#00c864"},
          {label:"Đang bảo trì",value:summary.maintenance,icon:"🔧",color:"#ffcc00"},
          {label:"Tạm đóng",value:summary.inactive,icon:"⛔",color:"#ff6b6b"},
        ].map(card=>(
          <div key={card.label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"18px 20px",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${card.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>
              {card.icon}
            </div>
            <div>
              <div style={{fontSize:24,fontWeight:800,color:card.color}}>{card.value}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Tìm theo tên sân..."
            style={{width:"100%",padding:"11px 14px 11px 42px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:6}}>
          {["all","active","maintenance","inactive"].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)}
              style={{padding:"9px 14px",border:"1px solid",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",
                background:filterStatus===s?"rgba(0,200,100,0.15)":"rgba(255,255,255,0.04)",
                borderColor:filterStatus===s?"rgba(0,200,100,0.4)":"rgba(255,255,255,0.1)",
                color:filterStatus===s?"#00c864":"rgba(255,255,255,0.6)"}}>
              {s==="all"?"Tất cả":STATUS_CONF[s]?.label}
            </button>
          ))}
        </div>
        <button onClick={openAdd}
          style={{padding:"10px 20px",background:"linear-gradient(135deg,#00c864,#00a0e9)",border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(0,200,100,0.35)",whiteSpace:"nowrap"}}>
          + Thêm sân mới
        </button>
      </div>

      {/* Table */}
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              {["STT","Tên sân","Khu vực","Bề mặt","Giá/giờ","Trạng thái","Tổng lịch","Ngày tạo","Thao tác"].map(h=>(
                <th key={h} style={{padding:"14px 16px",textAlign:"left",fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.5)",letterSpacing:"0.5px",whiteSpace:"nowrap"}}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c,idx)=>{
              const st = STATUS_CONF[c.status];
              return (
                <tr key={c.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"14px 16px",fontSize:13,color:"rgba(255,255,255,0.4)"}}>{idx+1}</td>
                  <td style={{padding:"14px 16px"}}>
                    <div style={{fontSize:14,fontWeight:600,color:"#fff"}}>{c.name}</div>
                    {c.notes && <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.notes}</div>}
                  </td>
                  <td style={{padding:"14px 16px",fontSize:13,color:"rgba(255,255,255,0.7)"}}>{c.area}</td>
                  <td style={{padding:"14px 16px",fontSize:13,color:"rgba(255,255,255,0.7)"}}>{c.surface}</td>
                  <td style={{padding:"14px 16px",fontSize:14,fontWeight:700,color:"#00c864"}}>{c.pricePerHour.toLocaleString("vi-VN")}đ</td>
                  <td style={{padding:"14px 16px"}}>
                    <span style={{padding:"4px 10px",borderRadius:20,fontSize:12,fontWeight:700,color:st.color,background:st.bg}}>
                      {st.label}
                    </span>
                  </td>
                  <td style={{padding:"14px 16px",fontSize:13,color:"rgba(255,255,255,0.7)"}}>{c.totalBookings}</td>
                  <td style={{padding:"14px 16px",fontSize:13,color:"rgba(255,255,255,0.4)"}}>{c.createdAt}</td>
                  <td style={{padding:"14px 16px"}}>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>openView(c)} style={S.actBtn("rgba(0,160,233,0.15)","rgba(0,160,233,0.35)","#00a0e9")} title="Xem">👁</button>
                      <button onClick={()=>openEdit(c)} style={S.actBtn("rgba(255,204,0,0.15)","rgba(255,204,0,0.35)","#ffcc00")} title="Sửa">✏️</button>
                      <button onClick={()=>openDelete(c.id)} style={S.actBtn("rgba(255,107,107,0.15)","rgba(255,107,107,0.35)","#ff6b6b")} title="Xóa">🗑</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0 && (
          <div style={{textAlign:"center",padding:"48px 0",color:"rgba(255,255,255,0.3)"}}>
            <div style={{fontSize:40,marginBottom:12}}>🔍</div>
            <p>Không tìm thấy sân nào</p>
          </div>
        )}
      </div>
      <div style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>
        Hiển thị {filtered.length}/{courts.length} sân
      </div>

      {/* MODAL: ADD/EDIT */}
      {(modal==="add"||modal==="edit") && (
        <div style={S.overlay} onClick={()=>setModal(null)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <h3 style={{margin:0,fontSize:20,fontWeight:800}}>{modal==="add"?"➕ Thêm sân mới":"✏️ Chỉnh sửa sân"}</h3>
              <button onClick={()=>setModal(null)} style={S.closeBtn}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <FF label="Tên sân *">
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="VD: Sân số 1 - Khu A" style={S.inp}/>
              </FF>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <FF label="Khu vực">
                  <select value={form.area} onChange={e=>setForm({...form,area:e.target.value})} style={S.inp}>
                    {["Khu A","Khu B","Khu C","Khu D","Khu E"].map(a=><option key={a}>{a}</option>)}
                  </select>
                </FF>
                <FF label="Bề mặt sân">
                  <select value={form.surface} onChange={e=>setForm({...form,surface:e.target.value})} style={S.inp}>
                    {["Sàn nhựa PVC","Acrylic cao cấp","Sàn gỗ tổng hợp","Bê tông phủ epoxy"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </FF>
                <FF label="Giá/giờ (VNĐ) *">
                  <input type="number" value={form.pricePerHour} onChange={e=>setForm({...form,pricePerHour:e.target.value})} placeholder="120000" style={S.inp}/>
                </FF>
                <FF label="Trạng thái">
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={S.inp}>
                    <option value="active">Hoạt động</option>
                    <option value="maintenance">Bảo trì</option>
                    <option value="inactive">Tạm đóng</option>
                  </select>
                </FF>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="checkbox" id="lighting" checked={form.lighting} onChange={e=>setForm({...form,lighting:e.target.checked})} style={{accentColor:"#00c864",width:16,height:16}}/>
                <label htmlFor="lighting" style={{fontSize:14,color:"rgba(255,255,255,0.75)",cursor:"pointer"}}>💡 Có hệ thống đèn chiếu sáng</label>
              </div>
              <FF label="Ghi chú">
                <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} style={{...S.inp,resize:"none",fontFamily:"inherit"}} placeholder="Mô tả thêm về sân..."/>
              </FF>
            </div>
            <div style={{display:"flex",gap:12,marginTop:22}}>
              <button onClick={()=>setModal(null)} style={{flex:1,padding:"12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,color:"rgba(255,255,255,0.7)",fontSize:14,fontWeight:600,cursor:"pointer"}}>Hủy</button>
              <button onClick={handleSave} style={{flex:2,padding:"12px",background:"linear-gradient(135deg,#00c864,#00a0e9)",border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                {modal==="add"?"✅ Thêm sân":"💾 Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE */}
      {modal==="delete" && (
        <div style={S.overlay} onClick={()=>setModal(null)}>
          <div style={{...S.modal,maxWidth:400,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:52,marginBottom:16}}>⚠️</div>
            <h3 style={{fontSize:20,fontWeight:800,margin:"0 0 10px"}}>Xác nhận xóa sân?</h3>
            <p style={{color:"rgba(255,255,255,0.55)",fontSize:14,marginBottom:24}}>
              Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
            </p>
            <div style={{display:"flex",gap:12}}>
              <button onClick={()=>setModal(null)} style={{flex:1,padding:"12px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,color:"rgba(255,255,255,0.7)",fontSize:14,fontWeight:600,cursor:"pointer"}}>Hủy</button>
              <button onClick={handleDelete} style={{flex:1,padding:"12px",background:"linear-gradient(135deg,#ff4444,#ff2255)",border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>🗑 Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW */}
      {modal==="view" && viewCourt && (
        <div style={S.overlay} onClick={()=>setModal(null)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{margin:0,fontSize:18,fontWeight:800}}>📋 Chi tiết sân</h3>
              <button onClick={()=>setModal(null)} style={S.closeBtn}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                ["Tên sân",viewCourt.name],["Khu vực",viewCourt.area],
                ["Bề mặt",viewCourt.surface],["Giá/giờ",`${viewCourt.pricePerHour.toLocaleString("vi-VN")}đ`],
                ["Trạng thái",STATUS_CONF[viewCourt.status]?.label],["Tổng lịch đặt",`${viewCourt.totalBookings} lần`],
                ["Đèn chiếu sáng",viewCourt.lighting?"Có":"Không"],["Ngày tạo",viewCourt.createdAt],
              ].map(([k,v])=>(
                <div key={k} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 14px"}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{k}</div>
                  <div style={{fontSize:14,fontWeight:600,color:"#fff"}}>{v}</div>
                </div>
              ))}
            </div>
            {viewCourt.notes && (
              <div style={{marginTop:12,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:4}}>GHI CHÚ</div>
                <div style={{fontSize:14,color:"rgba(255,255,255,0.8)"}}>{viewCourt.notes}</div>
              </div>
            )}
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button onClick={()=>openEdit(viewCourt)} style={{flex:1,padding:"11px",background:"rgba(255,204,0,0.12)",border:"1px solid rgba(255,204,0,0.25)",borderRadius:12,color:"#ffcc00",fontSize:14,fontWeight:600,cursor:"pointer"}}>✏️ Chỉnh sửa</button>
              <button onClick={()=>setModal(null)} style={{flex:1,padding:"11px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,color:"rgba(255,255,255,0.7)",fontSize:14,fontWeight:600,cursor:"pointer"}}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FF = ({label,children})=>(
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    <label style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.6)"}}>{label}</label>
    {children}
  </div>
);

const S = {
  actBtn:(bg,border,color)=>({padding:"6px 10px",background:bg,border:`1px solid ${border}`,borderRadius:8,color,fontSize:13,cursor:"pointer"}),
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20},
  modal:{background:"#141826",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"28px 30px",width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.6)"},
  closeBtn:{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"rgba(255,255,255,0.6)",fontSize:16},
  inp:{width:"100%",padding:"11px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"},
};