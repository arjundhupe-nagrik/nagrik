export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#1A1A2E',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ fontSize: '48px', fontWeight: '900', color: '#E8731A', marginBottom: '12px' }}>
        nagrik
      </div>
      <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>
        Your city. Your voice.
      </div>
      <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', maxWidth: '400px', lineHeight: '1.6' }}>
        File, track & resolve civic issues in Nagpur — ward by ward, issue by issue.
      </div>
      <button style={{
        marginTop: '32px',
        background: '#E8731A',
        color: 'white',
        border: 'none',
        padding: '14px 32px',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer'
      }}>
        File a Complaint
      </button>
    </main>
  )
}