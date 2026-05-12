'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase.js'
import { useRouter, useParams } from 'next/navigation'

const CAT_COLOR: Record<string,string> = {
  Drainage:'#C8920A', Road:'#4A4ACB', Garbage:'#1B7A4A',
  Water:'#1A6EA8', Encroachment:'#C0392B', Sanitation:'#7B2FA8',
  'Street Light':'#E65100', Other:'#888'
}
const DEPARTMENTS: Record<string,string> = {
  Drainage:'NMC Drainage', Road:'PWD / NMC Roads', Garbage:'NMC Solid Waste',
  Water:'NMC Water Works', Encroachment:'NMC Encroachment', Sanitation:'NMC Sanitation',
  'Street Light':'NMC Electrical', Other:'NMC General'
}
const TIMELINE = [
  { key:'open', label:'Complaint filed', desc:'Registered and made public' },
  { key:'acknowledged', label:'Acknowledged', desc:'Department notified' },
  { key:'progress', label:'Work in progress', desc:'Team assigned and working' },
  { key:'resolved', label:'Resolved', desc:'Issue fixed and closed' },
]

export default function ComplaintPage() {
  const router = useRouter()
  const params = useParams()
  const [complaint, setComplaint] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [upvoted, setUpvoted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setAuthChecked(true)
      const { data } = await supabase.from('complaints').select('*').eq('id', params.id).single()
      if (data) setComplaint(data)
      setLoading(false)
    }
    checkAuth()
  }, [params.id])

  async function upvote() {
    if (upvoted) return
    await supabase.from('complaints').update({ upvotes:(complaint.upvotes||0)+1 }).eq('id', complaint.id)
    setComplaint((c:any) => ({ ...c, upvotes:(c.upvotes||0)+1 }))
    setUpvoted(true)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function daysSince(date: string) {
    const days = Math.floor((Date.now()-new Date(date).getTime())/86400000)
    return days===0?'Today':days===1?'1 day ago':`${days} days ago`
  }

  function activeStep() {
    if (!complaint) return 0
    if (complaint.status==='resolved') return 3
    if (complaint.status==='progress') return 2
    return 1
  }

  if (!authChecked || loading) return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ color:'rgba(255,255,255,0.2)', fontSize:'14px' }}>Loading...</div>
    </main>
  )

  if (!complaint) return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.3)' }}>Complaint not found</div>
      <a href="/feed" style={{ color:'#E8731A', fontSize:'13px' }}>Back to feed</a>
    </main>
  )

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 32px', height:'58px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(13,13,20,0.85)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:100 }}>
        <a href="/" style={{ fontSize:'20px', fontWeight:'900', color:'#E8731A', textDecoration:'none' }}>nagrik</a>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <a href="/feed" style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', textDecoration:'none' }}>← Back to feed</a>
          <button onClick={async()=>{ await supabase.auth.signOut(); router.push('/login') }}
            style={{ background:'rgba(224,82,82,0.15)', border:'1px solid rgba(224,82,82,0.3)', color:'#E05252', padding:'7px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:'640px', margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.25)', fontWeight:'600', letterSpacing:'1.5px' }}>
            #{complaint.id.slice(0,8).toUpperCase()}
          </div>
          <button onClick={copyLink}
            style={{ background: copied?'rgba(61,170,110,0.15)':'rgba(255,255,255,0.05)', border:'1px solid '+(copied?'rgba(61,170,110,0.3)':'rgba(255,255,255,0.1)'), borderRadius:'8px', padding:'8px 16px', fontSize:'12px', fontWeight:'600', color: copied?'#3DAA6E':'rgba(255,255,255,0.5)', cursor:'pointer' }}>
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>

        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'24px', marginBottom:'12px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px', gap:'10px' }}>
            <span style={{ fontSize:'11px', fontWeight:'700', color: CAT_COLOR[complaint.category]||'#888', textTransform:'uppercase', letterSpacing:'0.5px' }}>{complaint.category}</span>
            <span style={{ fontSize:'11px', fontWeight:'700', padding:'4px 12px', borderRadius:'20px',
              background: complaint.status==='resolved'?'rgba(61,170,110,0.15)':complaint.status==='progress'?'rgba(200,146,10,0.15)':'rgba(224,82,82,0.15)',
              color: complaint.status==='resolved'?'#3DAA6E':complaint.status==='progress'?'#C8920A':'#E05252'
            }}>
              {complaint.status==='progress'?'In Progress':complaint.status==='resolved'?'Resolved':'Open'}
            </span>
          </div>
          <h1 style={{ fontSize:'22px', fontWeight:'800', color:'white', marginBottom:'12px', lineHeight:'1.3', letterSpacing:'-0.3px' }}>{complaint.title}</h1>
          {complaint.description && (
            <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.5)', lineHeight:'1.7', marginBottom:'18px' }}>{complaint.description}</p>
          )}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            {[
              { label:'Area', val: complaint.area||'Ward '+complaint.ward_number },
              { label:'Department', val: DEPARTMENTS[complaint.category]||'NMC General' },
              { label:'Filed', val: new Date(complaint.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) },
              { label:'Age', val: daysSince(complaint.created_at) },
            ].map(({label,val}) => (
              <div key={label}>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'3px' }}>{label}</div>
                <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.8)', fontWeight:'600' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {complaint.latitude && complaint.longitude && (
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', overflow:'hidden', marginBottom:'12px' }}>
            <div style={{ padding:'12px 16px', fontSize:'12px', color:'rgba(255,255,255,0.4)', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>📍 Pinned location</span>
              <a href={'https://www.google.com/maps?q='+complaint.latitude+','+complaint.longitude} target="_blank" rel="noreferrer"
                style={{ fontSize:'12px', color:'#E8731A', textDecoration:'none', fontWeight:'600' }}>
                Open in Google Maps
              </a>
            </div>
            <div style={{ padding:'12px 16px', fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>
              {Number(complaint.latitude).toFixed(5)}, {Number(complaint.longitude).toFixed(5)}
            </div>
          </div>
        )}

        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'16px 20px', marginBottom:'12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:'14px', fontWeight:'700', color:'white', marginBottom:'2px' }}>{complaint.upvotes||0} people have this issue</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>Upvote to increase priority</div>
          </div>
          <button onClick={upvote} disabled={upvoted}
            style={{ background: upvoted?'rgba(61,170,110,0.15)':'rgba(232,115,26,0.15)', color: upvoted?'#3DAA6E':'#E8731A', border:'1px solid '+(upvoted?'rgba(61,170,110,0.3)':'rgba(232,115,26,0.3)'), borderRadius:'10px', padding:'10px 20px', fontSize:'14px', fontWeight:'700', cursor: upvoted?'default':'pointer' }}>
            {upvoted ? 'Upvoted' : 'Upvote'}
          </button>
        </div>

        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'20px 24px', marginBottom:'24px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.3)', marginBottom:'20px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Resolution timeline</div>
          {TIMELINE.map((step,i) => {
            const active = activeStep()
            const done = i < active
            const current = i === active
            return (
              <div key={step.key} style={{ display:'flex', gap:'14px' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ width:'26px', height:'26px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', flexShrink:0,
                    background: done?'#3DAA6E':current?'#E8731A':'rgba(255,255,255,0.06)',
                    color: done||current?'white':'rgba(255,255,255,0.2)',
                    border: done||current?'none':'1px solid rgba(255,255,255,0.1)'
                  }}>
                    {done?'✓':i+1}
                  </div>
                  {i<TIMELINE.length-1 && (
                    <div style={{ width:'1px', height:'32px', background: done?'rgba(61,170,110,0.4)':'rgba(255,255,255,0.06)', margin:'4px 0' }}/>
                  )}
                </div>
                <div style={{ paddingTop:'4px' }}>
                  <div style={{ fontSize:'14px', fontWeight:'700', color: done||current?'rgba(255,255,255,0.88)':'rgba(255,255,255,0.2)', marginBottom:'2px' }}>{step.label}</div>
                  <div style={{ fontSize:'12px', color: done||current?'rgba(255,255,255,0.35)':'rgba(255,255,255,0.1)', marginBottom:'14px' }}>{step.desc}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ textAlign:'center' }}>
          <a href="/feed" style={{ color:'rgba(255,255,255,0.3)', fontSize:'13px', textDecoration:'none' }}>← View all complaints</a>
        </div>
      </div>
    </main>
  )
}