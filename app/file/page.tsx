'use client'
import { useState } from 'react'
import { supabase } from '../supabase.js'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { id:'Garbage', label:'Garbage / Waste', icon:'🗑️' },
  { id:'Drainage', label:'Drainage', icon:'🌊' },
  { id:'Road', label:'Road Repair', icon:'🚧' },
  { id:'Water', label:'Water Supply', icon:'💧' },
  { id:'Encroachment', label:'Encroachment', icon:'🚫' },
  { id:'Sanitation', label:'Sanitation', icon:'🧹' },
  { id:'Street Light', label:'Street Light', icon:'💡' },
  { id:'Other', label:'Other', icon:'📋' },
]

const DEPARTMENTS: Record<string,string> = {
  Garbage:'NMC Solid Waste', Drainage:'NMC Drainage',
  Road:'PWD / NMC Roads', Water:'NMC Water Works',
  Encroachment:'NMC Encroachment', Sanitation:'NMC Sanitation',
  'Street Light':'NMC Electrical', Other:'NMC General'
}

export default function FilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [complaintId, setComplaintId] = useState('')
  const [form, setForm] = useState({
    category:'', ward_number:'', area:'', title:'', description:''
  })

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  const ready = form.category && form.ward_number && form.title.length > 5

  async function submit() {
    if (!ready) return
    setLoading(true)
    const { data, error } = await supabase.from('complaints').insert([{
      category: form.category,
      ward_number: parseInt(form.ward_number),
      area: form.area,
      title: form.title,
      description: form.description,
      status: 'open',
      upvotes: 0,
    }]).select()
    setLoading(false)
    if (!error && data) {
      setComplaintId(data[0].id.slice(0,8).toUpperCase())
      setSubmitted(true)
    }
  }

  const s = { minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif" }

  if (submitted) return (
    <main style={{ ...s, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'48px 36px', maxWidth:'420px', width:'100%', textAlign:'center' }}>
        <div style={{ width:'64px', height:'64px', background:'rgba(61,170,110,0.15)', border:'1px solid rgba(61,170,110,0.3)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:'28px' }}>✓</div>
        <div style={{ fontSize:'24px', fontWeight:'800', color:'white', marginBottom:'8px' }}>Complaint filed!</div>
        <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.4)', marginBottom:'28px' }}>Now public and visible to everyone in Nagpur.</div>
        <div style={{ background:'rgba(232,115,26,0.1)', border:'1px solid rgba(232,115,26,0.2)', borderRadius:'12px', padding:'20px', marginBottom:'28px' }}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'6px' }}>Complaint ID</div>
          <div style={{ fontSize:'26px', fontWeight:'800', color:'#E8731A', letterSpacing:'3px' }}>NMC-{complaintId}</div>
        </div>
        <button onClick={() => router.push('/')} style={{ background:'#E8731A', color:'white', border:'none', padding:'13px', borderRadius:'10px', fontSize:'14px', fontWeight:'700', cursor:'pointer', width:'100%', marginBottom:'10px' }}>
          Back to home
        </button>
        <button onClick={() => { setSubmitted(false); setForm({ category:'', ward_number:'', area:'', title:'', description:'' }) }}
          style={{ background:'transparent', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.1)', padding:'13px', borderRadius:'10px', fontSize:'14px', fontWeight:'600', cursor:'pointer', width:'100%' }}>
          File another
        </button>
      </div>
    </main>
  )

  return (
    <main style={s}>
      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 32px', height:'58px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <a href="/" style={{ fontSize:'20px', fontWeight:'800', color:'#E8731A', textDecoration:'none' }}>nagrik</a>
        <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.3)' }}>New complaint</span>
      </nav>

      <div style={{ maxWidth:'580px', margin:'0 auto', padding:'40px 24px' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'900', color:'white', marginBottom:'6px', letterSpacing:'-0.5px' }}>
          What's the issue?
        </h1>
        <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.35)', marginBottom:'36px' }}>
          Fill in the details below. Takes under 60 seconds.
        </p>

        {/* Category */}
        <div style={{ marginBottom:'28px' }}>
          <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Category</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => set('category', cat.id)}
                style={{ padding:'14px 8px', borderRadius:'12px', border: form.category===cat.id ? '1px solid rgba(232,115,26,0.6)' : '1px solid rgba(255,255,255,0.07)', background: form.category===cat.id ? 'rgba(232,115,26,0.12)' : 'rgba(255,255,255,0.03)', color: form.category===cat.id ? '#E8731A' : 'rgba(255,255,255,0.5)', fontSize:'11px', fontWeight:'600', cursor:'pointer', textAlign:'center', transition:'all 0.15s' }}>
                <div style={{ fontSize:'20px', marginBottom:'6px' }}>{cat.icon}</div>
                {cat.id}
              </button>
            ))}
          </div>
          {form.category && (
            <div style={{ marginTop:'10px', fontSize:'12px', color:'rgba(61,170,110,0.8)', display:'flex', alignItems:'center', gap:'6px' }}>
              <span>✓</span> Auto-assigned to <strong style={{ color:'#3DAA6E' }}>{DEPARTMENTS[form.category]}</strong>
            </div>
          )}
        </div>

        {/* Ward + Area */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'28px' }}>
          <div>
            <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Ward number</label>
            <select value={form.ward_number} onChange={e => set('ward_number', e.target.value)}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color: form.ward_number ? 'white' : 'rgba(255,255,255,0.25)', borderRadius:'10px', padding:'12px 14px', fontSize:'14px', width:'100%', outline:'none' }}>
              <option value="">Select ward</option>
              {Array.from({ length:162 }, (_,i) => i+1).map(w => (
                <option key={w} value={w}>Ward {w}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Landmark <span style={{ color:'rgba(255,255,255,0.2)', fontWeight:'400' }}>(optional)</span></label>
            <input value={form.area} onChange={e => set('area', e.target.value)} placeholder="e.g. Near Sitabuldi flyover"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'12px 14px', fontSize:'14px', width:'100%', outline:'none' }} />
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom:'20px' }}>
          <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Title</label>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Large pothole causing accidents on Wardha Road"
            style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${form.title.length > 5 ? 'rgba(232,115,26,0.4)' : 'rgba(255,255,255,0.08)'}`, color:'white', borderRadius:'10px', padding:'14px', fontSize:'15px', width:'100%', outline:'none' }} />
        </div>

        {/* Description */}
        <div style={{ marginBottom:'32px' }}>
          <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>
            Description <span style={{ color:'rgba(255,255,255,0.2)', fontWeight:'400' }}>(optional)</span>
          </label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="How long has this been a problem? How does it affect people?"
            rows={3}
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'14px', fontSize:'14px', width:'100%', outline:'none', resize:'vertical', fontFamily:'inherit' }} />
        </div>

        {/* Submit */}
        <button onClick={submit} disabled={!ready || loading}
          style={{ width:'100%', background: ready ? '#E8731A' : 'rgba(255,255,255,0.06)', color: ready ? 'white' : 'rgba(255,255,255,0.2)', border: ready ? 'none' : '1px solid rgba(255,255,255,0.08)', padding:'16px', borderRadius:'12px', fontSize:'15px', fontWeight:'700', cursor: ready ? 'pointer' : 'not-allowed', transition:'all 0.2s' }}>
          {loading ? 'Submitting...' : ready ? 'Submit complaint →' : 'Fill in the details above'}
        </button>
      </div>
    </main>
  )
}