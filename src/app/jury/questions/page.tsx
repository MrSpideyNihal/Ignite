import { requireRole } from "@/lib/auth-utils";
import { getEvaluationQuestions } from "@/app/actions/jury";
import QuestionsClient from "./QuestionsClient";

export default async function QuestionsPage() {
    await requireRole(["super_admin", "jury_admin"]);
    const questions = await getEvaluationQuestions();

    return <QuestionsClient initialQuestions={questions} />;
}
