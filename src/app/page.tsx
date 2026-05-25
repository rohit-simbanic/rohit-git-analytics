import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root access straight to the dashboard node.
  // NextAuth middleware/hooks will manage login gate checks.
  redirect("/dashboard");
}
