# Casusgroep -1
🤖 Monorepo for the: Casus DEVOPS "Innovatie in de zorg"

# Project Contribution Guidelines

This project enforces structured commit messages, code review policies, and branch naming conventions to maintain a clean and scalable codebase.

## 📌 Commit Guidelines (Conventional Commits)

All commits **must** follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) specification. This ensures clear and structured commit history.

### **Commit Message Format:**
```plaintext
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```
### **Commit Types:**
- **feat:** A new feature
- **fix:** A bug fix
- **docs:** Documentation changes
- **style:** Formatting changes (no logic changes)
- **refactor:** Code restructuring without changing behavior
- **perf:** Performance improvements
- **test:** Adding or updating tests
- **chore:** Maintenance tasks (e.g., CI/CD changes, dependencies)

**Example:**
```plaintext
feat(auth): add JWT authentication support
```

## 💬 Code Review & Branching Policy

### **Branch Naming**
All branches must follow a strict naming convention based on **Linear ticket names**:
```plaintext
<username>/<ticket-id>-<short-description>
```
**Example:**
```plaintext
noaheutz301/devops-11-one-drive-omgeving-opzetten
```
**Copy button for branch names in linear:**

<img width="310" alt="Screenshot 2025-02-20 at 12 11 34" src="https://github.com/user-attachments/assets/64e01762-eb2a-4668-9924-3dd1d3bfa889" />


### **Pull Request & Review Policy**
#### **Branch Protection Rules & Workflow**
We follow a strict promotion workflow: `test` → `staging` → `main`

- **Main Branch Merges**
  - **Requires at least 3 reviewers** before merging
  - Production-ready code only

- **Staging Branch Merges**
  - **Requires at least 2 reviewers** before merging
  - Pre-production testing environment

- **Test Branch Merges**
  - **Requires at least 1 reviewer** before merging
  - Initial integration testing environment

## ✅ Code Commenting Standards (Conventional Comments)
All comments should follow the [Conventional Comments](https://conventionalcomments.org/) format for clarity and consistency.

### **Comment Format:**
```plaintext
<type>: <message>
```
### **Types of Comments:**
- **TODO:** `TODO: Implement the API integration`
- **FIXME:** `FIXME: This needs error handling`
- **HACK:** `HACK: Temporary workaround for issue`
- **NOTE:** `NOTE: This function assumes a positive integer input`
- **OPTIMIZE:** `OPTIMIZE: Improve the efficiency of this loop`

By following these conventions, we ensure **better collaboration, maintainability, and traceability** of our codebase. 🚀

