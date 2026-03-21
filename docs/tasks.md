# Project Improvement Tasks

This backlog is based on a review of the current implementation. Tasks are ordered roughly by risk and leverage.

## Priority 1

| ID | Area | Task | Why | Key files | Done when |
| --- | --- | --- | --- | --- | --- |
| P1-01 [done] | Security | Harden the contact API with schema validation, rate limiting, and bot protection | The active contact route accepts raw JSON and only checks for missing fields. It should validate input shape, reject oversized payloads, and throttle abuse before sending email. | `src/app/api/contact/route.ts`, `src/components/ContactSection.tsx` | Requests are validated with a schema, abusive traffic is throttled, and spam protection is in place. |
| P1-02 [done] | Security | Remove hardcoded email delivery values and move all mail configuration to env vars | The mail route hardcodes the sender and recipient, which makes deployment fragile and risks misrouting messages. | `src/app/api/contact/route.ts` | `from`, `to`, and related mail settings are read from validated env vars with clear startup errors if missing. |
| P1-03 [done] | Security | Remove or replace the client-side password gate as a security boundary | The password gate is only enforced in the browser and stores unlocked state in session storage, so it is bypassable and should not be treated as real protection. | `src/components/PasswordGate.tsx`, `src/app/page.tsx` | The gate is either removed, downgraded to a visual interstitial, or replaced with server-side auth/middleware. |
| P1-04 [done] | Security | Retire the legacy Gmail mail route and eliminate HTML injection risk | There are two contact implementations. The legacy route also interpolates user input into HTML output and widens the attack surface. | `src/app/api/route.ts`, `src/app/api/contact/route.ts` | Only one supported contact route remains, and user content is escaped or sent as plain text. |
| P1-05 | Reliability | Stop hiding build-time problems | TypeScript build errors are currently ignored and React strict mode is disabled, which allows defects to reach production silently. | `next.config.ts` | `ignoreBuildErrors` is removed or set to `false`, strict mode is re-enabled, and the resulting issues are fixed. |

## Priority 2

| ID | Area | Task | Why | Key files | Done when |
| --- | --- | --- | --- | --- | --- |
| P2-01 | Clean Architecture | Split the landing page shell from heavy interactive sections | The top-level page is fully client-rendered and owns scroll-driven state for the whole experience. This makes the page harder to reason about and increases client JS. | `src/app/page.tsx`, `src/components/*` | Server-safe layout concerns are separated from client-only interactive sections, with clearer ownership boundaries. |
| P2-02 | Clean Architecture | Extract a shared animation utility layer for scramble text and eye behavior | Similar scramble-text and eye-animation logic is duplicated across multiple components. This increases bug risk and makes tuning expensive. | `src/contexts/LanguageContext.tsx`, `src/components/ContactSection.tsx`, `src/components/Hero.tsx`, `src/components/GWASection.tsx`, `src/components/ScrambleText.tsx`, `src/components/ScrambleOnChange.tsx` | Shared hooks or utilities replace duplicated timing and reveal logic without changing the visual behavior. |
| P2-03 | Refactoring | Refactor the contact form into smaller presentational and state units | `ContactSection` contains copy, animation logic, responsive behavior, form state, and API submission in one large client component. | `src/components/ContactSection.tsx` | Form submission, eye animation, and translated text rendering are separated into focused modules. |
| P2-04 | Refactoring | Reduce global lint suppression and restore rules that catch real bugs | The ESLint config disables many high-signal rules, including hook dependency checks and unused variable detection. | `eslint.config.mjs` | High-value rules are re-enabled, existing violations are fixed or intentionally isolated, and lint output becomes actionable. |
| P2-05 | Developer Experience | Make package scripts cross-platform | The current dev, build, and start scripts depend on `tee`, `cp`, Bun, and inline `NODE_ENV`, which break on Windows. | `package.json` | `npm run dev`, `npm run build`, and `npm run start` work on Windows and Unix shells without manual workarounds. |

## Priority 3

| ID | Area | Task | Why | Key files | Done when |
| --- | --- | --- | --- | --- | --- |
| P3-01 | Performance | Audit eager image preloading and move heavy assets to intent-based loading | The hero and AI sections eagerly create image objects up front, which can inflate startup cost and memory usage. | `src/components/Hero.tsx`, `src/components/AISection.tsx`, `public/photos`, `public/ai-images` | Only critical assets load on first paint; secondary assets are deferred or loaded on interaction/visibility. |
| P3-02 | Performance | Introduce code-splitting for the heaviest interactive sections | Large animation-heavy sections should not block the rest of the page from becoming interactive. | `src/app/page.tsx`, `src/components/AISection.tsx`, `src/components/GWASection.tsx`, `src/components/ProjectsSection.tsx` | Non-critical sections are dynamically loaded or progressively hydrated with no visible regression. |
| P3-03 | Performance | Review scroll, resize, and animation loops for unnecessary work | The app attaches many global listeners and animation loops. Some can be batched, throttled, or suspended off-screen. | `src/components/Hero.tsx`, `src/components/AISection.tsx`, `src/components/GWASection.tsx`, `src/components/ProjectsSection.tsx`, `src/components/PasswordGate.tsx` | Global listeners are minimized, expensive loops are paused when hidden, and profiling shows reduced main-thread work. |
| P3-04 | Performance | Revisit image delivery and metadata strategy | Large local image assets and manually managed rendering should be reviewed for sizing, compression, and layout stability. | `src/components/Hero.tsx`, `src/components/ProjectsSection.tsx`, `src/app/layout.tsx`, `public/photos`, `public/images` | Asset dimensions are intentional, layout shifts are reduced, and image loading is measured against Lighthouse/Web Vitals. |
| P3-05 | Observability | Reduce noisy Prisma logging in non-debug paths | Query logging is enabled directly in the Prisma client setup and may leak unnecessary information in shared environments. | `src/lib/db.ts` | Query logs are gated behind an explicit debug flag or environment-specific logging policy. |

