import { requireRole } from "@/lib/auth-utils";
import { getMyEvaluations, getEvaluationQuestions } from "@/app/actions/jury";
import EvaluateClient from "./EvaluateClient";

export default async function EvaluatePage() {
    await requireRole(["jury_member"]);

    const { assignedTeams, submissions } = await getMyEvaluations();
    const questions = await getEvaluationQuestions();

    return (
        <EvaluateClient
            assignedTeams={assignedTeams}
            submissions={submissions}
            questions={questions}
        />
    );
}
