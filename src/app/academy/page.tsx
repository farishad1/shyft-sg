import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Play, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AcademyQuiz } from './AcademyQuiz';

export default async function AcademyPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
    });

    // Must be verified to access Academy
    if (!workerProfile || workerProfile.verificationStatus !== 'VERIFIED') {
        redirect('/dashboard');
    }

    // Already completed
    if (workerProfile.trainingProgress >= 100) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#888', textDecoration: 'none', marginBottom: '2rem' }}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>

                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{
                        width: '4rem',
                        height: '4rem',
                        borderRadius: '50%',
                        background: 'rgba(34,197,94,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <CheckCircle2 size={32} color="#22c55e" />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Training Complete!</h1>
                    <p style={{ color: '#888', marginBottom: '2rem' }}>You've completed the Shyft Academy. You can now find shifts.</p>
                    <Link href="/dashboard/shifts" className="btn btn-primary btn-lg">
                        Find Shifts →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#888', textDecoration: 'none', marginBottom: '2rem' }}>
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent)' }}>
                Shyft Academy
            </h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>
                Complete this mandatory training to unlock your access to shifts.
            </p>

            {/* Module 1: Video */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                    Module 1: Professional Standards for Boutique Hotels
                </h2>

                {/* Video Placeholder */}
                <div style={{
                    aspectRatio: '16/9',
                    background: 'linear-gradient(135deg, #222 0%, #111 100%)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                    border: '1px solid #333'
                }}>
                    <div style={{
                        width: '4rem',
                        height: '4rem',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Play size={32} color="#000" fill="#000" />
                    </div>
                </div>

                <div style={{ lineHeight: 1.8, color: '#ccc' }}>
                    <p><strong>Key Points:</strong></p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li>Always prioritize <strong>Guest Experience</strong> above all else</li>
                        <li>Arrive 15 minutes before your shift starts</li>
                        <li>Maintain professional appearance and hygiene standards</li>
                        <li>Follow all safety and compliance guidelines</li>
                        <li>Report any issues to your supervisor immediately</li>
                    </ul>
                </div>
            </div>

            {/* Quiz */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                    Quick Quiz
                </h2>
                <p style={{ color: '#888', marginBottom: '1.5rem' }}>
                    Answer correctly to complete your training.
                </p>

                <AcademyQuiz />
            </div>
        </div>
    );
}
