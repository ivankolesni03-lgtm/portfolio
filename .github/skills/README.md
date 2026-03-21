# Claude Next.js Skills
A collection of skills that extend an LLM agent's capabilities with specialized domain knowledge, workflows, and bundled scripts.

## Overview

Skills are modular, self-contained packages that transform an LLM from a general-purpose assistant into a specialized agent. Each skill lives in its own folder under `.github/skills/` (or `.claude/skills/`) and is automatically activated when the AI agent detects a matching user request based on the skill's description metadata.

> **Tip:** To find out what a configured skill is capable of doing, just ask your LLM agent — for example: *"What skills do you have?"*


## Getting Started

### Prerequisites

- An LLM agent or AI coding assistant that supports skill/instruction files (e.g., GitHub Copilot, Claude, or any MCP-compatible agent)


### Skill Folder Structure

Every skill follows this standard layout:

```text
skill-name/
├── SKILL.md              # Required — metadata + AI
```

- **`SKILL.md`** — The entry point. Contains YAML frontmatter (`name`, `description`) that the LLM agent uses to decide when to activate the skill, plus markdown instructions for the AI agent.

### Setup

Skills are automatically set up when placed in the `.github/skills/` or `.claude/skills/` directory. The LLM agent will detect them.

### Usage

Skills activate automatically when the LLM agent matches your request to a skill's description. No manual invocation is needed. To discover what a skill can do, simply ask your LLM agent.

### Troubleshooting

| Issue | Solution |
| ------- | ---------- |
| Skill not detected even if the location is correct | Update VS Code to the latest version, as older versions may not support automatic skill detection. |
| Skill not used effectively | Try using a premium model such as Sonnet or Opus for improved skill matching and execution. |

## Related Resources

- [VS Code Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [Claude Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
