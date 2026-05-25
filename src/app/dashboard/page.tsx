import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

export default async function BaseDashboardRedirectPage() {
  // 1. Check if user has an active session
  const session = await getServerSession(authOptions);

  if (session && session.user?.name) {
    const cleanHandle = session.user.name.replace(/^@/, "");
    redirect(`/dashboard/${cleanHandle}`);
  }

  // 2. Resolve default showcase settings from config file
  let defaultUser = "steipete";
  let allowPublicShowcase = false;

  try {
    const configPath = path.join(process.cwd(), "src/lib/showcase-config.json");
    const content = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(content);
    defaultUser = config.defaultUser || "steipete";
    allowPublicShowcase = !!config.allowPublicShowcase;
  } catch (error) {
    // If config file is missing/unreadable, fall back to defaults
  }

  // 3. Redirect guests to showcase user
  if (allowPublicShowcase && defaultUser) {
    redirect(`/dashboard/${defaultUser}`);
  } else {
    redirect("/dashboard/steipete");
  }
}
