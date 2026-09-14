# Just Enough React Engineering Rules

## 1) Architecture & Separation of Concerns
- **Presentation Layer (`presentation/`):** React components and pages. Responsible ONLY for rendering and user interaction. No complex business logic.
- **Domain Layer (`domain/`):** Business logic, custom hooks, and state management (Zustand stores). UI components must depend ONLY on this layer for logic.
- **Data Layer (`data/`):** API clients, services, mock data, and data mapping. This layer handles all external communication.
- Reusable code (UI components, constants, themes) must live in `Web/src/core/`.

## 2) State Management (Zustand)
- Use **Zustand** for feature and application state.
- Stores should represent states clearly (e.g., loading, success, error).
- Logic for fetching data or transforming it should happen inside the store or domain hooks, not in the components.

## 3) Feature Folder Structure
Every new feature must follow this structure inside `Web/src/`:
- `features/{feature_name}/data/`
- `features/{feature_name}/domain/`
- `features/{feature_name}/presentation/`

## 4) Error Handling
- Errors should be caught at the data layer and mapped to a user-friendly format before reaching the presentation layer.
- Components should explicitly handle loading and error states.

## 5) Change Discipline
- Smallest change possible.
- Read before modify.
- Fix root causes.

## 6) Workflow
- Before marking any task done → Perform a code review following the `react-code-review` guidelines.
- PRs should follow conventional commit messages: `feat(scope):`, `fix(scope):`, etc.
