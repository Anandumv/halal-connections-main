# 🎨 Design System - THE BEE HIVE

## 🎯 **Design Philosophy**

### **Customer-Centric Principles**
- **User-First**: Every design decision prioritizes user needs and experience
- **Accessibility**: Inclusive design that works for everyone
- **Performance**: Fast, responsive, and efficient interactions
- **Clarity**: Clear information hierarchy and intuitive navigation
- **Trust**: Professional appearance that builds confidence

### **Design Values**
- **Beautiful**: Visually appealing and emotionally engaging
- **Professional**: Polished and trustworthy appearance
- **Minimal**: Clean, uncluttered, and focused
- **Usable**: Intuitive and easy to use

## 🎨 **Visual Design System**

### **Color Palette**

#### **Primary Colors**
```css
/* Black & Gold Theme */
--primary-black: #000000;
--primary-gold: #F59E0B;
--gold-light: #FCD34D;
--gold-dark: #D97706;
```

#### **Semantic Colors**
```css
/* Success States */
--success: #10B981;
--success-light: #34D399;
--success-dark: #059669;

/* Warning States */
--warning: #F59E0B;
--warning-light: #FCD34D;
--warning-dark: #D97706;

/* Error States */
--error: #EF4444;
--error-light: #F87171;
--error-dark: #DC2626;

/* Information States */
--info: #3B82F6;
--info-light: #60A5FA;
--info-dark: #2563EB;
```

#### **Neutral Colors**
```css
/* Backgrounds */
--bg-primary: #000000;
--bg-secondary: #111111;
--bg-tertiary: #1F1F1F;
--bg-card: rgba(0, 0, 0, 0.8);

/* Text Colors */
--text-primary: #FFFFFF;
--text-secondary: #E5E7EB;
--text-tertiary: #9CA3AF;
--text-muted: #6B7280;
```

### **Typography**

#### **Font Stack**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

#### **Type Scale**
```css
/* Headings */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

#### **Font Weights**
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### **Spacing System**

#### **Spacing Scale**
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### **Border Radius**

#### **Radius Scale**
```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

### **Shadows**

#### **Shadow System**
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-glow: 0 0 20px rgba(245, 158, 11, 0.3);
--shadow-elegant: 0 10px 25px rgba(0, 0, 0, 0.15);
```

## 🧩 **Component Library**

### **Buttons**

#### **Primary Button**
```css
.btn-primary {
  background: linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%);
  color: #000000;
  font-weight: 600;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
}
```

#### **Secondary Button**
```css
.btn-secondary {
  background: transparent;
  color: #F59E0B;
  border: 2px solid rgba(245, 158, 11, 0.5);
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background: rgba(245, 158, 11, 0.1);
  border-color: #F59E0B;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}
```

### **Cards**

#### **Standard Card**
```css
.card {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.card:hover {
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
```

#### **Glass Card**
```css
.glass-card {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(245, 158, 11, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
}
```

### **Inputs**

#### **Text Input**
```css
.input {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.input:focus {
  border-color: #F59E0B;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  outline: none;
}

.input::placeholder {
  color: #6B7280;
}
```

### **Navigation**

#### **Header**
```css
.header {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(245, 158, 11, 0.2);
  position: sticky;
  top: 0;
  z-index: 50;
}
```

## 📱 **Responsive Design**

### **Breakpoints**
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### **Mobile-First Approach**
- Start with mobile design
- Progressive enhancement for larger screens
- Touch-friendly interactions (44px minimum touch targets)
- Readable text sizes (16px minimum)

### **Responsive Patterns**
```css
/* Mobile */
.container {
  padding: 1rem;
  max-width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem;
    max-width: 768px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 2rem;
    max-width: 1024px;
  }
}
```

## 🎭 **Animation & Transitions**

### **Timing Functions**
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### **Duration Scale**
```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 700ms;
```

### **Common Animations**
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}
```

## ♿ **Accessibility Guidelines**

### **Color Contrast**
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text
- Test with color blindness simulators

### **Focus States**
```css
.focus-visible {
  outline: 2px solid #F59E0B;
  outline-offset: 2px;
}
```

### **Keyboard Navigation**
- All interactive elements must be keyboard accessible
- Logical tab order
- Skip links for main content
- ARIA labels for screen readers

### **Screen Reader Support**
```html
<!-- Proper heading hierarchy -->
<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

<!-- Descriptive alt text -->
<img src="profile.jpg" alt="Profile photo of Sarah Ahmed" />

<!-- ARIA labels -->
<button aria-label="Close modal">×</button>
```

## 🎯 **User Experience Principles**

### **Information Architecture**
1. **Clear Hierarchy**: Use typography and spacing to create clear information hierarchy
2. **Progressive Disclosure**: Show essential information first, details on demand
3. **Consistent Navigation**: Use consistent navigation patterns throughout
4. **Breadcrumbs**: Help users understand where they are

### **Interaction Design**
1. **Immediate Feedback**: Provide instant feedback for all user actions
2. **Loading States**: Show loading indicators for async operations
3. **Error Handling**: Clear, helpful error messages
4. **Success States**: Confirm successful actions

### **Content Strategy**
1. **Clear Language**: Use simple, clear language
2. **Actionable Text**: Button text should describe the action
3. **Helpful Descriptions**: Provide context and guidance
4. **Consistent Terminology**: Use consistent terms throughout

## 🔧 **Implementation Guidelines**

### **CSS Organization**
```css
/* 1. Base styles */
@layer base {
  /* Reset and base styles */
}

/* 2. Component styles */
@layer components {
  /* Reusable component styles */
}

/* 3. Utility styles */
@layer utilities {
  /* Utility classes */
}
```

### **Component Structure**
```tsx
// 1. Props interface
interface ComponentProps {
  // Clear, typed props
}

// 2. Component with proper accessibility
export function Component({ ...props }: ComponentProps) {
  return (
    <div 
      role="..." 
      aria-label="..."
      className="..."
    >
      {/* Content */}
    </div>
  );
}
```

### **Testing Checklist**
- [ ] Mobile responsive
- [ ] Keyboard accessible
- [ ] Screen reader compatible
- [ ] High contrast mode
- [ ] Touch-friendly
- [ ] Fast loading
- [ ] Error states handled
- [ ] Loading states shown

## 🚀 **Performance Guidelines**

### **Optimization**
- Lazy load images and components
- Use proper image formats (WebP, AVIF)
- Minimize bundle size
- Optimize animations (use transform/opacity)
- Implement proper caching

### **Loading States**
```tsx
// Skeleton loading
<div className="animate-pulse">
  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
  <div className="h-4 bg-gray-700 rounded w-1/2 mt-2"></div>
</div>
```

---

**This design system ensures every component is beautiful, professional, minimal, and highly usable while maintaining consistency across the entire application.** 