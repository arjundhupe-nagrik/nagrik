'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'

const CAT_COLOR: Record<string,string> = {
  Drainage:'#C8920A', Road:'#4A4ACB', Garbage:'#1B7A4A',
  Water:'#1A6EA8', Encroachment:'#C0392B', Sanitation:'#7B2FA8',
  'Street Light':'#E65100', Other:'#888'
}

export default function FeedPage() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [wardFilter, setWardFilter] = useState('')
  const [stats, setStats] = useState({ total:0, open:0, progress:0, resolved:0 })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending:false })
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

  async function upvote(id: string, current: number) {
    await supabase.from('complaints').update({ upvotes: current+1 }).eq('id', id)
    setComplaints(cs => cs.map(c => c.id===id ? { ...c, upvotes: current+1 } : c))
  }

  function daysSince(date: string) {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
    return days === 0 ? 'Today' : days === 1 ? '1d ago' : `${days}d ago`
  }

  let filtered = [...complaints]
  if (filter !== 'all') filtered = filtered.filter(c => c.status === filter)
  if (wardFilter) filtered = filtered.filter(c => c.ward_number === parseInt(wardFilter))
  if (sortBy === 'votes') filtered.sort((a,b) => (b.upvotes||0) - (a.upvotes||0))
  if (sortBy === 'oldest') filtered.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const nav = { borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 32px', height:'58px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(13,13,20,0.85)', backdropFilter:'blur(12px)', position:'sticky' as const, top:0, zIndex:100 }

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <nav style={nav}>
        <a href="/" style={{ fontSize:'20px', fontWeight:'800', color:'#E8731A', textDecoration:'none' }}>nagrik</a>
        <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
          <a href="/feed" style={{ color:'white', fontSize:'13px', textDecoration:'none', padding:'6px 14px', fontWeight:'600' }}>Feed</a>
          <a href="/wards" style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', textDecoration:'none', padding:'6px 14px' }}>Wards</a>
          <a href="/file" style={{ background:'#E8731A', color:'white', fontSize:'13px', fontWeight:'700', textDecoration:'none', padding:'8px 18px', borderRadius:'8px', marginLeft:'8px' }}>+ File</a>
        </div>
      </nav>

      {/* Header */}
      <div style={{ padding:'40px 32px 32px', maxWidth:'760px', margin:'0 auto' }}>
        <h1 style={{ fontSize:'32px', fontWeight:'900', color:'white', letterSpacing:'-1px', marginBottom:'6px' }}>All complaints</h1>
        <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.35)' }}>Every civic issue filed in Nagpur — public, transparent, trackable.</p>
      </div>

      {/* Stats */}
      <div style={{ maxWidth:'760px', margin:'0 auto', padding:'0 32px 28px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
        {[
          { label:'Total', val:stats.total, color:'#E8731A' },
          { label:'Open', val:stats.open, color:'#E05252' },
          { label:'In progress', val:stats.progress, color:'#C8920A' },
          { label:'Resolved', val:stats.resolved, color:'#3DAA6E' },
        ].map((s,i) => (
          <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
            <div style={{ fontSize:'24px', fontWeight:'800', color: s.val > 0 ? s.color : 'rgba(255,255,255,0.15)' }}>{s.val}</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'3px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth:'760px', margin:'0 auto', padding:'0 32px 48px' }}>

        {/* Filters */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'16px', marginBottom:'20px' }}>
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'12px' }}>
            {[
              { key:'all', label:'All' },
              { key:'open', label:'Open' },
              { key:'progress', label:'In Progress' },
              { key:'resolved', label:'Resolved' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{ padding:'6px 16px', borderRadius:'20px', border:'1px solid', borderColor: filter===f.key ? '#E8731A' : 'rgba(255,255,255,0.08)', background: filter===f.key ? 'rgba(232,115,26,0.15)' : 'transparent', color: filter===f.key ? '#E8731A' : 'rgba(255,255,255,0.4)', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
            <select value={wardFilter} onChange={e => setWardFilter(e.target.value)}
              style={{ padding:'8px 12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', color: wardFilter ? 'white' : 'rgba(255,255,255,0.3)', fontSize:'13px', outline:'none' }}>
              <option value="">All wards</option>
              {Array.from({ length:162 }, (_,i) => i+1).map(w => (
                <option key={w} value={w}>Ward {w}</option>
              ))}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding:'8px 12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', color:'white', fontSize:'13px', outline:'none' }}>
              <option value="latest">Latest first</option>
              <option value="votes">Most upvoted</option>
              <option value="oldest">Oldest first</option>
            </select>
            <span style={{ marginLeft:'auto', fontSize:'13px', color:'rgba(255,255,255,0.25)' }}>
              {filtered.length} complaint{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {loading && <div style={{ textAlign:'center', padding:'48px', color:'rgba(255,255,255,0.2)' }}>Loading...</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px', background:'rgba(255,255,255,0.02)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.25)', marginBottom:'16px' }}>No complaints found</div>
            <a href="/file" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'13px', textDecoration:'none', padding:'10px 20px', borderRadius:'8px', display:'inline-block' }}>File one now</a>
          </div>
        )}

        {!loading && filtered.map(c => (
          <div key={c.id}
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'18px 20px', marginBottom:'8px', display:'flex', gap:'16px', cursor:'pointer', transition:'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.07)')}>

            {/* Upvote */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
              <button onClick={e => { e.stopPropagation(); upvote(c.id, c.upvotes||0) }}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', width:'36px', height:'36px', cursor:'pointer', color:'rgba(255,255,255,0.5)', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(232,115,26,0.15)'; e.currentTarget.style.color='#E8731A'; e.currentTarget.style.borderColor='rgba(232,115,26,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)' }}>
                ▲
              </button>
              <span style={{ fontSize:'12px', fontWeight:'700', color:'rgba(255,255,255,0.4)' }}>{c.upvotes||0}</span>
            </div>

            {/* Content */}
            <div style={{ flex:1 }} onClick={() => window.location.href=`/complaint/${c.id}`}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', flexWrap:'wrap' }}>
                <span style={{ fontSize:'11px', fontWeight:'700', color: CAT_COLOR[c.category]||'#888', textTransform:'uppercase', letterSpacing:'0.3px' }}>{c.category}</span>
                <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.15)' }}>·</span>
                <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>Ward {c.ward_number}{c.area ? ` · ${c.area}` : ''}</span>
                <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.15)' }}>·</span>
                <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{daysSince(c.created_at)}</span>
              </div>
              <div style={{ fontSize:'15px', fontWeight:'700', color:'rgba(255,255,255,0.88)', marginBottom: c.description ? '8px' : '0' }}>{c.title}</div>
              {c.description && (
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', lineHeight:'1.5' }}>
                  {c.description.length > 100 ? c.description.slice(0,100)+'...' : c.description}
                </div>
              )}
            </div>

            {/* Status */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', justifyContent:'space-between', gap:'8px' }}>
              <span style={{ fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px', whiteSpace:'nowrap',
                background: c.status==='resolved' ? 'rgba(61,170,110,0.15)' : c.status==='progress' ? 'rgba(200,146,10,0.15)' : 'rgba(224,82,82,0.15)',
                color: c.status==='resolved' ? '#3DAA6E' : c.status==='progress' ? '#C8920A' : '#E05252'
              }}>
                {c.status==='progress' ? 'In Progress' : c.status==='resolved' ? 'Resolved' : 'Open'}
              </span>
              <span style={{ color:'rgba(255,255,255,0.15)', fontSize:'14px' }}>→</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}