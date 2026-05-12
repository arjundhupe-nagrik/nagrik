'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase.js'
import { useRouter } from 'next/navigation'

const CAT_COLOR: Record<string,string> = {
  Drainage:'#C8920A', Road:'#4A4ACB', Garbage:'#1B7A4A',
  Water:'#1A6EA8', Encroachment:'#C0392B', Sanitation:'#7B2FA8',
  'Street Light':'#E65100', Other:'#888'
}

export default function AdminDashboard() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<any[]>([])
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('open')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stats, setStats] = useState({ total:0, open:0, progress:0, resolved:0, overdue:0 })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (admin) loadComplaints()
  }, [admin, filter, categoryFilter])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/admin/login'); return }

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (!adminData) { router.push('/admin/login'); return }
    setAdmin(adminData)
  }

  async function loadComplaints() {
    setLoading(true)
    let query = supabase.from('complaints').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    if (categoryFilter !== 'all') query = query.eq('category', categoryFilter)
    const { data } = await query
    if (data) {
      setComplaints(data)
      const all = await supabase.from('complaints').select('status, estimated_date')
      if (all.data) {
        const now = new Date()
        setStats({
          total: all.data.length,
          open: all.data.filter((c:any) => c.status === 'open').length,
          progress: all.data.filter((c:any) => c.status === 'progress').length,
          resolved: all.data.filter((c:any) => c.status === 'resolved').length,
          overdue: all.data.filter((c:any) => c.estimated_date && new Date(c.estimated_date) < now && c.status !== 'resolved').length,
        })
      }
    }
    setLoading(false)
  }

  async function quickStatus(id: string, status: string) {
    await supabase.from('complaints').update({
      status,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null
    }).eq('id', id)
    loadComplaints()
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  function daysSince(date: string) {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
    return days === 0 ? 'Today' : days === 1 ? '1d' : `${days}d`
  }

  const CATEGORIES = ['all','Garbage','Drainage','Road','Water','Encroachment','Sanitation','Street Light','Other']

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* Navbar */}
      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 24px', height:'58px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(13,13,20,0.9)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'18px', fontWeight:'900', color:'#E8731A' }}>nagrik</span>
          <span style={{ fontSize:'11px', background:'rgba(200,146,10,0.15)', border:'1px solid rgba(200,146,10,0.3)', padding:'2px 8px', borderRadius:'20px', color:'#C8920A' }}>ADMIN</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          {admin && <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>{admin.name} · {admin.department}</span>}
          <button onClick={logout} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', padding:'6px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'28px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom:'24px' }}>
          <h1 style={{ fontSize:'26px', fontWeight:'900', color:'white', letterSpacing:'-0.5px', marginBottom:'4px' }}>Complaint queue</h1>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.35)' }}>All civic complaints filed by Nagpur citizens</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'10px', marginBottom:'24px' }}>
          {[
            { label:'Total', val:stats.total, color:'#E8731A' },
            { label:'Open', val:stats.open, color:'#E05252' },
            { label:'In progress', val:stats.progress, color:'#C8920A' },
            { label:'Resolved', val:stats.resolved, color:'#3DAA6E' },
            { label:'Overdue', val:stats.overdue, color:'#E05252' },
          ].map((s,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', fontWeight:'800', color: s.val > 0 ? s.color : 'rgba(255,255,255,0.15)' }}>{s.val}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'3px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'14px 16px', marginBottom:'16px' }}>
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'10px' }}>
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
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              style={{ padding:'7px 12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', color:'white', fontSize:'13px', outline:'none' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
            </select>
            <span style={{ marginLeft:'auto', fontSize:'13px', color:'rgba(255,255,255,0.25)' }}>
              {complaints.length} complaint{complaints.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Complaint list */}
        {loading && <div style={{ textAlign:'center', padding:'48px', color:'rgba(255,255,255,0.2)' }}>Loading...</div>}

        {!loading && complaints.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px', background:'rgba(255,255,255,0.02)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.25)', fontSize:'14px' }}>
            No complaints found
          </div>
        )}

        {!loading && complaints.map(c => (
          <div key={c.id}
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'16px 20px', marginBottom:'8px', display:'flex', gap:'16px', alignItems:'flex-start' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.07)')}>

            {/* Left: content */}
            <div style={{ flex:1, cursor:'pointer' }} onClick={() => router.push(`/admin/complaint/${c.id}`)}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', flexWrap:'wrap' }}>
                <span style={{ fontSize:'11px', fontWeight:'700', color: CAT_COLOR[c.category]||'#888', textTransform:'uppercase', letterSpacing:'0.3px' }}>{c.category}</span>
                <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.15)' }}>·</span>
                <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{c.area || `Ward ${c.ward_number}`}</span>
                <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.15)' }}>·</span>
                <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{daysSince(c.created_at)} ago</span>
                {c.source === 'anonymous' && (
                  <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', border:'1px solid rgba(255,255,255,0.1)', padding:'1px 6px', borderRadius:'20px' }}>anon</span>
                )}
                {c.assigned_to && (
                  <span style={{ fontSize:'10px', color:'#C8920A', border:'1px solid rgba(200,146,10,0.3)', padding:'1px 6px', borderRadius:'20px' }}>→ {c.assigned_to}</span>
                )}
              </div>
              <div style={{ fontSize:'15px', fontWeight:'700', color:'rgba(255,255,255,0.88)', marginBottom:'4px' }}>{c.title}</div>
              {c.description && (
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', lineHeight:'1.4' }}>
                  {c.description.length > 100 ? c.description.slice(0,100)+'...' : c.description}
                </div>
              )}
            </div>

            {/* Right: status + quick actions */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px', flexShrink:0 }}>
              <span style={{ fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px',
                background: c.status==='resolved' ? 'rgba(61,170,110,0.15)' : c.status==='progress' ? 'rgba(200,146,10,0.15)' : 'rgba(224,82,82,0.15)',
                color: c.status==='resolved' ? '#3DAA6E' : c.status==='progress' ? '#C8920A' : '#E05252'
              }}>
                {c.status==='progress' ? 'In Progress' : c.status==='resolved' ? 'Resolved' : 'Open'}
              </span>

              {/* Quick action buttons */}
              <div style={{ display:'flex', gap:'6px' }}>
                {c.status === 'open' && (
                  <button onClick={() => quickStatus(c.id, 'progress')}
                    style={{ background:'rgba(200,146,10,0.15)', border:'1px solid rgba(200,146,10,0.3)', color:'#C8920A', padding:'5px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer' }}>
                    Start →
                  </button>
                )}
                {c.status === 'progress' && (
                  <button onClick={() => quickStatus(c.id, 'resolved')}
                    style={{ background:'rgba(61,170,110,0.15)', border:'1px solid rgba(61,170,110,0.3)', color:'#3DAA6E', padding:'5px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer' }}>
                    Resolve ✓
                  </button>
                )}
                <button onClick={() => router.push(`/admin/complaint/${c.id}`)}
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', padding:'5px 10px', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}