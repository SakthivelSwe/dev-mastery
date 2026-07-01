/**
 * design-system-content.js
 * Missing sections for 17 design-system topics.
 * Keys: visual, realworld, interview, feynman, build, spacedReview
 * Used by: node scripts/writeSections.js design-system
 */
module.exports = {

  'accessibility-system': {
    code: `## CODE

### Level 1 — Beginner: Accessible Button with ARIA
\`\`\`tsx
// Accessible button — the foundation of all interactive components
interface AccessibleButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string; // Required when button has icon-only content
}

export function AccessibleButton({ label, onClick, disabled, ariaLabel }: AccessibleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label} // Screen reader reads this when no visible label
      aria-disabled={disabled}        // Redundant but improves VoiceOver compatibility
      className={disabled ? 'btn btn--disabled' : 'btn'}
    >
      {label}
    </button>
  );
}
\`\`\`

### Level 2 — Intermediate: Skip Links & Focus Management
\`\`\`tsx
// Skip links — first item in DOM, invisible until focused (keyboard users skip nav)
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link" // Positioned off-screen; visible on :focus
      // CSS: .skip-link { position: absolute; top: -40px; } .skip-link:focus { top: 0; }
    >
      Skip to main content
    </a>
  );
}

// Focus trap for modal dialogs — prevents focus escaping to background DOM
import { useEffect, useRef } from 'react';

export function FocusTrap({ children, active }: { children: React.ReactNode; active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Collect all focusable elements inside the trap
    const focusable = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus(); // Move focus inside trap immediately

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [active]);

  return <div ref={containerRef}>{children}</div>;
}
\`\`\`

### Level 3 — Advanced: Accessible Form with Live Validation
\`\`\`tsx
import { useState, useId } from 'react';

interface FormFieldProps {
  label: string;
  type?: string;
  required?: boolean;
  validate?: (value: string) => string | null;
}

export function FormField({ label, type = 'text', required, validate }: FormFieldProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // useId generates stable, unique IDs for aria linkage without collisions
  const fieldId = useId();
  const errorId = useId();
  const descId = useId();

  const handleBlur = () => {
    setTouched(true);
    if (required && !value.trim()) {
      setError(\`\${label} is required\`);
    } else if (validate) {
      setError(validate(value));
    } else {
      setError(null);
    }
  };

  return (
    <div className="form-field" role="group">
      <label htmlFor={fieldId} className={required ? 'label label--required' : 'label'}>
        {label}
        {required && <span aria-hidden="true"> *</span>} {/* Asterisk is visual only */}
      </label>
      <span id={descId} className="field-hint">
        {required ? 'Required field' : 'Optional'}
      </span>
      <input
        id={fieldId}
        type={type}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        required={required}
        aria-required={required}
        aria-invalid={touched && error ? 'true' : 'false'} // Screen readers announce invalid state
        aria-describedby={\`\${descId} \${error ? errorId : ''}\`.trim()} // Chain IDs with space
        className={touched && error ? 'input input--error' : 'input'}
      />
      {/* aria-live region: screen reader announces error without focus change */}
      {touched && error && (
        <span id={errorId} role="alert" aria-live="polite" className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}
\`\`\`

### Level 4 — Expert / Production: Full A11y Component Audit System
\`\`\`tsx
import { useEffect, useRef, useCallback } from 'react';
import axe from 'axe-core'; // npm install axe-core

// Production: automatically audit components in dev/test environments
type A11yViolation = { id: string; impact: string; description: string; nodes: number };

interface UseA11yAuditOptions {
  enabled?: boolean;    // Only run in dev/test
  onViolation?: (violations: A11yViolation[]) => void;
}

export function useA11yAudit(options: UseA11yAuditOptions = {}) {
  const { enabled = process.env.NODE_ENV !== 'production', onViolation } = options;
  const containerRef = useRef<HTMLElement>(null);

  const runAudit = useCallback(async () => {
    if (!enabled || !containerRef.current) return;
    try {
      const results = await axe.run(containerRef.current, {
        rules: {
          'color-contrast': { enabled: true },
          'label': { enabled: true },
          'aria-required-attr': { enabled: true },
          'keyboard': { enabled: true },
        },
      });

      const violations: A11yViolation[] = results.violations.map(v => ({
        id: v.id,
        impact: v.impact ?? 'unknown',
        description: v.description,
        nodes: v.nodes.length,
      }));

      if (violations.length > 0) {
        console.group('%c♿ A11y Violations', 'color: red; font-weight: bold');
        violations.forEach(v => {
          console.warn(\`[\${v.impact.toUpperCase()}] \${v.id}: \${v.description} (\${v.nodes} node(s))\`);
        });
        console.groupEnd();
        onViolation?.(violations);
      }
    } catch (err) {
      console.error('axe audit failed:', err);
    }
  }, [enabled, onViolation]);

  useEffect(() => {
    // Debounce to avoid auditing during rapid re-renders
    const timer = setTimeout(runAudit, 300);
    return () => clearTimeout(timer);
  });

  return containerRef;
}

// Wrapper component: wraps any subtree, runs live audit in dev
export function A11yBoundary({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useA11yAudit({
    onViolation: (violations) => {
      if (process.env.VITEST || process.env.JEST_WORKER_ID) {
        // In tests: fail the test on violations
        throw new Error(\`A11y violations in "\${label}": \${violations.map(v => v.id).join(', ')}\`);
      }
    },
  });

  return (
    <section ref={ref as React.RefObject<HTMLElement>} aria-label={label}>
      {children}
    </section>
  );
}

// Example: wrap your Storybook stories or test renders
export function AccessibleFormDemo() {
  return (
    <A11yBoundary label="User Registration Form">
      <form>
        <FormField label="Email" type="email" required validate={v =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Enter a valid email address'
        } />
        <FormField label="Username" required validate={v =>
          v.length >= 3 ? null : 'Username must be at least 3 characters'
        } />
        <AccessibleButton label="Create Account" onClick={() => {}} />
      </form>
    </A11yBoundary>
  );
}
\`\`\``,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "ConceptMap", "state": "design-system-accessibility" }
\`\`\``,

    realworld: `## REAL_WORLD

### How the UK Government Design System Enforces Accessibility

The GOV.UK Design System (used by 800+ government services serving 66M citizens) mandates WCAG 2.1 AA compliance for every component. Before their systematic approach, individual teams interpreted "accessible" differently — some skipped focus indicators, others used placeholder text as labels. The failure cost was real: screen-reader users filed 11,000 accessibility complaints in one year. Their solution: bake a11y into Storybook stories with automated axe-core checks, forcing every component PR to pass before merge.

\`\`\`tsx
// Production pattern — GOV.UK style accessibility enforcement
// Context: Every interactive component ships with a11y props contract

interface AccessibleButtonProps {
  label: string;          // Visible label OR aria-label if icon-only
  ariaLabel?: string;     // Override for icon-only buttons — REQUIRED if no label text
  ariaDescribedBy?: string; // Links to helper text element ID
  disabled?: boolean;
  onClick: () => void;
}

// ❌ DANGEROUS — passes visual review but fails screen readers
<button onClick={handleDelete}>
  <TrashIcon />
</button>

// ✅ PRODUCTION-SAFE — axe-core passes, VoiceOver reads "Delete item, button"
<button
  aria-label="Delete item"
  aria-describedby="delete-confirm-hint"
  onClick={handleDelete}
>
  <TrashIcon aria-hidden="true" /> {/* aria-hidden hides decorative icon from SR */}
</button>
<span id="delete-confirm-hint" className="sr-only">
  This action cannot be undone.
</span>
\`\`\`

### Production Gotcha: Focus Trap in Modals
\`\`\`tsx
// ❌ Modal opens but focus stays on trigger — keyboard user can't reach modal content
<Modal isOpen={open}><form>...</form></Modal>

// ✅ Use focus-trap-react or manual tabIndex management
<FocusTrap active={open} focusTrapOptions={{ initialFocus: '#modal-heading' }}>
  <Modal role="dialog" aria-modal="true" aria-labelledby="modal-heading">
    <h2 id="modal-heading">Confirm Delete</h2>
    <form>...</form>
  </Modal>
</FocusTrap>
\`\`\`
**Why it happens:** The browser moves focus to the document body when a modal opens unless focus is programmatically moved into the modal. Screen reader and keyboard users then cannot navigate the modal content.

### Performance Characteristics
| Check | Tool | Cost |
|-------|------|------|
| Automated a11y | axe-core | < 5ms per component |
| Contrast ratio | WCAG AA: 4.5:1 | Static analysis |
| Focus order | Manual + axe | Per page |`,

    interview: `## INTERVIEW

**Q1 (Junior): What does WCAG 2.1 AA require for colour contrast?**
A: WCAG 2.1 AA requires a contrast ratio of at least 4.5:1 for normal text (below 18pt) and 3:1 for large text (18pt+ or 14pt bold). This means the foreground colour and background colour, when run through the luminance formula, must produce a ratio meeting those thresholds. In practice, a light grey (#767676) on white (#ffffff) fails at 4.48:1, which is why many design systems reject "subtle" text styles — they look fine visually but fail automated compliance checks and real users with low vision.

**Q2 (Junior): What is the difference between aria-label and aria-labelledby?**
A: \`aria-label\` provides an inline accessible name directly on the element (e.g. \`aria-label="Close"\`), while \`aria-labelledby\` references another element's ID to use its text as the accessible name (e.g. \`aria-labelledby="dialog-title"\`). Use \`aria-labelledby\` when a visible label already exists in the DOM — it stays in sync automatically when the referenced text changes. Use \`aria-label\` for icon-only controls where no visible text label exists.

**Q3 (Mid): Explain the four WCAG principles (POUR).**
A: POUR stands for Perceivable (content is available to all senses — captions, alt text), Operable (UI is navigable by keyboard and pointer — focus management, timing), Understandable (language is clear, errors are described, behaviour is predictable — form validation), and Robust (content works with current and future assistive technologies — valid HTML semantics). A design system failing any one principle can systematically exclude millions of users across every product that consumes it.

**Q4 (Mid): What is focus management and when must you implement it?**
A: Focus management is programmatically moving browser focus to the correct element when the UI changes dynamically. Required on: modal open (move focus into modal), modal close (return focus to trigger), route change in SPAs (move to page heading or \`main\`), and toast/notification appearance (announce via live region, not forced focus). Without it, keyboard users lose their place in the DOM or become trapped outside interactive regions.

**Q5 (Senior): How do you audit and enforce accessibility at scale across a design system?**
A: Enforce at three layers — automated (axe-core in Storybook/Jest, Playwright accessibility checks in CI), semi-automated (eslint-plugin-jsx-a11y for static analysis on every PR), and manual (quarterly keyboard + screen-reader sessions with real AT). Write accessibility specifications as part of the component API contract (required vs optional aria props), and fail PRs that reduce axe scores. The key insight: accessibility debt is invisible until a legal complaint or a major user drops off — systematic enforcement finds violations in hours that manual review misses.

**Q6 (Senior): What is a "skip link" and why does every multi-page site need one?**
A: A skip link is a visually-hidden anchor at the very top of every page that becomes visible on focus and jumps the keyboard user directly to \`main\` content, bypassing repeated navigation. Without it, keyboard users must tab through every nav item on every page — 30+ tabs before reaching content. The implementation is trivial (\`<a href="#main" class="sr-only focus:not-sr-only">Skip to main content</a>\`) but its absence is an automatic WCAG 2.4.1 failure that appears in every automated audit.`,

    feynman: `## FEYNMAN CHECK

### Explain Accessibility Systems Like I'm 10 Years Old
> Imagine your favourite app, but you can't see the screen — you only hear a robot reading it aloud. Accessibility means making sure that robot reads the right things in the right order, and that every button has a name so you know what it does. A design system builds accessibility IN from the start — like building ramps into a building's blueprints, not adding them after. The non-obvious part: semantic HTML is free accessibility — a \`<button>\` automatically gets keyboard focus, enter/space activation, and a role of "button" announced by screen readers, while a styled \`<div onClick>\` gets none of that. This is why "just use a div" costs an engineer two hours fixing what HTML gave you for free.

---

### 5 Deep Conceptual Questions

**Q1: Why is accessibility a design system concern, not just each app's concern?**
> **A:** A design system's components are consumed by dozens of teams building hundreds of screens. An inaccessible Button component propagates the same violation across every product simultaneously. Fixing it at the design system level fixes it everywhere in one PR; leaving it unfixed means each team must independently patch the same bug. This multiplicative factor makes accessibility investment in a design system the highest-leverage a11y work in an organisation.

**Q2: What is the ONE mental model for accessible components?**
> **A:** "Every interactive element needs: a role (what is it?), a name (what does it do?), and a state (is it pressed/expanded/disabled?)." This is the accessible name/role/state triad. Role comes from semantic HTML or ARIA. Name comes from visible label, aria-label, or aria-labelledby. State comes from aria-* attributes or native HTML state. If any of the three is missing, the element is broken for assistive technology.

**Q3: Most dangerous misconception with code.**
> **A:** "Automated tests catch all accessibility issues."
> \`\`\`tsx
> // ❌ axe-core passes this — no ARIA violations
> <div onClick={handleSubmit} className="btn">Submit</div>
>
> // Problems axe misses: not keyboard-focusable, no Enter key handler,
> // no role="button", breaks on iOS VoiceOver
>
> // ✅ Semantic HTML — free keyboard, role, activation
> <button type="submit" onClick={handleSubmit}>Submit</button>
> \`\`\`

**Q4: How does colour contrast interact with theming at a system level?**
> **A:** When a design system supports theming (light/dark/brand), every colour token combination must independently meet contrast ratios. A token pair that passes in light mode may fail in dark mode if the background shifts from white to a mid-tone grey. The correct pattern: define semantic pairs (e.g. \`textPrimary\`/\`surfacePrimary\`) and verify contrast for EVERY theme at token definition time, not at component use time.

**Q5: One-sentence senior definition.**
> **A:** "An accessible design system encodes WCAG compliance as component API contracts — role, name, state, focus, and contrast — so that accessibility is opt-out impossible rather than opt-in optional across every consuming product."`,

    build: `## BUILD

### 🏗️ Mini Project: Accessible Icon Button Component

**What you will build:** A fully accessible icon-only button that passes axe-core, keyboard navigation, and VoiceOver testing.
**Why this project:** Forces you to understand the difference between decorative and meaningful icons, focus styling, and aria-label requirements.
**Time estimate:** 30 minutes

---

#### Step 1 — Project Setup
\`\`\`bash
mkdir a11y-button && cd a11y-button
npx create-next-app@latest . --typescript --tailwind --no-src-dir --app
npm install @axe-core/react
touch components/IconButton.tsx components/IconButton.test.tsx
\`\`\`

#### Step 2 — Core Implementation
\`\`\`tsx
// components/IconButton.tsx
// Accessible icon-only button — passes WCAG 2.1 AA + axe-core

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;           // Accessible name — REQUIRED for icon-only buttons
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
}

export function IconButton({
  icon,
  label,
  onClick,
  disabled = false,
  variant = 'ghost',
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}          // Screen readers announce this name
      disabled={disabled}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center rounded-md p-2',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-blue-600',  // WCAG 2.4.11 focus appearance
        variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'text-gray-700 hover:bg-gray-100',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {/* aria-hidden hides decorative icon — label already names it */}
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
\`\`\`

#### Step 4 — Error Handling & Edge Cases
\`\`\`tsx
// Enforce label is non-empty at TypeScript level
type NonEmptyString = string & { readonly __brand: 'NonEmpty' };

function requireLabel(label: string): NonEmptyString {
  if (!label.trim()) throw new Error('IconButton: label must not be empty');
  return label as NonEmptyString;
}
\`\`\`

#### Step 5 — Tests
\`\`\`tsx
// components/IconButton.test.tsx
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { IconButton } from './IconButton';

const TestIcon = () => <svg aria-hidden="true"><path /></svg>;

test('has accessible name from label', () => {
  render(<IconButton icon={<TestIcon />} label="Close dialog" onClick={() => {}} />);
  expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
});

test('passes axe accessibility check', async () => {
  const { container } = render(
    <IconButton icon={<TestIcon />} label="Delete item" onClick={() => {}} />
  );
  expect(await axe(container)).toHaveNoViolations();
});

test('is focusable by keyboard', () => {
  render(<IconButton icon={<TestIcon />} label="Edit" onClick={() => {}} />);
  const btn = screen.getByRole('button');
  btn.focus();
  expect(document.activeElement).toBe(btn);
});

test('disabled button cannot be activated', () => {
  const handler = jest.fn();
  render(<IconButton icon={<TestIcon />} label="Submit" onClick={handler} disabled />);
  screen.getByRole('button').click();
  expect(handler).not.toHaveBeenCalled();
});
\`\`\`

**Expected Output:**
\`\`\`
✓ has accessible name from label
✓ passes axe accessibility check
✓ is focusable by keyboard
✓ disabled button cannot be activated
\`\`\`

**Stretch Challenges:**
- [ ] Add tooltip on hover/focus that shows the aria-label visually
- [ ] Test with a real screen reader (VoiceOver/NVDA) and document what you hear
- [ ] Add \`aria-pressed\` state for toggle icon buttons`,

    spacedReview: `## SPACED REVIEW

> **How to use:** Answer each question from memory before reading ahead. Review at Day 1 → 3 → 7 → 14 intervals.

---

### Day 1 — Recall

**Q1:** Name the POUR principles and give one concrete design system violation for each.

**Q2:** What three things does every interactive element need for assistive technology? What breaks when each is missing?

**Q3:** Write a 10-line accessible icon button in JSX with correct ARIA. No IDE.

---

### Day 3 — Comprehension

**Q4:** What is the difference between \`aria-label\`, \`aria-labelledby\`, and \`aria-describedby\`? Give one use case where each is the right choice.

**Q5:** A developer replaces a \`<button>\` with a styled \`<div onClick>\`. List all the accessibility features that break and how to fix each.

**Q6:** Refactor this code to be accessible:
\`\`\`tsx
<div className="modal" style={{ display: open ? 'block' : 'none' }}>
  <div onClick={onClose} className="close-btn">×</div>
  <h2>Confirm Action</h2>
</div>
\`\`\`

---

### Day 7 — Application

**Q7:** Build a focus trap from scratch in vanilla JS. It must: trap Tab/Shift+Tab within a container, return focus on close, and skip disabled elements.

**Q8:** You are reviewing a PR that adds 20 new components to a design system. None have axe-core tests. Describe the accessibility debt being created, the failure modes at scale, and what CI enforcement you'd add.

**Q9:** What is the minimum contrast ratio for normal text under WCAG AA? Under WCAG AAA? How do you verify it programmatically?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ "How would you retrofit accessibility into a design system of 50 components that was built without a11y in mind? What is the order of operations, and how do you measure progress?"

**Q11:** Map accessibility to: semantic HTML, design tokens (colour), focus management, ARIA, keyboard interaction patterns — which is the foundation and which builds on it?

**Q12:** ★ "Your design system serves 200 product teams. An audit finds that 60% of pages fail WCAG 2.1 AA contrast. The failures trace back to 3 token pairs. How do you fix this without breaking existing products, and what process prevents it recurring?"`
  },

  'button-component': {
    code: `## CODE

### Level 1 — Beginner: Polymorphic Button with Variants
\`\`\`tsx
// A button with the 3 most common variants — covers 80% of real-world use
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};
const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

export function Button({ variant = 'primary', size = 'md', isLoading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={\`btn \${variantClasses[variant]} \${sizeClasses[size]} focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md transition-colors\`}
    >
      {isLoading ? <span aria-hidden="true">⏳</span> : null}
      {children}
    </button>
  );
}
\`\`\`

### Level 2 — Intermediate: Icon Button & Button Group
\`\`\`tsx
import { forwardRef } from 'react';

// forwardRef — allows parent to ref the DOM button (for focus management, animations)
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button ref={ref} {...props} className={\`btn btn--\${variant} btn--\${size}\`}>
        {leftIcon && <span className="btn__icon btn__icon--left" aria-hidden="true">{leftIcon}</span>}
        <span className="btn__label">{children}</span>
        {rightIcon && <span className="btn__icon btn__icon--right" aria-hidden="true">{rightIcon}</span>}
        {isLoading && <span className="btn__spinner" aria-label="Loading" role="status" />}
      </button>
    );
  }
);
Button.displayName = 'Button'; // Required for React DevTools when using forwardRef

// ButtonGroup — enforces single-selection semantics (radio group pattern)
interface ButtonGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}
export function ButtonGroup({ value, onChange, options }: ButtonGroupProps) {
  return (
    <div role="group" className="btn-group">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value} // Pressed state for toggle buttons
          className={\`btn-group__item \${value === opt.value ? 'btn-group__item--active' : ''}\`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
\`\`\`

### Level 3 — Advanced: Polymorphic Button (renders as <a> or <button>)
\`\`\`tsx
// The "as" pattern — component renders different HTML element based on props
// Used by: Radix UI, Chakra, MUI, every serious design system
type AsProps<T extends React.ElementType> = {
  as?: T;
} & React.ComponentPropsWithRef<T>;

type PolymorphicButtonProps<T extends React.ElementType = 'button'> = AsProps<T> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

export function PolymorphicButton<T extends React.ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  ...props
}: PolymorphicButtonProps<T>) {
  const Component = as ?? 'button'; // Default is <button>, but can be 'a', Link, etc.

  // Ensure <a> elements have href; <button> elements have type="button"
  const safeProps = Component === 'button'
    ? { type: 'button' as const, ...props }
    : props;

  return (
    <Component
      {...safeProps}
      aria-busy={isLoading}
      className={\`btn btn--\${variant} btn--\${size}\`}
    >
      {children}
    </Component>
  );
}

// Usage: renders as anchor when navigating, button when acting
// <PolymorphicButton as="a" href="/checkout" variant="primary">Checkout</PolymorphicButton>
// <PolymorphicButton onClick={handleSave} variant="secondary">Save</PolymorphicButton>
\`\`\`

### Level 4 — Expert / Production: Full Button System with CVA
\`\`\`tsx
import { cva, type VariantProps } from 'class-variance-authority'; // npm install class-variance-authority
import { forwardRef, useRef, useImperativeHandle } from 'react';

// CVA — compile-time variant composition; eliminates className concatenation bugs
const buttonVariants = cva(
  // Base styles applied to ALL buttons
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:   'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:     'hover:bg-accent hover:text-accent-foreground',
        danger:    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link:      'text-primary underline-offset-4 hover:underline h-auto p-0',
      },
      size: {
        sm:   'h-8 px-3 text-xs',
        md:   'h-10 px-4 text-sm',
        lg:   'h-12 px-6 text-base',
        icon: 'h-10 w-10',      // Square button for icon-only
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

interface ButtonHandle {
  focus: () => void;
  click: () => void;
}

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
}

export const Button = forwardRef<ButtonHandle, ButtonProps>(
  ({ variant, size, isLoading, leftIcon, rightIcon, loadingText, children, className, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Expose imperative handle — lets parent call button.focus() or button.click()
    useImperativeHandle(ref, () => ({
      focus: () => buttonRef.current?.focus(),
      click: () => buttonRef.current?.click(),
    }));

    return (
      <button
        ref={buttonRef}
        {...props}
        disabled={props.disabled || isLoading}
        aria-busy={isLoading}
        aria-label={isLoading && loadingText ? loadingText : props['aria-label']}
        className={buttonVariants({ variant, size, className })}
      >
        {isLoading
          ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" aria-hidden="true" />
          : leftIcon && <span aria-hidden="true">{leftIcon}</span>
        }
        <span>{isLoading && loadingText ? loadingText : children}</span>
        {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { buttonVariants };
export type { ButtonProps };
\`\`\``,

    realworld: `## REAL_WORLD

### How Shopify Polaris Implements the Button Component

Shopify's Polaris design system serves thousands of app developers building on the Shopify App Store. Their Button component is consumed directly in 400+ apps — a bug or missing prop propagates to millions of merchant-facing UIs within hours of publishing. Polaris encodes every button variant (primary, secondary, destructive, plain, monochrome) as a single component with a strict prop API, preventing teams from one-off styling that diverges from the system.

\`\`\`tsx
// Production pattern — Polaris-style Button component
// Context: Supports all variants, loading states, icons, and full a11y

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive' | 'plain';
  size?: 'slim' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;          // Shows spinner, aria-busy=true, prevents double-click
  fullWidth?: boolean;
  icon?: React.ReactNode;     // Leading icon
  iconRight?: React.ReactNode; // Trailing icon (e.g. external link)
  url?: string;               // Render as <a> when href provided
  onClick?: () => void;
  ariaLabel?: string;         // Required for icon-only usage
  submit?: boolean;           // type="submit" for forms
}

export function Button({
  children,
  variant = 'secondary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconRight,
  url,
  onClick,
  ariaLabel,
  submit = false,
}: ButtonProps) {
  const Tag = url ? 'a' : 'button';
  const isDisabled = disabled || loading;

  return (
    <Tag
      href={url}
      type={!url ? (submit ? 'submit' : 'button') : undefined}
      disabled={!url ? isDisabled : undefined}
      aria-disabled={url && isDisabled ? true : undefined}
      aria-busy={loading ? true : undefined}  // Announces loading to SR
      aria-label={ariaLabel}
      onClick={!isDisabled ? onClick : undefined}
      className={buttonClasses({ variant, size, fullWidth, loading })}
    >
      {loading && <Spinner size="small" aria-hidden="true" />}
      {icon && <span aria-hidden="true" className="btn-icon-leading">{icon}</span>}
      {children}
      {iconRight && <span aria-hidden="true" className="btn-icon-trailing">{iconRight}</span>}
    </Tag>
  );
}
\`\`\`

### Production Gotcha: Double-Submit on Slow Networks
\`\`\`tsx
// ❌ No loading state — user clicks 3× on slow network, submits order 3 times
<Button onClick={submitOrder}>Place Order</Button>

// ✅ Loading state prevents double-click and communicates to screen readers
const [isSubmitting, setIsSubmitting] = useState(false);
async function submitOrder() {
  setIsSubmitting(true);
  try { await placeOrder(); } finally { setIsSubmitting(false); }
}
<Button loading={isSubmitting} disabled={isSubmitting} onClick={submitOrder}>
  Place Order
</Button>
\`\`\`
**Why it happens:** Without a loading state the button remains interactive between click and response, and eager users click again. On e-commerce sites this causes duplicate charges.

### Performance Characteristics
| Operation | Cost | Notes |
|-----------|------|-------|
| Render | ~0.1ms | Pure presentation |
| Click handler | Dependent on handler | Debounce if expensive |
| Loading spinner | ~0ms CSS animation | GPU-composited |`,

    interview: `## INTERVIEW

**Q1 (Junior): What is the minimum prop surface a production Button component needs?**
A: At minimum: \`children\` (label), \`onClick\` (handler), \`variant\` (primary/secondary/destructive), \`disabled\`, and \`type\` (button/submit/reset — defaults to "button" to prevent accidental form submission). In practice, loading, fullWidth, size, and ariaLabel are needed immediately. The key insight is that \`type="button"\` must be the default — every button inside a \`<form>\` without an explicit type defaults to \`type="submit"\`, which is a common and hard-to-debug source of accidental form submissions.

**Q2 (Junior): Why should a Button component render as an \`<a\` tag when given a URL?**
A: Semantic HTML links (\`<a href>\`) and buttons serve different interaction models — links navigate, buttons perform actions. Screen readers announce them differently ("link" vs "button"), right-click context menus differ (open in new tab exists for links, not buttons), and keyboard behaviour differs (Enter activates links, Space+Enter activates buttons). Rendering a Button as an \`<a>\` when a URL is passed preserves these semantics without requiring two separate components.

**Q3 (Mid): How do you implement a loading state that is accessible to screen readers?**
A: Use \`aria-busy="true"\` on the button while loading — screen readers announce "loading" state changes. Also set \`disabled\` or \`aria-disabled\` to prevent double-activation and update button text if possible (e.g. "Saving…"). Do not remove the button from the DOM — that loses the user's focus position. The combination of visual spinner + \`aria-busy\` + \`aria-label\` update gives both sighted and AT users clear feedback.

**Q4 (Mid): When should a Button variant be "destructive" and what does it communicate?**
A: Destructive variant signals an irreversible or high-risk action (delete, cancel subscription, remove access). It should always be paired with a confirmation step — the visual red colour is a secondary reinforcement, not the primary safeguard, since ~8% of users are colour-blind. The design system's contract: destructive buttons should never be the primary/most prominent action, should require confirmation for data loss, and should never auto-trigger.

**Q5 (Senior): How do you version a Button component API without breaking downstream consumers?**
A: Add new props with defaults that preserve existing behaviour (additive-only changes); deprecate old props with console.warn rather than removing them; use semantic versioning (major bump only for breaking changes like removing a variant). For a 200-team org: publish a migration codemod (\`jscodeshift\`) that auto-updates import paths and prop renames. The non-obvious cost: every breaking Button change forces a coordinated upgrade across all consuming apps — which is why strict backward compatibility dramatically outweighs the aesthetic benefit of cleaning up old props.`,

    feynman: `## FEYNMAN CHECK

### Explain Button Components Like I'm 10 Years Old
> A Button component is like a universal TV remote: instead of every team wiring their own remote from scratch (some buttons break, some don't work in the dark, some have no off switch), the design system gives everyone the same remote that already works for everything. The non-obvious part: the remote has modes — primary (big red ON button), secondary (normal), destructive (eject that might break something). The variant prop is what selects the mode, and the component encodes all the rules about what each mode looks like and behaves. This is why "just style a div" multiplies into 47 slightly different blue buttons across the app.

---

### 5 Deep Conceptual Questions

**Q1: Why does a design system Button need a loading state in its contract?**
> **A:** Without a centralised loading state, each team implements their own spinner+disable pattern inconsistently. Some forget to disable the button (duplicate orders), some forget aria-busy (SR users don't know it's loading), some use different spinners (visual inconsistency). Baking loading into the Button API ensures every action button is protected against double-submission and communicates state to all users.

**Q2: What is the ONE mental model for Button variants?**
> **A:** "Variant = visual prominence + semantic intent." Primary = one per screen, most important action. Secondary = standard action. Destructive = irreversible/risky. Plain = low-emphasis inline. Each maps to a specific colour, weight, and accessibility contract. Never choose a variant for aesthetics alone.

**Q3: Most dangerous misconception with code.**
> **A:** Thinking a \`<button>\` inside a \`<form>\` is safe without an explicit type.
> \`\`\`tsx
> // ❌ type defaults to "submit" — clicking "Cancel" submits the form
> <form onSubmit={handleSave}>
>   <Button onClick={handleCancel}>Cancel</Button>
>   <Button onClick={handleSave}>Save</Button>
> </form>
>
> // ✅ Explicit type prevents accidental submission
> <Button type="button" onClick={handleCancel}>Cancel</Button>
> <Button type="submit" onClick={handleSave}>Save</Button>
> \`\`\`

**Q4: How does the Button component interact with form validation?**
> **A:** A \`type="submit"\` button triggers HTML5 native validation on the form before the \`onSubmit\` handler fires. This means the design system Button must not call \`event.preventDefault()\` internally for submit buttons, and must not set \`disabled\` on submission before validation runs. The Button also inherits the form's \`disabled\` state via \`fieldset[disabled]\` — which is why buttons inside disabled fieldsets must still be visually correct.

**Q5: Senior one-liner.**
> **A:** "A Button component is a semantic contract that encodes variant→visual+intent, type→form-interaction, loading→aria-busy+disabled, and icon placement — so 200 teams make the same correct choices without knowing the implementation."`,

    build: `## BUILD

### 🏗️ Mini Project: Button Component with Full Variant System

**What you will build:** A production-grade Button supporting 4 variants, loading state, icon slots, and a11y — passing axe-core tests.
**Why this project:** Forces you to handle the type/form interaction, loading+disabled semantics, and icon a11y simultaneously.
**Time estimate:** 45 minutes

---

#### Step 1 — Project Setup
\`\`\`bash
mkdir btn-system && cd btn-system
npx create-next-app@latest . --typescript --tailwind --no-src-dir --app
npm install jest-axe @testing-library/react @testing-library/jest-dom
touch components/Button.tsx components/Button.test.tsx
\`\`\`

#### Step 2 — Core Implementation
\`\`\`tsx
// components/Button.tsx
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'destructive' | 'plain';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:     'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600',
  secondary:   'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  plain:       'text-blue-600 hover:underline bg-transparent',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant='secondary', size='md', loading=false, fullWidth=false,
     leadingIcon, children, disabled, type='button', ...rest }, ref) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={[
          'inline-flex items-center justify-center gap-2 rounded-md font-medium',
          'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          isDisabled ? 'opacity-50 cursor-not-allowed' : '',
        ].filter(Boolean).join(' ')}
        {...rest}
      >
        {loading
          ? <span aria-hidden="true" className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          : leadingIcon && <span aria-hidden="true">{leadingIcon}</span>
        }
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
\`\`\`

#### Step 4 — Error Handling & Edge Cases
\`\`\`tsx
// Prevent double-click on loading state — critical for payment flows
<Button
  loading={isProcessing}
  onClick={async () => {
    if (isProcessing) return; // Guard even if disabled is bypassed
    setIsProcessing(true);
    try { await processPayment(); }
    catch (e) { setError(String(e)); }
    finally { setIsProcessing(false); }
  }}
>
  Pay $49.99
</Button>
\`\`\`

#### Step 5 — Tests
\`\`\`tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from './Button';

test('renders all variants without a11y violations', async () => {
  const { container } = render(
    <div>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="plain">Learn more</Button>
    </div>
  );
  expect(await axe(container)).toHaveNoViolations();
});

test('loading state sets aria-busy and prevents click', () => {
  const handler = jest.fn();
  render(<Button loading onClick={handler}>Save</Button>);
  const btn = screen.getByRole('button');
  expect(btn).toHaveAttribute('aria-busy', 'true');
  fireEvent.click(btn);
  expect(handler).not.toHaveBeenCalled();
});

test('defaults to type=button to prevent accidental form submit', () => {
  render(<Button>Cancel</Button>);
  expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
});
\`\`\`

**Expected Output:**
\`\`\`
✓ renders all variants without a11y violations
✓ loading state sets aria-busy and prevents click
✓ defaults to type=button to prevent accidental form submit
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** List the 5 props every production Button needs at minimum and why each exists.
**Q2:** Why must Button default to \`type="button"\` not \`type="submit"\`? What breaks if it doesn't?
**Q3:** Write a 15-line Button component in TSX with primary/secondary variants.

### Day 3 — Comprehension
**Q4:** What is the difference between \`disabled\` and \`aria-disabled\`? When do you use each?
**Q5:** Show the double-submit bug and the loading-state fix with code.
**Q6:** Refactor this component to be accessible and production-safe:
\`\`\`tsx
<div className="btn btn-red" onClick={deleteUser}>Delete</div>
\`\`\`

### Day 7 — Application
**Q7:** Build a Button that renders as \`<a>\` when a \`url\` prop is provided and as \`<button>\` otherwise, preserving all semantics.
**Q8:** A PR adds 10 icon-only buttons without aria-label. Describe the accessibility failure mode for screen reader users and the fix.
**Q9:** What is the render cost of a Button component? Under what conditions does it cause performance issues?

### Day 14 — Synthesis & Interview Prep
**Q10:** ★ "Design a Button component API for a design system used by 500 developers. What props do you include, what do you exclude, and how do you handle future additions without breaking changes?"
**Q11:** Map Button → Form → Accessibility → Design Tokens — how does each layer depend on the previous?
**Q12:** ★ "Your Button component is used in a payment flow that processes 10M transactions/day. A bug causes double-submissions during loading. How do you diagnose, fix, and prevent this at the design system level?"`
  },

  'color-system': {
    feynman: `## FEYNMAN CHECK

### Explain Color Systems Like I'm 10 Years Old
> A colour system is like a paint factory with a strict naming rule. Instead of 500 different blues that everyone picks from randomly, you have 10 numbered buckets (blue-100 through blue-900) and a set of meaning names (brand-primary, text-danger, surface-warning). Designers pick from meaning names, not raw buckets, so changing the entire brand colour takes one edit instead of finding every place blue-500 was used. The non-obvious part: raw palette tokens (blue-500) and semantic tokens (textPrimary) are two different layers, and confusing them is why dark mode themes break. This is why Tailwind's arbitrary colours make theme switching impossible.

---

### 5 Deep Conceptual Questions

**Q1: What problem does semantic token naming solve that raw palette naming cannot?**
> **A:** Raw palette names (blue-500) describe the colour itself; semantic names (textPrimary, surfaceDanger) describe the role. When you switch to dark mode, \`textPrimary\` points to white instead of near-black — one token change, zero component changes. With raw palette names, every component hardcoded to \`blue-500\` must be manually updated. At 10,000 component usages across a large design system, semantic tokens are the difference between a one-file theme switch and a three-month migration.

**Q2: What is the ONE mental model for a two-layer colour system?**
> **A:** "Layer 1 = the palette (what colours exist as numbered scales); Layer 2 = semantics (what each colour means in context). Components ALWAYS reference Layer 2. Layer 2 references Layer 1. Themes only ever swap Layer 2 mappings." This means a theme is just a mapping file — \`{ textPrimary: gray-900 }\` in light, \`{ textPrimary: gray-100 }\` in dark.

**Q3: Most dangerous misconception with code.**
> **A:** Using raw palette tokens in components — dark mode breaks completely.
> \`\`\`css
> /* ❌ Hardcoded to light theme — dark mode impossible */
> .button { background: var(--blue-600); color: var(--gray-50); }
>
> /* ✅ Semantic reference — theme swap changes behaviour everywhere */
> .button { background: var(--color-interactive-primary); color: var(--color-text-on-primary); }
> \`\`\`

**Q4: How do colour tokens interact with accessibility contrast requirements?**
> **A:** Semantic token pairs (e.g. \`textPrimary\`/\`surfacePrimary\`) must be verified to meet WCAG 4.5:1 contrast in EVERY theme at token definition time. This means the design token pipeline should include automated contrast checks when theme mappings are defined, not left to individual components to verify. The correct pattern: define contrast-safe pairs and encode them as the only allowed text-on-surface combinations.

**Q5: Senior one-liner.**
> **A:** "A colour system separates palette (what exists) from semantics (what it means) so that theming is a mapping change, not a component rewrite — which is why using raw hex or palette tokens in components makes theme switching O(n components) instead of O(1 mapping file)."`,

    build: `## BUILD

### 🏗️ Mini Project: Two-Layer Token System with Dark Mode

**What you will build:** CSS custom properties implementing a palette + semantic layer with automatic dark mode via \`prefers-color-scheme\`.
**Why this project:** Forces you to implement the two-layer separation and verify that zero component changes are needed to switch themes.
**Time estimate:** 30 minutes

---

#### Step 1 — Project Setup
\`\`\`bash
mkdir color-tokens && cd color-tokens
touch tokens.css App.tsx
\`\`\`

#### Step 2 — Core Implementation
\`\`\`css
/* tokens.css */
/* Layer 1: Palette — raw colour scale */
:root {
  --palette-blue-500: #3b82f6;
  --palette-blue-700: #1d4ed8;
  --palette-gray-900: #111827;
  --palette-gray-100: #f3f4f6;
  --palette-red-600:  #dc2626;
  --palette-white:    #ffffff;
}

/* Layer 2: Semantic — light theme */
:root {
  --color-text-primary:       var(--palette-gray-900);
  --color-surface-primary:    var(--palette-white);
  --color-interactive-primary:var(--palette-blue-500);
  --color-interactive-hover:  var(--palette-blue-700);
  --color-text-on-primary:    var(--palette-white);
  --color-feedback-danger:    var(--palette-red-600);
}

/* Layer 2: Semantic — dark theme override */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary:       var(--palette-gray-100);
    --color-surface-primary:    #1f2937; /* palette-gray-800 */
    --color-interactive-primary:var(--palette-blue-500);
    /* blue-500 works on both backgrounds — verify at definition time */
  }
}
\`\`\`

#### Step 4 — Error Handling
\`\`\`ts
// Contrast verification at token definition time (Node.js)
import { getContrastRatio } from 'wcag-contrast';
const pairs = [
  { fg: '#111827', bg: '#ffffff', pair: 'textPrimary/surfacePrimary light' },
  { fg: '#f3f4f6', bg: '#1f2937', pair: 'textPrimary/surfacePrimary dark' },
];
for (const { fg, bg, pair } of pairs) {
  const ratio = getContrastRatio(fg, bg);
  if (ratio < 4.5) throw new Error(\`FAIL: \${pair} = \${ratio.toFixed(2)}:1\`);
  console.log(\`PASS: \${pair} = \${ratio.toFixed(2)}:1\`);
}
\`\`\`

#### Step 5 — Tests
\`\`\`ts
test('all semantic pairs meet WCAG AA', () => {
  const lightPairs = [['#111827','#ffffff'],['#ffffff','#3b82f6']];
  for (const [fg, bg] of lightPairs) {
    expect(getContrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  }
});
\`\`\`

**Expected Output:**
\`\`\`
PASS: textPrimary/surfacePrimary light = 16.10:1
PASS: textPrimary/surfacePrimary dark = 9.73:1
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What are the two layers of a colour token system? What does each layer contain?
**Q2:** Why must components reference semantic tokens, not palette tokens? What breaks at scale?
**Q3:** Write a 10-line CSS custom property setup for a two-layer colour system.

### Day 3 — Comprehension
**Q4:** How does a dark mode theme work with a two-layer system vs a single-layer system?
**Q5:** A component uses \`--palette-blue-500\` directly. What problem does this create for theming?
**Q6:** Refactor this CSS to use semantic tokens: \`button { background: #3b82f6; color: #ffffff; }\`

### Day 7 — Application
**Q7:** Build a theme switcher (light/dark/high-contrast) using only CSS custom property remapping — zero component changes.
**Q8:** A PR ships 30 new components all using raw hex values. Describe the technical debt and migration cost.
**Q9:** What is the WCAG AA contrast ratio requirement? How do you automate verification in CI?

### Day 14 — Synthesis & Interview Prep
**Q10:** ★ "Design a colour token system for a product that needs light, dark, and high-contrast themes, plus white-label brand overrides. What is the token architecture?"
**Q11:** Map colour-tokens → semantic-tokens → component-styles → theme-switching — which layer do themes modify?
**Q12:** ★ "A rebrand changes the primary blue across 500 product screens in 200 team repos. With a proper token system, how many files change? Without one, what is the cost?"`
  },

  'component-api-design': {
    code: `## CODE

### Level 1 — Beginner: Props Contract with TypeScript
\`\`\`tsx
// Explicit props contract — the public API of your component
interface CardProps {
  title: string;          // Required — no default possible without it
  description?: string;   // Optional — component works without it
  imageUrl?: string;      // Optional with conditional rendering
  onAction?: () => void;  // Optional callback — no prop = no button rendered
  variant?: 'default' | 'compact' | 'featured'; // Union type — only valid values
}

export function Card({ title, description, imageUrl, onAction, variant = 'default' }: CardProps) {
  return (
    <div className={\`card card--\${variant}\`}>
      {imageUrl && <img src={imageUrl} alt="" aria-hidden="true" />} {/* Decorative image */}
      <h3 className="card__title">{title}</h3>
      {description && <p className="card__desc">{description}</p>}
      {onAction && <button onClick={onAction} className="card__action">View details</button>}
    </div>
  );
}
\`\`\`

### Level 2 — Intermediate: Compound Component API Pattern
\`\`\`tsx
// Compound components — flexible composition over monolithic props
// Used by: Radix UI, Headless UI, React Aria

interface CardContextValue {
  variant: 'default' | 'compact';
}
const CardContext = React.createContext<CardContextValue>({ variant: 'default' });

function CardRoot({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'compact' }) {
  return (
    <CardContext.Provider value={{ variant }}>
      <article className={\`card card--\${variant}\`}>{children}</article>
    </CardContext.Provider>
  );
}
function CardHeader({ children }: { children: React.ReactNode }) {
  return <header className="card__header">{children}</header>;
}
function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card__body">{children}</div>;
}
function CardFooter({ children }: { children: React.ReactNode }) {
  return <footer className="card__footer">{children}</footer>;
}

// Namespace export — tree-shakeable and self-documenting
export const Card = Object.assign(CardRoot, { Header: CardHeader, Body: CardBody, Footer: CardFooter });

// Usage: <Card><Card.Header>Title</Card.Header><Card.Body>Content</Card.Body></Card>
\`\`\`

### Level 3 — Advanced: Controlled vs Uncontrolled API
\`\`\`tsx
// Support both controlled (state in parent) and uncontrolled (state in component)
// This is how HTML inputs work — and every good component mimics this

interface UseControllableStateOptions<T> {
  value?: T;           // Controlled: parent manages state
  defaultValue?: T;    // Uncontrolled: component manages state with this initial value
  onChange?: (value: T) => void;
}

function useControllableState<T>({ value, defaultValue, onChange }: UseControllableStateOptions<T>) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<T | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const setValue = React.useCallback((newValue: T) => {
    if (!isControlled) setUncontrolledValue(newValue); // Update internal state only when uncontrolled
    onChange?.(newValue); // Always notify parent regardless of controlled mode
  }, [isControlled, onChange]);

  return [currentValue, setValue] as const;
}

interface AccordionProps {
  value?: string;          // Controlled: parent passes current open item
  defaultValue?: string;   // Uncontrolled: default open item
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Accordion({ value, defaultValue, onValueChange, children }: AccordionProps) {
  const [openItem, setOpenItem] = useControllableState({ value, defaultValue, onChange: onValueChange });
  return (
    <div className="accordion">
      <AccordionContext.Provider value={{ openItem, setOpenItem }}>
        {children}
      </AccordionContext.Provider>
    </div>
  );
}
\`\`\`

### Level 4 — Expert / Production: Headless Component with Render Props
\`\`\`tsx
import { useReducer, createContext, useContext, useCallback } from 'react';

// Headless component: provides behaviour, zero UI — consumer owns all markup
// Used by: Radix Primitives, Headless UI, React Aria

type DisclosureState = { isOpen: boolean };
type DisclosureAction = { type: 'open' } | { type: 'close' } | { type: 'toggle' };

function disclosureReducer(state: DisclosureState, action: DisclosureAction): DisclosureState {
  switch (action.type) {
    case 'open':   return { isOpen: true };
    case 'close':  return { isOpen: false };
    case 'toggle': return { isOpen: !state.isOpen };
  }
}

interface DisclosureContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}
const DisclosureContext = createContext<DisclosureContextValue | null>(null);

export function useDisclosure() {
  const ctx = useContext(DisclosureContext);
  if (!ctx) throw new Error('useDisclosure must be used within <Disclosure>');
  return ctx;
}

interface DisclosureRenderProps {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

interface DisclosureProps {
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  children: (props: DisclosureRenderProps) => React.ReactNode;
}

export function Disclosure({ defaultOpen = false, onOpenChange, children }: DisclosureProps) {
  const [state, dispatch] = useReducer(disclosureReducer, { isOpen: defaultOpen });

  const open   = useCallback(() => { dispatch({ type: 'open' });   onOpenChange?.(true);  }, [onOpenChange]);
  const close  = useCallback(() => { dispatch({ type: 'close' });  onOpenChange?.(false); }, [onOpenChange]);
  const toggle = useCallback(() => { dispatch({ type: 'toggle' }); onOpenChange?.(!state.isOpen); }, [state.isOpen, onOpenChange]);

  const value: DisclosureContextValue = { isOpen: state.isOpen, open, close, toggle };

  return (
    <DisclosureContext.Provider value={value}>
      {children({ isOpen: state.isOpen, open, close, toggle })}
    </DisclosureContext.Provider>
  );
}

// Usage — consumer controls all markup:
// <Disclosure defaultOpen={false}>
//   {({ isOpen, toggle }) => (
//     <div>
//       <button onClick={toggle} aria-expanded={isOpen}>FAQ Section</button>
//       {isOpen && <p>Answer content here</p>}
//     </div>
//   )}
// </Disclosure>
\`\`\``,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "ConceptMap", "state": "design-system-component-api" }
\`\`\``,

    realworld: `## REAL_WORLD

### How Radix UI Designs Component APIs

Radix UI (used by Vercel, Linear, Loom) pioneered the "unstyled primitives" API model — components expose behaviour and accessibility only, leaving styling to consumers. Their key innovation is the compound component pattern: \`<Select.Root>\`, \`<Select.Trigger>\`, \`<Select.Content>\` compose together with shared context, giving consumers control over every DOM node while the root manages ARIA relationships automatically.

\`\`\`tsx
// Production pattern — Radix-style compound component API
// Context: Full-control component composition with internal ARIA wiring

// ROOT manages state — isOpen, selectedValue, onValueChange
const SelectContext = React.createContext<SelectContextValue | null>(null);

function SelectRoot({ value, onValueChange, children }: SelectRootProps) {
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      {children}
    </SelectContext.Provider>
  );
}

// TRIGGER composes into root context — aria-expanded mirrors root state
function SelectTrigger({ children, asChild }: SelectTriggerProps) {
  const { open, setOpen, value } = useSelectContext();
  const Comp = asChild ? Slot : 'button';  // asChild lets consumer control tag
  return (
    <Comp
      aria-expanded={open}
      aria-haspopup="listbox"
      onClick={() => setOpen(prev => !prev)}
    >
      {children ?? value}
    </Comp>
  );
}

// Usage — consumer controls every DOM node
<Select.Root value={country} onValueChange={setCountry}>
  <Select.Trigger className="border rounded px-3 py-2">
    {country ?? 'Select country'}
  </Select.Trigger>
  <Select.Content className="shadow-lg rounded mt-1">
    <Select.Item value="AU">Australia</Select.Item>
    <Select.Item value="US">United States</Select.Item>
  </Select.Content>
</Select.Root>
\`\`\`

### Production Gotcha: Prop Explosion from Insufficient Composition
\`\`\`tsx
// ❌ Monolithic API — every customisation point needs a prop
<DataTable
  headerClassName="..."
  rowClassName="..."
  cellClassName="..."
  emptyStateContent={<>...</>}
  loadingContent={<>...</>}
  onRowClick={...}
  // 40 more props...
/>

// ✅ Compound API — consumers compose at natural DOM boundaries
<DataTable.Root data={rows} onRowClick={onRowClick}>
  <DataTable.Header>...</DataTable.Header>
  <DataTable.Body renderRow={(row) => <DataTable.Row>{...}</DataTable.Row>} />
  <DataTable.EmptyState>No results</DataTable.EmptyState>
</DataTable.Root>
\`\`\`
**Why it happens:** Monolithic components try to anticipate every customisation need via props. Compound components give consumers direct DOM control, eliminating prop explosion entirely.

### Performance Characteristics
| API Style | Bundle Impact | Flexibility |
|-----------|--------------|-------------|
| Monolithic | Single import | Low — props only |
| Compound | Tree-shakeable | High — full DOM control |`,

    interview: `## INTERVIEW

**Q1 (Junior): What makes a component API "good" from a consumer's perspective?**
A: A good API is predictable (follows existing HTML/library conventions), minimal (only exposes what consumers need, not internal implementation details), and composable (works with other components without conflicts). The key test: can a new developer use the component correctly from reading the prop types alone, without reading the implementation? If they must read the source to understand how \`showHeader\` and \`headerContent\` interact, the API has failed.

**Q2 (Junior): What is prop drilling and how do compound components solve it?**
A: Prop drilling is passing props through multiple component layers just to reach a deeply nested child — a parent passes \`headerClassName\` down through three layers that don't use it, just to reach the header. Compound components solve this by sharing state through React Context: the root holds state and each sub-component reads what it needs directly, eliminating intermediary prop passing. Radix UI, Headless UI, and React Aria all use this pattern.

**Q3 (Mid): What is the \`asChild\` prop pattern (Radix primitive) and why is it powerful?**
A: \`asChild\` clones the component's logic onto the consumer's element using Radix's \`Slot\` utility. Instead of rendering a \`<button>\` itself, the component transfers all its handlers and ARIA attributes to whatever the consumer renders. This allows consumers to use their own Link component, custom elements, or custom tags while getting all the behaviour — without the component needing to know the tag in advance. It is the cleanest solution to the "polymorphic component" problem.

**Q4 (Mid): When does a boolean prop become a code smell? Show with an example.**
A: Boolean props become a smell when they mutually exclusive with other booleans, creating implicit enum state. \`isLoading / isError / isEmpty / isSuccess\` on a single component means only one should be true at a time — but nothing in TypeScript prevents two being true simultaneously, creating undefined visual states. The fix: use a discriminated union \`status: 'idle' | 'loading' | 'error' | 'success'\` which makes invalid states unrepresentable.

**Q5 (Senior): How do you design a component API for long-term evolution without breaking changes?**
A: Use additive-only versioning: new props must have defaults that preserve existing behaviour. Deprecate via console.warn + TypeScript \`@deprecated\` JSDoc. Use semantic versioning strictly — major only for breaking changes. For structural changes (adding a sub-component to a monolithic component), introduce the new API alongside the old one for one major version. The key constraint is that 200 consuming teams cannot upgrade in sync — the component must serve both old and new APIs during transition.`,

    feynman: `## FEYNMAN CHECK

### Explain Component API Design Like I'm 10 Years Old
> A component API is like a TV remote control — it has buttons (props) that let you control what the TV does, but you can't rewire the screen yourself. Good API design means the right buttons are on the remote, they're labelled clearly, and you can't press two conflicting buttons at once. Bad API design means 40 unlabelled buttons, some of which break other buttons when pressed. The non-obvious part: every prop you add to a component is a promise you must keep forever — removing it breaks everyone who used it. This is why the best APIs start tiny.

---

### 5 Deep Conceptual Questions

**Q1: What is the "principle of least surprise" applied to component APIs?**
> **A:** The principle says that component behaviour should match what an experienced developer would predict from the prop name and type alone, without reading documentation. A prop named \`disabled\` should behave exactly like native HTML \`disabled\`. A prop named \`onChange\` should fire on every change, not on blur. Violating this creates subtle bugs that take hours to debug because the developer assumes correct behaviour.

**Q2: The ONE model for API surface size.**
> **A:** "Start with the minimum necessary, make everything else a prop — but not before it's needed (YAGNI)." Every prop added before it's needed becomes an API liability. Every prop withheld until needed can be added additively without breaking changes.

**Q3: Misconception with code.**
> **A:** Using boolean props for mutually exclusive states.
> \`\`\`tsx
> // ❌ Both could be true — undefined behaviour
> <Alert isError={true} isSuccess={true} />
>
> // ✅ Discriminated union — invalid state unrepresentable
> <Alert variant="error" />
> <Alert variant="success" />
> \`\`\`

**Q4: How does TypeScript shape API design?**
> **A:** TypeScript enables discriminated unions that make invalid states unrepresentable at compile time, required vs optional prop enforcement, and \`@deprecated\` annotations that surface in IDE hover. A component's TypeScript interface IS the API contract — writing the types first forces clarity on what the component does before any implementation.

**Q5: Senior one-liner.**
> **A:** "Component API design is the discipline of exposing the minimum surface that enables maximum composition — which is why every additional prop is a breaking-change risk and every compound sub-component is a flexibility gain."`,

    build: `## BUILD

### 🏗️ Mini Project: Compound Select Component

**What you will build:** A fully accessible Select with compound component API: \`<Select.Root>\`, \`<Select.Trigger>\`, \`<Select.Content>\`, \`<Select.Item>\`.
**Why this project:** Forces you to implement shared context, ARIA relationship management, and the asChild pattern.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir compound-select && cd compound-select
npx create-next-app@latest . --typescript --no-src-dir --app
touch components/Select.tsx components/Select.test.tsx
\`\`\`

#### Step 2 — Core
\`\`\`tsx
// components/Select.tsx
const Ctx = React.createContext<{ value:string; set:(v:string)=>void; open:boolean; toggle:()=>void } | null>(null);
const useCtx = () => { const c = React.useContext(Ctx); if(!c) throw new Error('Must use inside Select.Root'); return c; };

function Root({ value, onChange, children }: { value:string; onChange:(v:string)=>void; children:React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <Ctx.Provider value={{ value, set: onChange, open, toggle: () => setOpen(p=>!p) }}>{children}</Ctx.Provider>;
}

function Trigger({ children }: { children?: React.ReactNode }) {
  const { value, open, toggle } = useCtx();
  return <button aria-haspopup="listbox" aria-expanded={open} onClick={toggle}>{children ?? value}</button>;
}

function Content({ children }: { children:React.ReactNode }) {
  const { open } = useCtx();
  return open ? <ul role="listbox">{children}</ul> : null;
}

function Item({ value, children }: { value:string; children:React.ReactNode }) {
  const { set, value: selected } = useCtx();
  return <li role="option" aria-selected={selected===value} onClick={()=>set(value)}>{children}</li>;
}

export const Select = { Root, Trigger, Content, Item };
\`\`\`

#### Step 4 — Error Handling
\`\`\`tsx
// Throw descriptive error if sub-component used outside Root
const useCtx = () => {
  const c = React.useContext(Ctx);
  if (!c) throw new Error('Select.Trigger must be used inside Select.Root');
  return c;
};
\`\`\`

#### Step 5 — Tests
\`\`\`tsx
test('opens on trigger click', () => {
  render(<Select.Root value="" onChange={()=>{}}><Select.Trigger>Pick</Select.Trigger><Select.Content><Select.Item value="a">A</Select.Item></Select.Content></Select.Root>);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('listbox')).toBeInTheDocument();
});
\`\`\`

**Expected Output:**
\`\`\`
✓ opens on trigger click
✓ item click calls onChange
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is a compound component? What problem does it solve vs a monolithic component?
**Q2:** Why should a component API start with the minimum surface? What is the cost of extra props?
**Q3:** Write a 15-line compound component with Context in TSX.

### Day 3 — Comprehension
**Q4:** What is the \`asChild\` pattern? When is it the right choice?
**Q5:** Show the boolean prop explosion bug and the discriminated union fix.
**Q6:** Refactor a 10-prop monolithic Card into a compound Card.Root + Card.Header + Card.Body.

### Day 7 — Application
**Q7:** Build a compound Tabs component (Root/List/Tab/Panel) with keyboard navigation.
**Q8:** A PR adds \`isLoading\`, \`isError\`, \`isEmpty\` to a Table. Describe the invalid-state risk.
**Q9:** What TypeScript utility types enforce required props only in specific variant combinations?

### Day 14 — Synthesis
**Q10:** ★ "Design the API for a DataTable component used by 200 teams. What composition model do you choose and why?"
**Q11:** Map component-api → compound-pattern → context → asChild — which enables which?
**Q12:** ★ "A monolithic 60-prop component is causing 80% of design system support tickets. How do you migrate to compound components without breaking 200 consumers?"`
  },

  'data-display': {
    code: `## CODE

### Level 1 — Beginner: Data Table with Sorting
\`\`\`tsx
// Basic table component — foundation of all data-display patterns
interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  caption?: string; // Required for accessibility — describes what the table contains
}

export function Table<T extends { id: string | number }>({ columns, data, caption }: TableProps<T>) {
  return (
    <div className="table-container" role="region" aria-label={caption} tabIndex={0}>
      <table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map(col => (
              <th key={String(col.key)} scope="col">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              {columns.map(col => (
                <td key={String(col.key)}>
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
\`\`\`

### Level 2 — Intermediate: Sortable Table with Virtual Scrolling
\`\`\`tsx
import { useState, useMemo } from 'react';

type SortDirection = 'asc' | 'desc' | null;
interface SortState { key: string; direction: SortDirection }

export function SortableTable<T extends { id: string | number }>({ columns, data, caption }: TableProps<T>) {
  const [sort, setSort] = useState<SortState>({ key: '', direction: null });

  const sortedData = useMemo(() => {
    if (!sort.direction || !sort.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sort.key as keyof T];
      const bVal = b[sort.key as keyof T];
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [data, sort]);

  const toggleSort = (key: string) => {
    setSort(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={String(col.key)}
              onClick={() => toggleSort(String(col.key))}
              aria-sort={sort.key === String(col.key) ? sort.direction ?? 'none' : 'none'}
              style={{ cursor: 'pointer' }}
            >
              {col.header} {sort.key === String(col.key) ? (sort.direction === 'asc' ? '↑' : '↓') : '⇕'}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{sortedData.map(row => <tr key={row.id}>{columns.map(col => <td key={String(col.key)}>{String(row[col.key] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  );
}
\`\`\`

### Level 3 — Advanced: Data Grid with Pagination & Filtering
\`\`\`tsx
import { useState, useMemo, useCallback } from 'react';

interface DataGridProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  searchable?: boolean;
}

export function DataGrid<T extends { id: string | number }>({
  columns, data, pageSize = 10, searchable = false
}: DataGridProps<T>) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>({ key: '', direction: null });

  // Filter → Sort → Paginate pipeline
  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter(row =>
      columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
    );
  }, [data, query, columns]);

  const sorted = useMemo(() => {
    if (!sort.direction) return filtered;
    return [...filtered].sort((a, b) => {
      const cmp = String(a[sort.key as keyof T]).localeCompare(String(b[sort.key as keyof T]), undefined, { numeric: true });
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort]);

  const pageCount = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);

  // Reset page when filter changes
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(0);
  }, []);

  return (
    <div className="data-grid">
      {searchable && (
        <input
          type="search"
          value={query}
          onChange={handleSearch}
          placeholder="Search..."
          aria-label="Search table"
        />
      )}
      <SortableTable columns={columns} data={paginated} />
      <nav aria-label="Table pagination">
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
        <span>Page {page + 1} of {pageCount}</span>
        <button disabled={page >= pageCount - 1} onClick={() => setPage(p => p + 1)}>Next</button>
      </nav>
    </div>
  );
}
\`\`\`

### Level 4 — Expert / Production: Virtualized Table (100K rows)
\`\`\`tsx
import { useVirtualizer } from '@tanstack/react-virtual'; // npm install @tanstack/react-virtual
import { useRef } from 'react';

// Virtualizer renders only visible rows — critical for 10K+ row tables
export function VirtualTable<T extends { id: string | number }>({ columns, data }: TableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,   // Estimated row height in px
    overscan: 5,              // Render 5 extra rows above/below viewport for smooth scrolling
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0;

  return (
    <div
      ref={parentRef}
      style={{ height: '400px', overflow: 'auto' }}
      role="grid"
      aria-rowcount={data.length}
    >
      <table style={{ width: '100%' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'white' }}>
          <tr>{columns.map(col => <th key={String(col.key)}>{col.header}</th>)}</tr>
        </thead>
        <tbody>
          {paddingTop > 0 && <tr><td style={{ height: paddingTop }} /></tr>}
          {virtualRows.map(virtualRow => {
            const row = data[virtualRow.index];
            return (
              <tr key={row.id} data-index={virtualRow.index} ref={rowVirtualizer.measureElement}>
                {columns.map(col => (
                  <td key={String(col.key)}>
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && <tr><td style={{ height: paddingBottom }} /></tr>}
        </tbody>
      </table>
    </div>
  );
}
\`\`\``,

    realworld: `## REAL_WORLD

### How GitHub Uses Data Display Components

GitHub's design system (Primer) powers data display across 200M+ repositories. Their Table and DataGrid components are critical — every PR list, commit history, and file explorer is a data display variant. Key learning from their open-source Primer: data display components fail in production not from missing features, but from missing edge cases — empty states, loading skeletons, truncation, and large-dataset virtual scrolling.

\`\`\`tsx
// Production pattern — Primer-style data display with edge cases
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;   // What to show when data is empty
  onSort?: (key: keyof T, dir: 'asc' | 'desc') => void;
  stickyHeader?: boolean;
  rowKey: (row: T) => string;     // Stable key for reconciliation
}

function DataTable<T>({ data, columns, isLoading, emptyState, rowKey }: DataTableProps<T>) {
  if (isLoading) return <TableSkeleton rows={5} cols={columns.length} />;

  return (
    <div role="region" aria-label="Data table" tabIndex={0} className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} scope="col" aria-sort={col.sortDir ?? 'none'}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0
            ? <tr><td colSpan={columns.length}>{emptyState ?? 'No data'}</td></tr>
            : data.map(row => (
                <tr key={rowKey(row)}>
                  {columns.map(col => (
                    <td key={col.key}>{col.render(row)}</td>
                  ))}
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}
\`\`\`

### Production Gotcha: Missing Empty State Crashes UX
\`\`\`tsx
// ❌ Renders empty table body — looks broken, no user guidance
{data.map(row => <TableRow key={row.id} {...row} />)}

// ✅ Always handle empty/loading/error states
{isLoading ? <Skeleton /> : data.length === 0 ? <EmptyState message="No results" /> : data.map(...)}
\`\`\`
**Why it happens:** Developers test with populated data and forget the empty state. First-time users hit a blank table with no guidance.

| State | Component |
|-------|-----------|
| Loading | Skeleton rows |
| Empty | Illustrated empty state |
| Error | Error state with retry |
| Populated | Data rows |`,

    interview: `## INTERVIEW

**Q1 (Junior): What is the difference between a Table and a DataGrid?**
A: A Table (\`<table>\`) is a semantic HTML element for tabular data — static, read-only, screen-reader friendly via \`scope\`, \`headers\`, and caption. A DataGrid adds interactive capabilities: sorting, filtering, inline editing, virtual scrolling, row selection. DataGrids typically use \`role="grid"\` with \`role="row"\` and \`role="gridcell"\` for proper ARIA semantics. Use Table for read-only structured data; DataGrid when users interact with the data itself.

**Q2 (Junior): Why must every data display component handle loading and empty states?**
A: Loading states prevent layout shift and tell users to wait rather than assuming the page is broken. Empty states guide users on what to do when no data exists — "No results. Create your first item." — rather than showing a blank space. Missing these states is one of the top causes of poor perceived performance and user confusion in data-heavy apps.

**Q3 (Mid): How do you make a Table accessible for screen readers?**
A: Use semantic \`<table>\`, \`<thead>\`, \`<tbody>\`, \`<th scope="col">\` (column headers), \`<th scope="row">\` (row headers). Add a \`<caption>\` describing the table purpose. For sortable columns, use \`aria-sort="ascending|descending|none"\`. Wrap scrollable tables in a \`<div role="region" tabIndex={0} aria-label="...">\` so keyboard users can scroll. Never use CSS \`display: grid\` on a \`<table>\` — it removes all table semantics.

**Q4 (Mid): When should you use virtual scrolling and what are its trade-offs?**
A: Virtual scrolling renders only visible rows in the DOM, recycling off-screen rows. Use it when the dataset exceeds ~500 rows — below that, DOM cost is negligible. Trade-offs: breaks native Ctrl+F browser search, makes screenshot testing harder, requires stable row heights (or complex dynamic height measurement), and loses native accessibility unless explicitly re-implemented with \`aria-rowcount\` and \`aria-rowindex\`. Libraries: \`@tanstack/react-virtual\`, \`react-window\`.

**Q5 (Senior): How do you design a column definition API that supports custom cell rendering?**
A: Use a \`ColumnDef<T>\` type with \`header: string | ReactNode\`, \`key: keyof T\`, and \`render: (row: T) => ReactNode\`. The \`render\` function gives consumers full control over cell content while the table owns layout and accessibility. For sort, expose \`sortKey\` separately from the render key so sorted value differs from displayed value (e.g. display "Jan 1" but sort by timestamp).`,

    feynman: `## FEYNMAN CHECK

### Explain Data Display Like I'm 10 Years Old
> Data display components are showcases for information — a table is like a spreadsheet you can read but (usually) not edit, a card grid is like sticky notes on a wall, and a list is a to-do list. The hard part isn't showing the data when it's there — it's handling when it's loading, when there's none, and when there are 10 million rows. This is why every production data component has three states before showing the actual data.

---

### 5 Deep Questions
**Q1: Why is the empty state as important as the populated state?**
> **A:** Empty is the first state new users see. A blank table with no guidance creates abandonment — the user assumes the product is broken. An illustrated empty state with a clear call-to-action ("No tasks. Add your first one.") converts blank to onboarding. First impressions are empty states.

**Q2: Mental model for data display states.**
> **A:** "Every data component has exactly four states: loading (skeleton), empty (illustrated prompt), error (message + retry), populated (the actual data). Design all four before shipping."

**Q3: Misconception with code.**
> **A:** Using array index as key.
> \`\`\`tsx
> // ❌ index key — causes wrong rows to update on sort/filter
> {data.map((row, i) => <TableRow key={i} {...row} />)}
> // ✅ stable identity key
> {data.map(row => <TableRow key={row.id} {...row} />)}
> \`\`\`

**Q4: How does virtualisation interact with accessibility?**
> **A:** Virtual scrolling removes off-screen DOM nodes, breaking screen reader row count announcements. Requires explicit \`aria-rowcount={totalRows}\` on \`<table>\` and \`aria-rowindex\` on each visible \`<tr>\` to communicate true dataset size.

**Q5: Senior one-liner.**
> **A:** "Data display components are state machines with four states (loading/empty/error/populated) and semantic HTML contracts — getting any state wrong costs user trust."`,

    build: `## BUILD

### 🏗️ Mini Project: Data Table with All Four States

**What you will build:** A typed DataTable component handling loading, empty, error, and populated states with accessible markup.
**Time estimate:** 40 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir data-table && cd data-table
npx create-next-app@latest . --typescript --tailwind --no-src-dir --app
\`\`\`

#### Step 2 — Core
\`\`\`tsx
type Status = 'idle'|'loading'|'error'|'success';
interface Col<T> { key: keyof T; header: string; render?: (row:T)=>React.ReactNode; }
function DataTable<T extends {id:string|number}>({cols, data, status, error, onRetry}: {cols:Col<T>[];data:T[];status:Status;error?:string;onRetry?:()=>void}) {
  if(status==='loading') return <div aria-busy="true" role="status">Loading…</div>;
  if(status==='error') return <div role="alert">{error}<button onClick={onRetry}>Retry</button></div>;
  return (
    <table>
      <thead><tr>{cols.map(c=><th key={String(c.key)} scope="col">{c.header}</th>)}</tr></thead>
      <tbody>
        {data.length===0 ? <tr><td colSpan={cols.length}>No data found.</td></tr>
         : data.map(row=><tr key={row.id}>{cols.map(c=><td key={String(c.key)}>{c.render?.(row)??String(row[c.key])}</td>)}</tr>)}
      </tbody>
    </table>
  );
}
\`\`\`

#### Step 5 — Tests
\`\`\`tsx
test('shows loading state', () => {
  render(<DataTable cols={[]} data={[]} status="loading" />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});
test('shows empty state', () => {
  render(<DataTable cols={[{key:'name',header:'Name'}]} data={[]} status="success" />);
  expect(screen.getByText('No data found.')).toBeInTheDocument();
});
\`\`\`
**Expected Output:** shows loading + shows empty pass`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Name the 4 states every data component must handle. What renders in each?
**Q2:** Why is array index a dangerous row key?
**Q3:** Write a 15-line table with loading and empty states.

### Day 3
**Q4:** Table vs DataGrid — when to use each?
**Q5:** Empty state bug — show with code.
**Q6:** Add sorting UI to a column definition.

### Day 7
**Q7:** Build a virtual list for 10k rows using a window of 20.
**Q8:** PR uses index keys on a sortable table — diagnose the bug.
**Q9:** Accessibility cost of virtual scrolling.

### Day 14
**Q10:** ★ "Design a data table for a system with 1M rows — pagination vs virtualisation trade-offs."
**Q11:** Link data-display → accessibility → empty-states → loading-patterns.
**Q12:** ★ "Analytics dashboard showing 50 charts — all live data. How do you handle loading, stale, and error states at scale?"`
  },

  'design-token-pipeline': {
    code: `## CODE

### Level 1 — Beginner: CSS Custom Properties Token System
\`\`\`css
/* Design tokens as CSS custom properties — the foundation */
:root {
  /* Primitive tokens — raw values, not semantic */
  --color-blue-100: #dbeafe;
  --color-blue-500: #3b82f6;
  --color-blue-700: #1d4ed8;
  --color-gray-50:  #f9fafb;
  --color-gray-900: #111827;

  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-8: 2rem;     /* 32px */

  /* Semantic tokens — reference primitives by ROLE, not value */
  --color-primary:          var(--color-blue-500);
  --color-primary-hover:    var(--color-blue-700);
  --color-text-default:     var(--color-gray-900);
  --color-background-page:  var(--color-gray-50);

  --spacing-component-gap:  var(--spacing-4);
  --spacing-section-gap:    var(--spacing-8);
}

/* Dark mode: only semantic tokens change; primitives stay the same */
[data-theme="dark"] {
  --color-primary:          var(--color-blue-100);
  --color-text-default:     var(--color-gray-50);
  --color-background-page:  var(--color-gray-900);
}
\`\`\`

### Level 2 — Intermediate: Style Dictionary Token Pipeline
\`\`\`javascript
// style-dictionary.config.js — npm install style-dictionary
// Style Dictionary transforms a token JSON into CSS, JS, iOS, Android outputs
const StyleDictionary = require('style-dictionary');

module.exports = {
  source: ['tokens/**/*.json'], // Your token source files

  platforms: {
    css: {
      transformGroup: 'css',  // Built-in: camelCase → --kebab-case, px values
      prefix: 'ds',           // Outputs --ds-color-primary instead of --color-primary
      buildPath: 'dist/css/',
      files: [{ destination: 'tokens.css', format: 'css/variables' }],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [{ destination: 'tokens.js', format: 'javascript/es6' }],
    },
    ios: {
      transformGroup: 'ios',
      buildPath: 'dist/ios/',
      files: [{ destination: 'Tokens.swift', format: 'ios-swift/class.swift' }],
    },
  },
};

// tokens/color.json
// {
//   "color": {
//     "primary": { "value": "#3b82f6", "type": "color", "description": "Primary brand color" },
//     "primary-hover": { "value": "{color.blue.700}", "type": "color" }  // Reference another token
//   }
// }
// Run: npx style-dictionary build
\`\`\`

### Level 3 — Advanced: Token Validation & Type-Safe Access
\`\`\`typescript
// tokens.ts — type-safe token access, prevents typos at compile time
import rawTokens from '../dist/js/tokens.js';

// Build a type from the token object to get autocomplete
type TokenPath = keyof typeof rawTokens; // 'colorPrimary' | 'spacingComponentGap' | ...

export function token(path: TokenPath): string {
  const value = rawTokens[path];
  if (!value) throw new Error(\`Token "\${path}" not found. Check tokens.json.\`);
  return value;
}

// Validate tokens at startup — fail fast if tokens.json has invalid references
export function validateTokens(): void {
  const errors: string[] = [];
  Object.entries(rawTokens).forEach(([key, value]) => {
    if (typeof value !== 'string') {
      errors.push(\`Token "\${key}" has non-string value: \${JSON.stringify(value)}\`);
    }
    if (String(value).startsWith('{')) {
      errors.push(\`Token "\${key}" has unresolved reference: \${value}\`);
    }
  });
  if (errors.length) throw new Error('Invalid tokens:
' + errors.join('
'));
}

// Usage in components
import { token } from '@/design-system/tokens';
const primaryColor = token('colorPrimary'); // TypeScript autocomplete, compile-time safety
\`\`\`

### Level 4 — Expert / Production: Multi-Brand Token Pipeline
\`\`\`javascript
// Multi-brand token pipeline — generates separate CSS for each brand
// Pattern used by Salesforce Lightning, Atlassian Design System

const StyleDictionary = require('style-dictionary');

// Register a custom transform: converts hex colors to HSL for dynamic opacity
StyleDictionary.registerTransform({
  name: 'color/hsl',
  type: 'value',
  matcher: (token) => token.type === 'color',
  transformer: (token) => {
    const hex = token.value.replace('#', '');
    const r = parseInt(hex.slice(0,2), 16) / 255;
    const g = parseInt(hex.slice(2,4), 16) / 255;
    const b = parseInt(hex.slice(4,6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const s = max === min ? 0 : (max - min) / (l > 0.5 ? 2 - max - min : max + min);
    const h = max === min ? 0 : max === r ? (g - b) / (max - min) + (g < b ? 6 : 0)
      : max === g ? (b - r) / (max - min) + 2 : (r - g) / (max - min) + 4;
    return \`\${Math.round(h * 60)} \${Math.round(s * 100)}% \${Math.round(l * 100)}%\`;
  },
});

// Register a custom format: wraps tokens in brand-specific data-attribute selector
StyleDictionary.registerFormat({
  name: 'css/brand-variables',
  formatter: ({ dictionary, options }) => {
    const selector = options.selector ?? ':root';
    const vars = dictionary.allTokens
      .map(token => \`  --\${token.name}: \${token.value};\`)
      .join('
');
    return \`\${selector} {
\${vars}
}
\`;
  },
});

const brands = ['brand-a', 'brand-b', 'brand-c'];

brands.forEach(brand => {
  const sd = StyleDictionary.extend({
    source: ['tokens/base/**/*.json', \`tokens/brands/\${brand}/**/*.json\`],
    platforms: {
      css: {
        transformGroup: 'css',
        transforms: ['color/hsl'],
        buildPath: \`dist/brands/\${brand}/\`,
        files: [{
          destination: 'tokens.css',
          format: 'css/brand-variables',
          options: { selector: \`[data-brand="\${brand}"]\` },
        }],
      },
    },
  });
  sd.buildAllPlatforms();
  console.log(\`✅ Built \${brand} tokens\`);
});
\`\`\``,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "FlowChart", "state": "design-system-token-pipeline" }
\`\`\``,

    realworld: `## REAL_WORLD

### How Salesforce Lightning Design System Runs Its Token Pipeline

Salesforce SLDS serves tokens to web, iOS, Android, and email simultaneously from a single source of truth. Their open-source \`theo\` library (predecessor to Style Dictionary) defined the pattern that every major design system now follows: define tokens once in JSON/YAML, transform to CSS custom properties, iOS Swift constants, Android XML, and email-safe inline styles via a pipeline of transforms.

\`\`\`js
// Production pattern — Style Dictionary token pipeline
// Token source: tokens/color.json → CSS + iOS + Android
// style-dictionary.config.js

module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: 'ds',                    // --ds-color-brand-primary
      buildPath: 'dist/css/',
      files: [{ destination: 'tokens.css', format: 'css/variables' }],
    },
    ios: {
      transformGroup: 'ios-swift',
      buildPath: 'dist/ios/',
      files: [{ destination: 'Tokens.swift', format: 'ios-swift/class.swift' }],
    },
    android: {
      transformGroup: 'android',
      buildPath: 'dist/android/',
      files: [{ destination: 'tokens.xml', format: 'android/resources' }],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [{ destination: 'tokens.js', format: 'javascript/module' }],
    },
  },
};

// tokens/color/brand.json
{
  "color": {
    "brand": {
      "primary": { "value": "{color.palette.blue.500}", "comment": "Primary brand colour" },
      "danger":  { "value": "{color.palette.red.600}",  "comment": "Destructive actions" }
    }
  }
}
\`\`\`

### Production Gotcha: Hardcoded Token Values in Components
\`\`\`css
/* ❌ Hardcoded value — won't update when token changes */
.alert-danger { background: #dc2626; }

/* ✅ References pipeline output — single change propagates everywhere */
.alert-danger { background: var(--ds-color-brand-danger); }
\`\`\`
**Why it happens:** Engineers copy hex values from Figma instead of referencing the generated CSS custom property. Token pipeline changes then silently diverge from components.

| Phase | Tool | Output |
|-------|------|--------|
| Author | JSON/YAML | Token definitions |
| Transform | Style Dictionary | CSS/Swift/XML/JS |
| Lint | Token lint CI | Broken reference check |
| Publish | npm | versioned packages |`,

    interview: `## INTERVIEW

**Q1 (Junior): What is Style Dictionary and why is it the industry standard for token pipelines?**
A: Style Dictionary (Amazon/open-source) is a build system that takes token definitions in JSON or YAML and transforms them into platform-specific output: CSS custom properties, iOS Swift, Android XML, JavaScript objects, Sass variables. It's the industry standard because it handles the complete pipeline — aliasing (tokens referencing other tokens), transforms (converting raw values like \`{ms: 200}\` to \`200ms\`), and formatters (producing the correct syntax for each platform) — without requiring custom build scripts.

**Q2 (Junior): What is the difference between a token alias and a token value?**
A: A token value is a raw primitive: \`#3b82f6\`, \`16px\`, \`200ms\`. A token alias references another token: \`{color.palette.blue.500}\`. Aliases enable the two-layer architecture — semantic tokens alias primitive tokens, so changing a primitive cascades through all semantics. Style Dictionary resolves all aliases at build time, producing flat values in the output.

**Q3 (Mid): How do you version and publish design tokens to prevent breaking changes?**
A: Publish tokens as an npm package with semantic versioning. Breaking changes (renaming, removing, or changing the value of an existing token) require a major bump and a migration guide. Additive changes (new tokens) are minor. Each consumer pins to a version and upgrades on their own schedule. The pipeline should include a CI check that detects renamed or removed tokens between versions and fails the PR.

**Q4 (Mid): How does a token pipeline support multiple platforms from one source?**
A: The single source defines tokens in platform-agnostic JSON. Style Dictionary applies platform-specific transform groups: \`css\` adds \`px\` suffixes and generates \`var(--)\` syntax; \`ios-swift\` generates UIColor/CGFloat constants; \`android\` generates XML colour resources. Each platform's output is generated in a single \`style-dictionary build\` command — one commit updates all platforms simultaneously.

**Q5 (Senior): How do you integrate the token pipeline into a monorepo CI/CD workflow?**
A: Token source lives in \`packages/tokens\`. On PR, CI runs \`style-dictionary build\` and diffs the output against main — changed tokens surface in PR review. On merge to main, CI publishes a new npm version, and a bot opens automated upgrade PRs in consuming packages. The critical guard: a lint step that checks for broken aliases (token A references token B which was renamed) and undefined references before build, failing the PR rather than silently publishing broken tokens.`,

    feynman: `## FEYNMAN CHECK

### Explain Token Pipeline Like I'm 10 Years Old
> Design tokens are like paint colour cards with names ("Ocean Blue", "Danger Red"). The pipeline is the factory that takes those cards and prints the right instructions for every platform: CSS says "use this hex code", iOS says "use this UIColor", Android says "use this XML resource". One change to the card propagates to all platforms automatically. The non-obvious part: the pipeline must run in CI before every release — if engineers copy values by hand instead of referencing tokens, the pipeline is bypassed and platforms drift.

---

### 5 Deep Questions
**Q1: Why is a token pipeline necessary vs manually writing CSS variables?**
> **A:** Manual CSS variables serve only web. A pipeline transforms one source into web CSS, iOS Swift, Android XML, email HTML, and Figma simultaneously — a single token change propagates everywhere in one commit. Manual cross-platform synchronisation across four platforms with 300+ tokens produces drift within weeks.

**Q2: The ONE model.**
> **A:** "Define once in JSON, transform to many platforms. Aliases resolve at build time. Consumers import generated output, never the source."

**Q3: Misconception with code.**
> **A:** Using hardcoded values instead of token references:
> \`\`\`css
> /* ❌ bypasses pipeline */
> .btn { color: #3b82f6; }
> /* ✅ pipeline-managed */
> .btn { color: var(--ds-color-interactive-primary); }
> \`\`\`

**Q4: How does token versioning interact with consuming app deploys?**
> **A:** Token packages are npm dependencies — apps pin to a version. A breaking token change (rename) requires a major version bump, migration guide, and automated codemod to prevent 200 teams from all manually updating the same rename.

**Q5: Senior one-liner.**
> **A:** "A token pipeline is a build system that resolves, transforms, and publishes design decisions as platform-specific constants — which is why a cross-platform brand refresh is a one-commit change."`,

    build: `## BUILD

### 🏗️ Mini Project: Style Dictionary Token Pipeline

**What you will build:** A Style Dictionary pipeline that generates CSS custom properties + a JS module from a two-layer JSON token source.
**Time estimate:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir token-pipeline && cd token-pipeline
npm init -y && npm install style-dictionary
mkdir -p tokens/color tokens/spacing dist
touch style-dictionary.config.js tokens/color/palette.json tokens/color/semantic.json
\`\`\`

#### Step 2 — Token Source
\`\`\`json
// tokens/color/palette.json
{ "color": { "palette": { "blue": { "500": { "value": "#3b82f6" }, "700": { "value": "#1d4ed8" } }, "red": { "600": { "value": "#dc2626" } } } } }
\`\`\`
\`\`\`json
// tokens/color/semantic.json
{ "color": { "interactive": { "primary": { "value": "{color.palette.blue.500}" }, "hover": { "value": "{color.palette.blue.700}" } }, "feedback": { "danger": { "value": "{color.palette.red.600}" } } } }
\`\`\`

#### Step 3 — Pipeline Config
\`\`\`js
// style-dictionary.config.js
module.exports = { source: ['tokens/**/*.json'], platforms: { css: { transformGroup: 'css', prefix: 'ds', buildPath: 'dist/', files: [{ destination: 'tokens.css', format: 'css/variables' }] }, js: { transformGroup: 'js', buildPath: 'dist/', files: [{ destination: 'tokens.js', format: 'javascript/module' }] } } };
\`\`\`

#### Step 4 — Build
\`\`\`bash
npx style-dictionary build --config style-dictionary.config.js
\`\`\`

#### Step 5 — Verify
\`\`\`bash
cat dist/tokens.css | grep ds-color-interactive-primary
# Expected: --ds-color-interactive-primary: #3b82f6;
\`\`\`

**Expected Output:**
\`\`\`css
--ds-color-interactive-primary: #3b82f6;
--ds-color-feedback-danger: #dc2626;
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** What does Style Dictionary do? Name the three pipeline phases.
**Q2:** Alias vs value — what's the difference? When do aliases resolve?
**Q3:** Write a 10-line Style Dictionary config outputting CSS variables.

### Day 3
**Q4:** How does the pipeline support iOS and Android from one source?
**Q5:** Hardcoded value bug — show it and fix it.
**Q6:** Add a \`spacing\` token category to the pipeline.

### Day 7
**Q7:** Add a CI step that detects broken aliases and fails the PR.
**Q8:** PR uses raw hex in component CSS — describe the drift over 6 months.
**Q9:** How do you version tokens to avoid breaking consuming apps?

### Day 14
**Q10:** ★ "Design a token pipeline for a company with web, iOS, Android, and email products."
**Q11:** Link tokens → pipeline → platforms → versioning.
**Q12:** ★ "A rebrand changes 8 base palette tokens. How does the pipeline propagate to 4 platforms across 200 app repos?"`
  },

  'design-tokens': {
    feynman: `## FEYNMAN CHECK

### Explain Design Tokens Like I'm 10 Years Old
> Design tokens are named variables that store design decisions — colour, spacing, typography, animation timing. Instead of every developer guessing what shade of blue the brand uses, there's one named token (\`color.brand.primary = #3b82f6\`) that everyone references. Change the token once, and every button, card, and heading that references it updates automatically. The non-obvious part: tokens exist in two layers — primitive (blue-500) and semantic (buttonBackground) — and confusing them makes theming impossible. This is why "just use the hex code" creates a maintenance catastrophe at scale.

---

### 5 Deep Questions
**Q1: Why two layers (primitive + semantic)?**
> **A:** Primitive tokens name raw values (blue-500, 16px). Semantic tokens assign meaning (textPrimary, spacingMd). Themes swap semantic mappings while leaving primitives intact. Without the separation, dark mode requires touching every component; with it, dark mode is one mapping file.

**Q2: ONE model.**
> **A:** "Token = named design decision. Primitive = what. Semantic = what-for. Components use semantic only."

**Q3: Misconception with code.**
> **A:** Using primitive tokens in components:
> \`\`\`css
> /* ❌ Locks to light mode palette */
> .card { background: var(--color-gray-100); }
> /* ✅ Theme-agnostic */
> .card { background: var(--color-surface-secondary); }
> \`\`\`

**Q4: How do tokens interact with Figma?**
> **A:** Tokens Plugin for Figma (or Tokens Studio) syncs JSON token files with Figma variables/styles bidirectionally. Design changes in Figma export to JSON, pipeline generates CSS/Swift/etc. Development changes to JSON sync back to Figma. The handoff friction disappears — the token IS the source of truth for both.

**Q5: Senior one-liner.**
> **A:** "A design token is a named, platform-agnostic design decision stored as a structured value — the primitive/semantic split makes the difference between O(1) theming and O(n components) repainting."`,

    build: `## BUILD

### 🏗️ Mini Project: Token Validator CLI

**What you will build:** A Node.js script that reads token JSON and validates: all aliases resolve, all colour tokens have valid hex, all semantic tokens reference primitives only.
**Time estimate:** 25 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir token-validator && cd token-validator
npm init -y && touch validate.js tokens.json
\`\`\`

#### Step 2 — Core
\`\`\`js
const tokens = require('./tokens.json');
const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
function flatten(obj, prefix='') {
  return Object.entries(obj).flatMap(([k,v]) => typeof v==='object'&&!v.value ? flatten(v, prefix+k+'.') : [[prefix+k, v]]);
}
const flat = Object.fromEntries(flatten(tokens));
let errors = 0;
for(const [name, token] of Object.entries(flat)) {
  if(token.value?.startsWith('{')) {
    const ref = token.value.slice(1,-1);
    if(!flat[ref]) { console.error(\`BROKEN ALIAS: \${name} -> \${ref}\`); errors++; }
  }
}
if(errors) process.exit(1); else console.log('All tokens valid.');
\`\`\`

#### Step 5 — Tests
\`\`\`bash
node validate.js  # Should output: All tokens valid.
# Add a broken alias to tokens.json:
# "test": { "value": "{color.palette.nonexistent}" }
node validate.js  # Should output: BROKEN ALIAS and exit 1
\`\`\`

**Expected Output:**
\`\`\`
All tokens valid.
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** What is a design token? Why is it better than hardcoded values?
**Q2:** Primitive vs semantic — define each with an example.
**Q3:** Write a JSON token file with 3 primitive colours + 2 semantic references.

### Day 3
**Q4:** How does theming work with a two-layer token system?
**Q5:** Show the primitive-in-component bug and the semantic fix.
**Q6:** Add a spacing scale (xs/sm/md/lg/xl) to your token file.

### Day 7
**Q7:** Write a token validator that catches broken aliases — fail CI if any found.
**Q8:** PR uses \`--color-gray-100\` (primitive) in 30 components. Describe the dark mode impact.
**Q9:** How do you sync tokens between Figma and code?

### Day 14
**Q10:** ★ "Design a complete token taxonomy for a product with light/dark/high-contrast themes and white-label support."
**Q11:** Link tokens → token-pipeline → color-system → theming.
**Q12:** ★ "A Fortune 500 client needs their brand applied to your SaaS product in 2 weeks. How do tokens make this possible?"`
  },

  'feedback-components': {
    code: `## CODE

### Level 1 — Beginner: Toast Notification
\`\`\`tsx
// Toast — non-intrusive feedback for successful/failed actions
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
}

const icons: Record<ToastVariant, string> = {
  success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️'
};

export function Toast({ message, variant = 'info', onDismiss }: ToastProps) {
  return (
    <div
      role="status"        // "status" for non-critical; "alert" for errors only
      aria-live="polite"   // Screen reader announces when inserted into DOM
      className={\`toast toast--\${variant}\`}
    >
      <span aria-hidden="true">{icons[variant]}</span>
      <span className="toast__message">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss notification" className="toast__close">×</button>
      )}
    </div>
  );
}
\`\`\`

### Level 2 — Intermediate: Toast Queue Manager
\`\`\`tsx
import { useState, useCallback, useId } from 'react';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number; // ms before auto-dismiss
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = 'info', duration = 4000) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, variant, duration }]);
    // Auto-dismiss after duration
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, dismiss };
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map(t => <Toast key={t.id} message={t.message} variant={t.variant} onDismiss={() => dismiss(t.id)} />)}
    </div>
  );
}
\`\`\`

### Level 3 — Advanced: Alert Banner with Actions
\`\`\`tsx
interface AlertAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface AlertProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  actions?: AlertAction[];
  onClose?: () => void;
  closable?: boolean;
}

const alertConfig = {
  info:    { role: 'status' as const,  icon: 'ℹ️', className: 'alert--info' },
  success: { role: 'status' as const,  icon: '✅', className: 'alert--success' },
  warning: { role: 'alert' as const,   icon: '⚠️', className: 'alert--warning' },
  error:   { role: 'alert' as const,   icon: '❌', className: 'alert--error' },
};

export function Alert({ variant, title, description, actions, onClose, closable }: AlertProps) {
  const config = alertConfig[variant];
  return (
    <div role={config.role} className={\`alert \${config.className}\`}>
      <span className="alert__icon" aria-hidden="true">{config.icon}</span>
      <div className="alert__content">
        <strong className="alert__title">{title}</strong>
        {description && <p className="alert__desc">{description}</p>}
        {actions && actions.length > 0 && (
          <div className="alert__actions">
            {actions.map((action, i) => (
              <button key={i} onClick={action.onClick} className={\`btn btn--\${action.variant ?? 'primary'} btn--sm\`}>
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {closable && onClose && (
        <button onClick={onClose} aria-label="Dismiss" className="alert__close">×</button>
      )}
    </div>
  );
}
\`\`\`

### Level 4 — Expert / Production: Feedback System with Context
\`\`\`tsx
import { createContext, useContext, useReducer, useCallback } from 'react';

interface FeedbackItem {
  id: string;
  type: 'toast' | 'alert' | 'banner';
  variant: 'info' | 'success' | 'warning' | 'error';
  message: string;
  title?: string;
  duration?: number;
  actions?: AlertAction[];
  createdAt: number;
}

type FeedbackAction =
  | { type: 'ADD'; payload: FeedbackItem }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR_ALL' };

function feedbackReducer(state: FeedbackItem[], action: FeedbackAction): FeedbackItem[] {
  switch (action.type) {
    case 'ADD':       return [...state, action.payload];
    case 'REMOVE':    return state.filter(f => f.id !== action.id);
    case 'CLEAR_ALL': return [];
  }
}

const FeedbackContext = createContext<{
  items: FeedbackItem[];
  toast: (message: string, variant?: FeedbackItem['variant'], duration?: number) => void;
  alert: (title: string, message: string, variant?: FeedbackItem['variant'], actions?: AlertAction[]) => void;
  dismiss: (id: string) => void;
} | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(feedbackReducer, []);

  const toast = useCallback((message: string, variant: FeedbackItem['variant'] = 'info', duration = 4000) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD', payload: { id, type: 'toast', variant, message, duration, createdAt: Date.now() } });
    if (duration > 0) setTimeout(() => dispatch({ type: 'REMOVE', id }), duration);
  }, []);

  const alert = useCallback((title: string, message: string, variant: FeedbackItem['variant'] = 'info', actions?: AlertAction[]) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD', payload: { id, type: 'alert', variant, title, message, actions, duration: 0, createdAt: Date.now() } });
  }, []);

  const dismiss = useCallback((id: string) => dispatch({ type: 'REMOVE', id }), []);

  return (
    <FeedbackContext.Provider value={{ items, toast, alert, dismiss }}>
      {children}
      {/* Render toasts */}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {items.filter(i => i.type === 'toast').map(i => (
          <Toast key={i.id} message={i.message} variant={i.variant} onDismiss={() => dismiss(i.id)} />
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export const useFeedback = () => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be inside <FeedbackProvider>');
  return ctx;
};
\`\`\``,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "StateMachine", "state": "design-system-feedback-states" }
\`\`\``,

    realworld: `## REAL_WORLD

### How Stripe's Design System Handles Feedback Components

Stripe's Dashboard processes $1T+ per year. Every feedback signal — toast, alert, inline error, progress bar — must be precise: a false "Payment failed" costs customer trust; a silent failure costs revenue. Their feedback components encode explicit severity levels (info/success/warning/error) with consistent colours, icons, and ARIA live region roles, ensuring the same visual and audio signal for the same severity regardless of which engineer built the screen.

\`\`\`tsx
// Production pattern — Stripe-style feedback system
type Severity = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  severity: Severity;       // Drives colour + icon + ARIA role
  title: string;
  description?: string;
  onDismiss?: () => void;   // Optional dismiss — never auto-dismiss errors
  actions?: React.ReactNode;
}

const severityConfig: Record<Severity, { icon: string; role: string; liveRegion: string }> = {
  info:    { icon: 'ℹ️', role: 'status',  liveRegion: 'polite' },
  success: { icon: '✅', role: 'status',  liveRegion: 'polite' },
  warning: { icon: '⚠️', role: 'alert',   liveRegion: 'assertive' },
  error:   { icon: '❌', role: 'alert',   liveRegion: 'assertive' },  // assertive interrupts SR
};

export function Alert({ severity, title, description, onDismiss, actions }: AlertProps) {
  const config = severityConfig[severity];
  return (
    <div
      role={config.role}
      aria-live={config.liveRegion as 'polite' | 'assertive'}
      aria-atomic="true"   // SR reads entire alert, not just changed text
      className={\`alert alert--\${severity}\`}
    >
      <span aria-hidden="true">{config.icon}</span>
      <div>
        <p className="alert__title">{title}</p>
        {description && <p className="alert__desc">{description}</p>}
      </div>
      {actions}
      {onDismiss && (
        <button aria-label="Dismiss alert" onClick={onDismiss}>×</button>
      )}
    </div>
  );
}
\`\`\`

### Production Gotcha: Auto-Dismissing Error Alerts
\`\`\`tsx
// ❌ Auto-dismiss on errors — user misses payment failure message
<Toast severity="error" autoDismissMs={3000}>Payment failed</Toast>

// ✅ Errors require manual dismissal — user must acknowledge
<Toast severity={severity} autoDismissMs={severity === 'error' ? undefined : 5000}>
  {message}
</Toast>
\`\`\`
**Why it happens:** Developers apply a single auto-dismiss delay to all severities. Error messages that disappear before the user reads them are the #1 complaint in user testing of feedback components.

| Severity | ARIA Role | Live Region | Auto-dismiss |
|----------|-----------|-------------|-------------|
| info | status | polite | Optional |
| success | status | polite | 5s default |
| warning | alert | assertive | Never |
| error | alert | assertive | Never |`,

    interview: `## INTERVIEW

**Q1 (Junior): What are ARIA live regions and why do feedback components need them?**
A: ARIA live regions (\`aria-live="polite|assertive"\`) instruct screen readers to announce content changes without requiring the user to navigate to the element. Polite waits for the SR to finish speaking before announcing; assertive interrupts immediately. Feedback components (toasts, alerts, error messages) must use live regions because they appear dynamically outside the user's current focus point — without them, screen reader users never hear the alert.

**Q2 (Junior): What is the difference between a toast, an alert, and an inline error?**
A: Toasts are transient, non-blocking notifications for low-priority feedback (item saved, link copied) — they appear and disappear without requiring action. Alerts are persistent, contextual notices that stay until dismissed — used for important warnings or errors. Inline errors appear directly adjacent to the field that caused them — used for form validation. Mixing them up (e.g. using a toast for a required-field error) means users miss critical feedback.

**Q3 (Mid): How do you implement a toast queue that prevents stacking dozens of notifications?**
A: Maintain an array of active toasts in state with a max cap (e.g. 3). New toasts push onto the array; auto-dismiss pops them after their timeout. If the queue is full, either replace the oldest or queue pending toasts. The critical edge: when a user action triggers rapid feedback (e.g. bulk operations), collapse identical messages into one with a count ("3 items deleted") rather than 3 separate toasts.

**Q4 (Mid): Why should error alerts never auto-dismiss?**
A: Error states represent failed user intent — a payment that didn't go through, a file that failed to upload. Auto-dismissing them removes the user's only signal that they need to take action. At 5 seconds (common auto-dismiss), a user glancing away misses the error entirely and submits again, causing duplicate charges or lost work. Errors require manual acknowledgement so the user's mental model stays in sync with system state.

**Q5 (Senior): How do you design a feedback system that works for both screen readers and low-vision users?**
A: Use three channels simultaneously: ARIA live region (SR announcement), visual colour + icon (sighted users), and position/motion (low-vision users who may not distinguish colours). Never rely on colour alone for severity — always pair with an icon. Use \`aria-atomic="true"\` so live region re-reads the full message on update. For toast positioning, place toasts away from interactive areas so they don't obscure content keyboard users are focused on.`,

    feynman: `## FEYNMAN CHECK

### Explain Feedback Components Like I'm 10 Years Old
> Feedback components are the system's voice — they tell you "It worked!", "Watch out!", or "That failed." The trick is matching the urgency of the voice to the urgency of the message: a whisper (polite live region) for "file saved", a shout (assertive live region) for "payment failed". The non-obvious part: screen readers don't see the visual alert unless you tell them about it with ARIA live regions — sighted users see the red banner, but a blind user hears nothing unless the component is coded correctly. This is why your flashy toast is silent to 7M screen reader users.

---

### 5 Deep Questions
**Q1: When should you use polite vs assertive live regions?**
> **A:** Polite (\`aria-live="polite"\`) waits for SR to finish speaking — use for low-priority confirmations (saved, copied). Assertive (\`aria-live="assertive"\`) interrupts immediately — use only for errors and urgent warnings that require immediate user attention. Assertive used for low-priority messages is disruptive and annoying to AT users — the equivalent of someone interrupting every conversation.

**Q2: ONE model.**
> **A:** "Severity drives role + live region + dismiss policy. Info/success = polite/dismissable. Warning/error = assertive/persistent."

**Q3: Misconception with code.**
> **A:** Missing live region — screen readers never hear the alert:
> \`\`\`tsx
> // ❌ Visual only — SR users miss it
> {error && <div className="error-banner">{error}</div>}
> // ✅ Live region announces change
> <div role="alert" aria-live="assertive">{error && error}</div>
> \`\`\`

**Q4: How does a toast queue interact with React state?**
> **A:** Toasts are an array in state. Add appends, auto-dismiss removes after timeout (via useEffect cleanup). The queue renders the array as stacked positioned elements. Multiple simultaneous toasts risk live region flood — assertive regions announcing in rapid succession are unintelligible. Cap at 3 visible toasts.

**Q5: Senior one-liner.**
> **A:** "Feedback components are ARIA live regions with visual decoration — severity maps to role+liveRegion+dismissPolicy, and error messages that auto-dismiss are user experience failures masquerading as UX."`,

    build: `## BUILD

### 🏗️ Mini Project: Toast Queue System

**What you will build:** A toast notification queue with severity levels, auto-dismiss for non-errors, and ARIA live region announcements.
**Time estimate:** 40 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir toast-queue && cd toast-queue
npx create-next-app@latest . --typescript --tailwind --no-src-dir --app
touch hooks/useToast.ts components/ToastContainer.tsx
\`\`\`

#### Step 2 — Hook
\`\`\`ts
// hooks/useToast.ts
type Severity = 'info'|'success'|'warning'|'error';
interface Toast { id:string; severity:Severity; message:string; }
const listeners: Array<(t:Toast)=>void> = [];
export function toast(severity: Severity, message: string) {
  const t: Toast = { id: crypto.randomUUID(), severity, message };
  listeners.forEach(fn => fn(t));
}
export function useToasts() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  React.useEffect(() => {
    const fn = (t:Toast) => setToasts(prev => [...prev.slice(-2), t]); // max 3
    listeners.push(fn);
    return () => { listeners.splice(listeners.indexOf(fn),1); };
  }, []);
  const dismiss = (id:string) => setToasts(prev => prev.filter(t=>t.id!==id));
  return { toasts, dismiss };
}
\`\`\`

#### Step 3 — Container
\`\`\`tsx
// components/ToastContainer.tsx
export function ToastContainer() {
  const { toasts, dismiss } = useToasts();
  return (
    <div aria-live="polite" aria-atomic="false" className="fixed bottom-4 right-4 flex flex-col gap-2">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}
\`\`\`

#### Step 5 — Tests
\`\`\`tsx
test('error toast does not auto-dismiss', async () => {
  toast('error', 'Payment failed');
  // After 5s, error toast still present
  await new Promise(r => setTimeout(r, 5500));
  expect(screen.getByText('Payment failed')).toBeInTheDocument();
});
\`\`\`

**Expected Output:**
\`\`\`
✓ success toast auto-dismisses after 5s
✓ error toast never auto-dismisses
✓ queue caps at 3 toasts
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Name the 3 feedback component types. When does each apply?
**Q2:** Polite vs assertive live regions — when do you use each?
**Q3:** Write a 15-line accessible toast component.

### Day 3
**Q4:** Why must error alerts never auto-dismiss?
**Q5:** Missing live region bug — show and fix.
**Q6:** Build a toast queue that caps at 3 notifications.

### Day 7
**Q7:** Implement a collapsed toast ("3 items deleted") when the same action repeats rapidly.
**Q8:** PR uses assertive live region for all feedback including success. Describe the SR UX problem.
**Q9:** How do you test ARIA live regions with jest-dom?

### Day 14
**Q10:** ★ "Design a feedback system for a real-time collaborative editor where multiple users trigger toasts simultaneously."
**Q11:** Link feedback → accessibility → live-regions → severity-design.
**Q12:** ★ "A payment flow has a 0.5% error rate at 1M transactions/day. How does feedback component design affect error recovery rates?"`
  },

  'iconography': {
    code: `## CODE

### Level 1 — Beginner: SVG Icon Component
\`\`\`tsx
// Single icon component with consistent sizing and accessibility
interface IconProps {
  name: string;
  size?: 16 | 20 | 24 | 32;
  color?: string;
  ariaLabel?: string;  // Set when icon conveys meaning; omit for decorative icons
  className?: string;
}

// SVG sprite approach — all icons in one file, referenced by <use>
export function Icon({ name, size = 20, color = 'currentColor', ariaLabel, className }: IconProps) {
  const isDecorative = !ariaLabel;
  return (
    <svg
      width={size}
      height={size}
      fill={color}
      aria-hidden={isDecorative ? 'true' : undefined} // Hides from screen readers if decorative
      aria-label={ariaLabel}                            // Screen reader reads this for meaningful icons
      role={ariaLabel ? 'img' : undefined}
      focusable="false"  // Prevents IE11 from making SVG focusable
      className={className}
    >
      <use href={\`/icons/sprite.svg#\${name}\`} /> {/* References SVG sprite */}
    </svg>
  );
}
\`\`\`

### Level 2 — Intermediate: Icon Registry with Tree-Shaking
\`\`\`tsx
// Inline SVG approach — no sprite file, fully tree-shakeable
// Each icon is a React component; unused icons are removed by bundler

const iconPaths = {
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  x:     'M6 18L18 6M6 6l12 12',
  plus:  'M12 4v16m8-8H4',
  arrow: 'M9 5l7 7-7 7',
  search:'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
} as const;

type IconName = keyof typeof iconPaths;

interface SvgIconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  ariaLabel?: string;
}

export function SvgIcon({ name, size = 20, strokeWidth = 2, ariaLabel }: SvgIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"  // Inherits text color — no need to pass color prop
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}
\`\`\`

### Level 3 — Advanced: Animated Icon with Transitions
\`\`\`tsx
import { motion, AnimatePresence } from 'framer-motion';

// Animated icon — handles state transitions (e.g., menu ↔ close, play ↔ pause)
interface AnimatedIconProps {
  isActive: boolean;
  activeIcon: IconName;
  inactiveIcon: IconName;
  size?: number;
  ariaLabel: string; // Meaningful — icon conveys state
}

export function AnimatedToggleIcon({ isActive, activeIcon, inactiveIcon, size = 24, ariaLabel }: AnimatedIconProps) {
  return (
    <span
      aria-label={ariaLabel}
      aria-live="polite"  // Announces state change to screen readers
      role="img"
      style={{ display: 'inline-flex', position: 'relative', width: size, height: size }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isActive ? 'active' : 'inactive'} // Key change triggers exit/enter animation
          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
          animate={{ opacity: 1, scale: 1,   rotate: 0 }}
          exit={{    opacity: 0, scale: 0.5,  rotate: 90 }}
          transition={{ duration: 0.15 }}
          style={{ position: 'absolute', inset: 0 }}
          aria-hidden="true"
        >
          <SvgIcon name={isActive ? activeIcon : inactiveIcon} size={size} />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
\`\`\`

### Level 4 — Expert / Production: Icon Build Pipeline
\`\`\`javascript
// scripts/build-icons.js — generates React components from SVG files
// Input: src/icons/*.svg → Output: src/components/icons/index.tsx
const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');    // npm install svgo
const { transform } = require('@svgr/core'); // npm install @svgr/core

const SVG_DIR = path.join(__dirname, '../src/icons');
const OUT_DIR = path.join(__dirname, '../src/components/icons');

const SVGR_CONFIG = {
  plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
  svgoConfig: {
    plugins: [
      'removeTitle',
      'removeDesc',
      'removeUselessDefs',
      { name: 'convertColors', params: { currentColor: true } }, // All fills → currentColor
    ],
  },
  typescript: true,
  dimensions: false,       // Remove width/height from SVG — controlled via props
  expandProps: 'start',    // Spread props at the start of SVG attributes
  svgProps: {
    'aria-hidden': '{!ariaLabel}',
    'aria-label': '{ariaLabel}',
    role: "{ariaLabel ? 'img' : undefined}",
  },
  template: (variables, { tpl }) => tpl\`
    import { SVGProps } from 'react';
    interface Props extends SVGProps<SVGSVGElement> {
      size?: number;
      ariaLabel?: string;
    }
    const \${variables.componentName} = ({ size = 24, ariaLabel, ...props }: Props) => (
      \${variables.jsx}
    );
    export default \${variables.componentName};
  \`,
};

async function buildIcons() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const svgFiles = fs.readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));
  const exports = [];

  for (const file of svgFiles) {
    const svgContent = fs.readFileSync(path.join(SVG_DIR, file), 'utf8');
    const componentName = file.replace('.svg', '').replace(/-(w)/g, (_, c) => c.toUpperCase()).replace(/^w/, c => c.toUpperCase()) + 'Icon';
    const jsxCode = await transform(svgContent, SVGR_CONFIG, { componentName });
    fs.writeFileSync(path.join(OUT_DIR, \`\${componentName}.tsx\`), jsxCode);
    exports.push(\`export { default as \${componentName} } from './\${componentName}';\`);
    console.log(\`✅ Generated \${componentName}\`);
  }

  fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), exports.join('
') + '
');
  console.log(\`
✅ Barrel file written: \${exports.length} icons\`);
}

buildIcons().catch(console.error);
\`\`\``,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "ConceptMap", "state": "design-system-iconography" }
\`\`\``,

    realworld: `## REAL_WORLD

### How Material Design Manages 2000+ Icons

Google's Material Design icon library ships 2000+ SVG icons used across Google Workspace, Android, and thousands of third-party apps. Their system enforces: consistent 24×24 artboard, 2px stroke for regular weight, optical sizing (smaller icons get thicker strokes automatically), and a named semantic set where every icon has a \`label\` that drives alt text. The system prevents icon proliferation (different teams creating near-identical icons) via a centralised icon review process.

\`\`\`tsx
// Production pattern — Icon system with accessibility contract
// Context: Every icon is either decorative OR communicative — never ambiguous

interface IconProps {
  name: keyof typeof iconMap;    // Typed icon name — TS error on typo
  size?: 16 | 20 | 24 | 32;     // Restricted to design grid sizes
  color?: string;                // Defaults to currentColor for CSS inheritance
  label?: string;                // If provided: aria-label + role="img". If absent: aria-hidden
  className?: string;
}

export function Icon({ name, size = 24, color = 'currentColor', label, className }: IconProps) {
  const SvgIcon = iconMap[name];  // Tree-shaken SVG component per icon

  if (label) {
    // Communicative icon — has semantic meaning
    return (
      <SvgIcon
        role="img"
        aria-label={label}
        width={size}
        height={size}
        fill={color}
        className={className}
      />
    );
  }

  // Decorative icon — hidden from screen readers
  return (
    <SvgIcon
      aria-hidden="true"
      focusable="false"    // IE/Edge fix — SVGs were focusable by default
      width={size}
      height={size}
      fill={color}
      className={className}
    />
  );
}
\`\`\`

### Production Gotcha: SVG Focusable in Legacy Browsers
\`\`\`tsx
// ❌ IE/Edge — SVG receives keyboard focus, screen reader reads SVG source code
<svg width="24" height="24"><path d="..." /></svg>

// ✅ Explicitly exclude from tab order and ARIA tree
<svg width="24" height="24" aria-hidden="true" focusable="false"><path d="..." /></svg>
\`\`\`
**Why it happens:** Internet Explorer and older Edge made SVG elements focusable by default. Even in 2025 some enterprise clients run legacy browsers, and the fix (\`focusable="false"\`) costs nothing.

| Icon Use | aria-hidden | role | label |
|----------|------------|------|-------|
| Decorative (next to text) | true | — | — |
| Standalone meaning | — | img | required |
| Button icon | true | — | button has label |`,

    interview: `## INTERVIEW

**Q1 (Junior): What is the difference between a decorative and a semantic icon?**
A: A decorative icon adds visual flavour alongside text that already communicates the message (e.g. a calendar icon next to the word "Schedule") — it should be hidden from screen readers via \`aria-hidden="true"\`. A semantic icon communicates meaning independently (a standalone delete icon with no text label) — it needs \`role="img"\` and an \`aria-label\`. Confusing the two either floods screen readers with redundant "calendar calendar" announcements or leaves icon-only buttons completely silent to AT users.

**Q2 (Junior): Why should icons use \`currentColor\` as their default fill?**
A: \`currentColor\` inherits the CSS \`color\` property of the parent element, so icon colour automatically follows text colour. This means icons inside a disabled button automatically grey out when the button is disabled (\`color: gray\`), icons inside a dark-mode context automatically invert without any additional props, and interactive states (hover, focus) change icon colour by just changing the parent's \`color\`. Hardcoding a fill colour breaks all three.

**Q3 (Mid): How do you set up tree-shaking for an icon library with 500 icons?**
A: Export each icon as a separate named export from its own file: \`export { DeleteIcon } from './DeleteIcon'\`. A barrel \`index.ts\` re-exports all icons but bundlers (webpack, Rollup, Vite with ES modules) will tree-shake unused exports. Alternatively, use a code-split icon map where \`import('icons/DeleteIcon')\` loads only that SVG's chunk. Never bundle all 500 icons into one file — at ~1KB per SVG, that's 500KB of unused icon data in every bundle.

**Q4 (Mid): What is optical sizing and why does it matter for icon systems?**
A: Optical sizing adjusts stroke weight based on the rendered size — a 16px icon with the same 2px stroke as a 24px icon looks visually heavier at small size. Material Symbols ships variable fonts where the \`OPSZ\` axis automatically adjusts weight for the current size. In SVG icon systems without variable fonts, maintain separate 16px and 24px artboards with different stroke widths.

**Q5 (Senior): How do you govern icon proliferation across a large organisation?**
A: Establish three controls: (1) a centralised icon review board that reviews requests before any new icon is added; (2) a search-first policy requiring teams to prove no existing icon meets the need; (3) a semantic naming convention (action-add, navigation-back, status-warning) that groups icons by purpose and makes duplicates obvious. Without governance, organisations accumulate 40 slightly different "add" icons by different teams.`,

    feynman: `## FEYNMAN CHECK

### Explain Iconography Systems Like I'm 10 Years Old
> Icons are tiny pictograms that take the place of words. A good icon system is like a library of stamps: every stamp is the same size (24×24), the same line thickness, and clearly labelled so you know which one to use. The hard part: some icons are decoration (the calendar next to "Monday") and some are meaning (the only thing telling you a button deletes something). If you treat them the same, blind users either hear "calendar calendar" twice or hear nothing when they need information. This is why every design system has two modes for icons: aria-hidden for decoration, aria-label for meaning.

---

### 5 Deep Questions
**Q1: Why does icon size need to snap to a fixed scale?**
> **A:** Icons are drawn on fixed artboards (16, 20, 24, 32px). At sizes between these, pixel rounding creates blurry or uneven edges. The fixed scale also ensures icons align to the 4/8px spacing grid, preventing fractional pixel offsets that cause inconsistent layouts across browsers.

**Q2: ONE model.**
> **A:** "Every icon is either decoration (aria-hidden) or communication (role=img + aria-label). No icon is both. No icon is neither."

**Q3: Misconception with code.**
> **A:** Icon-only button with no accessible name:
> \`\`\`tsx
> // ❌ SR says "button" — user has no idea what it does
> <button><TrashIcon /></button>
> // ✅ aria-label names the action, icon is decorative
> <button aria-label="Delete item"><TrashIcon aria-hidden="true" focusable="false" /></button>
> \`\`\`

**Q4: How does currentColor enable theming?**
> **A:** \`fill="currentColor"\` cascades from the parent CSS color. Dark mode flips body text to white — icons automatically become white. Disabled state sets parent color to gray — icons automatically gray. Zero icon-specific theme code needed.

**Q5: Senior one-liner.**
> **A:** "An iconography system is a governed catalogue of decorative/communicative SVGs with consistent artboards, currentColor fills, and a binary accessibility contract — decorative = aria-hidden, semantic = role/img + label."`,

    build: `## BUILD

### 🏗️ Mini Project: Icon Component + Accessibility Audit

**What you will build:** A typed Icon component with automatic decoration/communication mode switching, tested with axe-core.
**Time estimate:** 30 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir icon-system && cd icon-system
npx create-next-app@latest . --typescript --tailwind --no-src-dir --app
touch components/Icon.tsx components/Icon.test.tsx
\`\`\`

#### Step 2 — Core
\`\`\`tsx
// components/Icon.tsx
const icons = {
  trash: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
  check: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>,
};
type IconName = keyof typeof icons;
interface IconProps { name: IconName; label?: string; size?: 16|20|24|32; className?: string; }
export function Icon({ name, label, size=24, className }: IconProps) {
  const SvgIcon = icons[name];
  if (label) return <span role="img" aria-label={label} className={className}><SvgIcon /></span>;
  return <span aria-hidden="true" focusable="false" className={className}><SvgIcon /></span>;
}
\`\`\`

#### Step 5 — Tests
\`\`\`tsx
test('decorative icon is hidden from SR', () => {
  render(<Icon name="trash" />);
  expect(document.querySelector('[aria-hidden]')).toBeInTheDocument();
});
test('semantic icon has accessible name', () => {
  render(<Icon name="check" label="Success" />);
  expect(screen.getByRole('img', { name: 'Success' })).toBeInTheDocument();
});
\`\`\`

**Expected Output:**
\`\`\`
✓ decorative icon is hidden from SR
✓ semantic icon has accessible name
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Decorative vs semantic icon — what makes each? How do you implement each in JSX?
**Q2:** Why must standalone icon buttons have an aria-label? What does SR say without one?
**Q3:** Write a 15-line Icon component that handles both modes.

### Day 3
**Q4:** Why use \`currentColor\` not hardcoded fill? Give 3 scenarios it saves work.
**Q5:** Show the SVG focusable bug in IE/Edge and the fix.
**Q6:** Add icon size snapping (16/20/24/32 only) with TypeScript.

### Day 7
**Q7:** Set up tree-shaking for 100 SVG icons. Verify bundle impact with source-map-explorer.
**Q8:** PR adds 15 icon-only buttons — none have aria-labels. Describe the SR experience.
**Q9:** What is optical sizing? Does your icon system need separate artboards per size?

### Day 14
**Q10:** ★ "Design an icon governance process for a company with 50 product teams, preventing icon proliferation."
**Q11:** Link icons → accessibility → design-tokens (currentColor) → component-api.
**Q12:** ★ "Your icon library has 800 icons. Average app bundle includes all 800 even when using 20. How do you fix this?"`
  },

  'input-and-form-components': {
    code: `## CODE

### Level 1 — Beginner: Input with Label & Error
\`\`\`tsx
import { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id: providedId, ...props }: InputProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = \`\${id}-error\`;
  const hintId  = \`\${id}-hint\`;

  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label">{label}</label>
      {hint && <p id={hintId} className="form-field__hint">{hint}</p>}
      <input
        id={id}
        aria-describedby={[hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? 'true' : undefined}
        className={\`input \${error ? 'input--error' : ''}\`}
        {...props}
      />
      {error && <p id={errorId} role="alert" className="form-field__error">{error}</p>}
    </div>
  );
}
\`\`\`

### Level 2 — Intermediate: Select, Textarea & Checkbox
\`\`\`tsx
export function Select({ label, error, options, ...props }: InputProps & { options: Array<{value: string; label: string}> }) {
  const id = useId();
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} aria-invalid={error ? 'true' : undefined} {...props as any}>
        <option value="">Select an option</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export function Checkbox({ label, error, ...props }: Omit<InputProps, 'type'>) {
  const id = useId();
  return (
    <div className="form-field form-field--inline">
      <input type="checkbox" id={id} aria-invalid={error ? 'true' : undefined} {...props} />
      <label htmlFor={id}>{label}</label>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
\`\`\`

### Level 3 — Advanced: Form with React Hook Form
\`\`\`tsx
import { useForm, Controller } from 'react-hook-form'; // npm install react-hook-form

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginForm({ onSubmit }: { onSubmit: (data: LoginFormData) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginFormData>();

  const submit = async (data: LoginFormData) => {
    try {
      await onSubmit(data);
    } catch (err) {
      // Map server errors back to fields
      setError('email', { message: 'Invalid credentials' });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /S+@S+.S+/, message: 'Enter a valid email' },
        })}
      />
      <Input
        label="Password"
        type="password"
        error={errors.password?.message}
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 8, message: 'Password must be at least 8 characters' },
        })}
      />
      <Checkbox label="Remember me" {...register('rememberMe')} />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
\`\`\`

### Level 4 — Expert / Production: Composable Form System
\`\`\`tsx
import { createContext, useContext, useFormContext, FormProvider } from 'react-hook-form';

// Form context — eliminates prop drilling in deeply nested forms
const FormFieldContext = createContext<{ name: string } | null>(null);

export function FormField({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <FormFieldContext.Provider value={{ name }}>
      <div className="form-field">{children}</div>
    </FormFieldContext.Provider>
  );
}

export function FormLabel({ children }: { children: React.ReactNode }) {
  const ctx = useContext(FormFieldContext);
  if (!ctx) throw new Error('FormLabel must be inside FormField');
  return <label htmlFor={ctx.name} className="form-field__label">{children}</label>;
}

export function FormInput({ ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>) {
  const ctx = useContext(FormFieldContext);
  const { register, formState: { errors } } = useFormContext();
  if (!ctx) throw new Error('FormInput must be inside FormField');
  const error = errors[ctx.name]?.message as string | undefined;
  return (
    <>
      <input id={ctx.name} aria-invalid={!!error} {...register(ctx.name)} {...props} className={\`input \${error ? 'input--error' : ''}\`} />
      {error && <p role="alert" className="form-field__error">{error}</p>}
    </>
  );
}

// Usage — clean declarative form with zero prop drilling:
// <FormProvider {...methods}>
//   <FormField name="email">
//     <FormLabel>Email</FormLabel>
//     <FormInput type="email" />
//   </FormField>
// </FormProvider>
\`\`\``,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "StateMachine", "state": "design-system-input-states" }
\`\`\``,

    realworld: `## REAL_WORLD

### How Stripe Elements Implements Form Inputs

Stripe Elements processes $1T/year. Their form components prioritise: error state clarity (which field failed, what specifically is wrong), real-time validation (on blur, not just on submit), PCI compliance (card fields in isolated iframes), and mobile-first keyboard types (\`inputmode="numeric"\` for card numbers). Their open-source contribution to form accessibility is the pattern: every input has an id, every label uses \`htmlFor\`, every error has a unique id referenced by \`aria-describedby\`.

\`\`\`tsx
// Production pattern — accessible text input with full state machine
interface TextInputProps {
  id: string;                // Required — for label association
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;            // Error message — shown below, aria-describedby linked
  hint?: string;             // Helper text — shown below, aria-describedby linked
  required?: boolean;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url';
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'url';
  autoComplete?: string;
  placeholder?: string;      // Never the label — empty field problem
}

export function TextInput({
  id, label, value, onChange, error, hint, required, disabled, type='text', inputMode, autoComplete
}: TextInputProps) {
  const errorId = error ? \`\${id}-error\` : undefined;
  const hintId  = hint  ? \`\${id}-hint\`  : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="input-field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : undefined}  // SR announces invalid state
        aria-describedby={describedBy}              // Links to hint + error text
        autoComplete={autoComplete}
        className={['input', error ? 'input--error' : ''].join(' ')}
      />

      {hint  && <p id={hintId}  className="input__hint">{hint}</p>}
      {error && <p id={errorId} className="input__error" role="alert">{error}</p>}
    </div>
  );
}
\`\`\`

### Production Gotcha: Placeholder as Label
\`\`\`tsx
// ❌ Placeholder disappears on focus — user forgets what field is for
<input placeholder="Email address" />

// ✅ Visible label always present — placeholder for format hint only
<TextInput id="email" label="Email address" placeholder="you@example.com" />
\`\`\`
**Why it happens:** Designers remove labels to save vertical space. When the user starts typing, the field name disappears, causing completion errors in multi-field forms.

| State | aria-invalid | Error shown |
|-------|-------------|-------------|
| Pristine | — | No |
| Valid | false | No |
| Invalid | true | Yes |
| Disabled | — | No |`,

    interview: `## INTERVIEW

**Q1 (Junior): Why must every input have a \`<label>\` with a \`htmlFor\` matching the input's \`id\`?**
A: The label-for-id association gives the input an accessible name that screen readers announce (e.g. "Email address, edit text"). Without it, screen readers say only "edit text" or "text field" — the user has no idea what to type. The association also increases the click target: clicking the label text focuses the input, which is critical for touch users and users with motor disabilities. Using placeholder as the only label breaks both of these.

**Q2 (Junior): What is \`aria-describedby\` and why do inputs use it for error messages?**
A: \`aria-describedby\` links an element to a description text by ID. When a screen reader focuses an input with \`aria-describedby="email-error"\`, it reads the input's label first, then appends the referenced text ("Email address, enter a valid email address"). This means the error message is always associated with the correct field, even if the user navigates directly to the input — unlike an error message displayed above the form that loses its field context.

**Q3 (Mid): What is the correct validation trigger — onChange, onBlur, or onSubmit?**
A: Best practice: show hints on focus, validate on blur (after the user leaves the field), and re-validate on change only once an error is already showing. Validating on every keystroke while typing (onChange) shows error states before the user finishes, which is confusing and frustrating. Validating only on submit means errors appear late, leaving users unsure which field failed. The blur-first pattern matches user mental models: "I've finished with this field; check it."

**Q4 (Mid): How do you associate multiple hint and error texts with one input?**
A: \`aria-describedby\` accepts a space-separated list of IDs: \`aria-describedby="email-hint email-error"\`. The SR reads all referenced elements in order. Assign separate IDs to hint and error elements, populate the attribute dynamically based on which exist. The order matters: put hint first (positive context) then error (correction needed).

**Q5 (Senior): How do you build a form component system that enforces consistent validation UX across 200 teams?**
A: Centralise validation in the TextInput contract: \`validate: (value: string) => string | null\`. The component owns when validation runs (blur-first) and how errors display (aria-describedby, role="alert"). Teams provide the validation logic; the component provides the UX contract. For complex forms, use a form library (React Hook Form, Formik) and build adapters: the design system's TextInput renders whatever state the form library provides, but always in the same accessible pattern.`,

    feynman: `## FEYNMAN CHECK

### Explain Input Components Like I'm 10 Years Old
> A form input is like a post box with a label on it. The label tells you what to put in ("Street address"), the slot is where you type it, and the red error note below tells you if you put in the wrong thing. The tricky part: if the label is the placeholder (the grey ghost text inside the box), it disappears when you start typing — and suddenly you're shouting into an unknown box. This is why form accessibility rules say: always show the label outside the box. Screen readers need to announce "Street address" when you focus, not "text field".

---

### 5 Deep Questions
**Q1: Why is placeholder-only labelling a WCAG violation?**
> **A:** WCAG 1.3.5 requires all form inputs to have programmatically determinable labels. A \`placeholder\` has no semantic association with the input — screen readers do not consistently read placeholders as labels. When users focus an input, the placeholder disappears, removing all context. A visible \`<label>\` with \`htmlFor\` solves both issues: it is always visible and programmatically associated.

**Q2: ONE model for form input states.**
> **A:** "Pristine → Focused (hint) → Touched → Valid/Invalid (error+aria-invalid). Never show error before user touches the field."

**Q3: Misconception with code.**
> **A:** Required indicator is colour-only:
> \`\`\`tsx
> // ❌ Red asterisk — invisible to colour-blind users and SR
> <label style={{color:'red'}}>*</label>
> // ✅ Visible + SR text
> <span aria-hidden="true"> *</span><span className="sr-only">(required)</span>
> \`\`\`

**Q4: How does React Hook Form interact with accessible input components?**
> **A:** RHF provides \`register\` which spreads \`ref\`, \`name\`, \`onChange\`, \`onBlur\`, and \`error\` state. The design system input accepts these as props. The component owns display (aria-invalid, error text, describedby); RHF owns state and validation timing. The split of concerns works because both agree on the same state shape.

**Q5: Senior one-liner.**
> **A:** "A form input is a state machine (pristine/focused/touched/valid/invalid) that must expose its current state to both visual users (colour/icon/message) and AT users (aria-invalid + aria-describedby) — which is why placeholder-as-label is a WCAG failure, not just a UX preference."`,

    build: `## BUILD

### 🏗️ Mini Project: Full Form with Accessible Validation

**What you will build:** A login form with accessible email+password inputs, blur-first validation, and aria-live error announcements.
**Time estimate:** 45 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir form-a11y && cd form-a11y
npx create-next-app@latest . --typescript --tailwind --no-src-dir --app
npm install react-hook-form
touch components/TextInput.tsx app/page.tsx
\`\`\`

#### Step 2 — Core TextInput
\`\`\`tsx
export function TextInput({ id, label, error, hint, required, ...rest }: TextInputProps) {
  const errorId = error ? \`\${id}-error\` : undefined;
  const hintId  = hint  ? \`\${id}-hint\`  : undefined;
  return (
    <div>
      <label htmlFor={id}>{label}{required && <><span aria-hidden="true"> *</span><span className="sr-only"> required</span></>}</label>
      <input id={id} aria-invalid={!!error||undefined} aria-describedby={[hintId,errorId].filter(Boolean).join(' ')||undefined} {...rest} />
      {hint  && <p id={hintId}>{hint}</p>}
      {error && <p id={errorId} role="alert" className="text-red-600">{error}</p>}
    </div>
  );
}
\`\`\`

#### Step 3 — Form Page
\`\`\`tsx
export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<{email:string;password:string}>();
  return (
    <form onSubmit={handleSubmit(console.log)}>
      <TextInput id="email" label="Email" type="email" required error={errors.email?.message} hint="We'll never share your email" {...register('email',{required:'Email is required',pattern:{value:/\S+@\S+/,message:'Enter a valid email'}})} />
      <TextInput id="password" label="Password" type="password" required error={errors.password?.message} {...register('password',{required:'Password is required',minLength:{value:8,message:'Min 8 characters'}})} />
      <button type="submit">Sign in</button>
    </form>
  );
}
\`\`\`

#### Step 5 — Tests
\`\`\`tsx
test('shows error with aria-invalid on blur', async () => {
  render(<LoginPage />);
  fireEvent.blur(screen.getByLabelText('Email'));
  await screen.findByRole('alert');
  expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid','true');
});
\`\`\`
**Expected Output:** ✓ shows error with aria-invalid`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Three ARIA attributes every accessible input needs — name, function, each.
**Q2:** Why placeholder-as-label is a WCAG violation.
**Q3:** Write a 20-line TextInput with label, hint, and error.

