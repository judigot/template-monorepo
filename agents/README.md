# Agents

Project-specific agents for this repository. Overlay agents stay in
https://github.com/judigot/ai.

## Available Agents

See `agents/*.md` files in this directory.

## Agent File Format

Markdown with YAML frontmatter:

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

Agents in this directory are project-specific. Overlay agents and skills live
in https://github.com/judigot/ai.
