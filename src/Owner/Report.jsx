import React, { useState } from "react";
import { BarChart,Bar,LineChart,Line,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer } from "recharts";

const MONTHLY_REVENUE = [
  {month:"T1",revenue:28500000,bookings:185,customers:142},
  {month:"T2",revenue:31200000,bookings:203,customers:158},
  {month:"T3",revenue:29800000,bookings:196,customers:151},
  {month:"T4",revenue:35600000,bookings:231,customers:177},
  {month:"T5",revenue:38900000,bookings:252,customers:193},
  {month:"T6",revenue:42100000,bookings:273,customers:208},
  {month:"T7",revenue:45300000,bookings:294,customers:221},
  {month:"T8",revenue:43700000,bookings:284,customers:214},
  {month:"T9",revenue:47200000,bookings:306,customers:234},
  {month:"T10",revenue:51800000,bookings:336,customers:254},
  {month:"T11",revenue:49600000,bookings:322,customers:244},
  {month:"T12",revenue:56400000,bookings:366,customers:278},
];

const COURT_REVENUE = [
  {name:"Sân 1",revenue:8200000,bookings:53,rate:78},
  {name:"Sân 2",revenue:7800000,bookings:51,rate:74},
  {name:"Sân 3",revenue:12300000,bookings:68,rate:91},
  {name:"Sân 4",revenue:9600000,bookings:57,rate:85},
  {name:"Sân 5",revenue:11200000,bookings:62,rate:88},
  {name:"Sân 6",revenue:7100000,bookings:46,rate:69},
];

const PEAK_HOURS = [
  {hour:"06:00",count:12},{hour:"07:00",count:28},{hour:"08:00",count:45},
  {hour:"09:00",count:38},{hour:"10:00",count:32},{hour:"11:00",count:24},
  {hour:"12:00",count:18},{hour:"13:00",count:15},{hour:"14:00",count:22},
  {hour:"15:00",count:35},{hour:"16:00",count:52},{hour:"17:00",count:68},
  {hour:"18:00",count:76},{hour:"19:00",count:72},{hour:"20:00",count:58},
  {hour:"21:00",count:34},
];

const SURFACE_DIST = [
  {name:"Sàn nhựa PVC",value:35,color:"#00c864"},
  {name:"Acrylic cao cấp",value:40,color:"#00a0e9"},
  {name:"Sàn gỗ tổng hợp",value:25,color:"#ffcc00"},
];

const RECENT_BOOKINGS = [
  {id:"BK001",customer:"Nguyễn Văn A",court:"Sân số 3",date:"03/01/2025",time:"18:00",hours:2,amount:300000,status:"completed"},
  {id:"BK002",customer:"Trần Thị B",court:"Sân số 1",date:"03/01/2025",time:"09:00",hours:1,amount:120000,status:"completed"},
  {id:"BK003",customer:"Lê Văn C",court:"Sân số 5",date:"03/01/2025",time:"19:00",hours:1.5,amount:270000,status:"upcoming"},
  {id:"BK004",customer:"Phạm Thị D",court:"Sân số 2",date:"03/01/2025",time:"07:00",hours:2,amount:240000,status:"completed"},
  {id:"BK005",customer:"Hoàng Văn E",court:"Sân số 4",date:"02/01/2025",time:"17:00",hours:1,amount:150000,status:"cancelled"},
  {id:"BK006",customer:"Võ Thị F",court:"Sân số 6",date:"02/01/2025",time:"20:00",hours:2,amount:320000,status:"completed"},
  {id:"BK007",customer:"Đặng Văn G",court:"Sân số 3",date:"02/01/2025",time:"08:00",hours:1,amount:150000,status:"completed"},
  {id:"BK008",customer:"Ngô Thị H",court:"Sân số 1",date:"01/01/2025",time:"15:00",hours:2,amount:240000,status:"completed"},
];

