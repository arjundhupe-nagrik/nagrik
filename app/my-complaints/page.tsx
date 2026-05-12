'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useRouter } from 'next/navigation'

const CAT_COLOR: Record<string,string> = {
  Drainage:'#C8920A', Road:'#4A4ACB', Garbage:'#1B7A4A',
  Water:'#1A6EA8', Encroachment:'#C0392B', Sanitation:'#7B2FA8',
  'Street Light':'#E65100', Other:'#888'
}

export default function Home() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<any[]>([])
  const [myComplaints, setMyComplaints] = useState<any[]>([])
  const [wardComplaints, setWardComplaints] = useState<any[]>([])
  const [stats, setStats] = useState({ total:0, open:0, progress:0, resolved:0 })
  const [wardStats, setWardStats] = useState({ total:0, open:0, resolved:0 })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/login'); return }
      setUser(u)

      const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).single()
      if (p) {
        setProfile(p)
        const { data: wc } = await supabase.from('complaints').select('*')
          .eq('ward_number', p.preferred_ward).order('created_at', { ascending: false }).limit(5)
        if (wc) {
          setWardComplaints(wc)
          setWardStats({ total:wc.length, open:wc.filter((c:any)=>c.status==='open').length, resolved:wc.filter((c:any)=>c.status==='resolved').length })
        }
        const { data: mc } = await supabase.from('complaints').select('*')
          .eq('user_id', u.id).order('created_at', { ascending: false }).limit(3)
        if (mc) setMyComplaints(mc)
      }

      const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false }).limit(6)
      if (data) setComplaints(data)
      const { data: all } = await supabase.from('complaints').select('status')
      if (all) setStats({ total:all.length, open:all.filter((c:any)=>c.status==='open').length, progress:all.filter((c:any)=>c.status==='progress').length, resolved:all.filter((c:any)=>c.status==='resolved').length })
      setLoading(false)
    }
    init()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function daysSince(date: string) {
    const days = Math.floor((Date.now()-new Date(date).getTime())/86400000)
    return days===0?'Today':days===1?'1d ago':`${days}d ago`
  }

  if (loading) return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ color:'rgba(255,255,255,0.2)', fontSize:'14px' }}>Loading...</div>
    </main>
  )

  if (!user) return null

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif" }}>

      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 32px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'rgba(13,13,20,0.92)', backdropFilter:'blur(16px)', zIndex:100 }}>
        <div style={{ fontSize:'22px', fontWeight:'900', color:'#E8731A', letterSpacing:'-0.5px' }}>nagrik</div>
        <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
          <a href="/feed" style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px', textDecoration:'none', padding:'6px 14px', borderRadius:'8px' }}
            onMouseEnter={e=>(e.currentTarget.style.color='white')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.45)')}>Feed</a>
          <a href="/wards" style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px', textDecoration:'none', padding:'6px 14px', borderRadius:'8px' }}
            onMouseEnter={e=>(e.currentTarget.style.color='white')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.45)')}>Wards</a>
          <a href="/my-complaints" style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px', textDecoration:'none', padding:'6px 14px', borderRadius:'8px' }}
            onMouseEnter={e=>(e.currentTarget.style.color='white')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.45)')}>My complaints</a>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'6px 12px', marginLeft:'8px' }}>
            <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'rgba(232,115,26,0.25)', border:'1px solid rgba(232,115,26,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#E8731A', flexShrink:0 }}>
              {(profile?.full_name||user.email||'U')[0].toUpperCase()}
            </div>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', maxWidth:'100px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {profile?.full_name||user.email?.split('@')[0]}
            </span>
            <button onClick={logout}
            style={{ background:'rgba(224,82,82,0.15)', border:'1px solid rgba(224,82,82,0.3)', color:'#E05252', padding:'7px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>
            Sign out
          </button>
          </div>
          <a href="/file" style={{ background:'#E8731A', color:'white', fontSize:'13px', fontWeight:'700', textDecoration:'none', padding:'8px 18px', borderRadius:'8px', marginLeft:'4px' }}>
            + File complaint
          </a>
        </div>
      </nav>

      <div style={{ maxWidth:'860px', margin:'0 auto', padding:'36px 24px' }}>

        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', marginBottom:'6px' }}>Good to see you back</div>
          <h1 style={{ fontSize:'28px', fontWeight:'900', color:'white', letterSpacing:'-0.5px', marginBottom:'8px' }}>
            Hello, {profile?.full_name?.split(' ')[0]||'Nagrik'} 👋
          </h1>
          {profile?.preferred_area && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(232,115,26,0.1)', border:'1px solid rgba(232,115,26,0.2)', color:'#E8731A', fontSize:'13px', fontWeight:'600', padding:'5px 14px', borderRadius:'20px' }}>
              📍 {profile.preferred_area} · Ward {profile.preferred_ward}
            </div>
          )}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'36px' }}>
          {[
            { href:'/file', icon:'📝', title:'File complaint', desc:'Report a civic issue', bg:'#E8731A', color:'white', isLink:true },
            { href:'/my-complaints', icon:'📋', title:'My complaints', desc: myComplaints.length+' filed by you', bg:'rgba(255,255,255,0.04)', color:'white', isLink:true },
            { href:'/wards', icon:'🗺️', title:'Ward map', desc:'Nagpur heatmap', bg:'rgba(255,255,255,0.04)', color:'white', isLink:true },
          ].map((item,i) => (
            <a key={i} href={item.href} style={{ background:item.bg, borderRadius:'14px', padding:'20px', textDecoration:'none', display:'block', border: item.bg==='#E8731A'?'none':'1px solid rgba(255,255,255,0.08)', transition:'border-color 0.15s' }}
              onMouseEnter={e=>{ if(item.bg!=='#E8731A') e.currentTarget.style.borderColor='rgba(255,255,255,0.2)' }}
              onMouseLeave={e=>{ if(item.bg!=='#E8731A') e.currentTarget.style.borderColor='rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize:'22px', marginBottom:'8px' }}>{item.icon}</div>
              <div style={{ fontSize:'15px', fontWeight:'800', color:item.color, marginBottom:'3px' }}>{item.title}</div>
              <div style={{ fontSize:'12px', color: item.bg==='#E8731A'?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.4)' }}>{item.desc}</div>
            </a>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'36px' }}>
          {[
            { label:'Total filed', val:stats.total, color:'#E8731A' },
            { label:'Open', val:stats.open, color:'#E05252' },
            { label:'In progress', val:stats.progress, color:'#C8920A' },
            { label:'Resolved', val:stats.resolved, color:'#3DAA6E' },
          ].map((s,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'18px 16px', textAlign:'center' }}>
              <div style={{ fontSize:'26px', fontWeight:'800', color:s.val>0?s.color:'rgba(255,255,255,0.15)' }}>{loading?'—':s.val}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {profile?.preferred_area && wardComplaints.length > 0 && (
          <div style={{ marginBottom:'32px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <div>
                <div style={{ fontSize:'15px', fontWeight:'700', color:'white' }}>Issues in {profile.preferred_area}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>Your ward's civic complaints</div>
              </div>
              <a href="/feed" style={{ fontSize:'12px', color:'#E8731A', textDecoration:'none', fontWeight:'600' }}>View all →</a>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'14px' }}>
              {[
                { label:'Total in ward', val:wardStats.total, color:'#E8731A' },
                { label:'Still open', val:wardStats.open, color:'#E05252' },
                { label:'Resolved', val:wardStats.resolved, color:'#3DAA6E' },
              ].map((s,i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'14px', textAlign:'center' }}>
                  <div style={{ fontSize:'22px', fontWeight:'800', color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'3px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            {wardComplaints.map(c => (
              <div key={c.id} onClick={() => window.location.href='/complaint/'+c.id}
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'14px 18px', marginBottom:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', transition:'border-color 0.15s' }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.15)')}
                onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.07)')}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:'8px', marginBottom:'5px', flexWrap:'wrap', alignItems:'center' }}>
                    <span style={{ fontSize:'11px', fontWeight:'700', color:CAT_COLOR[c.category]||'#888', textTransform:'uppercase', letterSpacing:'0.3px' }}>{c.category}</span>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>·</span>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{daysSince(c.created_at)}</span>
                  </div>
                  <div style={{ fontSize:'14px', fontWeight:'600', color:'rgba(255,255,255,0.85)' }}>{c.title}</div>
                </div>
                <span style={{ fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px', whiteSpace:'nowrap',
                  background:c.status==='resolved'?'rgba(61,170,110,0.15)':c.status==='progress'?'rgba(200,146,10,0.15)':'rgba(224,82,82,0.15)',
                  color:c.status==='resolved'?'#3DAA6E':c.status==='progress'?'#C8920A':'#E05252'
                }}>
                  {c.status==='progress'?'In Progress':c.status==='resolved'?'Resolved':'Open'}
                </span>
              </div>
            ))}
          </div>
        )}

        {myComplaints.length > 0 && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <div>
                <div style={{ fontSize:'15px', fontWeight:'700', color:'white' }}>My recent complaints</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>Complaints you filed</div>
              </div>
              <a href="/my-complaints" style={{ fontSize:'12px', color:'#E8731A', textDecoration:'none', fontWeight:'600' }}>View all →</a>
            </div>
            {myComplaints.map(c => (
              <div key={c.id} onClick={() => window.location.href='/complaint/'+c.id}
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderLeft:'3px solid #E8731A', borderRadius:'12px', padding:'14px 18px', marginBottom:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px' }}
                onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.05)')}
                onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.03)')}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:'8px', marginBottom:'5px', alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'11px', fontWeight:'700', color:CAT_COLOR[c.category]||'#888', textTransform:'uppercase', letterSpacing:'0.3px' }}>{c.category}</span>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>·</span>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{c.area||'Ward '+c.ward_number}</span>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>·</span>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{daysSince(c.created_at)}</span>
                  </div>
                  <div style={{ fontSize:'14px', fontWeight:'600', color:'rgba(255,255,255,0.85)' }}>{c.title}</div>
                </div>
                <span style={{ fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px', whiteSpace:'nowrap',
                  background:c.status==='resolved'?'rgba(61,170,110,0.15)':c.status==='progress'?'rgba(200,146,10,0.15)':'rgba(224,82,82,0.15)',
                  color:c.status==='resolved'?'#3DAA6E':c.status==='progress'?'#C8920A':'#E05252'
                }}>
                  {c.status==='progress'?'In Progress':c.status==='resolved'?'Resolved':'Open'}
                </span>
              </div>
            ))}
          </div>
        )}

        {myComplaints.length===0 && wardComplaints.length===0 && !loading && (
          <div style={{ textAlign:'center', padding:'48px 24px', background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:'32px', marginBottom:'14px' }}>🏙️</div>
            <div style={{ fontSize:'16px', fontWeight:'700', color:'white', marginBottom:'6px' }}>No complaints yet</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', marginBottom:'20px' }}>Be the first to report a civic issue in your area.</div>
            <a href="/file" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'14px', textDecoration:'none', padding:'12px 24px', borderRadius:'8px', display:'inline-block' }}>
              File first complaint
            </a>
          </div>
        )}
      </div>
    </main>
  )
}