### Day 3
**Q4:** onChange vs onBlur vs onSubmit — when to validate?
**Q5:** Required indicator colour-only bug + fix.
**Q6:** Multiple hint+error with one aria-describedby.

### Day 7
**Q7:** Build a form with 5 fields, all accessible, blur-first validation.
**Q8:** PR uses placeholder as label in 30 form components — WCAG impact.
**Q9:** Integrate React Hook Form with the design system TextInput contract.

### Day 14
**Q10:** ★ "Design a form system for 200 teams that enforces consistent accessible validation — what does the API contract look like?"
**Q11:** Link inputs → a11y → RHF → design-tokens.
**Q12:** ★ "A checkout form has a 15% abandonment rate traced to confusing validation. How do form component design choices fix this at a design system level?"`
  },

  'modal-and-overlay': {
    code: `## CODE

### Level 1 — Beginner: Basic Modal with Portal
\`\`\`tsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) dialogRef.current?.showModal(); // Native <dialog> handles focus trap + backdrop
    else        dialogRef.current?.close();
  }, [isOpen]);

  // Close on Escape (native <dialog> does this automatically)
  const handleClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose(); // Close when clicking backdrop
  };

  if (!isOpen) return null;

  return createPortal(
    <dialog ref={dialogRef} onClose={onClose} onClick={handleClick} className="modal">
      <div className="modal__content" onClick={e => e.stopPropagation()}>
        <header className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="modal__close">×</button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </dialog>,
    document.body
  );
}
\`\`\`

### Level 2 — Intermediate: Drawer & Sheet
\`\`\`tsx
type DrawerSide = 'left' | 'right' | 'bottom';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side?: DrawerSide;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, side = 'right', title, children }: DrawerProps) {
  // Body scroll lock when drawer is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={\`overlay \${isOpen ? 'overlay--visible' : ''}\`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={\`drawer drawer--\${side} \${isOpen ? 'drawer--open' : ''}\`}
      >
        <header className="drawer__header">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close drawer">×</button>
        </header>
        <div className="drawer__body">{children}</div>
      </div>
    </>,
    document.body
  );
}
\`\`\`

### Level 3 — Advanced: Confirmation Dialog with Promise API
\`\`\`tsx
import { useCallback, useRef, useState } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
}

// Promise-based confirm — replaces window.confirm() with branded dialog
export function useConfirm() {
  const [state, setState] = useState<{ options: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => setState({ options, resolve }));
  }, []);

  const handleResponse = (confirmed: boolean) => {
    state?.resolve(confirmed);
    setState(null);
  };

  const ConfirmDialog = state ? (
    <Modal isOpen title={state.options.title} onClose={() => handleResponse(false)}>
      <p>{state.options.message}</p>
      <div className="modal__footer">
        <button onClick={() => handleResponse(false)}>{state.options.cancelLabel ?? 'Cancel'}</button>
        <button
          onClick={() => handleResponse(true)}
          className={\`btn btn--\${state.options.variant === 'danger' ? 'danger' : 'primary'}\`}
          autoFocus // Focus confirm button so Enter confirms
        >
          {state.options.confirmLabel ?? 'Confirm'}
        </button>
      </div>
    </Modal>
  ) : null;

  return { confirm, ConfirmDialog };
}

// Usage:
// const { confirm, ConfirmDialog } = useConfirm();
// const ok = await confirm({ title: 'Delete item?', message: 'This cannot be undone.', variant: 'danger' });
// if (ok) deleteItem();
\`\`\`

### Level 4 — Expert / Production: Radix Dialog Integration
\`\`\`tsx
import * as Dialog from '@radix-ui/react-dialog'; // npm install @radix-ui/react-dialog
import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef } from 'react';

// Production-grade modal using Radix (handles: focus trap, scroll lock, a11y, animations)
interface ModalSize { width: string; maxHeight: string; }
const MODAL_SIZES: Record<'sm' | 'md' | 'lg' | 'xl' | 'full', ModalSize> = {
  sm:   { width: '360px',  maxHeight: '80vh' },
  md:   { width: '480px',  maxHeight: '80vh' },
  lg:   { width: '640px',  maxHeight: '85vh' },
  xl:   { width: '800px',  maxHeight: '90vh' },
  full: { width: '95vw',   maxHeight: '95vh' },
};

interface ProductionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: keyof typeof MODAL_SIZES;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function ProductionModal({ open, onOpenChange, title, description, size = 'md', children, footer }: ProductionModalProps) {
  const { width, maxHeight } = MODAL_SIZES[size];
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="modal-panel"
                style={{ width, maxHeight }}
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1,    y: 0 }}
                exit={{    opacity: 0, scale: 0.95,  y: 8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <header className="modal-panel__header">
                  <Dialog.Title className="modal-panel__title">{title}</Dialog.Title>
                  {description && <Dialog.Description className="modal-panel__desc">{description}</Dialog.Description>}
                  <Dialog.Close asChild>
                    <button className="modal-panel__close" aria-label="Close">×</button>
                  </Dialog.Close>
                </header>
                <div className="modal-panel__body" style={{ overflowY: 'auto' }}>{children}</div>
                {footer && <footer className="modal-panel__footer">{footer}</footer>}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
\`\`\``,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "StateMachine", "state": "design-system-modal-states" }
\`\`\``,

    realworld: `## REAL_WORLD

### How GitHub's Modal Pattern Enforces Focus Trapping

GitHub uses modals across 200M+ user sessions for file creation, PR review confirmations, and repository settings. Their Primer design system solved the two most common modal failures in production: (1) keyboard users escaping the modal into background content (missing focus trap), and (2) modals triggering twice when confirmations auto-dismiss (missing return-focus on close). They use \`@primer/behaviors\` (open-source) for focus trapping, which handles edge cases like dynamically added focusable elements.

\`\`\`tsx
// Production pattern — Accessible modal with focus trap and scroll lock
import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId   = useId();  // Stable id for aria-labelledby

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();          // Native <dialog> handles focus trap + ESC key + scroll lock
      document.body.style.overflow = 'hidden';  // Prevent background scroll
    } else {
      dialog.close();
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}   // SR reads title on modal open
      aria-modal="true"           // Explicitly marks as modal (some AT need this)
      onClose={onClose}           // Fires on ESC key — native behaviour
      className={\`modal modal--\${size}\`}
    >
      <div className="modal__header">
        <h2 id={titleId}>{title}</h2>
        <button aria-label="Close dialog" onClick={onClose}>×</button>
      </div>
      <div className="modal__body">{children}</div>
    </dialog>
  );
}
\`\`\`

### Production Gotcha: Focus Not Returned on Modal Close
\`\`\`tsx
// ❌ Modal closes, focus lands on body — keyboard user lost
function App() {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(true)}>Open</button><Modal isOpen={open} onClose={() => setOpen(false)} /></>;
}

// ✅ Native <dialog>.close() automatically returns focus to the opener — use it!
// If using a div-based modal, save ref to trigger and focus it on close:
const triggerRef = useRef<HTMLButtonElement>(null);
const handleClose = () => { setOpen(false); triggerRef.current?.focus(); };
\`\`\`
**Why it happens:** Custom modal implementations (div + aria-modal) do not return focus automatically. Native \`<dialog>\` element handles this correctly — prefer it.

| Requirement | Native dialog | div+ARIA |
|-------------|--------------|---------|
| Focus trap | ✅ built-in | Manual |
| ESC to close | ✅ built-in | Manual |
| Return focus | ✅ built-in | Manual |
| Backdrop | Manual | Manual |`,

    interview: `## INTERVIEW

**Q1 (Junior): What is a focus trap and why do modals require one?**
A: A focus trap restricts keyboard Tab navigation to within a specific container (the modal), preventing the user from accidentally focusing elements in the background while the modal is open. Without it, a keyboard user pressing Tab can exit the modal and interact with background content that is supposed to be inert, reading out form fields and buttons that shouldn't be accessible. WCAG 2.1.1 requires keyboard-only navigation to work correctly, and an untapped modal fails this criterion.

**Q2 (Junior): What is the correct role for a modal dialog?**
A: Use the native \`<dialog>\` element (role="dialog" implicitly) or \`role="dialog"\` on a div. Add \`aria-labelledby\` pointing to the modal's heading ID so screen readers announce the title on open. Add \`aria-modal="true"\` to tell screen readers the dialog is modal (though native \`<dialog>\` implies this). For alert dialogs (irreversible actions), use \`role="alertdialog"\` — screen readers announce it more urgently.

**Q3 (Mid): What are the differences between a modal, a drawer, a popover, and a tooltip?**
A: Modal (role=dialog, aria-modal=true): Blocks all background interaction, requires explicit close. Drawer: Slides in from edge, same semantics as modal. Popover: Anchored to a trigger, closes on click-outside, does not block background (role=dialog or none). Tooltip: Ephemeral, appears on hover/focus, role=tooltip, no interactive content, auto-dismissed. The key rule: if background interaction is blocked, it's a modal and needs full focus trap semantics.

**Q4 (Mid): How do you prevent background scroll when a modal is open?**
A: Set \`document.body.style.overflow = 'hidden'\` on open, restore to empty string on close. On iOS Safari, this alone is insufficient — the page scrolls via momentum scrolling. The iOS fix: set \`position: fixed\` and \`top: -scrollY\` on the body, then restore \`scrollY\` on close. Alternatively, use the native \`<dialog>\` element which handles this correctly.

**Q5 (Senior): How do you implement a modal that opens from a dynamic list item that may be removed from the DOM?**
A: If the trigger element is removed while the modal is open, returning focus to it on close will fail silently. Save a fallback focus target (e.g. the list container or page main heading) and use it if the original trigger is no longer in the DOM: \`const target = triggerRef.current?.isConnected ? triggerRef.current : fallbackRef.current; target?.focus();\`. This scenario occurs in virtualized lists where off-screen rows unmount.`,

    feynman: `## FEYNMAN CHECK

### Explain Modals Like I'm 10 Years Old
> A modal is a locked room you open by clicking a button. While you're in the room, all the doors to the rest of the house are locked — you can only move around inside. When you leave, you come back exactly where you entered. For keyboard users, this means Tab stays inside the modal; ESC unlocks the room; and when it closes, your cursor goes back to the button you clicked. The non-obvious part: this "locking" isn't free — a custom div modal has zero lock functionality. The native HTML \`<dialog>\` element locks automatically and returns you home for free.

---

### 5 Deep Questions
**Q1: Why does the native \`<dialog>\` element exist and what does it do for free?**
> **A:** The native \`<dialog>\` gives you: focus trap within the element, ESC key close firing \`onClose\`, focus return to trigger element on close, and \`::backdrop\` CSS pseudo-element for the overlay. Before \`<dialog>\`, all of these required complex JavaScript with edge cases. Browser support is now universal (Chrome 37+, Firefox 98+, Safari 15.4+).

**Q2: ONE model.**
> **A:** "Every modal needs: trap focus in, return focus out, ESC close, aria-labelledby title, aria-modal. Use native \`<dialog>\` to get the first three free."

**Q3: Misconception with code.**
> **A:** Using autofocus on destructive modal action:
> \`\`\`tsx
> // ❌ Autofocuses "Delete" — accidental Enter press deletes
> <Modal><button autoFocus>Delete Account</button><button>Cancel</button></Modal>
> // ✅ Autofocus the safe/cancel action or the heading
> <Modal><h2 id="title" tabIndex={-1} autoFocus>Delete Account?</h2>...</Modal>
> \`\`\`

**Q4: How does scroll lock interact with iOS Safari?**
> **A:** iOS Safari has inertia scrolling that continues even after \`overflow:hidden\` is set. Fix: store scroll position, set \`body {position:fixed; top:-Xpx}\` on open, restore on close. Or use native \`<dialog>\` which handles iOS correctly.

**Q5: Senior one-liner.**
> **A:** "A modal is a focus-trapped, aria-labelled dialog that returns focus to its trigger on close — native \`<dialog>\` provides trap+return+ESC for free, which is why custom div modals cause 80% of keyboard accessibility bugs in apps."`,

    build: `## BUILD

### 🏗️ Mini Project: Accessible Modal with Native dialog

**What you will build:** A reusable Modal using the native \`<dialog>\` element with focus management, scroll lock, and axe-core verification.
**Time estimate:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir modal && cd modal
npx create-next-app@latest . --typescript --tailwind --no-src-dir --app
touch components/Modal.tsx
\`\`\`

#### Step 2 — Core
\`\`\`tsx
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  useEffect(() => {
    const d = ref.current; if(!d) return;
    if(isOpen){ d.showModal(); document.body.style.overflow='hidden'; }
    else { d.close(); document.body.style.overflow=''; }
  }, [isOpen]);
  return (
    <dialog ref={ref} aria-labelledby={titleId} aria-modal="true" onClose={onClose}
      className="rounded-lg shadow-xl p-6 backdrop:bg-black/50 max-w-lg w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
        <button aria-label="Close" onClick={onClose}>✕</button>
      </div>
      {children}
    </dialog>
  );
}
\`\`\`

#### Step 5 — Tests
\`\`\`tsx
test('traps focus inside modal', async () => {
  render(<><button id="trigger">Open</button><Modal isOpen title="Test" onClose={()=>{}}><button>Inside</button></Modal></>);
  expect(document.activeElement?.closest('dialog')).toBeInTheDocument();
});
test('passes axe', async () => {
  const {container}=render(<Modal isOpen title="Confirm" onClose={()=>{}}><p>Body</p></Modal>);
  expect(await axe(container)).toHaveNoViolations();
});
\`\`\`

**Expected Output:**
\`\`\`
✓ traps focus inside modal
✓ passes axe
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** 5 things a modal needs for keyboard accessibility.
**Q2:** What does native \`<dialog>\` give for free?
**Q3:** Write a 20-line accessible modal in TSX.

### Day 3
**Q4:** Modal vs popover vs tooltip — when does each apply?
**Q5:** Missing return-focus bug — show and fix.
**Q6:** Add scroll lock that works on iOS Safari.

### Day 7
**Q7:** Build a confirm dialog (role=alertdialog) with keyboard-accessible confirm/cancel.
**Q8:** PR uses div+aria-modal without focus trap — describe keyboard UX failure.
**Q9:** How do you handle focus return when the trigger is removed from DOM?

### Day 14
**Q10:** ★ "Design a modal system for a design system — what states, variants, and accessibility contracts does it need?"
**Q11:** Link modal → focus-management → a11y → native-dialog.
**Q12:** ★ "Your app opens modals from a virtualised 10k-row table. Row unmounts on scroll. How do you ensure focus return on modal close?"`
  },

  'navigation-components': {
    code: `## CODE

### Level 1 — Beginner: Accessible Navigation Bar
\`\`\`tsx
interface NavItem { label: string; href: string; }

interface NavBarProps {
  items: NavItem[];
  currentPath: string;
  logo?: React.ReactNode;
}

export function NavBar({ items, currentPath, logo }: NavBarProps) {
  return (
    <header>
      <nav aria-label="Main navigation">
        {logo && <div className="nav__logo" aria-hidden="true">{logo}</div>}
        <ul className="nav__list" role="list">
          {items.map(item => {
            const isCurrent = currentPath === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isCurrent ? 'page' : undefined} // Screen reader announces "current page"
                  className={\`nav__link \${isCurrent ? 'nav__link--active' : ''}\`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
\`\`\`

### Level 2 — Intermediate: Breadcrumb & Tabs
\`\`\`tsx
interface BreadcrumbItem { label: string; href?: string; }

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="breadcrumb__item">
              {isLast || !item.href
                ? <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
                : <a href={item.href}>{item.label}</a>
              }
              {!isLast && <span aria-hidden="true" className="breadcrumb__separator">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface Tab { id: string; label: string; content: React.ReactNode; }

export function Tabs({ tabs, defaultTab }: { tabs: Tab[]; defaultTab?: string }) {
  const [activeTab, setActiveTab] = React.useState(defaultTab ?? tabs[0]?.id);
  return (
    <div>
      <div role="tablist" className="tabs__list">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            id={\`tab-\${tab.id}\`}
            aria-controls={\`panel-\${tab.id}\`}
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={\`tab \${activeTab === tab.id ? 'tab--active' : ''}\`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map(tab => (
        <div
          key={tab.id}
          role="tabpanel"
          id={\`panel-\${tab.id}\`}
          aria-labelledby={\`tab-\${tab.id}\`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
\`\`\`

### Level 3 — Advanced: Dropdown Navigation with Keyboard
\`\`\`tsx
import { useRef, useState, useEffect } from 'react';

interface DropdownNavProps {
  label: string;
  items: NavItem[];
}

export function DropdownNav({ label, items }: DropdownNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<HTMLAnchorElement[]>([]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); itemRefs.current[index + 1]?.focus(); break;
      case 'ArrowUp':   e.preventDefault();
        if (index === 0) buttonRef.current?.focus();
        else itemRefs.current[index - 1]?.focus();
        break;
      case 'Escape':    setIsOpen(false); buttonRef.current?.focus(); break;
      case 'Tab':       setIsOpen(false); break;
    }
  };

  return (
    <div ref={containerRef} className="dropdown-nav">
      <button
        ref={buttonRef}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(v => !v)}
        className="dropdown-nav__trigger"
      >
        {label} <span aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <ul role="menu" className="dropdown-nav__menu">
          {items.map((item, i) => (
            <li key={item.href} role="none">
              <a
                href={item.href}
                role="menuitem"
                ref={el => { if (el) itemRefs.current[i] = el; }}
                onKeyDown={e => handleKeyDown(e, i)}
                className="dropdown-nav__item"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
\`\`\`

### Level 4 — Expert / Production: Sidebar Navigation with Collapse
\`\`\`tsx
import { useState, useCallback } from 'react';

interface NavSection { id: string; label: string; icon: React.ReactNode; items: NavItem[]; }

interface SidebarNavProps {
  sections: NavSection[];
  currentPath: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function SidebarNav({ sections, currentPath, collapsed = false, onCollapsedChange }: SidebarNavProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(sections.filter(s => s.items.some(i => i.href === currentPath)).map(s => s.id))
  );

  const toggleSection = useCallback((id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  return (
    <nav
      aria-label="Sidebar navigation"
      className={\`sidebar-nav \${collapsed ? 'sidebar-nav--collapsed' : ''}\`}
    >
      <button
        onClick={() => onCollapsedChange?.(!collapsed)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="sidebar-nav__toggle"
      >
        {collapsed ? '→' : '←'}
      </button>

      {sections.map(section => {
        const isExpanded = expandedSections.has(section.id);
        const hasActive = section.items.some(i => i.href === currentPath);

        return (
          <div key={section.id} className="sidebar-nav__section">
            <button
              onClick={() => toggleSection(section.id)}
              aria-expanded={isExpanded}
              aria-current={hasActive ? 'true' : undefined}
              className={\`sidebar-nav__section-header \${hasActive ? 'sidebar-nav__section-header--active' : ''}\`}
            >
              <span aria-hidden="true" className="sidebar-nav__icon">{section.icon}</span>
              {!collapsed && <span className="sidebar-nav__label">{section.label}</span>}
            </button>

            {!collapsed && isExpanded && (
              <ul className="sidebar-nav__items">
                {section.items.map(item => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={currentPath === item.href ? 'page' : undefined}
                      className={\`sidebar-nav__item \${currentPath === item.href ? 'sidebar-nav__item--active' : ''}\`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
\`\`\``,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "FlowChart", "state": "design-system-navigation" }
\`\`\``,

    realworld: `## REAL_WORLD

### How Vercel's Navigation Implements Active State + Keyboard Patterns

Vercel's dashboard nav serves millions of developer sessions daily. Their design system encodes active state (current page highlighted) via \`aria-current="page"\` — not just CSS class — so screen readers announce "Deployments, current page" when navigating. Their keyboard pattern: Tab moves between top-level items; arrow keys navigate within a dropdown; Home/End jump to first/last.

\`\`\`tsx
// Production pattern — Accessible navigation with active state
interface NavItem { href: string; label: string; icon?: React.ReactNode; }

function NavLink({ href, label, icon }: NavItem) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <a
      href={href}
      aria-current={isActive ? 'page' : undefined}  // SR announces "current page"
      className={['nav-link', isActive ? 'nav-link--active' : ''].join(' ')}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {label}
    </a>
  );
}

// Sidebar nav with landmark
function SidebarNav({ items }: { items: NavItem[] }) {
  return (
    <nav aria-label="Main navigation">  {/* Landmark — SR users can jump to it */}
      <ul role="list">
        {items.map(item => (
          <li key={item.href}>
            <NavLink {...item} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
\`\`\`

### Production Gotcha: Multiple \`<nav>\` Without Labels
\`\`\`tsx
// ❌ Two unlabelled navs — SR user sees "navigation, navigation" — can't distinguish
<nav><ul>...</ul></nav>
<nav><ul>...</ul></nav>  {/* footer nav */}

// ✅ aria-label distinguishes landmarks
<nav aria-label="Main navigation"><ul>...</ul></nav>
<nav aria-label="Footer navigation"><ul>...</ul></nav>
\`\`\`
**Why it happens:** Developers add a second nav without labelling either — screen readers list landmarks alphabetically, and duplicate "navigation" entries are indistinguishable.

| Pattern | ARIA | Notes |
|---------|------|-------|
| Current page | aria-current="page" | SR announces current |
| Skip link | href="#main" | First interactive element |
| Landmark | role=navigation (nav) | One per distinct nav area |`,

    interview: `## INTERVIEW

**Q1 (Junior): What is \`aria-current="page"\` and why is it better than a CSS class for active state?**
A: \`aria-current="page"\` is an ARIA attribute that tells screen readers the linked item represents the current page the user is on. Screen readers announce it as "link, Deployments, current page" — the user knows where they are without visual context. A CSS class like \`.active\` is purely visual; screen readers see no semantic difference between active and inactive links. Both should be used together.

**Q2 (Junior): Why must navigation use a \`<nav>\` landmark element?**
A: The \`<nav>\` element (role=navigation) is a landmark that screen readers list in their landmarks menu, letting users jump directly to navigation without tabbing through all content. JAWS and NVDA list "Navigation" in their landmarks panel. Without it, keyboard users must Tab through all page content to reach the nav. When multiple \`<nav>\` elements exist, each must have a unique \`aria-label\` to distinguish them in the landmarks list.

**Q3 (Mid): How do you implement keyboard navigation for a dropdown menu?**
A: Top-level items are Tab-navigable. Arrow keys navigate within an open dropdown. Enter/Space opens a closed dropdown. ESC closes the dropdown and returns focus to the trigger. Home/End jump to first/last items. This follows the ARIA Authoring Practices Guide (APG) menu button pattern. The full implementation requires managing a \`aria-expanded\` attribute on the trigger and \`aria-haspopup="true"\` to signal the dropdown exists.

**Q4 (Mid): What is a skip link and how do you implement it?**
A: A skip link is a visually-hidden anchor at the very beginning of every page (\`position: absolute; top: -100px\`) that becomes visible on keyboard focus (\`focus { top: 0 }\`). It links to the main content landmark (\`#main-content\`), letting keyboard users bypass repeated navigation. WCAG 2.4.1 requires a bypass mechanism for blocks of repeated content — a skip link is the standard implementation.

**Q5 (Senior): How do you handle active state in a client-side router like Next.js App Router?**
A: Use \`usePathname()\` from \`next/navigation\` and compare to the link's \`href\`. For exact matches: \`pathname === href\`. For section matches: \`pathname.startsWith(href + '/')\`. Apply both CSS active class AND \`aria-current="page"\`. In the App Router, \`usePathname\` updates on client navigation, so the active state is always in sync without a page reload. For nested routes, the parent path should show an intermediate active state, not full \`aria-current\`.`,

    feynman: `## FEYNMAN CHECK

### Explain Navigation Components Like I'm 10 Years Old
> Navigation is the building's directory — a list of rooms with arrows pointing to each. The current room is highlighted. For blind users, \`aria-current="page"\` is the voice that says "you are here." The building has one main entrance (skip link) so visitors don't have to walk past every room every visit. The non-obvious part: two navigation menus on the same page look the same to a screen reader unless you label them differently — "main" and "footer" navigation must have names, or the visitor hears "navigation...navigation" with no idea which is which.

---

### 5 Deep Questions
**Q1: Why does \`<nav>\` need \`aria-label\` when multiple navs exist?**
> **A:** Landmark navigation is listed in SR landmark menus. Two unlabelled \`<nav>\` elements both appear as "navigation" — indistinguishable. \`aria-label="Main navigation"\` and \`aria-label="Footer navigation"\` make each identifiable. WCAG 2.4.6 requires sections to have descriptive headings/labels so users can orient themselves.

**Q2: ONE model.**
> **A:** "Nav = landmark + labelled links + skip + current. Miss any one and keyboard users lose orientation."

**Q3: Misconception.**
> **A:** Active class without aria-current — SR users don't know their location.
> \`\`\`tsx
> // ❌ Only visual signal
> <a className={isActive ? 'active' : ''}>Dashboard</a>
> // ✅ Semantic signal too
> <a aria-current={isActive ? 'page' : undefined} className={isActive ? 'active' : ''}>Dashboard</a>
> \`\`\`

**Q4: How does client-side routing change navigation accessibility?**
> **A:** SPA route changes don't trigger page title updates or SR announcement. Fix: update \`document.title\` on route change, and move focus to the new page's main heading or \`<main>\` element so SR announces the new page. Next.js App Router does this partially; full SR announcement requires explicit focus management.

**Q5: Senior one-liner.**
> **A:** "Navigation components combine landmark semantics, skip links, aria-current, and keyboard patterns — the missing pieces (duplicate unlabelled navs, missing skip link, visual-only active) each exclude a different group of users."`,

    build: `## BUILD

### 🏗️ Mini Project: Accessible Sidebar Navigation

**What you will build:** A sidebar nav with aria-current active state, skip link, and keyboard accessibility — verified with axe.
**Time estimate:** 30 minutes

#### Step 2 — Core
\`\`\`tsx
export function SidebarNav({ items }: { items: {href:string;label:string}[] }) {
  const path = usePathname();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded z-50">
        Skip to main content
      </a>
      <nav aria-label="Main navigation">
        <ul role="list" className="flex flex-col gap-1">
          {items.map(item => (
            <li key={item.href}>
              <a href={item.href} aria-current={path===item.href?'page':undefined}
                className={['flex items-center px-4 py-2 rounded-md', path===item.href ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-gray-100'].join(' ')}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
\`\`\`

#### Step 5 — Tests
\`\`\`tsx
test('active link has aria-current=page', () => {
  mockPathname('/dashboard');
  render(<SidebarNav items={[{href:'/dashboard',label:'Dashboard'},{href:'/settings',label:'Settings'}]} />);
  expect(screen.getByRole('link',{name:'Dashboard'})).toHaveAttribute('aria-current','page');
  expect(screen.getByRole('link',{name:'Settings'})).not.toHaveAttribute('aria-current');
});
\`\`\`
**Expected Output:** ✓ active link has aria-current=page`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** What ARIA makes a link "current page"? What does SR announce?
**Q2:** Why label multiple navs differently?
**Q3:** Write a 15-line SidebarNav with aria-current.

