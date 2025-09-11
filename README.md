This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Frontend Contributor Quickstart

If you're working on the new frontend-only branch, follow these steps and guardrails.

### 1) Prerequisites
- Node.js 18+ and npm 9+
- Git
- Optional: Python 3.10+ if you plan to run local AI/AR services (not required for pure UI work)

### 2) Project Setup
```bash
npm ci
npx prisma generate
```

If you don't have a database locally, you can still work on UI pages and components using mock data. Avoid running migrations unless you coordinate with the backend owner.

### 3) Environment Variables
Copy the example and fill in only the public ones you need for UI:
```bash
cp .env.example .env.local
```

You generally don't need secrets for pure UI development. Do not commit real secrets.

### 4) Start the Dev Server
```bash
npm run dev
```

### 5) Where You Can Safely Work (UI only)
- Pages and layouts:
  - `src/app/**` (except the `api/**` directory)
- Reusable UI components:
  - `src/components/**`
- Styles and global CSS:
  - `src/app/globals.css`
- Translations/i18n text:
  - `src/lib/translations.ts`
  - Add UI-only translation keys; avoid renaming/deleting existing keys without coordination

### 6) What to Avoid (Backend/Logic)
- Do not edit API routes: `src/app/api/**`
- Do not edit auth/db utilities: `src/lib/{auth.ts,db.ts,validations.ts}`
- Do not change Prisma schema or migrations: `prisma/**`
- Do not modify server-only logic in Server Components unless coordinated

### 7) Patterns and Conventions
- Prefer Client Components for interactive UI only; keep data fetching in Server Components when possible
- Keep forms and UI state inside `src/components/**` or page-level client components
- Follow Tailwind for styling; keep classNames readable
- Keep TypeScript strict; avoid `any`
- For mock data, define local constants inside the component or create `src/mocks/**` (do not ship mocks via API)

### 8) Testing Your UI Without Backend
- Use temporary mock arrays or mocked `fetch` calls
- Gate network calls behind try/catch and show loading/empty/error states
- Do not change API contracts; if you need a new field, coordinate with backend

### 9) Submitting Changes
- Keep edits scoped to UI files listed above
- Run `npm run lint` before pushing
- Open PRs against the frontend branch; tag backend owners if any API/type change is needed

### 10) Helpful Commands
```bash
npm run dev       # Start Next.js
npm run lint      # Lint check
```

For fuller backend/AI/AR setup, see `PYTHON_SERVICES_SETUP.md` (optional for UI contributors).