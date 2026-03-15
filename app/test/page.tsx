export default function TestPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', color: '#10b981' }}>✅ SERVER WORKS!</h1>
      <p style={{ fontSize: '24px', marginTop: '20px' }}>
        Next.js is running successfully!
      </p>
      <p style={{ fontSize: '18px', color: '#6b7280', marginTop: '10px' }}>
        Time: {new Date().toLocaleString('th-TH')}
      </p>
    </div>
  );
}