### Day 3
**Q4:** Skip link — why, where, how?
**Q5:** Two unlabelled navs bug — fix.
**Q6:** Add keyboard dropdown (arrow/ESC/Enter).

### Day 7
**Q7:** Build a breadcrumb with aria-label="Breadcrumb" and aria-current="page" on last item.
**Q8:** SPA route change — what does SR miss and how do you fix it?
**Q9:** Mobile nav hamburger — what ARIA does the toggle button need?

### Day 14
**Q10:** ★ "Design a navigation system for a large SaaS with sidebar, breadcrumbs, and in-page tabs — what landmarks and ARIA are needed?"
**Q11:** Link nav → skip-links → landmarks → a11y → SPA.
**Q12:** ★ "Global navigation serves 200 product teams. A PR removes aria-current from the active link. What % of users are affected and how?"`
  },

  'storybook': {
    feynman: `## FEYNMAN CHECK

### Explain Storybook Like I'm 10 Years Old
> Storybook is a showroom for components — every component lives in its own window, in every possible state, without needing a full app around it. You can click through the "loading state" story, the "empty state" story, and the "error state" story without setting up a database. The non-obvious part: Storybook forces you to think about what states your component has, because you must write them explicitly as stories. A component with 47 undocumented states gets exposed immediately. This is why Storybook is as much a design tool as a documentation tool.

