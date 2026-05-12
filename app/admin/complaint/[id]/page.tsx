'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../supabase.js'
import { useRouter, useParams } from 'next/navigation'

const DEPARTMENTS = ['NMC Solid Waste','NMC Drainage','PWD / NMC Roads','NMC Water Works','NMC Encroachment','NMC Sanitation','NMC Electrical','NMC General']

export default function AdminComplaintDetail() {
  const router = useRouter()
  const params = useParams()
  const [complaint, setComplaint] = useState<any>(null)
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    status:'', assigned_to:'', admin_notes:'', estimated_date:''
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/admin/login'); return }
    const { data: adminData } = await supabase.from('admins').select('*').eq('email', session.user.email).single()
    if (!adminData) { router.push('/admin/login'); return }
    setAdmin(adminData)
    loadComplaint()
  }

  async function loadComplaint() {
    const { data } = await supabase.from('complaints').select('*').eq('id', params.id).single()
    if (data) {
      setComplaint(data)
      setForm({
        status: data.status || 'open',
        assigned_to: data.assigned_to || '',
        admin_notes: data.admin_notes || '',
        estimated_date: data.estimated_date || ''
      })
    }
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    await supabase.from('complaints').update({
      status: form.status,
      assigned_to: form.assigned_to,
      admin_notes: form.admin_notes,
      estimated_date: form.estimated_date || null,
      resolved_at: form.status === 'resolved' ? new Date().toISOString() : null
    }).eq('id', params.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    loadComplaint()
  }

  function daysSince(date: string) {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
    return days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`
  }

  if (loading) return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ color:'rgba(255,255,255,0.2)' }}>Loading...</div>
    </main>
  )

  if (!complaint) return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ color:'rgba(255,255,255,0.2)' }}>Complaint not found</div>
    </main>
  )

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 24px', height:'58px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(13,13,20,0.9)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'18px', fontWeight:'900', color:'#E8731A' }}>nagrik</span>
          <span style={{ fontSize:'11px', background:'rgba(200,146,10,0.15)', border:'1px solid rgba(200,146,10,0.3)', padding:'2px 8px', borderRadius:'20px', color:'#C8920A' }}>ADMIN</span>
        </div>
        <button onClick={() => router.push('/admin/dashboard')}
          style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', padding:'6px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>
          ← Back to queue
        </button>
      </nav>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'28px 24px', display:'grid', gridTemplateColumns:'1fr 340px', gap:'20px' }}>

        {/* Left: complaint details */}
        <div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.25)', letterSpacing:'1.5px', marginBottom:'12px' }}>
            #{complaint.id.slice(0,8).toUpperCase()}
          </div>

          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'24px', marginBottom:'16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px', gap:'10px' }}>
              <span style={{ fontSize:'11px', fontWeight:'700', color:'#E8731A', textTransform:'uppercase', letterSpacing:'0.5px' }}>{complaint.category}</span>
              <span style={{ fontSize:'11px', fontWeight:'700', padding:'4px 12px', borderRadius:'20px',
                background: complaint.status==='resolved' ? 'rgba(61,170,110,0.15)' : complaint.status==='progress' ? 'rgba(200,146,10,0.15)' : 'rgba(224,82,82,0.15)',
                color: complaint.status==='resolved' ? '#3DAA6E' : complaint.status==='progress' ? '#C8920A' : '#E05252'
              }}>
                {complaint.status==='progress' ? 'In Progress' : complaint.status==='resolved' ? 'Resolved' : 'Open'}
              </span>
            </div>

            <h1 style={{ fontSize:'20px', fontWeight:'800', color:'white', marginBottom:'12px', lineHeight:'1.3' }}>{complaint.title}</h1>

            {complaint.description && (
              <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', lineHeight:'1.7', marginBottom:'16px' }}>{complaint.description}</p>
            )}

            <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'14px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              {[
                { label:'Area', val: complaint.area || `Ward ${complaint.ward_number}` },
                { label:'Ward', val: `Ward ${complaint.ward_number}` },
                { label:'Filed', val: new Date(complaint.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) },
                { label:'Age', val: daysSince(complaint.created_at) },
                { label:'Upvotes', val: complaint.upvotes || 0 },
                { label:'Source', val: complaint.source || 'anonymous' },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'3px' }}>{label}</div>
                  <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.8)', fontWeight:'600' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Map if coords exist */}
          {complaint.latitude && complaint.longitude && (
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', overflow:'hidden', marginBottom:'16px' }}>
              <div style={{ padding:'12px 16px', fontSize:'12px', color:'rgba(255,255,255,0.4)', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>📍 Pinned location</span>
                <a href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`} target="_blank" rel="noreferrer"
                  style={{ fontSize:'12px', color:'#E8731A', textDecoration:'none', fontWeight:'600' }}>
                  Open in Google Maps ↗
                </a>
              </div>
              <div style={{ padding:'14px 16px', fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>
                {complaint.latitude.toFixed(5)}, {complaint.longitude.toFixed(5)}
              </div>
            </div>
          )}
        </div>

        {/* Right: admin actions */}
        <div>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'20px', position:'sticky', top:'78px' }}>
            <div style={{ fontSize:'12px', fontWeight:'700', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'20px' }}>Admin actions</div>

            <div style={{ marginBottom:'16px' }}>
              <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'10px 12px', fontSize:'14px', width:'100%', outline:'none' }}>
                <option value="open">Open</option>
                <option value="progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div style={{ marginBottom:'16px' }}>
              <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Assign to</label>
              <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color: form.assigned_to ? 'white' : 'rgba(255,255,255,0.25)', borderRadius:'10px', padding:'10px 12px', fontSize:'14px', width:'100%', outline:'none' }}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:'16px' }}>
              <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Est. resolution date</label>
              <input type="date" value={form.estimated_date} onChange={e => setForm(f => ({ ...f, estimated_date: e.target.value }))}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'10px 12px', fontSize:'14px', width:'100%', outline:'none' }} />
            </div>

            <div style={{ marginBottom:'20px' }}>
              <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Internal notes <span style={{ color:'rgba(255,255,255,0.2)', fontWeight:'400', textTransform:'none' }}>(not public)</span></label>
              <textarea value={form.admin_notes} onChange={e => setForm(f => ({ ...f, admin_notes: e.target.value }))}
                placeholder="Team visited site. Work scheduled for..."
                rows={4}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'10px 12px', fontSize:'13px', width:'100%', outline:'none', resize:'vertical', fontFamily:'inherit' }} />
            </div>

            <button onClick={save} disabled={saving}
              style={{ width:'100%', background: saving ? 'rgba(255,255,255,0.06)' : saved ? 'rgba(61,170,110,0.8)' : '#E8731A', color:'white', border:'none', padding:'13px', borderRadius:'10px', fontSize:'14px', fontWeight:'700', cursor: saving ? 'default' : 'pointer', transition:'all 0.2s' }}>
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save changes'}
            </button>

            <div style={{ marginTop:'12px', padding:'10px', background:'rgba(255,255,255,0.02)', borderRadius:'8px', fontSize:'11px', color:'rgba(255,255,255,0.25)', lineHeight:'1.5' }}>
              Status changes are reflected publicly on the citizen's complaint page instantly.
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}