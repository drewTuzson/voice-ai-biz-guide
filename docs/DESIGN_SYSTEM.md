# Clarity Design System

## Brand Identity

### Logo Concept
- **Symbol**: Stylized sound wave that transforms into a lightbulb
- **Representation**: Voice input transforming into bright ideas
- **Variations**: Full logo, icon-only, monochrome versions
- **Usage**: Responsive sizing for web, mobile, and print applications

### Tagline
**Primary**: "AI insights, simply spoken"
**Secondary**: "Your voice, our AI, clear solutions"

### Brand Voice
- **Conversational**: Natural, human-like communication
- **Trustworthy**: Reliable, honest, and transparent
- **Empowering**: Confident without being overwhelming
- **Accessible**: Simple language, avoiding jargon

## Color Palette

### Primary Colors
```css
:root {
  --primary: 198 93% 60%;        /* #0EA5E9 Sky Blue */
  --primary-foreground: 0 0% 98%; /* #FAFAFA White */
  --primary-hover: 199 89% 48%;   /* #0284C7 Darker Blue */
}
```

### Secondary Colors
```css
:root {
  --secondary: 210 40% 95%;       /* #F1F5F9 Light Gray */
  --secondary-foreground: 222 84% 5%; /* #0F172A Dark Gray */
  --accent: 4 90% 68%;            /* #FF6B6B Coral */
  --accent-foreground: 0 0% 98%;  /* #FAFAFA White */
}
```

### Semantic Colors
```css
:root {
  --success: 158 64% 52%;         /* #10B981 Green */
  --success-foreground: 0 0% 98%; /* #FAFAFA White */
  --warning: 43 96% 56%;          /* #F59E0B Orange */
  --warning-foreground: 0 0% 98%; /* #FAFAFA White */
  --destructive: 0 84% 60%;       /* #EF4444 Red */
  --destructive-foreground: 0 0% 98%; /* #FAFAFA White */
}
```

### Neutral Scale
```css
:root {
  --background: 0 0% 100%;        /* #FFFFFF White */
  --foreground: 222 84% 5%;       /* #0F172A Dark */
  --muted: 210 40% 95%;           /* #F1F5F9 Light Gray */
  --muted-foreground: 215 16% 47%; /* #64748B Medium Gray */
  --border: 214 32% 91%;          /* #E2E8F0 Border Gray */
  --input: 214 32% 91%;           /* #E2E8F0 Input Border */
  --ring: 198 93% 60%;            /* #0EA5E9 Focus Ring */
}
```

### Dark Mode Variants
```css
.dark {
  --background: 222 84% 5%;       /* #0F172A Dark Blue */
  --foreground: 210 40% 98%;      /* #F8FAFC Light */
  --muted: 217 32% 17%;           /* #1E293B Dark Muted */
  --muted-foreground: 215 20% 65%; /* #94A3B8 Light Gray */
  --border: 217 32% 17%;          /* #1E293B Dark Border */
  --input: 217 32% 17%;           /* #1E293B Dark Input */
  --card: 222 84% 5%;             /* #0F172A Dark Card */
  --card-foreground: 210 40% 98%; /* #F8FAFC Light Text */
}
```

## Typography

### Font Families
```css
:root {
  --font-heading: 'Poppins', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Consolas', monospace;
}
```

### Type Scale
```css
/* Headings */
.text-h1 { font-size: 3rem; line-height: 1.1; font-weight: 700; } /* 48px */
.text-h2 { font-size: 2.5rem; line-height: 1.2; font-weight: 600; } /* 40px */
.text-h3 { font-size: 2rem; line-height: 1.25; font-weight: 600; } /* 32px */
.text-h4 { font-size: 1.5rem; line-height: 1.3; font-weight: 600; } /* 24px */
.text-h5 { font-size: 1.25rem; line-height: 1.4; font-weight: 600; } /* 20px */
.text-h6 { font-size: 1.125rem; line-height: 1.4; font-weight: 600; } /* 18px */

/* Body Text */
.text-lg { font-size: 1.125rem; line-height: 1.6; } /* 18px */
.text-base { font-size: 1rem; line-height: 1.6; } /* 16px */
.text-sm { font-size: 0.875rem; line-height: 1.5; } /* 14px */
.text-xs { font-size: 0.75rem; line-height: 1.4; } /* 12px */
```

### Font Loading Strategy
```css
/* Font display optimization */
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('/fonts/inter-variable.woff2') format('woff2');
}

@font-face {
  font-family: 'Poppins';
  font-display: swap;
  src: url('/fonts/poppins-variable.woff2') format('woff2');
}
```

## Component Library

### Voice Button States

#### Idle State
```css
.voice-button-idle {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: 2px solid transparent;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.voice-button-idle:hover {
  background: hsl(var(--primary-hover));
  transform: scale(1.05);
  box-shadow: 0 10px 25px -5px hsl(var(--primary) / 0.3);
}
```

#### Recording State
```css
.voice-button-recording {
  background: hsl(var(--destructive));
  animation: pulse-record 1.5s ease-in-out infinite;
  transform: scale(1.1);
}

@keyframes pulse-record {
  0%, 100% { box-shadow: 0 0 0 0 hsl(var(--destructive) / 0.7); }
  50% { box-shadow: 0 0 0 20px hsl(var(--destructive) / 0); }
}
```

