'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const CATEGORIES = ['Drainage','Road','Garbage','Water','Encroachment','Sanitation','Street Light','Other']
const CAT_COLORS: Record<string, string> = {
  Drainage:'#FFF8E6', Road:'#EEF0FF', Garbage:'#E8F5EE',
  Water:'#E6F3FD', Encroachment:'#FCE8E6', Sanitation:'#F0E8FC',
  'Street Light':'#FFF3E0', Other:'#F5F5F5'
}
const CAT_TEXT: Record<string, string> = {
  Drainage:'#C8920A', Road:'#4A4ACB', Garbage:'#1B7A4A',
  Water:'#1A6EA8', Encroachment:'#C0392B', Sanitation:'#7B2FA8',
  'Street Light':'#E65100', Other:'#555'
}

export default function Home() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, open: 0, progress: 0, resolved: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)
      if (data) {
        setComplaints(data)
        const all = await supabase.from('complaints').select('status')
        if (all.data) {
          setStats({
            total: all.data.length,
            open: all.data.filter((c:any) => c.status === 'open').length,
            progress: all.data.filter((c:any) => c.status === 'progress').length,
            resolved: all.data.filter((c:any) => c.status === 'resolved').length,
          })
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main style={{ minHeight:'100vh', background:'#F7F7F9', fontFamily:'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ background:'#1A1A2E', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:'22px', fontWeight:'900', color:'#E8731A', letterSpacing:'-0.5px' }}>
          nagrik
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <a href="/feed" style={{ color:'rgba(255,255,255,0.6)', fontSize:'14px', textDecoration:'none', padding:'6px 14px' }}>Feed</a>
          <a href="/wards" style={{ color:'rgba(255,255,255,0.6)', fontSize:'14px', textDecoration:'none', padding:'6px 14px' }}>Wards</a>
          <a href="/insights" style={{ color:'rgba(255,255,255,0.6)', fontSize:'14px', textDecoration:'none', padding:'6px 14px' }}>Insights</a>
          <a href="/file" style={{ background:'#E8731A', color:'white', fontSize:'13px', fontWeight:'700', textDecoration:'none', padding:'8px 18px', borderRadius:'8px' }}>+ File complaint</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background:'#1A1A2E', padding:'48px 24px 40px' }}>
        <div style={{ maxWidth:'680px', margin:'0 auto' }}>
          <div style={{ display:'inline-block', background:'rgba(232,115,26,0.15)', color:'#F4A55A', fontSize:'12px', fontWeight:'700', padding:'4px 12px', borderRadius:'20px', marginBottom:'16px', letterSpacing:'0.5px' }}>
            NAGPUR · 162 WARDS
          </div>
          <h1 style={{ fontSize:'clamp(32px,6vw,52px)', fontWeight:'900', color:'white', lineHeight:'1.1', marginBottom:'16px' }}>
            Your city.<br/>
            <span style={{ color:'#E8731A' }}>Your voice.</span>
          </h1>
          <p style={{ fontSize:'17px', color:'rgba(255,255,255,0.55)', maxWidth:'480px', lineHeight:'1.6', marginBottom:'28px' }}>
            File, track & resolve civic issues in Nagpur — ward by ward, issue by issue. Transparent. Public. Accountable.
          </p>
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
            <a href="/file" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'15px', textDecoration:'none', padding:'14px 28px', borderRadius:'10px', display:'inline-block' }}>
              + File a complaint
            </a>
            <a href="/feed" style={{ background:'rgba(255,255,255,0.08)', color:'white', fontWeight:'600', fontSize:'15px', textDecoration:'none', padding:'14px 28px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', display:'inline-block' }}>
              Browse complaints
            </a>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background:'white', borderBottom:'1px solid #EBEBEB' }}>
        <div style={{ maxWidth:'680px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
          {[
            { label:'Total filed', val: stats.total, color:'#E8731A' },
            { label:'Open', val: stats.open, color:'#C0392B' },
            { label:'In progress', val: stats.progress, color:'#C8920A' },
            { label:'Resolved', val: stats.resolved, color:'#1B7A4A' },
          ].map((s, i) => (
            <div key={i} style={{ padding:'20px 16px', textAlign:'center', borderRight: i < 3 ? '1px solid #EBEBEB' : 'none' }}>
              <div style={{ fontSize:'26px', fontWeight:'800', color: s.val > 0 ? s.color : '#CCC' }}>
                {loading ? '—' : s.val.toLocaleString()}
              </div>
              <div style={{ fontSize:'11px', color:'#999', marginTop:'3px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent complaints */}
      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'700', color:'#1A1A2E' }}>Recent complaints</h2>
          <a href="/feed" style={{ fontSize:'13px', color:'#E8731A', textDecoration:'none', fontWeight:'600' }}>View all →</a>
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:'40px', color:'#999', fontSize:'14px' }}>Loading complaints...</div>
        )}

        {!loading && complaints.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 24px', background:'white', borderRadius:'12px', border:'1px solid #EBEBEB' }}>
            <div style={{ fontSize:'32px', marginBottom:'12px' }}>🏙️</div>
            <div style={{ fontSize:'16px', fontWeight:'700', color:'#1A1A2E', marginBottom:'6px' }}>No complaints yet</div>
            <div style={{ fontSize:'14px', color:'#999', marginBottom:'20px' }}>Be the first to file a civic issue in Nagpur.</div>
            <a href="/file" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'14px', textDecoration:'none', padding:'12px 24px', borderRadius:'8px', display:'inline-block' }}>
              File the first complaint
            </a>
          </div>
        )}

        {!loading && complaints.map((c) => (
          <div key={c.id} style={{ background:'white', border:'1px solid #EBEBEB', borderRadius:'12px', padding:'16px', marginBottom:'10px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
              <span style={{ background: CAT_COLORS[c.category] || '#F5F5F5', color: CAT_TEXT[c.category] || '#555', fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', textTransform:'uppercase', letterSpacing:'0.3px' }}>
                {c.category}
              </span>
              <span style={{ fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px',
                background: c.status==='resolved' ? '#E8F5EE' : c.status==='progress' ? '#FFF8E6' : '#FCE8E6',
                color: c.status==='resolved' ? '#1B7A4A' : c.status==='progress' ? '#C8920A' : '#C0392B'
              }}>
                {c.status === 'progress' ? 'In Progress' : c.status === 'resolved' ? 'Resolved' : 'Open'}
              </span>
            </div>
            <div style={{ fontSize:'14px', fontWeight:'600', color:'#1A1A2E', marginBottom:'6px' }}>{c.title}</div>
            <div style={{ fontSize:'12px', color:'#999', display:'flex', gap:'16px' }}>
              {c.ward_number && <span>Ward {c.ward_number}{c.area ? `, ${c.area}` : ''}</span>}
              <span>{new Date(c.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div style={{ background:'#1A1A2E', padding:'48px 24px', textAlign:'center' }}>
        <div style={{ fontSize:'24px', fontWeight:'800', color:'white', marginBottom:'10px' }}>
          Know a civic issue in Nagpur?
        </div>
        <div style={{ fontSize:'15px', color:'rgba(255,255,255,0.5)', marginBottom:'24px' }}>
          File it in 60 seconds. Make it public. Hold the city accountable.
        </div>
        <a href="/file" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'16px', textDecoration:'none', padding:'16px 36px', borderRadius:'10px', display:'inline-block' }}>
          + File a complaint
        </a>
      </div>

    </main>
  )
}