# Agent Guidelines for ChatGPT Dictation Saver Extension

## Build/Lint/Test Commands

- Build: `npm run build` (Vite bundles TypeScript to dist/)
- Dev: `npm run dev` (Vite dev server for development)
- Lint: `npm run lint` (ESLint checks TypeScript files)
- Lint Fix: `npm run lint:fix` (Auto-fix ESLint issues)
- Format: `npm run format` (Prettier formats code)
- Load extension manually in Chrome from dist/ for testing

## Code Style Guidelines

### Language & Environment

- **Language**: TypeScript (compiled to ES2020)
- **Target**: Chrome extension manifest v3
- **Modules**: ES modules with Vite bundling

### Documentation

- Use TypeScript type annotations for all functions, parameters, and variables
- Use JSDoc comments for additional documentation where needed
- Define interfaces for complex types (e.g., message types, data structures)

### Naming Conventions

- **Variables/Functions**: camelCase (e.g., `startRecording`, `formatDuration`)
- **Constants**: ALL_CAPS with underscores (e.g., `MAX_RECORDINGS`)
- **Files**: lowercase with hyphens (e.g., `background.ts`, `content.ts`)
- **Types/Interfaces**: PascalCase (e.g., `RecordingMetadata`, `Message`)

### Formatting

- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Quotes**: Single quotes for strings
- **Template Literals**: Use for string interpolation
- **Line Length**: No strict limit, break long lines naturally

### Error Handling

- Use try-catch blocks for async operations
- Log errors with `console.error()`
- Return early or throw errors for invalid states
- Handle Chrome extension API errors with `chrome.runtime.lastError`

### Code Patterns

- Use `const` for immutable variables, `let` for mutable
- Prefer arrow functions for callbacks
- Use async/await for promises
- Destructure objects when accessing multiple properties
- Use dataset attributes for DOM element state tracking
- Use strict null checks with `!` for guaranteed non-null elements

### Security

- No sensitive data handling required
- Follow Chrome extension security best practices
- Validate message types in runtime listeners
