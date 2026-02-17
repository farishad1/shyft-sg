import Link from 'next/link';
import { Navbar } from '@/components';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Terms of Service — Shyft Sg',
    description: 'Terms and conditions governing the use of the Shyft Sg hospitality staffing marketplace.',
};

export default function TermsOfServicePage() {
    return (
        <>
            <Navbar />
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#888', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.875rem' }}>
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)',
                        background: 'rgba(239,191,4,0.1)', border: '1px solid rgba(239,191,4,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <FileText size={24} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Terms of Service</h1>
                        <p style={{ color: '#888', margin: 0, fontSize: '0.875rem' }}>Last updated: 16 February 2026</p>
                    </div>
                </div>

                <div className="legal-content" style={{ lineHeight: 1.8, color: '#ccc' }}>
                    <Section title="1. Acceptance of Terms">
                        <p>
                            By creating an account or using the Shyft Sg platform (the &ldquo;Platform&rdquo;), you agree to be
                            bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, you must not use the Platform.
                            These Terms constitute a legally binding agreement between you and Shyft Sg Pte Ltd (&ldquo;Shyft Sg&rdquo;).
                        </p>
                    </Section>

                    <Section title="2. Platform Overview">
                        <p>
                            Shyft Sg operates a digital marketplace connecting hospitality workers (&ldquo;Workers&rdquo;) with
                            boutique hotels, capsule hotels, and serviced apartments (&ldquo;Hotels&rdquo;) in Singapore.
                        </p>
                        <p>
                            <strong>Shyft Sg is not an employer.</strong> We act solely as an intermediary platform facilitating
                            connections between Workers and Hotels. The employment relationship (whether temporary, part-time,
                            or freelance) exists exclusively between the Worker and the Hotel.
                        </p>
                    </Section>

                    <Section title="3. Eligibility">
                        <ul>
                            <li>You must be at least <strong>13 years of age</strong> to create an account</li>
                            <li>Workers under <strong>16 years of age</strong> are subject to minor work restrictions (see Section 8)</li>
                            <li>Workers must hold a valid work authorization recognized by the Ministry of Manpower (MOM) — including Singapore Citizen/PR status, Employment Pass, S Pass, Work Permit, or other valid pass types</li>
                            <li>Hotels must be registered entities with a valid Unique Entity Number (UEN)</li>
                        </ul>
                    </Section>

                    <Section title="4. Account Responsibilities">
                        <h4 style={{ color: 'var(--accent)', marginTop: '1rem' }}>4.1 All Users</h4>
                        <ul>
                            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                            <li>You must provide accurate, current, and complete information during registration</li>
                            <li>You must not create multiple accounts or share your account with others</li>
                            <li>You must promptly update your information if it changes (especially work pass status)</li>
                        </ul>
                        <h4 style={{ color: 'var(--accent)', marginTop: '1rem' }}>4.2 Workers</h4>
                        <ul>
                            <li>You must complete the onboarding training (100% completion) before applying for shifts</li>
                            <li>You must maintain an active and valid work pass at all times</li>
                            <li>You must arrive on time and fulfill your shift obligations</li>
                        </ul>
                        <h4 style={{ color: 'var(--accent)', marginTop: '1rem' }}>4.3 Hotels</h4>
                        <ul>
                            <li>You must provide accurate shift details including dates, times, location, and pay rates</li>
                            <li>You are responsible for providing a safe working environment</li>
                            <li>You must comply with all Singapore employment laws, including MOM regulations for foreign workers</li>
                        </ul>
                    </Section>

                    <Section title="5. Shift Booking and Cancellation Policy">
                        <h4 style={{ color: 'var(--accent)', marginTop: '1rem' }}>5.1 Applications</h4>
                        <ul>
                            <li>Workers apply for shifts posted by Hotels. Applications are in &ldquo;PENDING&rdquo; status until accepted or declined by the Hotel.</li>
                            <li>Hotels may accept or decline applications at their discretion</li>
                            <li>Once accepted, the shift is confirmed and binding on both parties</li>
                        </ul>
                        <h4 style={{ color: 'var(--accent)', marginTop: '1rem' }}>5.2 The 12-Hour Rule</h4>
                        <p>
                            Hotels <strong>cannot decline an accepted application</strong> within 12 hours of the shift start time.
                            This protects Workers who have already committed and made arrangements.
                        </p>
                        <h4 style={{ color: 'var(--accent)', marginTop: '1rem' }}>5.3 Cancellation and Strikes</h4>
                        <ul>
                            <li>Workers may cancel pending (unaccepted) applications at any time without penalty</li>
                            <li>Cancelling a <strong>confirmed shift</strong> within 24 hours of its start time incurs a <strong>Late Cancellation Strike</strong></li>
                            <li>Accumulating <strong>2 strikes</strong> triggers a formal warning</li>
                            <li>Accumulating <strong>5 strikes</strong> may result in account suspension or permanent ban</li>
                        </ul>
                    </Section>

                    <Section title="6. Tier System">
                        <p>Both Workers and Hotels participate in the Shyft Tier System:</p>
                        <div style={{
                            background: '#111', border: '1px solid #333', borderRadius: 'var(--radius-md)',
                            padding: '1.5rem', marginTop: '1rem'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '1.5rem' }}>🥈</div>
                                    <div style={{ fontWeight: 700, color: '#C0C0C0' }}>Silver</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>0–50 hours</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.5rem' }}>🥇</div>
                                    <div style={{ fontWeight: 700, color: 'var(--accent)' }}>Gold</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>51–200 hours</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.5rem' }}>💎</div>
                                    <div style={{ fontWeight: 700, color: '#E5E4E2' }}>Platinum</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>200+ hours</div>
                                </div>
                            </div>
                        </div>
                        <p style={{ marginTop: '1rem' }}>
                            Higher tiers grant access to premium shifts, priority matching, and enhanced visibility. Tier status
                            is determined by total hours worked (Workers) or total hours of staff hired (Hotels).
                        </p>
                    </Section>

                    <Section title="7. Payment">
                        <ul>
                            <li>Hourly pay rates are set by the Hotel at the time of posting and are visible to Workers before applying</li>
                            <li>Shyft Sg tracks shift hours and estimated pay but <strong>does not process payments directly</strong></li>
                            <li>Payment is the sole responsibility of the Hotel, in accordance with Singapore employment law</li>
                            <li>Workers must have completed document verification (by an Admin) before receiving their first payout</li>
                            <li>Disputes regarding payment should first be raised through the Platform&apos;s messaging system</li>
                        </ul>
                    </Section>

                    <Section title="8. Minor Worker Protections">
                        <p>
                            In accordance with Singapore law, Workers between 13 and 16 years of age are subject to the following restrictions:
                        </p>
                        <ul>
                            <li><strong>No night shifts:</strong> Cannot work between 11:00 PM and 6:00 AM</li>
                            <li><strong>Maximum shift duration:</strong> 6 hours per day</li>
                            <li><strong>Mandatory rest:</strong> Must have at least 14 consecutive hours of rest in any 24-hour period</li>
                        </ul>
                        <p>
                            These restrictions are enforced programmatically by the Platform. Hotels that attempt to circumvent
                            these protections will have their accounts suspended.
                        </p>
                    </Section>

                    <Section title="9. User Conduct">
                        <p>You agree not to:</p>
                        <ul>
                            <li>Provide false, misleading, or fraudulent information</li>
                            <li>Harass, intimidate, or discriminate against other users</li>
                            <li>Circumvent the Platform to arrange shifts directly (bypassing the system)</li>
                            <li>Use automated tools (bots, scrapers) to interact with the Platform</li>
                            <li>Attempt to gain unauthorized access to other users&apos; accounts or Platform systems</li>
                            <li>Post shifts with intentionally misleading pay rates or conditions</li>
                        </ul>
                        <p>Violation of these rules may result in immediate account suspension or termination.</p>
                    </Section>

                    <Section title="10. Account Suspension and Removal">
                        <p>
                            Shyft Sg reserves the right to suspend or remove any account that violates these Terms, engages
                            in fraudulent activity, or poses a risk to the safety of other users. Removed users will be
                            notified of the reason for removal and may appeal by contacting support.
                        </p>
                    </Section>

                    <Section title="11. Limitation of Liability">
                        <p>
                            To the maximum extent permitted by Singapore law, Shyft Sg shall not be liable for any indirect,
                            incidental, special, consequential, or punitive damages arising from:
                        </p>
                        <ul>
                            <li>The conduct of any Worker or Hotel on or off the Platform</li>
                            <li>Any workplace injury or incident during a shift</li>
                            <li>Non-payment or late payment by a Hotel</li>
                            <li>Loss of data or unauthorized access to your account</li>
                            <li>Service interruptions or system downtime</li>
                        </ul>
                    </Section>

                    <Section title="12. Intellectual Property">
                        <p>
                            All content, branding, logos, and software on the Platform are the property of Shyft Sg Pte Ltd
                            and are protected by Singapore and international intellectual property laws. You may not reproduce,
                            distribute, or create derivative works without our express written consent.
                        </p>
                    </Section>

                    <Section title="13. Governing Law">
                        <p>
                            These Terms are governed by and construed in accordance with the laws of the Republic of Singapore.
                            Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts
                            of Singapore.
                        </p>
                    </Section>

                    <Section title="14. Changes to These Terms">
                        <p>
                            We reserve the right to modify these Terms at any time. Material changes will be communicated
                            via email or a prominent notice on the Platform at least 14 days before they take effect.
                            Continued use of the Platform after changes constitute acceptance of the revised Terms.
                        </p>
                    </Section>

                    <Section title="15. Contact">
                        <p>For questions about these Terms of Service, contact:</p>
                        <div style={{
                            background: '#111', border: '1px solid #333', borderRadius: 'var(--radius-md)',
                            padding: '1.5rem', marginTop: '1rem'
                        }}>
                            <p style={{ margin: '0.25rem 0' }}><strong>Shyft Sg Pte Ltd</strong></p>
                            <p style={{ margin: '0.25rem 0', color: '#888' }}>Legal Department</p>
                            <p style={{ margin: '0.25rem 0', color: 'var(--accent)' }}>legal@shyft.sg</p>
                        </div>
                    </Section>
                </div>
            </main>
        </>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
                {title}
            </h2>
            {children}
        </section>
    );
}
