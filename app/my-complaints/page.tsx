'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useRouter } from 'next/navigation'

const CAT_COLOR: Record<string,string> = {
  Drainage:'#C8920A', Road:'#4A4ACB', Garbage:'#1B7A4A',
  Water:'#1A6EA8', Encroachment:'#C0392B', Sanitation:'#7B2FA8',
  'Street Light':'#E65100', Other:'#888'
}

export default function MyComplaints() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({ total:0, open:0, progress:0, resolved:0 })

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/login'); return }
      setUser(u)

      const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).single()
      if (p) setProfile(p)

      const { data } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false })

      if (data) {
        setComplaints(data)
        setStats({
          total: data.length,
          open: data.filter((c:any) => c.status==='open').length,
          progress: data.filter((c:any) => c.status==='progress').length,
          resolved: data.filter((c:any) => c.status==='resolved').length,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  function daysSince(date: string) {
    const days = Math.floor((Date.now()-new Date(date).getTime())/86400000)
    return days===0?'Today':days===1?'1d ago':`${days}d ago`
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 32px', height:'58px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(13,13,20,0.85)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:100 }}>
        <a href="/" style={{ fontSize:'20px', fontWeight:'900', color:'#E8731A', textDecoration:'none' }}>nagrik</a>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <a href="/feed" style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', textDecoration:'none', padding:'6px 14px' }}>Feed</a>
          <a href="/wards" style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', textDecoration:'none', padding:'6px 14px' }}>Wards</a>
          <button onClick={logout} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', padding:'6px 14px', borderRadius:'8px', fontSize:'13px', cursor:'pointer' }}>
            Sign out
          </button>
          <a href="/file" style={{ background:'#E8731A', color:'white', fontSize:'13px', fontWeight:'700', textDecoration:'none', padding:'8px 18px', borderRadius:'8px' }}>+ File</a>
        </div>
      </nav>

      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'32px 24px' }}>

        <div style={{ marginBottom:'28px' }}>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', marginBottom:'4px' }}>Your complaints</div>
          <h1 style={{ fontSize:'26px', fontWeight:'900', color:'white', letterSpacing:'-0.5px', marginBottom:'6px' }}>
            {profile?.full_name ? profile.full_name + "'s complaints" : 'My complaints'}
          </h1>
          {profile?.preferred_area && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(232,115,26,0.1)', border:'1px solid rgba(232,115,26,0.2)', color:'#E8731A', fontSize:'12px', fontWeight:'600', padding:'4px 12px', borderRadius:'20px' }}>
              📍 {profile.preferred_area} · Ward {profile.preferred_ward}
            </div>
          )}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'28px' }}>
          {[
            { label:'Total', val:stats.total, color:'#E8731A' },
            { label:'Open', val:stats.open, color:'#E05252' },
            { label:'In progress', val:stats.progress, color:'#C8920A' },
            { label:'Resolved', val:stats.resolved, color:'#3DAA6E' },
          ].map((s,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', fontWeight:'800', color: s.val>0?s.color:'rgba(255,255,255,0.15)' }}>{s.val}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'3px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading && <div style={{ textAlign:'center', padding:'48px', color:'rgba(255,255,255,0.2)' }}>Loading...</div>}

        {!loading && complaints.length === 0 && (
          <div style={{ textAlign:'center', padding:'56px 24px', background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:'32px', marginBottom:'14px' }}>📋</div>
            <div style={{ fontSize:'16px', fontWeight:'700', color:'white', marginBottom:'6px' }}>No complaints filed yet</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', marginBottom:'20px' }}>
              File your first civic issue and it will appear here.
            </div>
            <a href="/file" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'14px', textDecoration:'none', padding:'12px 24px', borderRadius:'8px', display:'inline-block' }}>
              File a complaint
            </a>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {complaints.map(c => (
            <div key={c.id}
              onClick={() => router.push('/complaint/'+c.id)}
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderLeft:'3px solid #E8731A', borderRadius:'12px', padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'16px', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:'8px', marginBottom:'6px', alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'11px', fontWeight:'700', color: CAT_COLOR[c.category]||'#888', textTransform:'uppercase', letterSpacing:'0.3px' }}>{c.category}</span>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>·</span>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{c.area||'Ward '+c.ward_number}</span>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>·</span>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{daysSince(c.created_at)}</span>
                </div>
                <div style={{ fontSize:'15px', fontWeight:'700', color:'rgba(255,255,255,0.88)' }}>{c.title}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px' }}>
                <span style={{ fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px', whiteSpace:'nowrap',
                  background: c.status==='resolved'?'rgba(61,170,110,0.15)':c.status==='progress'?'rgba(200,146,10,0.15)':'rgba(224,82,82,0.15)',
                  color: c.status==='resolved'?'#3DAA6E':c.status==='progress'?'#C8920A':'#E05252'
                }}>
                  {c.status==='progress'?'In Progress':c.status==='resolved'?'Resolved':'Open'}
                </span>
                <span style={{ color:'rgba(255,255,255,0.15)', fontSize:'13px' }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}