'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase.js'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { id:'Garbage', label:'Garbage', icon:'🗑️' },
  { id:'Drainage', label:'Drainage', icon:'🌊' },
  { id:'Road', label:'Road', icon:'🚧' },
  { id:'Water', label:'Water', icon:'💧' },
  { id:'Encroachment', label:'Encroach', icon:'🚫' },
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

const ZONES = ['All','Central','East','West','North','South']

function SuccessScreen({ complaintId, areaName, pinCoords, onReset, router }: any) {
  const [copied, setCopied] = useState(false)

  function copyId() {
    navigator.clipboard.writeText('NMC-' + complaintId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    const text = 'I filed a civic complaint in Nagpur via nagrik. Tracking ID: NMC-' + complaintId + '. Join us!'
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
  }

  const baseStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#0D0D14',
    fontFamily: "'Inter',system-ui,sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  }

  return (
    <main style={baseStyle}>
      <div style={{ maxWidth:'440px', width:'100%' }}>

        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{
            width:'72px', height:'72px',
            background:'rgba(61,170,110,0.15)',
            border:'2px solid rgba(61,170,110,0.4)',
            borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 16px',
            fontSize:'32px'
          }}>
            ✓
          </div>
          <div style={{ fontSize:'26px', fontWeight:'900', color:'white', marginBottom:'6px', letterSpacing:'-0.5px' }}>
            Complaint filed!
          </div>
          <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.4)' }}>
            Filed for <strong style={{ color:'white' }}>{areaName}</strong>
            {pinCoords && (
              <span style={{ color:'#3DAA6E' }}> · 📍 Location pinned</span>
            )}
          </div>
        </div>

        <div style={{
          background:'rgba(232,115,26,0.08)',
          border:'1px solid rgba(232,115,26,0.25)',
          borderRadius:'14px',
          padding:'20px',
          marginBottom:'16px'
        }}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'8px' }}>
            Your complaint tracking ID
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
            <div style={{ fontSize:'28px', fontWeight:'900', color:'#E8731A', letterSpacing:'4px' }}>
              NMC-{complaintId}
            </div>
            <button
              onClick={copyId}
              style={{
                background: copied ? 'rgba(61,170,110,0.15)' : 'rgba(255,255,255,0.08)',
                border: '1px solid ' + (copied ? 'rgba(61,170,110,0.3)' : 'rgba(255,255,255,0.12)'),
                color: copied ? '#3DAA6E' : 'rgba(255,255,255,0.5)',
                padding:'8px 14px', borderRadius:'8px',
                fontSize:'12px', fontWeight:'600', cursor:'pointer'
              }}>
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', marginTop:'10px', lineHeight:'1.5' }}>
            Save this ID to track your complaint later.
          </div>
        </div>

        <div style={{
          background:'rgba(255,255,255,0.03)',
          border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:'12px',
          padding:'16px',
          marginBottom:'16px'
        }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'12px' }}>
            What happens next
          </div>
          <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'10px' }}>
            <span style={{ fontSize:'16px', flexShrink:0 }}>📬</span>
            <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', lineHeight:'1.5' }}>Your complaint is now public and visible to authorities</span>
          </div>
          <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'10px' }}>
            <span style={{ fontSize:'16px', flexShrink:0 }}>🔍</span>
            <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', lineHeight:'1.5' }}>Officials will review and assign it to the right department</span>
          </div>
          <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
            <span style={{ fontSize:'16px', flexShrink:0 }}>🔔</span>
            <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', lineHeight:'1.5' }}>Sign in to get notified when your complaint status changes</span>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          <button
            onClick={() => router.push('/public')}
            style={{
              background:'#E8731A', color:'white', border:'none',
              padding:'14px', borderRadius:'10px',
              fontSize:'14px', fontWeight:'700', cursor:'pointer', width:'100%'
            }}>
            🏙️ See Nagpur issues
          </button>
          <button
            onClick={() => router.push('/login')}
            style={{
              background:'rgba(61,170,110,0.08)', color:'#3DAA6E',
              border:'1px solid rgba(61,170,110,0.25)',
              padding:'14px', borderRadius:'10px',
              fontSize:'14px', fontWeight:'700', cursor:'pointer', width:'100%'
            }}>
            🔐 Sign in to track your complaint
          </button>
          <button
            onClick={shareWhatsApp}
            style={{
              background:'rgba(37,211,102,0.08)', color:'rgba(37,211,102,0.8)',
              border:'1px solid rgba(37,211,102,0.2)',
              padding:'12px', borderRadius:'10px',
              fontSize:'13px', fontWeight:'600', cursor:'pointer', width:'100%'
            }}>
            📲 Share on WhatsApp
          </button>
          <button
            onClick={onReset}
            style={{
              background:'transparent', color:'rgba(255,255,255,0.3)',
              border:'1px solid rgba(255,255,255,0.08)',
              padding:'12px', borderRadius:'10px',
              fontSize:'13px', fontWeight:'600', cursor:'pointer', width:'100%'
            }}>
            + File another complaint
          </button>
        </div>
      </div>
    </main>
  )
}

