'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const CAT_COLORS: Record<string, string> = {
  Drainage:'#C8920A', Road:'#4A4ACB', Garbage:'#1B7A4A',
  Water:'#1A6EA8', Encroachment:'#C0392B', Sanitation:'#7B2FA8',
  'Street Light':'#E65100', Other:'#555'
}

export default function Home() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [stats, setStats] = useState({ total:0, open:0, progress:0, resolved:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('complaints').select('*')
        .order('created_at', { ascending: false }).limit(5)
      if (data) {
        setComplaints(data)
        const all = await supabase.from('complaints').select('status')
        if (all.data) {
          setStats({
            total: all.data.length,
            open: all.data.filter((c:any) => c.status==='open').length,
            progress: all.data.filter((c:any) => c.status==='progress').length,
            resolved: all.data.filter((c:any) => c.status==='resolved').length,
          })
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  function daysSince(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const days = Math.floor(diff / (1000*60*60*24))
    return days === 0 ? 'Today' : days === 1 ? '1d ago' : `${days}d ago`
  }

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter', system-ui, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 32px', height:'58px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'rgba(13,13,20,0.85)', backdropFilter:'blur(12px)', zIndex:100 }}>
        <div style={{ fontSize:'20px', fontWeight:'800', color:'#E8731A', letterSpacing:'-0.5px' }}>nagrik</div>
        <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
          {['Feed','Wards'].map(item => (
            <a key={item} href={`/${item.toLowerCase()}`} style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px', textDecoration:'none', padding:'6px 14px', borderRadius:'8px', transition:'all 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color='white')}
              onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.45)')}>
              {item}
            </a>
          ))}
          <a href="/file" style={{ background:'#E8731A', color:'white', fontSize:'13px', fontWeight:'700', textDecoration:'none', padding:'8px 18px', borderRadius:'8px', marginLeft:'8px' }}>
            + File complaint
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding:'80px 32px 64px', maxWidth:'800px', margin:'0 auto', textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(232,115,26,0.1)', border:'1px solid rgba(232,115,26,0.2)', color:'#E8731A', fontSize:'12px', fontWeight:'600', padding:'6px 14px', borderRadius:'20px', marginBottom:'28px', letterSpacing:'0.5px' }}>
          <span style={{ width:'6px', height:'6px', background:'#E8731A', borderRadius:'50%', display:'inline-block' }}/>
          NAGPUR · 162 WARDS · LIVE
        </div>
        <h1 style={{ fontSize:'clamp(40px,7vw,72px)', fontWeight:'900', color:'white', lineHeight:'1.05', marginBottom:'20px', letterSpacing:'-2px' }}>
          Your city.<br/>
          <span style={{ color:'#E8731A' }}>Your voice.</span>
        </h1>
        <p style={{ fontSize:'18px', color:'rgba(255,255,255,0.45)', maxWidth:'480px', margin:'0 auto 36px', lineHeight:'1.7' }}>
          File, track & resolve civic issues in Nagpur. Transparent. Public. Accountable.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <a href="/file" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'15px', textDecoration:'none', padding:'14px 32px', borderRadius:'10px', display:'inline-block' }}>
            + File a complaint
          </a>
          <a href="/feed" style={{ background:'rgba(255,255,255,0.05)', color:'white', fontWeight:'600', fontSize:'15px', textDecoration:'none', padding:'14px 32px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)', display:'inline-block' }}>
            Browse complaints
          </a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'0 32px 64px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'48px' }}>
          {[
            { label:'Total filed', val:stats.total, color:'#E8731A' },
            { label:'Open', val:stats.open, color:'#E05252' },
            { label:'In progress', val:stats.progress, color:'#C8920A' },
            { label:'Resolved', val:stats.resolved, color:'#3DAA6E' },
          ].map((s,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'20px 16px', textAlign:'center' }}>
              <div style={{ fontSize:'28px', fontWeight:'800', color: s.val > 0 ? s.color : 'rgba(255,255,255,0.15)' }}>
                {loading ? '—' : s.val}
              </div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent feed */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <div style={{ fontSize:'13px', fontWeight:'600', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Recent complaints</div>
          <a href="/feed" style={{ fontSize:'13px', color:'#E8731A', textDecoration:'none', fontWeight:'600' }}>View all →</a>
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.2)', fontSize:'14px' }}>Loading...</div>
        )}

        {!loading && complaints.length === 0 && (
          <div style={{ textAlign:'center', padding:'56px 24px', background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.3)', marginBottom:'20px' }}>No complaints yet. Be the first.</div>
            <a href="/file" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'14px', textDecoration:'none', padding:'12px 24px', borderRadius:'8px', display:'inline-block' }}>
              File the first complaint
            </a>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {complaints.map(c => (
            <div key={c.id} onClick={() => window.location.href=`/complaint/${c.id}`}
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'16px', transition:'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.07)')}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                  <span style={{ fontSize:'11px', fontWeight:'700', color: CAT_COLORS[c.category] || '#999', textTransform:'uppercase', letterSpacing:'0.3px' }}>
                    {c.category}
                  </span>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>·</span>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>Ward {c.ward_number}</span>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>·</span>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{daysSince(c.created_at)}</span>
                </div>
                <div style={{ fontSize:'14px', fontWeight:'600', color:'rgba(255,255,255,0.85)' }}>{c.title}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <span style={{ fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px',
                  background: c.status==='resolved' ? 'rgba(61,170,110,0.15)' : c.status==='progress' ? 'rgba(200,146,10,0.15)' : 'rgba(224,82,82,0.15)',
                  color: c.status==='resolved' ? '#3DAA6E' : c.status==='progress' ? '#C8920A' : '#E05252'
                }}>
                  {c.status === 'progress' ? 'In Progress' : c.status === 'resolved' ? 'Resolved' : 'Open'}
                </span>
                <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'16px' }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'64px 32px', textAlign:'center' }}>
        <div style={{ fontSize:'28px', fontWeight:'800', color:'white', marginBottom:'10px', letterSpacing:'-0.5px' }}>
          Know a civic issue in Nagpur?
        </div>
        <div style={{ fontSize:'15px', color:'rgba(255,255,255,0.35)', marginBottom:'28px' }}>
          File it in 60 seconds. Make it public. Hold the city accountable.
        </div>
        <a href="/file" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'15px', textDecoration:'none', padding:'14px 36px', borderRadius:'10px', display:'inline-block' }}>
          + File a complaint
        </a>
      </div>
    </main>
  )
}