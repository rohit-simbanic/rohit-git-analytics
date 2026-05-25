# Cyberpunk Developer Analytics Dashboard

A modern, retro-futuristic developer analytics dashboard inspired by GitHub activity trackers, release monitors (like `release.bar`), and hacker-style SaaS platforms. 

Built using **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Zustand**, and **Recharts**.

---

## ⚡ Core Features

* **📡 Live GitHub API Integration**: Queries public profiles, repository configurations, topics, languages, and user activity events in real-time.
* **🔒 Dual Authentication Gate**: Supports logging in securely via **GitHub OAuth** or bypassing the lock gate using **Stub Credentials** (Hacker ID: `steipete`, Key: `hacker-core`).
* **🌧 Canvas Matrix Rain Backdrop**: An interactive digital rain background rendered on HTML5 canvas on the login gate terminal, complete with progress bar decoding metrics.
* **🌐 Dynamic Sharing Routes (`/dashboard/[username]`)**: Share your custom dashboard analytics page with anyone. Guests will see your public profile stats directly.
* **🎛 Public Showcase Configurator**: If logged in, a toggle switch (`set as showcase`) becomes visible. Activating it saves your handle in a server-side JSON file, making your profile the default landing dashboard for unauthenticated visitors.
* **🛡 Trust Score Radar**: Custom SVG gauge calculating a developer "Trust Score" dynamically based on follower density, commit frequency, and open issue ratios.
* **📊 Data-Heavy Visual Charts**:
  * **Contribution Matrix**: Grid calendar tracking git commits.
  * **Commit Flux Calculus**: Recharts Area Chart displaying push volumes.
  * **Compiler Distribution**: Recharts Pie Chart calculating language percentages.
* **⌨ bottom CLI Terminal**: An interactive collapsible terminal shell. Input commands like `help`, `sysinfo`, `stats`, `about`, `clear`, or **`hack`** (simulates an override that passes all failing CI checks, adds commits, and boosts your Trust Score to 99 in real-time).

---

## ⚙ Setup Guide

### 1. Register GitHub OAuth Application
To log in with your GitHub account, you need to register an OAuth application on GitHub:
1. Go to your **[GitHub Settings -> Developer Settings -> OAuth Apps](https://github.com/settings/developers)**.
2. Click **New OAuth App**.
3. Fill in the fields:
   * **Application Name:** `Developer Terminal Dashboard`
   * **Homepage URL:** `http://localhost:3000`
   * **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Click **Register Application**.
5. Copy the **Client ID** (`GITHUB_ID`).
6. Click **Generate a new client secret** and copy it (`GITHUB_SECRET`).

### 2. Environment Configurations
Create a `.env` file in the root directory and copy the contents from `.env.example`:
```env
# NextAuth settings
NEXTAUTH_SECRET=f7e3c1b9a87d6e5d4c3b2a1a2b3c4d5e
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth credentials
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

### 3. Install & Start Server
Run the following commands in your terminal to download dependencies and boot the development server:
```bash
# Install dependencies
npm install

# Build verification check
npm run build

# Start local server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## 🕹 Usage Guide

1. **Gate Decryption**: Click **Sign In with GitHub** to log in with OAuth, or click **Inject Demo Session** to bypass using the credentials gate.
2. **Search public profiles**: In the repository list search input, type `@username` (e.g. `@torvalds`) and press `Enter` to resolve any public GitHub user's analytics instantly.
3. **Trigger Showcase**: If you are logged in and viewing your own profile, toggle **`[set as showcase]`** at the bottom of the statistics card. Toggling it `active` redirects any guest visitor accessing `/` or `/dashboard` directly to your profile.
4. **Interactive CLI**: Click the bottom shell bar to expand the CLI. Type `help` to list commands, or type `hack` to run the payload override.

---

## 🛡️ Security, Performance & Stability Architecture

The application has been heavily optimized for maximum speed, security, and stability:

### 🔒 Advanced Security Implementations
* **Path & SSRF Protection**: Custom regex sanitizers enforce strict rules on dynamic GitHub handles (`/^[a-zA-Z0-9_-]+$/`), blocking path traversal (`../`), directory hijacking, or Server-Side Request Forgery (SSRF) attempts.
* **Server-Side Authorization Lock**: The showcase config API (`/api/showcase-config`) enforces strict authentication and locks configuration modifications (`POST` requests) specifically to the owner profile (`rohit-simbanic`). Guest requests receive a `403 Forbidden` response.
* **Smart Route Interception & Redirects**: Dynamic dashboard pages (`/dashboard/[username]`) intercept unauthenticated session requests, locking guest browsing to allowed public showcase profiles and redirecting unauthorized routes to `/login`.

### 🚀 Performance & Core Web Vitals Optimization
* **TBT (Total Blocking Time) Reduction**: Wrap core compute-heavy logic (such as dynamic developer language distribution percentages and contribution matrix grid generation) in React `useMemo` hooks.
* **Deterministic Render Purity**: Replaced unstable runtime generation (impure `Math.random()`) in the contribution grid with a pure pseudo-random sine wave generator. This maintains high performance and completely eliminates Cumulative Layout Shift (CLS) and layout recalculations on re-renders.
* **LCP (Largest Contentful Paint) Acceleration**: Handled developer avatar image rendering with Next.js image priority flags, ensuring critical elements load instantly above the fold.

### 🧹 Memory Leak Prevention & Lint Enforcement
* **CI/CD Check Cleanup**: Integrated `useRef` and unmount effect hooks (`clearTimeout`) for simulated CI checks, preventing potential state updates on unmounted React elements.
* **Zero-Warnings Build**: Enforces 100% type-safety and standard-compliant JSX comment syntax. Complies with strict JSX structures, eliminating all TypeScript and ESLint warnings.

