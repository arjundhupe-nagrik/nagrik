'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'
import { useRouter } from 'next/navigation'

const ZONES = ['All','Central','East','West','North','South']

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [areas, setAreas] = useState<any[]>([])
  const [zone, setZone] = useState('All')
  const [areaSearch, setAreaSearch] = useState('')
  const [selectedArea, setSelectedArea] = useState<any>(null)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
    })
    supabase.from('nagpur_areas').select('*').order('area_name').then(({ data }) => {
      if (data) setAreas(data)
    })
  }, [])

  const filteredAreas = areas.filter(a => {
    const matchZone = zone === 'All' || a.zone === zone
    const matchSearch = areaSearch.length < 2 || a.area_name.toLowerCase().includes(areaSearch.toLowerCase())
    return matchZone && matchSearch
  })

  async function save() {
    if (!selectedArea || !user) return
    setLoading(true)
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || '',
      email: user.email,
      preferred_area: selectedArea.area_name,
      preferred_ward: selectedArea.ward_number,
      phone: phone || null,
    })
    router.push('/')
  }

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif", display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'480px' }}>

        {/* Progress */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'32px' }}>
          {[1,2].map(s => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', background: step >= s ? '#E8731A' : 'rgba(255,255,255,0.08)', color: step >= s ? 'white' : 'rgba(255,255,255,0.3)' }}>{s}</div>
              {s < 2 && <div style={{ width:'40px', height:'2px', background: step > s ? '#E8731A' : 'rgba(255,255,255,0.08)', borderRadius:'1px' }}/>}
            </div>
          ))}
        </div>

        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'32px' }}>

          {step === 1 && (
            <>
              <div style={{ marginBottom:'24px' }}>
                <div style={{ fontSize:'11px', color:'#E8731A', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'6px' }}>Step 1 of 2</div>
                <h2 style={{ fontSize:'22px', fontWeight:'900', color:'white', marginBottom:'6px' }}>Which area are you from?</h2>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)' }}>We'll show you complaints from your area first.</p>
              </div>

              {/* Zone filter */}
              <div style={{ display:'flex', gap:'6px', marginBottom:'12px', flexWrap:'wrap' }}>
                {ZONES.map(z => (
                  <button key={z} onClick={() => setZone(z)}
                    style={{ padding:'4px 12px', borderRadius:'20px', border:'1px solid', borderColor: zone===z ? 'rgba(232,115,26,0.5)' : 'rgba(255,255,255,0.08)', background: zone===z ? 'rgba(232,115,26,0.1)' : 'transparent', color: zone===z ? '#E8731A' : 'rgba(255,255,255,0.35)', fontSize:'11px', fontWeight:'600', cursor:'pointer' }}>
                    {z}
                  </button>
                ))}
              </div>

              <div style={{ position:'relative', marginBottom:'12px' }}>
                <input value={areaSearch} onChange={e => { setAreaSearch(e.target.value); setSelectedArea(null) }}
                  placeholder="Search area — Dharampeth, Sadar..."
                  style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${selectedArea ? 'rgba(232,115,26,0.4)' : 'rgba(255,255,255,0.08)'}`, color:'white', borderRadius:'10px', padding:'12px 14px', fontSize:'14px', width:'100%', outline:'none' }} />
              </div>

              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', maxHeight:'200px', overflowY:'auto', marginBottom:'20px' }}>
                {filteredAreas.slice(0,25).map(area => (
                  <div key={area.ward_number}
                    onClick={() => { setSelectedArea(area); setAreaSearch(area.area_name) }}
                    style={{ padding:'10px 14px', cursor:'pointer', display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.04)', background: selectedArea?.ward_number===area.ward_number ? 'rgba(232,115,26,0.1)' : 'transparent', transition:'background 0.1s' }}
                    onMouseEnter={e => { if(selectedArea?.ward_number !== area.ward_number) e.currentTarget.style.background='rgba(255,255,255,0.04)' }}
                    onMouseLeave={e => { if(selectedArea?.ward_number !== area.ward_number) e.currentTarget.style.background='transparent' }}>
                    <span style={{ fontSize:'14px', color: selectedArea?.ward_number===area.ward_number ? '#E8731A' : 'rgba(255,255,255,0.8)' }}>{area.area_name}</span>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{area.zone} · W{area.ward_number}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => selectedArea && setStep(2)} disabled={!selectedArea}
                style={{ width:'100%', background: selectedArea ? '#E8731A' : 'rgba(255,255,255,0.06)', color: selectedArea ? 'white' : 'rgba(255,255,255,0.2)', border:'none', padding:'13px', borderRadius:'10px', fontSize:'14px', fontWeight:'700', cursor: selectedArea ? 'pointer' : 'not-allowed' }}>
                Continue →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ marginBottom:'24px' }}>
                <div style={{ fontSize:'11px', color:'#E8731A', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'6px' }}>Step 2 of 2</div>
                <h2 style={{ fontSize:'22px', fontWeight:'900', color:'white', marginBottom:'6px' }}>Almost done!</h2>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)' }}>Add your phone number to get complaint updates. Optional.</p>
              </div>

              <div style={{ background:'rgba(232,115,26,0.08)', border:'1px solid rgba(232,115,26,0.2)', borderRadius:'10px', padding:'14px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'20px' }}>📍</span>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:'600', color:'white' }}>{selectedArea?.area_name}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{selectedArea?.zone} zone · Ward {selectedArea?.ward_number}</div>
                </div>
                <button onClick={() => setStep(1)} style={{ marginLeft:'auto', background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:'12px' }}>change</button>
              </div>

              <div style={{ marginBottom:'20px' }}>
                <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>
                  Phone number <span style={{ color:'rgba(255,255,255,0.2)', fontWeight:'400', textTransform:'none' }}>(optional)</span>
                </label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'12px 14px', fontSize:'14px', width:'100%', outline:'none' }} />
              </div>

              <button onClick={save} disabled={loading}
                style={{ width:'100%', background:'#E8731A', color:'white', border:'none', padding:'13px', borderRadius:'10px', fontSize:'14px', fontWeight:'700', cursor:'pointer', marginBottom:'10px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Saving...' : 'Go to nagrik →'}
              </button>

              <button onClick={() => router.push('/')}
                style={{ width:'100%', background:'transparent', color:'rgba(255,255,255,0.3)', border:'none', padding:'10px', borderRadius:'10px', fontSize:'13px', cursor:'pointer' }}>
                Skip for now
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}