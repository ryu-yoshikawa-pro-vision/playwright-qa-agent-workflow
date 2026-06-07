# Agent Compatibility

This repository is designed for AI coding agents that can read files and run shell commands.

## Required capabilities

- read repository files
- write repository files
- run shell commands
- run Playwright CLI commands
- run Playwright Test commands when tests must execute

## Works well with

- Codex
- OpenCode
- Gemini CLI
- other CLI-based coding agents

The agent should read `AGENTS.md`, select the relevant skill under `.agents/skills/`, and use Playwright CLI commands as needed.

## Agents without shell access

Agents without shell access cannot perform real browser exploration or test execution. They may review existing artifacts, screenshots, traces, plans, or generated code, but they must not invent exploration results.
