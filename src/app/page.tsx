import Link from 'next/link';
import { Navbar, LiveTicker, FAQ, ContactForm } from '@/components';
import { UserPlus, Search } from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  if (!prisma) return <div>Database Connection Error</div>;

  const latestShifts = await prisma.jobPosting.findMany({
    where: { isActive: true, isFilled: false },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { hotel: true }
  });

  const formattedShifts = latestShifts.map(shift => ({
    id: shift.id,
    title: shift.title,
    hotelName: shift.hotel.hotelName,
    hourlyPay: shift.hourlyPay
  }));

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          Unlock shifts at unique stays
        </h1>
        <p className="hero-subtitle">
          Flexible hospitality jobs at top-rated stays in Singapore.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/auth/register?type=worker" className="btn btn-primary btn-lg">
            I&apos;m Looking for Work
          </Link>
          <Link href="/auth/register?type=hotel" className="btn btn-secondary btn-lg">
            I&apos;m Hiring Staff
          </Link>
        </div>
      </section>

      {/* Live Ticker */}
      <LiveTicker shifts={formattedShifts} />

      {/* How It Works Section */}
      <section id="how-it-works" className="section">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            How <span className="text-gold">Shyft</span> Works
          </h2>
          <p className="text-muted" style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            Get started in two simple steps
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            {/* Step 1 */}
            <div className="card step-card">
              <div className="step-number">
                <UserPlus size={24} />
              </div>
              <h3 className="step-title">Sign Up & Verify</h3>
              <p className="step-description">
                Create your account and upload your ID/work pass.
                Once approved, you&apos;re ready to start earning.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card step-card">
              <div className="step-number">
                <Search size={24} />
              </div>
              <h3 className="step-title">Book Shifts</h3>
              <p className="step-description">
                Browse available shifts, apply instantly, and start earning.
                Track your hours, ratings, and tier progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section" style={{ background: '#E6C7A1' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#5A3E2B' }}>500+</div>
              <div style={{ color: '#6B4F36' }}>Active Workers</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#5A3E2B' }}>50+</div>
              <div style={{ color: '#6B4F36' }}>Partner Hotels</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#5A3E2B' }}>10k+</div>
              <div style={{ color: '#6B4F36' }}>Shifts Completed</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#5A3E2B' }}>4.8</div>
              <div style={{ color: '#6B4F36' }}>Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Contact Section */}
      <ContactForm />

      {/* Footer */}
      <footer style={{
        background: '#5A3E2B',
        borderTop: '1px solid #4A3020',
        padding: '3rem 0',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  background: '#4A3020',
                  border: '2px solid #D4A373',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: '#D4A373',
                }}>
                  S
                </div>
                <span style={{ fontWeight: 700, color: '#FAF6F0' }}>
                  Shyft<span style={{ color: '#D4A373' }}>Sg</span>
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#E6C7A1' }}>
                Connecting hospitality talent with unique stays across Singapore.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#FAF6F0' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="#how-it-works" className="nav-link">How It Works</Link>
                <Link href="#faq" className="nav-link">FAQ</Link>
                <Link href="#contact" className="nav-link">Contact</Link>
              </div>
            </div>

            {/* For Workers */}
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#FAF6F0' }}>For Workers</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/auth/register?type=worker" className="nav-link">Sign Up</Link>
                <Link href="/auth/login" className="nav-link">Login</Link>
                <Link href="#faq" className="nav-link">Help Center</Link>
              </div>
            </div>

            {/* For Hotels */}
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#FAF6F0' }}>For Hotels</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/auth/register?type=hotel" className="nav-link">Partner With Us</Link>
                <Link href="/auth/login" className="nav-link">Hotel Login</Link>
                <Link href="#contact" className="nav-link">Support</Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid #4A3020',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <p style={{ fontSize: '0.75rem', color: '#E6C7A1' }}>
              © 2026 Shyft Sg. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link href="/privacy" className="nav-link" style={{ fontSize: '0.75rem' }}>Privacy Policy</Link>
              <Link href="/terms" className="nav-link" style={{ fontSize: '0.75rem' }}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
