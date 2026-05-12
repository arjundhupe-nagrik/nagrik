'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'
import { useRouter } from 'next/navigation'

const LANG = {
  en: {
    badge: 'Nagpur · Free · Public',
    h1: 'Your city.', h2: "Your complaints.", h3: 'Finally heard.',
    sub: 'File civic issues. Track them live. Hold Nagpur accountable.',
    mission: 'We believe every Nagpur citizen deserves to be heard. Not just heard — acted upon. nagrik exists to make sure no complaint disappears.',
    vision: 'A Nagpur where every civic problem is visible, every department is accountable, and every citizen has a voice that matters.',
    features: ['File in 60 seconds','Live status tracking','Ward-level data','AI auto-tagging'],
    googleBtn: 'Continue with Google',
    createBtn: 'Create account →', signInBtn: 'Sign in →',
    nameP: 'Full name', emailP: 'Email', passP: 'Password',
    noAcc: "No account? ", hasAcc: 'Have account? ',
    createL: 'Join free', signL: 'Sign in',
    skipBtn: 'Browse without account →',
    orEmail: 'or with email',
    noLoginTitle: "Don't want an account?",
    fileBtn: '📝 File complaint', browseBtn: '🔍 Browse feed',
    tabCreate: 'Create account', tabSign: 'Sign in',
    ribbon: 'Complain without signing in',
    ribbonSub: 'No account needed · Goes directly to authorities',
    welcomeBack: 'Good to have you back',
  },
  hi: {
    badge: 'नागपुर · मुफ्त · सार्वजनिक',
    h1: 'आपका शहर।', h2: 'आपकी शिकायत।', h3: 'अब सुनी जाएगी।',
    sub: 'समस्या दर्ज करें। लाइव ट्रैक करें। जवाब माँगें।',
    mission: 'हम मानते हैं कि नागपुर के हर नागरिक की आवाज़ सुनी जानी चाहिए। सिर्फ सुनी नहीं — उस पर action होना चाहिए।',
    vision: 'एक ऐसा नागपुर जहाँ हर समस्या दिखती है, हर विभाग जवाबदेह है, और हर नागरिक की आवाज़ मायने रखती है।',
    features: ['60 सेकंड में file','लाइव status','वार्ड डेटा','AI auto-tag'],
    googleBtn: 'Google से जारी रखें',
    createBtn: 'Account बनाएं →', signInBtn: 'Sign in करें →',
    nameP: 'पूरा नाम', emailP: 'Email', passP: 'पासवर्ड',
    noAcc: 'Account नहीं? ', hasAcc: 'Account है? ',
    createL: 'मुफ्त बनाएं', signL: 'Sign in',
    skipBtn: 'बिना account के देखें →',
    orEmail: 'या email से',
    noLoginTitle: 'Account नहीं चाहिए?',
    fileBtn: '📝 शिकायत दर्ज', browseBtn: '🔍 फीड देखें',
    tabCreate: 'Account बनाएं', tabSign: 'Sign in',
    ribbon: 'बिना sign in के शिकायत करें',
    ribbonSub: 'Account नहीं चाहिए · सीधे authorities तक',
    welcomeBack: 'आपका स्वागत है',
  },
  mr: {
    badge: 'नागपूर · मोफत · सार्वजनिक',
    h1: 'तुमचे शहर।', h2: 'तुमची तक्रार।', h3: 'आता ऐकली जाईल।',
    sub: 'तक्रार नोंदवा. लाइव्ह ट्रॅक करा. जाब मागा.',
    mission: 'आम्हाला विश्वास आहे की नागपूरच्या प्रत्येक नागरिकाचा आवाज ऐकला जावा. फक्त ऐकला नाही — त्यावर कारवाई व्हावी.',
    vision: 'असा नागपूर जिथे प्रत्येक समस्या दिसते, प्रत्येक विभाग जबाबदार आहे, आणि प्रत्येक नागरिकाचा आवाज महत्त्वाचा आहे.',
    features: ['60 सेकंदात file','लाइव्ह status','वार्ड डेटा','AI auto-tag'],
    googleBtn: 'Google ने सुरू ठेवा',
    createBtn: 'Account बनवा →', signInBtn: 'Sign in करा →',
    nameP: 'पूर्ण नाव', emailP: 'Email', passP: 'पासवर्ड',
    noAcc: 'Account नाही? ', hasAcc: 'Account आहे? ',
    createL: 'मोफत बनवा', signL: 'Sign in',
    skipBtn: 'Account शिवाय पहा →',
    orEmail: 'किंवा email ने',
    noLoginTitle: 'Account नको?',
    fileBtn: '📝 तक्रार नोंदवा', browseBtn: '🔍 फीड पहा',
    tabCreate: 'Account बनवा', tabSign: 'Sign in',
    ribbon: 'Sign in शिवाय तक्रार करा',
    ribbonSub: 'Account नको · थेट authorities कडे जाते',
    welcomeBack: 'परत आलात, छान',
  }
}

