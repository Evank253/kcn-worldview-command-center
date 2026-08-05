# Contributing to KCN Command Center

Thank you for your interest in contributing to the KCN Command Center! This document provides guidelines and instructions for contributing to any of our four projects.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

---

## Code of Conduct

All contributors are expected to:

- ✅ Be respectful and inclusive
- ✅ Welcome diverse perspectives
- ✅ Focus on constructive feedback
- ✅ Follow professional communication standards
- ❌ Avoid harassment, discrimination, or offensive language
- ❌ Respect intellectual property rights

---

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or yarn/pnpm)
- **Git** 2.35+
- A GitHub account
- Git configured locally:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your@email.com"
  ```

### Fork & Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/kcn-worldview-command-center.git
   cd kcn-worldview-command-center
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Evank253/kcn-worldview-command-center.git
   git remote -v  # Verify both origin and upstream
   ```

---

## Development Setup

### Install Dependencies

```bash
# Install all project dependencies
npm install

# Or install per-project
cd KCN-Worldview
npm install
cd ..
```

### Setup Environment Variables

Create `.env.local` in each project you're working on:

**Example: KCN-Worldview/.env.local**
```env
VITE_API_URL=http://localhost:3000
VITE_GLOBE_RESOLUTION=1024
DEBUG=true
```

### Start Development Server

```bash
cd KCN-Worldview  # or your target project
npm run dev
```

The app should be available at `http://localhost:5173` (or next available port).

### Verify Setup

```bash
# All commands should succeed
npm run build      # Build succeeds
npm run lint       # No linting errors (if configured)
npm run test       # Tests pass (if available)
```

---

## Making Changes

### Create a Feature Branch

**Always branch from `Python-3`** (the main development branch):

```bash
# Update from upstream
git fetch upstream
git checkout upstream/Python-3

# Create your feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Convention

Follow this pattern for branch names:

```
feature/add-user-authentication
bugfix/fix-globe-rendering
docs/update-setup-guide
refactor/improve-data-pipeline
test/add-unit-tests-for-entities
chore/update-dependencies
```

**Format**: `<type>/<short-description>` (lowercase, hyphens)

---

## Commit Guidelines

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **test**: Adding or updating tests
- **chore**: Dependency updates, build process changes
- **perf**: Performance improvements

### Commit Examples

```bash
# Feature
git commit -m "feat(globe): add zoom animation controls"

# Bug fix
git commit -m "fix(entity-graph): resolve rendering lag with large datasets"

# Documentation
git commit -m "docs(readme): add troubleshooting section"

# With body (for complex changes)
git commit -m "feat(auth): implement JWT token refresh

- Add refresh token rotation every 1 hour
- Store refresh tokens securely in httpOnly cookies
- Update auth middleware to handle token expiration

Fixes #123"
```

### Best Practices

✅ **Do:**
- Keep commits focused and logical
- Write clear, descriptive messages
- Reference issue numbers when applicable
- Separate refactoring from feature changes

❌ **Don't:**
- Mix multiple features in one commit
- Use vague messages ("fix stuff", "updates")
- Commit sensitive data (passwords, keys)
- Make huge commits (break them up)

---

## Pull Request Process

### Before Creating a PR

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/Python-3
   ```

2. **Run tests locally**:
   ```bash
   npm run build    # Verify build succeeds
   npm run test     # All tests pass
   npm run lint     # No linting errors
   ```

3. **Test your changes manually** in dev/preview modes

### Creating a Pull Request

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Go to GitHub** and create a PR from your fork to `Evank253:Python-3`

3. **Fill out the PR template** with:
   - ✅ Clear description of changes
   - ✅ Motivation and context
   - ✅ Related issues (e.g., "Closes #123")
   - ✅ Screenshots/videos (for UI changes)
   - ✅ Testing performed
   - ✅ Checklist completion

### PR Template

```markdown
## Description
Brief description of your changes

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #(issue number)

## How Has This Been Tested?
- [ ] Tested locally with `npm run dev`
- [ ] Ran `npm run build` successfully
- [ ] Ran tests: `npm run test`
- [ ] No console errors/warnings

## Screenshots (if applicable)
(Add before/after screenshots for UI changes)

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented complex logic
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] Tests pass locally with my changes
```

### PR Review Process

1. **Automated Checks** run (build, lint, tests)
2. **Code Review** by maintainers (1-2 reviewers)
3. **Address Comments** - Make requested changes
4. **Approval** - PR is approved
5. **Merge** - Squash merge to `Python-3`

### Responding to Review