const STATUS_B = {
  completed:{label:"Hoàn thành",color:"#00c864",bg:"rgba(0,200,100,0.12)"},
  upcoming:{label:"Sắp tới",color:"#00a0e9",bg:"rgba(0,160,233,0.12)"},
  cancelled:{label:"Đã hủy",color:"#ff6b6b",bg:"rgba(255,107,107,0.12)"},
};

const CustomTooltip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:"#1a2035",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"10px 14px"}}>
      <p style={{margin:"0 0 6px",fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.8)"}}>{label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{margin:"3px 0",fontSize:13,color:p.color||"#00c864"}}>
          {p.name}: {typeof p.value==="number"&&p.value>10000?p.value.toLocaleString("vi-VN")+"đ":p.value}
        </p>
      ))}
    </div>
  );
};

export default function Report() {
  const [period, setPeriod] = useState("year");

  const totalRevenue = MONTHLY_REVENUE.reduce((s,m)=>s+m.revenue,0);
  const totalBookings = MONTHLY_REVENUE.reduce((s,m)=>s+m.bookings,0);
  const totalCustomers = MONTHLY_REVENUE.reduce((s,m)=>s+m.customers,0);
  const avgPerBooking = Math.round(totalRevenue/totalBookings);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{margin:"0 0 4px",fontSize:22,fontWeight:800}}>📊 Báo cáo & Thống kê</h2>
          <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.45)"}}>Tổng quan hoạt động kinh doanh</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          {["week","month","year"].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)}
              style={{padding:"8px 16px",border:"1px solid",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",
                background:period===p?"rgba(0,200,100,0.15)":"rgba(255,255,255,0.04)",
                borderColor:period===p?"rgba(0,200,100,0.4)":"rgba(255,255,255,0.1)",
                color:period===p?"#00c864":"rgba(255,255,255,0.6)"}}>
              {p==="week"?"7 ngày":p==="month"?"30 ngày":"Năm 2024"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {[
          {label:"Tổng doanh thu",value:`${(totalRevenue/1000000).toFixed(1)}M đ`,icon:"💰",color:"#00c864",change:"+12.5%"},
          {label:"Tổng lượt đặt",value:totalBookings.toLocaleString(),icon:"📅",color:"#00a0e9",change:"+8.3%"},
          {label:"Khách hàng",value:totalCustomers.toLocaleString(),icon:"👥",color:"#ffcc00",change:"+15.2%"},
          {label:"TB/lượt đặt",value:`${(avgPerBooking/1000).toFixed(0)}K đ`,icon:"📈",color:"#ff8800",change:"+3.8%"},
        ].map(card=>(
          <div key={card.label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"20px 22px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div style={{width:42,height:42,borderRadius:12,background:`${card.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>
                {card.icon}
              </div>
              <span style={{fontSize:12,fontWeight:700,color:"#00c864",background:"rgba(0,200,100,0.12)",padding:"3px 8px",borderRadius:8}}>
                {card.change}
              </span>
            </div>
            <div style={{fontSize:26,fontWeight:900,color:card.color,marginBottom:4}}>{card.value}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.45)"}}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div style={S.chartCard}>
        <h3 style={S.chartH}>📈 Doanh thu & Lượt đặt theo tháng</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={MONTHLY_REVENUE} margin={{top:5,right:20,bottom:5,left:10}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12}/>
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" fontSize={11}
              tickFormatter={v=>`${(v/1000000).toFixed(0)}M`}/>
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" fontSize={11}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Legend wrapperStyle={{color:"rgba(255,255,255,0.6)",fontSize:13}}/>
            <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#00c864" strokeWidth={2.5} dot={{fill:"#00c864",r:4}}/>
            <Line yAxisId="right" type="monotone" dataKey="bookings" name="Lượt đặt" stroke="#00a0e9" strokeWidth={2.5} dot={{fill:"#00a0e9",r:4}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        {/* Court Revenue Bar */}
        <div style={S.chartCard}>
          <h3 style={S.chartH}>🏸 Doanh thu theo sân</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={COURT_REVENUE} margin={{top:5,right:10,bottom:5,left:10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12}/>
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickFormatter={v=>`${(v/1000000).toFixed(0)}M`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="revenue" name="Doanh thu" fill="#00c864" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Surface Distribution Pie */}
        <div style={S.chartCard}>
          <h3 style={S.chartH}>🥧 Lượt đặt theo loại sân</h3>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie data={SURFACE_DIST} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" nameKey="name">
                  {SURFACE_DIST.map((entry,i)=><Cell key={i} fill={entry.color}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
              {SURFACE_DIST.map(d=>(
                <div key={d.name} style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:d.color,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:2}}>{d.name}</div>
                    <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
                      <div style={{width:`${d.value}%`,height:"100%",background:d.color,borderRadius:2}}/>
                    </div>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,color:d.color}}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Peak Hours */}
      <div style={S.chartCard}>
        <h3 style={S.chartH}>⏰ Khung giờ cao điểm</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={PEAK_HOURS} margin={{top:5,right:20,bottom:5,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={11}/>
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="count" name="Lượt đặt" radius={[4,4,0,0]}>
              {PEAK_HOURS.map((entry,i)=>(
                <Cell key={i} fill={entry.count>=60?"#00c864":entry.count>=40?"#00a0e9":"rgba(0,160,233,0.4)"}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{display:"flex",gap:16,marginTop:10}}>
          {[{c:"#00c864",l:"Cao điểm (≥60)"},{c:"#00a0e9",l:"Bình thường (40-59)"},{c:"rgba(0,160,233,0.4)",l:"Thấp điểm (<40)"}].map(({c,l})=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"rgba(255,255,255,0.5)"}}>
              <div style={{width:10,height:10,borderRadius:2,background:c}}/>{l}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div style={{...S.chartCard,padding:0,overflow:"hidden"}}>
        <div style={{padding:"20px 22px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h3 style={{...S.chartH,margin:0}}>📋 Lịch đặt gần đây</h3>
          <button style={{padding:"7px 14px",background:"rgba(0,200,100,0.12)",border:"1px solid rgba(0,200,100,0.25)",borderRadius:10,color:"#00c864",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            Xem tất cả →
          </button>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"rgba(255,255,255,0.03)",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
              {["Mã đặt","Khách hàng","Sân","Ngày","Giờ","Thời gian","Số tiền","Trạng thái"].map(h=>(
                <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",letterSpacing:"0.5px"}}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_BOOKINGS.map(b=>{
              const st = STATUS_B[b.status];
              return (
                <tr key={b.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <td style={{padding:"13px 16px",fontSize:13,fontWeight:700,color:"#00a0e9",fontFamily:"monospace"}}>{b.id}</td>
                  <td style={{padding:"13px 16px",fontSize:13,fontWeight:600,color:"#fff"}}>{b.customer}</td>
                  <td style={{padding:"13px 16px",fontSize:13,color:"rgba(255,255,255,0.7)"}}>{b.court}</td>
                  <td style={{padding:"13px 16px",fontSize:13,color:"rgba(255,255,255,0.6)"}}>{b.date}</td>
                  <td style={{padding:"13px 16px",fontSize:13,color:"rgba(255,255,255,0.6)"}}>{b.time}</td>
                  <td style={{padding:"13px 16px",fontSize:13,color:"rgba(255,255,255,0.6)"}}>{b.hours}h</td>
                  <td style={{padding:"13px 16px",fontSize:14,fontWeight:700,color:"#00c864"}}>{b.amount.toLocaleString("vi-VN")}đ</td>
                  <td style={{padding:"13px 16px"}}>
                    <span style={{padding:"4px 10px",borderRadius:20,fontSize:12,fontWeight:700,color:st.color,background:st.bg}}>{st.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const S = {
  chartCard:{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"20px 22px"},
  chartH:{fontSize:15,fontWeight:700,margin:"0 0 18px",color:"#fff"},
};
