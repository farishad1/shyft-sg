'use client';

import { useState } from 'react';
import { AllStarFilter } from '@/components/AllStarFilter';
import { ApplicantActions } from './ApplicantActions';
import { differenceInYears } from 'date-fns';

interface Applicant {
    id: string;
    status: string;
    worker: {
        firstName: string;
        lastName: string;
        dateOfBirth: Date;
        averageRating: number | null;
        tier: string;
        user: { email: string };
    };
}

interface ApplicantsTableProps {
    applications: Applicant[];
    isPremium: boolean;
    isLocked: boolean;
}

export function ApplicantsTable({ applications, isPremium, isLocked }: ApplicantsTableProps) {
    const [showOnlyAllStar, setShowOnlyAllStar] = useState(false);

    // Filter applications based on All-Star toggle
    const filteredApplications = showOnlyAllStar
        ? applications.filter(app => app.worker.averageRating !== null && app.worker.averageRating >= 4.5)
        : applications;

    const pendingCount = filteredApplications.filter(a => a.status === 'PENDING').length;

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    Applicants ({pendingCount} pending)
                </h2>
                <AllStarFilter
                    isPremium={isPremium}
                    onFilterChange={setShowOnlyAllStar}
                />
            </div>

            {filteredApplications.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                    {showOnlyAllStar ? (
                        <p>No All-Star applicants (4.5+ ★) for this shift yet.</p>
                    ) : (
                        <p>No applications yet. Workers will see this listing in their Find Shifts page.</p>
                    )}
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#111', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Applicant</th>
                            <th style={{ padding: '1rem' }}>Age</th>
                            <th style={{ padding: '1rem' }}>Rating</th>
                            <th style={{ padding: '1rem' }}>Tier</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApplications.map((app) => {
                            const workerAge = differenceInYears(new Date(), new Date(app.worker.dateOfBirth));
                            const rating = app.worker.averageRating ? app.worker.averageRating.toFixed(1) : 'New';
                            const isAllStar = app.worker.averageRating !== null && app.worker.averageRating >= 4.5;

                            return (
                                <tr key={app.id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '2rem',
                                                height: '2rem',
                                                borderRadius: '50%',
                                                background: isAllStar ? 'var(--accent)' : '#333',
                                                color: isAllStar ? '#000' : '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {app.worker.firstName[0]}{app.worker.lastName[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {app.worker.firstName} {app.worker.lastName}
                                                    {isAllStar && (
                                                        <span style={{
                                                            padding: '0.125rem 0.375rem',
                                                            background: 'var(--accent)',
                                                            color: '#000',
                                                            borderRadius: '4px',
                                                            fontSize: '0.625rem',
                                                            fontWeight: 700
                                                        }}>
                                                            ★ ALL-STAR
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#888' }}>{app.worker.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{workerAge}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ color: isAllStar ? 'var(--accent)' : '#888' }}>★ {rating}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge badge-${app.worker.tier.toLowerCase()}`}>{app.worker.tier}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${app.status === 'PENDING' ? 'badge-pending' :
                                            app.status === 'ACCEPTED' ? 'badge-verified' :
                                                'badge-declined'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {app.status === 'PENDING' && (
                                            <ApplicantActions
                                                applicationId={app.id}
                                                isLocked={isLocked}
                                            />
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}
