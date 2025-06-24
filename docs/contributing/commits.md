# Commit Guidelines

This project enforces structured commit messages following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) specification to ensure clear and structured commit history.

## Commit Message Format

```plaintext
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

## Commit Types

- **feat:** A new feature
- **fix:** A bug fix
- **docs:** Documentation changes
- **style:** Formatting changes (no logic changes)
- **refactor:** Code restructuring without changing behavior
- **perf:** Performance improvements
- **test:** Adding or updating tests
- **chore:** Maintenance tasks (e.g., CI/CD changes, dependencies)

## Examples

```plaintext
feat(auth): add JWT authentication support

fix(api): resolve null pointer exception in user service

docs(readme): update installation instructions

test(auth): add unit tests for login functionality
```

## Best Practices

- Keep the description concise and under 50 characters
- Use the imperative mood ("add" not "added")
- Don't capitalize the first letter of the description
- Don't end the description with a period
- Use the body to explain what and why, not how
