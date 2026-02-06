import { redirect } from "next/navigation";

// Redirect /register to /events
export default function RegisterPage() {
    redirect("/events");
}
