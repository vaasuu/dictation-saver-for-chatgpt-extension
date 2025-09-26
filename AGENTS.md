# Agent Guidelines for ChatGPT Dictation Saver Extension

## Build/Lint/Test Commands
- No build tools required (vanilla JavaScript Chrome extension)
- No linting or testing framework configured
- Load extension manually in Chrome for testing

## Code Style Guidelines

### Language & Environment
- **Language**: ES6+ JavaScript (no TypeScript)
- **Target**: Chrome extension manifest v3
- **Modules**: No imports/exports (vanilla JS)

### Documentation
- Use JSDoc comments for all functions with parameter types and return types
- Use `/** @type {Type} */` for variable type annotations
- Document function parameters and return values

### Naming Conventions
- **Variables/Functions**: camelCase (e.g., `startRecording`, `formatDuration`)
- **Constants**: ALL_CAPS with underscores (e.g., `MAX_RECORDINGS`)
- **Files**: lowercase with hyphens (e.g., `background.js`, `content.js`)

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

### Security
- No sensitive data handling required
- Follow Chrome extension security best practices
- Validate message types in runtime listeners