- ✅ Respond to all comments
- ✅ Make requested changes promptly
- ✅ Push updates to the same branch (don't force push)
- ✅ Re-request review after changes
- ✅ Ask for clarification if needed

---

## Coding Standards

### JavaScript/React Standards

```javascript
// ✅ DO: Clear variable names, proper formatting
const getUserProfile = async (userId) => {
  const response = await fetchUser(userId);
  return response.data;
};

// ❌ DON'T: Unclear names, inconsistent formatting
const gup = async(u) => {
  let r = await fu(u)
  return r.d
}
```

### React Component Standards

```javascript
// ✅ DO: Functional components, clear props
const UserCard = ({ user, onDelete }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <button onClick={() => onDelete(user.id)}>Delete</button>
    </div>
  );
};

// ❌ DON'T: Class components, inline logic
class UserCard extends Component {
  deleteUser = () => { /* ... */ };
  render() {
    return <div onClick={this.deleteUser}>{this.props.u.n}</div>;
  }
}
```

### ESLint & Prettier

```bash
# Format code with Prettier
npm run format

# Check linting
npm run lint

# Fix linting errors
npm run lint:fix
```

### Code Organization

```
src/
├── components/        # Reusable React components
├── pages/            # Page-level components
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── api/              # API calls
├── styles/           # Global styles
├── types/            # TypeScript types
└── App.jsx           # Root component
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

```javascript
// Example: Unit test for utility function
import { calculateDistance } from '../utils/geo';

describe('calculateDistance', () => {
  it('should calculate distance between two coordinates', () => {
    const result = calculateDistance(
      { lat: 0, lon: 0 },
      { lat: 0, lon: 1 }
    );
    expect(result).toBeCloseTo(111.32, 1); // km
  });

  it('should return 0 for same coordinates', () => {
    const result = calculateDistance(
      { lat: 0, lon: 0 },
      { lat: 0, lon: 0 }
    );
    expect(result).toBe(0);
  });
});
```

```javascript
// Example: React component test
import { render, screen } from '@testing-library/react';
import UserCard from '../components/UserCard';

describe('UserCard', () => {
  it('should render user name', () => {
    const user = { id: 1, name: 'John Doe' };
    render(<UserCard user={user} onDelete={() => {}} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Test Coverage Targets

- **Overall**: 80% minimum
- **Critical paths**: 100%
- **UI components**: 70% minimum
- **Utilities**: 90% minimum

---

## Documentation

### Code Comments

```javascript
// ✅ Good: Explains WHY, not WHAT
// We debounce globe interactions to prevent performance issues
// when rendering thousands of entities
const debouncedOnZoom = useMemo(
  () => debounce(handleZoom, 300),
  []
);

// ❌ Bad: Obvious comments
// Set the zoom level
setZoom(level);
```

### README Updates

Update project READMEs when:
- Adding new features
- Changing setup instructions
- Updating dependencies
- Adding new configuration options

### Commit Documentation

Include detailed commit messages and PR descriptions:

```markdown
## Changes
- Added zoom animation to globe controls
- Improved rendering performance by 40%

## Files Modified
- src/components/Globe/GlobeControls.jsx
- src/hooks/useGlobeInteraction.js

## Testing
- Manual testing at various zoom levels
- Performance testing with 5000+ entities
```

---

## Reporting Issues

### Before Reporting

1. **Search existing issues** - Check if already reported
2. **Check documentation** - Is this documented?
3. **Update dependencies** - Could be an outdated package
4. **Test with latest** - Issue might already be fixed

### Bug Report Format

**Title**: `[PROJECT] Bug: Clear, specific description`

**Description**:
```markdown
## Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Observe error

## Expected Behavior
What should happen

## Actual Behavior
What actually happened

## Environment
- OS: macOS 13.2
- Node: 18.15.0
- npm: 9.6.0
- Browser: Chrome 112

## Screenshots/Logs
(Paste relevant console errors or screenshots)

## Additional Context
Any other relevant info
```

---

## Feature Requests

### Feature Request Format

**Title**: `[PROJECT] Feature: Clear description of feature`

**Description**:
```markdown
## Feature Description
What you want to add

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this work?

## Alternatives Considered
Other solutions you've thought of

## Additional Context
Any sketches, designs, or references
```

---

## Questions & Support

- 📝 **Issues**: [GitHub Issues](https://github.com/Evank253/kcn-worldview-command-center/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Evank253/kcn-worldview-command-center/discussions)
- 📧 **Email**: (maintainer email)

---

## Recognition

All contributors are recognized in:
- ✅ Repository README
- ✅ Release notes
- ✅ CONTRIBUTORS.md file

---

Thank you for contributing! 🚀
