# Agents

Project-specific agents for this repository. Overlay agents stay in `~/ai`.

## Available Agents

See `agents/*.md` files in this directory.

## Agent File Format

All agents follow the Claude Code standard format with YAML frontmatter:

```markdown
---
name: agent-identifier
description: Use this agent when [conditions]. Examples:

<example>
Context: [Situation]
user: "[Request]"
assistant: "[Response]"
<commentary>
[Why this agent triggers]
</commentary>
</example>

model: inherit
color: blue
tools: ["Read", "Write", "Bash", "Grep"]
---

[System prompt content]
```

## Usage

### Claude Code

Agents are auto-discovered when using the plugin:

```sh
claude --plugin-dir .
```

### Cursor IDE

Reference agents with `@agents/<agent>.md`

## Global Agents

Additional agents and skills are available from `~/ai`. See `.cursor/rules/global-agents/` for references.

