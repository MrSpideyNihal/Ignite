import { requireRole } from "@/lib/auth-utils";
import { getEvaluationQuestions, getJuryMembers, getAllSubmissions } from "@/app/actions/jury";
import { StatCard, Card, CardHeader, CardContent, Badge } from "@/components/ui";
import Link from "next/link";

export default async function JuryAdminDashboard() {
    await requireRole(["super_admin", "jury_admin"]);

    const questions = await getEvaluationQuestions();
    const juryMembers = await getJuryMembers();
    const submissions = await getAllSubmissions();

    const lockedSubmissions = submissions.filter((s) => s.isLocked).length;
    const pendingSubmissions = submissions.filter((s) => !s.isLocked).length;

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Jury Admin Dashboard</h1>
                    <p className="page-subtitle">Manage evaluation questions, jury assignments, and submissions</p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <Link href="/jury/questions" className="btn-primary">
                        Manage Questions
                    </Link>
                    <Link href="/jury/submissions" className="btn-secondary">
                        View Submissions
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        label="Evaluation Questions"
                        value={questions.length}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Jury Members"
                        value={juryMembers.length}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Locked Submissions"
                        value={lockedSubmissions}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Pending"
                        value={pendingSubmissions}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                </div>

                {/* Jury Members */}
                <Card className="mb-8">
                    <CardHeader
                        title="Jury Members"
                        subtitle="Members assigned to evaluate projects"
                        action={
                            <Link href="/admin/users" className="text-sm text-primary-500 hover:text-primary-600">
                                Add Jury Member →
                            </Link>
                        }
                    />
                    <CardContent>
                        {juryMembers.length > 0 ? (
                            <div className="space-y-4">
                                {juryMembers.map((member) => (
                                    <div
                                        key={member._id}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {member.name}
                                            </p>
                                            <p className="text-sm text-gray-500">{member.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="primary">
                                                {member.assignedTeams.length} teams assigned
                                            </Badge>
                                            {member.assignedTeams.length > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {member.assignedTeams.slice(0, 3).join(", ")}
                                                    {member.assignedTeams.length > 3 && "..."}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">
                                No jury members assigned yet. Add jury members from the{" "}
                                <Link href="/admin/users" className="text-primary-500">
                                    admin users
                                </Link>{" "}
                                page.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Submissions */}
                <Card>
                    <CardHeader
                        title="Recent Submissions"
                        action={
                            <Link href="/jury/submissions" className="text-sm text-primary-500 hover:text-primary-600">
                                View All →
                            </Link>
                        }
                    />
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Team</th>
                                    <th>Project</th>
                                    <th>Jury Member</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.slice(0, 5).map((sub) => (
                                    <tr key={sub._id}>
                                        <td className="font-mono font-semibold text-primary-500">
                                            {sub.teamCode}
                                        </td>
                                        <td>{sub.projectName}</td>
                                        <td>{sub.juryMemberName}</td>
                                        <td>
                                            {sub.totalScore}/{sub.maxPossibleScore}
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({Math.round((sub.totalScore / sub.maxPossibleScore) * 100)}%)
                                            </span>
                                        </td>
                                        <td>
                                            <Badge variant={sub.isLocked ? "success" : "warning"}>
                                                {sub.isLocked ? "Locked" : "Draft"}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500">
                                            No submissions yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
