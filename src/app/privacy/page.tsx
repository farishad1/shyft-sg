import Link from 'next/link';
import { Navbar } from '@/components';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy — Shyft Sg',
    description: 'How Shyft Sg collects, uses, and protects your personal data under the Singapore Personal Data Protection Act (PDPA).',
};

export default function PrivacyPolicyPage() {
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
                        <Shield size={24} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Privacy Policy</h1>
                        <p style={{ color: '#888', margin: 0, fontSize: '0.875rem' }}>Last updated: 16 February 2026</p>
                    </div>
                </div>

                <div className="legal-content" style={{ lineHeight: 1.8, color: '#ccc' }}>
                    <Section title="1. Introduction">
                        <p>
                            Shyft Sg Pte Ltd (&ldquo;Shyft Sg&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates a digital
                            staffing marketplace that connects hospitality workers with boutique hotels, capsule hotels, and
                            serviced apartments across Singapore. We are committed to protecting your personal data in
                            accordance with the <strong>Personal Data Protection Act 2012 (PDPA)</strong> of Singapore.
                        </p>
                        <p>
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data when
                            you use our website, mobile applications, and related services (collectively, the &ldquo;Platform&rdquo;).
                        </p>
                    </Section>

                    <Section title="2. Personal Data We Collect">
                        <p>We collect the following categories of personal data:</p>
                        <h4 style={{ color: 'var(--accent)', marginTop: '1rem' }}>2.1 Worker Accounts</h4>
                        <ul>
                            <li><strong>Identity Data:</strong> Full name, date of birth, profile photograph</li>
                            <li><strong>Contact Data:</strong> Email address, phone number</li>
                            <li><strong>Work Authorization:</strong> Work pass type (e.g., Employment Pass, S Pass, Work Permit, Student Pass), work pass number, expiry date, school name (for Student Pass holders)</li>
                            <li><strong>NRIC / FIN:</strong> Collected solely for work authorization verification and Ministry of Manpower (MOM) compliance. Stored encrypted and never displayed in full on the Platform.</li>
                            <li><strong>Employment Data:</strong> Shift history, hours worked, ratings, tier status, training progress</li>
                            <li><strong>Financial Data:</strong> Payment records are tracked on the Platform but processed through third-party payment providers. We do not store full bank account or credit card details.</li>
                        </ul>
                        <h4 style={{ color: 'var(--accent)', marginTop: '1rem' }}>2.2 Hotel Accounts</h4>
                        <ul>
                            <li><strong>Business Identity:</strong> Hotel name, Unique Entity Number (UEN), business address</li>
                            <li><strong>Contact Data:</strong> Email address of the authorized representative</li>
                            <li><strong>Operational Data:</strong> Job postings, shift details, applicant records, ratings</li>
                        </ul>
                        <h4 style={{ color: 'var(--accent)', marginTop: '1rem' }}>2.3 Automatically Collected Data</h4>
                        <ul>
                            <li><strong>Usage Data:</strong> Pages visited, features used, actions taken</li>
                            <li><strong>Device Data:</strong> Browser type, operating system, IP address</li>
                            <li><strong>Cookies:</strong> Session identifiers, authentication tokens, and analytics cookies (see Section 7)</li>
                        </ul>
                    </Section>

                    <Section title="3. How We Use Your Data">
                        <p>We use your personal data for the following purposes:</p>
                        <ul>
                            <li><strong>Account Management:</strong> Creating and maintaining your account, verifying your identity and work authorization</li>
                            <li><strong>Platform Operations:</strong> Matching workers with available shifts, processing applications, managing rosters</li>
                            <li><strong>Communication:</strong> Sending shift confirmations, application updates, and system notifications</li>
                            <li><strong>Compliance:</strong> Fulfilling MOM reporting requirements, enforcing work hour restrictions for minors, maintaining audit trails</li>
                            <li><strong>Safety &amp; Security:</strong> Preventing fraud, monitoring for abuse, enforcing our Terms of Service</li>
                            <li><strong>Platform Improvement:</strong> Analyzing usage patterns to improve our service, troubleshooting errors</li>
                        </ul>
                    </Section>

                    <Section title="4. Data Sharing and Disclosure">
                        <p>We share personal data only in the following circumstances:</p>
                        <ul>
                            <li><strong>Hotels ↔ Workers:</strong> When a worker applies for a shift, the hotel receives the worker&apos;s name, tier, rating, and verification status. Full NRIC/FIN is never shared with hotels.</li>
                            <li><strong>Government Authorities:</strong> When required by law or regulation, including MOM compliance checks</li>
                            <li><strong>Service Providers:</strong> Cloud hosting (Vercel, Neon), email services, and analytics providers who process data on our behalf under strict contractual protections</li>
                            <li><strong>Legal Obligations:</strong> In response to valid legal processes, court orders, or regulatory requests</li>
                        </ul>
                        <p>We do <strong>not</strong> sell your personal data to third parties.</p>
                    </Section>

                    <Section title="5. Data Retention">
                        <ul>
                            <li><strong>Active Accounts:</strong> Data is retained for the duration of your account activity</li>
                            <li><strong>Deleted Accounts:</strong> Personal data is anonymized or deleted within 90 days of account deletion, except where retention is required by law</li>
                            <li><strong>Shift Records:</strong> Employment records are retained for 2 years in compliance with Singapore employment regulations</li>
                            <li><strong>NRIC Data:</strong> Deleted within 30 days after the purpose of collection has been fulfilled, unless legally required to retain</li>
                        </ul>
                    </Section>

                    <Section title="6. Data Security">
                        <p>We implement industry-standard security measures including:</p>
                        <ul>
                            <li>Encryption of all data in transit (TLS 1.3) and sensitive data at rest (AES-256)</li>
                            <li>Password hashing using bcrypt with industry-standard salt rounds</li>
                            <li>Role-based access controls for internal staff</li>
                            <li>Regular security audits and vulnerability assessments</li>
                            <li>Infrastructure hosted on SOC 2 compliant providers</li>
                        </ul>
                    </Section>

                    <Section title="7. Cookies">
                        <p>We use the following types of cookies:</p>
                        <ul>
                            <li><strong>Essential Cookies:</strong> Required for authentication and session management. Cannot be disabled.</li>
                            <li><strong>Analytics Cookies:</strong> Help us understand how the Platform is used. Can be disabled in your browser settings.</li>
                        </ul>
                        <p>We do not use advertising or tracking cookies.</p>
                    </Section>

                    <Section title="8. Your Rights Under the PDPA">
                        <p>You have the right to:</p>
                        <ul>
                            <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                            <li><strong>Withdrawal of Consent:</strong> Withdraw consent for data processing, subject to legal and contractual restrictions</li>
                            <li><strong>Data Portability:</strong> Request your data in a commonly used, machine-readable format</li>
                        </ul>
                        <p>To exercise these rights, contact our Data Protection Officer at <strong>dpo@shyft.sg</strong>.</p>
                    </Section>

                    <Section title="9. International Transfers">
                        <p>
                            Your data is primarily stored on servers in the Asia-Pacific region (AWS ap-southeast-1).
                            In the event data is transferred to jurisdictions outside Singapore, we ensure adequate
                            protections are in place as required by the PDPA.
                        </p>
                    </Section>

                    <Section title="10. Changes to This Policy">
                        <p>
                            We may update this Privacy Policy from time to time. Material changes will be communicated
                            via email or a prominent notice on the Platform at least 14 days before they take effect.
                            Continued use of the Platform after changes constitute acceptance of the revised policy.
                        </p>
                    </Section>

                    <Section title="11. Contact Us">
                        <p>For questions about this Privacy Policy or your personal data, contact:</p>
                        <div style={{
                            background: '#111', border: '1px solid #333', borderRadius: 'var(--radius-md)',
                            padding: '1.5rem', marginTop: '1rem'
                        }}>
                            <p style={{ margin: '0.25rem 0' }}><strong>Shyft Sg Pte Ltd</strong></p>
                            <p style={{ margin: '0.25rem 0', color: '#888' }}>Data Protection Officer</p>
                            <p style={{ margin: '0.25rem 0', color: 'var(--accent)' }}>dpo@shyft.sg</p>
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