#### Processing State
```css
.voice-button-processing {
  background: hsl(var(--warning));
  animation: spin 1s linear infinite;
  cursor: not-allowed;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

#### Error State
```css
.voice-button-error {
  background: hsl(var(--destructive));
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

### Card Components

#### Base Card
```css
.card {
  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) - 2px);
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px hsl(var(--foreground) / 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  box-shadow: 0 10px 15px -3px hsl(var(--foreground) / 0.1);
  transform: translateY(-2px);
}
```

#### Question Card
```css
.question-card {
  background: linear-gradient(135deg, 
    hsl(var(--primary) / 0.05) 0%, 
    hsl(var(--accent) / 0.05) 100%);
  border-left: 4px solid hsl(var(--primary));
  padding: 2rem;
  border-radius: var(--radius);
}
```

#### Report Card
```css
.report-card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  overflow: hidden;
  transition: all 0.3s ease;
}

.report-card:hover {
  border-color: hsl(var(--primary));
  box-shadow: 0 20px 25px -5px hsl(var(--primary) / 0.1);
}
```

### Button Variants

#### Primary Button
```css
.btn-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: calc(var(--radius) - 2px);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-primary:hover {
  background: hsl(var(--primary-hover));
  transform: translateY(-1px);
  box-shadow: 0 6px 20px hsl(var(--primary) / 0.3);
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
  padding: 0.75rem 1.5rem;
  border-radius: calc(var(--radius) - 2px);
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: hsl(var(--muted));
  border-color: hsl(var(--primary));
}
```

### Input Components

#### Text Input
```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid hsl(var(--input));
  border-radius: calc(var(--radius) - 2px);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 1rem;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
}
```

#### Voice Input Indicator
```css
.voice-input-indicator {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: hsl(var(--primary) / 0.1);
  border: 1px solid hsl(var(--primary) / 0.3);
  border-radius: calc(var(--radius) - 2px);
  color: hsl(var(--primary));
}

.voice-input-indicator::before {
  content: '';
  width: 8px;
  height: 8px;
  background: hsl(var(--success));
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}
```

## Animations

### Micro-interactions
```css
/* Smooth transitions for all interactive elements */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Hover lift effect */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px hsl(var(--foreground) / 0.1);
}
```

### Page Transitions
```css
/* Fade in animation for page loads */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-enter {
  animation: fadeIn 0.5s ease-out;
}

/* Slide in animation for modals */
@keyframes slideIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-enter {
  animation: slideIn 0.3s ease-out;
}
```

### Loading States
```css
/* Skeleton loading animation */
@keyframes skeleton {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.skeleton {
  background: linear-gradient(90deg, 
    hsl(var(--muted)) 25%, 
    hsl(var(--muted-foreground) / 0.1) 50%, 
    hsl(var(--muted)) 75%);
  background-size: 200px 100%;
  animation: skeleton 1.5s infinite linear;
}

/* Pulse animation for loading states */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
/* Default: Mobile (0px - 639px) */

/* Small tablets and large phones */
@media (min-width: 640px) { /* sm */ }

/* Tablets */
@media (min-width: 768px) { /* md */ }

/* Small laptops */
@media (min-width: 1024px) { /* lg */ }

/* Desktops */
@media (min-width: 1280px) { /* xl */ }

/* Large desktops */
@media (min-width: 1536px) { /* 2xl */ }
```

### Container Queries
```css
/* Container-based responsive design */
.question-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .question-card {
    padding: 2rem;
    font-size: 1.125rem;
  }
}

@container (min-width: 600px) {
  .question-card {
    padding: 3rem;
    font-size: 1.25rem;
  }
}
```

## Accessibility Guidelines

### Color Contrast
- **AA Standard**: Minimum 4.5:1 contrast ratio for normal text
- **AAA Standard**: 7:1 contrast ratio for important text
- **Large Text**: 3:1 minimum for text 18px+ or 14px+ bold

### Focus Management
```css
/* High-contrast focus indicators */
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: calc(var(--radius) - 2px);
}

/* Custom focus styles for interactive elements */
.btn:focus-visible,
.input:focus-visible {
  box-shadow: 0 0 0 2px hsl(var(--background)), 
              0 0 0 4px hsl(var(--ring));
}
```

### Screen Reader Support
```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 9999;
}

.skip-link:focus {
  top: 6px;
}
```

## Usage Guidelines

### Do's
- Use semantic HTML elements for proper structure
- Maintain consistent spacing using the design system scale
- Test all components in both light and dark modes
- Ensure all interactive elements have focus states
- Use the established color palette for consistency

### Don'ts
- Don't use hardcoded colors outside the design system
- Don't create new font sizes without updating the type scale
- Don't ignore keyboard navigation requirements
- Don't use color as the only means of conveying information
- Don't override component styles without considering the design system

### Implementation Example
```tsx
// Good: Using design system components
<Button variant="primary" size="lg" className="hover-lift">
  Start Assessment
</Button>

// Bad: Custom styles outside the system
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Start Assessment
</button>
```