export default function FilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [complaintId, setComplaintId] = useState('')
  const [areas, setAreas] = useState<any[]>([])
  const [zone, setZone] = useState('All')
  const [areaSearch, setAreaSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [detectMsg, setDetectMsg] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [pinCoords, setPinCoords] = useState<{lat:number,lng:number}|null>(null)
  const [aiSuggestion, setAiSuggestion] = useState<string|null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const debounceRef = useRef<any>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const mapDivRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    category:'', ward_number:'', area_name:'', title:'', description:'',
    latitude:'', longitude:''
  })

  useEffect(() => {
    supabase.from('nagpur_areas').select('*').order('area_name').then(({ data }) => {
      if (data) setAreas(data)
    })
  }, [])

  useEffect(() => {
    const text = (form.title + ' ' + form.description).trim()
    if (text.length < 10 || form.category) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setAiLoading(true)
      try {
        const res = await fetch('/api/suggest', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ description: text })
        })
        const data = await res.json()
        if (data.category) setAiSuggestion(data.category)
      } catch {}
      setAiLoading(false)
    }, 800)
    return () => clearTimeout(debounceRef.current)
  }, [form.title, form.description])

  useEffect(() => {
    if (!showMap || !mapDivRef.current || mapRef.current) return
    const initMap = () => {
      const L = (window as any).L
      if (!L) { setTimeout(initMap, 200); return }
      const startLat = pinCoords?.lat || 21.1458
      const startLng = pinCoords?.lng || 79.0882
      const zoom = pinCoords ? 16 : 13
      const map = L.map(mapDivRef.current).setView([startLat, startLng], zoom)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
      const icon = L.divIcon({
        html: '<div style="background:#E8731A;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
        iconSize: [20,20], iconAnchor: [10,10], className:''
      })
      const locateIcon = L.divIcon({
        html: '<div style="background:#185FA5;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>',
        iconSize: [16,16], iconAnchor: [8,8], className:''
      })
      if (pinCoords) {
        markerRef.current = L.marker([pinCoords.lat, pinCoords.lng], { icon }).addTo(map).bindPopup('📍 Complaint location').openPopup()
      }
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        if (markerRef.current) markerRef.current.remove()
        markerRef.current = L.marker([lat, lng], { icon }).addTo(map)
          .bindPopup('<b>📍 Complaint location</b><br>' + lat.toFixed(5) + ', ' + lng.toFixed(5))
          .openPopup()
        setPinCoords({ lat, lng })
        setForm(f => ({ ...f, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }))
      })
      const LocateControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: () => {
          const btn = L.DomUtil.create('button')
          btn.innerHTML = '📍 My location'
          btn.style.cssText = 'background:#0D0D14;color:#E8731A;border:1px solid rgba(232,115,26,0.4);padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;margin:8px;'
          btn.onmouseover = () => { btn.style.background = 'rgba(232,115,26,0.15)' }
          btn.onmouseout = () => { btn.style.background = '#0D0D14' }
          L.DomEvent.on(btn, 'click', L.DomEvent.stop)
          L.DomEvent.on(btn, 'click', () => {
            btn.innerHTML = '⏳ Locating...'
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude } = pos.coords
                map.setView([latitude, longitude], 17)
                const lm = (map as any)._locateMarker
                if (lm) lm.remove()
                ;(map as any)._locateMarker = L.marker([latitude, longitude], { icon: locateIcon }).addTo(map).bindPopup('📍 You are here').openPopup()
                btn.innerHTML = '✓ Located'
                setTimeout(() => { btn.innerHTML = '📍 My location' }, 2000)
              },
              () => {
                btn.innerHTML = '✗ Denied'
                setTimeout(() => { btn.innerHTML = '📍 My location' }, 2000)
              },
              { enableHighAccuracy: true, timeout: 8000 }
            )
          })
          return btn
        }
      })
      new LocateControl().addTo(map)
      mapRef.current = map
      setTimeout(() => map.invalidateSize(), 100)
    }
    initMap()
  }, [showMap])

  useEffect(() => {
    if (!mapRef.current || !form.ward_number) return
    const L = (window as any).L
    if (!L) return
    fetch(
      'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(form.area_name + ' Nagpur India') + '&format=json&limit=1',
      { headers: { 'User-Agent': 'nagrik-civic-app' } }
    )
      .then(r => r.json())
      .then(data => {
        if (data?.[0]) mapRef.current.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 15)
      })
      .catch(() => {})
  }, [form.ward_number])

  const filteredAreas = areas.filter(a => {
    const matchZone = zone === 'All' || a.zone === zone
    const matchSearch = areaSearch.trim().length < 2 || a.area_name.toLowerCase().includes(areaSearch.toLowerCase())
    return matchZone && matchSearch
  })

  function setField(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
    if (key === 'title' || key === 'description') setAiSuggestion(null)
  }

  function selectArea(area: any) {
    setForm(f => ({ ...f, ward_number: String(area.ward_number), area_name: area.area_name }))
    setAreaSearch(area.area_name)
    setShowDropdown(false)
  }

  async function detectLocation() {
    setDetectMsg('')
    if (!navigator.geolocation) { setDetectMsg('Not supported on this browser'); return }
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setForm(f => ({ ...f, latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) }))
        setPinCoords({ lat: latitude, lng: longitude })
        try {
          const res = await fetch(
            'https://nominatim.openstreetmap.org/reverse?lat=' + latitude + '&lon=' + longitude + '&format=json&accept-language=en',
            { headers: { 'User-Agent': 'nagrik-civic-app' } }
          )
          const data = await res.json()
          const addr = data?.address || {}
          const candidates = [addr.suburb, addr.neighbourhood, addr.city_district, addr.quarter, addr.residential, addr.county].filter(Boolean)
          let matched: any = null
          for (const c of candidates) {
            matched = areas.find(a =>
              a.area_name.toLowerCase().replace(/\s/g,'').includes(c.toLowerCase().replace(/\s/g,'')) ||
              c.toLowerCase().replace(/\s/g,'').includes(a.area_name.toLowerCase().replace(/\s/g,''))
            )
            if (matched) break
          }
          if (matched) {
            selectArea(matched)
            setDetectMsg('✓ Location detected: ' + matched.area_name)
          } else {
            setDetectMsg('Location found — please select your area from the list')
            setShowDropdown(true)
            setAreaSearch('')
          }
        } catch {
          setDetectMsg('Coordinates saved — please select your area manually')
          setShowDropdown(true)
        }
        setDetecting(false)
      },
      (err) => {
        setDetecting(false)
        const msgs: Record<number,string> = {
          1: 'Permission denied — please select area manually',
          2: 'Location unavailable — please select area manually',
          3: 'Timed out — please select area manually'
        }
        setDetectMsg(msgs[err.code] || 'Location error')
        setShowDropdown(true)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const ready = form.category !== '' && form.ward_number !== '' && form.title.trim().length > 0 && form.description.trim().length > 10

  async function submit() {
    if (!ready) return
    setLoading(true)
    const { data, error } = await supabase.from('complaints').insert([{
      category: form.category,
      ward_number: parseInt(form.ward_number),
      area: form.area_name,
      title: form.title,
      description: form.description,
      status: 'open',
      upvotes: 0,
      source: 'anonymous',
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    }]).select()
    setLoading(false)
    if (!error && data) {
      const shortId = data[0].id.slice(0,8).toUpperCase()
      setComplaintId(shortId)
      try {
        const existing = JSON.parse(localStorage.getItem('nagrik_complaints') || '[]')
        existing.push({ id: data[0].id, short: shortId, title: form.title, area: form.area_name, date: new Date().toISOString() })
        localStorage.setItem('nagrik_complaints', JSON.stringify(existing))
      } catch {}
      setSubmitted(true)
    }
  }

  function resetForm() {
    setSubmitted(false)
    setForm({ category:'', ward_number:'', area_name:'', title:'', description:'', latitude:'', longitude:'' })
    setAreaSearch('')
    setAiSuggestion(null)
    setPinCoords(null)
    mapRef.current = null
    markerRef.current = null
  }

  if (submitted) {
    return (
      <SuccessScreen
        complaintId={complaintId}
        areaName={form.area_name}
        pinCoords={pinCoords}
        onReset={resetForm}
        router={router}
      />
    )
  }

  const navStyle: React.CSSProperties = {
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '0 32px',
    height: '58px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(13,13,20,0.85)',
    backdropFilter: 'blur(12px)'
  }

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" async/>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>

      <nav style={navStyle}>
        <a href="/login" style={{ fontSize:'20px', fontWeight:'800', color:'#E8731A', textDecoration:'none' }}>nagrik</a>
        <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.25)' }}>File a complaint · No login needed</span>
      </nav>

      <div style={{ maxWidth:'560px', margin:'0 auto', padding:'40px 24px' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'900', color:'white', marginBottom:'6px', letterSpacing:'-0.5px' }}>
          What is the issue?
        </h1>
        <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.35)', marginBottom:'36px' }}>
          Describe the problem — AI will auto-detect the category.
        </p>

        <div style={{ marginBottom:'16px' }}>
          <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>
            Title
          </label>
          <input
            value={form.title}
            onChange={e => setField('title', e.target.value)}
            placeholder="e.g. Pothole on main road"
            style={{
              background:'rgba(255,255,255,0.05)',
              border: '1px solid ' + (form.title.length > 0 ? 'rgba(232,115,26,0.4)' : 'rgba(255,255,255,0.08)'),
              color:'white', borderRadius:'10px', padding:'14px',
              fontSize:'15px', width:'100%', outline:'none'
            }}
          />
        </div>

        <div style={{ marginBottom:'20px' }}>
          <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={e => setField('description', e.target.value)}
            placeholder="How long? How bad? How many people affected?"
            rows={3}
            style={{
              background:'rgba(255,255,255,0.05)',
              border:'1px solid rgba(255,255,255,0.08)',
              color:'white', borderRadius:'10px', padding:'14px',
              fontSize:'14px', width:'100%', outline:'none',
              resize:'vertical', fontFamily:'inherit'
            }}
          />
        </div>

        {aiLoading && (
          <div style={{ background:'rgba(232,115,26,0.08)', border:'1px solid rgba(232,115,26,0.15)', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'14px', height:'14px', border:'2px solid rgba(232,115,26,0.3)', borderTop:'2px solid #E8731A', borderRadius:'50%', flexShrink:0, animation:'spin 0.8s linear infinite' }}/>
            <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)' }}>AI analysing your complaint...</span>
          </div>
        )}

        {aiSuggestion && !form.category && (
          <div style={{ background:'rgba(232,115,26,0.1)', border:'1px solid rgba(232,115,26,0.3)', borderRadius:'10px', padding:'14px 16px', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
            <div>
              <div style={{ fontSize:'11px', color:'rgba(232,115,26,0.6)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'3px' }}>AI suggestion</div>
              <div style={{ fontSize:'14px', fontWeight:'700', color:'white' }}>
                Looks like a <span style={{ color:'#E8731A' }}>{aiSuggestion}</span> issue
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
              <button
                onClick={() => { setForm(f => ({ ...f, category: aiSuggestion! })); setAiSuggestion(null) }}
                style={{ background:'#E8731A', color:'white', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
                Use this
              </button>
              <button
                onClick={() => setAiSuggestion(null)}
                style={{ background:'transparent', color:'rgba(255,255,255,0.3)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', fontSize:'13px', cursor:'pointer' }}>
                X
              </button>
            </div>
          </div>
        )}

        <div style={{ marginBottom:'28px' }}>
          <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.8px' }}>
            Category
          </label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                style={{
                  padding:'14px 8px', borderRadius:'12px',
                  border: '1px solid ' + (form.category===cat.id ? 'rgba(232,115,26,0.6)' : 'rgba(255,255,255,0.07)'),
                  background: form.category===cat.id ? 'rgba(232,115,26,0.12)' : 'rgba(255,255,255,0.03)',
                  color: form.category===cat.id ? '#E8731A' : 'rgba(255,255,255,0.4)',
                  fontSize:'11px', fontWeight:'600', cursor:'pointer',
                  textAlign:'center', transition:'all 0.15s'
                }}>
                <div style={{ fontSize:'20px', marginBottom:'6px' }}>{cat.icon}</div>
                {cat.label}
              </button>
            ))}
          </div>
          {form.category && (
            <div style={{ marginTop:'10px', fontSize:'12px', color:'#3DAA6E' }}>
              Auto-assigned to <strong>{DEPARTMENTS[form.category]}</strong>
            </div>
          )}
        </div>

        <div style={{ marginBottom:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
            <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.8px' }}>
              Your area
            </label>
            <button
              onClick={detectLocation}
              disabled={detecting}
              style={{ fontSize:'11px', color: detecting ? 'rgba(255,255,255,0.25)' : '#E8731A', background:'transparent', border:'none', cursor: detecting ? 'default' : 'pointer', fontWeight:'600' }}>
              {detecting ? 'Detecting...' : '📍 Use my location'}
            </button>
          </div>

          {detectMsg && (
            <div style={{ fontSize:'12px', color: detectMsg.startsWith('✓') ? '#3DAA6E' : 'rgba(255,255,255,0.45)', marginBottom:'8px', padding:'8px 12px', background:'rgba(255,255,255,0.04)', borderRadius:'8px' }}>
              {detectMsg}
            </div>
          )}

          <div style={{ display:'flex', gap:'6px', marginBottom:'10px', flexWrap:'wrap' }}>
            {ZONES.map(z => (
              <button
                key={z}
                onClick={() => { setZone(z); setShowDropdown(true) }}
                style={{
                  padding:'4px 12px', borderRadius:'20px', border:'1px solid',
                  borderColor: zone===z ? 'rgba(232,115,26,0.5)' : 'rgba(255,255,255,0.08)',
                  background: zone===z ? 'rgba(232,115,26,0.1)' : 'transparent',
                  color: zone===z ? '#E8731A' : 'rgba(255,255,255,0.35)',
                  fontSize:'11px', fontWeight:'600', cursor:'pointer'
                }}>
                {z}
              </button>
            ))}
          </div>

          <div style={{ position:'relative' }}>
            <input
              value={areaSearch}
              onChange={e => { setAreaSearch(e.target.value); setForm(f => ({ ...f, ward_number:'', area_name:'' })); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder={areas.length === 0 ? 'Loading areas...' : 'Type area — Dharampeth, Sadar, Itwari...'}
              style={{
                background:'rgba(255,255,255,0.05)',
                border: '1px solid ' + (form.ward_number ? 'rgba(232,115,26,0.4)' : 'rgba(255,255,255,0.08)'),
                color:'white', borderRadius:'10px', padding:'12px 14px',
                fontSize:'14px', width:'100%', outline:'none'
              }}
            />

            {showDropdown && !form.ward_number && (
              <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'#13131F', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', maxHeight:'240px', overflowY:'auto', zIndex:100, boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
                {areas.length === 0 && (
                  <div style={{ padding:'14px 16px', fontSize:'13px', color:'rgba(255,255,255,0.3)' }}>Loading...</div>
                )}
                {areas.length > 0 && filteredAreas.length === 0 && (
                  <div style={{ padding:'14px 16px', fontSize:'13px', color:'rgba(255,255,255,0.3)' }}>No areas found</div>
                )}
                {filteredAreas.slice(0, 30).map(area => (
                  <div
                    key={area.ward_number}
                    onMouseDown={() => selectArea(area)}
                    style={{ padding:'11px 16px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,115,26,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                    <span style={{ fontSize:'14px', color:'rgba(255,255,255,0.9)' }}>{area.area_name}</span>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{area.zone} · W{area.ward_number}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {form.ward_number && (
            <div style={{ fontSize:'12px', color:'#3DAA6E', marginTop:'8px', display:'flex', alignItems:'center', gap:'6px' }}>
              {form.area_name} — Ward {form.ward_number}
              <button
                onMouseDown={() => { setForm(f => ({ ...f, ward_number:'', area_name:'' })); setAreaSearch('') }}
                style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:'11px' }}>
                change
              </button>
            </div>
          )}
        </div>

        <div style={{ marginBottom:'32px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
            <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.8px' }}>
              Pin exact location (optional)
            </label>
            <button
              onClick={() => setShowMap(m => !m)}
              style={{ fontSize:'11px', color: showMap ? '#3DAA6E' : 'rgba(255,255,255,0.5)', background:'transparent', border:'none', cursor:'pointer', fontWeight:'600' }}>
              {showMap ? 'Map open' : '🗺 Open map'}
            </button>
          </div>

          {showMap && (
            <div style={{ borderRadius:'12px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)', marginBottom:'8px' }}>
              <div style={{ background:'rgba(255,255,255,0.04)', padding:'10px 14px', fontSize:'12px', color:'rgba(255,255,255,0.35)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                Tap anywhere on the map to drop a pin
              </div>
              <div ref={mapDivRef} style={{ height:'300px', width:'100%' }} />
            </div>
          )}

          {pinCoords && (
            <div style={{ fontSize:'12px', color:'#3DAA6E', display:'flex', alignItems:'center', gap:'6px' }}>
              Pinned: {pinCoords.lat.toFixed(4)}, {pinCoords.lng.toFixed(4)}
              <button
                onClick={() => {
                  setPinCoords(null)
                  setForm(f => ({ ...f, latitude:'', longitude:'' }))
                  if (markerRef.current) { markerRef.current.remove(); markerRef.current = null }
                }}
                style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:'11px' }}>
                remove
              </button>
            </div>
          )}
        </div>

        <button
          onClick={submit}
          disabled={!ready || loading}
          style={{
            width:'100%',
            background: ready ? '#E8731A' : 'rgba(255,255,255,0.06)',
            color: ready ? 'white' : 'rgba(255,255,255,0.2)',
            border: ready ? 'none' : '1px solid rgba(255,255,255,0.08)',
            padding:'16px', borderRadius:'12px',
            fontSize:'15px', fontWeight:'700',
            cursor: ready ? 'pointer' : 'not-allowed',
            transition:'all 0.2s'
          }}>
          {loading ? 'Submitting...' : ready ? 'Submit complaint' : 'Fill in the details above'}
        </button>

        <div style={{ marginTop:'16px', textAlign:'center', fontSize:'12px', color:'rgba(255,255,255,0.2)' }}>
          <a href="/login" style={{ color:'#E8731A', textDecoration:'none', fontWeight:'600' }}>Sign in</a> to track this complaint and get notified
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .leaflet-container { font-family: inherit !important; }
        .leaflet-popup-content-wrapper { background: #1A1A2E !important; color: white !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 10px !important; box-shadow: none !important; }
        .leaflet-popup-tip { background: #1A1A2E !important; }
      `}</style>
    </main>
  )
}