# Contributing to CodolioSheet

Thank you for your interest in contributing to CodolioSheet! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/codolio-sheet.git
   cd codolio-sheet
   ```
3. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Running the Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 📝 Coding Standards

### TypeScript
- Use TypeScript for all new files
- Avoid using `any` type; use proper type definitions
- Export types and interfaces when they might be reused

### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use meaningful component and prop names

### Styling
- Use Tailwind CSS utility classes
- Follow the existing design system
- Maintain responsive design principles
- Use CSS variables for theme colors

### Code Organization
```
components/
  ├── ui/           # Reusable UI components
  ├── [feature]/    # Feature-specific components
lib/
  ├── store.ts      # State management
  ├── types.ts      # Type definitions
  └── utils.ts      # Utility functions
```

## 🎯 Commit Guidelines

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(topics): add drag-and-drop reordering
fix(storage): resolve localStorage quota exceeded error
docs(readme): update installation instructions
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, Node version
6. **Screenshots**: If applicable

## ✨ Feature Requests

When requesting features:

1. **Use Case**: Explain why this feature would be useful
2. **Proposed Solution**: Describe how you envision it working
3. **Alternatives**: Any alternative solutions you've considered
4. **Additional Context**: Screenshots, mockups, or examples

## 🔄 Pull Request Process

1. **Update Documentation**: Update README.md if needed
2. **Test Thoroughly**: Ensure your changes work as expected
3. **Follow Code Style**: Match the existing code style
4. **Write Clear Descriptions**: Explain what and why
5. **Link Issues**: Reference related issues

### PR Checklist
- [ ] Code follows the project's coding standards
- [ ] Changes have been tested locally
- [ ] Documentation has been updated
- [ ] Commit messages follow the guidelines
- [ ] No console errors or warnings
- [ ] Responsive design maintained

## 🎨 Design Guidelines

- **Consistency**: Follow existing UI patterns
- **Accessibility**: Ensure features are accessible
- **Performance**: Optimize for speed and efficiency
- **Mobile-First**: Design for mobile, enhance for desktop

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help create a welcoming environment

## 📧 Questions?

If you have questions, feel free to:
- Open an issue for discussion
- Reach out to the maintainers
- Check existing issues and PRs

---

Thank you for contributing to CodolioSheet! 🎉
