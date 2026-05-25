import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs/promises";
import path from "path";

const getConfigPath = () => path.join(process.cwd(), "src/lib/showcase-config.json");

export async function GET() {
  try {
    const configPath = getConfigPath();
    const content = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(content);
    return NextResponse.json(config);
  } catch {
    // If the file doesn't exist yet, return defaults
    return NextResponse.json({
      defaultUser: "steipete",
      allowPublicShowcase: false
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.name) {
      return NextResponse.json({ error: "Unauthorized access: login required." }, { status: 401 });
    }

    // 1b. Restrict access specifically to rohit-simbanic
    const loggedInUser = session.user.name.replace(/^@/, "").toLowerCase();
    if (loggedInUser !== "rohit-simbanic") {
      return NextResponse.json({ error: "Access Denied: Only rohit-simbanic can configure the showcase settings." }, { status: 403 });
    }

    // 2. Parse request parameters
    const body = await request.json();
    const { defaultUser, allowPublicShowcase } = body;

    if (defaultUser === undefined || allowPublicShowcase === undefined) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const cleanUser = defaultUser.replace(/^@/, "").trim();

    // 3. Save configuration
    const configPath = getConfigPath();
    const newConfig = {
      defaultUser: cleanUser,
      allowPublicShowcase: !!allowPublicShowcase
    };

    await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), "utf-8");

    return NextResponse.json({ success: true, config: newConfig });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Showcase API Config Error:", err);
    return NextResponse.json({ error: "Fatal exception: " + err.message }, { status: 500 });
  }
}
