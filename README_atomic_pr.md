# Atomic PR

An atomic PR, is a PR that contains a single, self-contained change.
It's small enough to be reviewed, tested, and merged independently without depending on other unmerged work.

In other words:

> Each PR should represent one logical change that can stand on its own.

## Characteristics of an atomic PR

1. **Focused scope**

- The PR does one thing: fixes a bug, adds a feature, refactors a component, updates documentation, etc...
- It avoids combining unrelated changes.

2. **Small and reviewable**

- Typically a few dozen lines of changes (not thousands).
- Easier to reason about, review, and yes... test.

3. **Self-contained**

- It builds and passes tests independently.
- It doesn't rely on unmerged branches.

4. **Clear commit history**

- Ideally... each commit also follows the same atomic principle, one change per commit.

## Example

#### Non-atomic PR:

> Added a new login feature, refactored user management, fixed some CSS and updated a README.

#### Atomic PRs:

- PR #1: Added a new login feature
- PR #2: Refactored user management
- PR #3: Fixed some CSS
- PR #4: Update README

## Key benefits

- **Easier code review:** Reviewers understand intent and can focus on one concern.
- **Lower merge conflits:** Small, isolated changes merge cleanly.
- **Simpler Rollback:** If something breaks, we can revert just that one change.
- **Better CI/CD feedback:** Each PR passes/fails tests based on a single change.
- **Faster delivery:** We can merge incremental improvements continuously.

## Common challenges

- **Splitting large features:** Sometimes a feature needs multiple PRs. In that case, we should use `feature flags` to integrate safely.
- **Team discipline:** Requires alignment and a proper review culture.
- **Documentation overhead:** More PR's means more descriptions, but with templates and help from copilot, this can be speed up.

## Proposed approach for adopting Atomic PRs:

- Keep PR under `~300` lines of change when possible.
- Use draft PRs for early feedback on large features.
- Use tools like Github actions or CI rules to enforce size, provide visibility or review checks.
