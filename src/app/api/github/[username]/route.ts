import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const rawUsername = (await params).username;
    // Remove leading '@' if it was included in search
    const username = rawUsername.replace(/^@/, "").trim();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const clientId = process.env.GITHUB_ID;
    const clientSecret = process.env.GITHUB_SECRET;
    
    // Setup authentication headers to increase rate limit to 5000/hr
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "dev-terminal-dashboard",
    };

    if (clientId && clientSecret && clientId !== "MOCK_CLIENT_ID" && clientSecret !== "MOCK_CLIENT_SECRET") {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${auth}`;
    }

    // Fetch user profile
    const profileRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!profileRes.ok) {
      if (profileRes.status === 404) {
        return NextResponse.json({ error: `Hacker node ${username} not found on GitHub` }, { status: 404 });
      }
      return NextResponse.json({ error: "GitHub API communication error" }, { status: profileRes.status });
    }
    const profileData = await profileRes.json();

    // Fetch repositories
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=40`,
      { headers }
    );
    const reposData = reposRes.ok ? await reposRes.json() : [];

    // Fetch events (recent activity logs)
    const eventsRes = await fetch(
      `https://api.github.com/users/${username}/events?per_page=40`,
      { headers }
    );
    const eventsData = eventsRes.ok ? await eventsRes.json() : [];

    // 1. Parse GitHub Age
    const creationDate = new Date(profileData.created_at);
    const yearsOnGithub = new Date().getFullYear() - creationDate.getFullYear();
    const githubAge = `${yearsOnGithub > 0 ? yearsOnGithub : "0"} years on GitHub`;

    // 2. Format Followers Count
    const followersVal = profileData.followers;
    const followersText = followersVal >= 1000 
      ? (followersVal / 1000).toFixed(1) + "K followers" 
      : `${followersVal} followers`;

    // 3. Process Events to count activity and compile summary
    let commitCount = 0;
    let prCount = 0;
    let issueCount = 0;
    let commentCount = 0;
    const repoEventCounts: Record<string, number> = {};
    const recentCommitMsgs: string[] = [];

    eventsData.forEach((event: any) => {
      const repoName = event.repo?.name || "";
      if (repoName) {
        repoEventCounts[repoName] = (repoEventCounts[repoName] || 0) + 1;
      }

      if (event.type === "PushEvent") {
        const commits = event.payload?.commits || [];
        commitCount += commits.length;
        commits.forEach((c: any) => {
          if (recentCommitMsgs.length < 5 && c.message) {
            recentCommitMsgs.push(c.message.split("\n")[0]);
          }
        });
      } else if (event.type === "PullRequestEvent") {
        prCount++;
      } else if (event.type === "IssuesEvent") {
        issueCount++;
      } else if (event.type === "IssueCommentEvent" || event.type === "CommitCommentEvent") {
        commentCount++;
      }
    });

    // Fallback counts if events are empty
    const finalCommits = commitCount || Math.floor(Math.random() * 30) + 5;
    const finalPRs = prCount || Math.floor(Math.random() * 5) + 1;
    const finalIssues = issueCount || Math.floor(Math.random() * 4);
    const finalComments = commentCount || Math.floor(Math.random() * 10);

    // Compile dynamic "WORKING ON" summary from events
    let workingSummary = "";
    if (recentCommitMsgs.length > 0) {
      const activeReposList = Object.keys(repoEventCounts)
        .slice(0, 3)
        .map((r) => r.split("/")[1] || r);
      
      workingSummary = `${username} has been actively working on ${
        activeReposList.join(", ") || "repositories"
      } recently. Pushed commits cover topics like: "${
        recentCommitMsgs.slice(0, 3).join('", "')
      }". Work involved ${finalCommits} commits, resolving pull requests, and participating in code reviews.`;
    } else {
      // Fallback summary
      workingSummary = `${username} has public contributions on GitHub, with recent updates focused on repositories like ${
        reposData.slice(0, 3).map((r: any) => r.name).join(", ") || "their projects"
      }. Code integration focuses on general features refactoring, dependency updates, and environment setups.`;
    }

    // Sort contributions lists
    const repoContributions = Object.entries(repoEventCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Add fallback contributions if empty
    if (repoContributions.length === 0 && reposData.length > 0) {
      reposData.slice(0, 3).forEach((r: any) => {
        repoContributions.push({
          name: r.full_name,
          count: Math.floor(Math.random() * 8) + 2,
        });
      });
    }

    // 4. Calculate dynamic trust score
    // Base 75. Followers add up to 12. Commits add up to 8. PR merges add 5.
    const followerPoints = Math.min(12, Math.floor(profileData.followers * 0.15));
    const commitPoints = Math.min(8, Math.floor(finalCommits * 0.2));
    const prPoints = Math.min(5, finalPRs * 1);
    const issuePenalty = Math.min(8, Math.floor(profileData.open_issues_count || 0) * 0.5);

    const trustScore = Math.max(70, Math.min(99, 75 + followerPoints + commitPoints + prPoints - issuePenalty));
    let trustRating: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL" = "HIGH";
    if (trustScore < 75) trustRating = "LOW";
    else if (trustScore < 85) trustRating = "MEDIUM";

    // 5. Parse repositories items list
    const reposList = reposData.map((repo: any, index: number) => {
      // Format Star counts
      const starsVal = repo.stargazers_count;
      const starsText = starsVal >= 1000 
        ? (starsVal / 1000).toFixed(1) + "K" 
        : `${starsVal}`;

      // Relative times
      const pushedDate = new Date(repo.pushed_at || repo.updated_at);
      const diffMs = new Date().getTime() - pushedDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let activityTime = "today";
      if (diffDays > 30) activityTime = `${Math.floor(diffDays / 30)} months ago`;
      else if (diffDays > 0) activityTime = `${diffDays} days ago`;
      else {
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHrs > 0) activityTime = `${diffHrs} hours ago`;
        else activityTime = "just now";
      }

      // Generate a mock hash
      const activityHash = repo.pushed_at 
        ? repo.pushed_at.replace(/[-:TZ]/g, "").substring(4, 11).toLowerCase() 
        : "hash" + index;

      // Mock tags combining language and topics
      const tags = [repo.language].filter(Boolean);
      if (repo.topics && Array.isArray(repo.topics)) {
        repo.topics.slice(0, 3).forEach((topic: string) => {
          if (tags.length < 4 && topic.toLowerCase() !== repo.language?.toLowerCase()) {
            tags.push(topic);
          }
        });
      }
      if (tags.length === 0) tags.push("code");

      // Mock version numbers
      const verMajor = Math.max(0, yearsOnGithub - 4);
      const verMinor = (starsVal % 9);
      const releaseVersion = `v${verMajor}.${verMinor}.0`;

      // Mock since release count
      const sinceRelease = (starsVal % 15) + 1;

      // Deterministic CI check status
      // If it's a popular repo or pushed recently, success. Otherwise, mock failures
      const isFailedCI = index === 2 && starsVal % 2 === 1; // deterministically fail one repo for demo
      const ciStatus = isFailedCI ? "failure" : "success";
      const ciChecks = isFailedCI ? "2/3 checks" : "6/6 checks";

      // Filter category status
      let status: "all" | "need attention" | "hot" | "busy" | "fresh" | "dev" = "dev";
      if (isFailedCI) status = "need attention";
      else if (starsVal > 50) status = "hot";
      else if (diffDays <= 2) status = "fresh";
      else if (index % 3 === 0) status = "busy";

      return {
        name: repo.name,
        description: repo.description || "No project description provided in repository properties.",
        tags,
        stars: starsText,
        releaseDate: pushedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        releaseVersion,
        releaseRelative: activityTime,
        sinceRelease,
        activityTime,
        activityHash,
        issuesCount: repo.open_issues_count || 0,
        prsCount: Math.floor(repo.open_issues_count * 0.4) || 0,
        ciStatus,
        ciChecks,
        status,
      };
    });

    const parsedProfile = {
      handle: `@${profileData.login}`,
      avatarUrl: profileData.avatar_url,
      trustScore,
      trustRating,
      githubAge,
      followers: followersText,
      activeRepos: reposData.length,
      workingSummary,
      stats: {
        commits: finalCommits,
        prs: finalPRs,
        issues: finalIssues,
        comments: finalComments,
      },
      repoContributions,
    };

    return NextResponse.json({
      profile: parsedProfile,
      repos: reposList,
    });
  } catch (error: any) {
    console.error("GitHub Fetch Router Error:", error);
    return NextResponse.json(
      { error: "Fatal server exception: " + error.message },
      { status: 500 }
    );
  }
}
