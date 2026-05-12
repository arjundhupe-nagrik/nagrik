'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useRouter } from 'next/navigation'

export default function WardsPage() {
  const router = useRouter()
  const [wards, setWards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('issues')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setAuthChecked(true)
      load()
    }
    init()
  }, [])

  async function load() {
    const { data: complaints } = await supabase.from('complaints').select('*')
    const { data: areaData } = await supabase.from('nagpur_areas').select('*')

    if (complaints) {
      const areaMap: Record<number, string> = {}
      if (areaData) areaData.forEach((a: any) => { areaMap[a.ward_number] = a.area_name })

      const map: Record<number,any> = {}
      complaints.forEach((c:any) => {
        if (!c.ward_number) return
        if (!map[c.ward_number]) map[c.ward_number] = {
          ward: c.ward_number,
          area_name: areaMap[c.ward_number] || 'Ward ' + c.ward_number,
          total: 0, open: 0, resolved: 0, progress: 0, categories: {}
        }
        map[c.ward_number].total++
        map[c.ward_number][c.status]++
        map[c.ward_number].categories[c.category] = (map[c.ward_number].categories[c.category]||0)+1
      })
      setWards(Object.values(map))
    }
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function heat(total: number) {
    if (total >= 10) return { color:'#E05252', label:'High' }
    if (total >= 5) return { color:'#C8920A', label:'Mid' }
    return { color:'#3DAA6E', label:'Low' }
  }

  function topCat(cats: Record<string,number>) {
    if (!cats || !Object.keys(cats).length) return '—'
    return Object.entries(cats).sort((a,b) => b[1]-a[1])[0][0]
  }

  let filtered = [...wards]
  if (search) filtered = filtered.filter(w =>
    w.ward.toString().includes(search) ||
    w.area_name.toLowerCase().includes(search.toLowerCase())
  )
  if (sortBy==='issues') filtered.sort((a,b) => b.total-a.total)
  if (sortBy==='ward') filtered.sort((a,b) => a.ward-b.ward)
  if (sortBy==='resolved') filtered.sort((a,b) => (b.resolved/b.total)-(a.resolved/a.total))

  const totalComplaints = wards.reduce((s,w) => s+w.total, 0)
  const totalResolved = wards.reduce((s,w) => s+w.resolved, 0)
  const resRate = totalComplaints > 0 ? Math.round((totalResolved/totalComplaints)*100) : 0

  if (!authChecked) return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ color:'rgba(255,255,255,0.2)', fontSize:'14px' }}>Loading...</div>
    </main>
  )

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 32px', height:'58px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(13,13,20,0.85)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:100 }}>
        <a href="/" style={{ fontSize:'20px', fontWeight:'900', color:'#E8731A', textDecoration:'none' }}>nagrik</a>
        <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
          <a href="/feed" style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', textDecoration:'none', padding:'6px 14px', borderRadius:'8px' }}
            onMouseEnter={e=>(e.currentTarget.style.color='white')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.4)')}>Feed</a>
          <a href="/wards" style={{ color:'white', fontSize:'13px', textDecoration:'none', padding:'6px 14px', fontWeight:'600', borderRadius:'8px' }}>Wards</a>
          <a href="/my-complaints" style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', textDecoration:'none', padding:'6px 14px', borderRadius:'8px' }}
            onMouseEnter={e=>(e.currentTarget.style.color='white')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.4)')}>My complaints</a>
          <button onClick={logout}
            style={{ background:'rgba(224,82,82,0.15)', border:'1px solid rgba(224,82,82,0.3)', color:'#E05252', padding:'7px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:'700', cursor:'pointer', marginLeft:'8px' }}>
            Sign out
          </button>
          <a href="/file" style={{ background:'#E8731A', color:'white', fontSize:'13px', fontWeight:'700', textDecoration:'none', padding:'8px 18px', borderRadius:'8px', marginLeft:'4px' }}>
            + File
          </a>
        </div>
      </nav>

      <div style={{ padding:'32px 32px 0', maxWidth:'760px', margin:'0 auto' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'900', color:'white', letterSpacing:'-1px', marginBottom:'4px' }}>Ward heatmap</h1>
        <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.35)', marginBottom:'24px' }}>Every area in Nagpur ranked by civic issues.</p>
      </div>

      <div style={{ maxWidth:'760px', margin:'0 auto', padding:'0 32px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'24px' }}>
        {[
          { label:'Areas with issues', val:wards.length, color:'#E8731A' },
          { label:'Total complaints', val:totalComplaints, color:'#E05252' },
          { label:'Resolution rate', val:resRate+'%', color:'#3DAA6E' },
        ].map((s,i) => (
          <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'18px', textAlign:'center' }}>
            <div style={{ fontSize:'26px', fontWeight:'800', color:s.color }}>{s.val}</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'3px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth:'760px', margin:'0 auto', padding:'0 32px 48px' }}>
        <div style={{ display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap', alignItems:'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search area or ward number..."
            style={{ padding:'9px 14px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', color:'white', fontSize:'13px', outline:'none', flex:1, minWidth:'180px' }} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding:'9px 12px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', color:'white', fontSize:'13px', outline:'none' }}>
            <option value="issues">Most issues</option>
            <option value="ward">Ward number</option>
            <option value="resolved">Best resolution</option>
          </select>
          <div style={{ display:'flex', gap:'12px' }}>
            {[{label:'High',color:'#E05252'},{label:'Mid',color:'#C8920A'},{label:'Low',color:'#3DAA6E'}].map(l => (
              <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'2px', background:l.color }}/>
                <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {loading && <div style={{ textAlign:'center', padding:'48px', color:'rgba(255,255,255,0.2)' }}>Loading...</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px', background:'rgba(255,255,255,0.02)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.25)', marginBottom:'16px' }}>No ward data yet</div>
            <a href="/file" style={{ background:'#E8731A', color:'white', fontWeight:'700', fontSize:'13px', textDecoration:'none', padding:'10px 20px', borderRadius:'8px', display:'inline-block' }}>File a complaint</a>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:'10px' }}>
          {filtered.map(w => {
            const h = heat(w.total)
            const rate = Math.round((w.resolved/w.total)*100)
            return (
              <div key={w.ward}
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderLeft:'3px solid '+h.color, borderRadius:'12px', padding:'16px', cursor:'pointer', transition:'border-color 0.15s' }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.15)')}
                onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.07)')}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                  <div>
                    <div style={{ fontSize:'15px', fontWeight:'800', color:'white' }}>{w.area_name}</div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>Ward {w.ward}</div>
                    <div style={{ fontSize:'10px', color:h.color, fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.3px', marginTop:'2px' }}>{h.label}</div>
                  </div>
                  <div style={{ fontSize:'22px', fontWeight:'800', color:h.color }}>{w.total}</div>
                </div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginBottom:'10px' }}>
                  Top: <span style={{ color:'rgba(255,255,255,0.6)', fontWeight:'600' }}>{topCat(w.categories)}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'4px', marginBottom:'10px' }}>
                  {[
                    { label:'Open', val:w.open, color:'#E05252' },
                    { label:'Active', val:w.progress, color:'#C8920A' },
                    { label:'Fixed', val:w.resolved, color:'#3DAA6E' },
                  ].map(s => (
                    <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', borderRadius:'6px', padding:'6px', textAlign:'center' }}>
                      <div style={{ fontSize:'14px', fontWeight:'700', color:s.val>0?s.color:'rgba(255,255,255,0.15)' }}>{s.val}</div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ height:'3px', background:'rgba(255,255,255,0.07)', borderRadius:'2px' }}>
                  <div style={{ height:'100%', background:'#3DAA6E', borderRadius:'2px', width:rate+'%' }}/>
                </div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', marginTop:'4px' }}>{rate}% resolved</div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}