type L = 'en'|'hi'|'mr'

export default function LoginPage() {
  const router = useRouter()
  const [lang, setLang] = useState<L>('en')
  const [mode, setMode] = useState<'signup'|'signin'>('signup')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const t = LANG[lang]

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) { router.push('/'); return }
      setChecking(false)
    })
    const timer = setInterval(() => setTick(n => (n+1) % 4), 2600)
    return () => clearInterval(timer)
  }, [])

  async function googleAuth() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider:'google', options:{ redirectTo:`${window.location.origin}/auth/callback` }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  async function signUp() {
    if (!form.email||!form.password||!form.name) { setError('Please fill all fields'); return }
    if (form.password.length<6) { setError('Password min 6 characters'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email:form.email, password:form.password, options:{ data:{ full_name:form.name } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/onboarding')
  }

  async function signIn() {
    if (!form.email||!form.password) { setError('Enter email and password'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email:form.email, password:form.password })
    if (error) { setError('Invalid email or password'); setLoading(false); return }
    router.push('/')
  }

  const stats = [
    { val:'162', label: lang==='en'?'Wards covered':lang==='hi'?'वार्ड covered':'वार्ड', color:'#E8731A', icon:'🗺️' },
    { val: lang==='en'?'Always':lang==='hi'?'हमेशा':'नेहमी', label: lang==='en'?'Free to use':lang==='hi'?'मुफ्त':'मोफत', color:'#3DAA6E', icon:'✅' },
    { val:'100%', label: lang==='en'?'Transparent':lang==='hi'?'पारदर्शी':'पारदर्शक', color:'#185FA5', icon:'🔍' },
    { val: lang==='en'?'Public':lang==='hi'?'सार्वजनिक':'सार्वजनिक', label: lang==='en'?'All data open':lang==='hi'?'खुला डेटा':'खुला डेटा', color:'#C8920A', icon:'📊' },
  ]

  if (checking) return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ color:'rgba(255,255,255,0.2)', fontSize:'14px' }}>Loading...</div>
    </main>
  )

  return (
    <main style={{ height:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif", display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <nav style={{ height:'52px', flexShrink:0, padding:'0 28px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize:'20px', fontWeight:'900', color:'#E8731A' }}>nagrik</div>
        <div style={{ display:'flex', gap:'3px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'3px' }}>
          {(['en','hi','mr'] as L[]).map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ padding:'4px 12px', borderRadius:'5px', border:'none', background:lang===l?'#E8731A':'transparent', color:lang===l?'white':'rgba(255,255,255,0.4)', fontSize:'11px', fontWeight:'700', cursor:'pointer', transition:'all 0.15s' }}>
              {l==='en'?'EN':l==='hi'?'हि':'म'}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 400px', minHeight:0 }}>

        {/* LEFT */}
        <div style={{ padding:'28px 40px 24px', display:'flex', flexDirection:'column', justifyContent:'space-between', borderRight:'1px solid rgba(255,255,255,0.07)', overflow:'hidden' }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(232,115,26,0.1)', border:'1px solid rgba(232,115,26,0.2)', color:'#E8731A', fontSize:'10px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px', marginBottom:'14px', letterSpacing:'0.5px' }}>
              <span style={{ width:'5px', height:'5px', background:'#E8731A', borderRadius:'50%', animation:'pulse 2s infinite' }}/>
              {t.badge}
            </div>
            <div style={{ fontSize:'clamp(26px,3.2vw,42px)', fontWeight:'900', color:'white', lineHeight:'1.08', letterSpacing:'-1.5px', marginBottom:'4px' }}>
              {t.h1}<br/>{t.h2}<br/><span style={{ color:'#E8731A' }}>{t.h3}</span>
            </div>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', marginTop:'10px', lineHeight:'1.5', maxWidth:'380px' }}>{t.sub}</p>
          </div>

          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'14px' }}>
              {stats.map((s,i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'10px 8px', textAlign:'center' }}>
                  <div style={{ fontSize:'18px', marginBottom:'4px' }}>{s.icon}</div>
                  <div style={{ fontSize:'14px', fontWeight:'800', color:s.color, lineHeight:'1' }}>{s.val}</div>
                  <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.35)', marginTop:'3px', lineHeight:'1.3' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'12px 16px', marginBottom:'14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:'13px', fontWeight:'600', color:'white' }}>
                {lang==='en'?'✦ When you sign in:':lang==='hi'?'✦ Sign in करने पर:':'✦ Sign in केल्यावर:'} <span style={{ color:'#E8731A' }}>{t.features[tick]}</span>
              </div>
              <div style={{ display:'flex', gap:'4px', flexShrink:0 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ height:'3px', width:i===tick?'16px':'6px', borderRadius:'2px', background:i===tick?'#E8731A':'rgba(255,255,255,0.12)', transition:'all 0.3s' }}/>
                ))}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
              <div style={{ background:'rgba(232,115,26,0.06)', border:'1px solid rgba(232,115,26,0.15)', borderRadius:'10px', padding:'12px 14px' }}>
                <div style={{ fontSize:'9px', fontWeight:'700', color:'#E8731A', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'5px' }}>
                  {lang==='en'?'Our mission':lang==='hi'?'हमारा mission':'आमचे mission'}
                </div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', lineHeight:'1.5' }}>{t.mission}</div>
              </div>
              <div style={{ background:'rgba(61,170,110,0.06)', border:'1px solid rgba(61,170,110,0.15)', borderRadius:'10px', padding:'12px 14px' }}>
                <div style={{ fontSize:'9px', fontWeight:'700', color:'#3DAA6E', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'5px' }}>
                  {lang==='en'?'Our vision':lang==='hi'?'हमारा vision':'आमचे vision'}
                </div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', lineHeight:'1.5' }}>{t.vision}</div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', marginBottom:'8px' }}>{t.noLoginTitle}</div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => router.push('/file')}
                style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(255,255,255,0.6)', padding:'9px 12px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.2)')}
                onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.09)')}>
                {t.fileBtn}
              </button>
              <button onClick={() => router.push('/public')}
                style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(255,255,255,0.6)', padding:'9px 12px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.2)')}
                onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.09)')}>
                {t.browseBtn}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 28px', background:'rgba(255,255,255,0.01)' }}>
          <div style={{ width:'100%' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'3px', marginBottom:'16px', border:'1px solid rgba(255,255,255,0.07)' }}>
              {(['signup','signin'] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); setForm({ name:'', email:'', password:'' }) }}
                  style={{ padding:'10px', borderRadius:'7px', border:'none', background:mode===m?'#E8731A':'transparent', color:mode===m?'white':'rgba(255,255,255,0.4)', fontSize:'13px', fontWeight:'700', cursor:'pointer', transition:'all 0.2s' }}>
                  {m==='signup'?t.tabCreate:t.tabSign}
                </button>
              ))}
            </div>

            {/* MVP ribbon */}
            <button onClick={() => router.push('/file')}
              style={{ width:'100%', background:'rgba(61,170,110,0.08)', border:'1px solid rgba(61,170,110,0.25)', borderRadius:'10px', padding:'10px 14px', marginBottom:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px', transition:'all 0.15s' }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(61,170,110,0.5)')}
              onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(61,170,110,0.25)')}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontSize:'18px' }}>📝</span>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize:'12px', fontWeight:'700', color:'#3DAA6E' }}>{t.ribbon}</div>
                  <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', marginTop:'1px' }}>{t.ribbonSub}</div>
                </div>
              </div>
              <span style={{ color:'#3DAA6E', fontSize:'16px' }}>→</span>
            </button>

            <div style={{ marginBottom:'14px' }}>
              <h2 style={{ fontSize:'18px', fontWeight:'800', color:'white', margin:'0 0 3px' }}>
                {mode==='signup'
                  ? (lang==='en'?'Join nagrik':lang==='hi'?'nagrik से जुड़ें':'nagrik मध्ये सामील व्हा')
                  : (lang==='en'?'Welcome back':lang==='hi'?'वापसी पर स्वागत':'परत स्वागत')}
              </h2>
              {mode==='signin' && (
                <p style={{ margin:0, fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>{t.welcomeBack}</p>
              )}
            </div>

            {error && (
              <div style={{ background:'rgba(224,82,82,0.1)', border:'1px solid rgba(224,82,82,0.2)', borderRadius:'8px', padding:'9px 12px', marginBottom:'12px', fontSize:'12px', color:'#E05252' }}>
                {error}
              </div>
            )}

            <button onClick={googleAuth} disabled={loading}
              style={{ width:'100%', background:'white', color:'#1A1A2E', border:'none', padding:'12px', borderRadius:'10px', fontSize:'14px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'12px', opacity:loading?0.7:1 }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t.googleBtn}
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
              <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.07)' }}/>
              <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.2)' }}>{t.orEmail}</span>
              <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.07)' }}/>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'12px' }}>
              {mode==='signup' && (
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))}
                  placeholder={t.nameP}
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'8px', padding:'11px 12px', fontSize:'13px', width:'100%', outline:'none' }} />
              )}
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email:e.target.value }))}
                placeholder={t.emailP}
                onKeyDown={e => e.key==='Enter' && (mode==='signup'?signUp():signIn())}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'8px', padding:'11px 12px', fontSize:'13px', width:'100%', outline:'none' }} />
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password:e.target.value }))}
                placeholder={t.passP}
                onKeyDown={e => e.key==='Enter' && (mode==='signup'?signUp():signIn())}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'8px', padding:'11px 12px', fontSize:'13px', width:'100%', outline:'none' }} />
            </div>

            <button onClick={mode==='signup'?signUp:signIn} disabled={loading}
              style={{ width:'100%', background:'#E8731A', color:'white', border:'none', padding:'12px', borderRadius:'8px', fontSize:'14px', fontWeight:'700', cursor:'pointer', marginBottom:'10px', opacity:loading?0.7:1, transition:'opacity 0.2s' }}>
              {loading?'...':(mode==='signup'?t.createBtn:t.signInBtn)}
            </button>

            <div style={{ textAlign:'center', fontSize:'12px', color:'rgba(255,255,255,0.3)', marginBottom:'12px' }}>
              {mode==='signup'
                ? <>{t.hasAcc}<button onClick={() => { setMode('signin'); setError('') }} style={{ background:'none', border:'none', color:'#E8731A', cursor:'pointer', fontWeight:'600', fontSize:'12px' }}>{t.signL}</button></>
                : <>{t.noAcc}<button onClick={() => { setMode('signup'); setError('') }} style={{ background:'none', border:'none', color:'#E8731A', cursor:'pointer', fontWeight:'600', fontSize:'12px' }}>{t.createL}</button></>
              }
            </div>

            <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'12px', textAlign:'center' }}>
              <button onClick={() => router.push('/public')}
                style={{ background:'none', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:'11px' }}>
                {t.skipBtn}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
      `}</style>
    </main>
  )
}