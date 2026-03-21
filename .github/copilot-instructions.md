# Project Guidelines

## Code Style
- Keep changes minimal and consistent with the existing codebase; preserve current public APIs and component structure unless the task requires a refactor.
- Follow the current TypeScript and React style: function components, single quotes in most app code, semicolon-light formatting, and inline styles where animation-heavy components already use them.
- This repo relies heavily on client components, refs, timers, canvas work, and DOM event listeners. Preserve existing cleanup behavior for intervals, animation frames, and listeners when editing interactive components.
- Reuse existing helpers and patterns before introducing new abstractions. In particular, follow the language toggle and scramble-text patterns shown in src/contexts/LanguageContext.tsx and related components.

## Architecture
- This is a Next.js App Router portfolio site. The main composition lives in src/app/page.tsx and is intentionally client-rendered.
- Major UI sections are implemented as standalone components under src/components, including Hero, ProjectsSection, StatsSection, AISection, GWASection, and ContactSection.
- Shared UI primitives live under src/components/ui.
- Language switching is handled by src/contexts/LanguageContext.tsx. Prefer using the existing provider and t(de, en) helper rather than adding a new i18n layer.
- Database access uses a Prisma singleton in src/lib/db.ts. Do not create additional PrismaClient instances.
- The current contact flow uses the Resend-backed route in src/app/api/contact/route.ts. Treat src/app/api/route.ts as legacy unless the task explicitly targets the older Gmail/Nodemailer path.

## Build And Validation
- Package management in this repo is mixed, but Windows development currently works best with npm because Bun is not guaranteed to be installed.
- On Windows PowerShell, prefer npm.cmd and npx.cmd to avoid execution-policy prompts from npm.ps1.
- Reliable Windows dev startup: npm.cmd install, then npx.cmd next dev -p <port>.
- The package.json dev/build/start scripts are not fully Windows-safe as written because they use tee, cp, Bun, and inline NODE_ENV assignment. If a task involves scripts, make them cross-platform rather than documenting shell-specific workarounds.
- Lint with npm.cmd run lint when needed.
- Prisma commands are available via npm scripts: db:push, db:migrate, db:reset.
- There is no test suite configured in package.json. Do not claim tests were run unless you actually ran a relevant validation command.

## Conventions
- Prefer preserving the existing visual language and motion design. This portfolio uses custom typography, aggressive animation, custom cursors, canvas effects, and section-specific interactions rather than generic app layouts.
- Many components are intentionally implemented as 'use client' with local state instead of introducing extra state libraries. Avoid adding Zustand or broader state abstractions unless there is a clear need.
- Contact and language UX are custom-built rather than form-library-driven. Match the existing approach unless the task specifically asks for a rewrite.
- The ESLint configuration is permissive. Do not assume lint coverage will catch unsafe changes; validate behavior directly when possible.

## Environment Notes
- Local environment variables may include RESEND_API_KEY in .env.local for the active contact route.
- The legacy mail route also depends on MAIL_USER and MAIL_PASS.
- Keep secrets out of committed files and avoid echoing secret values in responses.

### Skill file naming conventions

Skills live under `.github/skills/<skill-name>/SKILL.md`. They follow a different pattern from agents and prompts:

| Aspect | Convention | Example |
| --- | --- | --- |
| Directory name | lowercase `kebab-case` | `vector-canoe/`, `skill-creator/` |
| Entry file | Always `SKILL.md` (uppercase) | `.github/skills/pptx/SKILL.md` |

**Skill frontmatter** must contain at least:

```yaml
---
name: skill-name          # Must match the directory name
description: '<description of when to activate the skill>'
---
```

### Skill naming issues to flag

- Directory name uses underscores, spaces, or PascalCase instead of `kebab-case`
- Entry file is not named `SKILL.md` (e.g., `skill.md`, `README.md`)
- Frontmatter `name:` does not match the directory name

---