## Responsive And Screen Optimization

| ID | Area | Task | Why | Key files | Done when |
| --- | --- | --- | --- | --- | --- |
| R-01 | Mobile Optimization | Centralize breakpoint and device-mode handling | The project repeatedly reimplements `window.innerWidth < 768` checks across many components instead of using a shared responsive abstraction. This creates drift between sections and makes future breakpoint changes expensive. | `src/hooks/use-mobile.ts`, `src/components/Header.tsx`, `src/components/Hero.tsx`, `src/components/ProjectsSection.tsx`, `src/components/ContactSection.tsx`, `src/components/AISection.tsx`, `src/components/GWASection.tsx`, `src/components/QuoteSection.tsx`, `src/components/StatsSection.tsx` | Shared breakpoint utilities or responsive props replace ad hoc mobile checks in section components. |
| R-02 | Mobile Optimization | Replace fragile `vh` and negative-offset layout tricks with viewport-safe section sizing | Several sections depend on `100vh`, sticky panels, and large negative `marginTop` offsets, which are prone to break on mobile browsers with dynamic address bars and on short landscape screens. | `src/app/page.tsx`, `src/components/ProjectsSection.tsx`, `src/components/AISection.tsx`, `src/components/GWASection.tsx`, `src/components/ContactSection.tsx` | Layouts work correctly with `svh` or measured containers, without clipped content or section overlap on iOS Safari, Android Chrome, and short-height screens. |
| R-03 | Multi-Screen Optimization | Add layout guards for ultrawide, 4K, and very short viewports | Many sections compute positions and sizes directly from `vw` and `vh`, which can overexpand typography, media panels, and absolute-positioned art direction on very large or unusually shaped screens. | `src/components/Hero.tsx`, `src/components/AISection.tsx`, `src/components/GWASection.tsx`, `src/components/AnimatedProjectsTitle.tsx`, `src/components/ProjectsSection.tsx` | Large-screen layouts use explicit max widths, container bounds, and aspect-ratio constraints so compositions remain intentional from mobile through ultrawide desktop. |
| R-04 | Mobile Optimization | Improve touch ergonomics and hover fallbacks | The site is heavily designed around custom cursors, hover states, and dense animated overlays. Touch devices need larger hit targets, clearer focus states, and hover-independent affordances. | `src/app/globals.css`, `src/components/CustomCursor.tsx`, `src/components/BrushCursor.tsx`, `src/components/ProjectsSection.tsx`, `src/components/Header.tsx`, `src/components/PasswordGate.tsx` | Interactive controls are comfortable on touch devices, hover-only cues have mobile equivalents, and the UI respects safe areas and virtual keyboard interactions. |
| R-05 | Quality | Create a responsive QA matrix for common screen classes | This project has multiple art-directed layouts and many viewport-dependent calculations. Without an explicit screen matrix, regressions will keep slipping in when sections change. | `docs/tasks.md`, `src/components/*` | A repeatable manual or automated QA checklist covers small phones, large phones, tablets, laptops, standard desktop, ultrawide, and short-height viewports. |

## Optional Testing Track

| ID | Area | Task | Why | Key files | Done when |
| --- | --- | --- | --- | --- | --- |
| T-01 | Testing | Add a lightweight unit and component test stack | There is no current automated test coverage for utility logic, form submission states, or language switching behavior. | `package.json`, `src/contexts/LanguageContext.tsx`, `src/components/ContactSection.tsx` | A test runner is configured and a small baseline suite covers language switching, scramble helpers, and contact form states. |
| T-02 | Testing | Add API tests for the contact endpoint | The contact route is a business-critical path and should be protected against regressions in validation and mail handling. | `src/app/api/contact/route.ts` | Automated tests cover success, validation failure, and upstream mail-provider failure paths. |
| T-03 | Testing | Add one end-to-end smoke test for the portfolio shell | A single E2E flow can protect routing, the password gate decision, and contact form interaction without requiring broad coverage. | `src/app/page.tsx`, `src/components/PasswordGate.tsx`, `src/components/ContactSection.tsx` | A browser test verifies the main landing page renders and the contact flow behaves correctly in a representative environment. |

## Suggested Execution Order

1. Finish `P1-01` through `P1-05` before visual refactors.
2. Tackle `P2-05` early if Windows development remains part of the workflow.
3. Combine `P2-02` and `P2-03` in one refactor pass to reduce duplicate animation and form logic.
4. Start `R-01` and `R-02` before making deeper visual responsive changes so all sections share the same viewport model.
5. Profile before and after `P3-01` through `P3-04` so performance work is measured rather than assumed.
6. Validate `R-03` through `R-05` against a real screen matrix, not just one laptop viewport.
7. Add `T-01` and `T-02` once the contact route contract is stable.
