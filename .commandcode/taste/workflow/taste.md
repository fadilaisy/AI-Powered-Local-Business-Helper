# Workflow

- After building UI, verify it in a real browser before reporting done: open the page, snapshot interactive elements, exercise each state, and capture screenshots. Confidence: 0.75
- Always check both a desktop and a mobile viewport (e.g. 390x844) on UI work. Confidence: 0.75
- Run an automated accessibility audit and iterate until clean; report the concrete finding (e.g. "3.67:1") rather than a vague "checked accessibility". Confidence: 0.7
- Use a todo list to track build → inspect → refine phases on multi-step work, updating statuses as each phase lands. Confidence: 0.65
- Prefer a plain static server (e.g. `python -m http.server`) over the project's dev server when previewing a standalone scratch file. Confidence: 0.6
- Close browser sessions and stop background servers/processes when the task finishes; don't leave them running. Confidence: 0.7
- When a tool or subagent is unavailable, fall back to a direct pass (read the files yourself), say so briefly, and keep going instead of stalling or retrying the same failing path. Confidence: 0.7
- Prefer small, targeted edits over rewriting a file; state which detector/audit finding justifies each change. Confidence: 0.65
