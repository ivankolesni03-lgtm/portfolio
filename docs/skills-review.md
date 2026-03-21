# Skills Review

This review summarizes the current VS Code skills in `.github/skills`, what was fixed, and how each skill can be improved for cleaner activation.

## Summary

- Structural status: valid
- Naming status: valid
- Frontmatter status: fixed
- Main improvement made: removed unsupported `allowed-tools` from all skills and tightened overlapping `description` fields
- Technical freshness status: improved after a second pass against current Next.js docs

## Global Recommendations

1. Keep descriptions narrow and task-shaped. The first sentence should say exactly when the skill should activate.
2. Prefer explicit trigger terms such as `route.ts`, `useSearchParams`, `redirect()`, `cookies()`, `action.ts`, and `[id]` over broad phrases like "routing patterns".
3. Avoid duplicating the same trigger words across broad and narrow skills unless the broad skill explicitly says when not to use it.
4. When a skill is intentionally a micro-skill, say so in the description. That helps the matcher favor it only for the narrow case.
5. Keep repo-specific claims synchronized with the real workspace configuration. Earlier versions incorrectly claimed `@typescript-eslint/no-explicit-any` was enforced.

## Technical Freshness Pass

The second review pass focused on whether the body content still matches current Next.js documentation.

### Corrections Made

1. Fixed the false claim that form actions used with `<form action={...}>` must always return `void`.
The current Next.js guidance is more nuanced: plain forms usually rely on redirect, revalidation, or refreshed server UI, while `useActionState` is the pattern for returning serializable state to the UI.

2. Fixed the false claim that client components cannot set cookies directly at all.
Client code can set some browser cookies with `document.cookie`, but not `HttpOnly` cookies and not via `next/headers`. Server Actions or Route Handlers remain the correct pattern for server-managed cookies.

3. Removed an invented style rule that `searchParams` extraction must keep identifiers on the same line.
The real rule is simply that `params`, `searchParams`, and `cookies()` are promise-based in current Next.js docs and must be awaited or unwrapped with React `use()` where appropriate.

### Current Guidance That Still Looks Correct

1. `params` as a Promise in page props aligns with the current `page` docs.
2. `searchParams` as a Promise in page props aligns with the current `page` docs.
3. `cookies()` as an async API aligns with the current `cookies` docs.

### Minor Historical Wording Left In Place

- Some skills still use historical framing like "Next.js 13+" when explaining the App Router. That is not materially wrong, but it is older wording rather than current-version wording.
- Those references are informational background, not currently breaking guidance.

## Skill Notes

### `nextjs-app-router-fundamentals`

- Status: good after tightening
- Role: broad default for standard App Router work
- Recommendation: keep this as the fallback skill for page, layout, metadata, and file-convention tasks only
- Risk: if its description becomes broader again, it will compete with nearly every other Next.js skill

### `nextjs-advanced-routing`

- Status: good after tightening
- Role: advanced routing, server actions, route handlers, streaming, and error boundaries
- Recommendation: keep this focused on server-side mutation and advanced App Router primitives
- Risk: it naturally overlaps with cookie and server/client topics, so the description must continue to exclude basic layouts and simple navigation

### `nextjs-anti-patterns`

- Status: good
- Role: review and diagnosis skill
- Recommendation: use this for audits, cleanup, and performance debugging rather than feature implementation
- Risk: broad review language is acceptable here, but it should remain clearly framed as a review skill

### `nextjs-server-client-components`

- Status: good after tightening
- Role: choosing the correct server versus client boundary
- Recommendation: keep this as the decision skill for `use client`, browser-only hooks, cookies, headers, and component ownership
- Risk: it still overlaps with `nextjs-use-search-params-suspense`; the current description now points the narrower case away from it

### `nextjs-server-navigation`

- Status: good
- Role: narrow server-component navigation skill
- Recommendation: keep it limited to `Link` and `redirect()` in Server Components
- Risk: low, because the scope is already narrow

### `nextjs-use-search-params-suspense`

- Status: good after tightening
- Role: narrow query-param client-hook pattern
- Recommendation: preserve this as a specialist skill for `useSearchParams()` plus Suspense
- Risk: medium overlap with `nextjs-server-client-components`, but acceptable if both descriptions stay explicit

### `nextjs-dynamic-routes-params`

- Status: good
- Role: choosing route structure and dynamic segment design
- Recommendation: use this when URL shape is still being decided
- Risk: medium overlap with `nextjs-pathname-id-fetch`, but the current description now distinguishes design from implementation

### `nextjs-pathname-id-fetch`

- Status: good after tightening
- Role: micro-skill for the simple detail-page fetch case
- Recommendation: keep it short and practical; this should trigger only when the route pattern is already obvious
- Risk: if examples drift into broader dynamic routing concerns, it will compete too much with `nextjs-dynamic-routes-params`

### `nextjs-client-cookie-pattern`

- Status: good after tightening
- Role: narrow client-interaction to server-action cookie pattern
- Recommendation: preserve the two-file pattern focus
- Risk: could overlap with `nextjs-advanced-routing`, but the narrower "client event sets server cookie" framing is strong enough now

### `vercel-ai-sdk`

- Status: good
- Role: explicit Vercel AI SDK v5 integration skill
- Recommendation: keep the description SDK-specific and version-specific
- Risk: low in this repo unless more generic AI skills are added later

## Suggested Next Maintenance Steps

1. Re-run a quick frontmatter validation whenever new skills are added.
2. Keep one broad default skill per domain and multiple narrow specialist skills below it.
3. If more Next.js skills are added later, add one line in each new description that says when not to use it.
