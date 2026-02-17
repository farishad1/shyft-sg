'use client';

import { useState } from 'react';
import { Bell, Sliders, Save } from 'lucide-react';

export function SettingsForm() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [defaultPosition, setDefaultPosition] = useState('');
    const [defaultPay, setDefaultPay] = useState('');
    const [defaultHours, setDefaultHours] = useState('8');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // Store preferences in localStorage (client-side for now)
        if (typeof window !== 'undefined') {
            localStorage.setItem('hotelSettings', JSON.stringify({
                emailNotifications,
                smsNotifications,
                defaultPosition,
                defaultPay,
                defaultHours,
            }));
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    // Load from localStorage on mount
    useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('hotelSettings');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setEmailNotifications(parsed.emailNotifications ?? true);
                    setSmsNotifications(parsed.smsNotifications ?? false);
                    setDefaultPosition(parsed.defaultPosition ?? '');
                    setDefaultPay(parsed.defaultPay ?? '');
                    setDefaultHours(parsed.defaultHours ?? '8');
                } catch { /* ignore */ }
            }
        }
    });

    return (
        <>
            {/* Notification Preferences */}
            <div style={{
                background: '#111', border: '1px solid #333', borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <Bell size={20} style={{ color: 'var(--accent)' }} />
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Notifications</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <ToggleRow
                        label="Email Notifications"
                        description="Receive updates about applications and shift changes"
                        checked={emailNotifications}
                        onChange={setEmailNotifications}
                    />
                    <ToggleRow
                        label="SMS Notifications"
                        description="Get text alerts for urgent shift updates"
                        checked={smsNotifications}
                        onChange={setSmsNotifications}
                    />
                </div>
            </div>

            {/* Default Shift Requirements */}
            <div style={{
                background: '#111', border: '1px solid #333', borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <Sliders size={20} style={{ color: 'var(--accent)' }} />
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Default Shift Presets</h2>
                </div>
                <p style={{ color: '#888', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                    Pre-fill these values when creating new shift postings.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Position
                        </label>
                        <input
                            type="text"
                            value={defaultPosition}
                            onChange={(e) => setDefaultPosition(e.target.value)}
                            placeholder="e.g., Front Desk"
                            style={{
                                width: '100%', padding: '0.625rem', background: '#0a0a0a', border: '1px solid #333',
                                borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.875rem',
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Hourly Pay ($)
                        </label>
                        <input
                            type="number"
                            value={defaultPay}
                            onChange={(e) => setDefaultPay(e.target.value)}
                            placeholder="e.g., 16"
                            style={{
                                width: '100%', padding: '0.625rem', background: '#0a0a0a', border: '1px solid #333',
                                borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.875rem',
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Shift Duration (hrs)
                        </label>
                        <input
                            type="number"
                            value={defaultHours}
                            onChange={(e) => setDefaultHours(e.target.value)}
                            placeholder="e.g., 8"
                            style={{
                                width: '100%', padding: '0.625rem', background: '#0a0a0a', border: '1px solid #333',
                                borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.875rem',
                            }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    style={{
                        marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none',
                        background: saved ? '#22c55e' : 'var(--accent)', color: '#000',
                        fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
                        transition: 'background 0.2s',
                    }}
                >
                    {saved ? <><Save size={16} /> Saved!</> : <><Save size={16} /> Save Preferences</>}
                </button>
            </div>
        </>
    );
}

function ToggleRow({
    label, description, checked, onChange,
}: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 1rem', background: '#0a0a0a', borderRadius: 'var(--radius-sm)',
            border: '1px solid #222',
        }}>
            <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{label}</div>
                <div style={{ color: '#888', fontSize: '0.8125rem' }}>{description}</div>
            </div>
            <button
                onClick={() => onChange(!checked)}
                style={{
                    width: '3rem', height: '1.5rem', borderRadius: '999px', border: 'none',
                    background: checked ? 'var(--accent)' : '#333', cursor: 'pointer',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}
            >
                <div style={{
                    width: '1.125rem', height: '1.125rem', borderRadius: '50%',
                    background: '#fff', position: 'absolute', top: '0.1875rem',
                    left: checked ? '1.6875rem' : '0.1875rem',
                    transition: 'left 0.2s',
                }} />
            </button>
        </div>
    );
}
