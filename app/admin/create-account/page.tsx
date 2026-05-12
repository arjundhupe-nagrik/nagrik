'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabase.js'
import { useRouter } from 'next/navigation'

const DEPARTMENTS = [
  'All Departments','NMC Solid Waste','NMC Drainage',
  'PWD / NMC Roads','NMC Water Works','NMC Encroachment',
  'NMC Sanitation','NMC Electrical','NMC General'
]

export default function CreateAdminAccount() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email:'', name:'', department:'All Departments', role:'officer', password:''
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/admin/login'); return }
    const { data: adminData } = await supabase.from('admins').select('*').eq('email', session.user.email).single()
    if (!adminData || adminData.role !== 'superadmin') { router.push('/admin/dashboard'); return }
    setAdmin(adminData)
    loadAdmins()
  }

  async function loadAdmins() {
    const { data } = await supabase.from('admins').select('*').order('created_at', { ascending: false })
    if (data) setAdmins(data)
  }

  async function createAdmin() {
    if (!form.email || !form.name || !form.password) return
    setLoading(true)
    setError('')
    setSuccess('')

    // Create auth user
    const { data, error: authError } = await supabase.auth.admin.createUser({
      email: form.email,
      password: form.password,
      email_confirm: true
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Add to admins table
    const { error: dbError } = await supabase.from('admins').insert([{
      email: form.email,
      name: form.name,
      department: form.department,
      role: form.role
    }])

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    setSuccess(`Admin account created for ${form.email}`)
    setForm({ email:'', name:'', department:'All Departments', role:'officer', password:'' })
    loadAdmins()
    setLoading(false)
  }

  async function deleteAdmin(email: string) {
    if (email === admin?.email) { setError("You can't delete your own account"); return }
    await supabase.from('admins').delete().eq('email', email)
    loadAdmins()
  }

  return (
    <main style={{ minHeight:'100vh', background:'#0D0D14', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 24px', height:'58px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(13,13,20,0.9)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'18px', fontWeight:'900', color:'#E8731A' }}>nagrik</span>
          <span style={{ fontSize:'11px', background:'rgba(200,146,10,0.15)', border:'1px solid rgba(200,146,10,0.3)', padding:'2px 8px', borderRadius:'20px', color:'#C8920A' }}>ADMIN</span>
        </div>
        <button onClick={() => router.push('/admin/dashboard')}
          style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', padding:'6px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>
          ← Back to dashboard
        </button>
      </nav>

      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'32px 24px' }}>
        <h1 style={{ fontSize:'26px', fontWeight:'900', color:'white', letterSpacing:'-0.5px', marginBottom:'6px' }}>Manage admin accounts</h1>
        <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.35)', marginBottom:'32px' }}>Create and manage NMC officer access. Superadmin only.</p>

        {/* Create form */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'24px', marginBottom:'28px' }}>
          <div style={{ fontSize:'14px', fontWeight:'700', color:'white', marginBottom:'20px' }}>Create new admin account</div>

          {error && (
            <div style={{ background:'rgba(224,82,82,0.1)', border:'1px solid rgba(224,82,82,0.2)', borderRadius:'8px', padding:'10px 14px', marginBottom:'14px', fontSize:'13px', color:'#E05252' }}>{error}</div>
          )}
          {success && (
            <div style={{ background:'rgba(61,170,110,0.1)', border:'1px solid rgba(61,170,110,0.2)', borderRadius:'8px', padding:'10px 14px', marginBottom:'14px', fontSize:'13px', color:'#3DAA6E' }}>✓ {success}</div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
            <div>
              <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Full name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ramesh Patil"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'11px 14px', fontSize:'14px', width:'100%', outline:'none' }} />
            </div>
            <div>
              <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="officer@nmc.gov.in"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'11px 14px', fontSize:'14px', width:'100%', outline:'none' }} />
            </div>
            <div>
              <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min 8 characters"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'11px 14px', fontSize:'14px', width:'100%', outline:'none' }} />
            </div>
            <div>
              <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Department</label>
              <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'11px 14px', fontSize:'14px', width:'100%', outline:'none' }}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom:'20px' }}>
            <label style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Role</label>
            <div style={{ display:'flex', gap:'10px' }}>
              {['officer','superadmin'].map(r => (
                <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                  style={{ padding:'8px 20px', borderRadius:'8px', border:`1px solid ${form.role===r ? 'rgba(232,115,26,0.5)' : 'rgba(255,255,255,0.08)'}`, background: form.role===r ? 'rgba(232,115,26,0.12)' : 'transparent', color: form.role===r ? '#E8731A' : 'rgba(255,255,255,0.4)', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
                  {r === 'superadmin' ? 'Superadmin' : 'Officer'}
                </button>
              ))}
            </div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', marginTop:'6px' }}>
              {form.role === 'superadmin' ? 'Can create/delete admin accounts and access everything' : 'Can manage complaints assigned to their department'}
            </div>
          </div>

          <button onClick={createAdmin} disabled={loading || !form.email || !form.name || !form.password}
            style={{ background: (form.email && form.name && form.password) ? '#E8731A' : 'rgba(255,255,255,0.06)', color: (form.email && form.name && form.password) ? 'white' : 'rgba(255,255,255,0.2)', border:'none', padding:'12px 28px', borderRadius:'10px', fontSize:'14px', fontWeight:'700', cursor:(form.email && form.name && form.password) ? 'pointer' : 'not-allowed' }}>
            {loading ? 'Creating...' : 'Create admin account →'}
          </button>
        </div>

        {/* Existing admins */}
        <div style={{ fontSize:'13px', fontWeight:'700', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'12px' }}>
          Current admins ({admins.length})
        </div>
        {admins.map(a => (
          <div key={a.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'14px 18px', marginBottom:'8px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
            <div>
              <div style={{ fontSize:'14px', fontWeight:'600', color:'white', marginBottom:'3px' }}>{a.name}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)' }}>{a.email} · {a.department}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px', background: a.role==='superadmin' ? 'rgba(232,115,26,0.15)' : 'rgba(255,255,255,0.06)', color: a.role==='superadmin' ? '#E8731A' : 'rgba(255,255,255,0.4)', fontWeight:'600' }}>
                {a.role}
              </span>
              {a.email !== admin?.email && (
                <button onClick={() => deleteAdmin(a.email)}
                  style={{ background:'rgba(224,82,82,0.1)', border:'1px solid rgba(224,82,82,0.2)', color:'#E05252', padding:'5px 12px', borderRadius:'6px', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}>
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}