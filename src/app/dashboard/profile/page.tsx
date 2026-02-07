import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { WORK_PASS_LABELS } from '@/lib/constants';
import { ProfileForm } from './ProfileForm';
import {
    User,
    ShieldCheck,
    Clock,
    Trophy,
    Briefcase,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { workerProfile: true }
    });

    if (!user) redirect('/auth/login');

    // Handle case where worker profile might be missing (e.g. manual DB edit)
    // In a real app, we might want to create it here or redirect to onboarding
    if (!user.workerProfile) {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
                <p className="text-gray-400">Please contact support or try logging in again.</p>
            </div>
        );
    }

    const { workerProfile } = user;
    const workPassLabel = WORK_PASS_LABELS[workerProfile.workPassType as keyof typeof WORK_PASS_LABELS] || workerProfile.workPassType;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        My Profile
                        {workerProfile.verificationStatus === 'VERIFIED' ? (
                            <span className="badge badge-verified flex items-center gap-1 text-sm py-1 px-3">
                                <ShieldCheck size={14} /> Verified
                            </span>
                        ) : workerProfile.verificationStatus === 'PENDING' ? (
                            <span className="badge badge-pending flex items-center gap-1 text-sm py-1 px-3">
                                <Clock size={14} /> Pending Verification
                            </span>
                        ) : (
                            <span className="badge badge-declined flex items-center gap-1 text-sm py-1 px-3">
                                <AlertCircle size={14} /> Verification Declined
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your personal information and work preferences</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Stats & Work Pass (Read-Only) */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="card p-6 bg-gradient-to-br from-[#1a1a1a] to-[#111]">
                        <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Performance</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${workerProfile.tier === 'PLATINUM' ? 'bg-purple-900/20 text-purple-400' :
                                        workerProfile.tier === 'GOLD' ? 'bg-yellow-900/20 text-yellow-400' :
                                            'bg-gray-800 text-gray-400'
                                    }`}>
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{workerProfile.tier}</div>
                                    <div className="text-xs text-gray-500">Current Tier</div>
                                </div>
                            </div>

                            <div className="h-px bg-[#333]" />

                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-blue-900/20 text-blue-400">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{workerProfile.totalHoursWorked.toFixed(1)}</div>
                                    <div className="text-xs text-gray-500">Total Hours Worked</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Work Pass Section */}
                    <div className="card p-6">
                        <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                            Work Authorization <ShieldCheck size={14} />
                        </h3>

                        <div className="space-y-3">
                            <div className="bg-[#111] border border-[#333] rounded-lg p-3">
                                <div className="text-xs text-gray-500 mb-1">Work Pass Type</div>
                                <div className="font-medium flex items-center gap-2">
                                    <Briefcase size={16} className="text-[var(--accent)]" />
                                    {workPassLabel}
                                </div>
                            </div>

                            <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded-lg">
                                <p className="text-xs text-blue-400 leading-relaxed">
                                    To update your work pass details, please contact support with your new documentation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="md:col-span-2">
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-[#333] pb-4">
                            <User className="text-[var(--accent)]" size={20} />
                            <h2 className="text-lg font-semibold">Personal Details</h2>
                        </div>

                        <ProfileForm
                            firstName={workerProfile.firstName}
                            lastName={workerProfile.lastName}
                            email={user.email}
                            phoneNumber={workerProfile.phoneNumber}
                            bio={workerProfile.bio}
                            isPhoneVerified={workerProfile.isPhoneVerified}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
