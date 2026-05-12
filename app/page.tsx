'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const CAT_COLOR: Record<string,string> = {
  Drainage:'#C8920A', Road:'#4A4ACB', Garbage:'#1B7A4A',
  Water:'#1A6EA8', Encroachment:'#C0392B', Sanitation:'#7B2FA8',
  'Street Light':'#E65100', Other:'#888'
}

export default function Home() {
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
      if (!u) {
        window.location.href = '/login'
        return
      }
      if (u) {
        setUser(u)
        const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).single()
        if (p) {
          setProfile(p)
          // Load ward-specific complaints
          const { data: wc } = await supabase.from('complaints').select('*')
            .eq('ward_number', p.preferred_ward).order('created_at', { ascending: false }).limit(5)
          if (wc) {
            setWardComplaints(wc)
            setWardStats({
              total: wc.length,
              open: wc.filter((c:any) => c.status === 'open').length,
              resolved: wc.filter((c:any) => c.status === 'resolved').length,
            })
          }
          // Load my complaints
          const { data: mc } = await supabase.from('complaints').select('*')
            .eq('user_id', u.id).order('created_at', { ascending: false }).limit(3)
          if (mc) setMyComplaints(mc)
        }
      }
      // Load global stats + recent complaints
      const { data } = await supabase.from('complaints').select('*')
        .order('created_at', { ascending: false }).limit(6)
      if (data) setComplaints(data)
      const { data: all } = await supabase.from('complaints').select('status')
      if (all) {
        setStats({
          total: all.length,
          open: all.filter((c:any) => c.status==='open').length,
          progress: all.filter((c:any) => c.status==='progress').length,
          resolved: all.filter((c:any) => c.status==='resolved').length,
        })
      }
      setLoading(false)
    }
    init()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setMyComplaints([]); setWardComplaints([])
  }

  function daysSince(date: string) {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
    return days === 0 ? 'Today' : days === 1 ? '1d ago' : `${days}d ago`
  }

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* Navbar */}
      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 32px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'rgba(13,13,20,0.92)', backdropFilter:'blur(16px)', zIndex:100 }}>
        <div style={{ fontSize:'22px', fontWeight:'900', color:'#E8731A', letterSpacing:'-0.5px' }}>nagrik</div>
        <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
          <a href="/feed" style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px', textDecoration:'none', padding:'6px 14px', borderRadius:'8px' }}
            onMouseEnter={e => (e.currentTarget.style.color='white')}
            onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.45)')}>Feed</a>
          <a href="/wards" style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px', textDecoration:'none', padding:'6px 14px', borderRadius:'8px' }}
            onMouseEnter={e => (e.currentTarget.style.color='white')}
            onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.45)')}>Wards</a>

          {user ? (
            <>
              <a href="/my-complaints" style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px', textDecoration:'none', padding:'6px 14px', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', fontWeight:'600', marginLeft:'6px' }}>
                My complaints {myComplaints.length > 0 && `(${myComplaints.length})`}
              </a>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'5px 12px', marginLeft:'4px' }}>
                <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'rgba(232,115,26,0.25)', border:'1px solid rgba(232,115,26,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#E8731A' }}>
                  {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <div style={{ display:'flex', flexDirection:'column' }}>
                  <span style={{ fontSize:'12px', color:'white', fontWeight:'600', maxWidth:'100px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  {profile?.preferred_area && (
                    <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>📍 {profile.preferred_area}</span>
                  )}
                </div>
                <button onClick={logout} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.25)', cursor:'pointer', fontSize:'11px', marginLeft:'4px' }}>
                  sign out
                </button>
              </div>
              <a href="/file" style={{ background:'#E8731A', color:'white', fontSize:'13px', fontWeight:'700', textDecoration:'none', padding:'8px 18px', borderRadius:'8px', marginLeft:'6px' }}>
                + File complaint
              </a>
            </>
          ) : (
            <>
              <a href="/login" style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px', fontWeight:'600', textDecoration:'none', padding:'8px 18px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.12)', marginLeft:'8px' }}>
                Sign in
              </a>
              <a href="/file" style={{ background:'#E8731A', color:'white', fontSize:'13px', fontWeight:'700', textDecoration:'none', padding:'8px 18px', borderRadius:'8px', marginLeft:'6px' }}>
                + File complaint
              </a>
            </>
          )}
        </div>
      </nav>

      {/* ── LOGGED IN VIEW ── */}
      {user && profile ? (
        <div style={{ maxWidth:'860px', margin:'0 auto', padding:'36px 24px' }}>

          {/* Greeting */}
          <div style={{ marginBottom:'32px' }}>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', marginBottom:'6px' }}>Good to see you back</div>
            <h1 style={{ fontSize:'28px', fontWeight:'900', color:'white', letterSpacing:'-0.5px', marginBottom:'8px' }}>
              Hello, {profile.full_name?.split(' ')[0] || 'Nagrik'} 👋
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>Your ward:</span>
              <span style={{ fontSize:'13px', fontWeight:'700', color:'#E8731A', background:'rgba(232,115,26,0.1)', border:'1px solid rgba(232,115,26,0.2)', padding:'3px 10px', borderRadius:'20px' }}>
                📍 {profile.preferred_area} · Ward {profile.preferred_ward}
              </span>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'36px' }}>
            <a href="/file" style={{ background:'#E8731A', borderRadius:'14px', padding:'20px', textDecoration:'none', display:'block' }}>
              <div style={{ fontSize:'22px', marginBottom:'8px' }}>📝</div>
              <div style={{ fontSize:'15px', fontWeight:'800', color:'white', marginBottom:'3px' }}>File complaint</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)' }}>Report a civic issue</div>
            </a>
            <a href="/my-complaints" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'20px', textDecoration:'none', display:'block', transition:'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.08)')}>
              <div style={{ fontSize:'22px', marginBottom:'8px' }}>📋</div>
              <div style={{ fontSize:'15px', fontWeight:'800', color:'white', marginBottom:'3px' }}>My complaints</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{myComplaints.length} filed by you</div>
            </a>
            <a href="/wards" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'20px', textDecoration:'none', display:'block', transition:'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.08)')}>
              <div style={{ fontSize:'22px', marginBottom:'8px' }}>🗺️</div>
              <div style={{ fontSize:'15px', fontWeight:'800', color:'white', marginBottom:'3px' }}>Ward map</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>Nagpur heatmap</div>
            </a>
          </div>

          {/* My ward stats */}
          {wardComplaints.length > 0 && (
            <div style={{ marginBottom:'32px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                <div>
                  <div style={{ fontSize:'15px', fontWeight:'700', color:'white' }}>Issues in {profile.preferred_area}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>Your ward's civic complaints</div>
                </div>
                <a href={`/feed`} style={{ fontSize:'12px', color:'#E8731A', textDecoration:'none', fontWeight:'600' }}>View all →</a>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'14px' }}>
                {[
                  { label:'Total in ward', val: wardStats.total, color:'#E8731A' },
                  { label:'Still open', val: wardStats.open, color:'#E05252' },
                  { label:'Resolved', val: wardStats.resolved, color:'#3DAA6E' },
                ].map((s,i) => (
                  <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'14px', textAlign:'center' }}>
                    <div style={{ fontSize:'22px', fontWeight:'800', color:s.color }}>{s.val}</div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'3px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {wardComplaints.map(c => (
                <div key={c.id} onClick={() => window.location.href=`/complaint/${c.id}`}
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'14px 18px', marginBottom:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', transition:'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.07)')}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:'8px', marginBottom:'5px', flexWrap:'wrap', alignItems:'center' }}>
                      <span style={{ fontSize:'11px', fontWeight:'700', color: CAT_COLOR[c.category]||'#888', textTransform:'uppercase', letterSpacing:'0.3px' }}>{c.category}</span>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>·</span>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{daysSince(c.created_at)}</span>
                    </div>
                    <div style={{ fontSize:'14px', fontWeight:'600', color:'rgba(255,255,255,0.85)' }}>{c.title}</div>
                  </div>
                  <span style={{ fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px', whiteSpace:'nowrap',
                    background: c.status==='resolved' ? 'rgba(61,170,110,0.15)' : c.status==='progress' ? 'rgba(200,146,10,0.15)' : 'rgba(224,82,82,0.15)',
                    color: c.status==='resolved' ? '#3DAA6E' : c.status==='progress' ? '#C8920A' : '#E05252'
                  }}>
                    {c.status==='progress' ? 'In Progress' : c.status==='resolved' ? 'Resolved' : 'Open'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* My recent complaints */}
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
                <div key={c.id} onClick={() => window.location.href=`/complaint/${c.id}`}
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderLeft:'3px solid #E8731A', borderRadius:'12px', padding:'14px 18px', marginBottom:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px' }}
                  onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background='rgba(255,255,255,0.03)')}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:'8px', marginBottom:'5px', alignItems:'center', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'11px', fontWeight:'700', color: CAT_COLOR[c.category]||'#888', textTransform:'uppercase', letterSpacing:'0.3px' }}>{c.category}</span>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>·</span>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{c.area || `Ward ${c.ward_number}`}</span>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>·</span>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{daysSince(c.created_at)}</span>
                    </div>
                    <div style={{ fontSize:'14px', fontWeight:'600', color:'rgba(255,255,255,0.85)' }}>{c.title}</div>
                  </div>
                  <span style={{ fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px', whiteSpace:'nowrap',
                    background: c.status==='resolved' ? 'rgba(61,170,110,0.15)' : c.status==='progress' ? 'rgba(200,146,10,0.15)' : 'rgba(224,82,82,0.15)',
                    color: c.status==='resolved' ? '#3DAA6E' : c.status==='progress' ? '#C8920A' : '#E05252'
                  }}>
                    {c.status==='progress' ? 'In Progress' : c.status==='resolved' ? 'Resolved' : 'Open'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {myComplaints.length === 0 && wardComplaints.length === 0 && (
            <div style={{ textAlign:'center', padding:'48px 24px', background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:'32px', marginBottom:'14px' }}>🏙️</div>
              <div style={{ fontSize:'16px', fontWeight:'700', color:'white', marginBottom:'6px' }}>No complaints yet in {profile.preferred_area}</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', marginBottom:'20px' }}>Be the first to report a civic issue in your area.</div>
              <a href="/file" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'14px', textDecoration:'none', padding:'12px 24px', borderRadius:'8px', display:'inline-block' }}>
                File first complaint
              </a>
            </div>
          )}
        </div>

      ) : (

        /* ── LOGGED OUT VIEW ── */
        <>
          {/* Hero */}
          <div style={{ padding:'90px 32px 70px', maxWidth:'820px', margin:'0 auto', textAlign:'center' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(232,115,26,0.1)', border:'1px solid rgba(232,115,26,0.2)', color:'#E8731A', fontSize:'12px', fontWeight:'600', padding:'6px 14px', borderRadius:'20px', marginBottom:'28px', letterSpacing:'0.5px' }}>
              <span style={{ width:'6px', height:'6px', background:'#E8731A', borderRadius:'50%', display:'inline-block', animation:'pulse 1.5s infinite' }}/>
              NAGPUR · 162 WARDS · LIVE
            </div>
            <h1 style={{ fontSize:'clamp(40px,7vw,72px)', fontWeight:'900', color:'white', lineHeight:'1.05', marginBottom:'20px', letterSpacing:'-2px' }}>
              Your city.<br/>
              <span style={{ color:'#E8731A' }}>Your voice.</span>
            </h1>
            <p style={{ fontSize:'18px', color:'rgba(255,255,255,0.45)', maxWidth:'500px', margin:'0 auto 40px', lineHeight:'1.7' }}>
              Nagpur's first public civic complaint tracker. File issues about roads, drainage, garbage and more — and track them until they're resolved.
            </p>

            {/* Dual CTA */}
            <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap', marginBottom:'20px' }}>
              <a href="/file" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'16px', textDecoration:'none', padding:'16px 36px', borderRadius:'12px', display:'inline-flex', alignItems:'center', gap:'8px' }}>
                <span>📝</span> File a complaint
              </a>
              <a href="/login" style={{ background:'rgba(255,255,255,0.07)', color:'white', fontWeight:'600', fontSize:'16px', textDecoration:'none', padding:'16px 36px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.12)', display:'inline-flex', alignItems:'center', gap:'8px' }}>
                <span>🔐</span> Sign in / Join
              </a>
            </div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.25)' }}>
              No account needed to file · Signing in lets you track your complaints · Free forever
            </div>
          </div>

          {/* Why sign in banner */}
          <div style={{ background:'rgba(232,115,26,0.06)', borderTop:'1px solid rgba(232,115,26,0.15)', borderBottom:'1px solid rgba(232,115,26,0.15)', padding:'28px 32px', marginBottom:'0' }}>
            <div style={{ maxWidth:'820px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'24px', flexWrap:'wrap' }}>
              <div>
                <div style={{ fontSize:'15px', fontWeight:'700', color:'white', marginBottom:'6px' }}>🔐 Sign in to get more from nagrik</div>
                <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
                  {['Track your complaints', 'Get ward-level updates', 'Build your civic profile'].map(f => (
                    <div key={f} style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', display:'flex', alignItems:'center', gap:'5px' }}>
                      <span style={{ color:'#3DAA6E' }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>
              <a href="/login" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'13px', textDecoration:'none', padding:'10px 24px', borderRadius:'8px', whiteSpace:'nowrap', flexShrink:0 }}>
                Create free account →
              </a>
            </div>
          </div>

          {/* Global stats */}
          <div style={{ maxWidth:'820px', margin:'0 auto', padding:'48px 32px 0' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'48px' }}>
              {[
                { label:'Total filed', val: stats.total, color:'#E8731A', icon:'📋' },
                { label:'Open', val: stats.open, color:'#E05252', icon:'🔴' },
                { label:'In progress', val: stats.progress, color:'#C8920A', icon:'🟡' },
                { label:'Resolved', val: stats.resolved, color:'#3DAA6E', icon:'✅' },
              ].map((s,i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'20px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:'22px', marginBottom:'6px' }}>{s.icon}</div>
                  <div style={{ fontSize:'28px', fontWeight:'800', color: s.val > 0 ? s.color : 'rgba(255,255,255,0.15)' }}>
                    {loading ? '—' : s.val}
                  </div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Resolution rate bar */}
            {stats.total > 0 && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'20px 24px', marginBottom:'40px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                  <span style={{ fontSize:'14px', fontWeight:'600', color:'white' }}>City resolution rate</span>
                  <span style={{ fontSize:'14px', fontWeight:'800', color:'#3DAA6E' }}>{resolutionRate}%</span>
                </div>
                <div style={{ height:'8px', background:'rgba(255,255,255,0.07)', borderRadius:'4px', overflow:'hidden' }}>
                  <div style={{ height:'100%', background:'linear-gradient(90deg,#E8731A,#3DAA6E)', borderRadius:'4px', width:`${resolutionRate}%`, transition:'width 1s ease' }}/>
                </div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', marginTop:'8px' }}>
                  {stats.resolved} of {stats.total} complaints resolved across Nagpur
                </div>
              </div>
            )}

            {/* Recent complaints */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <div>
                <div style={{ fontSize:'16px', fontWeight:'700', color:'white' }}>Recent complaints</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>Public · Anyone can view and upvote</div>
              </div>
              <a href="/feed" style={{ fontSize:'13px', color:'#E8731A', textDecoration:'none', fontWeight:'600' }}>View all →</a>
            </div>

            {loading && (
              <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.2)', fontSize:'14px' }}>Loading...</div>
            )}

            {!loading && complaints.length === 0 && (
              <div style={{ textAlign:'center', padding:'56px 24px', background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize:'32px', marginBottom:'12px' }}>🏙️</div>
                <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.3)', marginBottom:'20px' }}>No complaints yet. Be the first Nagpur citizen to file one.</div>
                <a href="/file" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'14px', textDecoration:'none', padding:'12px 24px', borderRadius:'8px', display:'inline-block' }}>
                  File first complaint
                </a>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'48px' }}>
              {complaints.map(c => (
                <div key={c.id} onClick={() => window.location.href=`/complaint/${c.id}`}
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'16px', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.background='rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='rgba(255,255,255,0.03)' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'11px', fontWeight:'700', color: CAT_COLOR[c.category]||'#999', textTransform:'uppercase', letterSpacing:'0.3px' }}>{c.category}</span>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>·</span>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{c.area || `Ward ${c.ward_number}`}</span>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>·</span>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{daysSince(c.created_at)}</span>
                    </div>
                    <div style={{ fontSize:'14px', fontWeight:'600', color:'rgba(255,255,255,0.85)' }}>{c.title}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <span style={{ fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px', whiteSpace:'nowrap',
                      background: c.status==='resolved' ? 'rgba(61,170,110,0.15)' : c.status==='progress' ? 'rgba(200,146,10,0.15)' : 'rgba(224,82,82,0.15)',
                      color: c.status==='resolved' ? '#3DAA6E' : c.status==='progress' ? '#C8920A' : '#E05252'
                    }}>
                      {c.status==='progress' ? 'In Progress' : c.status==='resolved' ? 'Resolved' : 'Open'}
                    </span>
                    <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'16px' }}>→</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature cards */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'64px' }}>
              {[
                { icon:'📍', title:'File in 60 seconds', desc:'Pick your area, describe the issue, submit. AI auto-detects category. No bureaucracy, no confusion.' },
                { icon:'🔍', title:'Track publicly', desc:'Every complaint gets a unique ID and a live status timeline. Anyone can see if it moved.' },
                { icon:'📊', title:'Ward transparency', desc:'See which areas have the most problems and which departments are slowest to respond.' },
                { icon:'🤖', title:'AI-powered', desc:'Gemini AI auto-tags your complaint to the right NMC department. Works in Marathi, Hindi, and English.' },
              ].map((f,i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'22px' }}>
                  <div style={{ fontSize:'26px', marginBottom:'10px' }}>{f.icon}</div>
                  <div style={{ fontSize:'14px', fontWeight:'700', color:'white', marginBottom:'6px' }}>{f.title}</div>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', lineHeight:'1.6' }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'64px 32px', textAlign:'center', background:'rgba(255,255,255,0.01)' }}>
            <h2 style={{ fontSize:'32px', fontWeight:'900', color:'white', letterSpacing:'-0.5px', marginBottom:'10px' }}>
              Ready to make Nagpur better?
            </h2>
            <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.35)', marginBottom:'32px', maxWidth:'480px', margin:'0 auto 32px', lineHeight:'1.6' }}>
              Join citizens already holding the city accountable. File complaints, track them live, and build a record your ward can't ignore.
            </p>
            <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
              <a href="/login" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'15px', textDecoration:'none', padding:'15px 36px', borderRadius:'10px' }}>
                Create free account →
              </a>
              <a href="/file" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', fontWeight:'600', fontSize:'15px', textDecoration:'none', padding:'15px 36px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)' }}>
                File without account
              </a>
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'20px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px' }}>
            <div style={{ fontSize:'18px', fontWeight:'900', color:'#E8731A' }}>nagrik</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.2)' }}>Built for Nagpur. Free forever. No ads.</div>
            <a href="/admin/login" style={{ fontSize:'12px', color:'rgba(255,255,255,0.15)', textDecoration:'none' }}>NMC Admin →</a>
          </div>
        </>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </main>
  )
}