'use client'
import { useState } from 'react'
import { supabase } from '../../supabase.js'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function login() {
    if (!email || !password) return
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('email', data.user.email)
      .single()

    if (!adminData) {
      await supabase.auth.signOut()
      setError('You are not authorised as an admin')
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
  }

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif", display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>

        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <a href="/" style={{ fontSize:'28px', fontWeight:'900', color:'#E8731A', textDecoration:'none', display:'block', marginBottom:'8px' }}>nagrik</a>
          <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.35)' }}>Admin portal — NMC access only</div>
        </div>

        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'32px' }}>
          <div style={{ fontSize:'18px', fontWeight:'800', color:'white', marginBottom:'24px' }}>Sign in</div>

          {error && (
            <div style={{ background:'rgba(224,82,82,0.1)', border:'1px solid rgba(224,82,82,0.2)', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'13px', color:'#E05252' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom:'16px' }}>
            <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              onKeyDown={e => e.key === 'Enter' && login()}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'12px 14px', fontSize:'14px', width:'100%', outline:'none' }}
            />
          </div>

          <div style={{ marginBottom:'24px' }}>
            <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && login()}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'12px 14px', fontSize:'14px', width:'100%', outline:'none' }}
            />
          </div>

          <button onClick={login} disabled={loading || !email || !password}
            style={{ width:'100%', background: (email && password) ? '#E8731A' : 'rgba(255,255,255,0.06)', color: (email && password) ? 'white' : 'rgba(255,255,255,0.2)', border:'none', padding:'14px', borderRadius:'10px', fontSize:'15px', fontWeight:'700', cursor:(email && password) ? 'pointer' : 'not-allowed', transition:'all 0.2s' }}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </div>

        <div style={{ textAlign:'center', marginTop:'20px', fontSize:'12px', color:'rgba(255,255,255,0.2)' }}>
          This portal is for authorised NMC officials only
        </div>
      </div>
    </main>
  )
}