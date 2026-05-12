'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useRouter } from 'next/navigation'

const CAT_EMOJI: Record<string,string> = {
  Drainage:'🌊', Road:'🚧', Garbage:'🗑️', Water:'💧',
  Encroachment:'🚫', Sanitation:'🧹', 'Street Light':'💡', Other:'📋'
}
const CAT_COLOR: Record<string,string> = {
  Drainage:'#C8920A', Road:'#4A4ACB', Garbage:'#1B7A4A',
  Water:'#1A6EA8', Encroachment:'#C0392B', Sanitation:'#7B2FA8',
  'Street Light':'#E65100', Other:'#888'
}

export default function PublicFeed() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true)
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState({ total:0, resolved:0 })
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) { router.push('/'); return }
      setChecking(false)
      load()
    })
  }, [])

  async function load() {
    const { data } = await supabase
      .from('complaints')
      .select('id, title, category, area, ward_number, status, upvotes, created_at, description')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setComplaints(data)
    const { data: all } = await supabase.from('complaints').select('status')
    if (all) setStats({ total:all.length, resolved:all.filter((c:any)=>c.status==='resolved').length })
    setLoading(false)
  }

  async function upvote(id: string, current: number) {
    if (upvoted.has(id)) return
    await supabase.from('complaints').update({ upvotes: current+1 }).eq('id', id)
    setComplaints(cs => cs.map(c => c.id===id ? { ...c, upvotes: current+1 } : c))
    setUpvoted(prev => new Set([...prev, id]))
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const h = Math.floor(diff/3600000)
    const d = Math.floor(diff/86400000)
    if (h < 1) return 'Just now'
    if (h < 24) return h+'h ago'
    return d+'d ago'
  }

  const filtered = filter==='all' ? complaints : complaints.filter(c => c.status===filter)

  if (checking) return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ color:'rgba(255,255,255,0.2)', fontSize:'14px' }}>Loading...</div>
    </main>
  )

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif" }}>

      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 20px', height:'54px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(13,13,20,0.92)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ fontSize:'18px', fontWeight:'900', color:'#E8731A' }}>nagrik</div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => router.push('/file')}
            style={{ background:'#E8731A', color:'white', border:'none', padding:'7px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>
            + File complaint
          </button>
          <button onClick={() => router.push('/login')}
            style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.1)', padding:'7px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>
            Sign in
          </button>
        </div>
      </nav>

      <div style={{ background:'rgba(232,115,26,0.06)', borderBottom:'1px solid rgba(232,115,26,0.12)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'center', gap:'20px', flexWrap:'wrap' }}>
        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', gap:'6px' }}>
          <span style={{ width:'6px', height:'6px', background:'#E8731A', borderRadius:'50%', display:'inline-block', animation:'pulse 2s infinite' }}/>
          <strong style={{ color:'white' }}>{stats.total}</strong> complaints filed in Nagpur
        </div>
        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>
          <strong style={{ color:'#3DAA6E' }}>{stats.resolved}</strong> resolved
        </div>
        <div style={{ height:'14px', width:'1px', background:'rgba(255,255,255,0.1)' }}/>
        <button onClick={() => router.push('/login')}
          style={{ background:'transparent', border:'none', color:'#E8731A', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>
          Sign in to see full details →
        </button>
      </div>

      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'16px 16px 0', display:'flex', gap:'8px', flexWrap:'wrap' }}>
        {[{k:'all',l:'All'},{k:'open',l:'Open'},{k:'progress',l:'In Progress'},{k:'resolved',l:'Resolved'}].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            style={{ padding:'6px 14px', borderRadius:'20px', border:'1px solid', borderColor:filter===f.k?'#E8731A':'rgba(255,255,255,0.08)', background:filter===f.k?'rgba(232,115,26,0.15)':'transparent', color:filter===f.k?'#E8731A':'rgba(255,255,255,0.4)', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>
            {f.l}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'16px' }}>

        {loading && <div style={{ textAlign:'center', padding:'48px', color:'rgba(255,255,255,0.2)' }}>Loading issues...</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px' }}>
            <div style={{ fontSize:'32px', marginBottom:'12px' }}>🏙️</div>
            <div style={{ fontSize:'15px', color:'rgba(255,255,255,0.4)', marginBottom:'16px' }}>No complaints yet</div>
            <button onClick={() => router.push('/file')}
              style={{ background:'#E8731A', color:'white', border:'none', padding:'12px 24px', borderRadius:'8px', fontSize:'14px', fontWeight:'700', cursor:'pointer' }}>
              File first complaint
            </button>
          </div>
        )}

        {filtered.map(c => (
          <div key={c.id}
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', marginBottom:'12px', overflow:'hidden', transition:'border-color 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.12)')}
            onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.07)')}>

            <div style={{ padding:'16px 18px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:CAT_COLOR[c.category]+'20', border:'1px solid '+CAT_COLOR[c.category]+'40', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>
                  {CAT_EMOJI[c.category]||'📋'}
                </div>
                <div>
                  <div style={{ fontSize:'12px', fontWeight:'700', color:CAT_COLOR[c.category]||'#888', textTransform:'uppercase', letterSpacing:'0.4px' }}>{c.category}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'1px' }}>
                    📍 {c.area||'Ward '+c.ward_number} · {timeAgo(c.created_at)}
                  </div>
                </div>
              </div>
              <span style={{ fontSize:'10px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px', whiteSpace:'nowrap',
                background:c.status==='resolved'?'rgba(61,170,110,0.15)':c.status==='progress'?'rgba(200,146,10,0.15)':'rgba(224,82,82,0.15)',
                color:c.status==='resolved'?'#3DAA6E':c.status==='progress'?'#C8920A':'#E05252'
              }}>
                {c.status==='progress'?'In Progress':c.status==='resolved'?'✓ Resolved':'Open'}
              </span>
            </div>

            <div style={{ padding:'0 18px 12px' }}>
              <div style={{ fontSize:'15px', fontWeight:'700', color:'rgba(255,255,255,0.9)', lineHeight:'1.4', marginBottom:c.description?'8px':'0' }}>{c.title}</div>
              {c.description && (
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', lineHeight:'1.5' }}>
                  {c.description.length>120?c.description.slice(0,120)+'...':c.description}
                </div>
              )}
            </div>

            <div style={{ padding:'10px 18px 14px', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <button onClick={() => upvote(c.id, c.upvotes||0)}
                style={{ display:'flex', alignItems:'center', gap:'7px', background:upvoted.has(c.id)?'rgba(232,115,26,0.15)':'rgba(255,255,255,0.05)', border:'1px solid '+(upvoted.has(c.id)?'rgba(232,115,26,0.4)':'rgba(255,255,255,0.1)'), borderRadius:'20px', padding:'7px 16px', cursor:upvoted.has(c.id)?'default':'pointer', color:upvoted.has(c.id)?'#E8731A':'rgba(255,255,255,0.5)', fontSize:'13px', fontWeight:'600', transition:'all 0.15s' }}>
                <span style={{ fontSize:'14px' }}>{upvoted.has(c.id)?'🔥':'▲'}</span>
                {c.upvotes||0} {upvoted.has(c.id)?'Supported':'Support this'}
              </button>
              <button onClick={() => router.push('/login')}
                style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:'12px' }}>
                🔐 Sign in to track
              </button>
            </div>
          </div>
        ))}

        {!loading && filtered.length > 0 && (
          <div style={{ background:'rgba(232,115,26,0.06)', border:'1px solid rgba(232,115,26,0.2)', borderRadius:'14px', padding:'20px', textAlign:'center', marginTop:'8px' }}>
            <div style={{ fontSize:'16px', marginBottom:'8px' }}>🔐</div>
            <div style={{ fontSize:'14px', fontWeight:'700', color:'white', marginBottom:'4px' }}>Want to track your complaints?</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'14px', lineHeight:'1.5' }}>
              Sign in to see ward heatmaps, full details, and get notified when issues are resolved.
            </div>
            <button onClick={() => router.push('/login')}
              style={{ background:'#E8731A', color:'white', border:'none', padding:'10px 24px', borderRadius:'8px', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
              Create free account →
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </main>
  )
}