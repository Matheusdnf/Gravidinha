---
name: componentization-guidelines
description: Enforces the practice of creating reusable React Native components to prevent code duplication and encourage modularity.
---

# Componentization Guidelines

To maintain a clean, scalable, and maintainable codebase, you must always follow strict componentization practices.

## Core Principles

1. **DRY (Don't Repeat Yourself):** Whenever you notice identical or highly similar UI blocks (e.g., buttons, cards, list items, headers) being written more than once, extract them into a separate, reusable component.
2. **Atomic Design Thinking:** Break down complex screens into smaller, manageable, and independent pieces. A screen should ideally be a composition of multiple smaller components rather than a single massive file.
3. **Directory Structure:** Place all shared and reusable UI components inside the `components/` directory. Group them into sub-folders based on their feature or domain (e.g., `components/inicio`, `components/perfil`).
4. **Configurability via Props:** Extracted components must use TypeScript interfaces to define their `props`. This allows them to accept dynamic content, styling overrides, and callbacks, avoiding hardcoded data.
5. **Separation of Concerns (Dumb Components):** Keep components as "dumb" (presentation-only) as possible. Manage state and API requests in the parent screen (inside `app/`) and pass the necessary data and event handlers down to the child components.

## Expected Workflow

When building or refactoring UI:
- **Evaluate:** Check if the UI element already exists in the `components/` folder.
- **Extract:** If you are writing the same UI layout for the second time, stop and extract it into a reusable component.
- **Implement:** Replace the duplicated code with your new component, passing the necessary dynamic data via props.

Always prioritize component extraction over code duplication.
