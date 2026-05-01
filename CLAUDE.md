# Claude Code Configuration - Med Project

Welcome to the Med Project. This file provides the high-level context and entry point for Claude Code.

## Project Overview
- **Tech Stack:** 
  - **Frontend:** Next.js (TypeScript), React, MUI, TailwindCSS (for some parts), Lucide-React.
  - **Backend:** Java Spring Boot, Maven, PostgreSQL.
  - **Environment:** Docker Compose for local development.

## Directory Structure
- `backend/`: Spring Boot application source code.
- `frontend/`: Next.js application source code.
- `.claude/`: Configuration and instructions for Claude Code.
  - `agents/`: Specialized personas (Frontend, Backend, Architect, etc.).
  - `commands/`: Custom slash commands (/spec, /plan, /build, /test).
  - `rules/`: Mandatory coding standards and architectural guardrails.
  - `skills/`: Procedural knowledge (TDD, Security, etc.).
  - `references/`: Verification checklists.

## Key Agents
- Use `/agent frontend` to invoke the Frontend Engineer persona.
- Use `/agent backend` to invoke the Backend Engineer persona.
- Use `/agent architect` to invoke the Systems Architect persona.

## Workflows
1. **Spec Phase:** Use `/spec` to define requirements.
2. **Plan Phase:** Use `/plan` to create a technical implementation plan.
3. **Build Phase:** Use `/build` to implement changes.
4. **Test Phase:** Use `/test` to verify changes.

## Engineering Standards
- All code must adhere to the rules in `.claude/rules/`.
- Prioritize type safety, clean code, and modularity.
- Ensure proper error handling and logging.

---
*Generated based on Class-AI-Agent standards.*
