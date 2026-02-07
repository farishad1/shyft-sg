import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { startSupportConversation } from '../actions';

export default async function SupportPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

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
        </div>
    );
}
