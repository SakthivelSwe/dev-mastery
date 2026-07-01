/**
 * Patches design-system-content.js to add CODE sections for 10 remaining topics.
 * Run: node scripts/patch-design-system-code.js
 */
const fs = require('fs');
const path = require('path');

const contentFile = path.join(__dirname, 'content', 'design-system-content.js');
let content = fs.readFileSync(contentFile, 'utf8');

const codeSections = {

'component-api-design': `## CODE

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

'data-display': `## CODE

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

'design-token-pipeline': `## CODE

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
  if (errors.length) throw new Error('Invalid tokens:\n' + errors.join('\n'));
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
      .join('\n');
    return \`\${selector} {\n\${vars}\n}\n\`;
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

'feedback-components': `## CODE

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

'iconography': `## CODE

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
    const componentName = file.replace('.svg', '').replace(/-(\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, c => c.toUpperCase()) + 'Icon';
    const jsxCode = await transform(svgContent, SVGR_CONFIG, { componentName });
    fs.writeFileSync(path.join(OUT_DIR, \`\${componentName}.tsx\`), jsxCode);
    exports.push(\`export { default as \${componentName} } from './\${componentName}';\`);
    console.log(\`✅ Generated \${componentName}\`);
  }

  fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), exports.join('\n') + '\n');
  console.log(\`\n✅ Barrel file written: \${exports.length} icons\`);
}

buildIcons().catch(console.error);
\`\`\``,

'input-and-form-components': `## CODE

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
          pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
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

'modal-and-overlay': `## CODE

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

'navigation-components': `## CODE

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

'theming-architecture': `## CODE

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

'versioning-and-publishing': `## CODE

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
\`\`\``

};

// For each topic, find 'TOPIC_NAME': { and add code: `...`, before the first existing key
Object.entries(codeSections).forEach(([topic, code]) => {
  const escapedCode = code.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  // Find the pattern: 'topic-name': {\n    firstKey:
  const topicPattern = new RegExp(`('${topic}':\\s*\\{)`, 'g');
  if (topicPattern.test(content)) {
    content = content.replace(
      new RegExp(`('${topic}':\\s*\\{)`),
      `'${topic}': {\n    code: \`${escapedCode}\`,\n`
    );
    console.log(`✅ Added code to: ${topic}`);
  } else {
    console.log(`❌ Topic not found: ${topic}`);
  }
});

fs.writeFileSync(contentFile, content, 'utf8');
console.log('\nDone!');

