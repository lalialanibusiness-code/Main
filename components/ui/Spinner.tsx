export function Spinner() {
  return <span style={{ display: 'inline-block', animation: 'spin 0.7s linear infinite', opacity: 0.5 }}>◌</span>;
}

export function Divider() {
  return <div style={{ borderTop: '1px solid #D9CFBC', margin: '20px 0' }} />;
}
