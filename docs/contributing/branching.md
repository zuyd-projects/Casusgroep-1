# Branching & Pull Request Guidelines

This document outlines our branching strategy, naming conventions, and code review policies.

## Branch Naming Convention

All branches must follow a strict naming convention based on **Linear ticket names**:

```plaintext
<username>/<ticket-id>-<short-description>
```

### Example

```plaintext
noaheutz301/devops-11-one-drive-omgeving-opzetten
```

### Getting Branch Names from Linear

Use the copy button for branch names in Linear:

![Branch name copy button](https://github.com/user-attachments/assets/64e01762-eb2a-4668-9924-3dd1d3bfa889)

## Branch Protection & Workflow

We follow a strict promotion workflow: `test` → `staging` → `main`

### Main Branch Merges

- **Requires at least 3 reviewers** before merging
- Production-ready code only
- All tests must pass
- Security scans must pass

### Staging Branch Merges

- **Requires at least 2 reviewers** before merging
- Pre-production testing environment
- Integration tests must pass

### Test Branch Merges

- **Requires at least 1 reviewer** before merging
- Initial integration testing environment
- Basic linting and unit tests must pass

## Pull Request Guidelines

### Creating a Pull Request

1. Ensure your branch follows the naming convention
2. Write a clear, descriptive title
3. Fill out the PR template completely
4. Link to the relevant Linear ticket
5. Add appropriate labels
6. Request reviewers based on the target branch

### Review Process

- Reviewers should provide constructive feedback
- Use conventional comments for clarity
- Address all feedback before merging
- Squash commits when merging to maintain clean history
