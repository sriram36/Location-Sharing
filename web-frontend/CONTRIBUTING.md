# Contributing to School Bus Tracking System

We welcome contributions to the School Bus Tracking System! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Supabase account for development

### Development Setup

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/school-bus-tracking.git
   cd school-bus-tracking/web-frontend
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```
5. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add JSDoc comments for complex functions

### Component Guidelines
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow shadcn/ui patterns for UI components
- Ensure components are responsive and accessible

### File Naming
- Use PascalCase for component files: `ComponentName.tsx`
- Use camelCase for utility files: `utilityFunction.ts`
- Use kebab-case for pages: `dashboard-page.tsx`

## 🎯 Contributing Areas

### 🐛 Bug Fixes
- Check existing issues before creating new ones
- Provide reproduction steps
- Include screenshots for UI bugs
- Test fixes across different devices

### ✨ New Features
- Discuss major features in issues first
- Follow existing patterns and conventions
- Update documentation
- Add tests when applicable

### 📚 Documentation
- Update README for new features
- Add code comments for complex logic
- Create examples for new components
- Keep STRUCTURE.md updated

### 🎨 UI/UX Improvements
- Follow the design system
- Ensure accessibility standards
- Test on mobile devices
- Maintain responsive design

## 🔧 Technical Standards

### TypeScript
```typescript
// ✅ Good: Proper interface definition
interface BusStatus {
  id: string;
  busNumber: string;
  status: 'active' | 'idle' | 'maintenance';
  location: {
    lat: number;
    lng: number;
  };
}

// ❌ Avoid: Using 'any' type
const busData: any = fetchBusData();
```

### Component Structure
```tsx
// ✅ Good: Well-structured component
interface ComponentProps {
  title: string;
  onAction: () => void;
  className?: string;
}

export function Component({ title, onAction, className }: ComponentProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await onAction();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("component-base", className)}>
      <h2>{title}</h2>
      <button onClick={handleAction} disabled={loading}>
        {loading ? 'Loading...' : 'Action'}
      </button>
    </div>
  );
}
```

### State Management
- Use local state for component-specific data
- Use Supabase real-time for shared data
- Implement proper error handling
- Add loading states for async operations

## 🧪 Testing

### Before Submitting
1. **Type Check**: `npm run type-check`
2. **Lint**: `npm run lint`
3. **Build**: `npm run build`
4. **Test manually**: Test your changes across different scenarios

### Testing Checklist
- [ ] Component renders correctly
- [ ] Responsive design works
- [ ] Accessibility standards met
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] TypeScript types are correct

## 📋 Pull Request Process

### Before Creating PR
1. Create feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Commit with clear messages

### PR Requirements
- [ ] Clear title and description
- [ ] Link to related issue
- [ ] Screenshots for UI changes
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] Responsive design verified

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tested locally
- [ ] Responsive design verified
- [ ] Accessibility checked
- [ ] Cross-browser tested

## Screenshots
(If applicable)

## Related Issues
Fixes #123
```

## 🎨 Design System

### Colors
Use CSS variables defined in globals.css:
```css
--primary: hsl(221.2 83.2% 53.3%);
--secondary: hsl(210 40% 96%);
--accent: hsl(210 40% 92%);
```

### Components
- Follow shadcn/ui patterns
- Use consistent spacing (4, 8, 16, 24, 32px)
- Implement hover and focus states
- Ensure keyboard navigation

### Animations
```css
/* Use consistent transition durations */
.component {
  transition: all 300ms ease-in-out;
}

/* Glass morphism effect */
.glass-effect {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
}
```

## 🚦 Git Workflow

### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit Messages
Follow conventional commits:
```
feat: add bus status notifications
fix: resolve map rendering issue
docs: update API documentation
style: improve button hover effects
refactor: extract common utilities
```

## 📊 Code Review

### Review Checklist
- [ ] Code follows project standards
- [ ] TypeScript types are proper
- [ ] Components are reusable
- [ ] Error handling implemented
- [ ] Performance considerations
- [ ] Security implications reviewed

### Review Guidelines
- Be constructive and helpful
- Explain the "why" behind suggestions
- Test the changes locally
- Check for accessibility
- Verify responsive design

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority:high` - High priority items
- `ui/ux` - User interface improvements

## 🌟 Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes
- Invited to the maintainers team (for regular contributors)

## 📞 Getting Help

- 💬 GitHub Discussions for questions
- 🐛 GitHub Issues for bugs
- 📧 Email maintainers for private concerns
- 📖 Check existing documentation first

## 🎯 Project Goals

Help us build:
- Safe and reliable school transportation
- Modern, user-friendly interfaces
- Scalable and maintainable code
- Accessible applications for all users

Thank you for contributing to safer school transportation! 🚌✨