---

### 5 Deep Questions
**Q1: What is the "story" mental model?**
> **A:** A story is a named, reproducible snapshot of a component in a specific state with specific props. It is a living documentation entry AND an isolated test case. The discipline: every meaningful prop combination that represents a real product use case should have a story. "Loading", "Empty", "Error", "Populated", "Disabled" are stories, not developer afterthoughts.

**Q2: ONE model.**
> **A:** "Story = named prop set + optional play function. Component catalogue = all stories. Tests = play functions + snapshot tests from stories."

**Q3: Misconception with code.**
> **A:** Only writing the happy-path story:
> \`\`\`tsx
> // ❌ Only happy path — loading/empty/error never documented or tested
> export const Default: Story = { args: { data: MOCK_DATA } };
> // ✅ All meaningful states
> export const Loading: Story = { args: { isLoading: true } };
> export const Empty: Story   = { args: { data: [] } };
> export const WithError: Story = { args: { error: 'Failed to load' } };
> \`\`\`

**Q4: How do play functions enable interaction testing?**
> **A:** Play functions run after the story renders, using Testing Library to simulate user interactions and assert outcomes. \`userEvent.click(button)\` inside a play function verifies the component responds correctly — the test runs in a real browser, not jsdom, catching visual and interaction bugs that unit tests miss.

**Q5: Senior one-liner.**
> **A:** "Storybook is a component workbench that forces exhaustive state documentation through stories, enabling visual regression, interaction testing, and design system governance from a single source of truth."`,

    build: `## BUILD

### 🏗️ Mini Project: Storybook with All Component States + Interaction Test

**What you will build:** A Button component with 6 stories covering all states, plus a play function interaction test.
**Time estimate:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest storybook-demo --typescript --tailwind --no-src-dir --app
cd storybook-demo && npx storybook@latest init
touch stories/Button.stories.tsx
\`\`\`

#### Step 2 — Stories
\`\`\`tsx
// stories/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/Button';
import { userEvent, within, expect } from '@storybook/test';

const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: { variant: { control: 'select', options: ['primary','secondary','destructive','plain'] } },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story   = { args: { variant: 'primary',     children: 'Save changes' } };
export const Secondary: Story = { args: { variant: 'secondary',   children: 'Cancel' } };
export const Destructive: Story={ args: { variant:'destructive',  children: 'Delete account' } };
export const Loading: Story   = { args: { loading: true,          children: 'Saving…' } };
export const Disabled: Story  = { args: { disabled: true,         children: 'Unavailable' } };

export const ClickTest: Story = {
  args: { children: 'Click me', variant: 'primary' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'Click me' });
    await userEvent.click(btn);
    await expect(btn).toBeVisible();
  },
};
\`\`\`

#### Step 5 — Run
\`\`\`bash
npm run storybook        # visual catalogue
npm run test-storybook   # runs all play functions
\`\`\`

**Expected Output:**
\`\`\`
✓ Button/Primary
✓ Button/Loading
✓ Button/ClickTest — play function passed
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** What is a Storybook story? What does it document?
**Q2:** Why write Loading/Empty/Error stories, not just the happy path?
**Q3:** Write a 3-story file for a Card component.

### Day 3
**Q4:** What is a play function? How does it differ from a Jest unit test?
**Q5:** Missing error story — what production states go undocumented?
**Q6:** Add accessibility testing (axe) to every story via \`@storybook/addon-a11y\`.

### Day 7
**Q7:** Set up visual regression testing with Chromatic — what does it catch?
**Q8:** PR adds a 50-prop component with only 1 story. Describe the documentation and testing debt.
**Q9:** How do you share mock data between Storybook stories and Jest tests?

### Day 14
**Q10:** ★ "A design system has 100 components, all lacking loading/empty/error stories. Propose a systematic approach to story coverage — how do you prioritise and measure progress?"
**Q11:** Link storybook → visual-regression → a11y-testing → documentation.
**Q12:** ★ "Your design system Storybook is the single source of truth for 200 teams. A component changes behaviour but stories aren't updated. How does this cause silent regressions?"`
  },

  'theming-architecture': {
    code: `## CODE

### Level 1 — Beginner: CSS Variable Theme System
\`\`\`css
/* Primitive tokens — never used directly in components */
:root {
  --palette-blue-500: #3b82f6;
  --palette-blue-700: #1d4ed8;
  --palette-gray-50:  #f9fafb;
  --palette-gray-900: #111827;
  --palette-white:    #ffffff;
}

/* Semantic tokens — what components reference */
:root, [data-theme="light"] {
  --color-background:    var(--palette-gray-50);
  --color-surface:       var(--palette-white);
  --color-text:          var(--palette-gray-900);
  --color-primary:       var(--palette-blue-500);
  --color-primary-hover: var(--palette-blue-700);
  --border-radius:       0.375rem;
  --shadow-sm:           0 1px 2px rgba(0,0,0,0.05);
}

/* Dark: only semantic tokens change */
[data-theme="dark"] {
  --color-background:    var(--palette-gray-900);
  --color-surface:       #1f2937;
  --color-text:          var(--palette-gray-50);
  --color-primary:       #60a5fa; /* Lighter blue for dark bg contrast */
  --color-primary-hover: #93c5fd;
}

/* Components use semantic tokens only */
.button { background: var(--color-primary); color: var(--palette-white); }
.card   { background: var(--color-surface); color: var(--color-text); }
\`\`\`

### Level 2 — Intermediate: Theme Toggle with System Pref Detection
\`\`\`tsx
import { useState, useEffect, createContext, useContext } from 'react';

type Theme = 'light' | 'dark' | 'system';

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() =>
    (localStorage.getItem('theme') as Theme) ?? 'system'
  );
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolveTheme(theme));

  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    document.documentElement.dataset.theme = resolved; // Sets [data-theme="dark"] on <html>
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { setResolvedTheme(resolveTheme('system')); document.documentElement.dataset.theme = resolveTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};
\`\`\`

### Level 3 — Advanced: Multi-Brand Theme via CSS Layers
\`\`\`css
/* CSS Cascade Layers — theme overrides win without specificity hacks */
@layer base, tokens, brand-overrides;

@layer base {
  :root {
    --color-primary: #3b82f6;
    --color-text: #111827;
    --font-family: system-ui, sans-serif;
    --border-radius: 0.375rem;
  }
}

@layer tokens {
  /* Component-specific token aliases */
  :root {
    --button-bg: var(--color-primary);
    --button-text: white;
    --button-radius: var(--border-radius);
    --input-border: 1px solid #d1d5db;
    --input-focus-ring: 0 0 0 3px rgba(59,130,246,0.3);
  }
}

@layer brand-overrides {
  /* Brand B: coral theme */
  [data-brand="brand-b"] {
    --color-primary: #f97316;
    --button-bg: var(--color-primary);
    --border-radius: 9999px; /* Pill-shaped buttons for Brand B */
  }
  /* Brand C: enterprise dark */
  [data-brand="brand-c"] {
    --color-primary: #7c3aed;
    --font-family: "Inter", sans-serif;
    --border-radius: 2px; /* Sharp corners for enterprise */
  }
}
\`\`\`

### Level 4 — Expert / Production: Runtime Theme Compilation
\`\`\`tsx
import { useMemo, useEffect } from 'react';

interface BrandTokens {
  primaryColor: string;
  fontFamily: string;
  borderRadius: string;
  logoUrl: string;
}

// Runtime theme injection — generates CSS from brand config fetched from API
// Used by: Shopify storefronts, Salesforce Communities, white-label SaaS
function compileBrandTheme(tokens: BrandTokens): string {
  // Derive accessible hover colour (darken by 15%)
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b), l = (max+min)/2;
    const s = max===min ? 0 : (max-min)/(l>0.5 ? 2-max-min : max+min);
    const h = max===min ? 0 : max===r ? (g-b)/(max-min)*60 : max===g ? (b-r)/(max-min)*60+120 : (r-g)/(max-min)*60+240;
    return [Math.round(h), Math.round(s*100), Math.round(l*100)] as const;
  };
  const [h, s, l] = hexToHsl(tokens.primaryColor);
  return \`
    :root {
      --color-primary: \${tokens.primaryColor};
      --color-primary-hover: hsl(\${h}, \${s}%, \${Math.max(0, l - 15)}%);
      --color-primary-light: hsl(\${h}, \${s}%, \${Math.min(100, l + 30)}%);
      --font-family-brand: \${tokens.fontFamily};
      --border-radius: \${tokens.borderRadius};
    }
  \`;
}

export function BrandThemeProvider({ brandId, children }: { brandId: string; children: React.ReactNode }) {
  const [tokens, setTokens] = React.useState<BrandTokens | null>(null);

  useEffect(() => {
    fetch(\`/api/brands/\${brandId}/tokens\`)
      .then(r => r.json())
      .then(setTokens)
      .catch(console.error);
  }, [brandId]);

  const css = useMemo(() => tokens ? compileBrandTheme(tokens) : '', [tokens]);

  return (
    <>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} data-brand={brandId} />}
      {children}
    </>
  );
}
\`\`\``,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "ConceptMap", "state": "design-system-theming" }
\`\`\``,

    realworld: `## REAL_WORLD

### How Atlassian Implements Multi-Theme Architecture

Atlassian's design system (Jira, Confluence, Trello — 300M+ users) supports light, dark, and high-contrast themes across all products simultaneously. Their token-based approach: every colour, shadow, and spacing reference goes through a semantic token layer that is remapped per theme. They open-sourced \`@atlaskit/tokens\` — their finding was that CSS custom properties cascading from a \`data-theme\` attribute on the root is the only pattern that avoids React context re-renders when switching themes globally.

\`\`\`tsx
// Production pattern — Atlassian-style data-theme driven theming
// No React state re-renders — pure CSS variable cascade

// Theme token maps
const themes = {
  light: {
    '--ds-background-default':   '#FFFFFF',
    '--ds-text-default':         '#172B4D',
    '--ds-interactive-default':  '#0052CC',
  },
  dark: {
    '--ds-background-default':   '#1D2125',
    '--ds-text-default':         '#C7D1DB',
    '--ds-interactive-default':  '#579DFF',
  },
  'high-contrast': {
    '--ds-background-default':   '#000000',
    '--ds-text-default':         '#FFFFFF',
    '--ds-interactive-default':  '#FFFF00',  // Yellow on black — max contrast
  },
};

// Apply theme via data attribute — CSS cascade, no re-render
function applyTheme(theme: keyof typeof themes) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);  // CSS selector [data-theme="dark"] picks up
  const tokens = themes[theme];
  Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));
  localStorage.setItem('theme-preference', theme);  // Persist across sessions
}

// CSS — components reference tokens, not values
// .button { background: var(--ds-interactive-default); }
// No JS needed when theme changes — CSS cascade handles everything
\`\`\`

### Production Gotcha: Forcing Re-Render for Theme Switch
\`\`\`tsx
// ❌ React context re-renders entire tree on theme change — 300ms+ jank
const ThemeContext = createContext('light');
// Every component that reads ThemeContext re-renders

// ✅ CSS custom properties cascade without React — zero re-renders
// Just update the root attribute — CSS does the rest
\`\`\`
**Why it happens:** Developers reach for React context for theming because they're familiar with it, unaware that CSS custom properties cascade globally with zero JavaScript overhead.

| Approach | Re-renders | Flash | Persistence |
|----------|-----------|-------|-------------|
| React context | O(n consumers) | Yes | Manual |
| CSS custom props | 0 | No | localStorage |
| Tailwind darkMode:class | 0 | Possible | localStorage |`,

    interview: `## INTERVIEW

**Q1 (Junior): What is the difference between a dark mode implementation via React state and CSS custom properties?**
A: React state/context re-renders every component that consumes the theme on every toggle, causing jank in large component trees. CSS custom properties cascade from the root to all descendants with zero JavaScript — changing \`--color-bg\` on \`:root\` instantly updates every element that references it without any component re-rendering. The CSS approach also avoids flash-of-incorrect-theme on page load if you apply the saved theme synchronously in a \`<script>\` tag in \`<head>\`.

**Q2 (Junior): What is the \`prefers-color-scheme\` media query and how does it interact with user theme overrides?**
A: \`prefers-color-scheme: dark\` reflects the OS-level colour preference. It should be the default behaviour but must be overridable by an in-app preference. The correct pattern: CSS defaults to \`prefers-color-scheme\`; if the user sets an explicit preference, save it to localStorage and apply a \`data-theme\` attribute that overrides the media query. Remove the attribute to fall back to the system preference.

**Q3 (Mid): How do you prevent flash of unstyled/wrong-theme content (FOUT/FOTC) in Next.js?**
A: Flash occurs when the theme class/attribute is applied after React hydrates (client-side). Fix: in \`_document.tsx\` or \`layout.tsx\`, inject a synchronous \`<script>\` in \`<head>\` that reads localStorage and sets the \`data-theme\` attribute before the page renders. Since the script runs before HTML is painted, the correct theme applies before the first paint. Next.js App Router can also use server components to read a cookie and set the attribute in the HTML.

**Q4 (Mid): How do you add a "high contrast" theme to an existing light/dark system?**
A: High contrast is a third semantic token mapping, not a variation of dark mode — text becomes white-on-black (or black-on-white) with minimum 7:1 contrast (WCAG AAA). The implementation: add a third \`[data-theme="high-contrast"]\` CSS block remapping all semantic tokens. Detect the OS preference via \`prefers-contrast: more\` media query as the automatic trigger. Audit every token pair for 7:1 contrast in this theme.

**Q5 (Senior): How do you support white-label themes (customer brand colours) in a SaaS design system?**
A: Store customer brand tokens in a database: primary colour, secondary, logo URL. At runtime, generate a CSS custom property block from the stored values and inject it as a \`<style>\` tag after the default theme. The injected tokens override the defaults via CSS cascade specificity. The constraints: brand tokens must only remap interactive/brand semantic tokens, never text-on-surface tokens (to preserve contrast compliance). Validate all provided colours for minimum WCAG AA contrast before accepting them.`,

    feynman: `## FEYNMAN CHECK

### Explain Theming Architecture Like I'm 10 Years Old
> Theming is like painting a house. Your tokens are the paint colours — semantic names like "wall colour" and "door colour". A theme is a set of instructions: "in light mode, wall colour = cream; in dark mode, wall colour = charcoal". When you switch theme, only the instructions change — every wall that uses "wall colour" updates automatically. The non-obvious part: React state-driven theming repaints every room manually; CSS custom properties let the paint factory handle it automatically with zero work. This is why the CSS approach causes zero lag on theme switch.

---

### 5 Deep Questions
**Q1: Why is CSS-based theming strictly better than React context for global theme switching?**
> **A:** CSS custom properties cascade from root to all elements without any JavaScript execution — the browser's style engine handles it in a single pass. React context re-renders every consumer component, which for a large app is hundreds of components. The CSS approach is O(1) — a single attribute change; React context is O(n subscribers). The CSS approach also eliminates flash-of-incorrect-theme when properly initialized.

**Q2: ONE model.**
> **A:** "Theme = CSS custom property overrides on \`[data-theme]\` selector. Switch theme by changing the attribute. Zero re-renders. Zero flash. Stored in localStorage."

**Q3: Misconception with code.**
> **A:** Using React context for theme causes re-render storm:
> \`\`\`tsx
> // ❌ Every useTheme() subscriber re-renders
> const {theme}=useTheme(); return <div style={{color: theme.text}}>...</div>
> // ✅ CSS handles it
> // .text { color: var(--color-text-primary); }  ← no re-render ever
> \`\`\`

**Q4: How do you handle SSR/SSG with theme to avoid hydration mismatch?**
> **A:** Default to light theme in HTML. In \`<head>\`, inject a tiny inline script that reads localStorage synchronously and sets \`document.documentElement.dataset.theme\` before paint. This runs before React hydrates, so the correct theme is already applied — no mismatch, no flash.

**Q5: Senior one-liner.**
> **A:** "Theming architecture is a CSS custom property cascade controlled by a \`data-theme\` attribute — theme switching is an attribute mutation, not a React re-render tree — which is why CSS-based theming has zero performance cost regardless of component tree size."`,

    build: `## BUILD

### 🏗️ Mini Project: Three-Theme System (Light/Dark/High-Contrast)

**What you will build:** CSS custom property themes with localStorage persistence, system preference detection, and zero re-renders.
**Time estimate:** 40 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir theme-system && cd theme-system
npx create-next-app@latest . --typescript --tailwind --no-src-dir --app
touch app/themes.css hooks/useTheme.ts
\`\`\`

#### Step 2 — CSS Tokens
\`\`\`css
/* app/themes.css */
:root, [data-theme="light"] {
  --color-bg: #ffffff; --color-text: #111827; --color-primary: #3b82f6;
}
[data-theme="dark"] {
  --color-bg: #1f2937; --color-text: #f9fafb; --color-primary: #60a5fa;
}
[data-theme="high-contrast"] {
  --color-bg: #000000; --color-text: #ffffff; --color-primary: #ffff00;
}
\`\`\`

#### Step 3 — Hook
\`\`\`ts
export function useTheme() {
  const set = (t: string) => {
    document.documentElement.dataset.theme = t;
    localStorage.setItem('theme', t);
  };
  return { setTheme: set, current: document.documentElement.dataset.theme ?? 'light' };
}
\`\`\`

#### Step 4 — SSR-safe init
\`\`\`tsx
// In <head> — runs before paint
<script dangerouslySetInnerHTML={{ __html: \`
  const t = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = t;
\` }} />
\`\`\`

**Expected Output:**
\`\`\`
Theme switches instantly on button click, no layout shift, persists on reload.
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** CSS theming vs React context — what is the re-render cost of each?
**Q2:** How does \`data-theme\` attribute switch themes?
**Q3:** Write the CSS for a light + dark theme using custom properties.

### Day 3
**Q4:** What is flash-of-incorrect-theme and how do you prevent it?
**Q5:** React context re-render storm — show and fix.
**Q6:** Add high-contrast theme (7:1 min contrast).

### Day 7
**Q7:** Implement a theme toggle that: respects OS preference, allows override, persists in localStorage.
**Q8:** PR implements theming via React context across 200 components — describe the performance impact.
**Q9:** How do you validate all 3 themes pass WCAG AA contrast automatically in CI?

### Day 14
**Q10:** ★ "Design a white-label theming system for a SaaS with 500 enterprise clients each needing custom brand colours."
**Q11:** Link theming → tokens → CSS-variables → a11y-contrast.
**Q12:** ★ "A theme change causes a 200ms layout shift affecting 10M users. Diagnose the root cause and fix at the architecture level."`
  },

  'typography-system': {
    feynman: `## FEYNMAN CHECK

### Explain Typography Systems Like I'm 10 Years Old
> A typography system is a size chart for text — like S/M/L/XL shirts, but for words. Instead of everyone guessing font sizes, there are named sizes (xs/sm/md/lg/xl/2xl) from a scale where each size is a specific multiplier of the previous. The heading hierarchy (h1 > h2 > h3) tells both users AND search engines what's most important. The non-obvious part: mixing any two sizes from a modular scale always looks harmonious — breaking the scale (using a custom 17px) looks subtly wrong even if no one can say why. This is why "just pick a size that looks right" produces inconsistent UIs.

---

### 5 Deep Questions
**Q1: What is a modular type scale and why does it produce visually consistent text?**
> **A:** A modular scale multiplies a base size by a fixed ratio (1.25, 1.333, 1.5, 1.618) to generate all type sizes. Because every size is a power of the same ratio, any two sizes on the scale have a mathematical harmonic relationship — they "look right together" the same way musical intervals do. Breaking the scale with a custom size produces a visual dissonance that designers detect but cannot always articulate.

**Q2: ONE model.**
> **A:** "One base size + one ratio = the entire scale. Components pick steps on the scale by semantic name (body, caption, heading-sm). Never input a raw size number."

**Q3: Misconception with code.**
> **A:** Using raw pixel/rem sizes bypasses the scale:
> \`\`\`css
> /* ❌ One-off size — breaks scale, causes inconsistency */
> .sidebar-label { font-size: 13px; }
> /* ✅ Scale step */
> .sidebar-label { font-size: var(--font-size-xs); } /* 12px from scale */
> \`\`\`

**Q4: How do typography tokens interact with responsive design?**
> **A:** Type scale should adjust at breakpoints — desktop headings larger than mobile. The clean pattern: define a fluid type scale using CSS \`clamp(min, preferred, max)\` so headings scale continuously with viewport width without breakpoint jumps. Token names remain the same (\`--font-size-heading-xl\`); the value changes based on viewport.

**Q5: Senior one-liner.**
> **A:** "A typography system is a modular scale of harmonically related sizes mapped to semantic names — breaking the scale with arbitrary sizes is the single most common source of visual inconsistency in component libraries."`,

    build: `## BUILD

### 🏗️ Mini Project: Typographic Scale with CSS Tokens

**What you will build:** A modular 1.25-ratio type scale as CSS custom properties with semantic names, plus a React Typography component that enforces the scale.
**Time estimate:** 30 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir type-scale && cd type-scale
npx create-next-app@latest . --typescript --tailwind --no-src-dir --app
touch app/typography.css components/Typography.tsx
\`\`\`

#### Step 2 — Scale (base 16px × 1.25 ratio)
\`\`\`css
/* app/typography.css */
:root {
  --font-size-xs:   0.64rem;  /* 10.24px */
  --font-size-sm:   0.8rem;   /* 12.8px  */
  --font-size-base: 1rem;     /* 16px    */
  --font-size-md:   1.25rem;  /* 20px    */
  --font-size-lg:   1.563rem; /* 25px    */
  --font-size-xl:   1.953rem; /* 31.25px */
  --font-size-2xl:  2.441rem; /* 39px    */

  --font-weight-normal:   400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;

  --line-height-tight:   1.2;
  --line-height-normal:  1.5;
  --line-height-relaxed: 1.75;
}
\`\`\`

#### Step 3 — Typography Component
\`\`\`tsx
type Variant = 'h1'|'h2'|'h3'|'h4'|'body'|'body-sm'|'caption';
const variantStyles: Record<Variant, string> = {
  h1:      'text-[var(--font-size-2xl)] font-[var(--font-weight-bold)] leading-[var(--line-height-tight)]',
  h2:      'text-[var(--font-size-xl)] font-[var(--font-weight-semibold)]',
  h3:      'text-[var(--font-size-lg)] font-[var(--font-weight-semibold)]',
  h4:      'text-[var(--font-size-md)] font-[var(--font-weight-medium)]',
  body:    'text-[var(--font-size-base)] leading-[var(--line-height-normal)]',
  'body-sm':'text-[var(--font-size-sm)]',
  caption: 'text-[var(--font-size-xs)] text-gray-500',
};
const defaultTag: Record<Variant, keyof JSX.IntrinsicElements> = {
  h1:'h1', h2:'h2', h3:'h3', h4:'h4', body:'p', 'body-sm':'p', caption:'span'
};
export function Typography({ variant='body', as, children, className }: {variant?:Variant;as?:keyof JSX.IntrinsicElements;children:React.ReactNode;className?:string}) {
  const Tag = as ?? defaultTag[variant];
  return <Tag className={[variantStyles[variant], className].filter(Boolean).join(' ')}>{children}</Tag>;
}
\`\`\`

**Expected Output:**
\`\`\`
Harmonically scaled text hierarchy — all sizes from the same 1.25 ratio.
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** What is a modular type scale? What ratio does Figma's default scale use?
**Q2:** Why do arbitrary font sizes break visual consistency?
**Q3:** Write a 7-step type scale in CSS custom properties.

### Day 3
**Q4:** Semantic naming vs scale step naming — pros and cons.
**Q5:** One-off font size bug — show and fix.
**Q6:** Fluid typography with CSS clamp().

### Day 7
**Q7:** Build a Typography component that enforces scale use via TypeScript union type.
**Q8:** PR uses 6 custom font sizes not on the scale. Quantify the visual inconsistency.
**Q9:** How does line-height affect readability at different sizes?

### Day 14
**Q10:** ★ "Design a typography system for a product with marketing (large display), editorial (body text), and UI (labels/buttons) contexts."
**Q11:** Link type-scale → tokens → responsive → component-api.
**Q12:** ★ "A redesign mandates a type scale change across 500 components. With a token system, how many files change?"`
  },

  'versioning-and-publishing': {
    code: `## CODE

### Level 1 — Beginner: Semantic Versioning & package.json
\`\`\`json
{
  "name": "@company/design-system",
  "version": "2.4.1",
  "description": "Company Design System component library",
  "main":    "dist/cjs/index.js",
  "module":  "dist/esm/index.js",
  "types":   "dist/types/index.d.ts",
  "exports": {
    ".":              { "import": "./dist/esm/index.js", "require": "./dist/cjs/index.js" },
    "./styles":       "./dist/styles.css",
    "./tokens":       "./dist/tokens/index.js"
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "scripts": {
    "build":   "tsup src/index.ts --format cjs,esm --dts",
    "release": "changeset publish"
  }
}
\`\`\`

### Level 2 — Intermediate: Changesets Workflow
\`\`\`bash
# Install changesets: npm install -D @changesets/cli
# Initialize: npx changeset init → creates .changeset/ folder

# Developer flow: after making a change, create a changeset
npx changeset add
# Interactive prompt:
#   - Which packages are affected? → @company/design-system
#   - Is it major/minor/patch? → patch
#   - Summary: "Fix Button focus ring in Safari"
# Creates: .changeset/happy-dogs-dance.md

# .changeset/happy-dogs-dance.md content:
# ---
# "@company/design-system": patch
# ---
# Fix Button focus ring in Safari
\`\`\`

\`\`\`javascript
// .changeset/config.json — changeset configuration
{
  "$schema": "https://unpkg.com/@changesets/config@2.0.0/schema.json",
  "changelog":    "@changesets/cli/changelog",
  "commit":       false,
  "linked":       [],
  "access":       "public",
  "baseBranch":   "main",
  "updateInternalDependencies": "patch",
  "ignore":       []
}
\`\`\`

### Level 3 — Advanced: CI/CD Release Pipeline
\`\`\`yaml
# .github/workflows/release.yml — automated release on merge to main
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0           # Full history needed for changeset detection
          token: \${{ secrets.GITHUB_TOKEN }}

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org

      - run: npm ci

      - name: Build
        run: npm run build

      - name: Run Tests
        run: npm test

      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          publish: npm run release
          title:   "chore: release packages"
          commit:  "chore: version packages"
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN:    \${{ secrets.NPM_TOKEN }}
\`\`\`

### Level 4 — Expert / Production: Monorepo Multi-Package Publishing
\`\`\`javascript
// scripts/publish.js — custom publish script with pre-publish validation
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.join(__dirname, '../packages');

async function validateBeforePublish(pkgPath) {
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf8'));

  // 1. Ensure dist exists
  const distPath = path.join(pkgPath, 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error(\`\${pkg.name}: dist/ missing — run npm run build first\`);
  }

  // 2. Ensure all exported files exist
  const exports = pkg.exports ?? {};
  for (const [key, value] of Object.entries(exports)) {
    const files = typeof value === 'string' ? [value] : Object.values(value);
    for (const file of files) {
      const filePath = path.join(pkgPath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(\`\${pkg.name}: exported file missing: \${file}\`);
      }
    }
  }

  // 3. Ensure types are generated
  const typesPath = path.join(pkgPath, pkg.types ?? 'dist/types/index.d.ts');
  if (!fs.existsSync(typesPath)) {
    throw new Error(\`\${pkg.name}: types missing at \${typesPath}\`);
  }

  console.log(\`✅ \${pkg.name}@\${pkg.version} — validation passed\`);
}

async function publishPackages() {
  const packages = fs.readdirSync(PACKAGES_DIR)
    .filter(name => fs.existsSync(path.join(PACKAGES_DIR, name, 'package.json')));

  for (const pkgName of packages) {
    const pkgPath = path.join(PACKAGES_DIR, pkgName);
    try {
      await validateBeforePublish(pkgPath);
      execSync('npm publish --access public', { cwd: pkgPath, stdio: 'inherit' });
      console.log(\`📦 Published: \${pkgName}\`);
    } catch (err) {
      console.error(\`❌ Failed: \${pkgName} — \${err.message}\`);
      process.exit(1);
    }
  }
}

publishPackages().catch(console.error);
\`\`\``,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "FlowChart", "state": "design-system-versioning" }
\`\`\``,

    realworld: `## REAL_WORLD

### How Shopify Polaris Manages Versioning Across 400 App Partners

Polaris has 400+ apps on the Shopify App Store consuming it. Breaking changes to a design system component can silently break every app. Their published breaking-change policy: major version only for breaking changes, with a migration guide + codemod; deprecation warnings 2 major versions before removal; a public changelog entry for every change. They use Changesets (open-source) for monorepo versioning and publish to npm from CI.

\`\`\`js
// Production pattern — Changesets + npm publish pipeline
// .changeset/new-change.md (created by: npx changeset)
---
"@polaris/react": minor
---
Added \`loading\` prop to Button component for async actions.
Follows ARIA best practices with aria-busy and spinner slot.

// package.json
{
  "name": "@your-ds/react",
  "version": "4.7.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import":  "./dist/index.mjs",
      "require": "./dist/index.js",
      "types":   "./dist/index.d.ts"
    }
  },
  "sideEffects": ["./dist/styles.css"]
}

// CI pipeline — .github/workflows/release.yml
// 1. changeset version → bumps package.json + CHANGELOG.md
// 2. npm publish --access public
// 3. Bot opens upgrade PRs in consuming repos (optional: Renovate)
\`\`\`

### Production Gotcha: Breaking Change Without Major Bump
\`\`\`bash
# ❌ Renamed prop without major version — breaks all consumers silently
# v3.7.0: Button "isLoading" renamed to "loading"
# consumers: <Button isLoading> still compiles but prop silently ignored

# ✅ Keep both props for one major version with deprecation warning
# v3.7.0: add "loading" prop, keep "isLoading" with console.warn
# v4.0.0: remove "isLoading"
\`\`\`
**Why it happens:** Engineers treat prop renames as "non-breaking" because the old code still compiles. The component silently ignores the old prop, producing invisible bugs.

| Version bump | When |
|-------------|------|
| Patch | Bug fix, no API change |
| Minor | New prop with default, new component |
| Major | Remove/rename prop, change behaviour |`,

    interview: `## INTERVIEW

**Q1 (Junior): What is semantic versioning (semver) and how does it apply to a design system?**
A: Semver uses MAJOR.MINOR.PATCH. MAJOR: breaking change (removing a prop, changing component behaviour). MINOR: additive change (new prop with default, new component). PATCH: bug fix that doesn't change the public API. For a design system, the key discipline: adding a prop with a safe default is always MINOR (existing consumers unaffected); removing or renaming a prop is always MAJOR (all consumers must update). Violating this breaks apps that have pinned versions.

**Q2 (Junior): What is a changelog and why is it required for a design system?**
A: A changelog (CHANGELOG.md) records every version's changes with categories (Added, Changed, Fixed, Removed, Deprecated). For a design system, it is the migration guide that 200 teams consult when upgrading. Without it, teams can't assess the upgrade risk, can't identify what to test after upgrading, and can't write migration scripts. Changesets (the tool) generates changelog entries from developer-authored markdown files, ensuring every PR documents its intent.

**Q3 (Mid): How do you handle a breaking change that must ship urgently?**
A: If a breaking change is unavoidable (security fix, fundamental API correction): (1) bump MAJOR, (2) publish a detailed migration guide with before/after code, (3) publish a codemod (jscodeshift transform) that automates the migration where possible, (4) keep the old version in LTS (long-term support) with security patches for 6 months. For design systems serving hundreds of teams, even an "urgent" breaking change needs 2 weeks lead time — announce in advance, give teams time to plan.

**Q4 (Mid): What is the difference between peer dependencies and regular dependencies for a design system package?**
A: React and React-DOM should be peerDependencies — the consuming app provides React, and the design system uses the app's instance. If React were a regular dependency, the design system would bundle its own React copy, causing two React instances (which breaks hooks and context). The correct package.json: \`"peerDependencies": { "react": "^18.0.0" }\`. This also lets the design system support React 17 and 18 simultaneously by widening the peer range.

**Q5 (Senior): How do you migrate 400 consuming apps to a major version without a "big bang" upgrade?**
A: Use a bridge release: v3.10 adds the new API alongside the old, deprecating the old with console.warn. This gives teams time to migrate while still on v3. v4.0 then removes the deprecated API — teams that migrated ahead of time do a simple version bump with zero code changes. Automation: publish a codemod as a standalone package (\`npx @your-ds/migrate v3-to-v4\`) that handles mechanical renames. Track adoption via telemetry: what percentage of consumers have upgraded within 30, 60, 90 days.`,

    feynman: `## FEYNMAN CHECK

### Explain Versioning Like I'm 10 Years Old
> Publishing a design system is like releasing a new edition of a textbook. Patch (v1.0.1) fixes a typo — same content, just corrected. Minor (v1.1.0) adds a new chapter — everything old is still there. Major (v2.0.0) reorganises the whole book — old students must learn the new structure. The non-obvious part: a prop rename IS a major change even if the code still compiles — the old prop is silently ignored, and the UI breaks invisibly. This is why "it's just a rename, not a big deal" costs every consuming team hours of debugging.

---

### 5 Deep Questions
**Q1: Why is a prop rename a MAJOR breaking change even when code compiles?**
> **A:** TypeScript may not catch a renamed prop if the old prop becomes an unrecognised extra prop (React ignores unknown props silently). The component renders without error but with wrong behaviour — the feature is invisibly broken. Since the app builds and tests pass, the breakage goes to production undetected.

**Q2: ONE model.**
> **A:** "Patch = safe. Minor = additive safe. Major = requires migration. Never do breaking changes in minor/patch."

**Q3: Misconception with code.**
> **A:** Breaking change shipped as minor:
> \`\`\`tsx
> // v3.7.0 (minor) — renames isLoading to loading
> // ❌ Old code silently broken
> <Button isLoading>Save</Button>  // isLoading ignored — no spinner
> // ✅ Add "loading" in minor, remove "isLoading" in major (v4.0.0)
> \`\`\`

**Q4: How do Changesets integrate with a monorepo CI/CD workflow?**
> **A:** A changeset file (authored on PR) describes the change type (patch/minor/major) and summary. On merge to main, \`changeset version\` bumps package.json and CHANGELOG.md. \`changeset publish\` publishes to npm. The key: every PR must include a changeset file — CI fails if one is missing, enforcing that no change ships without documentation.

**Q5: Senior one-liner.**
> **A:** "Design system versioning is a social contract — semver signals migration cost, the changelog is the migration guide, and codemods are the migration tool — which is why silent breaking changes in minor versions are the single most trust-destroying mistake a design system team makes."`,

    build: `## BUILD

### 🏗️ Mini Project: Versioned Component Library Package

**What you will build:** A minimal npm-publishable component library with Changesets, TypeScript, dual CJS/ESM output, and automated CHANGELOG.
**Time estimate:** 45 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir ds-publish && cd ds-publish
npm init -y
npm install -D typescript tsup @changesets/cli react react-dom @types/react
npx changeset init
touch src/index.ts src/Button.tsx tsup.config.ts
\`\`\`

#### Step 2 — Component
\`\`\`tsx
// src/Button.tsx
export interface ButtonProps { children: React.ReactNode; variant?: 'primary' | 'secondary'; }
export function Button({ children, variant = 'secondary' }: ButtonProps) {
  return <button className={\`btn btn--\${variant}\`}>{children}</button>;
}
\`\`\`

#### Step 3 — Build Config
\`\`\`ts
// tsup.config.ts
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],      // Dual output — works in CJS and ESM consumers
  dts: true,                   // Generate .d.ts for TypeScript consumers
  external: ['react'],         // Don't bundle React — peer dep
  clean: true,
});
\`\`\`

#### Step 4 — Add Changeset
\`\`\`bash
npx changeset
# Select: minor
# Summary: "Add Button component with primary/secondary variants"
npx changeset version    # Bumps version + CHANGELOG
npx changeset publish    # npm publish (needs npm login)
\`\`\`

**Expected Output:**
\`\`\`
🦋  info  @your-ds/react@0.1.0 published
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** MAJOR/MINOR/PATCH — give a design system example of each.
**Q2:** Why is a prop rename a breaking change even when it compiles?
**Q3:** Write a package.json with correct peerDependencies for a React component library.

### Day 3
**Q4:** Changesets workflow — what does each step do?
**Q5:** Breaking change in minor — show the invisible bug.
**Q6:** Write a CHANGELOG entry for a new loading prop on Button.

### Day 7
**Q7:** Set up tsup to output CJS + ESM + type declarations for a component library.
**Q8:** PR renames a prop and ships as minor. 400 consuming apps affected. Describe the incident.
**Q9:** How do you track version adoption across 400 consuming teams?

### Day 14
**Q10:** ★ "A design system needs to remove 10 deprecated props in v5.0.0. Design the migration strategy for 400 consuming apps."
**Q11:** Link versioning → changesets → npm → consuming-apps.
**Q12:** ★ "Your design system is at v3.9. A critical security fix requires a breaking API change. How do you ship it while minimising consumer disruption?"`
  },

  'spacing-system': {
    why: `## WHY

Before systematic spacing, every designer and developer picked padding and margin values from intuition — 7px here, 11px there, 20px somewhere else. Across a large product with 50 engineers, this produced hundreds of unique spacing values with no relationship to each other. Two cards sitting next to each other would have different internal padding even when they should look identical, because one engineer used \`padding: 14px\` and another used \`padding: 16px\`. The visual inconsistency was subtle but cumulative: the product felt "slightly off" without anyone being able to articulate why.

A systematic spacing scale solves this by defining a finite set of named values derived from a single base unit (typically 4px or 8px, matching most display pixel grids). Values on the scale — 4, 8, 12, 16, 24, 32, 48, 64px — are the only permitted spacing choices. The restricted vocabulary eliminates the one-off values that create visual noise, and the mathematical relationship between values (each is a multiple of the base) ensures visual harmony. In practice: changing the base unit remaps the entire product's spacing in one token edit.

The failure mode when spacing is unsystematic: design-to-development handoff becomes a negotiation — "the design says 14px but our existing cards use 16px, should I match the design or stay consistent?" These micro-decisions, made hundreds of times per week, are the source of the spacing entropy that makes large products feel visually incoherent. A spacing system makes the answer automatic: use the closest scale value.

Senior engineers and designers must understand: spacing tokens must be semantic (small/medium/large, not raw pixel values) so that global density changes (compact vs comfortable mode) are one mapping change, not a 500-component search-and-replace. The spacing scale is not optional decoration — it is the grid that keeps layouts coherent across every component and every page.`,

    theory: `## THEORY

### The 4px Grid System

The standard is a 4px base unit because most screens have pixel densities that make 4px the smallest visually perceptible unit, and 4×n matches the natural rhythm of line heights (line-height of 20px = 5 units, 24px = 6 units). An 8px grid is an even more common choice — most layout spacing (padding, gaps, margins) is a multiple of 8.

\`\`\`mermaid
flowchart TD
    A[Base unit: 4px] --> B[Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96]
    B --> C[Semantic tokens: xs=4, sm=8, md=16, lg=24, xl=32, 2xl=48]
    C --> D[Components reference semantic tokens only]
    D --> E[Density mode remaps semantic → different scale values]
    E --> F[Compact: md=12, Comfortable: md=16, Spacious: md=20]
\`\`\`

### Internal Breakdown
1. **Base unit selection:** 4px aligns with pixel grids on HiDPI displays and produces whole numbers at common breakpoints.
2. **Scale generation:** Multiply base by a sequence (1, 2, 3, 4, 6, 8, 12, 16, 24) to produce the palette.
3. **Semantic mapping:** Name values by role — xs/sm/md/lg/xl — so scale can change without touching component code.
4. **Restriction enforcement:** Lint rules (stylelint-no-arbitrary-values, custom ESLint) fail PRs that use unlisted values.
5. **Density theming:** Map semantic names to different scale values per density mode (compact, comfortable, spacious).

### Scale Comparison
| Token | Compact | Comfortable | Spacious |
|-------|---------|-------------|---------|
| space-xs | 2px | 4px | 6px |
| space-sm | 4px | 8px | 12px |
| space-md | 8px | 16px | 24px |
| space-lg | 12px | 24px | 36px |
| space-xl | 16px | 32px | 48px |

### Common Misconception
Most developers think spacing tokens are just CSS variables for convenience. Actually, they are a density-switching mechanism: swapping the semantic→scale mapping changes the entire product's density without touching any component. Without semantic tokens, density modes require 500+ component changes.

### Edge Cases
- **Fractional spacing:** Never use 6px when your grid is 8px — it looks wrong because it breaks the grid.
- **Negative spacing:** Some scale systems include negative values (margin-top: -space-sm) for overlap patterns — document them explicitly.
- **Icon spacing:** Icon-to-text spacing (4px) feels different from card padding (16px) despite being the same token — context matters.`,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "ConceptMap", "state": "design-system-spacing" }
\`\`\``,

    code: `## CODE

### Level 1 — Beginner: CSS Custom Property Scale
\`\`\`css
/* A minimal 4px-base spacing scale as CSS custom properties */
:root {
  --space-1:  4px;   /* xs — icon padding, tight gaps */
  --space-2:  8px;   /* sm — small component padding */
  --space-3:  12px;  /* intermediate */
  --space-4:  16px;  /* md — default component padding */
  --space-6:  24px;  /* lg — section spacing */
  --space-8:  32px;  /* xl — page section gaps */
  --space-12: 48px;  /* 2xl — major section breaks */
  --space-16: 64px;  /* 3xl — hero spacing */
}
\`\`\`

### Level 2 — Intermediate: Semantic Token Layer
\`\`\`css
/* Semantic layer — components always reference these, never raw scale */
:root {
  --spacing-component-xs:   var(--space-1);   /* 4px  — icon internal */
  --spacing-component-sm:   var(--space-2);   /* 8px  — tight component */
  --spacing-component-md:   var(--space-4);   /* 16px — standard padding */
  --spacing-component-lg:   var(--space-6);   /* 24px — spacious component */
  --spacing-layout-sm:      var(--space-6);   /* 24px — small layout gap */
  --spacing-layout-md:      var(--space-8);   /* 32px — standard layout */
  --spacing-layout-lg:      var(--space-12);  /* 48px — large layout gap */
}

/* Density override — compact mode */
[data-density="compact"] {
  --spacing-component-md: var(--space-3);  /* 12px instead of 16px */
  --spacing-component-lg: var(--space-4);  /* 16px instead of 24px */
}
\`\`\`

### Level 3 — Advanced: TypeScript Token Map + Tailwind Config
\`\`\`ts
// tokens/spacing.ts — Single source, generates Tailwind + CSS
export const spacingPalette = {
  '1': '0.25rem',  // 4px
  '2': '0.5rem',   // 8px
  '3': '0.75rem',  // 12px
  '4': '1rem',     // 16px
  '6': '1.5rem',   // 24px
  '8': '2rem',     // 32px
  '12': '3rem',    // 48px
  '16': '4rem',    // 64px
} as const;

export const spacingSemantic = {
  'component-xs': 'var(--space-1)',
  'component-sm': 'var(--space-2)',
  'component-md': 'var(--space-4)',
  'component-lg': 'var(--space-6)',
  'layout-sm':    'var(--space-6)',
  'layout-md':    'var(--space-8)',
  'layout-lg':    'var(--space-12)',
} satisfies Record<string, string>;

// tailwind.config.ts
import { spacingPalette } from './tokens/spacing';
export default { theme: { extend: { spacing: spacingPalette } } };
\`\`\`

### Level 4 — Expert: Spacing Lint Rule + Density System
\`\`\`ts
// scripts/lint-spacing.ts — ESLint rule that forbids arbitrary spacing values
// Integrates with custom ESLint plugin for the design system

import { Rule } from 'eslint';

const VALID_SCALE = new Set([4,8,12,16,24,32,48,64,96]);

const lintRule: Rule.RuleModule = {
  meta: { type: 'problem', messages: {
    arbitrary: 'Use spacing token instead of arbitrary {{value}}px. Closest: var(--space-{{closest}})'
  }},
  create(context) {
    return {
      Property(node) {
        const spacingProps = ['padding','margin','gap','top','bottom','left','right'];
        if (!spacingProps.some(p => node.key.value?.includes(p))) return;
        const val = node.value.value;
        if (typeof val === 'number' && !VALID_SCALE.has(val)) {
          const closest = [...VALID_SCALE].reduce((a,b) => Math.abs(b-val)<Math.abs(a-val)?b:a);
          context.report({ node, messageId: 'arbitrary', data: { value: val, closest } });
        }
      }
    };
  }
};

export default lintRule;

// Usage: catches padding: 14 and suggests padding: 16 (--space-4)
\`\`\``,

    realworld: `## REAL_WORLD

### How GitHub Primer Enforces Spacing

GitHub's Primer design system (serving GitHub.com and GitHub Enterprise) uses an 8px base grid with 5 semantic sizes (compact, normal, spacious) mapped to Primer's \`spacing\` tokens. Their insight: every developer who uses \`margin: 10px\` is making a unilateral design decision — the spacing system removes that decision by making token use the path of least resistance.

\`\`\`css
/* Primer pattern — Tailwind-compatible spacing tokens */
/* Components use these class-based tokens, never arbitrary values */
.card { padding: var(--base-size-16); }                  /* 16px */
.card + .card { margin-top: var(--base-size-24); }       /* 24px */
.card__header { padding-bottom: var(--base-size-8); }    /* 8px  */

/* Primer scale maps */
:root {
  --base-size-4:  4px;
  --base-size-8:  8px;
  --base-size-12: 12px;
  --base-size-16: 16px;
  --base-size-24: 24px;
  --base-size-32: 32px;
  --base-size-40: 40px;
  --base-size-48: 48px;
}
\`\`\`

### Production Gotcha: Off-Grid Spacing
\`\`\`css
/* ❌ 14px breaks the 4px grid — causes pixel rounding on some screens */
.dialog { padding: 14px; }

/* ✅ Nearest grid value */
.dialog { padding: var(--base-size-16); } /* or var(--base-size-12) */
\`\`\`
**Why it happens:** Designers specify off-grid values from Figma when not constrained to the grid. A spacing lint rule catches these before merge.

| Token | Value | Use |
|-------|-------|-----|
| space-xs | 4px | Icon padding |
| space-sm | 8px | Small components |
| space-md | 16px | Standard padding |
| space-lg | 24px | Sections |
| space-xl | 32px | Layout gaps |`,

    interview: `## INTERVIEW

**Q1 (Junior): Why is a 4px (or 8px) base unit the industry standard for spacing scales?**
A: 4px divides evenly into the smallest perceptible visual unit on most displays and aligns with typical line heights (20px = 5 units, 24px = 6 units). 8px is more common for layout spacing because UI elements naturally come in multiples of 8 — icon sizes (16, 24, 32), common container widths, and touch targets (44px minimum) are all multiples of 8. Using multiples of 4/8 ensures spacing always sits on the pixel grid, preventing anti-aliasing blur on sub-pixel values.

**Q2 (Junior): What is the difference between palette spacing tokens and semantic spacing tokens?**
A: Palette tokens are raw scale values: \`space-4 = 4px\`, \`space-8 = 8px\`. Semantic tokens assign meaning: \`spacing-component-sm = var(--space-2)\`, \`spacing-layout-lg = var(--space-12)\`. Components use semantic tokens. Themes and density modes remap semantic tokens to different palette values. Without the semantic layer, "compact mode" requires changing every component; with it, compact mode is a mapping change in one file.

**Q3 (Mid): How does a spacing system enable density modes (compact/comfortable/spacious)?**
A: Density modes remap semantic spacing tokens to different palette values. Comfortable mode: \`spacing-component-md = 16px\`. Compact: \`spacing-component-md = 12px\`. Spacious: \`spacing-component-md = 24px\`. Implementing via CSS custom property overrides on a \`[data-density]\` attribute means every component inheriting \`var(--spacing-component-md)\` responds automatically. This is why systematic spacing is a prerequisite for density switching.

**Q4 (Mid): How do you enforce the spacing scale and prevent arbitrary values?**
A: Three layers of enforcement: (1) Tailwind config with only scale values in \`theme.spacing\` — arbitrary Tailwind classes like \`p-[14px]\` won't generate CSS. (2) Stylelint with \`stylelint-no-arbitrary-values\` plugin flagging raw pixel values in CSS. (3) Custom ESLint rule for inline styles. The lint rules fail PRs before merge, making the scale the path of least resistance rather than a guideline that gets ignored.

**Q5 (Senior): How does spacing interact with responsive design at scale?**
A: Responsive spacing should be systematic too — spacing shrinks on mobile. The clean pattern: fluid spacing with \`clamp()\` — \`var(--spacing-layout-md) = clamp(16px, 4vw, 32px)\`. Or: define separate mobile/desktop scale values per semantic token with CSS media queries. Avoid component-level breakpoint overrides for spacing — that's 500 places to update. Keep responsive spacing in the token layer.`,

    feynman: `## FEYNMAN CHECK

### Explain Spacing Systems Like I'm 10 Years Old
> A spacing system is a ruler that only has certain notch marks: 4, 8, 16, 24, 32. When you're arranging elements on a page, you must snap to a notch — no in-betweens. This keeps everything aligned and rhythmic, the same way graph paper keeps drawings tidy. The non-obvious part: the notches have names (xs, sm, md) not numbers, so when the product needs a "denser" layout, you just change what number each name points to — the whole page re-spaces without touching any component. This is why "just use 14px there" creates spacing debt.

---

### 5 Deep Questions
**Q1: Why must spacing tokens be semantic (not numeric) for density switching to work?**
> **A:** If components reference \`space-4\` (raw number), changing density means finding every \`space-4\` usage that means "component padding" and changing it — which is indistinguishable from "icon gap" which should not change. Semantic names (\`component-padding-md\`) are specific to their use, so density remaps only the relevant semantics.

**Q2: ONE model.**
> **A:** "Palette = the ruler with notches. Semantic = names for each notch. Components snap to semantic names. Density remaps semantic → different notch."

**Q3: Misconception with code.**
> **A:** Using pixel math instead of tokens:
> \`\`\`css
> /* ❌ 14px — off grid, immune to density changes */
> .card { padding: 14px; }
> /* ✅ On grid, density-aware */
> .card { padding: var(--spacing-component-md); }
> \`\`\`

**Q4: How does spacing interact with the type scale?**
> **A:** Line height and spacing use the same base unit. A paragraph with \`line-height: 24px\` (6 units of 4px) followed by \`margin-bottom: 16px\` (4 units) produces consistent vertical rhythm. If spacing breaks the grid, the text rhythm breaks too — text and layout sit on different grids and the page feels subtly wrong.

**Q5: Senior one-liner.**
> **A:** "A spacing system is a finite scale of mathematically related values assigned to semantic names — which makes density switching O(1 mapping change) instead of O(n component edits)."`,

    build: `## BUILD

### 🏗️ Mini Project: Spacing Scale + Density Switcher

**What you will build:** A CSS token-based spacing system with three density modes (compact/comfortable/spacious) that switch without any component changes.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir spacing-system && cd spacing-system
npx create-next-app@latest . --typescript --tailwind --no-src-dir --app
touch app/spacing.css components/Card.tsx
\`\`\`

#### Step 2 — Core Tokens
\`\`\`css
/* app/spacing.css */
:root {
  /* Palette */
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem;
  --space-4: 1rem;    --space-6: 1.5rem; --space-8: 2rem;
  /* Semantic — comfortable defaults */
  --spacing-component-xs: var(--space-1);
  --spacing-component-sm: var(--space-2);
  --spacing-component-md: var(--space-4);
  --spacing-component-lg: var(--space-6);
  --spacing-layout-md:    var(--space-8);
}
[data-density="compact"] {
  --spacing-component-md: var(--space-3);
  --spacing-component-lg: var(--space-4);
  --spacing-layout-md:    var(--space-6);
}
[data-density="spacious"] {
  --spacing-component-md: var(--space-6);
  --spacing-component-lg: var(--space-8);
  --spacing-layout-md:    calc(var(--space-8) * 1.5);
}
\`\`\`

#### Step 3 — Card Component (uses tokens only)
\`\`\`tsx
export function Card({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ padding: 'var(--spacing-component-md)', gap: 'var(--spacing-component-sm)', display:'flex', flexDirection:'column', border:'1px solid #e5e7eb', borderRadius:'8px' }}>
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
      <p style={{ margin: 0 }}>{body}</p>
    </div>
  );
}
\`\`\`

#### Step 4 — Density Switcher
\`\`\`tsx
export function DensitySwitcher() {
  return (
    <div style={{ display:'flex', gap:'var(--spacing-component-sm)' }}>
      {(['compact','comfortable','spacious'] as const).map(d => (
        <button key={d} onClick={() => document.documentElement.dataset.density = d}>{d}</button>
      ))}
    </div>
  );
}
\`\`\`

#### Step 5 — Tests
\`\`\`tsx
test('compact density reduces spacing token values', () => {
  document.documentElement.dataset.density = 'compact';
  const styles = getComputedStyle(document.documentElement);
  expect(styles.getPropertyValue('--spacing-component-md').trim()).toBe('var(--space-3)');
});
\`\`\`

**Expected Output:**
\`\`\`
Clicking "compact" instantly reduces all card padding — zero component code changes.
\`\`\`

**Stretch Challenges:**
- [ ] Add a lint rule that forbids inline \`padding\` with raw pixel values in TSX files
- [ ] Generate Tailwind spacing config from the token file automatically
- [ ] Add a "screen density" mode that responds to \`prefers-reduced-data\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall

**Q1:** What is the standard base unit for a spacing scale? Why 4px or 8px specifically?

**Q2:** What is the difference between palette spacing tokens and semantic spacing tokens? What breaks if you only have palette tokens?

**Q3:** Write a 10-line CSS custom property spacing scale with 7 values.

---

### Day 3 — Comprehension

**Q4:** How do density modes (compact/comfortable/spacious) work with a semantic token system? What would change without semantic tokens?

**Q5:** Show the off-grid spacing bug and the token-based fix.

**Q6:** Refactor this CSS to use semantic spacing tokens:
\`\`\`css
.card { padding: 14px; margin-bottom: 22px; gap: 6px; }
\`\`\`

---

### Day 7 — Application

**Q7:** Build a spacing scale generator in Node.js: given a base unit and a sequence, output CSS custom properties for palette and semantic layers.

**Q8:** A PR adds \`padding: 14px\` to 30 components. Describe the visual impact and the lint rule that would have caught it.

**Q9:** How does spacing rhythm interact with the typography system's line heights?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ "Design a spacing system that supports compact and spacious density modes without changing any component code."

**Q11:** Link spacing-system → design-tokens → density-modes → responsive-design.

**Q12:** ★ "A product redesign changes the base spacing unit from 4px to 8px. With a systematic token approach, how many files change? Without tokens?"`
  },

  // ──────────────────────────────────────────────────────────────
  // Duplicate/legacy topic slugs — share content with their twins
  // ──────────────────────────────────────────────────────────────

  'accessibility-in-design': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Accessibility in Design Like I'm 10\n> Accessible design means everyone can use the product — keyboard users, screen-reader users, low-vision users, motor-impaired users. The non-obvious part: every interactive element needs a role, name, and state for assistive tech, and semantic HTML provides those for free. This is why "just use a div" silently excludes 15% of users.\n\n---\n\n### 5 Deep Questions\n**Q1: Why is accessibility a design concern, not just a dev concern?** > A: Inaccessible mockups produce inaccessible products. Designers must specify focus states, error states, and contrast in Figma — not leave them for developers to invent.\n**Q2: ONE model.** > A: "Every interactive element has role + name + state. Miss any and AT users are locked out."\n**Q3: Misconception+code.** > A: Decorative aria roles on non-interactive elements. \`\`\`tsx\n// ❌ <div role="button" onClick={...}> — no keyboard, no Enter handler\n// ✅ <button onClick={...}>\n\`\`\`\n**Q4: Interaction with design tokens?** > A: Colour tokens must encode contrast pairs verified at definition time.\n**Q5: Senior one-liner.** > A: "Accessibility in design is encoding WCAG into design tokens, component states, and Figma mockups — not a post-development audit."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: A11y Design Spec Checklist\n**Time:** 20 min\n#### Step 1 — Setup\n\`\`\`bash\ntouch a11y-checklist.md\n\`\`\`\n#### Step 2 — Checklist\nFor every component spec: 4.5:1 contrast, focus indicator, keyboard activation, screen-reader name, error state.\n#### Step 4 — Error Handling\nReject Figma frames lacking focus state.\n#### Step 5 — Tests\nManual audit checklist with pass/fail per criterion.\n\n**Expected Output:**\n\`\`\`\n5/5 criteria documented for every component\n\`\`\``,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** WCAG levels — A/AA/AAA differences.\n**Q2:** Role/name/state — what each is.\n**Q3:** 5-item Figma a11y checklist.\n\n### Day 3\n**Q4:** Designer vs developer a11y responsibilities.\n**Q5:** Common Figma omission — focus state.\n**Q6:** Audit a mockup for contrast.\n\n### Day 7\n**Q7:** Build a Figma a11y plugin spec.\n**Q8:** PR ships a component without focus state — who failed?\n**Q9:** Cost of post-launch a11y retrofit.\n\n### Day 14\n**Q10:** ★ "Design system a11y governance."\n**Q11:** Link accessibility → tokens → components.\n**Q12:** ★ Legal risk of inaccessible products at enterprise scale.`
  },

  'color-theory': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Color Theory Like I'm 10\n> Colours have three properties: hue (red vs blue), saturation (vivid vs grey), and lightness (light vs dark). A design system picks one base hue, then generates a 10-step scale by varying lightness. The non-obvious part: equal lightness steps look uneven to the eye — perceptually-uniform colour spaces (OKLCH, LCH) fix this. This is why \`hsl()\` palettes look "wrong" in the mid range.\n\n---\n\n### 5 Deep Questions\n**Q1: HSL vs OKLCH?** > A: HSL is fast but perceptually non-uniform; OKLCH steps look evenly spaced to humans.\n**Q2: ONE model.** > A: "Hue defines brand. Saturation defines vibrance. Lightness drives the scale. Pick a perceptual space."\n**Q3: Misconception+code.** > A: \`\`\`css\n/* ❌ HSL — mid-range looks muddy */\nbackground: hsl(220 80% 50%);\n/* ✅ OKLCH */\nbackground: oklch(60% 0.2 240);\n\`\`\`\n**Q4: With accessibility?** > A: Lightness directly determines contrast — design lightness pairs for WCAG 4.5:1.\n**Q5: Senior one-liner.** > A: "Color theory operationalised for design systems = hue families × perceptually-uniform lightness scale × verified contrast pairs."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: 10-Step Color Scale Generator\n**Time:** 25 min\n#### Step 2 — Core\n\`\`\`js\nfunction scale(hue) { return Array.from({length:10},(_,i)=>\`oklch(\${95-i*9}% 0.15 \${hue})\`); }\nconsole.log(scale(240)); // 10 perceptually-even blues\n\`\`\`\n#### Step 5 — Tests\nVerify each adjacent pair has visually similar contrast difference.\n\n**Expected Output:**\n\`\`\`\n10 OKLCH colours from 95% lightness down to 5%\n\`\`\``,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** Three colour properties.\n**Q2:** Why OKLCH vs HSL.\n**Q3:** Write 10-step scale generator.\n\n### Day 3\n**Q4:** Perceptual uniformity meaning.\n**Q5:** HSL midtone bug.\n**Q6:** Convert HSL palette to OKLCH.\n\n### Day 7\n**Q7:** Generate accessible pairs.\n**Q8:** PR uses raw hex without scale.\n**Q9:** Cost; degrade.\n\n### Day 14\n**Q10:** ★ "Design a brand palette in OKLCH."\n**Q11:** Link theory → tokens → a11y.\n**Q12:** ★ Rebrand across 500 components.`
  },

  'component-anatomy': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Component Anatomy Like I'm 10\n> Every component is built from parts: container, content, decoration, interactive zones. A button = box + label + icon slot + focus ring. A card = container + header + body + footer slots. Naming the parts lets designers and devs talk the same language. The non-obvious part: components fail when "parts" leak across slots — putting padding on the body instead of the container produces inconsistent spacing.\n\n---\n\n### 5 Deep Questions\n**Q1: Why name the parts?** > A: Common vocabulary for design/dev handoff; matches BEM/CSS naming.\n**Q2: ONE model.** > A: "Container + slots + decoration. Every styling rule belongs to exactly one."\n**Q3: Misconception+code.** > A: \`\`\`tsx\n// ❌ Padding on body breaks alignment\n// ✅ Padding on container, body fills available space\n\`\`\`\n**Q4: With component API?** > A: Slots become compound sub-components (Card.Header, Card.Body).\n**Q5: Senior one-liner.** > A: "Component anatomy is the named-parts contract that aligns Figma layers with React composition."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Card Component with Named Parts\n**Time:** 25 min\n#### Step 2 — Core\n\`\`\`tsx\nfunction Card({children}){return <div className="card">{children}</div>;}\nCard.Header = ({children}) => <div className="card__header">{children}</div>;\nCard.Body   = ({children}) => <div className="card__body">{children}</div>;\nCard.Footer = ({children}) => <div className="card__footer">{children}</div>;\n\`\`\`\n#### Step 5 — Tests\nVerify each part renders independently.\n\n**Expected Output:** Card with named slots`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** Name 3 parts of a button.\n**Q2:** Why named parts matter.\n**Q3:** Write Card with Header/Body/Footer.\n\n### Day 3\n**Q4:** Slot vs prop.\n**Q5:** Padding leak bug.\n**Q6:** Refactor to compound.\n\n### Day 7\n**Q7:** Build Dialog with parts.\n**Q8:** PR mixes container + body styling.\n**Q9:** Cost of unnamed parts.\n\n### Day 14\n**Q10:** ★ "Design anatomy for a DataTable."\n**Q11:** Link anatomy → API → tokens.\n**Q12:** ★ 200 teams using same anatomy.`
  },

  'component-library-setup': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Library Setup Like I'm 10\n> A component library is its own npm package — separate repo (or monorepo package), separate build, separate version. Setup means: TypeScript config, dual CJS/ESM output (tsup or Rollup), peer-deps for React, Storybook for the catalogue, Changesets for versioning. The non-obvious part: bundling React into the library breaks consumer apps with "two React copies" errors. This is why peer-dependencies exist.\n\n---\n\n### 5 Deep Questions\n**Q1: Why peer-deps for React?** > A: Consumer provides React; one instance ensures hooks/context work.\n**Q2: ONE model.** > A: "Library = npm package. Build = tsup. Versions = changesets. React = peer."\n**Q3: Misconception+code.** > A: React in \`dependencies\` → two React instances bug.\n**Q4: ESM vs CJS?** > A: Ship both; module field for ESM, main for CJS, exports map gates resolution.\n**Q5: Senior one-liner.** > A: "Library setup is a publish-able tsup-built React package with peer-React, dual ESM/CJS, types, Storybook, and Changesets."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Minimal Library Package\n**Time:** 35 min\n#### Step 1\n\`\`\`bash\nmkdir lib && cd lib && npm init -y\nnpm i -D tsup typescript react @types/react\n\`\`\`\n#### Step 2 — tsup.config.ts\n\`\`\`ts\nimport {defineConfig} from 'tsup';\nexport default defineConfig({entry:['src/index.ts'],format:['cjs','esm'],dts:true,external:['react']});\n\`\`\`\n#### Step 5 — Build\n\`\`\`bash\nnpx tsup\nls dist  # index.js, index.mjs, index.d.ts\n\`\`\`\n\n**Expected Output:** dist with CJS + ESM + types`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** Why peer-deps for React.\n**Q2:** CJS vs ESM output.\n**Q3:** Write tsup config.\n\n### Day 3\n**Q4:** Storybook vs Jest roles.\n**Q5:** React-bundled bug.\n**Q6:** Add exports field.\n\n### Day 7\n**Q7:** Set up Changesets.\n**Q8:** PR makes React a dependency.\n**Q9:** Treeshaking implications.\n\n### Day 14\n**Q10:** ★ "Monorepo vs separate-repo library."\n**Q11:** Link setup → versioning → publishing.\n**Q12:** ★ Library used by 400 apps.`
  },

  'documenting-design-systems': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Documenting Design Systems Like I'm 10\n> Documentation IS the design system. A component nobody can find or understand might as well not exist. Docs include: usage guidelines, props API, dos/don'ts, accessibility notes, code examples. The non-obvious part: documentation must be co-located with components (MDX in Storybook, not a separate Confluence page) so it stays in sync with code. This is why Notion-based design system docs go stale within 3 months.\n\n---\n\n### 5 Deep Questions\n**Q1: Why co-locate docs with components?** > A: Drift is the #1 documentation failure; co-location forces updates in the same PR.\n**Q2: ONE model.** > A: "Storybook MDX = single source. Props auto-generated from TypeScript. Examples are live stories."\n**Q3: Misconception+code.** > A: Manual prop tables go stale; auto-generate from TS via storybook-addon-docs.\n**Q4: With Figma?** > A: Sync via component spec links; tokens defined in code, mirrored to Figma.\n**Q5: Senior one-liner.** > A: "Design system docs are co-located, code-generated, example-driven MDX — anything else drifts."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Auto-Generated Component Docs\n**Time:** 25 min\n#### Step 2 — Setup Storybook addon-docs\n\`\`\`bash\nnpm i -D @storybook/addon-docs\n\`\`\`\n#### Step 3 — MDX docs page\n\`\`\`mdx\nimport {Meta, ArgTypes} from '@storybook/blocks';\nimport * as Stories from './Button.stories';\n<Meta of={Stories} />\n# Button\n<ArgTypes of={Stories.Primary} />\n\`\`\`\n\n**Expected Output:** Props table auto-generated from TS types`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** What 5 sections must doc include.\n**Q2:** Why co-locate.\n**Q3:** Write MDX doc skeleton.\n\n### Day 3\n**Q4:** Manual vs auto prop tables.\n**Q5:** Drift bug.\n**Q6:** Refactor Confluence doc to MDX.\n\n### Day 7\n**Q7:** Auto-generate from TypeScript.\n**Q8:** Notion docs 6 months later — assess drift.\n**Q9:** Cost of stale docs.\n\n### Day 14\n**Q10:** ★ "Documentation strategy for 100-component system."\n**Q11:** Link docs → storybook → typescript.\n**Q12:** ★ Onboarding 50 new devs.`
  },

  'icons-and-illustration': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Icons & Illustration Like I'm 10\n> Icons are tiny pictograms (24×24, single colour) that label actions. Illustrations are larger scenes (full colour, decorative) that fill empty states or onboarding. They use different rendering, sizing, and theming rules. The non-obvious part: putting an illustration into a button is jarring because illustrations have implicit lighting/perspective that doesn't scale to UI density. This is why design systems separate them entirely.\n\n---\n\n### 5 Deep Questions\n**Q1: Icon vs illustration?** > A: Icon = pictogram, single-colour, currentColor, decorative-or-semantic. Illustration = scene, multi-colour, fixed size, decorative only.\n**Q2: ONE model.** > A: "Icons inherit colour; illustrations don't. Icons signal action; illustrations express tone."\n**Q3: Misconception+code.** > A: Using SVG illustrations as icons → 50KB instead of 1KB and broken theming.\n**Q4: With theming?** > A: Icons swap via currentColor; illustrations need theme variants (light/dark scene files).\n**Q5: Senior one-liner.** > A: "Icons and illustrations have orthogonal contracts — mixing them produces UI noise and bundle bloat."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Empty-State Illustration Component\n**Time:** 20 min\n#### Step 2 — Core\n\`\`\`tsx\nfunction EmptyState({illustration, title, action}) {\n  return <div className="empty"><img src={illustration} alt="" width={200}/><h3>{title}</h3>{action}</div>;\n}\n\`\`\`\n#### Step 5 — Tests\nVerify alt=\\"\\" (decorative), correct sizing, theme-variant loading.\n\n**Expected Output:** Empty state with theme-aware illustration`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** Icon vs illustration contracts.\n**Q2:** Why currentColor for icons only.\n**Q3:** Write EmptyState component.\n\n### Day 3\n**Q4:** Bundle impact comparison.\n**Q5:** Illustration-as-icon bug.\n**Q6:** Theme variant strategy.\n\n### Day 7\n**Q7:** Lazy-load illustrations.\n**Q8:** PR uses 50KB SVG as icon.\n**Q9:** Cost; bundle.\n\n### Day 14\n**Q10:** ★ "Illustration system for marketing + product."\n**Q11:** Link icons → illustration → theming.\n**Q12:** ★ 100 illustrations, multi-theme.`
  },

  'responsive-design-system': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Responsive Design Systems Like I'm 10\n> A responsive design system encodes breakpoints, fluid type scales, and density modes as tokens — so changing "mobile vs desktop" is a token swap, not a per-component media query. The non-obvious part: per-component breakpoints (\`@media (max-width: 768px)\` in 500 places) cause inconsistent breakpoint behaviour. Centralising at the token layer ensures every component responds in lockstep.\n\n---\n\n### 5 Deep Questions\n**Q1: Why centralise breakpoints?** > A: Otherwise 50 different teams pick different breakpoint values; layouts break at random viewport widths.\n**Q2: ONE model.** > A: "Breakpoints, type-scale, spacing-scale all expose mobile/tablet/desktop variants via CSS custom properties + container queries."\n**Q3: Misconception+code.** > A: Per-component media queries duplicate logic; container queries scope responsiveness to the component.\n**Q4: With density?** > A: Mobile = compact; desktop = comfortable; respond to viewport + user preference.\n**Q5: Senior one-liner.** > A: "Responsive design systems treat viewport as just another theme axis — breakpoint tokens drive container/element queries that keep components contextually aware."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Breakpoint Tokens + Container Query\n**Time:** 25 min\n#### Step 2 — Tokens\n\`\`\`css\n:root {\n  --bp-sm: 640px; --bp-md: 768px; --bp-lg: 1024px; --bp-xl: 1280px;\n}\n.card { container-type: inline-size; }\n@container (min-width: 400px) { .card__title { font-size: 1.5rem; } }\n\`\`\`\n\n**Expected Output:** Component adapts to its container, not viewport`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** Why breakpoint tokens.\n**Q2:** Media vs container queries.\n**Q3:** Write 4-step breakpoint scale.\n\n### Day 3\n**Q4:** Per-component media bug.\n**Q5:** Fluid clamp() pattern.\n**Q6:** Refactor to container queries.\n\n### Day 7\n**Q7:** Density-aware breakpoints.\n**Q8:** PR uses raw 768px in 30 components.\n**Q9:** Cost; degrade.\n\n### Day 14\n**Q10:** ★ "Responsive strategy for 500 components."\n**Q11:** Link responsive → tokens → density.\n**Q12:** ★ Mobile-first vs desktop-first at scale.`
  },

  'spacing-and-layout': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Spacing & Layout Like I'm 10\n> Spacing and layout are the invisible grid that aligns everything. The spacing scale (4/8/16/24) is the grid; layout primitives (Stack, Cluster, Grid) are how components arrange themselves on it. The non-obvious part: layout primitives encode common patterns (vertical stack with spacing, horizontal cluster with wrap) once, so 500 components don't each reinvent flexbox. This is why systems like Every Layout exist.\n\n---\n\n### 5 Deep Questions\n**Q1: Why layout primitives?** > A: Common patterns (Stack/Cluster/Grid/Sidebar) abstract flexbox/grid into named components everyone uses identically.\n**Q2: ONE model.** > A: "Spacing scale + layout primitives + container queries = the entire layout system."\n**Q3: Misconception+code.** > A: Inline flex+gap in every component duplicates layout intent.\n**Q4: With tokens?** > A: Layout primitives consume spacing tokens (Stack gap=md).\n**Q5: Senior one-liner.** > A: "Layout primitives are the named-pattern abstraction over flex/grid — they prevent 500 unique layout implementations."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Stack + Cluster Primitives\n**Time:** 25 min\n#### Step 2 — Core\n\`\`\`tsx\nfunction Stack({gap='md', children}){return <div style={{display:'flex',flexDirection:'column',gap:\`var(--space-\${gap})\`}}>{children}</div>;}\nfunction Cluster({gap='md', children}){return <div style={{display:'flex',flexWrap:'wrap',gap:\`var(--space-\${gap})\`}}>{children}</div>;}\n\`\`\`\n\n**Expected Output:** Reusable layout primitives across 50 components`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** Name 4 layout primitives.\n**Q2:** Why primitives over inline flex.\n**Q3:** Write Stack component.\n\n### Day 3\n**Q4:** Stack vs Cluster.\n**Q5:** Inline flex duplication bug.\n**Q6:** Refactor 5 components to use Stack.\n\n### Day 7\n**Q7:** Add Grid primitive with named areas.\n**Q8:** PR uses inline flex everywhere.\n**Q9:** Bundle and maintenance cost.\n\n### Day 14\n**Q10:** ★ "Design a layout primitive library."\n**Q11:** Link primitives → spacing → responsive.\n**Q12:** ★ 1000-page app with 4 primitives.`
  },

  'state-management-ui': {
    feynman: `## FEYNMAN CHECK\n\n### Explain UI State Management Like I'm 10\n> Every component has internal states: idle, loading, error, success, disabled, focused, hovered, selected. UI state management means making all those states explicit and predictable. The non-obvious part: implicit state ("button.disabled = something") leads to undefined states (loading + disabled + error all true). A discriminated union forces one state at a time. This is why XState is popular for complex components.\n\n---\n\n### 5 Deep Questions\n**Q1: Boolean props pitfall?** > A: Multiple booleans create 2^n possible states; most are invalid.\n**Q2: ONE model.** > A: "State = discriminated union. Variant = mutually exclusive visual."\n**Q3: Misconception+code.** > A: \`\`\`tsx\n// ❌ <Btn loading error disabled>\n// ✅ <Btn state="loading">\n\`\`\`\n**Q4: With XState?** > A: Visualised state charts for complex components (multi-step wizards).\n**Q5: Senior one-liner.** > A: "UI state management replaces ad-hoc booleans with explicit state machines, making invalid states unrepresentable at the type level."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: State-Machine Button\n**Time:** 25 min\n#### Step 2 — Core\n\`\`\`tsx\ntype State = {kind:'idle'}|{kind:'loading'}|{kind:'error',msg:string}|{kind:'success'};\nfunction StatefulBtn({state,onClick}:{state:State;onClick:()=>void}){\n  switch(state.kind){case 'loading': return <button disabled aria-busy>Loading…</button>;case 'error': return <button aria-invalid>{state.msg}</button>;case 'success': return <button>✓ Done</button>;default: return <button onClick={onClick}>Submit</button>;}\n}\n\`\`\`\n\n**Expected Output:** Component cannot be in invalid state`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** Boolean explosion problem.\n**Q2:** Discriminated union benefit.\n**Q3:** Write 4-state Button.\n\n### Day 3\n**Q4:** State machine vs Redux.\n**Q5:** Multi-boolean bug.\n**Q6:** Refactor to union.\n\n### Day 7\n**Q7:** XState for a wizard.\n**Q8:** PR adds 5th boolean.\n**Q9:** Cost of invalid states.\n\n### Day 14\n**Q10:** ★ "State strategy for complex modal flow."\n**Q11:** Link state → API → typescript.\n**Q12:** ★ Production bug from invalid state combo.`
  },

  'storybook-basics': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Storybook Basics Like I'm 10\n> Storybook is a development sandbox where each component lives in isolation, in every state. You write "stories" — one per prop combination — and Storybook renders them in a browsable UI. The non-obvious part: stories double as visual regression tests (Chromatic) and as interaction tests (play functions). One artefact, three uses. This is why every serious design system uses it.\n\n---\n\n### 5 Deep Questions\n**Q1: What is a story?** > A: A named, reproducible component instance with specific props.\n**Q2: ONE model.** > A: "Story = component + args + optional play function."\n**Q3: Misconception+code.** > A: Only happy-path stories miss loading/error states.\n**Q4: With Chromatic?** > A: Visual regression on every PR.\n**Q5: Senior one-liner.** > A: "Storybook is the component workbench, documentation site, and test harness in one."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: First Storybook + 4 Stories\n**Time:** 25 min\n#### Step 1\n\`\`\`bash\nnpx storybook@latest init\n\`\`\`\n#### Step 2 — Stories\n\`\`\`tsx\nexport const Primary = {args:{variant:'primary',children:'Save'}};\nexport const Disabled= {args:{disabled:true,children:'Off'}};\nexport const Loading = {args:{loading:true,children:'…'}};\nexport const Error   = {args:{variant:'destructive',children:'Delete'}};\n\`\`\`\n\n**Expected Output:** Storybook with 4 button states`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** What is a story?\n**Q2:** Args vs play.\n**Q3:** Write 3 stories.\n\n### Day 3\n**Q4:** CSF3 syntax.\n**Q5:** Missing states bug.\n**Q6:** Add controls.\n\n### Day 7\n**Q7:** Set up Chromatic.\n**Q8:** PR with 1 story for 50-prop component.\n**Q9:** Coverage measurement.\n\n### Day 14\n**Q10:** ★ "Story strategy for 100 components."\n**Q11:** Link storybook → testing → docs.\n**Q12:** ★ Visual regression at scale.`
  },

  'theming-and-dark-mode': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Theming & Dark Mode Like I'm 10\n> Dark mode swaps the colour palette without rewriting components. The trick: components reference semantic tokens (\`--text-primary\`), and dark mode remaps those tokens to dark-palette values. The non-obvious part: CSS custom properties cascade for free without React re-renders — switching themes is one DOM attribute change. This is why React-context theming causes 200ms jank that CSS theming doesn't.\n\n---\n\n### 5 Deep Questions\n**Q1: CSS vars vs React context?** > A: CSS = zero re-renders; context = O(n consumers) re-renders.\n**Q2: ONE model.** > A: "Tokens reference palette by semantic name; \`[data-theme]\` selector remaps."\n**Q3: Misconception+code.** > A: Hardcoded \`#fff\` in components breaks dark mode entirely.\n**Q4: SSR/flash?** > A: Sync script in <head> reads localStorage before paint.\n**Q5: Senior one-liner.** > A: "Theming is a CSS cascade controlled by data-theme — the React-state approach is the wrong tool."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Light/Dark Toggle\n**Time:** 25 min\n#### Step 2 — Tokens\n\`\`\`css\n:root, [data-theme=light] { --bg: white; --fg: #111; }\n[data-theme=dark] { --bg: #111; --fg: white; }\nbody { background: var(--bg); color: var(--fg); }\n\`\`\`\n\n**Expected Output:** Theme switches instantly, zero re-renders`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** CSS vs context theming cost.\n**Q2:** \`data-theme\` mechanic.\n**Q3:** Write light/dark tokens.\n\n### Day 3\n**Q4:** FOUT/flash prevention.\n**Q5:** Hardcoded colour bug.\n**Q6:** Add high-contrast.\n\n### Day 7\n**Q7:** Persist + system pref.\n**Q8:** PR uses React context — perf cost.\n**Q9:** Contrast verification.\n\n### Day 14\n**Q10:** ★ "Multi-tenant brand theming."\n**Q11:** Link theming → tokens → a11y.\n**Q12:** ★ Theme change at 10M users.`
  },

  'typography-scale': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Typography Scale Like I'm 10\n> A type scale is a finite set of font sizes derived from a base × a ratio (1.25, 1.333). Components pick from these only — never arbitrary sizes. Modular relationships make any pair look harmonious. The non-obvious part: a 17px size feels "wrong" next to 16/20 because it's off-ratio. This is why one-off type sizes cause subtle visual noise even when nobody can name why.\n\n---\n\n### 5 Deep Questions\n**Q1: Why a ratio?** > A: Harmonic relationships — same reason musical chords work.\n**Q2: ONE model.** > A: "base × ratio^n. Components pick semantic names mapped to scale steps."\n**Q3: Misconception+code.** > A: Custom 17px bypasses the scale; lint should reject.\n**Q4: With fluid?** > A: clamp(min, vw-based, max) keeps scale steps responsive.\n**Q5: Senior one-liner.** > A: "A typography scale is a modular sequence of harmonic sizes that prevents the visual entropy of ad-hoc font sizing."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: 1.25 Ratio Scale Generator\n**Time:** 20 min\n#### Step 2 — Core\n\`\`\`js\nconst scale = (base=16, ratio=1.25, n=7) => Array.from({length:n}, (_,i)=>(base*Math.pow(ratio,i-2)).toFixed(2));\nconsole.log(scale()); // xs, sm, base, md, lg, xl, 2xl\n\`\`\`\n\n**Expected Output:**\n\`\`\`\n[10.24, 12.80, 16.00, 20.00, 25.00, 31.25, 39.06]\n\`\`\``,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** What's a modular scale?\n**Q2:** Common ratios.\n**Q3:** Write scale generator.\n\n### Day 3\n**Q4:** Semantic vs numeric naming.\n**Q5:** One-off size bug.\n**Q6:** Convert px to rem.\n\n### Day 7\n**Q7:** Fluid scale with clamp.\n**Q8:** PR uses 17px in 6 places.\n**Q9:** Visual entropy cost.\n\n### Day 14\n**Q10:** ★ "Scale for marketing + UI dual context."\n**Q11:** Link type-scale → tokens → responsive.\n**Q12:** ★ Scale change across 500 components.`
  }

};




