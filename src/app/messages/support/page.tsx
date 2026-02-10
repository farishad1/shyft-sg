import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { startSupportConversation } from '../actions';

export default async function SupportPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    try {
        // Get or create support conversation with admin
        const result = await startSupportConversation();

        if (result.success && 'conversationId' in result) {
            redirect(`/messages/${result.conversationId}`);
        }

        const errorMessage = 'error' in result ? result.error : 'Unable to connect to support at this time. Please try again later.';

        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '1rem' }}>Contact Support</h1>
                <p style={{ color: '#888' }}>{errorMessage}</p>
                <p style={{ color: '#666', marginTop: '1rem', fontSize: '0.875rem' }}>
                    You can also email us directly at{' '}
                    <a href="mailto:abeerfaris@shyft.sg" style={{ color: 'var(--accent)' }}>abeerfaris@shyft.sg</a>
                </p>
            </div>
        );
    } catch {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '1rem' }}>Contact Support</h1>
                <p style={{ color: '#888' }}>Unable to connect to support at this time. Please try again later.</p>
                <p style={{ color: '#666', marginTop: '1rem', fontSize: '0.875rem' }}>
                    You can also email us directly at{' '}
                    <a href="mailto:abeerfaris@shyft.sg" style={{ color: 'var(--accent)' }}>abeerfaris@shyft.sg</a>
                </p>
            </div>
        );
    }
}
