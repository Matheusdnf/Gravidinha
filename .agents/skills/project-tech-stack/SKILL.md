---
name: project-tech-stack
description: Defines the permitted technology stack for the project. Use this skill to ensure consistency in the libraries and tools used.
---

# Gravidinha Technology Stack

The Gravidinha project strictly adheres to the following technology stack. Do not introduce new technologies, frameworks, or alternatives without explicit user permission.

## Approved Technologies

1. **React Native:** The core framework used for building the application. All components should be built using React Native primitives (`View`, `Text`, `ScrollView`, etc.).
2. **TypeScript:** The primary language for all files (`.ts`, `.tsx`). Ensure strict typing, define appropriate interfaces/types for props, state, and API responses. Avoid using `any` whenever possible.
3. **Tailwind CSS:** The exclusive styling solution. All styling should be applied using Tailwind utility classes (e.g., `className="..."`). Avoid inline styles unless absolutely necessary for dynamic computed values.
4. **Supabase:** Backend (Postgres, Auth) accessed with `@supabase/supabase-js` from the app. Schema changes go in `supabase/migrations/`.

## Strict Guidelines
- **Styling:** Do not use alternative styling libraries (e.g., Styled Components, Emotion, or traditional StyleSheet objects if Tailwind can be used).
- **Core:** Do not migrate to or mix in other frameworks. Stick strictly to React Native with Expo.
