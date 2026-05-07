export default function App() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#F5F0E8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px'
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        background: '#E7633B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36
      }}>
        💼
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1A1410', textAlign: 'center' }}>
        Kazi AI
      </h1>
      <p style={{ fontSize: 16, color: '#3D3025', textAlign: 'center', maxWidth: 400 }}>
        Loading your complete CV builder and job matching platform...
      </p>
      <button
        onClick={() => console.log('Test button clicked')}
        style={{
          padding: '16px 32px',
          background: '#E7633B',
          color: 'white',
          border: 'none',
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'Sora, sans-serif'
        }}
      >
        Click to Test
      </button>
      <div style={{ fontSize: 12, color: '#8A7D6E', marginTop: 20 }}>
        If you see this, basic rendering works. Checking console for errors...
      </div>
    </div>
  );
}
