# Contributing to claudesm

First off, thank you for considering contributing to csm! It's people like you that make csm such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Table of Contents

- [Getting Started](#getting-started)
- [GitFlow Branching Model](#gitflow-branching-model)
- [Commit Message Format](#commit-message-format)
- [Development Workflow](#development-workflow)
- [Release Process](#release-process)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- A GitHub account
- Git installed locally
- Node.js 20.10+ and npm 8+
- Familiarity with TypeScript

### Quick Start

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Install** dependencies and set up the project
4. **Create a branch** following the naming conventions
5. **Make your changes** and test thoroughly
6. **Submit a PR** to the `develop` branch

---

## GitFlow Branching Model

This project uses a GitFlow branching model to organize development and releases. All merges must be done through Pull Requests - no direct pushes to protected branches.

### Branch Overview

| Branch | Purpose | PR Target | Merge Strategy |
|--------|---------|-----------|----------------|
| `main` | Stable releases only | N/A | N/A |
| `develop` | Integration branch for next release | N/A | N/A |
| `feature/*` | New features (branch from `develop`) | `develop` | Squash or Merge |
| `fix/*` | Bug fixes (branch from `develop`) | `develop` | Squash or Merge |
| `release/vX.Y.Z` | Release preparation (branch from `develop`) | `main` | Merge (preserve history) |
| `hotfix/*` | Urgent fixes for `main` (branch from `main`) | `main` | Squash or Merge |

### Branch Rules

1. **Feature branches** MUST branch from `develop` and PR back to `develop`
2. **Fix branches** MUST branch from `develop` and PR back to `develop`
3. **Release branches** are the ONLY branches that PR to `main`
4. **Hotfix branches** from `main` PR to `main` (and must be cherry-picked to `develop`)

### Common Workflows

#### Creating a Feature Branch

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name
```

#### Creating a Fix Branch

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create fix branch
git checkout -b fix/issue-description
```

#### Creating a Release Branch

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create release branch
git checkout -b release/v0.2.0

# Update CHANGELOG.md with version section
# Then push and create PR to main
git push -u origin release/v0.2.0
```

#### Creating a Hotfix Branch

```bash
# Start from main
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/critical-fix

# After merging to main, cherry-pick to develop
git checkout develop
git cherry-pick <commit-hash>
git push origin develop
```

---

## Commit Message Format

This project uses **Gitmoji + Conventional Commits** for commit messages.

### Format

```
<gitmoji> <type>(<scope>): <description>
```

### Gitmoji

| Emoji | Code | When to use |
|-------|------|-------------|
| ✨ | `:sparkles:` | New feature |
| 🐛 | `:bug:` | Bug fix |
| 📝 | `:memo:` | Documentation |
| ♻️ | `:recycle:` | Refactor |
| 🎨 | `:art:` | Format/style |
| ✅ | `:white_check_mark:` | Tests |
| 🔧 | `:wrench:` | Configuration |
| 🔒 | `:lock:` | Security |
| 🚀 | `:rocket:` | Release/deploy |
| 🔥 | `:fire:` | Removing code |
| 📦 | `:package:` | Dependencies |
| 🚑 | `:ambulance:` | Critical hotfix |

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools
- `perf`: Performance improvement
- `ci`: CI configuration changes
- `build`: Build system changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `revert`: Reverting a previous commit

### Examples

```bash
✨ feat(commands): add status command
🐛 fix(tui): handle empty session list
📝 docs: update README with installation steps
♻️ refactor(lib): extract common utilities
🎨 style: format shell scripts with shfmt
✅ test: add unit tests for clean command
🔧 chore: update gitignore
🔒 fix(security): validate user input in remove
```

---

## Development Workflow

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR-USERNAME/claudesm.git
cd claudesm
```

### 2. Set Up Remotes

```bash
# Add upstream remote
git remote add upstream https://github.com/cativo23/claudesm.git

# Verify remotes
git remote -v
```

### 3. Keep Your Fork in Sync

```bash
# Fetch upstream
git fetch upstream

# Checkout develop
git checkout develop

# Merge upstream changes
git merge upstream/develop

# Push to your fork
git push origin develop
```

### 4. Create Your Branch

```bash
# Always branch from develop
git checkout -b feature/your-feature
```

### 5. Make Changes and Test

```bash
# Type-check
npm run typecheck

# Lint
npm run lint

# Build
npm run build

# Test manually
npm run dev -- --help
npm run dev -- list
```

### 6. Commit Your Changes

```bash
git add <files>
git commit -m "✨ feat(scope): your commit message"
```

### 7. Push and Create PR

```bash
git push -u origin <branch-name>
```

Then create a Pull Request on GitHub targeting `develop`.

---

## Release Process

### Standard Release (v0.x.y prerelease)

1. **Prepare release branch:**
   ```bash
   git checkout develop
   git pull
   git checkout -b release/v0.2.0
   ```

2. **Update CHANGELOG.md** with version section

3. **Push and create PR:**
   ```bash
   git push -u origin release/v0.2.0
   # Create PR to main via GitHub UI
   ```

4. **Merge triggers auto-release:**
   - Workflow extracts version `v0.2.0` from branch name
   - Creates GitHub release with `--prerelease` flag
   - Uses CHANGELOG section as release notes

### Stable Release (v1.0.0+)

Same process, but release is marked as stable (not prerelease) once major version >= 1.

### Hotfix Release

1. Branch from `main`:
   ```bash
   git checkout main
   git checkout -b hotfix/fix-critical-bug
   ```

2. Fix, commit, PR to `main`

3. After merge, also cherry-pick to `develop`:
   ```bash
   git checkout develop
   git cherry-pick <commit-hash>
   ```

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed and what behavior you expected**
* **Include screenshots if possible**
* **Include your environment details** (OS, shell, bash version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Explain why this enhancement would be useful**
* **List some examples of how this enhancement would be used**

### Pull Requests

* Fill in the required template
* Follow the existing code style
* Include comments in your code where necessary
* Update documentation as needed
* Test your changes

---

## Development Setup

1. Fork the repo
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/claudesm.git
   ```
3. Install dependencies:
   ```bash
   cd claudesm
   npm install
   ```
4. Make your changes
5. Test with:
   ```bash
   npm run dev -- --help
   npm run dev -- list
   ```
6. Build and type-check:
   ```bash
   npm run build
   npm run typecheck
   ```

---

## Code Style

### TypeScript

```typescript
// commands/example.ts - Brief description

import type { Session } from '../lib/sessions.js';

// Named exports preferred over default
export async function runExample(id: string): Promise<void> {
    // Essential comments only, in English
    const session = await findSession(id);
    if (!session) throw new Error(`Session not found: ${id}`);
}
```

**Rules:**
- **Indentation**: 2 spaces
- **Types**: explicit return types on exported functions; infer locals
- **Imports**: use `.js` extension (ESM); named exports over default
- **Error handling**: throw typed `Error` instances; never `process.exit` inside lib code
- **Async**: `async/await` throughout; no raw Promise chains

---

## Testing

Before submitting a PR, please:

1. Run `npm run typecheck` — no TypeScript errors allowed
2. Run `npm run lint` — no ESLint errors allowed
3. Run `npm run build` — build must succeed
4. Run `npm test` — all tests must pass
5. Test affected commands manually with `npm run dev -- <command>`
6. Verify the help text is accurate

---

## Documentation

* Update README.md for user-facing changes
* Update inline comments for code changes
* Keep examples up to date

---

## Questions?

Feel free to open an issue with the "question" label if you have any questions about contributing.
