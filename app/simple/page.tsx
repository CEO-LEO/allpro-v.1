export default function SimplePage() {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '60px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          marginBottom: '20px',
          color: '#10b981'
        }}>
          ✅ Next.js Works!
        </h1>
        <p style={{ 
          fontSize: '24px', 
          color: '#666',
          marginBottom: '30px'
        }}>
          Server กำลังทำงานปกติ
        </p>
        <div style={{
          background: '#f3f4f6',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '20px'
        }}>
          <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
            Time: {new Date().toLocaleString('th-TH')}
          </p>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '10px', marginBottom: 0 }}>
            Next.js 16.1.4 • Turbopack
          </p>
        </div>
        <div style={{ marginTop: '30px' }}>
          <a 
            href="/test"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              marginRight: '10px'
            }}
          >
            Test Page
          </a>
        </div>
      </div>
    </div>
  );
}
