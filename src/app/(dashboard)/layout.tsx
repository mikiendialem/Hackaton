export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: `
        radial-gradient(at 10% 20%, rgba(34,197,94,0.18) 0px, transparent 45%),
        radial-gradient(at 90% 0%, rgba(56,189,248,0.16) 0px, transparent 50%),
        radial-gradient(at 0% 50%, rgba(96,165,250,0.12) 0px, transparent 55%),
        radial-gradient(at 80% 60%, rgba(244,63,94,0.1) 0px, transparent 55%),
        #050816
      `,
      minHeight: '100vh',
    }}>
      {children}
    </div>
  )
}