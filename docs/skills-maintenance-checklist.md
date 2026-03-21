# Skills Maintenance Checklist

Use this checklist when adding or reviewing a skill under `.github/skills/`.

## 1. File Structure

- [ ] Skill is stored in `.github/skills/<skill-name>/SKILL.md`
- [ ] Folder name is lowercase `kebab-case`
- [ ] Entry file is exactly `SKILL.md`
- [ ] Frontmatter `name:` matches the folder name exactly
- [ ] Frontmatter includes a meaningful `description:`
- [ ] Frontmatter does not include unsupported fields such as `allowed-tools`

## 2. Description Quality

- [ ] First sentence clearly says when the skill should be used
- [ ] Description contains concrete trigger terms such as `route.ts`, `useSearchParams`, `redirect()`, `cookies()`, `action.ts`, or `[id]` when relevant
- [ ] Description is narrow enough that it does not compete with unrelated skills
- [ ] If the skill is broad, it says when not to use it
- [ ] If the skill is a micro-skill, it says so explicitly

## 3. Overlap Check

- [ ] Compare the new description against existing skills for duplicated trigger words
- [ ] Make sure a broad skill does not swallow a narrower specialist skill
- [ ] Where overlap is intentional, the description explains the boundary clearly

## 4. Technical Accuracy

- [ ] Repo-specific claims match the current workspace configuration
- [ ] Next.js, React, or SDK behavior matches current official docs
- [ ] Examples do not enforce invented style rules that are not real framework requirements
- [ ] Version-specific statements are still true for the current stack

## 5. Validation Pass

- [ ] Run a frontmatter or markdown validation pass on the skill file
- [ ] Check for trailing newline and markdown hygiene issues
- [ ] Re-read the final description alone and ask: would the matcher choose the right skill from this sentence?

## Quick Red Flags

- Broad phrases like "routing patterns" with no boundary
- Repo claims copied from another project
- Unsupported frontmatter keys
- Skills that say "always use" without naming exceptions
- Examples that contradict current framework docs
