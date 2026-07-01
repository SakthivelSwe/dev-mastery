module.exports = {

  // ── 1. angular-intro ──────────────────────────────────────────────────────
  'angular-intro': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Like I'm 10 Years Old
> Angular is Google's **opinionated full framework** — unlike React (a library that only handles the view layer), Angular ships routing, HTTP, forms, dependency injection, animations, and testing in one box. Think of React as buying a car engine and assembling the rest yourself; Angular is buying a fully assembled car. The non-obvious internal detail: Angular compiles your HTML templates to **TypeScript class methods** at build time (Ahead-of-Time compilation) — your template expressions like \`{{ user.name }}\` become type-checked JavaScript that runs at native speed, not interpreted at runtime. This is why Angular startup is fast and runtime errors are rare: the compiler catches them before the user ever loads the page. This is why "template errors" in Angular are caught at \`ng build\`, not at user runtime.

---

### 5 Deep Conceptual Questions

**Q1: What problem does Angular solve that React + a stack of libraries cannot?**
> **A:** Angular solves the **consistency and scalability** problem. When a team of 50 engineers uses React, every sub-team picks different routing (React Router vs TanStack), state (Redux vs Zustand vs Context), HTTP (axios vs fetch), and form libraries. Angular mandates a single way for each concern, enforced by the CLI scaffolding, the compiler, and the module system. The cost is less flexibility; the benefit is that switching teams or onboarding engineers requires no "which stack does this project use?" orientation.

**Q2: What is the single mental model that makes Angular click?**
> **A:** **"Everything is a decorated class."** A component is a class decorated with \`@Component\`. A service is a class decorated with \`@Injectable\`. A directive is a class decorated with \`@Directive\`. Angular's DI system, change detection, and compiler all work on this uniform base. Once you see that decorators are just metadata containers and the framework reads that metadata at bootstrap, every Angular API becomes predictable: the decorator tells Angular what the class IS, the class body tells Angular what it DOES.

**Q3: What is the most dangerous misconception about Angular?**
> **A:** That NgModule is still required (it is not — standalone components are the default since Angular 17):
> \`\`\`typescript
> // Old approach — NgModule everywhere
> @NgModule({ declarations: [AppComponent], bootstrap: [AppComponent] })
> export class AppModule {}
>
> // Modern Angular 17+ — standalone by default
> @Component({ standalone: true, selector: 'app-root', template: '<h1>Hello</h1>' })
> export class AppComponent {}
> // bootstrapApplication(AppComponent, { providers: [provideRouter(routes)] });
> \`\`\`

**Q4: How does Angular's AOT compiler interact with TypeScript types?**
> **A:** AOT compilation runs the Angular template compiler BEFORE the browser loads the page. It reads your TypeScript class properties and template expressions, generates optimised JavaScript factory functions, and type-checks template bindings against the TypeScript types. This means a typo like \`{{ user.nme }}\` is a compile-time error, not a silent runtime blank. The compiled output is 20-30% smaller than JIT-compiled apps and boots faster because no compiler is shipped to the browser.

**Q5: FAANG-grade one-sentence definition of Angular.**
> **A:** "Angular is an opinionated, full-stack TypeScript framework by Google that compiles HTML templates to type-checked JavaScript factory functions at build time, provides a hierarchical dependency injection system, zone-based or signal-based change detection, and CLI tooling for generating, testing, building, and deploying enterprise-scale single-page applications."`,

    build: `## BUILD

### 🏗️ Mini Project: Standalone Angular App — Component + Service + Routing (No NgModule)

**What you will build:** A minimal Angular 17+ standalone app with a UserService injected into a UserListComponent, route navigation to a UserDetailComponent, and HTTP calls to JSONPlaceholder — wired with provideRouter + provideHttpClient.
**Why this project:** Forces every Angular fundamental — standalone bootstrap, DI, routing, HTTP — without legacy NgModule boilerplate.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
npm install -g @angular/cli@latest
ng new angular-intro-demo --standalone --routing --style css
cd angular-intro-demo
\`\`\`

#### Step 2 — User Service
\`\`\`typescript
// src/app/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User { id: number; name: string; email: string; }

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = 'https://jsonplaceholder.typicode.com';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(\`\${this.baseUrl}/users\`);
  }
  getUser(id: number): Observable<User> {
    return this.http.get<User>(\`\${this.baseUrl}/users/\${id}\`);
  }
}
\`\`\`

#### Step 3 — User List Component
\`\`\`typescript
// src/app/user-list/user-list.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { UserService, User } from '../user.service';

@Component({
  standalone: true,
  selector: 'app-user-list',
  imports: [RouterLink, NgFor],
  template: \`
    <h2>Users</h2>
    <ul>
      <li *ngFor="let user of users">
        <a [routerLink]="['/users', user.id]">{{ user.name }}</a>
        <small> — {{ user.email }}</small>
      </li>
    </ul>
  \`,
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  users: User[] = [];

  ngOnInit() {
    this.userService.getUsers().subscribe(users => this.users = users);
  }
}
\`\`\`

#### Step 4 — Routing and Bootstrap
\`\`\`typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'users', loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent) },
];

// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideHttpClient()],
});
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
// user-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService } from '../user.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('UserListComponent', () => {
  let fixture: ComponentFixture<UserListComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers']);
    mockUserService.getUsers.and.returnValue(of([{ id: 1, name: 'Ana', email: 'ana@dev.io' }]));
    await TestBed.configureTestingModule({
      imports: [UserListComponent, RouterTestingModule],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compileComponents();
    fixture = TestBed.createComponent(UserListComponent);
    fixture.detectChanges();
  });

  it('renders user names', () => {
    expect(fixture.nativeElement.textContent).toContain('Ana');
  });
  it('calls getUsers on init', () => {
    expect(mockUserService.getUsers).toHaveBeenCalledTimes(1);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
ng serve -> http://localhost:4200
/users -> list of 10 users from JSONPlaceholder
Tests: 2 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add signals-based state to replace ngOnInit subscription
- [ ] Add a search input with debounce using RxJS switchMap
- [ ] Add route guards protecting a detail page`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is the difference between Angular and React architecturally?
**Q2:** What does AOT compilation do and why does it matter?
**Q3:** Write the minimal standalone Angular component bootstrap. From memory.

### Day 3 — Comprehension
**Q4:** What is providedIn: 'root' and how does it differ from providing a service in a component?
**Q5:** A junior uses NgModule on a new Angular 17 project — what is the modern alternative?
**Q6:** Refactor this NgModule-based bootstrap to standalone:
\`\`\`typescript
@NgModule({ declarations: [AppComponent], imports: [BrowserModule, HttpClientModule], bootstrap: [AppComponent] })
export class AppModule {}
\`\`\`

### Day 7 — Application
**Q7:** Build an Angular app with lazy-loaded routes and a shared service across routes.
**Q8:** A PR creates a new service in a feature module — is the service a singleton?
**Q9:** What does ng build --configuration production do differently than ng build?

### Day 14 — Synthesis
**Q10:** ★ Interview: "What is Angular's dependency injection hierarchy and how does it differ from a service locator?"
**Q11:** Draw: Angular bootstrap sequence from main.ts to first render.
**Q12:** ★ System design: "Design an Angular micro-frontend architecture for 5 teams — module federation, shared components, independent deployments."`
  },

  // ── 2. components-angular ────────────────────────────────────────────────
  'components-angular': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Components Like I'm 10 Years Old
> An Angular component is a **TypeScript class + HTML template + CSS styles** packaged together and registered via the @Component decorator. When the Angular runtime finds app-user-list in a parent template, it looks up which component claims that selector, creates an instance, renders the template using the instance's properties, and inserts it into the DOM. The non-obvious detail: Angular creates a **ViewRef** object — a structured internal representation that tracks bindings, queries, and change-detection state separately from the actual DOM, enabling performant incremental updates without touching the entire DOM tree.

---

### 5 Deep Conceptual Questions

**Q1: What is the selector and why does Angular use CSS selectors?**
> **A:** The selector string ('app-user-list', '[appHighlight]', '.my-class') is a CSS selector. Angular matches components and directives to DOM elements using the same matching algorithm as CSS. Element selectors (app-*) create component-style custom elements; attribute selectors ([appHighlight]) create directive-style behaviour extensions. Using CSS selectors means Angular can determine which components apply to an element purely from the template at compile time — no runtime lookup table needed.

**Q2: What is the mental model for @Input and @Output?**
> **A:** @Input() declares a one-way data binding from PARENT to CHILD — the parent sets it via [propertyName]="value". @Output() declares an event emitter from CHILD to PARENT — the child emits via this.myEvent.emit(data) and the parent listens via (myEvent)="handler($event)". Together they enforce unidirectional data flow: data flows DOWN through inputs, events flow UP through outputs. This is the same philosophy as React props + callbacks, but Angular enforces it via decorator metadata visible to the compiler.

**Q3: Most dangerous misconception about components?**
> **A:** Thinking OnPush components always skip change detection:
> \`\`\`typescript
> // WRONG: Mutating an @Input object does not trigger OnPush re-render
> @Component({ changeDetection: ChangeDetectionStrategy.OnPush })
> export class ListComponent {
>   @Input() items: string[] = [];
> }
> // Parent: this.items.push('new') — reference unchanged, OnPush skips!
>
> // CORRECT: Replace the reference
> this.items = [...this.items, 'new item'];
> // Or use signals — they notify automatically
> \`\`\`

**Q4: How does Angular's view hierarchy relate to the DOM hierarchy?**
> **A:** Angular maintains a component tree parallel to the DOM tree — each component has an associated ViewRef containing bindings, queries, child views, and a dirty flag. When change detection runs, Angular walks this view tree (not the DOM) — reading component properties and comparing to last values. Only dirty nodes update the DOM. The DetachChangeDetectorRef API lets you remove a subtree from this walk entirely, and markForCheck re-attaches it — the foundation of manual performance tuning.

**Q5: FAANG-grade definition of Angular components.**
> **A:** "An Angular component is a TypeScript class annotated with @Component metadata (selector, template, styles, imports, changeDetection strategy) that Angular instantiates per matching DOM element — creating a ViewRef for incremental DOM diffing, processing @Input/@Output bindings for parent-child communication, querying child elements via @ViewChild/@ContentChild, and participating in change detection either via zone-based dirty marking or signal-based reactive notification."`,

    build: `## BUILD

### 🏗️ Mini Project: Reusable Data-Table Component With Sorting, Pagination, @Input/@Output

**What you will build:** A generic app-data-table component that accepts columns and rows as inputs, emits sort events, and handles pagination internally — the core reusable component of every enterprise Angular app.
**Why this project:** Forces @Input/@Output, ChangeDetectionStrategy.OnPush, typed generics, and component composition.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new data-table-demo --standalone --routing false
cd data-table-demo
ng generate component data-table --standalone
\`\`\`

#### Step 2 — Component
\`\`\`typescript
// src/app/data-table/data-table.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

export interface Column<T> { key: keyof T; label: string; sortable?: boolean; }
export interface SortEvent<T> { key: keyof T; direction: 'asc' | 'desc'; }

@Component({
  standalone: true,
  selector: 'app-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf],
  template: \`
    <table>
      <thead>
        <tr>
          <th *ngFor="let col of columns"
              [style.cursor]="col.sortable ? 'pointer' : 'default'"
              (click)="col.sortable && sort(col.key)">
            {{ col.label }}
            <span *ngIf="sortKey() === col.key">{{ sortDirection() === 'asc' ? 'up' : 'down' }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of pagedRows()">
          <td *ngFor="let col of columns">{{ row[col.key] }}</td>
        </tr>
      </tbody>
    </table>
    <div>
      <button (click)="prevPage()" [disabled]="page() === 0">Prev</button>
      <span>Page {{ page() + 1 }} / {{ totalPages() }}</span>
      <button (click)="nextPage()" [disabled]="page() === totalPages() - 1">Next</button>
    </div>
  \`,
})
export class DataTableComponent<T extends Record<string, unknown>> {
  @Input({ required: true }) columns: Column<T>[] = [];
  @Input({ required: true }) set rows(val: T[]) { this._rows.set(val); this._page.set(0); }
  @Input() pageSize = 10;
  @Output() sortChange = new EventEmitter<SortEvent<T>>();

  private _rows = signal<T[]>([]);
  private _page = signal(0);
  sortKey = signal<keyof T | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');
  page = this._page.asReadonly();

  pagedRows = computed(() => {
    const start = this._page() * this.pageSize;
    return this._rows().slice(start, start + this.pageSize);
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this._rows().length / this.pageSize)));

  sort(key: keyof T) {
    const dir = this.sortKey() === key && this.sortDirection() === 'asc' ? 'desc' : 'asc';
    this.sortKey.set(key); this.sortDirection.set(dir);
    this.sortChange.emit({ key, direction: dir });
  }
  prevPage() { if (this._page() > 0) this._page.update(p => p - 1); }
  nextPage() { if (this._page() < this.totalPages() - 1) this._page.update(p => p + 1); }
}
\`\`\`

#### Step 3 — Use In App
\`\`\`typescript
// app.component.ts
@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: \`
    <app-data-table [columns]="columns" [rows]="users" [pageSize]="5" (sortChange)="onSort($event)"/>
  \`,
})
export class AppComponent {
  columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    { key: 'name' as const, label: 'Name', sortable: true },
    { key: 'email' as const, label: 'Email' },
  ];
  users = [
    { id: 1, name: 'Ana', email: 'ana@dev.io' },
    { id: 2, name: 'Ben', email: 'ben@dev.io' },
  ];
  onSort(event: any) { console.log('Sort:', event); }
}
\`\`\`

#### Step 4 — Error Handling: OnPush Reference Safety
\`\`\`typescript
// Always give OnPush components NEW references
export class ParentComponent {
  rows = signal<any[]>([]);
  addRow(row: any) {
    // WRONG: this.rows().push(row) — OnPush won't detect
    // CORRECT: new reference via signal update
    this.rows.update(current => [...current, row]);
  }
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
it('renders column headers', async () => {
  const fixture = TestBed.createComponent(DataTableComponent);
  fixture.componentRef.setInput('columns', [{ key: 'name', label: 'Name' }]);
  fixture.componentRef.setInput('rows', [{ name: 'Ana' }]);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Name');
  expect(fixture.nativeElement.textContent).toContain('Ana');
});

it('emits sortChange on column click', () => {
  const fixture = TestBed.createComponent(DataTableComponent);
  fixture.componentRef.setInput('columns', [{ key: 'name', label: 'Name', sortable: true }]);
  fixture.componentRef.setInput('rows', []);
  const emits: any[] = [];
  fixture.componentInstance.sortChange.subscribe(e => emits.push(e));
  fixture.detectChanges();
  fixture.debugElement.query(By.css('th')).nativeElement.click();
  expect(emits[0]).toEqual({ key: 'name', direction: 'asc' });
});
\`\`\`

**Expected Output:**
\`\`\`
Table with headers rendered
Pagination controls visible
Click column header -> sortChange emitted
Tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add column filtering via input above each column
- [ ] Add row selection with @Output for selected rows
- [ ] Add CDK VirtualScrollViewport for 10k rows`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What three things make up an Angular component?
**Q2:** What does ChangeDetectionStrategy.OnPush do?
**Q3:** Write a component with one @Input and one @Output. From memory.

### Day 3 — Comprehension
**Q4:** Why does mutating an @Input array not trigger OnPush re-render?
**Q5:** A junior adds a CSS class selector as the component selector — what does that mean and when does it break?
**Q6:** Refactor to signal-based:
\`\`\`typescript
export class CounterComponent {
  count = 0;
  increment() { this.count++; }
}
\`\`\`

### Day 7 — Application
**Q7:** Build a reusable card component with @Input title, body, and a click @Output.
**Q8:** A PR uses document.querySelector inside a component — explain the Angular alternative.
**Q9:** When should a component use inject() vs constructor injection?

### Day 14 — Synthesis
**Q10:** ★ Interview: "What is the difference between a component and a directive in Angular?"
**Q11:** Draw: Angular view tree vs DOM tree for a nested component hierarchy.
**Q12:** ★ System design: "Design a design-system component library in Angular — standalone components, theming, tree-shaking, versioning."`
  },

  // ── 3. templates ─────────────────────────────────────────────────────────
  'templates': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Templates Like I'm 10 Years Old
> Angular templates are HTML with **superpowers added by the Angular compiler**. The compiler scans your HTML, finds Angular-specific syntax (structural directives like *ngFor, binding syntax like [property]="expr", event listeners like (click)="handler()"), and converts them to TypeScript view-update functions. Your HTML is never interpreted at runtime — it's compiled away. The non-obvious depth: Angular 17 introduces @if, @for, @switch control flow syntax that replaces *ngIf, *ngFor, *ngSwitch — the new syntax is compiled to more efficient code because the compiler has direct access to the control flow, enabling better tree-shaking and block-level variable scoping.

---

### 5 Deep Conceptual Questions

**Q1: What are the four types of template binding?**
> **A:** (1) Interpolation {{ expr }} — one-way, property to DOM text. (2) Property binding [prop]="expr" — one-way, expression to DOM property (not HTML attribute). (3) Event binding (event)="handler($event)" — DOM event to component method. (4) Two-way binding [(ngModel)]="prop" — sugar for [ngModel]="prop" (ngModelChange)="prop=$event". The distinction between property and attribute binding is critical: [disabled]="true" sets the DOM property; [attr.aria-label]="label" sets the HTML attribute.

**Q2: Mental model for structural directives?**
> **A:** Structural directives (those with * prefix or the new @ syntax) don't just modify elements — they add or remove DOM subtrees. *ngIf="show" is sugar for ng-template [ngIf]="show" — Angular physically removes the inner DOM nodes when false (no hidden elements, genuine DOM removal). The new @if syntax compiles more directly, avoiding the ng-template wrapper overhead and enabling proper TypeScript type narrowing inside the block.

**Q3: Most dangerous misconception about Angular templates?**
> **A:** Template expressions are pure and free:
> \`\`\`typescript
> // WRONG: functions in templates run on every change detection cycle
> // This function is called 60+ times per second in active apps
> <p>{{ computeExpensiveValue() }}</p>
> <li *ngFor="let item of getItems()">{{ item.name }}</li>
>
> // CORRECT: compute once, store in a property or signal
> expensiveValue = computeExpensiveValue();  // computed once
> items = getItems();                         // computed once
> // Or use signals/computed for reactive lazy updates
> \`\`\`

**Q4: How does the new @for control flow differ from *ngFor?**
> **A:** The new @for (item of items; track item.id) syntax requires a track expression (mandatory, not optional like trackBy), which tells Angular which property uniquely identifies each item. This enables Angular to reuse DOM nodes instead of recreating them when the array changes. The @empty block lets you show fallback content when the array is empty without a second *ngIf, and variable scoping is block-level (no leakage to parent scope).

**Q5: FAANG-grade definition of Angular templates.**
> **A:** "Angular templates are HTML documents processed by the Angular compiler at build time into TypeScript view-update functions — with interpolation, property/attribute/event/two-way bindings, structural control flow (@if/@for/@switch), template reference variables (#ref), the async pipe for Observable unwrapping, ng-content for projection, ng-template for deferred rendering, and type-checked bindings that catch errors at compile time via the Ivy strict template checker."`,

    build: `## BUILD

### 🏗️ Mini Project: Template Showcase — All 4 Binding Types + New Control Flow + Pipes

**What you will build:** A single Angular component demonstrating every template binding type, the new @if/@for/@switch control flow, custom pipe, async pipe, and template reference variables.
**Why this project:** Forces every template syntax in context — the complete template language in one running demo.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new template-showcase --standalone --routing false
cd template-showcase
ng generate pipe truncate --standalone
\`\`\`

#### Step 2 — Truncate Pipe
\`\`\`typescript
// src/app/truncate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true, pure: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 50, trail = '...'): string {
    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}
\`\`\`

#### Step 3 — Template Demo Component
\`\`\`typescript
// app.component.ts
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { TruncatePipe } from './truncate.pipe';
import { of, delay } from 'rxjs';

@Component({
  standalone: true,
  imports: [FormsModule, AsyncPipe, TruncatePipe],
  template: \`
    <h3>1. Interpolation</h3>
    <p>Hello, {{ userName() }}! Messages: {{ messages().length }}</p>

    <h3>2. Property Binding</h3>
    <input [placeholder]="'Type here...'" [disabled]="isDisabled()">

    <h3>3. Event Binding</h3>
    <button (click)="addMessage()">Add</button>
    <button (dblclick)="clearMessages()">Clear</button>

    <h3>4. Two-Way Binding</h3>
    <input [(ngModel)]="searchTerm">
    <p>Searching: {{ searchTerm }}</p>

    <h3>5. @if control flow</h3>
    @if (messages().length > 0) {
      <p>{{ messages().length }} message(s)</p>
    } @else {
      <p>No messages</p>
    }

    <h3>6. @for control flow</h3>
    @for (msg of messages(); track msg.id) {
      <div>{{ msg.id }}. {{ msg.text | truncate:30 }}</div>
    } @empty {
      <p>Empty list</p>
    }

    <h3>7. Async Pipe</h3>
    <p>Delayed: {{ delayedValue$ | async }}</p>

    <h3>8. Template Reference</h3>
    <input #nameInput placeholder="Name">
    <button (click)="greet(nameInput.value)">Greet</button>
  \`,
})
export class AppComponent {
  userName = signal('Angular Dev');
  messages = signal<{id: number; text: string}[]>([]);
  isDisabled = signal(false);
  searchTerm = '';
  delayedValue$ = of('Loaded!').pipe(delay(2000));
  private nextId = 1;

  addMessage() { this.messages.update(m => [...m, { id: this.nextId++, text: 'Message ' + (this.nextId-1) }]); }
  clearMessages() { this.messages.set([]); }
  greet(name: string) { alert('Hello, ' + name); }
}
\`\`\`

#### Step 4 — Error Handling: Safe Navigation + Attribute vs Property
\`\`\`html
<!-- Safe navigation — avoids null reference -->
<p>{{ user?.address?.city }}</p>

<!-- Attribute binding vs property binding -->
<!-- WRONG: colspan is an attribute, not a DOM property -->
<!-- CORRECT: -->
<td [attr.colspan]="3">Cell</td>

<!-- Class and style binding -->
<div [class.active]="isActive" [style.color]="textColor">...</div>
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
it('truncate pipe limits text length', () => {
  const pipe = new TruncatePipe();
  const result = pipe.transform('Hello world this is long text', 10);
  expect(result).toBe('Hello worl...');
});

it('renders @empty when messages empty', () => {
  const fixture = TestBed.createComponent(AppComponent);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Empty list');
});
\`\`\`

**Expected Output:**
\`\`\`
All 8 sections rendered correctly
Add button adds to @for list
Clear shows @empty block
Truncate pipe limits text
Delayed value appears after 2s
\`\`\`

**Stretch Challenges:**
- [ ] Add a custom structural directive *appPermission="'admin'"
- [ ] Add a @defer block for a heavy component
- [ ] Replace all *ngIf/*ngFor with new @if/@for syntax`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Four types of Angular template bindings.
**Q2:** Difference between property binding [disabled] and attribute binding [attr.disabled]?
**Q3:** Write a @for loop with a track expression. From memory.

### Day 3 — Comprehension
**Q4:** Why should you avoid calling functions in template expressions?
**Q5:** Show *ngIf and the equivalent @if syntax.
**Q6:** Refactor to async pipe:
\`\`\`typescript
users: User[] = [];
ngOnInit() { this.userService.getUsers().subscribe(u => this.users = u); }
\`\`\`

### Day 7 — Application
**Q7:** Build a template with @switch showing different views per user role.
**Q8:** A PR uses ngFor without trackBy — explain the performance impact on 10k rows.
**Q9:** When would you use ng-template vs ng-container?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain the difference between one-way and two-way data binding — when to use each."
**Q11:** Draw: how *ngFor desugars into an ng-template.
**Q12:** ★ System design: "Design an Angular dashboard with 50 dynamic widgets — CD strategy, lazy loading, virtual scrolling."`
  },

  // ── 4. lifecycle-hooks ───────────────────────────────────────────────────
  'lifecycle-hooks': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Lifecycle Hooks Like I'm 10 Years Old
> Angular components go through a life: created → rendered → updated → destroyed. At each stage Angular calls specific methods on your class if you implement them — these are lifecycle hooks. The constructor is like hiring the chef (DI injected, but kitchen not set up yet). ngOnInit is the kitchen opening — all @Inputs are set, ready to call APIs. ngOnChanges fires every time a parent passes new @Input values. ngOnDestroy is closing time — clean up subscriptions, cancel requests, release resources. The non-obvious trap: calling APIs in the constructor is WRONG because @Inputs are undefined there — the component's @Inputs are only set after the first ngOnChanges/ngOnInit.

---

### 5 Deep Conceptual Questions

**Q1: What is the full lifecycle hook execution order?**
> **A:** (1) constructor — DI runs. (2) ngOnChanges — first time (if @Inputs exist). (3) ngOnInit — once, after first ngOnChanges. (4) ngDoCheck — every change detection cycle. (5) ngAfterContentInit — once, after ng-content projected. (6) ngAfterContentChecked — after every check of projected content. (7) ngAfterViewInit — once, after component view and child views initialised. (8) ngAfterViewChecked — after every check of the view. (9) ngOnDestroy — before Angular destroys the component.

**Q2: Mental model for ngOnInit vs ngAfterViewInit?**
> **A:** ngOnInit fires when the component's CLASS is ready — inputs are set, services injected, but the DOM hasn't been rendered yet. You cannot safely query child elements (@ViewChild) here — they are undefined. ngAfterViewInit fires when the component's DOM is fully rendered — @ViewChild references are guaranteed to be set. Rule: data setup in ngOnInit, DOM manipulation in ngAfterViewInit. With signals, much of this overhead disappears.

**Q3: Most dangerous misconception about lifecycle hooks?**
> **A:** You only need to unsubscribe manually:
> \`\`\`typescript
> // WRONG: Memory leak — subscription lives forever after component destroyed
> export class DataComponent implements OnInit {
>   ngOnInit() {
>     this.dataService.getLiveData().subscribe(data => this.data = data);
>   }
> }
>
> // CORRECT: Use takeUntilDestroyed (Angular 16+)
> import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
> private destroyRef = inject(DestroyRef);
> ngOnInit() {
>   this.dataService.getLiveData()
>     .pipe(takeUntilDestroyed(this.destroyRef))
>     .subscribe(data => this.data = data);
> }
> \`\`\`

**Q4: How does ngOnChanges interact with OnPush change detection?**
> **A:** ngOnChanges fires when an @Input's REFERENCE changes — exactly what OnPush checks. So OnPush components with ngOnChanges behave consistently: when a new reference arrives via @Input, Angular runs ngOnChanges AND re-renders. Mutating the input object without changing the reference means NEITHER ngOnChanges fires NOR does OnPush re-render — both behave consistently. Use ngDoCheck for custom "did anything actually change" logic if you need to detect mutations.

**Q5: FAANG-grade definition of Angular lifecycle hooks.**
> **A:** "Angular lifecycle hooks are TypeScript interface methods called by the Angular runtime at specific phases of a component's existence — from class instantiation (constructor), input initialisation (ngOnChanges, ngOnInit), recurring change detection (ngDoCheck, ngAfterContentChecked, ngAfterViewChecked), post-render DOM access (ngAfterViewInit, ngAfterContentInit), to destruction (ngOnDestroy) — with ngOnDestroy the critical cleanup point for Observable subscriptions, increasingly superseded by DestroyRef and takeUntilDestroyed for declarative cleanup."`,

    build: `## BUILD

### 🏗️ Mini Project: Lifecycle Logger — See Every Hook In Order + Proper Cleanup

**What you will build:** A parent-child component pair where every lifecycle hook logs to the screen — showing the exact execution order — plus a long-lived Observable demonstrating proper ngOnDestroy cleanup with takeUntilDestroyed.
**Why this project:** Makes lifecycle ordering observable and builds the cleanup pattern as muscle memory.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new lifecycle-demo --standalone --routing false
ng generate component lifecycle-child --standalone
ng generate service ticker
\`\`\`

#### Step 2 — Ticker Service
\`\`\`typescript
// ticker.service.ts
import { Injectable } from '@angular/core';
import { interval, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TickerService {
  tick$ = interval(1000).pipe(map(n => 'Tick #' + n + ' at ' + new Date().toLocaleTimeString()));
}
\`\`\`

#### Step 3 — Child With All Hooks
\`\`\`typescript
// lifecycle-child.component.ts
import {
  Component, Input, OnChanges, OnInit, AfterContentInit,
  AfterViewInit, OnDestroy, SimpleChanges, inject, DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgFor } from '@angular/common';
import { TickerService } from '../ticker.service';

@Component({
  standalone: true,
  selector: 'app-lifecycle-child',
  imports: [NgFor],
  template: \`
    <h3>Child — Input: {{ title }}</h3>
    <p>Last tick: {{ lastTick }}</p>
    <ul><li *ngFor="let log of hookLog">{{ log }}</li></ul>
  \`,
})
export class LifecycleChildComponent implements OnChanges, OnInit, AfterContentInit, AfterViewInit, OnDestroy {
  @Input() title = '';
  hookLog: string[] = [];
  lastTick = 'waiting...';

  private destroyRef = inject(DestroyRef);
  private ticker = inject(TickerService);

  constructor() { this.log('constructor'); }

  ngOnChanges(changes: SimpleChanges) {
    this.log('ngOnChanges: title = "' + changes['title']?.currentValue + '"');
  }
  ngOnInit() {
    this.log('ngOnInit');
    this.ticker.tick$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(tick => this.lastTick = tick);
  }
  ngAfterContentInit() { this.log('ngAfterContentInit'); }
  ngAfterViewInit()    { this.log('ngAfterViewInit — DOM ready'); }
  ngOnDestroy()        { this.log('ngOnDestroy — cleanup done'); }

  private log(msg: string) {
    this.hookLog = [...this.hookLog, '[' + new Date().toISOString().slice(11,19) + '] ' + msg];
  }
}
\`\`\`

#### Step 4 — Parent Component
\`\`\`typescript
// app.component.ts
@Component({
  standalone: true, imports: [LifecycleChildComponent],
  template: \`
    <button (click)="changeTitle()">Change Title</button>
    <button (click)="toggleChild()">Toggle Child</button>
    @if (showChild()) { <app-lifecycle-child [title]="title()" /> }
  \`,
})
export class AppComponent {
  showChild = signal(true);
  title = signal('Initial Title');
  private n = 0;
  changeTitle() { this.title.set('Title ' + ++this.n); }
  toggleChild() { this.showChild.update(v => !v); }
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
it('logs ngOnInit', () => {
  const fixture = TestBed.createComponent(LifecycleChildComponent);
  fixture.detectChanges();
  expect(fixture.componentInstance.hookLog.some(l => l.includes('ngOnInit'))).toBe(true);
});
it('logs ngOnChanges when title changes', () => {
  const fixture = TestBed.createComponent(LifecycleChildComponent);
  fixture.componentRef.setInput('title', 'A');
  fixture.detectChanges();
  fixture.componentRef.setInput('title', 'B');
  fixture.detectChanges();
  const changes = fixture.componentInstance.hookLog.filter(l => l.includes('ngOnChanges'));
  expect(changes.length).toBeGreaterThanOrEqual(2);
});
\`\`\`

**Expected Output:**
\`\`\`
[constructor] -> [ngOnChanges] -> [ngOnInit] -> [ngAfterContentInit] -> [ngAfterViewInit]
Ticks update every second
Change Title -> new ngOnChanges logged
Toggle Child (off) -> [ngOnDestroy] logged, ticker stops
\`\`\`

**Stretch Challenges:**
- [ ] Add ngDoCheck logging and measure how often it fires per second
- [ ] Rewrite using DestroyRef.onDestroy callback instead of ngOnDestroy interface
- [ ] Add @defer block and observe when lifecycle hooks fire for deferred components`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Order of the 8 lifecycle hooks.
**Q2:** Why is calling APIs in the constructor wrong?
**Q3:** Write the correct pattern for cleaning up an RxJS subscription. From memory.

### Day 3 — Comprehension
**Q4:** Difference between ngOnInit and ngAfterViewInit?
**Q5:** A junior forgets ngOnDestroy and subscribes to a WebSocket — diagnose the leak.
**Q6:** Refactor to takeUntilDestroyed:
\`\`\`typescript
private sub: Subscription;
ngOnInit() { this.sub = timer(0, 1000).subscribe(() => this.tick()); }
ngOnDestroy() { this.sub.unsubscribe(); }
\`\`\`

### Day 7 — Application
**Q7:** When would you use ngDoCheck instead of ngOnChanges?
**Q8:** A PR reads @ViewChild in ngOnInit and gets undefined — diagnose.
**Q9:** Does ngOnDestroy fire for components inside a destroyed parent?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every Angular lifecycle hook with one production use case each."
**Q11:** Draw: lifecycle hook execution order for parent + child with ng-content projection.
**Q12:** ★ System design: "Architect resource management for an Angular app with 200+ components each holding WebSocket connections."`
  },

  // ── 5. change-detection ──────────────────────────────────────────────────
  'change-detection': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Change Detection Like I'm 10 Years Old
> Change detection is how Angular knows when to update the screen. When something changes (click, timer, HTTP response), Angular runs a change detection cycle — it walks the ENTIRE component tree from root to leaves, checks if any template bindings have new values, and updates the DOM for those that changed. Zone.js patches every async API (setTimeout, Promises, events, HTTP) to notify Angular after they complete. The non-obvious depth: with signals (Angular 16+), Angular tracks exactly which components read which signals — it only re-renders components that read a changed signal, bypassing the full tree walk. This is like the difference between checking every house on the street for a lost cat (Default) vs having GPS on the cat (signals).

---

### 5 Deep Conceptual Questions

**Q1: What triggers change detection in the Default strategy?**
> **A:** Zone.js patches all browser async APIs. When any async operation completes — a setTimeout callback, a fetch() resolving, a click event handler — Zone.js notifies Angular, which runs a full change-detection cycle from the root component downward. Every component in the tree is checked for binding changes. This is reliable but expensive for large trees (1000+ components) because Angular must check every binding in every component even if they couldn't possibly have changed.

**Q2: Mental model for OnPush optimization?**
> **A:** With ChangeDetectionStrategy.OnPush, Angular only re-checks a component when: (1) An @Input reference changes, (2) An event inside the component fires, (3) An Observable linked via async pipe emits, (4) You manually call markForCheck() or detectChanges(). Angular marks the component as "clean" after checking and skips it in future cycles. The component's subtree is also skipped — massive performance gains for large stable subtrees.

**Q3: Most dangerous misconception about change detection?**
> **A:** OnPush detects all changes automatically:
> \`\`\`typescript
> @Component({ changeDetection: ChangeDetectionStrategy.OnPush })
> export class SearchComponent {
>   results: string[] = [];
>   search() {
>     this.results.push('new result');
>     // Angular does NOT re-render — results reference unchanged!
>   }
> }
>
> // CORRECT: create new reference
> search() {
>   this.results = [...this.results, 'new result'];
>   // Or use signals:
>   // this.results.update(r => [...r, 'new result']);
> }
> \`\`\`

**Q4: How do signals replace Zone.js for change detection?**
> **A:** With signals, Angular tracks which components READ which signals. When a signal's value changes, Angular marks ONLY the components that read it as dirty — no full tree walk. With provideExperimentalZonelessChangeDetection() (Angular 18+), you can remove Zone.js entirely — startup is faster (no 15KB Zone.js), async operations are lighter, and change detection is surgical per component, not per tree.

**Q5: FAANG-grade definition of Angular change detection.**
> **A:** "Angular change detection synchronises component state with the DOM — defaulting to Zone.js-triggered full-tree traversal (checking every binding after any async operation) with ChangeDetectionStrategy.OnPush enabling subtree skipping (only checking components whose @Input references changed or events fired) — and signals-based reactive change detection (Angular 16+) achieving surgical per-component updates based on signal dependency tracking, enabling zoneless applications with near-zero change detection overhead."`,

    build: `## BUILD

### 🏗️ Mini Project: Change Detection Profiler — Default vs OnPush vs Signals

**What you will build:** Three implementations of the same counter-grid (20 cells) using Default, OnPush, and Signals strategies — with ngDoCheck instrumentation showing how many times each strategy runs per timer tick.
**Why this project:** Makes the performance difference empirically measurable — removes doubt about when to use each strategy.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new cd-profiler --standalone --routing false
ng generate component cell-default --standalone
ng generate component cell-on-push --standalone
ng generate component cell-signal --standalone
\`\`\`

#### Step 2 — Default Cell (checked every cycle)
\`\`\`typescript
@Component({
  standalone: true, selector: 'app-cell-default',
  template: \`<div (click)="increment()">{{ count }} (checks: {{ checkCount }})</div>\`,
})
export class CellDefaultComponent {
  @Input() cellId = 0;
  count = 0; checkCount = 0;
  ngDoCheck() { this.checkCount++; }
  increment() { this.count++; }
}
\`\`\`

#### Step 3 — OnPush Cell (skipped unless @Input changes or event fires)
\`\`\`typescript
@Component({
  standalone: true, selector: 'app-cell-on-push',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<div (click)="increment()">{{ count }} (checks: {{ checkCount }})</div>\`,
})
export class CellOnPushComponent {
  @Input() cellId = 0;
  count = 0; checkCount = 0;
  ngDoCheck() { this.checkCount++; }
  increment() { this.count++; }
}
\`\`\`

#### Step 4 — Signal Cell (reactive, minimal re-renders)
\`\`\`typescript
@Component({
  standalone: true, selector: 'app-cell-signal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<div (click)="increment()">{{ count() }} (updates: {{ updateCount() }})</div>\`,
})
export class CellSignalComponent {
  @Input() cellId = 0;
  count = signal(0); updateCount = signal(0);
  increment() { this.count.update(n => n + 1); this.updateCount.update(n => n + 1); }
}
\`\`\`

#### Step 5 — App With Timer
\`\`\`typescript
@Component({
  standalone: true, imports: [CellDefaultComponent, CellOnPushComponent, CellSignalComponent, NgFor],
  template: \`
    <h2>Timer: {{ time }}</h2>
    <h3>Default (all 20 checked every tick)</h3>
    <app-cell-default *ngFor="let id of ids" [cellId]="id"/>
    <h3>OnPush (only event cell checked)</h3>
    <app-cell-on-push *ngFor="let id of ids" [cellId]="id"/>
    <h3>Signals (only updated cell re-renders)</h3>
    <app-cell-signal *ngFor="let id of ids" [cellId]="id"/>
  \`,
})
export class AppComponent implements OnInit {
  ids = Array.from({ length: 20 }, (_, i) => i);
  time = '';
  ngOnInit() { setInterval(() => this.time = new Date().toLocaleTimeString(), 1000); }
}
\`\`\`

**Expected Output:**
\`\`\`
After 5 seconds:
  Default cell checkCount: 5+ (checked every second even without clicking)
  OnPush cell checkCount: 1-2 (only checked when clicked)
  Signal cells: only the clicked cell updates its view
\`\`\`

**Stretch Challenges:**
- [ ] Use Angular DevTools profiler to visualise the CD tree
- [ ] Enable zoneless CD with provideExperimentalZonelessChangeDetection()
- [ ] Benchmark 1000 cells — Default vs OnPush vs Signals render time`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What triggers a change detection cycle in the Default strategy?
**Q2:** When does OnPush skip a component?
**Q3:** Write a component with OnPush strategy. From memory.

### Day 3 — Comprehension
**Q4:** Why does mutating an array in an OnPush component not update the view?
**Q5:** An OnPush component does not update after an HTTP call — diagnose.
**Q6:** When would you use ChangeDetectorRef.markForCheck() vs detectChanges()?

### Day 7 — Application
**Q7:** Build a grid of 500 cells and measure render time Default vs OnPush.
**Q8:** A PR has a setInterval in a root component — how many components get checked per tick?
**Q9:** What does Zone.js actually patch and what would break without it?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Zone.js-based vs signal-based change detection in Angular — tradeoffs."
**Q11:** Draw: Angular change detection tree traversal with OnPush vs signals.
**Q12:** ★ System design: "Migrate a 200-component Angular app from Zone.js to zoneless signals — strategy, risks, rollout plan."`
  },

  // ── 6. services-and-di ───────────────────────────────────────────────────
  'services-and-di': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Services and DI Like I'm 10 Years Old
> A service is just a TypeScript class decorated with @Injectable — it holds business logic or shared state that multiple components need (UserService, AuthService, CartService). Dependency injection (DI) is how Angular automatically creates and provides services to components that need them — you declare what you need in the constructor or via inject(), Angular figures out how to create it. The key non-obvious insight: Angular's DI is HIERARCHICAL. There is a root injector (app-level singleton), module injectors (scoped singletons), and component injectors (instance per component). If you provide a service in a component's providers array, each component instance gets its OWN service instance — not a singleton. This is why "share state between components" using a service only works if both components share the same injector level.

---

### 5 Deep Conceptual Questions

**Q1: What is the injector hierarchy and why does it matter?**
> **A:** Angular builds a tree of injectors mirroring the component tree. When a component requests a dependency, Angular walks UP the injector tree to find the first provider. providedIn: 'root' registers the service in the ROOT injector — one instance for the entire app. Providing in a component: { providers: [MyService] } creates a new injector for that component's subtree. This enables: per-route scoped state (provide in a route's providers), component-level isolation (provide in a feature component), and lazy module separation (provide in a lazy-loaded route for a separate instance).

**Q2: Mental model for inject() vs constructor injection?**
> **A:** inject() is the modern function-based injection API available in injection context (constructor, field initialiser, factory functions). It replaces constructor parameter injection syntactically — both resolve through the same injector hierarchy. inject() is preferred for: functional guards, resolvers, interceptors (where there is no class), and for reducing constructor boilerplate. Constructor injection is still valid and required for libraries that inspect constructor metadata for DI.

**Q3: Most dangerous misconception about services?**
> **A:** providedIn: 'root' services are always singletons:
> \`\`\`typescript
> // WRONG assumption: this service is always a singleton
> @Injectable({ providedIn: 'root' })
> export class CartService { items: CartItem[] = []; }
>
> // If a component ALSO provides it:
> @Component({ providers: [CartService] })
> export class CheckoutComponent { /* gets its OWN CartService instance */ }
>
> // Now CheckoutComponent's CartService is separate from the root one
> // State changes in root CartService are invisible to CheckoutComponent
> \`\`\`

**Q4: How does Angular handle circular dependencies in DI?**
> **A:** Angular detects circular dependencies at bootstrap and throws a CircularDependencyError. Example: ServiceA injects ServiceB which injects ServiceA. Fix: use forwardRef(() => ServiceA) to break the cycle, or restructure to extract the shared logic into a third service that neither depends on the other. In practice, circular service dependencies indicate an architectural problem — the services are too tightly coupled and should be refactored.

**Q5: FAANG-grade definition of Angular DI.**
> **A:** "Angular's Dependency Injection is a hierarchical injector system where each component, directive, and module can register providers — Angular resolves dependencies by walking up the injector tree from the requesting component to the root, instantiating services lazily and caching them per injector scope — enabling singleton app-level services (providedIn: 'root'), scoped per-feature services (provided in lazy routes), and per-component instances (provided in component providers array) — with tree-shaking removing unused services from the bundle when provided in root."`,

    build: `## BUILD

### 🏗️ Mini Project: Scoped Shopping Cart Service — Root vs Component Provider Comparison

**What you will build:** A shopping cart app where one cart service is root-level (shared across app) and another is component-level (each cart instance is independent) — demonstrating DI scope visually.
**Why this project:** Forces you to observe the practical consequence of DI scope — the most common source of state bugs in Angular.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new di-demo --standalone --routing false
ng generate service cart
ng generate component cart-widget --standalone
\`\`\`

#### Step 2 — Cart Service
\`\`\`typescript
// cart.service.ts
import { Injectable, signal, computed } from '@angular/core';

export interface CartItem { id: string; name: string; price: number; qty: number; }

@Injectable()   // No providedIn — must be explicitly provided
export class CartService {
  private _items = signal<CartItem[]>([]);
  items = this._items.asReadonly();
  total = computed(() => this._items().reduce((s, i) => s + i.price * i.qty, 0));

  addItem(item: Omit<CartItem, 'qty'>) {
    this._items.update(items => {
      const existing = items.find(i => i.id === item.id);
      if (existing) return items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...items, { ...item, qty: 1 }];
    });
  }
  removeItem(id: string) { this._items.update(items => items.filter(i => i.id !== id)); }
  clear() { this._items.set([]); }
}
\`\`\`

#### Step 3 — Cart Widget Component
\`\`\`typescript
// cart-widget.component.ts
import { Component, inject, Input } from '@angular/core';
import { NgFor, CurrencyPipe } from '@angular/common';
import { CartService } from '../cart.service';

@Component({
  standalone: true,
  selector: 'app-cart-widget',
  imports: [NgFor, CurrencyPipe],
  providers: [CartService],   // NEW instance per component!
  template: \`
    <div style="border: 1px solid #ccc; padding: 8px; margin: 8px">
      <strong>{{ label }} Cart</strong>
      <button (click)="addSample()">+ Add Item</button>
      <p>Items: {{ cartService.items().length }} | Total: {{ cartService.total() | currency }}</p>
      <ul>
        <li *ngFor="let item of cartService.items()">
          {{ item.name }} x{{ item.qty }}
          <button (click)="cartService.removeItem(item.id)">X</button>
        </li>
      </ul>
    </div>
  \`,
})
export class CartWidgetComponent {
  @Input() label = 'Widget';
  cartService = inject(CartService);
  private n = 0;
  addSample() {
    const id = 'item-' + (this.n % 3);
    this.cartService.addItem({ id, name: 'Product ' + (this.n++ % 3 + 1), price: 9.99 + this.n });
  }
}
\`\`\`

#### Step 4 — Root vs Component Scope Demo
\`\`\`typescript
// app.component.ts — root CartService is shared, widget CartService is per-instance
@Component({
  standalone: true,
  imports: [CartWidgetComponent, NgFor, CurrencyPipe],
  providers: [CartService],   // ROOT scope for the app-level cart
  template: \`
    <h1>DI Scope Demo</h1>
    <h2>Root-level cart (shared across the app)</h2>
    <button (click)="rootCart.addItem({ id: 'A', name: 'Shared Item', price: 5 })">Add to Root Cart</button>
    <p>Root cart items: {{ rootCart.items().length }}</p>

    <h2>Component-level carts (each widget has its OWN cart)</h2>
    <p>Adding to Widget A does NOT affect Widget B</p>
    <app-cart-widget label="Widget A"/>
    <app-cart-widget label="Widget B"/>
  \`,
})
export class AppComponent {
  rootCart = inject(CartService);
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('CartService', () => {
  let service: CartService;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [CartService] }); service = TestBed.inject(CartService); });

  it('adds items and merges duplicates', () => {
    service.addItem({ id: '1', name: 'A', price: 10 });
    service.addItem({ id: '1', name: 'A', price: 10 });
    expect(service.items().length).toBe(1);
    expect(service.items()[0].qty).toBe(2);
  });
  it('computes total correctly', () => {
    service.addItem({ id: '1', name: 'A', price: 10 });
    service.addItem({ id: '2', name: 'B', price: 5 });
    expect(service.total()).toBe(15);
  });
  it('removes item by id', () => {
    service.addItem({ id: '1', name: 'A', price: 10 });
    service.removeItem('1');
    expect(service.items().length).toBe(0);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Root cart: adding items affects the shared root cart
Widget A cart: independent from Widget B
Widget B cart: independent from Widget A
Tests: 3 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add InjectionToken for a cart config (max items, currency)
- [ ] Build a CartFacade that uses multiple services internally
- [ ] Add an effect() to save cart to localStorage on every change`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does providedIn: 'root' do?
**Q2:** What is the difference between constructor injection and inject()?
**Q3:** Write a service with one method and inject it into a component. From memory.

### Day 3 — Comprehension
**Q4:** If you provide a service in a component's providers array, how many instances exist?
**Q5:** A junior provides UserService in two places and state changes don't sync — diagnose.
**Q6:** When would you provide a service at route level vs root level?

### Day 7 — Application
**Q7:** Build a NotificationService with a stack of messages — root-level singleton.
**Q8:** A PR injects a service in a component that is destroyed and recreated — does state reset?
**Q9:** How does tree-shaking interact with providedIn: 'root'?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Angular's hierarchical DI system — how does Angular resolve a service dependency?"
**Q11:** Draw: injector tree for an app with root + lazy module + component-level providers.
**Q12:** ★ System design: "Design a multi-tenant Angular app where each tenant has isolated state — DI strategy."`
  },

  // ── 7. directives-built-in ───────────────────────────────────────────────
  'directives-built-in': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Built-in Directives Like I'm 10 Years Old
> Directives are Angular's way of adding behaviour to HTML elements. STRUCTURAL directives change the DOM structure (add/remove elements): *ngIf, *ngFor, *ngSwitch. ATTRIBUTE directives change the appearance or behaviour of existing elements: NgClass, NgStyle, NgModel. The modern alternatives are @if, @for, @switch control flow blocks (Angular 17+) which are more type-safe and performant. The non-obvious depth: *ngFor without a trackBy function causes Angular to destroy and recreate EVERY DOM node in the list when the array changes — even if only one item changed. With trackBy (or @for track), Angular reuses existing DOM nodes and only updates the changed ones — critical for performance with large lists.

---

### 5 Deep Conceptual Questions

**Q1: What is the performance cost of *ngFor without trackBy?**
> **A:** Without trackBy, Angular compares list items by object reference (===). When the data arrives from an API, it creates NEW JavaScript objects — even if the data is the same. Angular sees all references as different, destroys all existing DOM nodes, and recreates them. For a list of 100 items, this is 100 DOM node destructions + 100 creations + 100 change detection runs. With trackBy, Angular identifies items by a unique field (like id) and reuses DOM nodes for items that haven't changed. The new @for syntax makes track mandatory, preventing this pitfall.

**Q2: Mental model for NgClass and NgStyle?**
> **A:** NgClass is an object binding where keys are CSS class names and values are booleans — truthy adds the class, falsy removes it. [class.active]="isActive" is the simple shorthand for single classes. NgStyle is an object of CSS property-value pairs applied inline. [style.color]="textColor" is the shorthand for single styles. Prefer [class.X] and [style.X] shorthand for single bindings — they're more readable; use NgClass/NgStyle when binding multiple classes/styles from an expression.

**Q3: Most dangerous misconception about built-in directives?**
> **A:** *ngIf hides the element like CSS display:none:
> \`\`\`html
> <!-- WRONG mental model: *ngIf hides elements -->
> <!-- CORRECT: *ngIf REMOVES the element from the DOM entirely -->
>
> <!-- This component is DESTROYED when showPanel is false -->
> <!-- All state, subscriptions, lifecycle hooks — gone -->
> <app-expensive-panel *ngIf="showPanel"/>
>
> <!-- To preserve component state while hiding visually, use CSS: -->
> <app-expensive-panel [style.display]="showPanel ? 'block' : 'none'"/>
>
> <!-- Or use @if vs [hidden] consciously based on whether you want destruction -->
> \`\`\`

**Q4: How does ngSwitch work and when do you use it over ngIf chains?**
> **A:** ngSwitch evaluates one expression and matches it against ngSwitchCase values — semantically equivalent to a JavaScript switch statement in the template. It's more efficient than multiple *ngIf chains over the same expression because it avoids re-evaluating the expression multiple times. Use ngSwitch (or the new @switch) when you have 3+ mutually exclusive conditions based on the same value — user role rendering, step wizard, status-based views.

**Q5: FAANG-grade definition of Angular built-in directives.**
> **A:** "Angular built-in directives are compiler-understood HTML extensions — structural directives (*ngIf, *ngFor, *ngSwitch / @if, @for, @switch) that add or remove DOM subtrees based on expressions, and attribute directives (NgClass, NgStyle, NgModel) that modify element behaviour or appearance — with the new @-syntax control flow (Angular 17+) compiling to more efficient code, enabling block-level type narrowing, and making track mandatory in @for to prevent the trackBy omission performance pitfall."`,

    build: `## BUILD

### 🏗️ Mini Project: Directive Showcase — Performance Cost of Missing trackBy Measured

**What you will build:** A side-by-side comparison of a list WITHOUT and WITH trackBy, using console.time and DOM mutation observer to measure the render cost difference — plus all built-in directives demonstrated.
**Why this project:** Makes the trackBy performance difference OBSERVABLE with real numbers rather than theory.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new directive-demo --standalone --routing false
ng generate component directive-showcase --standalone
\`\`\`

#### Step 2 — Directive Showcase
\`\`\`typescript
// directive-showcase.component.ts
import { Component, signal, computed } from '@angular/core';
import { NgClass, NgStyle, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product { id: number; name: string; price: number; category: string; inStock: boolean; }

@Component({
  standalone: true,
  selector: 'app-directive-showcase',
  imports: [NgClass, NgStyle, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule],
  template: \`
    <h2>*ngIf / @if</h2>
    <button (click)="showDetails.set(!showDetails())">Toggle Details</button>
    <div *ngIf="showDetails()">
      <p>Details visible — component fully mounted</p>
    </div>

    <h2>NgClass + NgStyle</h2>
    <div [ngClass]="{ 'highlight': isHighlighted(), 'error': hasError() }"
         [ngStyle]="{ 'font-size': fontSize() + 'px', 'color': textColor() }">
      Dynamic styling demo
    </div>
    <button (click)="isHighlighted.set(!isHighlighted())">Toggle Highlight</button>

    <h2>ngSwitch / @switch</h2>
    <select [(ngModel)]="userRole">
      <option *ngFor="let role of roles" [value]="role">{{ role }}</option>
    </select>
    <div [ngSwitch]="userRole">
      <p *ngSwitchCase="'admin'">Admin Panel access granted</p>
      <p *ngSwitchCase="'editor'">Editor tools available</p>
      <p *ngSwitchCase="'viewer'">Read-only mode</p>
      <p *ngSwitchDefault>Unknown role</p>
    </div>

    <h2>*ngFor WITHOUT trackBy (slow)</h2>
    <button (click)="refreshProducts()">Refresh (destroys ALL DOM nodes)</button>
    <li *ngFor="let p of products()">{{ p.name }} - {{ p.price | currency }}</li>

    <h2>@for WITH track (fast)</h2>
    <button (click)="refreshProducts()">Refresh (reuses DOM nodes)</button>
    @for (p of products(); track p.id) {
      <li [class.out-of-stock]="!p.inStock">{{ p.name }}</li>
    }
  \`,
})
export class DirectiveShowcaseComponent {
  showDetails = signal(true);
  isHighlighted = signal(false);
  hasError = signal(false);
  fontSize = signal(14);
  textColor = signal('#333');
  userRole = 'admin';
  roles = ['admin', 'editor', 'viewer'];

  products = signal<Product[]>(this.generateProducts());

  refreshProducts() {
    console.time('refresh');
    this.products.set(this.generateProducts());
    console.timeEnd('refresh');
  }

  private generateProducts(): Product[] {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1, name: 'Product ' + (i + 1), price: 9.99 + i,
      category: ['Electronics', 'Books', 'Clothing'][i % 3],
      inStock: i % 4 !== 0,
    }));
  }
}
\`\`\`

#### Step 3 — TrackBy Performance Test
\`\`\`typescript
// Measure DOM mutations with MutationObserver
const list = document.querySelector('#no-track-list');
let mutations = 0;
new MutationObserver(() => mutations++).observe(list, { childList: true, subtree: true });

// Click refresh — compare mutations count with vs without track
\`\`\`

#### Step 4 — Error Handling: NgIf vs [hidden]
\`\`\`html
<!-- Use *ngIf when you want component DESTRUCTION on hide -->
<app-complex-form *ngIf="showForm"/>   <!-- form state lost when hidden -->

<!-- Use [hidden] when you want to PRESERVE component state -->
<app-complex-form [hidden]="!showForm"/>   <!-- form state preserved -->

<!-- Use @defer when component loads lazily only when first shown -->
@defer (when isVisible) {
  <app-heavy-chart/>   <!-- loaded and rendered only when isVisible becomes true -->
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
it('shows details when showDetails is true', () => {
  const fixture = TestBed.createComponent(DirectiveShowcaseComponent);
  fixture.componentInstance.showDetails.set(true);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Details visible');
});

it('hides details when showDetails is false', () => {
  const fixture = TestBed.createComponent(DirectiveShowcaseComponent);
  fixture.componentInstance.showDetails.set(false);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).not.toContain('Details visible');
});
\`\`\`

**Expected Output:**
\`\`\`
Toggle Details -> component mounted/destroyed
Refresh (no-track) -> 50 DOM destructions + 50 creations
Refresh (@for track) -> 0 DOM destructions (nodes reused)
\`\`\`

**Stretch Challenges:**
- [ ] Replace all *ngFor with @for and measure build output size difference
- [ ] Add virtual scrolling (CDK) to the product list for 10k items
- [ ] Build a custom *appTrackByField directive that auto-generates trackBy`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between structural and attribute directives?
**Q2:** What does *ngIf do to the DOM? (hint: not just hide)
**Q3:** Write ngFor with a trackBy function. From memory.

### Day 3 — Comprehension
**Q4:** Why is omitting trackBy in *ngFor a performance problem?
**Q5:** Difference between [class.active]="x" and [ngClass]="{'active': x}"?
**Q6:** Refactor to @if/@for syntax:
\`\`\`html
<div *ngIf="user"><li *ngFor="let item of items">{{ item }}</li></div>
\`\`\`

### Day 7 — Application
**Q7:** When would you use [hidden] instead of *ngIf?
**Q8:** A PR has *ngSwitch with 8 cases — any better alternatives?
**Q9:** What is the performance difference between *ngFor and virtual scrolling?

### Day 14 — Synthesis
**Q10:** ★ Interview: "What are structural directives and how does the asterisk (*) syntax work internally?"
**Q11:** Draw: how *ngFor desugars into ng-template and ViewContainerRef.
**Q12:** ★ System design: "Render a virtualized tree with 100k nodes in Angular — directives, CDK, performance."`
  },

  // ── 8. custom-directives ─────────────────────────────────────────────────
  'custom-directives': {
    feynman: `## FEYNMAN CHECK

### Explain Custom Angular Directives Like I'm 10 Years Old
> Custom directives let you attach reusable BEHAVIOUR to any HTML element — without creating a component (which has its own template). If you want an element to turn blue when hovered, auto-focus on init, or validate input format, you write a directive. The @Directive decorator registers it; the selector declares which elements it applies to. The directive gets access to the host element via ElementRef, can modify host properties/classes/styles via HostBinding, and can listen to host events via HostListener. The non-obvious distinction: use a DIRECTIVE when you want to ADD BEHAVIOUR to existing elements; use a COMPONENT when you need a new UI building block with its own template.

---

### 5 Deep Conceptual Questions

**Q1: When should you create a directive vs a component?**
> **A:** Create a DIRECTIVE when: you want to add cross-cutting behaviour to existing elements (focus, tooltip, permissions, lazy-load, drag-drop, copy-to-clipboard), the feature doesn't require its own HTML structure, and it should work on any element type. Create a COMPONENT when: you are building a new UI element with its own template (button, card, modal, data-table), the visual structure is the primary concern. Rule of thumb: directives are ADVERBS (modify how something behaves), components are NOUNS (things in the UI).

**Q2: Mental model for HostBinding and HostListener?**
> **A:** HostBinding binds a TypeScript property to a HOST element property, attribute, or CSS class — @HostBinding('class.active') isActive = false; makes Angular add/remove the 'active' class based on isActive. HostListener registers a DOM event listener on the host element — @HostListener('click') onClick() { ... }. These are the DECLARATIVE alternative to manually calling renderer.setStyle(el) or el.addEventListener() in lifecycle hooks — more Angular-idiomatic, works with SSR, doesn't directly touch the DOM.

**Q3: Most dangerous misconception about custom directives?**
> **A:** Directly manipulating the DOM is fine in directives:
> \`\`\`typescript
> // WRONG: direct DOM manipulation breaks server-side rendering
> constructor(private el: ElementRef) {}
> ngOnInit() { this.el.nativeElement.style.color = 'red'; }
>
> // CORRECT: use Renderer2 for platform-safe DOM manipulation
> constructor(private el: ElementRef, private renderer: Renderer2) {}
> ngOnInit() { this.renderer.setStyle(this.el.nativeElement, 'color', 'red'); }
> // Renderer2 works on Node.js (SSR), Web Workers, and Native Script
> \`\`\`

**Q4: How do structural directives work internally with ViewContainerRef?**
> **A:** Structural directives control whether a DOM subtree is RENDERED by using ViewContainerRef and TemplateRef. @ViewContainerRef is the placeholder where elements can be inserted; @TemplateRef is the ng-template content. When *ngIf="true", Angular calls vcr.createEmbeddedView(templateRef) — inserting the view. When false, vcr.clear() removes it. You can build custom structural directives by injecting these two and controlling createEmbeddedView/clear yourself.

**Q5: FAANG-grade definition of Angular custom directives.**
> **A:** "An Angular custom directive is a TypeScript class decorated with @Directive that attaches reusable imperative behaviour to host elements — using ElementRef/Renderer2 for platform-safe DOM manipulation, @HostBinding for property/class/style bindings, @HostListener for event handling, @Input for configuration, and ViewContainerRef/TemplateRef for structural directives that create or destroy DOM subtrees — with the [selector] pattern enabling seamless composition on any element without template modification."`,

    build: `## BUILD

### 🏗️ Mini Project: Three Production Directives — Tooltip, Permission Guard, Auto-Focus

**What you will build:** (1) [appTooltip]="text" — shows a floating tooltip on hover using Renderer2. (2) [appPermission]="'admin'" — structural directive that conditionally renders based on user role. (3) appAutoFocus — focuses the input on ngAfterViewInit.
**Why this project:** Three different directive patterns covering attribute, structural, and ViewInit access.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new directive-lab --standalone --routing false
ng generate directive tooltip --standalone
ng generate directive permission --standalone
ng generate directive auto-focus --standalone
\`\`\`

#### Step 2 — Tooltip Directive
\`\`\`typescript
// tooltip.directive.ts
import { Directive, Input, ElementRef, Renderer2, HostListener, OnDestroy } from '@angular/core';

@Directive({ selector: '[appTooltip]', standalone: true })
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText = '';
  private tooltipEl: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onEnter() {
    this.tooltipEl = this.renderer.createElement('div');
    this.renderer.setStyle(this.tooltipEl, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipEl, 'background', '#333');
    this.renderer.setStyle(this.tooltipEl, 'color', '#fff');
    this.renderer.setStyle(this.tooltipEl, 'padding', '4px 8px');
    this.renderer.setStyle(this.tooltipEl, 'border-radius', '4px');
    this.renderer.setStyle(this.tooltipEl, 'font-size', '12px');
    this.renderer.setStyle(this.tooltipEl, 'z-index', '9999');
    this.renderer.appendChild(this.tooltipEl, this.renderer.createText(this.tooltipText));
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.renderer.setStyle(this.tooltipEl, 'top', (rect.bottom + window.scrollY + 4) + 'px');
    this.renderer.setStyle(this.tooltipEl, 'left', (rect.left + window.scrollX) + 'px');
    this.renderer.appendChild(document.body, this.tooltipEl);
  }

  @HostListener('mouseleave') onLeave() { this.removeTooltip(); }
  ngOnDestroy() { this.removeTooltip(); }

  private removeTooltip() {
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
  }
}
\`\`\`

#### Step 3 — Permission Structural Directive
\`\`\`typescript
// permission.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../auth.service';

@Directive({ selector: '[appPermission]', standalone: true })
export class PermissionDirective {
  private templateRef = inject(TemplateRef);
  private vcr = inject(ViewContainerRef);
  private auth = inject(AuthService);
  private isRendered = false;

  @Input('appPermission') set permission(required: string) {
    const hasAccess = this.auth.hasPermission(required);
    if (hasAccess && !this.isRendered) {
      this.vcr.createEmbeddedView(this.templateRef);
      this.isRendered = true;
    } else if (!hasAccess && this.isRendered) {
      this.vcr.clear();
      this.isRendered = false;
    }
  }
}

// Usage: <button *appPermission="'admin'">Delete User</button>
\`\`\`

#### Step 4 — AutoFocus Directive
\`\`\`typescript
// auto-focus.directive.ts
import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({ selector: '[appAutoFocus]', standalone: true })
export class AutoFocusDirective implements AfterViewInit {
  constructor(private el: ElementRef<HTMLElement>) {}
  ngAfterViewInit() { setTimeout(() => this.el.nativeElement.focus(), 0); }
}

// Usage: <input appAutoFocus placeholder="Focused on load">
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('TooltipDirective', () => {
  it('creates tooltip element on mouseenter', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.directive(TooltipDirective));
    el.nativeElement.dispatchEvent(new Event('mouseenter'));
    expect(document.body.querySelector('div')).toBeTruthy();
    el.nativeElement.dispatchEvent(new Event('mouseleave'));
    expect(document.body.querySelector('div')).toBeFalsy();
  });
});

describe('AutoFocusDirective', () => {
  it('focuses the input after view init', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input[appAutoFocus]');
    expect(document.activeElement).toBe(input);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Hover over button -> tooltip appears, leave -> disappears
Admin-only button visible for admin, hidden for viewer
Input auto-focused on page load
\`\`\`

**Stretch Challenges:**
- [ ] Add animation to the tooltip using Angular Animations
- [ ] Make appPermission an else block (like *ngIf with else)
- [ ] Add a [appHighlight]="color" directive that highlights text on select`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** When do you use a directive vs a component?
**Q2:** What is HostBinding and HostListener?
**Q3:** Write the smallest possible custom attribute directive. From memory.

### Day 3 — Comprehension
**Q4:** Why use Renderer2 instead of directly accessing nativeElement.style?
**Q5:** A junior uses document.getElementById in a directive — what's wrong?
**Q6:** What is the difference between an attribute directive and a structural directive?

### Day 7 — Application
**Q7:** Build a [appClickOutside] directive that emits when a click occurs outside the element.
**Q8:** A PR creates a component just to add a CSS class conditionally — refactor to directive.
**Q9:** How do you pass configuration to a structural directive (like *ngIf with else)?

### Day 14 — Synthesis
**Q10:** ★ Interview: "How do structural directives work internally? Explain ViewContainerRef and TemplateRef."
**Q11:** Draw: the internal mechanism of *ngIf false -> true transition.
**Q12:** ★ System design: "Build a cross-cutting permission system using directives for 50+ UI elements."`
  },

  // ── 9. pipes ─────────────────────────────────────────────────────────────
  'pipes': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Pipes Like I'm 10 Years Old
> Pipes are template FILTERS — they take a value, transform it, and display the result WITHOUT changing the original data. {{ price | currency:'USD' }} takes a number and displays "$42.00". The template-only nature is deliberate: pipes encourage pure transformations (no side effects, no mutation). Built-in pipes: DatePipe, CurrencyPipe, DecimalPipe, PercentPipe, UpperCasePipe, LowerCasePipe, TitleCasePipe, JsonPipe, AsyncPipe, KeyValuePipe, SlicePipe. The non-obvious performance detail: PURE pipes (the default) are memoised — Angular only re-runs them when the input reference changes. IMPURE pipes run on every change detection cycle. AsyncPipe is technically impure (it subscribes and re-runs when the Observable emits) but Angular handles it specially to avoid memory leaks.

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between pure and impure pipes?**
> **A:** PURE pipes run only when the input value or reference changes — Angular caches the result and reuses it until the input changes. They must be pure functions (same input → same output, no side effects). IMPURE pipes run on EVERY change detection cycle regardless of input change. Use impure only when the pipe's output depends on external state that changes outside the input (e.g., a translate pipe reading a locale service, a filter pipe that must re-run when the filter criteria change). Impure pipes can tank performance — Angular runs them 60+ times per second in active apps.

**Q2: Mental model for AsyncPipe?**
> **A:** AsyncPipe subscribes to an Observable or Promise and returns the latest emitted value. When the component is destroyed, AsyncPipe AUTOMATICALLY unsubscribes — no manual ngOnDestroy needed. It also calls markForCheck() to trigger change detection in OnPush components when a new value arrives. The pattern "observable$ | async as value" in a template replaces the manual subscribe-in-ngOnInit + ngOnDestroy pattern entirely, and is the recommended way to handle async data in templates.

**Q3: Most dangerous misconception about pipes?**
> **A:** Piping an array filter makes it reactive:
> \`\`\`typescript
> // WRONG: pure pipe with array input only re-runs when the array REFERENCE changes
> @Pipe({ name: 'filter', pure: true })
> export class FilterPipe implements PipeTransform {
>   transform(items: Item[], query: string): Item[] {
>     return items.filter(i => i.name.includes(query));
>   }
> }
> // Template: {{ items | filter:searchTerm }}
> // If you push to 'items' without creating a new reference,
> // the pipe does NOT re-run even though the contents changed!
>
> // CORRECT: either make the pipe impure (performance cost)
> // or replace the array reference: this.items = [...this.items, newItem];
> \`\`\`

**Q4: When should you create a custom pipe vs a component method?**
> **A:** Create a PIPE when: the transformation is PURE (same input → same output), used in MULTIPLE templates, and conceptually a view transformation (formatting, filtering, mapping). Use a COMPONENT METHOD when: the transformation requires component state, is used only in that component, or has side effects. Pipes are also unit-testable without a TestBed — just instantiate and call transform(). This makes them ideal for formatting logic shared across the app.

**Q5: FAANG-grade definition of Angular pipes.**
> **A:** "Angular pipes are pure (by default) or impure template transformation functions implementing PipeTransform — applied in templates as value | pipeName:arg1:arg2 — with pure pipes memoised per input reference (safe to use in any template, zero re-run cost when inputs don't change), impure pipes running every CD cycle (expensive, use sparingly), and AsyncPipe as the reactive bridge between Observables/Promises and template rendering — automatically subscribing, unwrapping values, triggering markForCheck() on OnPush components, and unsubscribing on destroy."`,

    build: `## BUILD

### 🏗️ Mini Project: Custom Pipe Library — TimeAgo, Highlight, SafeHtml, Currency Locale

**What you will build:** Four production-grade custom pipes: (1) timeAgo — converts timestamp to "3 hours ago", (2) highlight — wraps matching text in mark tags, (3) safeHtml — sanitizes HTML for innerHTML, (4) currencyLocale — formats currency per user locale.
**Why this project:** Forces pure/impure distinction, DomSanitizer usage, and parameterised pipes.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new pipe-library --standalone --routing false
ng generate pipe time-ago --standalone
ng generate pipe highlight --standalone
ng generate pipe safe-html --standalone
\`\`\`

#### Step 2 — TimeAgo Pipe
\`\`\`typescript
// time-ago.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeAgo', standalone: true, pure: false })  // impure — time changes
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    const date = new Date(value);
    const now = Date.now();
    const diff = Math.floor((now - date.getTime()) / 1000);

    if (diff < 60)  return diff + ' seconds ago';
    if (diff < 3600) return Math.floor(diff / 60) + ' minutes ago';
    if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
    if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
    return date.toLocaleDateString();
  }
}
\`\`\`

#### Step 3 — Highlight Pipe
\`\`\`typescript
// highlight.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'highlight', standalone: true, pure: true })
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string, query: string): SafeHtml {
    if (!query || !text) return text;
    const escaped = query.split('').map(c => /[a-zA-Z0-9]/.test(c) ? c : '\\' + c).join('');
    const re = new RegExp('(' + escaped + ')', 'gi');
    const highlighted = text.replace(re, '<mark>$1</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
\`\`\`

#### Step 4 — SafeHtml Pipe
\`\`\`typescript
// safe-html.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'safeHtml', standalone: true, pure: true })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}

// Usage: <div [innerHTML]="htmlContent | safeHtml"></div>
// Note: only use with trusted content — not for user input
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('TimeAgoPipe', () => {
  let pipe: TimeAgoPipe;
  beforeEach(() => { pipe = new TimeAgoPipe(); });

  it('returns seconds ago for recent times', () => {
    const d = new Date(Date.now() - 30000);  // 30 seconds ago
    expect(pipe.transform(d)).toBe('30 seconds ago');
  });
  it('returns minutes ago', () => {
    const d = new Date(Date.now() - 3 * 60 * 1000);  // 3 minutes ago
    expect(pipe.transform(d)).toBe('3 minutes ago');
  });
  it('returns hours ago', () => {
    const d = new Date(Date.now() - 2 * 3600 * 1000);  // 2 hours ago
    expect(pipe.transform(d)).toBe('2 hours ago');
  });
});
\`\`\`

**Expected Output:**
\`\`\`
timeAgo: "3 minutes ago", "2 hours ago", "yesterday"
highlight: matching text wrapped in <mark>
safeHtml: HTML rendered safely
Tests: 3 passed
\`\`\`

**Stretch Challenges:**
- [ ] Make TimeAgoPipe auto-update every minute using an interval
- [ ] Add a plural pipe: {{ count | plural:'item' }} -> "1 item" / "5 items"
- [ ] Benchmark pure vs impure pipe performance with 1000 items`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between pure and impure pipes?
**Q2:** What does AsyncPipe do that manual subscribe does not?
**Q3:** Write a pipe that uppercases only the first word. From memory.

### Day 3 — Comprehension
**Q4:** When should you make a pipe impure?
**Q5:** A junior writes a filter pipe as pure but items.push does not re-filter — diagnose.
**Q6:** Refactor to async pipe:
\`\`\`typescript
users$ = this.userService.getUsers();
// ngOnInit subscribes manually
\`\`\`

### Day 7 — Application
**Q7:** Build a currency pipe that reads the user's locale from a service.
**Q8:** A PR has an impure pipe on every row of a 1000-row table — explain the performance issue.
**Q9:** When would you use JsonPipe in production?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain AsyncPipe internals — how does it subscribe, trigger CD, and clean up?"
**Q11:** Draw: pure pipe memoisation decision tree in Angular's change detection.
**Q12:** ★ System design: "Design an internationalisation pipe system for an Angular app in 20 languages."`
  },

  // ── 10. routing-angular ──────────────────────────────────────────────────
  'routing-angular': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Routing Like I'm 10 Years Old
> Angular routing maps browser URLs to components — when the URL is /users, show UserListComponent; when /users/42, show UserDetailComponent. The Router replaces the browser's full-page navigation with client-side navigation — the URL changes but no new HTML is downloaded. Angular uses the HTML5 History API (pushState) by default, making URLs look normal (/users instead of #/users). Lazy loading is the critical optimisation: { path: 'admin', loadComponent: () => import('./admin') } means the admin component's JavaScript is only downloaded when the user navigates to /admin — not on initial page load. The non-obvious depth: Angular's router is a state machine — every navigation goes through Redirect → CanActivate guards → Resolve data → ActivateRoute component → CanDeactivate — each step can cancel the navigation.

---

### 5 Deep Conceptual Questions

**Q1: What is the router navigation lifecycle?**
> **A:** (1) NavigationStart event. (2) URL parsing and matching to route config. (3) Redirects applied. (4) CanMatch guards — should this route handle the URL at all? (5) CanActivate guards — is the user allowed here? (6) CanActivateChild for child routes. (7) Resolve — pre-fetch data before component activates. (8) ActivateRoute — router-outlet renders the component. (9) NavigationEnd event. (10) CanDeactivate on leaving. At each step, a guard can return false or a UrlTree to cancel or redirect the navigation.

**Q2: Mental model for ActivatedRoute and paramMap?**
> **A:** ActivatedRoute is the snapshot of the CURRENT route — providing params (URL segments like :id), queryParams (search params after ?), data (static data from route config + resolved data), url (URL segments array), and fragment (#hash). paramMap and queryParamMap are Observables — they emit new values when the URL changes WITHOUT recreating the component (e.g., navigating /users/1 -> /users/2 reuses UserDetailComponent but emits a new params observable value). Use the observable form for single-page detail views to avoid creating/destroying the component on every navigation.

**Q3: Most dangerous misconception about Angular routing?**
> **A:** Lazy loading always improves performance:
> \`\`\`typescript
> // WRONG: Too many tiny lazy routes can HURT performance
> // Each lazy module requires a separate HTTP request on first navigation
> // 20 lazy routes = 20 network waterfalls on first visit to each
>
> // CORRECT: Lazy load FEATURE areas, not individual components
> // Group related features together:
> { path: 'admin', loadChildren: () => import('./admin/admin.routes') }
> // This loads ALL admin routes in one bundle — one request for the whole feature
>
> // Also: use preloadingStrategy: PreloadAllModules to preload
> // lazy routes in the background after initial load
> \`\`\`

**Q4: How do route guards work with signals and functional guards?**
> **A:** Modern Angular (v15+) supports functional guards — plain functions returning boolean, UrlTree, or Observable<boolean>. The inject() function works in guard factories because guards run in an injection context. Functional guards are more composable: const adminGuard = () => inject(AuthService).isAdmin() ? true : redirect('/login'). They are also easier to test — no TestBed needed, just call the function with mocked inject() dependencies.

**Q5: FAANG-grade definition of Angular routing.**
> **A:** "Angular Router is a declarative, configuration-driven client-side router implementing the HTML5 History API — matching URL paths to component trees via a route configuration (Routes array) with lazy loading via dynamic import(), parameterised segments via :param syntax, guard pipeline (CanActivate, CanActivateChild, CanDeactivate, CanMatch, Resolve) forming a state-machine-like navigation lifecycle, router-outlet as the dynamic component insertion point, and preloading strategies for background bundle fetching to balance initial load speed with navigation responsiveness."`,

    build: `## BUILD

### 🏗️ Mini Project: Lazy-Loaded Router With Guards, Resolvers, and Breadcrumbs

**What you will build:** A 3-route app (Home, Products, Product Detail) with lazy loading, a CanActivate auth guard, a Resolve data resolver, and dynamic breadcrumbs from route data — the routing patterns every production Angular app uses.
**Why this project:** Forces lazy loading, functional guards, resolvers, and ActivatedRoute patterns together.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new routing-demo --standalone --routing
cd routing-demo
ng generate component products --standalone
ng generate component product-detail --standalone
ng generate service auth
ng generate service product
\`\`\`

#### Step 2 — Auth Guard and Product Resolver
\`\`\`typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

// product.resolver.ts
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { ProductService } from './product.service';

export const productResolver = (route: ActivatedRouteSnapshot) => {
  const id = Number(route.paramMap.get('id'));
  return inject(ProductService).getProduct(id);
};
\`\`\`

#### Step 3 — Routes With Lazy Loading
\`\`\`typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { productResolver } from './product.resolver';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'products',
    canActivate: [authGuard],
    data: { breadcrumb: 'Products' },
    loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent),
  },
  {
    path: 'products/:id',
    canActivate: [authGuard],
    data: { breadcrumb: 'Product Detail' },
    resolve: { product: productResolver },
    loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent),
  },
  { path: '**', redirectTo: '' },
];
\`\`\`

#### Step 4 — Product Detail With Activated Route
\`\`\`typescript
// product-detail.component.ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  standalone: true, imports: [AsyncPipe],
  template: \`
    @if (route.data | async; as data) {
      <h1>{{ data.product.name }}</h1>
      <p>Price: {{ data.product.price | currency }}</p>
    }
  \`,
})
export class ProductDetailComponent {
  route = inject(ActivatedRoute);
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('authGuard', () => {
  it('returns true when logged in', () => {
    TestBed.configureTestingModule({ providers: [
      { provide: AuthService, useValue: { isLoggedIn: () => true } },
      { provide: Router, useValue: { createUrlTree: (p: any[]) => p } },
    ]});
    const result = TestBed.runInInjectionContext(() => authGuard());
    expect(result).toBe(true);
  });
  it('redirects when not logged in', () => {
    TestBed.configureTestingModule({ providers: [
      { provide: AuthService, useValue: { isLoggedIn: () => false } },
      { provide: Router, useValue: { createUrlTree: (p: any[]) => p } },
    ]});
    const result = TestBed.runInInjectionContext(() => authGuard());
    expect(result).toEqual(['/login']);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
/products -> lazily loaded ProductsComponent (network tab shows chunk)
/products/1 -> resolver fetches product before component activates
Not logged in -> redirect to /login
Tests: 2 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add a CanDeactivate guard on the product edit page
- [ ] Add PreloadAllModules strategy
- [ ] Add breadcrumbs by reading route.data.breadcrumb up the route hierarchy`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is the order of router lifecycle steps?
**Q2:** Difference between routerLink and Router.navigate()?
**Q3:** Write a lazy-loaded route definition. From memory.

### Day 3 — Comprehension
**Q4:** What is the difference between paramMap (Observable) and snapshot.params?
**Q5:** A junior uses too many small lazy modules — explain the waterfall performance issue.
**Q6:** Refactor to functional guard:
\`\`\`typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate() { return this.auth.isLoggedIn() ? true : this.router.createUrlTree(['/login']); }
}
\`\`\`

### Day 7 — Application
**Q7:** Build a breadcrumb component that reads route data up the route tree.
**Q8:** A PR navigates to /users/1 then /users/2 — does UserDetailComponent recreate?
**Q9:** What is withRouterConfig({ onSameUrlNavigation: 'reload' }) used for?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every step Angular's router takes from URL change to component render."
**Q11:** Draw: router navigation state machine — all guard types in order.
**Q12:** ★ System design: "Design routing for an Angular SPA with 100+ routes, 5 permission levels, and 3 user types."`
  },

  // ── 11. forms-reactive ───────────────────────────────────────────────────
  'forms-reactive': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Reactive Forms Like I'm 10 Years Old
> Reactive forms build the form structure in TypeScript, not HTML — you create a FormGroup with FormControls in the component class, then bind them to template inputs via formControlName. The HTML just RENDERS the form; all validation, grouping, and state logic lives in TypeScript. The non-obvious power: because the form is a JavaScript object, you can dynamically add/remove controls at runtime, subscribe to value and status changes as Observables, reset the form programmatically, and unit-test validation logic without a DOM. Reactive forms are "model-driven" — you define the shape of your data and its validation rules up front, then Angular handles two-way sync automatically.

---

### 5 Deep Conceptual Questions

**Q1: What is the reactive forms data model?**
> **A:** FormControl is a single field (tracks value, validation status, touched/dirty/pristine state). FormGroup is a collection of FormControls keyed by name (tracks the aggregate validity of its children). FormArray is an indexed collection of FormControls or FormGroups (for dynamic lists of fields). FormBuilder is a helper that simplifies creation syntax. AbstractControl is the base class — all three extend it. The entire form is a TREE of AbstractControls whose values compose automatically into a plain JavaScript object via formGroup.value.

**Q2: Mental model for validation in reactive forms?**
> **A:** Validators are functions that take an AbstractControl and return null (valid) or a ValidationErrors object (invalid — the keys become error codes you check in templates). Validators.required, Validators.email, Validators.min(n), Validators.pattern(re) are built-in. Async validators (like checking username availability) return Observable<ValidationErrors | null> and run after sync validators pass. Cross-field validators live on a FormGroup — they receive the entire group and can check multiple fields together (e.g., password === confirmPassword).

**Q3: Most dangerous misconception about reactive forms?**
> **A:** formGroup.value gives the complete form data:
> \`\`\`typescript
> // WRONG: .value excludes DISABLED controls
> const form = this.fb.group({ name: 'Ana', role: [{ value: 'admin', disabled: true }] });
> console.log(form.value);  // { name: 'Ana' } — role is missing!
>
> // CORRECT: .getRawValue() includes disabled controls
> console.log(form.getRawValue());  // { name: 'Ana', role: 'admin' }
>
> // Practical scenario: disabling a field during submission
> // but still needing its value to send to the server
> \`\`\`

**Q4: How do FormArrays work for dynamic form fields?**
> **A:** FormArray holds AbstractControls at numeric indices. Push adds a new control, removeAt removes by index, at(i) accesses by index. The formArrayName directive in the template binds to the array, and formGroupName/formControlName bind to individual array items. Pattern: for a dynamic phone numbers list, each phone is a FormGroup with number and type controls. push(this.fb.group({ number: '', type: 'mobile' })) adds a new row; removeAt(i) deletes it. The form value automatically reflects the array contents.

**Q5: FAANG-grade definition of Angular reactive forms.**
> **A:** "Angular reactive forms are a model-driven approach where form structure (FormControl, FormGroup, FormArray) and validation (sync and async Validators) are defined in TypeScript, with formControlName/formGroupName/formArrayName directives binding the model to template inputs — exposing form state (value, status, touched, dirty, errors) as Observables for reactive transformations — and FormBuilder providing ergonomic factory methods — making forms fully unit-testable, dynamically composable, and RxJS-composable without touching the DOM."`,

    build: `## BUILD

### 🏗️ Mini Project: Multi-Step Registration Form With Dynamic Fields and Cross-Field Validation

**What you will build:** A 3-step registration form: (1) account info with async username-availability check, (2) profile with a dynamic phone-numbers FormArray, (3) confirmation with password + confirmPassword cross-field validator.
**Why this project:** Forces async validators, FormArrays, cross-field validation, and multi-step form patterns.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new reactive-forms-demo --standalone --routing false
cd reactive-forms-demo
ng generate component registration --standalone
\`\`\`

#### Step 2 — Validators
\`\`\`typescript
// validators.ts
import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Observable, of, delay, map } from 'rxjs';

// Cross-field: passwords must match
export function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pass = control.get('password');
  const confirm = control.get('confirmPassword');
  if (!pass || !confirm) return null;
  return pass.value === confirm.value ? null : { passwordsMismatch: true };
}

// Async: simulate username availability check
export function usernameAvailable(): AsyncValidatorFn {
  const taken = new Set(['admin', 'user', 'test', 'angular']);
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return of(control.value).pipe(
      delay(500),  // simulate network delay
      map(username => taken.has(username.toLowerCase()) ? { usernameTaken: true } : null)
    );
  };
}
\`\`\`

#### Step 3 — Registration Component
\`\`\`typescript
// registration.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { passwordsMatch, usernameAvailable } from '../validators';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf],
  template: \`
    <form [formGroup]="form" (ngSubmit)="submit()">
      <!-- Step 1: Account -->
      <section>
        <h3>Account Info</h3>
        <input formControlName="username" placeholder="Username">
        <span *ngIf="form.get('username')?.pending">Checking...</span>
        <span *ngIf="form.get('username')?.errors?.['usernameTaken']">Username taken!</span>
        <span *ngIf="form.get('username')?.errors?.['required']">Required</span>
        <input formControlName="email" type="email" placeholder="Email">
      </section>

      <!-- Step 2: Phone Numbers (FormArray) -->
      <section formArrayName="phones">
        <h3>Phone Numbers</h3>
        <div *ngFor="let phone of phones.controls; let i = index" [formGroupName]="i">
          <input formControlName="number" placeholder="Number">
          <select formControlName="type">
            <option value="mobile">Mobile</option>
            <option value="home">Home</option>
            <option value="work">Work</option>
          </select>
          <button type="button" (click)="removePhone(i)">Remove</button>
        </div>
        <button type="button" (click)="addPhone()">+ Add Phone</button>
      </section>

      <!-- Step 3: Password -->
      <section formGroupName="passwords">
        <h3>Set Password</h3>
        <input formControlName="password" type="password" placeholder="Password">
        <input formControlName="confirmPassword" type="password" placeholder="Confirm">
        <span *ngIf="form.get('passwords')?.errors?.['passwordsMismatch']">Passwords do not match</span>
      </section>

      <button type="submit" [disabled]="form.invalid || form.pending">Register</button>
    </form>
    <pre>{{ form.getRawValue() | json }}</pre>
  \`,
})
export class RegistrationComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)], [usernameAvailable()]],
    email: ['', [Validators.required, Validators.email]],
    phones: this.fb.array([this.createPhone()]),
    passwords: this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordsMatch }),
  });

  get phones(): FormArray { return this.form.get('phones') as FormArray; }

  createPhone() {
    return this.fb.group({ number: ['', Validators.required], type: ['mobile'] });
  }
  addPhone()      { this.phones.push(this.createPhone()); }
  removePhone(i: number) { this.phones.removeAt(i); }

  submit() {
    if (this.form.valid) console.log('Submitted:', this.form.getRawValue());
  }
}
\`\`\`

#### Step 4 — Error Handling: Status and Touch Tracking
\`\`\`typescript
// Show error only after the user has touched the field
getError(path: string, error: string): boolean {
  const control = this.form.get(path);
  return !!(control?.touched && control?.errors?.[error]);
}

// Reset form on success
onSuccess() {
  this.form.reset();
  // OR reset to initial values:
  this.form.patchValue({ username: '', email: '' });
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('passwordsMatch validator', () => {
  it('returns null when passwords match', () => {
    const group = new FormGroup({
      password: new FormControl('abc123'),
      confirmPassword: new FormControl('abc123'),
    });
    expect(passwordsMatch(group)).toBeNull();
  });
  it('returns error when passwords differ', () => {
    const group = new FormGroup({
      password: new FormControl('abc123'),
      confirmPassword: new FormControl('different'),
    });
    expect(passwordsMatch(group)).toEqual({ passwordsMismatch: true });
  });
});
\`\`\`

**Expected Output:**
\`\`\`
username 'admin' -> "Username taken!" after 500ms delay
Add Phone -> new row in FormArray
Remove Phone -> row removed
Passwords mismatch -> "Passwords do not match"
Submit -> logs getRawValue() including disabled fields
Tests: 2 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add a step-by-step wizard with separate FormGroups per step
- [ ] Add debounceTime(300) to the username async validator
- [ ] Build a reusable form-error component that reads AbstractControl errors`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between FormControl, FormGroup, and FormArray?
**Q2:** What does formGroup.value exclude that getRawValue() includes?
**Q3:** Write a required + minLength validator on a FormControl. From memory.

### Day 3 — Comprehension
**Q4:** How do async validators differ from sync validators?
**Q5:** A junior adds a cross-field validator on a FormControl — it never runs for both fields. Fix.
**Q6:** Refactor to reactive form:
\`\`\`typescript
// Template-driven: <input [(ngModel)]="name" required>
// Needs to become reactive
\`\`\`

### Day 7 — Application
**Q7:** Build a FormArray of addresses with add/remove — each address has street, city, postcode.
**Q8:** A PR shows validation errors before the user touches fields — fix.
**Q9:** How do you reset a reactive form to its initial values?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Compare reactive forms and template-driven forms — when would you use each in a production app?"
**Q11:** Draw: FormGroup value tree for a nested multi-section registration form.
**Q12:** ★ System design: "Design a dynamic form builder that renders forms from a JSON schema — Angular reactive forms approach."`
  },

  // ── 12. forms-template-driven ────────────────────────────────────────────
  'forms-template-driven': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Template-Driven Forms Like I'm 10 Years Old
> Template-driven forms build the form IN THE HTML using NgModel and validation attributes — Angular reads the template and creates a FormGroup/FormControl model automatically behind the scenes. You don't explicitly create the model in TypeScript; the template IS the source of truth. They are simpler for small forms (login, search, contact) but harder to test and extend for complex forms. ngModel binds a template variable to a component property and tracks validation state — adding CSS classes like ng-valid, ng-invalid, ng-touched automatically. The non-obvious depth: template-driven forms use DIRECTIVES to build the reactive model under the hood — NgModel is actually creating FormControl instances. The difference from reactive forms is WHERE the model is defined (template vs TypeScript), not how it works internally.

---

### 5 Deep Conceptual Questions

**Q1: How does NgModel create the form model?**
> **A:** When Angular processes a template with NgModel on an input, the NgModel directive instantiates a FormControl internally and registers it with the nearest NgForm ancestor. NgForm collects all NgModel controls into a FormGroup. You can access this model via a template reference variable: #form="ngForm". The key insight: there IS a reactive forms model under the hood — template-driven forms just build it declaratively from the template instead of imperatively in TypeScript.

**Q2: Mental model for ngModel with and without two-way binding?**
> **A:** [(ngModel)]="prop" is the full two-way binding — reads the value from prop AND writes back when the user types. [ngModel]="prop" is one-way binding (component to template only). (ngModelChange)="handler($event)" is the event-only version. You might use [ngModel] with (ngModelChange) separately when you need to process/validate the change before applying it — e.g., debouncing or sanitising input.

**Q3: Most dangerous misconception about template-driven forms?**
> **A:** Template-driven forms are always easier than reactive forms:
> \`\`\`typescript
> // For dynamic forms or complex cross-field validation, template-driven gets messy
>
> // TEMPLATE-DRIVEN (hard to do):
> // How do you add/remove fields dynamically?
> // How do you access the FormControl to set errors programmatically?
> // How do you unit-test validation without a rendered DOM?
>
> // REACTIVE (clean for these):
> this.form.setErrors({ serverError: 'Email already exists' });
> this.phones.push(this.createPhone());
> // Testable: validators are plain functions, no DOM needed
>
> // RULE: Simple forms (login, search) -> template-driven
> //       Complex/dynamic/heavily-validated -> reactive
> \`\`\`

**Q4: How do you add custom validation to template-driven forms?**
> **A:** Create a directive that implements Validator interface and provides itself as NG_VALIDATORS: @Directive({ selector: '[appMinAge]', providers: [{ provide: NG_VALIDATORS, useExisting: MinAgeDirective, multi: true }] }). Implement validate(control: AbstractControl). In the template: <input appMinAge="18" ngModel name="age">. The validator is called by Angular's forms system the same way built-in validators are. This is more complex than reactive form validators (plain functions) — one more reason complex validation belongs in reactive forms.

**Q5: FAANG-grade definition of template-driven forms.**
> **A:** "Angular template-driven forms use NgModel, NgForm, and NgModelGroup directives to implicitly construct a reactive forms model (FormControl/FormGroup) from the template HTML — with NgModel implementing ControlValueAccessor to bridge DOM values and the Angular forms model — validation through HTML5 attributes (required, minlength, pattern) or custom validator directives implementing Validator — and form state reflected via CSS class names (ng-valid, ng-invalid, ng-touched, ng-dirty) — appropriate for simple forms where template definition is sufficient and programmatic control is not required."`,

    build: `## BUILD

### 🏗️ Mini Project: Login + Contact Form Using Template-Driven Approach

**What you will build:** A login form and a contact form using template-driven approach — demonstrating ngModel, ngForm, built-in validators, template ref variables for error display, and form submission.
**Why this project:** Covers the real use-case for template-driven forms — simple, fast-to-write forms.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new template-forms-demo --standalone --routing false
cd template-forms-demo
# FormsModule imported into component
\`\`\`

#### Step 2 — Login Form
\`\`\`typescript
// login.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, NgIf],
  template: \`
    <form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)">
      <div>
        <label>Email</label>
        <input type="email" name="email" [(ngModel)]="credentials.email"
               required email #emailField="ngModel">
        <span *ngIf="emailField.touched && emailField.errors?.['required']">Required</span>
        <span *ngIf="emailField.touched && emailField.errors?.['email']">Invalid email</span>
      </div>
      <div>
        <label>Password</label>
        <input type="password" name="password" [(ngModel)]="credentials.password"
               required minlength="8" #passField="ngModel">
        <span *ngIf="passField.touched && passField.errors?.['required']">Required</span>
        <span *ngIf="passField.touched && passField.errors?.['minlength']">Min 8 characters</span>
      </div>
      <button type="submit" [disabled]="loginForm.invalid">Login</button>
    </form>
    <p *ngIf="submitted">Submitted: {{ credentials | json }}</p>
  \`,
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  submitted = false;

  onSubmit(form: any) {
    if (form.valid) {
      this.submitted = true;
      console.log('Login:', this.credentials);
    }
  }
}
\`\`\`

#### Step 3 — Contact Form With NgModelGroup
\`\`\`typescript
// contact.component.ts
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [FormsModule, NgIf],
  template: \`
    <form #contactForm="ngForm" (ngSubmit)="onSubmit(contactForm)">
      <div ngModelGroup="sender">
        <input name="name" [(ngModel)]="contact.sender.name" required placeholder="Name" #nameField="ngModel">
        <span *ngIf="nameField.invalid && nameField.touched">Name required</span>
        <input name="email" [(ngModel)]="contact.sender.email" required email placeholder="Email">
      </div>
      <textarea name="message" [(ngModel)]="contact.message" required minlength="10" placeholder="Message"></textarea>
      <button type="submit" [disabled]="contactForm.invalid">Send</button>
    </form>
    <pre *ngIf="result">{{ result | json }}</pre>
  \`,
})
export class ContactComponent {
  contact = { sender: { name: '', email: '' }, message: '' };
  result: any = null;

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.result = form.value;  // form.value reflects ngModelGroup structure
      form.resetForm();
    }
  }
}
\`\`\`

#### Step 4 — Custom Validator Directive
\`\`\`typescript
// min-age.directive.ts
import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  standalone: true,
  selector: '[appMinAge]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MinAgeDirective, multi: true }],
})
export class MinAgeDirective implements Validator {
  @Input('appMinAge') minAge = 18;

  validate(control: AbstractControl): ValidationErrors | null {
    const age = parseInt(control.value, 10);
    return isNaN(age) || age < this.minAge ? { minAge: { required: this.minAge, actual: age } } : null;
  }
}

// Usage: <input type="number" name="age" [(ngModel)]="age" appMinAge="18">
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('LoginComponent', () => {
  it('submit button disabled when form invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button[type=submit]');
    expect(btn.disabled).toBe(true);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Login form: submit disabled until valid, errors shown on touch
Contact: ngModelGroup creates nested value object
Submission: form.value reflects full structure
\`\`\`

**Stretch Challenges:**
- [ ] Add a debounced email availability check to the template-driven form
- [ ] Compare the test complexity of template-driven vs reactive for the same form
- [ ] Add a ControlValueAccessor for a custom rating widget`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does [(ngModel)] do that [ngModel] alone does not?
**Q2:** How do you access a form's overall validity in a template-driven form?
**Q3:** Write a template-driven login form. From memory.

### Day 3 — Comprehension
**Q4:** How are template-driven forms different from reactive forms internally?
**Q5:** A junior needs to set a server-side validation error programmatically — why is reactive forms better here?
**Q6:** What is ngModelGroup and what does it produce in form.value?

### Day 7 — Application
**Q7:** Add a custom validator directive for phone number format to a template form.
**Q8:** When does template-driven form validation NOT fire? (hint: programmatic value changes)
**Q9:** How do you reset a template-driven form including error state?

### Day 14 — Synthesis
**Q10:** ★ Interview: "When would you choose template-driven over reactive forms in a real project?"
**Q11:** Draw: internal model NgModel creates — how does it relate to FormControl?
**Q12:** ★ System design: "Architect a form system for an e-commerce checkout — address, payment, review steps — reactive or template-driven and why."`
  },

  // ── 13. http-client ───────────────────────────────────────────────────────
  'http-client': {
    feynman: `## FEYNMAN CHECK

### Explain Angular HttpClient Like I'm 10 Years Old
> HttpClient is Angular's built-in HTTP service — a typed wrapper around the browser's XMLHttpRequest/fetch. You inject it, call this.http.get<User[]>('/api/users'), and get back an Observable (not a Promise). The Observable does nothing until you subscribe (lazy) — this is important: calling http.get() doesn't trigger the network request until a subscribe() or async pipe subscribes to it. The non-obvious depth: HttpClient automatically serialises request bodies to JSON and parses JSON responses. It also integrates with Angular's interceptor pipeline — every request/response flows through registered interceptors, enabling cross-cutting concerns like auth token injection, logging, error handling, and retry without touching individual service methods.

---

### 5 Deep Conceptual Questions

**Q1: Why does HttpClient return Observables instead of Promises?**
> **A:** Observables add: (1) CANCELLATION — you can unsubscribe from a request, aborting it if the component is destroyed (unlike Promises which always run to completion). (2) RETRY — operators like retry(3) or retryWhen(strategy) can resubscribe on error. (3) COMPOSITION — you can pipe HTTP responses through map/switchMap/catchError/shareReplay chains. (4) PROGRESS events — downloadProgress can track upload/download bytes. For most simple one-shot GET/POST, you could convert with firstValueFrom() to a Promise, but losing retry/cancel/compose benefits.

**Q2: Mental model for typed HTTP requests?**
> **A:** this.http.get<User[]>('/api/users') tells TypeScript what shape the response JSON will be, enabling type checking on .pipe(map(users => users[0].email)). But this is a COMPILE-TIME-ONLY type assertion — HttpClient trusts that the server returns what you declared. At runtime, if the server returns unexpected data, the TypeScript type doesn't protect you. Use Zod or a validator in the pipe to actually VALIDATE the response shape: .pipe(map(data => UserSchema.parse(data))).

**Q3: Most dangerous misconception about HttpClient?**
> **A:** HTTP observables auto-cancel and clean up:
> \`\`\`typescript
> // WRONG: if component is destroyed before response arrives,
> // the subscription stays active and callback tries to update destroyed component
> export class SearchComponent implements OnInit {
>   ngOnInit() {
>     this.http.get('/api/results').subscribe(data => {
>       this.results = data;  // component may already be destroyed!
>     });
>   }
> }
>
> // CORRECT: auto-cancel with takeUntilDestroyed
> private destroyRef = inject(DestroyRef);
> ngOnInit() {
>   this.http.get('/api/results')
>     .pipe(takeUntilDestroyed(this.destroyRef))
>     .subscribe(data => this.results = data);
> }
> // Or better: use async pipe — it cancels automatically
> results$ = this.http.get('/api/results');
> // template: {{ results$ | async }}
> \`\`\`

**Q4: How does withCredentials and CORS work with HttpClient?**
> **A:** By default, HttpClient requests don't include cookies for cross-origin requests. Pass { withCredentials: true } to include cookies and auth headers. The server must respond with Access-Control-Allow-Credentials: true AND Access-Control-Allow-Origin: https://your-app.com (not wildcard *). For JSON content, Angular automatically sets Content-Type: application/json. Custom headers are added via HttpHeaders object: new HttpHeaders({ Authorization: 'Bearer ' + token }).

**Q5: FAANG-grade definition of Angular HttpClient.**
> **A:** "Angular HttpClient is a typed HTTP client wrapping XMLHttpRequest — returning cold Observables (lazy, cancellable) for GET/POST/PUT/DELETE/PATCH requests with automatic JSON serialisation/deserialisation, typed response generics, HTTP interceptor pipeline for cross-cutting concerns (auth, logging, retry, error handling), progress event support, and XSRF/CSRF token handling — with provideHttpClient(withInterceptors([...])) for functional interceptor registration and withFetch() for a fetch-based backend."`,

    build: `## BUILD

### 🏗️ Mini Project: Typed API Service With Loading State, Error Handling, and Retry

**What you will build:** A UserApiService wrapping HttpClient with: typed responses, global loading state, error handling that categorises network vs server vs validation errors, and automatic retry with exponential backoff.
**Why this project:** Forces every production HttpClient pattern into one testable, reusable service.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new http-demo --standalone --routing false
cd http-demo
ng generate service user-api
\`\`\`

#### Step 2 — Typed API Service
\`\`\`typescript
// user-api.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry, catchError, mergeMap, finalize } from 'rxjs/operators';

export interface User { id: number; name: string; email: string; }
export interface ApiError { type: 'network' | 'server' | 'validation' | 'unknown'; message: string; status?: number; }

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private http = inject(HttpClient);
  private BASE = 'https://jsonplaceholder.typicode.com';

  isLoading = signal(false);

  private handleError(err: HttpErrorResponse): Observable<never> {
    let apiError: ApiError;
    if (err.status === 0) {
      apiError = { type: 'network', message: 'No internet connection or server unreachable' };
    } else if (err.status >= 400 && err.status < 500) {
      apiError = { type: 'validation', message: err.error?.message ?? 'Invalid request', status: err.status };
    } else if (err.status >= 500) {
      apiError = { type: 'server', message: 'Server error, please try again', status: err.status };
    } else {
      apiError = { type: 'unknown', message: 'An unexpected error occurred' };
    }
    return throwError(() => apiError);
  }

  private withRetry<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      retry({
        count: 3,
        delay: (err, attempt) => {
          if ((err as ApiError).type === 'validation') return throwError(() => err);
          return timer(Math.pow(2, attempt) * 500);  // 0.5s, 1s, 2s
        },
      }),
    );
  }

  getUsers(): Observable<User[]> {
    this.isLoading.set(true);
    return this.withRetry(this.http.get<User[]>(\`\${this.BASE}/users\`)).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoading.set(false)),
    );
  }

  getUser(id: number): Observable<User> {
    return this.withRetry(this.http.get<User>(\`\${this.BASE}/users/\${id}\`)).pipe(
      catchError(this.handleError),
    );
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(\`\${this.BASE}/users\`, user).pipe(
      catchError(this.handleError),
    );
  }

  updateUser(id: number, changes: Partial<User>): Observable<User> {
    return this.http.patch<User>(\`\${this.BASE}/users/\${id}\`, changes).pipe(
      catchError(this.handleError),
    );
  }
}
\`\`\`

#### Step 3 — Component Integration
\`\`\`typescript
// app.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { UserApiService, ApiError } from './user-api.service';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';

@Component({
  standalone: true, imports: [AsyncPipe, NgIf, NgFor],
  template: \`
    <h1>Users</h1>
    <p *ngIf="apiService.isLoading()">Loading...</p>
    <p *ngIf="error">Error ({{ error.type }}): {{ error.message }}</p>
    <ul><li *ngFor="let user of users">{{ user.name }} — {{ user.email }}</li></ul>
  \`,
})
export class AppComponent implements OnInit {
  apiService = inject(UserApiService);
  users: any[] = [];
  error: ApiError | null = null;

  ngOnInit() {
    this.apiService.getUsers().subscribe({
      next: users => this.users = users,
      error: (err: ApiError) => this.error = err,
    });
  }
}
\`\`\`

#### Step 4 — Error Handling: HttpClientTestingModule
\`\`\`typescript
// Test the retry logic
it('retries 3 times on server error', () => {
  const httpTesting = TestBed.inject(HttpTestingController);
  const service = TestBed.inject(UserApiService);
  let errorReceived: ApiError | null = null;
  service.getUsers().subscribe({ error: e => errorReceived = e });

  for (let i = 0; i < 4; i++) {
    const req = httpTesting.expectOne('/api/users');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  }
  expect(errorReceived?.type).toBe('server');
});
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('UserApiService', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());

  it('getUsers returns typed user array', () => {
    let result: any;
    service.getUsers().subscribe(users => result = users);
    httpMock.expectOne('https://jsonplaceholder.typicode.com/users')
      .flush([{ id: 1, name: 'Ana', email: 'ana@test.com' }]);
    expect(result[0].name).toBe('Ana');
  });
});
\`\`\`

**Expected Output:**
\`\`\`
isLoading becomes true, then false after response
Users list renders
Server error -> ApiError type 'server', message shown
Network error -> ApiError type 'network'
Tests: 1 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add request deduplication for concurrent identical GET calls
- [ ] Add a caching interceptor with TTL
- [ ] Add Zod schema validation of the HTTP response`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Why does HttpClient return Observables instead of Promises?
**Q2:** What happens if the server returns HTTP 404 — does the Observable error?
**Q3:** Write an HTTP GET that returns typed User[]. From memory.

### Day 3 — Comprehension
**Q4:** How do you cancel an in-flight HTTP request in Angular?
**Q5:** A junior calls http.get() in a constructor — the request fires twice. Why?
**Q6:** Refactor to auto-cancel when component destroys:
\`\`\`typescript
ngOnInit() { this.http.get('/api/data').subscribe(d => this.data = d); }
\`\`\`

### Day 7 — Application
**Q7:** Build an HTTP service with a loading state signal and error categorisation.
**Q8:** A PR retries a 401 Unauthorized error — explain why this is wrong.
**Q9:** How does withFetch() differ from the default XHR backend?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through what happens when you call http.get() — from Observable creation to DOM update."
**Q11:** Draw: HttpClient interceptor pipeline for an authenticated request.
**Q12:** ★ System design: "Design the HTTP layer for an Angular SPA — auth, caching, retry, error handling, offline."`
  },

  // ── 14. interceptors ─────────────────────────────────────────────────────
  'interceptors': {
    feynman: `## FEYNMAN CHECK

### Explain Angular HTTP Interceptors Like I'm 10 Years Old
> An HTTP interceptor is a MIDDLEWARE function that sits between your service code and the actual network — it can inspect, modify, or cancel every HTTP request and response. When you call http.get('/api/users'), Angular passes the request through a pipeline of interceptors before it leaves the browser. Typical uses: add Authorization headers to every request (auth interceptor), log all requests for debugging (logging interceptor), show a loading spinner while requests are pending (loading interceptor), retry on failure (retry interceptor), cache responses (cache interceptor). The non-obvious point: interceptors are a CHAIN — each interceptor calls next(request) to pass to the next interceptor. If an interceptor doesn't call next(), the request never reaches the server.

---

### 5 Deep Conceptual Questions

**Q1: How does the interceptor chain work?**
> **A:** provideHttpClient(withInterceptors([authInterceptor, loggingInterceptor])) registers interceptors in ORDER. Each interceptor receives the request and a next function. When you call next(req), it passes to the next interceptor. The last interceptor's next() hits the actual HTTP backend. On the way back, each interceptor can tap/modify the response Observable. So for [auth, logging]: auth wraps logging, logging wraps the HTTP backend. Request flows: auth → logging → network. Response flows: network → logging → auth → subscriber.

**Q2: Mental model for functional interceptors vs class interceptors?**
> **A:** The old class-based interceptors implemented HttpInterceptor with an intercept() method. The new functional interceptors (Angular 15+) are plain functions: (req: HttpRequest, next: HttpHandlerFn) => Observable<HttpEvent>. Functional interceptors are more composable (no class boilerplate), easier to test (just call the function), and work naturally with inject() for dependencies. Both are equivalent in capability; functional is the recommended approach for new code.

**Q3: Most dangerous misconception about interceptors?**
> **A:** You can mutate the request object directly:
> \`\`\`typescript
> // WRONG: HttpRequest is IMMUTABLE — mutation is silently ignored
> export const authInterceptor: HttpInterceptorFn = (req, next) => {
>   req.headers.set('Authorization', 'Bearer ' + getToken());  // silently does nothing!
>   return next(req);
> };
>
> // CORRECT: clone the request with modifications
> export const authInterceptor: HttpInterceptorFn = (req, next) => {
>   const authReq = req.clone({
>     headers: req.headers.set('Authorization', 'Bearer ' + inject(AuthService).getToken()),
>   });
>   return next(authReq);
> };
> \`\`\`

**Q4: How do you implement a token refresh interceptor?**
> **A:** On 401 response, the interceptor should: (1) Call the refresh token endpoint to get a new access token. (2) Retry the original failed request with the new token. (3) If refresh also fails, log the user out. This requires: catchError on the response Observable, checking status === 401, calling authService.refresh() (returns an Observable), then switchMap to retry the original request with the new token. The tricky part: prevent infinite loops (don't retry the refresh call itself) and handle concurrent requests (queue them while refresh is in progress using a BehaviorSubject).

**Q5: FAANG-grade definition of Angular interceptors.**
> **A:** "Angular HTTP interceptors are middleware functions registered via withInterceptors([...]) that intercept every HttpRequest/HttpResponse in the application — running as a chain where each interceptor calls next(req) to delegate to the next, with the ability to clone and modify requests (add headers, transform body), tap responses for logging, handle errors (retry, token refresh), cache responses, show loading indicators, and modify URLs — all without changing service-level HTTP code — with functional interceptors (HttpInterceptorFn) being the modern, testable, DI-compatible pattern."`,

    build: `## BUILD

### 🏗️ Mini Project: Complete Interceptor Pipeline — Auth, Loading, Retry, Logging

**What you will build:** A 4-interceptor pipeline: (1) auth — adds Bearer token to every request, (2) loading — increments/decrements a loading counter, (3) retry — retries failed requests up to 3 times with backoff, (4) logging — logs request URL and response time.
**Why this project:** Forces the complete production interceptor pattern with proper chaining and request cloning.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new interceptors-demo --standalone --routing false
cd interceptors-demo
ng generate service auth
ng generate service loading
\`\`\`

#### Step 2 — Auth Interceptor
\`\`\`typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (!token) return next(req);

  const authReq = req.clone({
    headers: req.headers.set('Authorization', 'Bearer ' + token),
  });
  return next(authReq);
};
\`\`\`

#### Step 3 — Loading Interceptor
\`\`\`typescript
// loading.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from './loading.service';
import { finalize } from 'rxjs/operators';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  loadingService.increment();
  return next(req).pipe(
    finalize(() => loadingService.decrement()),
  );
};

// loading.service.ts
import { Injectable, signal, computed } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = signal(0);
  isLoading = computed(() => this.count() > 0);
  increment() { this.count.update(n => n + 1); }
  decrement() { this.count.update(n => Math.max(0, n - 1)); }
}
\`\`\`

#### Step 4 — Retry + Logging Interceptors
\`\`\`typescript
// retry.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { retry, timer } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: 3,
      delay: (err: HttpErrorResponse, attempt) => {
        // Only retry on server errors, not client errors or auth errors
        if (err.status === 0 || err.status >= 500) {
          return timer(Math.pow(2, attempt) * 300);
        }
        throw err;  // propagate 4xx errors immediately
      },
    }),
  );
};

// logging.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const start = Date.now();
  return next(req).pipe(
    tap({
      next: event => {
        if (event.type === 4) {  // HttpEventType.Response
          console.log('[HTTP]', req.method, req.url, Date.now() - start + 'ms');
        }
      },
      error: err => console.error('[HTTP ERROR]', req.url, err.status, err.message),
    }),
  );
};
\`\`\`

#### Step 5 — Register and Test
\`\`\`typescript
// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([loggingInterceptor, loadingInterceptor, retryInterceptor, authInterceptor])
    ),
  ],
});

// interceptors.spec.ts
describe('authInterceptor', () => {
  it('adds Authorization header when token available', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { getToken: () => 'test-token' } },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    http.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({});
  });
});
\`\`\`

**Expected Output:**
\`\`\`
[HTTP] GET https://api.example.com/users 234ms
Loading spinner visible during request
Auth header added to every request
Server 500 -> retried 3 times with backoff
Tests: 1 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add a cache interceptor that returns cached responses for GET requests
- [ ] Add a token refresh interceptor with queue for concurrent requests
- [ ] Add a XSRF token interceptor for POST/PUT/DELETE`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does an HTTP interceptor do?
**Q2:** Why is HttpRequest immutable and how do you modify it?
**Q3:** Write the minimal functional interceptor that adds a header. From memory.

### Day 3 — Comprehension
**Q4:** In what order do interceptors process requests vs responses?
**Q5:** A junior's interceptor doesn't call next(req) — what happens?
**Q6:** Refactor class-based interceptor to functional:
\`\`\`typescript
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) { return next.handle(req).pipe(tap(() => console.log(req.url))); }
}
\`\`\`

### Day 7 — Application
**Q7:** Build a cache interceptor for GET requests with 60-second TTL.
**Q8:** A PR adds a retry interceptor that retries 401 errors — why is this dangerous?
**Q9:** How would you implement request deduplication across concurrent identical requests?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through building a JWT token refresh interceptor — all edge cases."
**Q11:** Draw: request/response flow through a 4-interceptor pipeline.
**Q12:** ★ System design: "Design the HTTP middleware layer for an Angular app with auth, caching, analytics, and error reporting."`
  },

  // ── 15. guards ───────────────────────────────────────────────────────────
  'guards': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Guards Like I'm 10 Years Old
> Guards are GATEKEEPERS for routes — they decide whether a navigation is allowed to proceed. CanActivate runs before a route is activated: return true to allow, false or a UrlTree to redirect. CanDeactivate runs when LEAVING a route: "are you sure you want to leave? You have unsaved changes." CanMatch determines whether a route configuration even MATCHES the current URL (useful for showing different routes to admin vs regular users without the user knowing). Resolve pre-fetches data before the component activates — the component receives ready data via ActivatedRoute instead of loading in ngOnInit. The non-obvious point: guards are just functions that return boolean, Observable<boolean>, or UrlTree — Angular 15+ makes them plain inject()-using functions, no class or interface required.

---

### 5 Deep Conceptual Questions

**Q1: What is the execution order of multiple guards?**
> **A:** (1) CanMatch guards run first (route matching phase). (2) CanActivate guards run in the order registered. (3) CanActivateChild runs for child routes. (4) Resolve runs after all CanActivate pass. (5) Component activates. (6) CanDeactivate runs when navigating away. CanActivate guards run in PARALLEL by default — if any returns false, navigation is cancelled. Resolve guards also run in parallel. This means long data fetches in multiple resolvers don't serialize — they run concurrently, completing when ALL finish.

**Q2: Mental model for CanMatch vs CanActivate?**
> **A:** CanMatch determines if a ROUTE DEFINITION even applies to the URL. If it returns false, Angular continues trying the next route definition — it's like route conditions. Use case: routes: [{ path: 'dashboard', canMatch: [adminMatch], component: AdminDashboard }, { path: 'dashboard', component: UserDashboard }] — admin gets admin dashboard, others get user dashboard, both at the same URL path. CanActivate, by contrast, runs AFTER the route matches — it blocks or redirects navigation to an already-matched route.

**Q3: Most dangerous misconception about guards?**
> **A:** Guards are the security layer for your API:
> \`\`\`typescript
> // WRONG: Guards only protect the UI — they do NOT protect your API
> // A determined user can call your API directly bypassing all Angular guards
>
> export const adminGuard = () => inject(AuthService).isAdmin() ? true : redirect('/login');
> // This only prevents navigation to /admin in the browser
> // The actual API endpoints MUST have server-side authorization
>
> // CORRECT mental model:
> // Guards = UX convenience (redirect to login instead of 403 page)
> // Server-side auth = actual security
> \`\`\`

**Q4: How do Resolve guards improve UX vs loading in ngOnInit?**
> **A:** Without Resolve: component renders → ngOnInit fires → HTTP call → loading spinner → data arrives → re-render. The user sees a blank or skeleton screen. With Resolve: router waits for data → component receives populated data immediately → renders once with real content. Trade-off: Resolve adds navigation LATENCY (user waits on the URL change), but eliminates the loading state inside the component. For perceived performance, Resolve is better for fast APIs; skeleton/loading is better for slow APIs where instant URL change feels more responsive.

**Q5: FAANG-grade definition of Angular guards.**
> **A:** "Angular route guards are functions (or classes implementing CanActivateFn/CanDeactivateFn/CanMatchFn/ResolveFn interfaces) that intercept router navigation — CanMatch for route-definition eligibility, CanActivate for navigation permission, CanActivateChild for child-route permission, Resolve for pre-navigation data fetching, and CanDeactivate for confirming navigation away from dirty forms — returning boolean/UrlTree/Observable<boolean>/Observable<UrlTree> — running in parallel when multiple guards are registered and short-circuiting navigation on any false/UrlTree return."`,

    build: `## BUILD

### 🏗️ Mini Project: Auth Guard + UnsavedChanges Guard + Prefetch Resolver

**What you will build:** (1) authGuard — redirect to login if not authenticated, (2) roleGuard — check user role, redirect to /forbidden, (3) unsavedChangesGuard — confirm before leaving a dirty form, (4) productResolver — pre-fetch product data before component activates.
**Why this project:** Covers the three most common production guard patterns in one app.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new guards-demo --standalone --routing
cd guards-demo
ng generate service auth
ng generate service product
ng generate component product-edit --standalone
\`\`\`

#### Step 2 — Auth and Role Guards
\`\`\`typescript
// guards.ts
import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: router.url } });
};

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data['role'] as string;
  if (auth.hasRole(requiredRole)) return true;
  return router.createUrlTree(['/forbidden']);
};
\`\`\`

#### Step 3 — UnsavedChanges Guard
\`\`\`typescript
// unsaved-changes.guard.ts
import { CanDeactivateFn } from '@angular/router';

export interface CanDeactivateComponent { hasUnsavedChanges(): boolean; }

export const unsavedChangesGuard: CanDeactivateFn<CanDeactivateComponent> =
  (component) => {
    if (!component.hasUnsavedChanges()) return true;
    return confirm('You have unsaved changes. Are you sure you want to leave?');
  };
\`\`\`

#### Step 4 — Resolver and Routes
\`\`\`typescript
// product.resolver.ts
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { ProductService } from './product.service';

export const productResolver = (route: ActivatedRouteSnapshot) =>
  inject(ProductService).getProduct(Number(route.paramMap.get('id')));

// app.routes.ts
export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login.component').then(m => m.LoginComponent) },
  { path: 'forbidden', loadComponent: () => import('./forbidden.component').then(m => m.ForbiddenComponent) },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
    loadComponent: () => import('./admin.component').then(m => m.AdminComponent),
  },
  {
    path: 'products/:id/edit',
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard],
    resolve: { product: productResolver },
    loadComponent: () => import('./product-edit/product-edit.component').then(m => m.ProductEditComponent),
  },
];
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('authGuard', () => {
  it('allows navigation when logged in', () => {
    TestBed.configureTestingModule({ providers: [
      { provide: AuthService, useValue: { isLoggedIn: () => true } },
      { provide: Router, useValue: {} },
    ]});
    expect(TestBed.runInInjectionContext(() => authGuard())).toBe(true);
  });

  it('redirects to login when not authenticated', () => {
    const mockRouter = { url: '/products', createUrlTree: (p: any[]) => p };
    TestBed.configureTestingModule({ providers: [
      { provide: AuthService, useValue: { isLoggedIn: () => false } },
      { provide: Router, useValue: mockRouter },
    ]});
    expect(TestBed.runInInjectionContext(() => authGuard())).toEqual(['/login']);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
/admin (not logged in) -> redirect to /login?returnUrl=/admin
/admin (logged in, wrong role) -> redirect to /forbidden
/products/1/edit -> resolver fetches product, component has data immediately
Leave dirty form -> confirmation dialog
Tests: 2 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add a CanMatch guard that shows different home pages for admin vs user at the same path
- [ ] Add a permissions-based guard using a permission service with bit flags
- [ ] Replace confirm() in unsavedChangesGuard with a custom modal Observable`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Five types of Angular route guards.
**Q2:** What can a guard return to redirect instead of blocking?
**Q3:** Write a functional authGuard. From memory.

### Day 3 — Comprehension
**Q4:** Difference between CanActivate and CanMatch?
**Q5:** A junior uses a guard to protect an API endpoint — explain the misunderstanding.
**Q6:** How does Resolve improve UX compared to loading in ngOnInit?

### Day 7 — Application
**Q7:** Build a guard that checks subscription tier and shows an upgrade page.
**Q8:** Do multiple CanActivate guards run in series or parallel?
**Q9:** How do you test a guard that depends on an authenticated service?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every route guard type and give a real-world use case for each."
**Q11:** Draw: router navigation state machine — all guard types in execution order.
**Q12:** ★ System design: "Design a permission system for an Angular SPA with 10 roles and 50+ route-level permissions."`
  },

  // ── 16. rxjs-in-angular ──────────────────────────────────────────────────
  'rxjs-in-angular': {
    feynman: `## FEYNMAN CHECK

### Explain RxJS in Angular Like I'm 10 Years Old
> RxJS is Angular's built-in reactive library — it models async events as STREAMS that you can transform with operators. Imagine a water pipe: the source (Observable) produces values over time; operators (map, filter, switchMap, debounceTime) transform them; subscribe consumes them. Angular uses RxJS for: HTTP responses (HttpClient returns Observables), routing events (Router.events), form value changes (form.valueChanges), custom event buses, and reactive state patterns. The non-obvious depth: operators are LAZY — nothing happens until subscribe(). switchMap is the most important operator for Angular — it cancels the previous inner Observable when a new source value arrives (perfect for search-as-you-type where you want to discard stale API results).

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between Subject, BehaviorSubject, and ReplaySubject?**
> **A:** Subject is a plain multicast Observable — new subscribers only get FUTURE values. BehaviorSubject holds the CURRENT value and immediately emits it to new subscribers — essential for state management where late subscribers need the current state. ReplaySubject buffers N past values and replays them to new subscribers — useful for event logs or action streams where late subscribers need history. All three are both Observable (you can subscribe) AND Observer (you can call next/error/complete) — they bridge imperative code to reactive streams.

**Q2: Mental model for the "Higher-Order Observable" operators?**
> **A:** switchMap, mergeMap, concatMap, exhaustMap take each value from a source and MAP it to a new inner Observable. The difference is how they handle CONCURRENT inner Observables: switchMap CANCELS the previous inner when a new source value arrives (good for: search, autocomplete — discard stale results). mergeMap runs all inner Observables CONCURRENTLY (good for: parallel file downloads). concatMap queues inner Observables, running ONE AT A TIME in order (good for: sequential saves). exhaustMap IGNORES new source values while inner is active (good for: login button — ignore double-clicks).

**Q3: Most dangerous misconception about RxJS in Angular?**
> **A:** You need to unsubscribe from ALL observables:
> \`\`\`typescript
> // Observables that complete automatically (NO unsubscribe needed):
> this.http.get('/api/users')       // completes after response
> of(1, 2, 3)                       // completes immediately
> timer(1000)                       // completes after one emission
> this.route.paramMap               // completes when component destroyed (router managed)
>
> // Observables that NEVER complete (MUST unsubscribe or use takeUntilDestroyed):
> interval(1000)                    // infinite timer
> fromEvent(document, 'click')      // DOM events
> this.store.select(mySelector)     // NgRx selectors
> new BehaviorSubject(0)            // manual subjects
> webSocket('ws://localhost')       // websocket streams
> \`\`\`

**Q4: How do you compose multiple HTTP calls with RxJS?**
> **A:** forkJoin([obs1, obs2, obs3]) runs all in PARALLEL, emits when ALL complete — like Promise.all. combineLatest([obs1, obs2]) emits whenever ANY source emits, with latest values from each — good for combining filter + pagination + search. switchMap is used for SEQUENTIAL calls where the first response determines the second: first get the user, then get their orders: getUser(id).pipe(switchMap(user => getOrders(user.teamId))). withLatestFrom snapshots the current value of a secondary stream without subscribing to it.

**Q5: FAANG-grade definition of RxJS in Angular.**
> **A:** "RxJS (Reactive Extensions for JavaScript) is Angular's core reactive library — modelling asynchronous values as lazy Observable streams with first-class composability via operators (map, filter, switchMap, mergeMap, concatMap, exhaustMap, debounceTime, distinctUntilChanged, catchError, retry, shareReplay) — with Subjects (plain, Behavior, Replay, Async) bridging imperative and reactive code — and Angular integrating RxJS throughout: HttpClient, Router events, FormControl.valueChanges, EventEmitter internals, and async pipe — with takeUntilDestroyed/DestroyRef for lifecycle-aware subscription management."`,

    build: `## BUILD

### 🏗️ Mini Project: Search-As-You-Type With switchMap, debounce, and distinctUntilChanged

**What you will build:** A search input that debounces keystrokes, cancels in-flight requests with switchMap, shows loading state, and handles errors — the canonical Angular reactive pattern.
**Why this project:** Forces the most important RxJS operators for Angular UI patterns.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new rxjs-angular-demo --standalone --routing false
cd rxjs-angular-demo
ng generate component search --standalone
\`\`\`

#### Step 2 — Search Component
\`\`\`typescript
// search.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

interface User { id: number; name: string; email: string; }

@Component({
  standalone: true,
  selector: 'app-search',
  imports: [ReactiveFormsModule, NgFor, NgIf],
  template: \`
    <input [formControl]="searchControl" placeholder="Search users...">
    <p *ngIf="isLoading()">Searching...</p>
    <p *ngIf="error()">Error: {{ error() }}</p>
    <ul>
      <li *ngFor="let user of results()">{{ user.name }} ({{ user.email }})</li>
    </ul>
    <p *ngIf="!isLoading() && results().length === 0 && searchControl.value">
      No results for "{{ searchControl.value }}"
    </p>
  \`,
})
export class SearchComponent {
  private http = inject(HttpClient);
  searchControl = new FormControl('');
  results = signal<User[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),            // wait 300ms after last keystroke
      distinctUntilChanged(),       // skip if same value
      tap(() => { this.isLoading.set(true); this.error.set(null); }),
      switchMap(query => {          // cancel previous request on new keystroke
        if (!query?.trim()) return of([]);
        return this.http.get<User[]>('https://jsonplaceholder.typicode.com/users').pipe(
          // Client-side filter for demo — real app would pass query to server
          catchError(err => { this.error.set(err.message); return of([]); }),
        );
      }),
      tap(() => this.isLoading.set(false)),
    ).subscribe(results => {
      const q = this.searchControl.value?.toLowerCase() ?? '';
      this.results.set(results.filter(u => u.name.toLowerCase().includes(q)));
    });
  }
}
\`\`\`

#### Step 3 — Combining Multiple Streams
\`\`\`typescript
// Advanced: combine search + filter + pagination
import { combineLatest, BehaviorSubject } from 'rxjs';

export class AdvancedSearchComponent {
  private search$ = new BehaviorSubject('');
  private filter$ = new BehaviorSubject<'all' | 'active'>('all');
  private page$ = new BehaviorSubject(0);

  results$ = combineLatest([this.search$, this.filter$, this.page$]).pipe(
    debounceTime(100),
    switchMap(([query, filter, page]) =>
      this.http.get('/api/users', { params: { query, filter, page: page.toString() } })
    ),
  );

  setSearch(q: string) { this.search$.next(q); this.page$.next(0); }
  setFilter(f: 'all' | 'active') { this.filter$.next(f); this.page$.next(0); }
  nextPage() { this.page$.next(this.page$.value + 1); }
}
\`\`\`

#### Step 4 — Error Handling: catchError and retry
\`\`\`typescript
import { catchError, retry, throwError } from 'rxjs';

const resilientSearch$ = this.http.get('/api/search').pipe(
  retry({ count: 2, delay: 1000 }),
  catchError(err => {
    if (err.status === 0) return throwError(() => new Error('Network offline'));
    if (err.status === 429) return throwError(() => new Error('Rate limited'));
    return throwError(() => err);  // re-throw unknown errors
  }),
);
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
it('debounces search input', fakeAsync(() => {
  const fixture = TestBed.createComponent(SearchComponent);
  const control = fixture.componentInstance.searchControl;
  const httpMock = TestBed.inject(HttpTestingController);

  control.setValue('a');
  control.setValue('an');
  control.setValue('ang');
  // No HTTP request yet — debouncing
  httpMock.expectNone('/api/users');
  tick(300);
  // Now the HTTP request fires
  httpMock.expectOne('https://jsonplaceholder.typicode.com/users').flush([]);
}));
\`\`\`

**Expected Output:**
\`\`\`
Type "Ang" -> debounce 300ms -> HTTP request fires
Clear input -> cancel previous request, show empty
HTTP error -> error message shown
\`\`\`

**Stretch Challenges:**
- [ ] Add virtualisation: only show 10 results with a "load more" button
- [ ] Add an autocomplete dropdown using CDK Overlay
- [ ] Replace the search with a signals-based approach and compare code`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between Subject, BehaviorSubject, and ReplaySubject?
**Q2:** What does switchMap do that mergeMap does not?
**Q3:** Write a search-as-you-type with debounce. From memory.

### Day 3 — Comprehension
**Q4:** When would you use exhaustMap instead of switchMap?
**Q5:** A junior uses mergeMap for search-as-you-type — explain the race condition.
**Q6:** What observable in Angular never needs to be unsubscribed?

### Day 7 — Application
**Q7:** Build a polling interval that stops when the component is destroyed.
**Q8:** A PR uses forkJoin for 3 HTTP calls where some may fail — explain the issue.
**Q9:** What is shareReplay and when should you use it with HTTP calls?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through switchMap, mergeMap, concatMap, exhaustMap — give a real Angular use case for each."
**Q11:** Draw: marble diagram for switchMap with 3 rapid source emissions.
**Q12:** ★ System design: "Design a real-time dashboard with WebSocket data, combining it with REST API state using RxJS."`
  },

  // ── 17. rxjs-advanced ────────────────────────────────────────────────────
  'rxjs-advanced': {
    feynman: `## FEYNMAN CHECK

### Explain Advanced RxJS Like I'm 10 Years Old
> Once you know the basic operators, the advanced patterns are about: (1) SHARING — shareReplay(1) multicasts an Observable to many subscribers while caching the last value (use for HTTP calls shared across components). (2) ERROR HANDLING — catchError returns a fallback, retryWhen implements custom retry logic with exponential backoff. (3) CUSTOM OPERATORS — pipe() lets you compose operators into a named, reusable function. (4) SCHEDULERS — control the timing/execution context of operators (observeOn(asyncScheduler) defers to microtask queue). (5) MARBLE TESTING — TestScheduler lets you test time-based operators without actually waiting. The non-obvious depth: RxJS operators are CURRIED HIGHER-ORDER FUNCTIONS that return operator functions — you can compose them programmatically, creating custom operators with the same interface as built-ins.

---

### 5 Deep Conceptual Questions

**Q1: When and why does shareReplay matter?**
> **A:** Without shareReplay, each subscriber to an HTTP Observable triggers a NEW network request. shareReplay(1) multicasts the single request to all subscribers and replays the last value to late subscribers. This is the standard pattern for cached HTTP calls shared across multiple components: const users$ = this.http.get('/api/users').pipe(shareReplay(1)). With { refCount: false }, the subscription persists even when all consumers unsubscribe (permanent cache). With { refCount: true }, it re-subscribes when the first new subscriber arrives after all previous ones leave (re-fetches).

**Q2: Mental model for custom operators?**
> **A:** A custom operator is a function that takes an Observable and returns an Observable — exactly what pipe() chains together. Pattern: export function retryWithBackoff(maxRetries: number, delay: number) { return (source: Observable<T>) => source.pipe(retryWhen(errors => errors.pipe(scan((count, err) => ...), delay(...)))) }. Use it like any built-in: http.get().pipe(retryWithBackoff(3, 500)). This is how libraries like ng-query, angular-query, and ngrx/effects compose reusable stream logic.

**Q3: Most dangerous misconception about advanced RxJS?**
> **A:** shareReplay always prevents duplicate HTTP calls:
> \`\`\`typescript
> // WRONG: shareReplay(1) with refCount:true can re-fetch
> const users$ = this.http.get('/api/users').pipe(shareReplay(1));
> // If all components unsubscribe (route change) then re-subscribe,
> // the Observable re-runs — making a new HTTP request!
>
> // CORRECT for permanent cache:
> const users$ = this.http.get('/api/users').pipe(shareReplay({ bufferSize: 1, refCount: false }));
>
> // CORRECT for cache that refreshes when all leave:
> const users$ = this.http.get('/api/users').pipe(shareReplay({ bufferSize: 1, refCount: true }));
> \`\`\`

**Q4: How do RxJS schedulers affect Angular change detection?**
> **A:** By default, Observables emit synchronously or in macrotask/microtask context. Zone.js patches these contexts to notify Angular's change detection. With observeOn(asyncScheduler) or subscribeOn(asapScheduler), you can control WHICH async context values emit in. In performance-critical scenarios (large data processing), running work on queueScheduler (synchronous batch) or observeOn(animationFrameScheduler) for smooth rendering can prevent Zone.js from triggering CD on every intermediate value — batch on a scheduler that fires once per frame.

**Q5: FAANG-grade definition of advanced RxJS patterns.**
> **A:** "Advanced RxJS encompasses multicasting (shareReplay with refCount for HTTP caching, multicast with Subjects), custom operators (factory functions returning (src: Observable) => Observable), error handling (catchError for recovery, retryWhen with exponential backoff, throwError for propagation), marble testing (TestScheduler for deterministic time-based operator testing), scheduler control (asyncScheduler, animationFrameScheduler, queueScheduler for execution context), and operator composition (pipe with custom operator factories) — all building on the lazy, composable, cancellable Observable primitive."`,

    build: `## BUILD

### 🏗️ Mini Project: Custom Operators Library — retryWithBackoff, debounceDistinct, pollUntil

**What you will build:** Three production-grade custom RxJS operators: (1) retryWithBackoff — retries with exponential backoff and max attempts, (2) debounceDistinct — debounce + distinctUntilChanged combined, (3) pollUntil — polls an endpoint until a condition is met.
**Why this project:** Forces custom operator composition and marble testing.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir rxjs-operators && cd rxjs-operators
npm init -y && npm install rxjs rxjs-marbles vitest
ni operators.ts, operators.spec.ts -ItemType File
\`\`\`

#### Step 2 — retryWithBackoff Operator
\`\`\`typescript
// operators.ts
import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, scan, mergeMap, debounceTime, distinctUntilChanged, switchMap, takeWhile } from 'rxjs/operators';

export function retryWithBackoff<T>(maxRetries: number, baseDelayMs: number) {
  return (source: Observable<T>): Observable<T> =>
    source.pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= maxRetries) throw error;  // exhaust retries
            return retryCount + 1;
          }, 0),
          mergeMap(retryCount => timer(baseDelayMs * Math.pow(2, retryCount - 1))),
        )
      ),
    );
}
\`\`\`

#### Step 3 — debounceDistinct Operator
\`\`\`typescript
export function debounceDistinct<T>(dueTime: number) {
  return (source: Observable<T>): Observable<T> =>
    source.pipe(
      debounceTime(dueTime),
      distinctUntilChanged(),
    );
}
\`\`\`

#### Step 4 — pollUntil Operator
\`\`\`typescript
import { interval } from 'rxjs';

export function pollUntil<T>(
  pollFn: () => Observable<T>,
  conditionFn: (val: T) => boolean,
  intervalMs: number,
) {
  return interval(intervalMs).pipe(
    switchMap(() => pollFn()),
    takeWhile(val => !conditionFn(val), true),  // true = emit the final value
  );
}

// Usage: poll job status until complete
const jobStatus$ = pollUntil(
  () => http.get('/api/job/123'),
  (job: any) => job.status === 'complete',
  2000,
);
\`\`\`

#### Step 5 — Tests With Marble Testing
\`\`\`typescript
// operators.spec.ts
import { TestScheduler } from 'rxjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';

describe('retryWithBackoff', () => {
  let scheduler: TestScheduler;
  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('succeeds after 2 retries', () => {
    scheduler.run(({ cold, expectObservable }) => {
      let attempt = 0;
      const source$ = cold('--#').pipe(
        mergeMap(() => ++attempt < 3 ? throwError(() => new Error('fail')) : of('success')),
      );
      // 3rd attempt succeeds
    });
  });
});

describe('debounceDistinct', () => {
  it('emits only after silence and only when value changes', () => {
    const scheduler = new TestScheduler((a, e) => expect(a).toEqual(e));
    scheduler.run(({ cold, hot, expectObservable }) => {
      const source$ = hot('a-b--b---c', { a: 'x', b: 'x', c: 'y' }).pipe(debounceDistinct(20));
      expectObservable(source$).toBe('-----x---y');
    });
  });
});
\`\`\`

**Expected Output:**
\`\`\`
retryWithBackoff: first 2 calls fail, 3rd succeeds with 100ms + 200ms delays
debounceDistinct: rapid same-value emissions collapsed
pollUntil: polls every 2s until job.status === 'complete'
Marble tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add a cacheFor(ms) operator that shares a replay for N milliseconds then expires
- [ ] Add a raceUntilTimeout(ms) operator that throws if source doesn't emit within ms
- [ ] Publish the operators as an npm package with full marble test suite`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does shareReplay(1) do and when is it useful?
**Q2:** Difference between shareReplay refCount:true vs false?
**Q3:** Write a custom operator that logs the value. From memory.

### Day 3 — Comprehension
**Q4:** A junior chains shareReplay on an HTTP call shared across 10 components — does it make 10 or 1 HTTP calls?
**Q5:** When would you use retryWhen vs retry?
**Q6:** What is marble testing and why is it valuable for time-based operators?

### Day 7 — Application
**Q7:** Build a cacheFor(ms) operator that replays for N ms then re-subscribes.
**Q8:** A PR uses forkJoin for polling — explain the issue.
**Q9:** What scheduler is right for batching 1000 synchronous updates without CD jank?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain multicasting in RxJS — Subject, share, shareReplay, publish, multicast."
**Q11:** Draw: marble diagram showing shareReplay(1) with 3 subscribers arriving at different times.
**Q12:** ★ System design: "Design a real-time collaborative editor's operation sync using RxJS — conflict resolution, ordering, reconnect."`
  },

  // ── 18. standalone-components ────────────────────────────────────────────
  'standalone-components': {
    feynman: `## FEYNMAN CHECK

### Explain Standalone Components Like I'm 10 Years Old
> Before Angular 14, every component, directive, and pipe HAD to be declared in an NgModule — a grouping mechanism that told Angular which pieces belong together. Standalone components (Angular 14+, default since Angular 17) skip this requirement: you add standalone: true to the decorator and declare your imports directly in the component. This makes components truly self-contained — you can see exactly what a component depends on by looking at its imports array, without hunting through NgModule declarations. The non-obvious depth: standalone components don't make NgModules obsolete immediately — many Angular libraries still use NgModules, and you import them into a standalone component's imports array as a whole module.

---

### 5 Deep Conceptual Questions

**Q1: What problem did NgModules solve and why are standalone components better?**
> **A:** NgModules were designed as compilation units — grouping components so the compiler could process them together. But they became a source of confusion: forgetting to declare a component in an NgModule gave cryptic errors; the "shared module" anti-pattern caused huge bundle sizes. Standalone components make each component a compilation unit itself — explicit imports make dependencies visible, lazy loading is per-component (not per-module), and there's no shared module problem because each component imports only what it needs.

**Q2: Mental model for the imports array in standalone components?**
> **A:** The imports array declares what the template can USE — other standalone components, directives, and pipes by reference; NgModules (like RouterModule, FormsModule) by module reference. Angular uses this to determine what selectors, directives, and pipes are available in the template at COMPILE TIME. Import too little and you get "unknown element" errors. Import too much and your bundle grows (tree-shaking removes unused standalone pieces, but not NgModule pieces). The goal: import exactly what the template uses.

**Q3: Most dangerous misconception about standalone components?**
> **A:** Standalone components eliminate all NgModule usage:
> \`\`\`typescript
> // WRONG: Library NgModules still need to be imported
> @Component({
>   standalone: true,
>   imports: [RouterLink],   // RouterLink is a standalone directive — import directly
>   template: '<a routerLink="/home">Home</a>',
> })
>
> // For library modules like MatButtonModule, you still import the module:
> @Component({
>   standalone: true,
>   imports: [MatButtonModule],   // Angular Material still ships as NgModule
>   template: '<button mat-button>Click</button>',
> })
>
> // Angular Material 16+ ships individual standalone directives:
> imports: [MatButton]   // direct component import instead of MatButtonModule
> \`\`\`

**Q4: How does bootstrapApplication differ from platformBrowserDynamic?**
> **A:** platformBrowserDynamic().bootstrapModule(AppModule) is the NgModule-based bootstrap — it expects an AppModule with BrowserModule. bootstrapApplication(AppComponent, { providers: [...] }) is the standalone bootstrap — no NgModule, you provide app-wide config via providers array using provideRouter(), provideHttpClient(), provideAnimations() etc. These provide functions replace BrowserModule's internal providers individually, giving finer control over what's included in the app bundle.

**Q5: FAANG-grade definition of standalone components.**
> **A:** "Angular standalone components (Angular 14+, default since 17) are components with standalone: true that declare their template dependencies via an explicit imports array — eliminating NgModule declaration requirements, enabling per-component compilation units, and allowing direct import of other standalone components/directives/pipes — with bootstrapApplication() and provideXxx() functions replacing the NgModule bootstrap pipeline — improving bundle size via more granular tree-shaking, improving code readability via co-located dependency declarations, and enabling progressive migration from NgModule-based architectures."`,

    build: `## BUILD

### 🏗️ Mini Project: Standalone Library — Three Reusable Components Published as a Package

**What you will build:** A small Angular standalone component library: ButtonComponent, BadgeComponent, and AlertComponent — each standalone, self-contained, properly exported, and consumed by a demo app without any NgModule.
**Why this project:** Forces proper standalone component design, export patterns, and consumption.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new standalone-lib-demo --standalone --routing false
cd standalone-lib-demo
ng generate component button --standalone --prefix lib
ng generate component badge --standalone --prefix lib
ng generate component alert --standalone --prefix lib
\`\`\`

#### Step 2 — Button Component
\`\`\`typescript
// lib-button/lib-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  standalone: true,
  selector: 'lib-button',
  imports: [NgClass],
  template: \`
    <button
      [ngClass]="['btn', 'btn-' + variant, size ? 'btn-' + size : '']"
      [disabled]="disabled"
      (click)="clicked.emit($event)">
      <ng-content/>
    </button>
  \`,
  styles: [\`
    .btn { padding: 8px 16px; border: none; cursor: pointer; border-radius: 4px; }
    .btn-primary { background: #007bff; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-sm { padding: 4px 8px; font-size: 12px; }
    .btn-lg { padding: 12px 24px; font-size: 18px; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
  \`],
})
export class LibButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<MouseEvent>();
}
\`\`\`

#### Step 3 — Alert Component With Dismiss
\`\`\`typescript
// lib-alert/lib-alert.component.ts
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'lib-alert',
  imports: [NgClass, NgIf],
  template: \`
    <div *ngIf="visible()" [ngClass]="['alert', 'alert-' + type]" role="alert">
      <strong *ngIf="title">{{ title }}</strong>
      <ng-content/>
      <button (click)="dismiss()" aria-label="Close">×</button>
    </div>
  \`,
})
export class LibAlertComponent {
  @Input() type: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Input() title = '';
  @Output() dismissed = new EventEmitter<void>();
  visible = signal(true);

  dismiss() { this.visible.set(false); this.dismissed.emit(); }
}
\`\`\`

#### Step 4 — Public API Export
\`\`\`typescript
// public-api.ts — single entry point for library consumers
export { LibButtonComponent } from './lib-button/lib-button.component';
export { LibAlertComponent } from './lib-alert/lib-alert.component';

// Usage in app (no NgModule needed):
// import { LibButtonComponent, LibAlertComponent } from './public-api';
// @Component({ imports: [LibButtonComponent, LibAlertComponent], ... })
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('LibButtonComponent', () => {
  it('emits clicked event', () => {
    const fixture = TestBed.createComponent(LibButtonComponent);
    const emits: MouseEvent[] = [];
    fixture.componentInstance.clicked.subscribe(e => emits.push(e));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(emits.length).toBe(1);
  });

  it('is disabled when disabled=true', () => {
    const fixture = TestBed.createComponent(LibButtonComponent);
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
LibButtonComponent: primary/danger styles, disabled state, click event
LibAlertComponent: info/success/warning/error styles, dismiss button
No NgModule anywhere
Tests: 2 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add LibModalComponent using Portal from Angular CDK
- [ ] Build a theme service that injects CSS custom properties into lib components
- [ ] Package as an actual npm library using ng-packagr`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does standalone: true change about a component?
**Q2:** What replaces BrowserModule in a standalone app?
**Q3:** Write a standalone component that uses RouterLink. From memory.

### Day 3 — Comprehension
**Q4:** When would you still import an NgModule into a standalone component?
**Q5:** A junior imports RouterModule instead of RouterLink in a standalone component — what's better?
**Q6:** How do you migrate an existing NgModule-based component to standalone?

### Day 7 — Application
**Q7:** Build a standalone dialog component that can be opened from any other component.
**Q8:** A PR uses a shared NgModule with 20 components — how does this hurt bundle size?
**Q9:** How does lazy loading work differently with standalone components vs NgModule routes?

### Day 14 — Synthesis
**Q10:** ★ Interview: "What are standalone components and what problems do they solve over NgModule-based components?"
**Q11:** Draw: compilation model — NgModule vs standalone component tree.
**Q12:** ★ System design: "Migrate a 100-component Angular 12 app to standalone components — plan, risks, rollout strategy."`
  },

  // ── 19. signals ──────────────────────────────────────────────────────────
  'signals': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Signals Like I'm 10 Years Old
> Signals are Angular's reactive primitive — a container that holds a value AND tracks who reads it. When you read a signal (signal()), Angular registers that component or computed as a DEPENDENT. When the signal's value changes via .set() or .update(), Angular AUTOMATICALLY re-renders all dependents — no Zone.js needed, no markForCheck(), no manual subscription. Think of a signal as a spreadsheet cell: when you change cell A1, all cells that reference it (B1, C1) automatically recalculate. The non-obvious depth: computed() creates a DERIVED signal — its value is recalculated lazily only when a dependency changes and the computed is READ. effect() runs a SIDE EFFECT whenever its signal dependencies change — use for logging, syncing to localStorage, triggering animations.

---

### 5 Deep Conceptual Questions

**Q1: What are the three signal primitives?**
> **A:** (1) signal(initialValue) — a writable container. Read with signal(); write with signal.set(val), signal.update(fn), signal.mutate(fn) (for objects). (2) computed(() => expr) — a read-only derived signal; lazily evaluated when read after dependencies change; memoised. (3) effect(() => { /* runs when deps change */ }) — a side effect tied to signal reads; runs after render; auto-cleans up when the owning context is destroyed. All three are SYNCHRONOUS — no Promises or Observables involved.

**Q2: Mental model for computed() memoisation?**
> **A:** computed() is LAZY + MEMOISED. If userCount and productCount haven't changed since the last read of totalCount = computed(() => userCount() + productCount()), Angular returns the CACHED value without recalculating. This makes computed() safe to use in templates — even if the template reads a computed 100 times per render cycle, the function runs at most ONCE per dependency change. This contrasts sharply with template method calls (doCalculation()) which run on EVERY change detection cycle.

**Q3: Most dangerous misconception about signals?**
> **A:** You can use effect() for component state updates:
> \`\`\`typescript
> // WRONG: setting another signal inside effect() causes infinite loops
> const a = signal(0);
> const b = signal(0);
>
> effect(() => {
>   b.set(a() * 2);  // reading a() makes effect depend on a
>   // Setting b in effect triggers the effect again if b is also read here
> });
>
> // CORRECT: use computed() for derived state
> const b = computed(() => a() * 2);
>
> // Use effect() only for SIDE EFFECTS: localStorage, logging, DOM libraries
> effect(() => {
>   localStorage.setItem('lastValue', JSON.stringify(a()));  // OK
> });
> \`\`\`

**Q4: How do signals interact with OnPush change detection?**
> **A:** With signals, Angular marks a component as dirty specifically when a signal it reads changes — this is MORE granular than OnPush (which marks dirty on any @Input reference change). A component reading 10 signals but only 1 changing gets a targeted dirty mark for just that component. Angular 17+ uses a "reactive graph" — the dependency graph built from signal reads — to determine the minimal set of components to re-render. This is the foundation for zoneless Angular: no Zone.js patching needed when all async state flows through signals.

**Q5: FAANG-grade definition of Angular signals.**
> **A:** "Angular signals (Angular 16+) are reactive primitives implementing the observer pattern at the framework level — signal() for writable state containers, computed() for memoised derived values (lazily recalculated when dependencies change and the value is read), and effect() for side effects tied to signal-dependency changes — enabling fine-grained, synchronous reactivity without Zone.js, compatible with OnPush change detection, and forming the foundation of zoneless Angular applications via a reactive dependency graph that marks only signal-reading components as dirty on state change."`,

    build: `## BUILD

### 🏗️ Mini Project: Signal-Based Shopping Cart — Full State Management With Computed, Effect

**What you will build:** A complete shopping cart using only Angular signals — signal() for items, computed() for totals and filtered views, effect() for localStorage persistence — no NgRx, no RxJS BehaviorSubject.
**Why this project:** Forces all three signal primitives in a realistic stateful app.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new signals-cart --standalone --routing false
cd signals-cart
ng generate service cart-store
ng generate component cart --standalone
\`\`\`

#### Step 2 — Cart Store Service
\`\`\`typescript
// cart-store.service.ts
import { Injectable, signal, computed, effect } from '@angular/core';

export interface CartItem { id: string; name: string; price: number; qty: number; }

@Injectable({ providedIn: 'root' })
export class CartStoreService {
  private _items = signal<CartItem[]>(this.loadFromStorage());

  // Public read-only view
  items = this._items.asReadonly();

  // Derived signals — computed lazily, memoised
  itemCount = computed(() => this._items().reduce((s, i) => s + i.qty, 0));
  subtotal  = computed(() => this._items().reduce((s, i) => s + i.price * i.qty, 0));
  tax       = computed(() => Math.round(this.subtotal() * 0.10 * 100) / 100);
  total     = computed(() => this.subtotal() + this.tax());
  isEmpty   = computed(() => this._items().length === 0);

  constructor() {
    // Side effect: persist to localStorage whenever items change
    effect(() => {
      localStorage.setItem('cart', JSON.stringify(this._items()));
    });
  }

  addItem(item: Omit<CartItem, 'qty'>) {
    this._items.update(items => {
      const existing = items.find(i => i.id === item.id);
      if (existing) return items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...items, { ...item, qty: 1 }];
    });
  }

  updateQty(id: string, qty: number) {
    if (qty <= 0) { this.removeItem(id); return; }
    this._items.update(items => items.map(i => i.id === id ? { ...i, qty } : i));
  }

  removeItem(id: string) {
    this._items.update(items => items.filter(i => i.id !== id));
  }

  clear() { this._items.set([]); }

  private loadFromStorage(): CartItem[] {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }
}
\`\`\`

#### Step 3 — Cart Component
\`\`\`typescript
// cart.component.ts
import { Component, inject } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { CartStoreService } from '../cart-store.service';

const PRODUCTS = [
  { id: 'p1', name: 'Angular T-Shirt', price: 29.99 },
  { id: 'p2', name: 'RxJS Hoodie', price: 49.99 },
  { id: 'p3', name: 'Signal Mug', price: 14.99 },
];

@Component({
  standalone: true,
  selector: 'app-cart',
  imports: [NgFor, NgIf, CurrencyPipe],
  template: \`
    <section>
      <h2>Products</h2>
      <div *ngFor="let p of products">
        {{ p.name }} — {{ p.price | currency }}
        <button (click)="cart.addItem(p)">Add to Cart</button>
      </div>
    </section>

    <section>
      <h2>Cart ({{ cart.itemCount() }} items)</h2>
      <p *ngIf="cart.isEmpty()">Cart is empty</p>
      <div *ngFor="let item of cart.items()">
        {{ item.name }} x
        <input type="number" [value]="item.qty"
               (change)="cart.updateQty(item.id, +$any($event.target).value)"
               min="0" style="width:50px">
        = {{ item.price * item.qty | currency }}
        <button (click)="cart.removeItem(item.id)">×</button>
      </div>
      <hr>
      <p>Subtotal: {{ cart.subtotal() | currency }}</p>
      <p>Tax (10%): {{ cart.tax() | currency }}</p>
      <strong>Total: {{ cart.total() | currency }}</strong>
      <button (click)="cart.clear()">Clear Cart</button>
    </section>
  \`,
})
export class CartComponent {
  cart = inject(CartStoreService);
  products = PRODUCTS;
}
\`\`\`

#### Step 4 — Error Handling: Immutable Signal Updates
\`\`\`typescript
// Always use update() with immutable transformations
// WRONG: direct mutation — signals won't detect this
cart._items().push({ id: 'x', name: 'X', price: 1, qty: 1 });

// CORRECT: update() creates new reference
cart._items.update(items => [...items, { id: 'x', name: 'X', price: 1, qty: 1 }]);
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('CartStoreService', () => {
  let service: CartStoreService;
  beforeEach(() => { TestBed.configureTestingModule({}); service = TestBed.inject(CartStoreService); service.clear(); });

  it('adds items and merges duplicates', () => {
    service.addItem({ id: '1', name: 'A', price: 10 });
    service.addItem({ id: '1', name: 'A', price: 10 });
    expect(service.items()[0].qty).toBe(2);
  });

  it('computes total correctly', () => {
    service.addItem({ id: '1', name: 'A', price: 100 });
    expect(service.subtotal()).toBe(100);
    expect(service.tax()).toBe(10);
    expect(service.total()).toBe(110);
  });

  it('isEmpty is true after clear', () => {
    service.addItem({ id: '1', name: 'A', price: 10 });
    service.clear();
    expect(service.isEmpty()).toBe(true);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Add Angular T-Shirt -> itemCount: 1, subtotal: 29.99, total: 32.99
Add Angular T-Shirt again -> qty: 2, total: 65.98
Clear -> cart empty
Refresh page -> cart restored from localStorage (effect persisted)
Tests: 3 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add a coupon code signal with computed discount
- [ ] Add toObservable(cartService.items) and pipe it through RxJS for analytics
- [ ] Enable zoneless change detection and measure load time improvement`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three signal primitives in Angular.
**Q2:** When should you use effect() vs computed()?
**Q3:** Write a signal with update(). From memory.

### Day 3 — Comprehension
**Q4:** Why should you not set another signal inside effect()?
**Q5:** How is computed() different from a template method call?
**Q6:** Refactor to signals:
\`\`\`typescript
count = 0;
increment() { this.count++; }
double() { return this.count * 2; }
\`\`\`

### Day 7 — Application
**Q7:** Build a form with signal-based validation — required fields, error messages, disabled submit.
**Q8:** A PR uses ngOnInit + subscribe to populate component state — refactor to signals.
**Q9:** How do signals relate to OnPush change detection?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Angular signals — how computed() works, when to use effect(), and how they enable zoneless apps."
**Q11:** Draw: reactive graph — signal reads, computed dependencies, component dirty marking.
**Q12:** ★ System design: "Migrate an NgRx-based app to signals state management — when is NgRx still better, when can you use signals?"`
  },

  // ── 20. state-management-signals ─────────────────────────────────────────
  'state-management-signals': {
    feynman: `## FEYNMAN CHECK

### Explain Signals State Management Like I'm 10 Years Old
> Signals-based state management is Angular's alternative to NgRx for apps that don't need the full Redux overhead. Instead of actions/reducers/selectors, you create a SERVICE with signals: signal() for raw state, computed() for derived state, and methods that call .set()/.update() to transition state. Multiple components inject the same service — because it is providedIn: 'root', they all share the SAME signal instances. When one component updates a signal, ALL components that read it automatically re-render. The non-obvious depth: you can compose multiple signal services (AuthStore, CartStore, UIStore) using computed() to derive cross-store computed values — like computed(() => cartStore.items().filter(i => productStore.getById(i.id).inStock)).

---

### 5 Deep Conceptual Questions

**Q1: When should you use NgRx vs signals state management?**
> **A:** Choose NGRX when: you need Redux DevTools time-travel debugging, you have complex reducer logic across many actions, you need action/effect traceability for auditing, you have a very large team with strict state discipline, or you need the Effects system for complex async flows. Choose SIGNALS when: the app is medium complexity, you want simpler code, components need shared state without the ceremony, or you're building a new app without legacy NgRx. Signals handle 80% of state management needs with 20% of the code. NgRx's real advantage is AUDITABILITY and TOOLING, not capability.

**Q2: Mental model for SignalStore (NgRx SignalStore)?**
> **A:** NgRx 17+ ships SignalStore — a hybrid that uses signals internally but adds NgRx patterns: withState() for initial state, withComputed() for derived signals, withMethods() for state transitions, withHooks() for lifecycle. It gives you the signals reactivity without building your own store from scratch, while preserving ability to use Effects for complex async. The output is an Angular service using signals under the hood — injectable, reactive, and compatible with DevTools.

**Q3: Most dangerous misconception about signals state management?**
> **A:** Signals automatically handle async state (loading, error, data):
> \`\`\`typescript
> // WRONG: this is incomplete — no loading/error state
> @Injectable({ providedIn: 'root' })
> export class UserStore {
>   users = signal<User[]>([]);
>   loadUsers() {
>     this.http.get('/api/users').subscribe(users => this.users.set(users));
>   }
> }
>
> // CORRECT: always model the full async state shape
> interface AsyncState<T> { data: T | null; loading: boolean; error: string | null; }
> users = signal<AsyncState<User[]>>({ data: null, loading: false, error: null });
>
> loadUsers() {
>   this.users.update(s => ({ ...s, loading: true, error: null }));
>   this.http.get<User[]>('/api/users').subscribe({
>     next: data => this.users.set({ data, loading: false, error: null }),
>     error: err => this.users.update(s => ({ ...s, loading: false, error: err.message })),
>   });
> }
> \`\`\`

**Q4: How do you handle optimistic updates with signals?**
> **A:** Optimistic update pattern: (1) Immediately update the local signal (fast UI). (2) Call the API. (3) On success: replace with server-confirmed state. (4) On error: revert to pre-update state. With signals: const previous = this.items(); items.update(items => [...items, newItem]); http.post().subscribe({ error: () => this.items.set(previous) }). This gives instant UI feedback while being resilient to server failures.

**Q5: FAANG-grade definition of signals state management.**
> **A:** "Angular signals-based state management uses injectable services with signal() primitives for mutable state, computed() for derived state, and effect() for side effects — providing shared reactive state across components without NgRx ceremony — with the full async state shape (data, loading, error) modelled explicitly, optimistic updates via state snapshotting and rollback, cross-store computed values via computed() reading multiple service signals, and NgRx SignalStore (Angular 17+) providing a structured, tooling-compatible signals state store for larger applications."`,

    build: `## BUILD

### 🏗️ Mini Project: Multi-Store Signals App — Auth + Products + UI Stores

**What you will build:** Three signal stores: AuthStore (user session), ProductStore (product list with async loading), UIStore (theme, sidebar state) — with cross-store computed values and effect() for localStorage persistence.
**Why this project:** Forces multi-store composition, async state modelling, and cross-store computed values.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new signals-stores --standalone --routing false
cd signals-stores
ng generate service stores/auth-store
ng generate service stores/product-store
ng generate service stores/ui-store
\`\`\`

#### Step 2 — Auth Store
\`\`\`typescript
// auth-store.service.ts
import { Injectable, signal, computed, effect } from '@angular/core';

export interface User { id: string; name: string; role: 'admin' | 'user'; email: string; }

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _user = signal<User | null>(null);
  private _loading = signal(false);

  user = this._user.asReadonly();
  isLoggedIn = computed(() => this._user() !== null);
  isAdmin = computed(() => this._user()?.role === 'admin');
  loading = this._loading.asReadonly();

  constructor() {
    effect(() => {
      const user = this._user();
      if (user) localStorage.setItem('user', JSON.stringify(user));
      else localStorage.removeItem('user');
    });
    const saved = localStorage.getItem('user');
    if (saved) this._user.set(JSON.parse(saved));
  }

  login(email: string, password: string): Promise<void> {
    this._loading.set(true);
    return new Promise(resolve => setTimeout(() => {
      this._user.set({ id: '1', name: 'Ana Dev', role: 'admin', email });
      this._loading.set(false);
      resolve();
    }, 500));
  }

  logout() { this._user.set(null); }
}
\`\`\`

#### Step 3 — Product Store With Full Async State
\`\`\`typescript
// product-store.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Product { id: number; title: string; price: number; category: string; }
interface AsyncState<T> { data: T | null; loading: boolean; error: string | null; }

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private http = inject(HttpClient);
  private state = signal<AsyncState<Product[]>>({ data: null, loading: false, error: null });

  products   = computed(() => this.state().data ?? []);
  isLoading  = computed(() => this.state().loading);
  error      = computed(() => this.state().error);
  hasProducts= computed(() => this.products().length > 0);

  categories = computed(() => [...new Set(this.products().map(p => p.category))]);

  load() {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.http.get<Product[]>('https://fakestoreapi.com/products').subscribe({
      next: data => this.state.set({ data, loading: false, error: null }),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  getByCategory(cat: string) {
    return computed(() => this.products().filter(p => p.category === cat));
  }
}
\`\`\`

#### Step 4 — Cross-Store Computed
\`\`\`typescript
// app.component.ts — reads from multiple stores
import { Component, inject, computed } from '@angular/core';
import { AuthStore } from './stores/auth-store.service';
import { ProductStore } from './stores/product-store.service';

@Component({
  standalone: true,
  template: \`
    @if (!auth.isLoggedIn()) {
      <button (click)="auth.login('a@b.com', 'pass')">Login</button>
    } @else {
      <p>Welcome {{ auth.user()?.name }}</p>
      <p>Role: {{ auth.user()?.role }}</p>
      @if (auth.isAdmin()) { <p>Admin products: {{ adminProductCount() }}</p> }
      @if (productStore.isLoading()) { <p>Loading...</p> }
      @for (p of productStore.products(); track p.id) { <p>{{ p.title }}</p> }
    }
  \`,
})
export class AppComponent {
  auth = inject(AuthStore);
  productStore = inject(ProductStore);

  // Cross-store computed — derived from both stores
  adminProductCount = computed(() =>
    this.auth.isAdmin() ? this.productStore.products().length : 0
  );

  ngOnInit() { this.productStore.load(); }
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('AuthStore', () => {
  let store: AuthStore;
  beforeEach(() => { TestBed.configureTestingModule({}); store = TestBed.inject(AuthStore); store.logout(); });

  it('is not logged in initially', () => { expect(store.isLoggedIn()).toBe(false); });

  it('logs in and sets user', async () => {
    await store.login('test@a.com', 'pass');
    expect(store.isLoggedIn()).toBe(true);
    expect(store.user()?.email).toBe('test@a.com');
  });

  it('isAdmin reflects user role', async () => {
    await store.login('test@a.com', 'pass');
    expect(store.isAdmin()).toBe(true);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Before login: not logged in state
Login -> user signal set, isLoggedIn true, isAdmin computed
Load products -> loading: true, then products list
Admin sees product count cross-store computed
Refresh page -> auth state restored from localStorage
Tests: 3 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add NgRx SignalStore for the ProductStore
- [ ] Add DevTools instrumentation using @angular/devtools
- [ ] Compare bundle size: NgRx full vs signals stores for the same feature`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** When should you use NgRx vs signals state management?
**Q2:** What is the correct shape for async state (loading/error/data)?
**Q3:** Write a signal store for a counter. From memory.

### Day 3 — Comprehension
**Q4:** How do you compose state from two different services using signals?
**Q5:** A junior's signal store doesn't model loading state — what breaks?
**Q6:** How do optimistic updates work with signals?

### Day 7 — Application
**Q7:** Build a notifications store with a list of messages and dismiss functionality.
**Q8:** A PR reads a signal in effect() and also sets a signal — explain the risk.
**Q9:** What is NgRx SignalStore and when would you choose it over a plain service?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Compare NgRx and signals state management — what does each excel at?"
**Q11:** Draw: reactive data flow for a signals-based app — store, computed, component, DOM.
**Q12:** ★ System design: "Design state architecture for a 50-feature Angular SPA — which state goes in signals, which needs NgRx?"`
  },

  // ── 21. state-management-ngrx ────────────────────────────────────────────
  'state-management-ngrx': {
    feynman: `## FEYNMAN CHECK

### Explain NgRx Like I'm 10 Years Old
> NgRx brings Redux to Angular: ALL application state lives in a single immutable STORE (a JavaScript object). To change state, you dispatch an ACTION (a plain object describing what happened: { type: '[Cart] Add Item', item: {...} }). REDUCERS are pure functions that take the current state + action and return the NEW state. EFFECTS handle ASYNC operations — they listen for specific actions, call APIs, and dispatch success/failure actions. SELECTORS are memoised functions that compute derived state from the store. The non-obvious value: because every state change flows through an action, you get COMPLETE TRACEABILITY — you can replay, time-travel debug, or log every state transition. This is why financial systems, audit logs, and large enterprise apps use NgRx.

---

### 5 Deep Conceptual Questions

**Q1: What are the benefits of the Redux pattern at scale?**
> **A:** (1) PREDICTABILITY — state can only change through reducers, no hidden mutations. (2) TRACEABILITY — every state change is an action with a type string, loggable and replayable. (3) TIME-TRAVEL DEBUGGING — Redux DevTools lets you step backwards through state history. (4) TESTING — reducers are pure functions (trivially unit-testable), effects are Observables (marble-testable). (5) COLLABORATION — large teams can work on different feature state slices without interference. The cost: boilerplate, indirection, and learning curve.

**Q2: Mental model for Effects?**
> **A:** An Effect is an Observable that listens to the action stream (Actions), filters for specific action types (ofType()), performs async work (switchMap/mergeMap to HTTP), and dispatches new actions with the result. The canonical pattern: loadUsers$ = createEffect(() => this.actions$.pipe(ofType(UserActions.load), switchMap(() => this.http.get('/api/users').pipe(map(users => UserActions.loadSuccess({ users })), catchError(err => of(UserActions.loadFailure({ error: err.message }))))))) . Effects are the "async middleware" of NgRx — they keep reducers pure by handling all side effects.

**Q3: Most dangerous misconception about NgRx?**
> **A:** The store is the single source of truth for everything:
> \`\`\`typescript
> // WRONG: putting UI state in the store
> // This creates unnecessary boilerplate for trivial UI state
> interface AppState {
>   isMenuOpen: boolean;     // just use component signal/property
>   isDropdownOpen: boolean; // just use component signal/property
>   searchInputValue: string;// just use a FormControl
> }
>
> // CORRECT: only shared, serializable, replayable state in NgRx
> interface AppState {
>   currentUser: User | null;
>   products: Product[];
>   cart: CartItem[];
>   // NOT: modal visibility, form field values, tooltip hover state
> }
>
> // Rule: NgRx for domain state that MATTERS for business logic
> // Signals/services for UI state that is ephemeral
> \`\`\`

**Q4: How do feature states and lazy loading work in NgRx?**
> **A:** NgRx supports FEATURE STATE — each lazy-loaded route registers its own slice of the store when the route loads. The route's providers array includes provideState(featureReducer). This means the Admin feature's state doesn't exist in the store until the user navigates to /admin. Feature states are tree-shakeable — users who never visit admin never download or initialise that state. Selectors use createFeatureSelector to access the feature slice, maintaining type safety.

**Q5: FAANG-grade definition of NgRx.**
> **A:** "NgRx is Angular's Redux implementation — providing a single immutable state store (Store) updated only through pure reducer functions (createReducer/on), with action creator factories (createAction) as the event bus, Effects for async side-effect handling via RxJS Observable chains (ofType, switchMap, catchError), and memoised selectors (createSelector, createFeatureSelector) for derived state computation — supporting lazy feature state registration, Redux DevTools integration for time-travel debugging, and SignalStore for a signals-native alternative — appropriate for large apps requiring auditability, testability, and team-scale state discipline."`,

    build: `## BUILD

### 🏗️ Mini Project: NgRx Products Feature — Actions, Reducer, Selectors, Effects

**What you will build:** A complete NgRx feature for a products list: createAction for CRUD actions, createReducer with on() for state transitions, createSelector for derived state, and createEffect for HTTP loading — the standard NgRx feature pattern.
**Why this project:** Forces every NgRx concept in context — the complete state management lifecycle.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new ngrx-demo --standalone --routing
cd ngrx-demo
npm install @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools
ng generate feature products --module app --creators
\`\`\`

#### Step 2 — Actions
\`\`\`typescript
// products.actions.ts
import { createAction, props } from '@ngrx/store';
export interface Product { id: number; title: string; price: number; }

export const ProductActions = {
  load: createAction('[Products] Load'),
  loadSuccess: createAction('[Products] Load Success', props<{ products: Product[] }>()),
  loadFailure: createAction('[Products] Load Failure', props<{ error: string }>()),
  add: createAction('[Products] Add', props<{ product: Product }>()),
  remove: createAction('[Products] Remove', props<{ id: number }>()),
};
\`\`\`

#### Step 3 — Reducer
\`\`\`typescript
// products.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { EntityAdapter, EntityState, createEntityAdapter } from '@ngrx/entity';
import { ProductActions, Product } from './products.actions';

export interface ProductsState extends EntityState<Product> {
  loading: boolean;
  error: string | null;
}

const adapter: EntityAdapter<Product> = createEntityAdapter<Product>();
const initialState: ProductsState = adapter.getInitialState({ loading: false, error: null });

export const productsReducer = createReducer(
  initialState,
  on(ProductActions.load, state => ({ ...state, loading: true, error: null })),
  on(ProductActions.loadSuccess, (state, { products }) =>
    adapter.setAll(products, { ...state, loading: false })),
  on(ProductActions.loadFailure, (state, { error }) =>
    ({ ...state, loading: false, error })),
  on(ProductActions.add, (state, { product }) => adapter.addOne(product, state)),
  on(ProductActions.remove, (state, { id }) => adapter.removeOne(id, state)),
);

export const { selectAll, selectTotal } = adapter.getSelectors();
\`\`\`

#### Step 4 — Selectors and Effects
\`\`\`typescript
// products.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductsState, selectAll } from './products.reducer';

const selectProductsState = createFeatureSelector<ProductsState>('products');
export const selectAllProducts = createSelector(selectProductsState, selectAll);
export const selectLoading = createSelector(selectProductsState, s => s.loading);
export const selectError = createSelector(selectProductsState, s => s.error);
export const selectCount = createSelector(selectAllProducts, p => p.length);
export const selectExpensive = createSelector(selectAllProducts, p => p.filter(x => x.price > 50));

// products.effects.ts
import { Injectable, inject } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductActions, Product } from './products.actions';

@Injectable()
export class ProductEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.load),
      switchMap(() =>
        this.http.get<Product[]>('https://fakestoreapi.com/products').pipe(
          map(products => ProductActions.loadSuccess({ products })),
          catchError(err => of(ProductActions.loadFailure({ error: err.message }))),
        )
      ),
    )
  );
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('productsReducer', () => {
  it('sets loading on load action', () => {
    const state = productsReducer(undefined, ProductActions.load());
    expect(state.loading).toBe(true);
  });
  it('stores products on loadSuccess', () => {
    const products = [{ id: 1, title: 'A', price: 10 }];
    const state = productsReducer(undefined, ProductActions.loadSuccess({ products }));
    expect(state.ids.length).toBe(1);
    expect(state.loading).toBe(false);
  });
  it('stores error on loadFailure', () => {
    const state = productsReducer(undefined, ProductActions.loadFailure({ error: 'Network error' }));
    expect(state.error).toBe('Network error');
    expect(state.loading).toBe(false);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
dispatch(load) -> loading: true
Effect calls API -> dispatch(loadSuccess) -> products in store
dispatch(remove, id) -> product removed from EntityAdapter
Selectors: selectExpensive filters products over $50
Tests: 3 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add NgRx SignalStore version and compare boilerplate
- [ ] Add optimistic updates for add/remove with rollback on failure
- [ ] Add ReduxDevTools and time-travel through state changes`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Four building blocks of NgRx.
**Q2:** What is the difference between a reducer and an effect?
**Q3:** Write an NgRx action with props. From memory.

### Day 3 — Comprehension
**Q4:** What state should NOT be in the NgRx store?
**Q5:** A junior puts every component's local UI state in NgRx — explain the problem.
**Q6:** What is EntityAdapter and what does it give you?

### Day 7 — Application
**Q7:** Build a complete NgRx feature: actions, reducer, selectors, and effect for a cart.
**Q8:** A PR uses exhaustMap in an Effect for a paginated list load — explain the problem.
**Q9:** How do feature states work with lazy-loaded routes?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through the Redux pattern in Angular NgRx — data flow from dispatch to UI update."
**Q11:** Draw: NgRx data flow — component dispatch, reducer, store, selector, component re-render.
**Q12:** ★ System design: "Design state management for a real-time collaborative document editor — NgRx with WebSocket effects."`
  },

  // ── 22. lazy-loading-angular ─────────────────────────────────────────────
  'lazy-loading-angular': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Lazy Loading Like I'm 10 Years Old
> Lazy loading means Angular only DOWNLOADS the JavaScript for a feature when the user actually navigates to it — not on initial page load. { path: 'admin', loadComponent: () => import('./admin').then(m => m.AdminComponent) } tells the browser: "When the user goes to /admin, download admin.js then show AdminComponent." This improves initial load time because the browser downloads less JavaScript upfront. The non-obvious depth: Angular's build system (webpack/esbuild) splits your code into CHUNKS at build time — each lazy-loaded route becomes a separate .js file. The size of your initial chunk is what determines Time To Interactive, so lazy-loading infrequently-visited features directly reduces your key performance metric.

---

### 5 Deep Conceptual Questions

**Q1: How does Angular's code splitting work at the build level?**
> **A:** Angular CLI with esbuild analyses the import() calls in route definitions. Each dynamic import() becomes a SPLIT POINT — esbuild creates a separate JavaScript chunk containing that component and its unique dependencies. Shared dependencies (Angular core, common libraries) are placed in separate vendor chunks and cached by the browser separately. The result: main bundle contains only what's needed for the initial route, with additional chunks loaded on demand. ng build --stats-json lets you see exact chunk sizes.

**Q2: Mental model for loadComponent vs loadChildren?**
> **A:** loadComponent: () => import('./comp').then(m => m.SomeComponent) lazy-loads a SINGLE standalone component. loadChildren: () => import('./routes').then(m => m.FEATURE_ROUTES) lazy-loads a ROUTES ARRAY — an entire feature area with multiple sub-routes. Use loadComponent for a single standalone view; use loadChildren for a feature module with its own routing hierarchy (sub-routes, nested navigation, feature state).

**Q3: Most dangerous misconception about lazy loading?**
> **A:** More lazy routes = faster app:
> \`\`\`typescript
> // WRONG: 50 tiny lazy routes = 50 separate HTTP requests on first navigation
> { path: 'a', loadComponent: () => import('./a') },  // 2KB chunk
> { path: 'b', loadComponent: () => import('./b') },  // 2KB chunk
> // ... 50 more, all tiny, all requiring separate network roundtrips
>
> // CORRECT: group related features into one lazy chunk
> { path: 'settings', loadChildren: () => import('./settings/routes') }
> // settings/routes includes profile, security, notifications, billing
> // One 30KB chunk download covers the entire settings area
>
> // Rule: lazy-load FEATURE AREAS (5-10+ components), not individual tiny components
> \`\`\`

**Q4: How does Angular's @defer differ from route-based lazy loading?**
> **A:** @defer (Angular 17+) lazy-loads components at the TEMPLATE level, not route level. @defer (when isVisible) { <app-heavy-chart/> } delays downloading and rendering the component until a condition (viewport visibility, user interaction, timer). Route-based lazy loading downloads the chunk on navigation. @defer downloads the chunk when the template condition triggers — enabling lazy loading of components WITHIN a page, not just at route boundaries.

**Q5: FAANG-grade definition of Angular lazy loading.**
> **A:** "Angular lazy loading splits the application bundle at route boundaries via dynamic import() in loadComponent/loadChildren route configuration — webpack/esbuild creating separate JS chunks per split point — with preloading strategies (PreloadAllModules, QuicklinkStrategy) for background prefetching of likely-next-visited chunks — @defer enabling template-level on-demand component loading within a page — and feature state lazy registration (NgRx provideState) co-locating feature bundle + state initialisation — all reducing the initial bundle size to only what's needed for Time To Interactive."`,

    build: `## BUILD

### 🏗️ Mini Project: Lazy-Loaded Feature App With Preloading + Bundle Analysis

**What you will build:** A 3-feature Angular app (Home, Admin, Reports) where Admin and Reports are lazy-loaded — plus QuicklinkStrategy preloading and a bundle size analysis with webpack-bundle-analyzer.
**Why this project:** Forces code-splitting config, preloading, and makes chunk sizes observable.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new lazy-demo --standalone --routing
cd lazy-demo
npm install ngx-quicklink webpack-bundle-analyzer
ng generate component home --standalone
ng generate component admin --standalone
ng generate component reports --standalone
\`\`\`

#### Step 2 — Routes With Lazy Loading
\`\`\`typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { QuicklinkStrategy } from 'ngx-quicklink';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    data: { preload: true },
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent),
    data: { preload: false },  // don't preload — accessed rarely
  },
  { path: '**', redirectTo: '' },
];

// Use QuicklinkStrategy — only preloads routes visible via routerLink
export const routerConfig = {
  preloadingStrategy: QuicklinkStrategy,
  routes,
};
\`\`\`

#### Step 3 — Admin Feature Routes
\`\`\`typescript
// admin/admin.routes.ts
import { Routes } from '@angular/router';
export const ADMIN_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./admin-dashboard.component').then(m => m.AdminDashboardComponent) },
  { path: 'users', loadComponent: () => import('./admin-users.component').then(m => m.AdminUsersComponent) },
];
\`\`\`

#### Step 4 — Bundle Analysis
\`\`\`bash
# Build with stats
ng build --stats-json

# Analyse bundle sizes
npx webpack-bundle-analyzer dist/lazy-demo/stats.json dist/lazy-demo/browser

# Alternatively, use the Angular CLI built-in
ng build --source-map
npx source-map-explorer 'dist/lazy-demo/browser/*.js'
\`\`\`

#### Step 5 — @defer For Within-Page Lazy Loading
\`\`\`typescript
// reports.component.ts — heavy chart component deferred until visible
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: \`
    <h1>Reports Dashboard</h1>
    <p>Summary statistics shown immediately (no defer)</p>

    @defer (on viewport) {
      <!-- HeavyChartComponent JS downloaded only when scrolled into view -->
      <app-heavy-chart/>
    } @placeholder {
      <div class="chart-skeleton" style="height:300px;background:#eee">Loading chart...</div>
    } @loading (minimum 200ms) {
      <p>Fetching chart data...</p>
    } @error {
      <p>Chart failed to load</p>
    }
  \`,
})
export class ReportsComponent {}
\`\`\`

**Expected Output:**
\`\`\`
ng build output:
  main.js: ~150KB (only home component + Angular core)
  chunk-ADMIN.js: ~25KB (admin feature — downloaded on /admin navigation)
  chunk-REPORTS.js: ~15KB (reports — downloaded on /reports navigation)

DevTools Network tab:
  Initial load: only main.js downloaded
  Navigate to /admin: chunk-ADMIN.js downloaded
\`\`\`

**Stretch Challenges:**
- [ ] Add a custom preloading strategy that only preloads routes with data.preload === true
- [ ] Measure Core Web Vitals improvement with/without lazy loading
- [ ] Add Angular Universal (SSR) and measure LCP improvement`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is the difference between loadComponent and loadChildren?
**Q2:** How does esbuild create lazy chunks?
**Q3:** Write a lazy-loaded route definition. From memory.

### Day 3 — Comprehension
**Q4:** Why is lazy-loading 50 tiny routes a problem?
**Q5:** What is @defer and how does it differ from route-based lazy loading?
**Q6:** What is a preloading strategy and why does it matter?

### Day 7 — Application
**Q7:** Analyse bundle sizes for an Angular app and identify the largest dependencies.
**Q8:** A PR puts a 2MB chart library in the root bundle — diagnose and fix.
**Q9:** How does @defer's on viewport trigger work internally?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Angular's code splitting strategy — how does it work and what metrics does it improve?"
**Q11:** Draw: webpack/esbuild chunk dependency graph for a lazy-loaded Angular app.
**Q12:** ★ System design: "Optimise an Angular SPA with 200 routes for sub-1-second Time To Interactive on 3G."`
  },

  // ── 23. performance-angular ──────────────────────────────────────────────
  'performance-angular': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Performance Like I'm 10 Years Old
> Angular performance is about reducing: (1) bundle size (how much JS the browser downloads), (2) change detection overhead (how often Angular scans the component tree), and (3) render cost (how many DOM operations). The tools: OnPush CD strategy (skip unchanged subtrees), signals (surgical per-component updates), lazy loading (smaller initial bundle), pure pipes (memoised transforms), trackBy in ngFor (reuse DOM nodes), AOT compilation (no JIT compiler in bundle), and @defer (download components only when needed). The non-obvious truth: 80% of Angular performance issues come from 3 things — function calls in templates, *ngFor without trackBy, and using Default change detection on a large component tree. Fix those three and you're 80% of the way there.

---

### 5 Deep Conceptual Questions

**Q1: What is the single highest-impact Angular performance optimisation?**
> **A:** Switching from Default to OnPush change detection on complex subtrees. Default CD checks EVERY component in the tree on EVERY async event — 60+ times per second in active apps. OnPush only checks a component when its @Input references change or an internal event fires. For a 500-component tree where only 5 components change per user action, Default runs 500 checks; OnPush runs 5 checks. Combined with signals, you get surgical per-component updates with zero unnecessary checks — 100x improvement for large trees.

**Q2: Mental model for virtual scrolling?**
> **A:** Rendering 10,000 DOM nodes is catastrophically slow — initial render takes seconds, scroll jank is constant. Virtual scrolling renders only the ~20 nodes visible in the viewport, recycling DOM nodes as the user scrolls. Angular CDK's CdkVirtualScrollViewport calculates item sizes, tracks scroll position, and swaps content in and out of a fixed pool of rendered items. Result: 10,000 rows render as fast as 20 rows, scroll is smooth, memory footprint is minimal.

**Q3: Most dangerous misconception about Angular performance?**
> **A:** Angular's default settings are production-optimised:
> \`\`\`typescript
> // WRONG: Default CD + function calls in templates is the default
> @Component({
>   // No changeDetection: OnPush specified -- Default is used
>   template: '<p>{{ formatDate(item.createdAt) }}</p>'  // called every CD cycle
> })
>
> // CORRECT: Opt into OnPush everywhere + use pure pipes/computed
> @Component({ changeDetection: ChangeDetectionStrategy.OnPush })
> // Template: {{ item.createdAt | date:'medium' }}  // pure pipe, memoised
>
> // Angular's default settings are for CORRECTNESS, not performance
> // You must explicitly opt into performance patterns
> \`\`\`

**Q4: How does Angular's build pipeline affect runtime performance?**
> **A:** ng build --configuration production enables: AOT compilation (templates compiled to JS, no runtime compiler), tree-shaking (unused code removed), minification + dead code elimination, differential loading (modern ES2015+ bundle for modern browsers, legacy ES5 for old ones — modern browsers download 20-30% less). Source maps are disabled. Angular's Ivy compiler produces optimal code with less overhead than View Engine. esbuild (default in Angular 16+) is 10-50x faster to build than webpack and produces slightly smaller bundles.

**Q5: FAANG-grade definition of Angular performance optimisation.**
> **A:** "Angular performance optimisation encompasses change detection strategy (OnPush or signals-based zoneless for surgical updates), bundle optimisation (lazy loading features via loadComponent/loadChildren, @defer for within-page deferral, tree-shaking, AOT compilation), rendering optimisation (pure pipes, trackBy/track in *ngFor/@for, virtual scrolling via CDK for large lists), memory management (takeUntilDestroyed for subscriptions, avoiding closure leaks in effects), and build optimisation (esbuild, differential loading, Brotli compression) — measurable via Core Web Vitals (LCP, FID/INP, CLS) and Angular DevTools profiler."`,

    build: `## BUILD

### 🏗️ Mini Project: Performance Benchmark — Default vs OnPush vs Signals on 1000-Item List

**What you will build:** Three implementations of a filterable 1000-item list — Default CD, OnPush, and Signals — with console.time measurements and Angular DevTools profiler usage demonstrating the difference.
**Why this project:** Makes performance improvements empirically measurable with real numbers.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new perf-demo --standalone --routing false
ng generate component item-default --standalone
ng generate component item-on-push --standalone
ng generate component item-signal --standalone
\`\`\`

#### Step 2 — Default Strategy Item
\`\`\`typescript
// item-default.component.ts
import { Component, Input } from '@angular/core';
@Component({
  standalone: true,
  selector: 'app-item-default',
  template: '<div>{{ item.name }} - {{ item.price | number:"1.2-2" }}</div>',
})
export class ItemDefaultComponent {
  @Input() item!: { id: number; name: string; price: number; };
}
\`\`\`

#### Step 3 — OnPush Strategy Item
\`\`\`typescript
// item-on-push.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
@Component({
  standalone: true,
  selector: 'app-item-on-push',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: '<div>{{ item.name }} - {{ item.price | number:"1.2-2" }}</div>',
})
export class ItemOnPushComponent {
  @Input() item!: { id: number; name: string; price: number; };
}
\`\`\`

#### Step 4 — App With Performance Measurement
\`\`\`typescript
// app.component.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemDefaultComponent } from './item-default/item-default.component';
import { ItemOnPushComponent } from './item-on-push/item-on-push.component';

interface Item { id: number; name: string; price: number; }

@Component({
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, FormsModule, ItemDefaultComponent, ItemOnPushComponent],
  template: \`
    <h1>Performance Demo — 1000 Items</h1>
    <input [(ngModel)]="filter" placeholder="Filter items..." (input)="applyFilter()">

    <h2>Default CD</h2>
    <p>CD cycles: {{ defaultCycles }}</p>
    <app-item-default *ngFor="let item of filteredDefault; trackBy: trackById" [item]="item"/>

    <h2>OnPush CD</h2>
    <p>CD cycles: {{ onPushCycles }}</p>
    <app-item-on-push *ngFor="let item of filteredOnPush; trackBy: trackById" [item]="item"/>

    <h2>Signals</h2>
    @for (item of filteredSignals(); track item.id) {
      <div>{{ item.name }} - {{ item.price | number:"1.2-2" }}</div>
    }
  \`,
})
export class AppComponent implements OnInit {
  allItems: Item[] = [];
  filteredDefault: Item[] = [];
  filteredOnPush: Item[] = [];
  filter = '';
  defaultCycles = 0;
  onPushCycles = 0;

  private _filter = signal('');
  private _all = signal<Item[]>([]);
  filteredSignals = computed(() => {
    const f = this._filter().toLowerCase();
    return f ? this._all().filter(i => i.name.toLowerCase().includes(f)) : this._all();
  });

  ngOnInit() {
    this.allItems = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1, name: 'Item ' + (i + 1), price: Math.round(Math.random() * 100 * 100) / 100,
    }));
    this.filteredDefault = this.filteredOnPush = this.allItems;
    this._all.set(this.allItems);
  }

  applyFilter() {
    console.time('filter');
    const f = this.filter.toLowerCase();
    this.filteredDefault = this.filteredOnPush = f
      ? this.allItems.filter(i => i.name.toLowerCase().includes(f))
      : this.allItems;
    this._filter.set(this.filter);
    console.timeEnd('filter');
  }

  trackById(_: number, item: Item) { return item.id; }
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
it('filteredSignals computes correctly', () => {
  const fixture = TestBed.createComponent(AppComponent);
  fixture.detectChanges();
  fixture.componentInstance._all.set([
    { id: 1, name: 'Angular', price: 10 },
    { id: 2, name: 'React', price: 5 },
  ]);
  fixture.componentInstance._filter.set('ang');
  expect(fixture.componentInstance.filteredSignals().length).toBe(1);
});
\`\`\`

**Expected Output:**
\`\`\`
Open Angular DevTools > Profiler
Type in filter:
  Default: 1000 component checks per keystroke (~15ms)
  OnPush: only changed items checked (~3ms)
  Signals: surgical updates (~1ms)

console.time('filter'): 1-3ms
\`\`\`

**Stretch Challenges:**
- [ ] Add CDK VirtualScrollViewport and measure scroll FPS
- [ ] Enable zoneless change detection
- [ ] Add PerformanceObserver to measure INP for each strategy`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three main Angular performance optimisation categories.
**Q2:** What does OnPush save compared to Default CD?
**Q3:** Write a @for loop with track that avoids DOM recreation. From memory.

### Day 3 — Comprehension
**Q4:** Why are function calls in templates slow?
**Q5:** A junior's 500-component app is slow — first optimisation to make?
**Q6:** What is virtual scrolling and when should you use it?

### Day 7 — Application
**Q7:** Profile an Angular app with Angular DevTools and identify the top 3 performance hotspots.
**Q8:** A PR adds a 1MB D3 chart to the root bundle — fix.
**Q9:** How does AOT compilation improve runtime performance?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through your Angular performance optimisation checklist — startup, runtime, and interaction."
**Q11:** Draw: change detection comparison — Default vs OnPush vs signals for a 100-component tree.
**Q12:** ★ System design: "Optimise a data-heavy Angular app serving 50k users — what are your top 5 performance changes?"`
  },

  // ── 24. testing-angular ──────────────────────────────────────────────────
  'testing-angular': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Testing Like I'm 10 Years Old
> Angular tests run in two ways: UNIT tests (TestBed — creates a mini Angular environment for one component/service/pipe) and E2E tests (Cypress/Playwright — drives a real browser). TestBed.configureTestingModule() sets up a mini-Angular with only the pieces your test needs — mocked dependencies, test doubles for services. detectChanges() tells Angular to run change detection and update the DOM. The non-obvious insight: Angular services are just TypeScript classes — test them WITHOUT TestBed using plain new. TestBed is only needed when you need Angular's DI, templates, or directives. Services with no Angular dependencies: just instantiate and call methods.

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between shallow and deep component testing?**
> **A:** SHALLOW testing renders only the component itself — child components are replaced with stubs (by declaring NO_ERRORS_SCHEMA or using CUSTOM_ELEMENTS_SCHEMA). Tests focus on the component's logic, @Input/@Output bindings, and template rendering of the component alone. DEEP testing renders the full component tree with real child components. Use shallow for unit testing a component's own logic; use deep (or integration) testing when you need to verify interactions between parent and child components.

**Q2: Mental model for ComponentFixture and DebugElement?**
> **A:** ComponentFixture wraps the component instance — fixture.componentInstance is your TypeScript class, fixture.nativeElement is the rendered HTML element, fixture.debugElement is Angular's wrapper around the DOM node. DebugElement provides Angular-aware querying: By.css('.my-class') finds elements, By.directive(MyDirective) finds elements with a specific directive. After changing component state, call fixture.detectChanges() to run Angular's change detection and update the DOM, then assert against fixture.nativeElement.

**Q3: Most dangerous misconception about Angular testing?**
> **A:** You must mock every dependency:
> \`\`\`typescript
> // WRONG: mocking primitive dependencies adds test noise
> TestBed.configureTestingModule({
>   providers: [
>     { provide: LoggerService, useValue: { log: jasmine.createSpy() } },
>     { provide: DateService, useValue: { now: () => new Date('2024-01-01') } },
>   ],
> });
>
> // CORRECT: only mock dependencies with OBSERVABLE SIDE EFFECTS
> // Mock: HTTP calls, navigation, localStorage, timers, other Angular services
> // Don't mock: pure utility functions, simple value providers
>
> // For HTTP: use HttpClientTestingModule + HttpTestingController
> // For Router: use RouterTestingModule
> // For services: use jasmine.createSpyObj or simple stub objects
> \`\`\`

**Q4: How do you test async operations in Angular?**
> **A:** Three options: (1) async/await with fixture.whenStable() — waits for all pending async work before asserting. (2) fakeAsync + tick(ms) — synchronously advances a virtual clock, resolving timers and Promises without real waiting. (3) waitForAsync — wraps test in an async zone. For HTTP tests: HttpTestingController.expectOne('/api/url').flush(mockData) synchronously resolves the pending HTTP Observable — no real waiting. fakeAsync is the most deterministic choice for time-dependent code.

**Q5: FAANG-grade definition of Angular testing.**
> **A:** "Angular testing uses TestBed for integration-style component/service testing — configureTestingModule setting up an Angular testing environment with real or mocked dependencies, ComponentFixture for rendered component access, detectChanges for explicit change detection triggering, HttpClientTestingModule for intercepting and verifying HTTP calls, RouterTestingModule for navigation testing, fakeAsync/tick for synchronous time manipulation, jasmine.createSpyObj/vi.fn for service mocking — and plain TypeScript instantiation for pure service unit testing — with Cypress or Playwright for E2E browser testing."`,

    build: `## BUILD

### 🏗️ Mini Project: Full Test Suite — Component, Service, HTTP, and E2E Tests

**What you will build:** Tests for a UserListComponent (shallow + deep), UserApiService (HTTP mocking with HttpTestingController), an auth guard, and async form submission — the complete Angular testing toolkit.
**Why this project:** Forces every testing pattern: TestBed, detectChanges, async, HTTP mock, spy.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new testing-demo --standalone --routing
cd testing-demo
ng generate component user-list --standalone
ng generate service user-api
\`\`\`

#### Step 2 — Component Test (shallow)
\`\`\`typescript
// user-list.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UserListComponent } from './user-list.component';
import { UserApiService } from '../user-api.service';
import { of, delay } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockApiService: jasmine.SpyObj<UserApiService>;

  const mockUsers = [
    { id: 1, name: 'Ana', email: 'ana@dev.io' },
    { id: 2, name: 'Ben', email: 'ben@dev.io' },
  ];

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('UserApiService', ['getUsers']);
    mockApiService.getUsers.and.returnValue(of(mockUsers));

    await TestBed.configureTestingModule({
      imports: [UserListComponent, RouterTestingModule],
      providers: [{ provide: UserApiService, useValue: mockApiService }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders user list', () => {
    const items = fixture.debugElement.queryAll(By.css('li'));
    expect(items.length).toBe(2);
    expect(items[0].nativeElement.textContent).toContain('Ana');
  });

  it('calls getUsers on init', () => {
    expect(mockApiService.getUsers).toHaveBeenCalledTimes(1);
  });

  it('shows loading then users', fakeAsync(() => {
    mockApiService.getUsers.and.returnValue(of(mockUsers).pipe(delay(500)));
    fixture = TestBed.createComponent(UserListComponent);
    fixture.detectChanges();
    // Before delay resolves
    expect(fixture.nativeElement.textContent).toContain('Loading');
    tick(500);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ana');
  }));
});
\`\`\`

#### Step 3 — Service Test With HTTP Mocking
\`\`\`typescript
// user-api.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserApiService } from './user-api.service';

describe('UserApiService', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());

  it('getUsers returns typed array', () => {
    let result: any;
    service.getUsers().subscribe(r => result = r);
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Ana', email: 'a@b.com' }]);
    expect(result[0].name).toBe('Ana');
  });

  it('handles 500 error', () => {
    let error: any;
    service.getUsers().subscribe({ error: e => error = e });
    httpMock.expectOne('/api/users').flush('Server Error', { status: 500, statusText: 'Error' });
    expect(error.type).toBe('server');
  });
});
\`\`\`

#### Step 4 — Guard Test
\`\`\`typescript
// auth.guard.spec.ts
describe('authGuard', () => {
  it('allows when logged in', () => {
    TestBed.configureTestingModule({ providers: [
      { provide: AuthService, useValue: { isLoggedIn: () => true } },
      { provide: Router, useValue: { createUrlTree: () => null } },
    ]});
    expect(TestBed.runInInjectionContext(() => authGuard())).toBe(true);
  });
});
\`\`\`

#### Step 5 — Tests Summary
\`\`\`typescript
// Component: detectChanges, By.css, mock service, fakeAsync
// Service: HttpTestingController, expectOne, flush
// Guard: TestBed.runInInjectionContext for functional guards
// Pipe: plain instantiation, no TestBed: const pipe = new MyPipe(); pipe.transform(...)

// Expected test run:
// ng test --watch=false --coverage
// 8 specs, 0 failures
// Coverage: Statements: 85%+
\`\`\`

**Expected Output:**
\`\`\`
UserListComponent: renders users, calls API, shows loading state
UserApiService: GET request verified, error handling tested
authGuard: allows/blocks navigation based on auth state
ng test: all specs pass
\`\`\`

**Stretch Challenges:**
- [ ] Add component harness tests using Angular CDK testing harnesses
- [ ] Add Cypress E2E test for the user list flow
- [ ] Achieve 100% branch coverage on the API service`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** When should you use TestBed vs plain instantiation for services?
**Q2:** What does detectChanges() do in a test?
**Q3:** Write a basic component test with a mocked service. From memory.

### Day 3 — Comprehension
**Q4:** Difference between fakeAsync + tick and async + whenStable?
**Q5:** A junior is testing an HTTP service with jasmine.createSpy instead of HttpTestingController — what's wrong?
**Q6:** How do you test an @Output event emitter?

### Day 7 — Application
**Q7:** Build tests for a form component with validation — test each validator rule.
**Q8:** How do you test an Effect in NgRx?
**Q9:** What is a TestBed teardown and why does it matter for test isolation?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Describe your Angular testing strategy — unit, integration, and E2E tests."
**Q11:** Draw: Angular testing pyramid — what goes in unit, integration, and E2E layers.
**Q12:** ★ System design: "Design a testing strategy for a 200-component Angular app — what to test at each layer, coverage targets, CI integration."`
  },

  // ── 25. angular-compiler ────────────────────────────────────────────────
  'angular-compiler': {
    feynman: `## FEYNMAN CHECK

### Explain the Angular Compiler Like I'm 10 Years Old
> The Angular compiler transforms your TypeScript + HTML templates into optimised JavaScript BEFORE the browser ever runs your code. You write {{ user.name }} in a template; the compiler turns it into a JavaScript function that directly updates the DOM text node when user.name changes — no interpreted HTML at runtime. This is Ahead-Of-Time (AOT) compilation. The non-obvious depth: Angular's Ivy compiler (since Angular 9) generates LOCALLY-SCOPED component code — each component's template is compiled into a standalone JavaScript factory function with no global registry. This enables tree-shaking (unused components are removed from the bundle), better error messages (caught at ng build time, not at user runtime), and faster initial rendering.

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between AOT and JIT compilation?**
> **A:** JIT (Just-In-Time) compiles templates IN THE BROWSER at runtime — the Angular compiler (~100KB) is shipped to users, templates are compiled when the app boots. AOT (Ahead-Of-Time) compiles templates AT BUILD TIME — the compiler runs on your machine (not in the browser), the output is pre-compiled JavaScript. Angular production builds always use AOT. JIT used to be the default in development (faster build), but Angular CLI now uses AOT in development too (esbuild is fast enough). Benefits of AOT: no compiler in bundle (~100KB smaller), faster startup, compile-time type checking of templates.

**Q2: Mental model for Ivy's local compilation?**
> **A:** View Engine (pre-Ivy) required a global registry of all components — it had to see the ENTIRE app to compile any component. Ivy compiles each component IN ISOLATION — a component knows its own template and imported components, nothing else. This enables: incremental compilation (only changed components rebuild), library consumers don't need a full app context to use a library component, and lazy-loaded chunks contain self-contained compiled components. Ivy's output is ɵɵdefineComponent factory functions in the compiled JavaScript.

**Q3: Most dangerous misconception about the Angular compiler?**
> **A:** The compiler catches all type errors:
> \`\`\`typescript
> // Angular compiler DOES catch:
> @Component({ template: '{{ user.nme }}' })  // ERROR: 'nme' not in User type
>
> // Angular compiler DOES NOT catch:
> @Component({ template: '{{ getUserName() }}' })  // returns 'any' — no type check
> // Fix: enable strictTemplates in tsconfig.json to get full template type checking
>
> // Also not caught: runtime type mismatches from server API
> // The compiler trusts your TypeScript types — validate API responses with Zod/Joi
> \`\`\`

**Q4: How does the compiler enable tree-shaking?**
> **A:** Ivy-compiled Angular components reference their imported components by DIRECT import (import { ButtonComponent } from './button'). Bundlers (webpack/esbuild) can trace these imports statically — if ButtonComponent is never imported by any rendered component, it's removed from the bundle entirely. View Engine required all declared components to be in a bundle (because the global registry included everything). Ivy changed this: only components actually used in a rendered template make it into the production bundle.

**Q5: FAANG-grade definition of the Angular compiler.**
> **A:** "The Angular Ivy compiler is an AOT template compiler that transforms Angular templates into TypeScript/JavaScript at build time — generating ɵɵdefineComponent factory functions with localised component definitions for tree-shaking — performing strict template type checking when strictTemplates is enabled, detecting binding errors, structural directive type narrowing, and generic component type inference — with incremental compilation via ngtsc (the TypeScript Compiler extended with Angular transforms) enabling fast rebuilds via the language service — and runtime performance benefits from pre-compiled templates eliminating the JIT compiler from production bundles."`,

    build: `## BUILD

### 🏗️ Mini Project: Compiler Deep Dive — strictTemplates Errors, Tree-Shaking Analysis, Custom Transformers

**What you will build:** An Angular project with strictTemplates enabled showing compiler type errors, a bundle analysis before/after removing unused components, and a look at the compiled output of a simple component.
**Why this project:** Makes the compiler's behaviour OBSERVABLE — you see the actual compiled output and understand what strictTemplates enforces.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup With strictTemplates
\`\`\`bash
ng new compiler-demo --standalone --routing false
cd compiler-demo
\`\`\`

#### Step 2 — Enable Strict Templates
\`\`\`json
// tsconfig.json
{
  "compilerOptions": { "strict": true },
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInputTypes": true,
    "strictNullInputTypes": true,
    "strictOutputEventTypes": true,
    "strictAttributeTypes": true,
    "strictDomEventTypes": true,
    "strictDomLocalRefTypes": true,
    "strictSafeNavigationTypes": true,
    "strictContextGenerics": true
  }
}
\`\`\`

#### Step 3 — Observe Compiler Errors
\`\`\`typescript
// Intentional type errors to see compiler catches:
interface User { id: number; name: string; }

@Component({
  standalone: true,
  template: \`
    <!-- Compiler error: 'nme' does not exist on type 'User' -->
    <p>{{ user.nme }}</p>

    <!-- Compiler error: Type 'string' is not assignable to type 'number' -->
    <app-count [value]="'hello'"/>

    <!-- Compiler error: Event 'clicked' does not exist on 'AppCountComponent' -->
    <app-count (clicked)="handleClick()"/>

    <!-- This is valid: -->
    <p>{{ user.name }}</p>
  \`,
})
export class AppComponent {
  user: User = { id: 1, name: 'Ana' };
}
\`\`\`

#### Step 4 — View Compiled Output
\`\`\`bash
# Compile and look at the output
ng build --output-path=dist-check
# Find compiled component:
cat dist-check/browser/main.js | grep -A 50 "ɵɵdefineComponent"

# The compiled output shows:
# ɵɵdefineComponent({
#   type: AppComponent,
#   selectors: [["app-root"]],
#   decls: 2,                    // 2 DOM nodes
#   vars: 1,                     // 1 binding
#   template: function AppComponent_Template(rf, ctx) {
#     if (rf & 1) {              // creation mode
#       ɵɵelementStart(0, "p");
#       ɵɵtext(1);
#       ɵɵelementEnd();
#     }
#     if (rf & 2) {              // update mode
#       ɵɵadvance();
#       ɵɵtextInterpolate(ctx.user.name);  // direct property access
#     }
#   }
# })
\`\`\`

#### Step 5 — Tree-Shaking Test
\`\`\`typescript
// Create two components, import only one
@Component({ standalone: true, selector: 'app-used', template: '<p>I am used</p>' })
export class UsedComponent {}

@Component({ standalone: true, selector: 'app-unused', template: '<p>I am never imported</p>' })
export class UnusedComponent {}

@Component({
  standalone: true,
  imports: [UsedComponent],  // Only UsedComponent imported — UnusedComponent tree-shaken
  template: '<app-used/>',
})
export class AppComponent {}

// ng build --stats-json
// webpack-bundle-analyzer: UnusedComponent should NOT appear in the bundle
\`\`\`

**Expected Output:**
\`\`\`
ng build (with type errors):
  error TS2339: Property 'nme' does not exist on type 'User'
  error NG8002: Can't bind to 'value' ...

ng build (corrected):
  Compiled output includes ɵɵdefineComponent factory
  UsedComponent in bundle, UnusedComponent NOT in bundle

Tree-shaking verified via bundle analyzer
\`\`\`

**Stretch Challenges:**
- [ ] Write a custom Angular schematic that adds strictTemplates to tsconfig
- [ ] Compare bundle size with and without strictTemplates (AOT optimises more with known types)
- [ ] Add an Angular language service plugin and observe real-time template type errors in the IDE`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between AOT and JIT compilation?
**Q2:** What does strictTemplates enable?
**Q3:** Where does Ivy's compiled output appear in the bundle? From memory.

### Day 3 — Comprehension
**Q4:** Why does Ivy enable better tree-shaking than View Engine?
**Q5:** A template uses a method that returns 'any' — will the compiler catch type errors?
**Q6:** What is incremental compilation and why does it speed up development?

### Day 7 — Application
**Q7:** Enable strictTemplates and fix all compiler errors in an existing project.
**Q8:** A PR ships a 200KB library but only uses one component — explain the fix.
**Q9:** What is ngtsc and how does it differ from regular tsc?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Angular's Ivy compiler — what it generates, how it enables tree-shaking, and what AOT compilation provides."
**Q11:** Draw: Angular compilation pipeline from source TypeScript to browser-ready JavaScript.
**Q12:** ★ System design: "Design a build optimisation strategy for an Angular monorepo — incremental builds, shared libraries, caching."`
  },

  // ── 26. viewchild-contentchild ────────────────────────────────────────────
  'viewchild-contentchild': {
    feynman: `## FEYNMAN CHECK

### Explain @ViewChild and @ContentChild Like I'm 10 Years Old
> @ViewChild and @ContentChild are Angular's way of getting direct references to child elements, components, or directives from your TypeScript code. @ViewChild grabs elements from the component's OWN template. @ContentChild grabs elements projected into the component via ng-content (content that a PARENT passes into your component's slot). Think of @ViewChild as "grab my own child" and @ContentChild as "grab what someone gave me to hold." The non-obvious depth: @ViewChild references are not available until ngAfterViewInit fires — before that they are undefined. @ContentChild references are not available until ngAfterContentInit.

---

### 5 Deep Conceptual Questions

**Q1: When is @ViewChild set and when is it undefined?**
> **A:** @ViewChild is undefined in the constructor and ngOnInit because the view hasn't been rendered yet. Angular sets it in ngAfterViewInit when the component's template DOM is fully initialised. If you use the @ViewChild with { static: true }, it's resolved in ngOnInit but ONLY if the reference is NOT inside *ngIf, *ngFor, or @if blocks (because those may not yet exist). The default { static: false } resolves after the full view is rendered — always use false for conditional content.

**Q2: Mental model for ng-content and @ContentChild?**
> **A:** ng-content is Angular's content projection — a SLOT inside your component's template where a parent can inject content. @ContentChild lets the component access what was projected into that slot. Example: a tabs component has ng-content; the parent projects tab panels. The tabs component uses @ContentChild(TabPanelComponent) to get a reference to the first panel, or @ContentChildren(TabPanelComponent) to get ALL panels. This enables reusable "container components" that work with arbitrary projected content.

**Q3: Most dangerous misconception about @ViewChild?**
> **A:** @ViewChild({static: true}) always works:
> \`\`\`typescript
> // WRONG: static: true inside *ngIf — reference will be undefined
> @ViewChild('myInput', { static: true }) myInput!: ElementRef;
>
> @Component({ template: \\'<div *ngIf="show"><input #myInput></div>\\' })
> export class MyComponent implements OnInit {
>   ngOnInit() { this.myInput?.nativeElement.focus(); }
>   // myInput is UNDEFINED — the *ngIf hasn't rendered yet
> }
>
> // CORRECT: Use static: false and access in ngAfterViewInit
> @ViewChild('myInput', { static: false }) myInput?: ElementRef;
> ngAfterViewInit() { this.myInput?.nativeElement.focus(); }
> \`\`\`

**Q4: What is the difference between ViewChild and ViewChildren?**
> **A:** @ViewChild gets the FIRST matching element/component/directive. @ViewChildren gets ALL matches as a QueryList — a live collection that updates when elements are added/removed (e.g., when *ngFor adds new items). QueryList has an Observable changes$ that emits whenever the list changes. Use @ViewChild for unique references (one form, one chart component). Use @ViewChildren for collections (multiple form fields, a list of item components you need to call methods on).

**Q5: FAANG-grade definition of @ViewChild/@ContentChild.**
> **A:** "@ViewChild and @ContentChild are Angular queries that resolve references to child elements, components, or directives after the view lifecycle — @ViewChild querying the component's own template DOM (available after ngAfterViewInit), @ContentChild querying projected ng-content nodes (available after ngAfterContentInit) — with @ViewChildren/@ContentChildren returning live QueryList collections for multiple matches — supporting ElementRef (DOM node), TemplateRef (template reference), or component/directive class type queries — and static: true for resolution before change detection (only valid for non-conditional elements in OnInit)."`,

    build: `## BUILD

### 🏗️ Mini Project: Custom Accordion — Parent Queries Child Components via @ContentChildren

**What you will build:** A reusable accordion widget where the parent AccordionComponent uses @ContentChildren to query all projected AccordionPanelComponents — controlling which panel is open without parent knowing the panel contents.
**Why this project:** Forces @ContentChildren, QueryList.changes, and the container-child component pattern.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new viewchild-demo --standalone --routing false
ng generate component accordion --standalone
ng generate component accordion-panel --standalone
\`\`\`

#### Step 2 — AccordionPanel Component
\`\`\`typescript
// accordion-panel.component.ts
import { Component, Input, signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-accordion-panel',
  template: \`
    <div class="panel">
      <div class="header" (click)="toggle()">
        <strong>{{ title }}</strong>
        <span>{{ isOpen() ? '-' : '+' }}</span>
      </div>
      <div class="body" [style.display]="isOpen() ? 'block' : 'none'">
        <ng-content/>
      </div>
    </div>
  \`,
})
export class AccordionPanelComponent {
  @Input({ required: true }) title = '';
  isOpen = signal(false);
  open()   { this.isOpen.set(true); }
  close()  { this.isOpen.set(false); }
  toggle() { this.isOpen.update(v => !v); }
}
\`\`\`

#### Step 3 — Accordion Container With @ContentChildren
\`\`\`typescript
// accordion.component.ts
import { Component, ContentChildren, QueryList, AfterContentInit, Input } from '@angular/core';
import { AccordionPanelComponent } from '../accordion-panel/accordion-panel.component';

@Component({
  standalone: true,
  selector: 'app-accordion',
  template: '<ng-content/>',   // just a slot for panels
})
export class AccordionComponent implements AfterContentInit {
  @Input() allowMultiple = false;
  @ContentChildren(AccordionPanelComponent) panels!: QueryList<AccordionPanelComponent>;

  ngAfterContentInit() {
    // Listen for changes if panels are added/removed dynamically
    this.panels.changes.subscribe(() => console.log('Panel count changed:', this.panels.length));

    // Subscribe to each panel's isOpen to enforce single-open mode
    if (!this.allowMultiple) {
      this.panels.forEach(panel => {
        // Override toggle to close siblings
        const originalToggle = panel.toggle.bind(panel);
        panel.toggle = () => {
          const wasOpen = panel.isOpen();
          this.panels.forEach(p => p.close());
          if (!wasOpen) panel.open();
        };
      });
    }
  }

  openAll()  { this.panels.forEach(p => p.open()); }
  closeAll() { this.panels.forEach(p => p.close()); }
}
\`\`\`

#### Step 4 — Usage and @ViewChild for form focus
\`\`\`typescript
// app.component.ts
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { AccordionComponent } from './accordion/accordion.component';
import { AccordionPanelComponent } from './accordion-panel/accordion-panel.component';

@Component({
  standalone: true,
  imports: [AccordionComponent, AccordionPanelComponent],
  template: \`
    <h1>Accordion Demo</h1>
    <button (click)="accordion.openAll()">Open All</button>
    <button (click)="accordion.closeAll()">Close All</button>
    <app-accordion #accordion>
      <app-accordion-panel title="Section 1">Content 1</app-accordion-panel>
      <app-accordion-panel title="Section 2">Content 2</app-accordion-panel>
      <app-accordion-panel title="Section 3">Content 3</app-accordion-panel>
    </app-accordion>
  \`,
})
export class AppComponent {
  @ViewChild('accordion') accordion!: AccordionComponent;
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
it('opens first panel on open()', () => {
  const fixture = TestBed.createComponent(AccordionPanelComponent);
  fixture.componentRef.setInput('title', 'Test');
  fixture.detectChanges();
  fixture.componentInstance.open();
  expect(fixture.componentInstance.isOpen()).toBe(true);
});

it('AccordionComponent queries content children', () => {
  const fixture = TestBed.createComponent(TestHostAccordionComponent);
  fixture.detectChanges();
  expect(fixture.componentInstance.accordion.panels.length).toBe(3);
});
\`\`\`

**Expected Output:**
\`\`\`
Click panel header -> opens (closes siblings in single mode)
Open All -> all panels open (allowMultiple mode)
Close All -> all panels close
Tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add @ViewChild to an input element and auto-focus it on init
- [ ] Add animations to panel open/close using Angular Animations
- [ ] Add keyboard navigation (arrow keys to move between panels)`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between @ViewChild and @ContentChild?
**Q2:** When is @ViewChild available?
**Q3:** Write a @ViewChild that accesses a child component method. From memory.

### Day 3 — Comprehension
**Q4:** When would you use @ViewChildren instead of @ViewChild?
**Q5:** A junior uses @ViewChild({static: true}) inside *ngIf — diagnose.
**Q6:** What is QueryList.changes and when do you use it?

### Day 7 — Application
**Q7:** Build a tab group where the parent queries all tab components via @ContentChildren.
**Q8:** A PR accesses @ViewChild in ngOnInit and gets undefined — fix.
**Q9:** How would you imperatively scroll a list item into view using @ViewChild?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain @ViewChild vs @ContentChild — what is content projection and how does @ContentChildren enable compound components?"
**Q11:** Draw: component tree showing template vs projected content boundaries.
**Q12:** ★ System design: "Design a reusable data-grid component that accepts sortable column definitions via content projection."`
  },

  // ── 27. angular-material ─────────────────────────────────────────────────
  'angular-material': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Material Like I'm 10 Years Old
> Angular Material is Google's official UI component library for Angular — implementing Material Design with pre-built, accessible, themeable components: buttons, forms, tables, dialogs, chips, date pickers, menus, snackbars, and more. Every component is accessibility-first (ARIA attributes, keyboard navigation, screen reader support built in), themeable via CSS custom properties, and built on CDK (Component Dev Kit — Angular Material's headless behaviour primitives). The non-obvious depth: Angular Material 15+ ships STANDALONE components — you import MatButtonModule or the individual MatButton directive directly into your standalone component, enabling tree-shaking. With theming, you define your brand colours once in styles.scss and they propagate through the entire design system.

---

### 5 Deep Conceptual Questions

**Q1: What is the CDK and how does it relate to Angular Material?**
> **A:** CDK (Component Dev Kit) is Angular Material's lower layer — it provides BEHAVIOUR primitives without visual styling: DragDrop, Overlay (for positioning floating panels), Portal (for rendering components anywhere in the DOM), FocusTrap (keyboard accessibility), VirtualScroll (efficient large lists), Table (data grid without styling), Clipboard, and Testing utilities. Angular Material's components are built ON TOP of CDK — they add styles to CDK's behaviours. You can use CDK directly to build custom components with Material-quality behaviour but custom styles.

**Q2: Mental model for Angular Material theming?**
> **A:** Angular Material uses a THREE-LEVEL theme system: (1) Color palettes (primary, accent, warn — 50-900 shades). (2) Theme functions (light-theme/dark-theme) that compute CSS custom properties. (3) Component mixins that apply the theme to each component. In SCSS: @use '@angular/material' as mat; $theme: mat.define-theme($colors); @include mat.all-component-themes($theme);. With Material 3 (M3), theming moved to CSS custom properties — you can change the theme at runtime by swapping CSS variables without rebuilding.

**Q3: Most dangerous misconception about Angular Material?**
> **A:** Import the full MatXxxModule for each component:
> \`\`\`typescript
> // OUTDATED: importing the full module pulls in everything
> import { MatButtonModule } from '@angular/material/button';  // was required pre-15
>
> // MODERN (Angular Material 15+): import individual standalone directives
> import { MatButton } from '@angular/material/button';
> import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
>
> @Component({
>   standalone: true,
>   imports: [MatButton, MatFormField, MatLabel, MatInput],  // tree-shakeable
>   template: '<mat-form-field><mat-label>Name</mat-label><input matInput></mat-form-field>',
> })
> \`\`\`

**Q4: How does MatDialog work internally?**
> **A:** MatDialog uses Angular CDK's Overlay and Portal to render a component into a layer above the page. overlay.create({ hasBackdrop: true }) creates a positioned container in the document body. A PortalOutlet renders the dialog component into that container. MatDialogRef is returned by dialog.open() — it lets you close the dialog, pass back results, and subscribe to afterClosed(). This is why dialog components don't need to be in any route — they're portalled into an overlay independently.

**Q5: FAANG-grade definition of Angular Material.**
> **A:** "Angular Material is Google's Material Design component library for Angular — providing 50+ production-grade UI components (forms, navigation, data display, feedback, layout) built on Angular CDK behavioural primitives (Overlay, Portal, DragDrop, VirtualScroll, FocusTrap) — with WCAG-compliant accessibility, M3 theming via CSS custom properties, tree-shakeable standalone component exports, and an a11y-first design — enabling teams to build consistent, accessible UIs without reinventing form controls, dialogs, tables, and navigation patterns."`,

    build: `## BUILD

### 🏗️ Mini Project: Material Admin Panel — Table, Dialog, Snackbar, Form

**What you will build:** A mini admin panel using Angular Material: a mat-table with sorting and pagination, a MatDialog for editing a user, a MatSnackBar for notifications, and a mat-form-field with validation — the four most-used Material components.
**Why this project:** Forces real Material component composition in a practical UI pattern.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new material-demo --standalone --routing false
ng add @angular/material
# Choose: Indigo/Pink theme, yes to animations, yes to typography
\`\`\`

#### Step 2 — Users Table With Sort and Pagination
\`\`\`typescript
// app.component.ts
import { Component, ViewChild, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TableVirtualScrollDataSource } from '@angular/material/table';

export interface User { id: number; name: string; email: string; role: string; }

@Component({
  standalone: true,
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatDialogModule, MatSnackBarModule],
  template: \`
    <h1>User Admin</h1>
    <table mat-table [dataSource]="dataSource" matSort>
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
        <td mat-cell *matCellDef="let user">{{ user.id }}</td>
      </ng-container>
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
        <td mat-cell *matCellDef="let user">{{ user.name }}</td>
      </ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let user">
          <button mat-button color="primary" (click)="editUser(user)">Edit</button>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns"></tr>
    </table>
    <mat-paginator [pageSizeOptions]="[5, 10, 25]" showFirstLastButtons/>
  \`,
})
export class AppComponent implements OnInit {
  columns = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource<User>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.dataSource.data = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1, name: 'User ' + (i + 1), email: 'user' + (i+1) + '@dev.io', role: i % 3 === 0 ? 'admin' : 'user',
    }));
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  editUser(user: User) {
    const ref = this.dialog.open(UserEditDialogComponent, { data: user, width: '400px' });
    ref.afterClosed().subscribe(result => {
      if (result) this.snackBar.open('User updated!', 'OK', { duration: 3000 });
    });
  }
}
\`\`\`

#### Step 3 — Edit Dialog Component
\`\`\`typescript
// user-edit-dialog.component.ts
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../app.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: \`
    <h2 mat-dialog-title>Edit User</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field appearance="outline">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name">
        <mat-error *ngIf="form.get('name')?.errors?.['required']">Required</mat-error>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" type="email">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Save</button>
    </mat-dialog-actions>
  \`,
})
export class UserEditDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UserEditDialogComponent>);
  private data: User = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    name: [this.data.name, Validators.required],
    email: [this.data.email, [Validators.required, Validators.email]],
  });

  save() { this.dialogRef.close({ ...this.data, ...this.form.value }); }
}
\`\`\`

#### Step 4 — Tests
\`\`\`typescript
it('opens edit dialog on button click', () => {
  const fixture = TestBed.createComponent(AppComponent);
  fixture.detectChanges();
  const mockDialog = TestBed.inject(MatDialog);
  spyOn(mockDialog, 'open').and.returnValue({ afterClosed: () => of(null) } as any);
  fixture.componentInstance.editUser({ id: 1, name: 'Ana', email: 'a@b.com', role: 'user' });
  expect(mockDialog.open).toHaveBeenCalledWith(UserEditDialogComponent, jasmine.anything());
});
\`\`\`

**Expected Output:**
\`\`\`
Table shows 50 users with pagination (5 per page)
Sort by name/id
Click Edit -> MatDialog opens with form
Save -> dialog closes, snackbar "User updated!" shown
Tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add MatSidenav for navigation
- [ ] Add a custom Material 3 theme with your brand colours
- [ ] Add CDK DragDrop to reorder table rows`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is CDK and how does it relate to Angular Material?
**Q2:** How do you open a MatDialog and receive its result?
**Q3:** Import MatButton into a standalone component. From memory.

### Day 3 — Comprehension
**Q4:** Why use standalone Material component imports instead of MatXxxModule?
**Q5:** A junior imports MatTableModule but forgets MatSortModule — what breaks?
**Q6:** How does Angular Material theming work with CSS custom properties?

### Day 7 — Application
**Q7:** Build a searchable mat-select with @angular/material.
**Q8:** A PR imports the full MatFormFieldModule — refactor to standalone imports.
**Q9:** How do you make a custom component work with Angular Material theming?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Angular Material CDK — what is an Overlay and how does MatDialog use it?"
**Q11:** Draw: Angular Material theming layers — palette, theme, component styles.
**Q12:** ★ System design: "Design a custom design system on top of Angular CDK — accessibility, theming, documentation."`
  },

  // ── 28. angular-pwa ──────────────────────────────────────────────────────
  'angular-pwa': {
    feynman: `## FEYNMAN CHECK

### Explain Angular PWA Like I'm 10 Years Old
> A Progressive Web App (PWA) is a website that behaves like a native app — it can be installed on your phone's home screen, work OFFLINE (even without internet), send push notifications, and load instantly on repeat visits. Angular makes this easy with ng add @angular/pwa, which generates a Service Worker (sw-worker.js) — a JavaScript file that runs in the background and acts as a PROXY for all network requests. The non-obvious depth: the service worker pre-caches your Angular app's static assets (JavaScript, CSS, fonts) during installation, so the app loads instantly from cache on repeat visits. It uses a CACHE-FIRST strategy for static assets and NETWORK-FIRST for API calls — configurable in ngsw-config.json.

---

### 5 Deep Conceptual Questions

**Q1: How does Angular's service worker cache strategy work?**
> **A:** ngsw-config.json defines two cache groups: (1) "freshness" (network-first, falls back to cache) for API data, (2) "performance" (cache-first) for static assets (JS/CSS/images). Angular's service worker (ngsw-worker.js) registers as the browser's fetch event handler. For cache-first resources: check cache → if found, return immediately → background refresh. For freshness: try network → if response in 3s, return → otherwise return cache. The service worker handles updates automatically — when a new version is deployed, the service worker detects it and can prompt the user to reload.

**Q2: Mental model for the install/activate/fetch lifecycle?**
> **A:** Install: browser downloads and runs the service worker — pre-caches all files listed in ngsw.json (Angular's generated cache manifest). Activate: the new service worker takes control (old one had to be idle) — deletes old caches. Fetch: every network request is intercepted — the service worker decides: return from cache or go to network based on the strategy in ngsw-config.json. The SwUpdate service lets your Angular app check for updates and prompt the user to activate a new version.

**Q3: Most dangerous misconception about Angular PWAs?**
> **A:** Service workers work in development with ng serve:
> \`\`\`bash
> # WRONG: ng serve does NOT activate service workers by default
> ng serve    # service worker is disabled in dev mode
>
> # CORRECT: build and serve the production build to test service workers
> ng build
> npx http-server dist/my-app -p 8080
> # Open http://localhost:8080 — service worker now active
>
> # Or use http-server-spa for HTML5 routing:
> npx http-server dist/my-app -p 8080 -c-1 --proxy http://localhost:8080?
>
> # In production: service worker only activates over HTTPS (except localhost)
> \`\`\`

**Q4: How do you handle background sync and push notifications in Angular PWA?**
> **A:** SwPush from @angular/service-worker handles Push Notifications — requestSubscription() asks for permission and returns a PushSubscription object. Send it to your server; the server uses the Web Push protocol to deliver messages. Background Sync is more manual — you register a sync tag via navigator.serviceWorker.ready.then(sw => sw.sync.register('sync-queue')) and the service worker receives the 'sync' event when the user is back online. Angular's ngsw-config.json doesn't configure background sync natively — you need a custom service worker extension.

**Q5: FAANG-grade definition of Angular PWA.**
> **A:** "An Angular PWA uses @angular/service-worker's ngsw-worker.js to register a service worker that intercepts fetch events — pre-caching static assets (index.html, JS/CSS chunks, assets) per a version-hashed ngsw.json manifest, serving them cache-first for performance — while using network-first for data APIs — with SwUpdate for programmatic version management, SwPush for Web Push Notification subscription, offline fallback pages, and ngsw-config.json for cache strategy configuration — enabling installable, offline-capable apps with native-like performance on repeat visits."`,

    build: `## BUILD

### 🏗️ Mini Project: Angular PWA With Offline Support and Update Prompts

**What you will build:** An Angular PWA that: loads offline after first visit, shows an "Update available" banner when a new version is deployed, caches product images, and handles push notification subscription.
**Why this project:** Forces service worker integration, SwUpdate, and offline strategy configuration.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new pwa-demo --standalone --routing
cd pwa-demo
ng add @angular/pwa
# This adds: ngsw-worker.js, ngsw-config.json, manifest.webmanifest, sw registration in app.config.ts
\`\`\`

#### Step 2 — Configure ngsw-config.json
\`\`\`json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/*.css", "/*.js"]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": ["/assets/**"],
        "urls": ["https://fonts.googleapis.com/**", "https://fonts.gstatic.com/**"]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "products-api",
      "urls": ["https://fakestoreapi.com/**"],
      "cacheConfig": {
        "maxSize": 100,
        "maxAge": "1h",
        "timeout": "10s",
        "strategy": "freshness"
      }
    }
  ]
}
\`\`\`

#### Step 3 — Update Banner Component
\`\`\`typescript
// update-banner.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { NgIf } from '@angular/common';

@Component({
  standalone: true, imports: [NgIf],
  selector: 'app-update-banner',
  template: \`
    <div *ngIf="updateAvailable" class="update-banner">
      A new version is available!
      <button (click)="activateUpdate()">Reload</button>
    </div>
  \`,
})
export class UpdateBannerComponent implements OnInit {
  private swUpdate = inject(SwUpdate);
  updateAvailable = false;

  ngOnInit() {
    if (!this.swUpdate.isEnabled) return;
    this.swUpdate.versionUpdates.subscribe(event => {
      if (event.type === 'VERSION_READY') {
        this.updateAvailable = true;
      }
    });
    this.swUpdate.checkForUpdate();
  }

  activateUpdate() {
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }
}
\`\`\`

#### Step 4 — Push Notification Service
\`\`\`typescript
// push.service.ts
import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';

const VAPID_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_HERE';

@Injectable({ providedIn: 'root' })
export class PushService {
  private swPush = inject(SwPush);

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swPush.isEnabled) return null;
    return this.swPush.requestSubscription({ serverPublicKey: VAPID_PUBLIC_KEY });
  }

  listenToMessages() {
    return this.swPush.messages;
  }
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('UpdateBannerComponent', () => {
  it('shows banner on VERSION_READY event', () => {
    const subject = new Subject<any>();
    TestBed.configureTestingModule({
      imports: [UpdateBannerComponent],
      providers: [{ provide: SwUpdate, useValue: { isEnabled: true, versionUpdates: subject, checkForUpdate: () => Promise.resolve(false) } }],
    });
    const fixture = TestBed.createComponent(UpdateBannerComponent);
    fixture.detectChanges();
    subject.next({ type: 'VERSION_READY' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('new version');
  });
});
\`\`\`

**Expected Output:**
\`\`\`
ng build && npx http-server dist/pwa-demo -p 8080
First load: caches all assets
Go offline: app still loads from cache
API calls: served from cache with 1h TTL
Deploy new version: service worker detects, banner appears
Click Reload: new version activated
\`\`\`

**Stretch Challenges:**
- [ ] Add a background sync queue for form submissions while offline
- [ ] Add an install prompt component that shows the browser install banner
- [ ] Test offline behaviour using Chrome DevTools > Network > Offline`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does ng add @angular/pwa generate?
**Q2:** What is the difference between cache-first and network-first strategies?
**Q3:** How do you check for a new app version programmatically? From memory.

### Day 3 — Comprehension
**Q4:** Why do service workers not work with ng serve?
**Q5:** A user complains they're seeing stale content after a deployment — diagnose.
**Q6:** What is the service worker install/activate/fetch lifecycle?

### Day 7 — Application
**Q7:** Configure ngsw-config.json to cache API responses for 24h.
**Q8:** A PR deploys new code but users don't see it for days — why?
**Q9:** How would you implement offline form submission with background sync?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain how Angular's service worker handles app updates — version detection, activation, and user experience."
**Q11:** Draw: service worker install/activate/fetch lifecycle diagram.
**Q12:** ★ System design: "Design an offline-first Angular app for field workers with no reliable connectivity — sync strategy, conflict resolution, UX."`
  },

  // ── 29. angular-universal ────────────────────────────────────────────────
  'angular-universal': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Universal (SSR) Like I'm 10 Years Old
> Angular Universal runs your Angular app on the SERVER — in Node.js — and sends COMPLETE HTML to the browser instead of an empty div + JavaScript. A normal Angular app sends: <app-root></app-root> → browser downloads JS → Angular bootstraps → renders HTML → user sees content (2-4 seconds). With SSR: server renders FULL HTML → browser shows it IMMEDIATELY → JavaScript loads in background → Angular "hydrates" (takes over interactive events). The non-obvious depth: hydration (Angular 16+) reuses the server-rendered DOM instead of discarding it — the browser doesn't re-render, it just attaches event listeners to the existing server HTML. This eliminates the visual flash and improves Core Web Vitals.

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between SSR, SSG, and CSR?**
> **A:** CSR (Client-Side Rendering): browser downloads blank HTML + JS, Angular renders in the browser. Slowest first paint, fastest subsequent navigation. SSR (Server-Side Rendering): server renders HTML per request, sends to browser, Angular hydrates. Fastest First Contentful Paint, still requires server. SSG (Static Site Generation): HTML pre-rendered at BUILD TIME — no server needed, served as static files from CDN. Fastest delivery, but not suitable for dynamic personalised content. Angular 17+ supports all three and lets you mix per-route.

**Q2: Mental model for Angular hydration?**
> **A:** Before hydration (Angular 16): SSR sent HTML → browser showed it → Angular DESTROYED the server HTML → rebuilt it entirely from scratch with JS (visual flash, duplicate work). After hydration: SSR sends HTML with hydration markers → Angular 16+ recognises the server-rendered DOM → reuses existing DOM nodes → attaches only the event listeners and bindings (no re-render, no visual flash). Hydration requires: server and browser receiving the SAME data for the initial render (otherwise DOM mismatch errors).

**Q3: Most dangerous misconception about Angular Universal?**
> **A:** All Angular code works the same on the server:
> \`\`\`typescript
> // WRONG: browser-only APIs crash on Node.js
> @Component({})
> export class AnalyticsComponent implements OnInit {
>   ngOnInit() {
>     window.gtag('event', 'page_view');  // ReferenceError: window is not defined!
>     localStorage.setItem('visited', 'true');  // ReferenceError!
>     document.querySelector('.chart');  // ReferenceError!
>   }
> }
>
> // CORRECT: check platform before using browser APIs
> import { isPlatformBrowser } from '@angular/common';
> import { PLATFORM_ID, inject } from '@angular/core';
>
> const platformId = inject(PLATFORM_ID);
> if (isPlatformBrowser(platformId)) {
>   window.gtag('event', 'page_view');  // only runs in browser
> }
> \`\`\`

**Q4: How does Angular 17+ per-route rendering mode work?**
> **A:** Angular 17+ allows each route to declare its rendering mode: routeConfig.renderMode = RenderMode.Server (SSR per request), RenderMode.Prerender (SSG, rendered at build time), or RenderMode.Client (CSR, no server rendering). You can mix modes: marketing pages use Prerender (CDN-served, fast), authenticated dashboards use Client (personalised, no server needed), product pages use Server (dynamic but SEO-friendly). This granularity replaces the "SSR everything or nothing" trade-off.

**Q5: FAANG-grade definition of Angular Universal.**
> **A:** "Angular Universal (now Angular SSR) renders Angular applications on Node.js servers using platform-server, producing complete HTML responses for initial requests — enabling improved Time To First Byte, First Contentful Paint, and SEO crawlability — with Angular 16+ non-destructive hydration reusing server-rendered DOM nodes to attach event listeners without re-rendering — Angular 17+ per-route rendering modes (Server, Prerender/SSG, Client) for granular rendering strategy — and the TransferState API for passing server-fetched data to the client to prevent duplicate API calls during hydration."`,

    build: `## BUILD

### 🏗️ Mini Project: SSR Angular App With Hydration and TransferState

**What you will build:** An Angular SSR app that: renders a product list server-side (full HTML sent to browser), uses TransferState to pass server-fetched data to the client (preventing duplicate API calls), and handles browser-only API guards with isPlatformBrowser.
**Why this project:** Forces SSR setup, TransferState, and platform API guards — the three SSR essentials.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new ssr-demo --standalone --routing --ssr
# OR add SSR to existing app:
ng add @angular/ssr
\`\`\`

#### Step 2 — Products With TransferState
\`\`\`typescript
// products.service.ts
import { Injectable, inject, makeStateKey, TransferState } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

export interface Product { id: number; title: string; price: number; }
const PRODUCTS_KEY = makeStateKey<Product[]>('products');

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);

  getProducts(): Observable<Product[]> {
    const cached = this.transferState.get(PRODUCTS_KEY, null);
    if (cached) {
      this.transferState.remove(PRODUCTS_KEY);  // use once, then clear
      return of(cached);
    }
    return this.http.get<Product[]>('https://fakestoreapi.com/products').pipe(
      tap(products => this.transferState.set(PRODUCTS_KEY, products)),
    );
  }
}
\`\`\`

#### Step 3 — Products Component (Server + Client)
\`\`\`typescript
// products.component.ts
import { Component, inject, PLATFORM_ID, OnInit, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgFor, NgIf } from '@angular/common';
import { ProductsService } from '../products.service';

@Component({
  standalone: true,
  imports: [NgFor, NgIf],
  template: \`
    <h1>Products (SSR Demo)</h1>
    <p *ngIf="isLoading()">Loading...</p>
    <ul>
      <li *ngFor="let p of products()">
        {{ p.title }} — {{ p.price | currency }}
      </li>
    </ul>
    <!-- Only shown in browser, never on server -->
    <p *ngIf="isBrowser">Rendered in: Browser</p>
  \`,
})
export class ProductsComponent implements OnInit {
  private productsService = inject(ProductsService);
  private platformId = inject(PLATFORM_ID);
  products = signal<any[]>([]);
  isLoading = signal(true);
  isBrowser = isPlatformBrowser(this.platformId);

  ngOnInit() {
    this.productsService.getProducts().subscribe(products => {
      this.products.set(products);
      this.isLoading.set(false);
    });
  }
}
\`\`\`

#### Step 4 — Browser API Guard
\`\`\`typescript
// analytics.service.ts — safe for SSR
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);

  track(eventName: string, props?: Record<string, unknown>) {
    if (!isPlatformBrowser(this.platformId)) return;  // no-op on server
    console.log('[Analytics]', eventName, props);
    // window.gtag is safe here
  }
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
describe('ProductsService (SSR)', () => {
  it('uses TransferState on client to avoid duplicate HTTP call', () => {
    const state = TestBed.inject(TransferState);
    state.set(PRODUCTS_KEY, [{ id: 1, title: 'A', price: 10 }]);
    const service = TestBed.inject(ProductsService);
    const http = TestBed.inject(HttpTestingController);
    let result: any;
    service.getProducts().subscribe(r => result = r);
    http.expectNone('https://fakestoreapi.com/products');  // no HTTP call!
    expect(result[0].title).toBe('A');
  });
});
\`\`\`

**Expected Output:**
\`\`\`
npm run build && npm run serve:ssr
curl http://localhost:4000 | grep "<li>"
  -> Products listed in HTML (SSR working)

DevTools Network:
  First load: HTML includes product list (SSR)
  No duplicate /products API call in browser (TransferState)
\`\`\`

**Stretch Challenges:**
- [ ] Add per-route rendering mode: prerender the products page at build time
- [ ] Add a meta service for dynamic SSR-friendly SEO tags
- [ ] Deploy to Vercel/Cloud Run and measure LCP improvement vs CSR`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between SSR, SSG, and CSR?
**Q2:** What is hydration and how does it improve SSR performance?
**Q3:** What browser API pitfall must you guard against in Angular Universal? From memory.

### Day 3 — Comprehension
**Q4:** What is TransferState and why does it prevent duplicate API calls?
**Q5:** A junior uses window.localStorage in ngOnInit — crashes on SSR. Fix.
**Q6:** What Angular 17+ feature lets you choose SSR mode per route?

### Day 7 — Application
**Q7:** Add SSR to an existing Angular app and fix all browser-only API usages.
**Q8:** Measure First Contentful Paint before and after enabling SSR.
**Q9:** How do you add dynamic SEO meta tags in Angular SSR?

### Day 14 — Synthesis
**Q10:** ★ Interview: "What is Angular hydration — how does it work and what problems does it solve?"
**Q11:** Draw: request flow from browser to Node.js server to Angular render to hydrated client.
**Q12:** ★ System design: "Choose a rendering strategy for an e-commerce site — product catalogue, cart, checkout, account pages."`
  },

  // ── 30. micro-frontends-angular ─────────────────────────────────────────
  'micro-frontends-angular': {
    feynman: `## FEYNMAN CHECK

### Explain Angular Micro-Frontends Like I'm 10 Years Old
> Micro-frontends split a LARGE web application into smaller, independently-deployable frontend apps — each owned by a different team. Instead of one monolithic Angular app, you have 5 teams each with their own Angular app (checkout team, catalog team, account team, etc.), each deployable independently. Module Federation (webpack feature) is the key technology: it lets one Angular app LOAD COMPONENTS from another app at runtime — the host app doesn't know anything about the remote app at build time. The non-obvious depth: micro-frontends solve ORGANISATIONAL problems (independent deploys, team autonomy), not technical ones. They add complexity (shared state, style isolation, version mismatches). Only use them if team independence is genuinely blocked by a monolith.

---

### 5 Deep Conceptual Questions

**Q1: How does Module Federation work in Angular?**
> **A:** Module Federation is a webpack plugin that enables RUNTIME code sharing between separately-built JavaScript bundles. The HOST app declares remotes: { checkout: 'http://checkout.example.com/remoteEntry.js' }. The REMOTE app exposes: { checkout: './CheckoutModule' }. At runtime, when the host navigates to /checkout, webpack fetches remoteEntry.js from the checkout server, downloads the chunk, and instantiates the component. The Angular Router integrates via loadRemoteModule() helper: { path: 'checkout', loadChildren: () => loadRemoteModule({ remoteEntry: '...' }) }. Each remote can be deployed independently.

**Q2: Mental model for shared dependencies in Module Federation?**
> **A:** If both host and remote use Angular 17, you don't want TWO copies of Angular in the browser. Module Federation's shared: singleton configuration tells webpack to share dependencies: shared: { '@angular/core': { singleton: true, strictVersion: true } }. The first loaded version is used by all remotes. strictVersion: true ensures version mismatch causes an error (not silent failure). The risk: if checkout team uses Angular 17 and catalog team uses Angular 18, one must upgrade. This is the main TECHNICAL challenge of micro-frontends — shared library versioning.

**Q3: Most dangerous misconception about Angular micro-frontends?**
> **A:** Micro-frontends are simpler than a monolith:
> \`\`\`
> // Monolith (what teams think they're escaping):
> - One deployment per release
> - Teams must coordinate code changes
>
> // Micro-frontends (what teams often get instead):
> - N deployments per release (more complex CI/CD)
> - Shared state management (how does checkout know cart contents?)
> - Style conflicts (two Angular apps, two sets of CSS)
> - Performance: users download N separate bundles
> - Version mismatches: Angular 17 + Angular 18 in one page
> - Testing: hard to test cross-team interactions
>
> // Only justified when: genuine deploy-blocking team coupling exists
> // Not justified for: "we want to use different frameworks"
> \`\`\`

**Q4: How do micro-frontends share state and communicate?**
> **A:** Options in decreasing coupling order: (1) URL/route params — stateless, works well, no coupling. (2) Browser events (CustomEvent) — decoupled, asynchronous. (3) Shared state via a separately-hosted state service module. (4) Native Federation events API. Avoid: direct cross-remote Angular service injection (tight coupling, breaks federation independence). The architectural principle: micro-frontends should communicate via EVENTS and SHARED APIS, not shared Angular services.

**Q5: FAANG-grade definition of Angular micro-frontends.**
> **A:** "Angular micro-frontends use Module Federation (webpack/rspack plugin) to compose independently-deployable Angular applications at runtime — a host shell app loading remote Angular components/routes via loadRemoteModule() pointing to remote entry points (remoteEntry.js) — with singleton shared dependencies (Angular core, CDK) to prevent duplicate framework instances — Native Federation (@angular-architects/native-federation) providing an ES Modules-based alternative — appropriate for large organisations (50+ engineers, 5+ teams) where independent deployment velocity is genuinely blocked by a monolith, not as a technical solution to a non-existent problem."`,

    build: `## BUILD

### 🏗️ Mini Project: Module Federation Shell + Two Remotes

**What you will build:** A host shell Angular app loading two remote Angular apps (Products and Cart) via Module Federation — each independently buildable and deployable.
**Why this project:** Forces complete Module Federation setup — the full micro-frontend lifecycle.
**Time estimate:** 50 minutes

---

#### Step 1 — Setup Three Apps
\`\`\`bash
# Shell (host)
ng new mfe-shell --standalone --routing
cd mfe-shell && npm install @angular-architects/module-federation
ng add @angular-architects/module-federation --project mfe-shell --port 4200 --type host

# Products remote
cd .. && ng new mfe-products --standalone --routing
cd mfe-products && npm install @angular-architects/module-federation
ng add @angular-architects/module-federation --project mfe-products --port 4201 --type remote

# Cart remote
cd .. && ng new mfe-cart --standalone --routing
cd mfe-cart && npm install @angular-architects/module-federation
ng add @angular-architects/module-federation --project mfe-cart --port 4202 --type remote
\`\`\`

#### Step 2 — Remote: Products webpack.config.js
\`\`\`javascript
// mfe-products/webpack.config.js
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
module.exports = withModuleFederationPlugin({
  name: 'mfeProducts',
  exposes: {
    './ProductsModule': './src/app/products/products.routes.ts',
  },
  shared: { ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }) },
});
\`\`\`

#### Step 3 — Shell: Host Routes
\`\`\`typescript
// mfe-shell/src/app/app.routes.ts
import { loadRemoteModule } from '@angular-architects/module-federation';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'products',
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: 'http://localhost:4201/remoteEntry.js',
      exposedModule: './ProductsModule',
    }).then(m => m.PRODUCTS_ROUTES),
  },
  {
    path: 'cart',
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: 'http://localhost:4202/remoteEntry.js',
      exposedModule: './CartModule',
    }).then(m => m.CART_ROUTES),
  },
];
\`\`\`

#### Step 4 — Cross-MFE Communication via Events
\`\`\`typescript
// Shared event bus via Custom Events
export const CartEvents = {
  addItem: (item: any) => {
    window.dispatchEvent(new CustomEvent('cart:add', { detail: item }));
  },
  onItemAdded: (handler: (item: any) => void) => {
    window.addEventListener('cart:add', (e: any) => handler(e.detail));
  },
};

// Products remote: fire event when item added
addToCart(product: Product) {
  CartEvents.addItem(product);
}

// Cart remote: listen for events
ngOnInit() {
  CartEvents.onItemAdded(item => this.cart.addItem(item));
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
// Test the routing in isolation (no remote needed)
it('navigates to products route', fakeAsync(() => {
  const router = TestBed.inject(Router);
  TestBed.configureTestingModule({
    imports: [RouterTestingModule.withRoutes(routes)],
  });
  router.navigateByUrl('/products');
  tick();
  // Module federation loading is mocked in unit tests
  expect(router.url).toBe('/products');
}));
\`\`\`

**Expected Output:**
\`\`\`
# Start all three servers:
cd mfe-products && npm start &
cd mfe-cart && npm start &
cd mfe-shell && npm start

# Shell at :4200 loads products remote at :4201
# Navigate /products -> loads Products MFE
# Navigate /cart -> loads Cart MFE
# Add item in Products -> CartEvents fires -> Cart MFE updates count
\`\`\`

**Stretch Challenges:**
- [ ] Add Native Federation (@angular-architects/native-federation) instead of webpack Module Federation
- [ ] Add a shared authentication service module loaded by both remotes
- [ ] Add a CI/CD pipeline that deploys each remote independently`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What problem do micro-frontends solve?
**Q2:** What is Module Federation and how does loadRemoteModule work?
**Q3:** How should micro-frontends communicate with each other? From memory.

### Day 3 — Comprehension
**Q4:** What is the singleton shared dependency problem in Module Federation?
**Q5:** A junior implements micro-frontends to "use different frameworks per team" — explain the real cost.
**Q6:** What is the difference between webpack Module Federation and Native Federation?

### Day 7 — Application
**Q7:** Build a shell + one remote and load it at runtime.
**Q8:** Two remotes use different versions of Angular — what happens and how do you fix it?
**Q9:** How do you handle authentication state shared across all remotes?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain the micro-frontend pattern — when is it appropriate and what are the risks?"
**Q11:** Draw: Module Federation runtime loading — host, remoteEntry.js, webpack chunks.
**Q12:** ★ System design: "Architect a micro-frontend e-commerce platform for 5 teams — shell, routing, shared state, auth, deployment."`
  },

  // ── 31. monorepo-nx ──────────────────────────────────────────────────────
  'monorepo-nx': {
    feynman: `## FEYNMAN CHECK

### Explain Nx Monorepo Like I'm 10 Years Old
> Nx is a build system and monorepo tool that keeps MULTIPLE Angular apps and shared libraries in ONE repository. Instead of 5 separate repos for 5 apps, you have one repo where all apps can share code (a common UI library, auth utilities, API types) without publishing to npm. Nx adds: smart caching (only rebuild what changed), affected analysis (only test affected projects), code generators, and a dependency graph visualiser. The non-obvious depth: Nx's affected analysis works by building a dependency graph from your import statements. If you change a shared library, Nx runs tests only for all apps/libraries that import it — not for unrelated ones. This can reduce CI time from 30 minutes to 3 minutes on large repos.

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between an Nx app and an Nx library?**
> **A:** An APP is deployable — it has a build target producing a dist folder. A LIBRARY is a collection of reusable code — it doesn't deploy on its own but is imported by apps and other libraries. Nx enforces library access rules via tags: { "sourceTag": "scope:shared" } ensures only allowed consumers import it. Library types by convention: feature (smart component + routing), UI (presentational components), data-access (services, state), util (pure functions), shell (composition). This separation prevents spaghetti dependencies.

**Q2: Mental model for Nx computation cache?**
> **A:** Nx caches the OUTPUT of tasks (build, test, lint) keyed by the HASH of: source files, task config, environment. If nothing in the hash changed, Nx replays the cached output instead of running the task. Remote cache (Nx Cloud) shares the cache across machines — a developer or CI run benefits from cache produced by other developers or CI runs. Practical result: nx affected:test after a small change runs in seconds instead of minutes because most tests are served from cache.

**Q3: Most dangerous misconception about Nx monorepos?**
> **A:** Nx monorepos eliminate all coordination overhead:
> \`\`\`
> // Nx solves: code sharing, incremental builds, consistent tooling
>
> // Nx does NOT solve:
> // - Too many PRs landing on the same library simultaneously (merge conflicts)
> // - Breaking changes in shared libraries affect ALL consumers at once
> // - CI still runs affected tests for everyone if a widely-used lib changes
>
> // Solution: well-defined library boundaries, backward-compatible changes,
> // versioning policies for shared libs, and feature flags for gradual rollouts
> \`\`\`

**Q4: How does Nx enforce architectural boundaries?**
> **A:** @nx/enforce-module-boundaries ESLint rule reads the nx.json project tags and the constraints array. Example constraint: { sourceTag: 'scope:feature', onlyDependOn: ['scope:ui', 'scope:util'] } prevents feature libs from importing other feature libs. This is CHECKED at lint time — violations fail CI before code reaches review. This enforces the Hexagonal Architecture or Clean Architecture patterns programmatically — developers cannot accidentally create circular dependencies between layers.

**Q5: FAANG-grade definition of Nx Monorepo.**
> **A:** "Nx is a smart monorepo build system for JavaScript/TypeScript projects — providing workspace management for multiple applications and libraries in a single repository, computation caching (local + Nx Cloud remote cache) via task output hashing, project graph-based affected analysis (nx affected runs only tasks for changed projects and their dependents), code generators (nx generate), architectural boundary enforcement via @nx/enforce-module-boundaries ESLint rules with tag-based constraints, and first-class Angular support via @nx/angular plugin — enabling large organisations to scale development velocity without sacrificing build performance."`,

    build: `## BUILD

### 🏗️ Mini Project: Nx Workspace With Shell App + Shared UI Library + Feature Library

**What you will build:** An Nx workspace with: one Angular shell app, one shared UI library (button, card components), one feature library (user-feature with UserListComponent + UserService) — with module boundaries enforced via tags.
**Why this project:** Forces the complete Nx library structure and boundary enforcement pattern.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-nx-workspace@latest nx-demo --preset=angular-standalone --appName=shell --bundler=esbuild
cd nx-demo

# Generate libraries
nx generate @nx/angular:library --name=shared/ui --directory=libs/shared/ui --standalone --tags=scope:shared,type:ui
nx generate @nx/angular:library --name=feature/users --directory=libs/feature/users --standalone --tags=scope:feature,type:feature
\`\`\`

#### Step 2 — Shared UI Library: Button Component
\`\`\`typescript
// libs/shared/ui/src/lib/button/button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: true,
  selector: 'ui-button',
  template: '<button [class]="variant" [disabled]="disabled" (click)="clicked.emit()"><ng-content/></button>',
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();
}

// libs/shared/ui/src/index.ts — public API
export { ButtonComponent } from './lib/button/button.component';
\`\`\`

#### Step 3 — Feature Library: Users
\`\`\`typescript
// libs/feature/users/src/lib/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User { id: number; name: string; email: string; }

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  getUsers() { return this.http.get<User[]>('https://jsonplaceholder.typicode.com/users'); }
}

// libs/feature/users/src/lib/user-list/user-list.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { ButtonComponent } from '@nx-demo/shared/ui';  // cross-library import
import { UserService } from '../user.service';

@Component({
  standalone: true,
  selector: 'feature-user-list',
  imports: [NgFor, ButtonComponent],
  template: \`
    <h2>Users</h2>
    <ul><li *ngFor="let user of users">{{ user.name }}</li></ul>
    <ui-button variant="primary" (clicked)="load()">Reload</ui-button>
  \`,
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  private userService = inject(UserService);
  ngOnInit() { this.load(); }
  load() { this.userService.getUsers().subscribe(u => this.users = u); }
}
\`\`\`

#### Step 4 — Enforce Module Boundaries
\`\`\`json
// .eslintrc.json — boundary rules
{
  "rules": {
    "@nx/enforce-module-boundaries": ["error", {
      "enforceBuildableLibDependency": true,
      "depConstraints": [
        { "sourceTag": "type:feature", "onlyDependOn": ["type:ui", "type:util"] },
        { "sourceTag": "type:ui", "onlyDependOn": ["type:util"] },
        { "sourceTag": "scope:feature", "notDependOn": ["scope:feature"] }
      ]
    }]
  }
}
\`\`\`

#### Step 5 — Nx Commands
\`\`\`bash
# Show dependency graph
nx graph

# Build only affected projects
nx affected:build --base=main

# Test only affected projects
nx affected:test --base=main

# Run everything in parallel
nx run-many --target=test --all --parallel=5

# Check boundary violations
nx lint

# Output:
# nx graph -> visual dependency graph in browser
# nx affected:test -> only tests affected by your changes
\`\`\`

**Expected Output:**
\`\`\`
nx graph: shell -> feature/users -> shared/ui (correct dependency direction)
Boundary violation: feature/users imports another feature lib -> lint error
nx affected:test: only runs tests for changed libs and their consumers
\`\`\`

**Stretch Challenges:**
- [ ] Add Nx Cloud and share cache across team members
- [ ] Add a data-access library and enforce it can only be used by feature libs
- [ ] Add a publishable library and configure it for npm publishing`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is the difference between an Nx app and an Nx library?
**Q2:** What is nx affected and when does it save time?
**Q3:** Write the nx generate command for a standalone Angular library. From memory.

### Day 3 — Comprehension
**Q4:** How does Nx computation cache work — what does it hash?
**Q5:** A junior creates a circular dependency between two libraries — how does Nx catch it?
**Q6:** What are the four common Nx library types?

### Day 7 — Application
**Q7:** Set up module boundary rules preventing feature libs from importing other feature libs.
**Q8:** A CI pipeline takes 45 minutes for a 20-app repo — how does Nx affected reduce this?
**Q9:** What is Nx Cloud and how does it extend caching?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Nx monorepo architecture — how do library tags and module boundaries enforce clean architecture?"
**Q11:** Draw: Nx dependency graph for a 5-app, 10-library workspace.
**Q12:** ★ System design: "Migrate a 5-team, 5-repo Angular organisation to a Nx monorepo — risks, migration plan, boundary strategy."`
  },

  // ── 32. angular-cdktesting ───────────────────────────────────────────────
  'angular-cdktesting': {
    feynman: `## FEYNMAN CHECK

### Explain Angular CDK Testing Like I'm 10 Years Old
> Angular CDK Testing provides COMPONENT HARNESSES — a stable testing API that abstracts over the component's internal DOM. Instead of fixture.nativeElement.querySelector('.mat-button .mdc-button__label'), you write (await loader.getHarness(MatButtonHarness)).getText(). Harnesses give you: semantic queries (get a button by its text, not its CSS class), automatic async handling (no need to call detectChanges or waitForAsync manually), resilience to HTML structure changes, and the same test code running in both the DOM (real browser/jsdom) and headless environments. Angular Material ships harnesses for every component; you can write custom harnesses for your own components.

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between harness testing and direct DOM querying?**
> **A:** Direct DOM querying (fixture.nativeElement.querySelector('.mat-input-element')) is BRITTLE — it depends on Angular Material's internal CSS class names, which may change between versions. Harness queries (loader.getHarness(MatInputHarness).then(h => h.getValue())) are SEMANTIC — they use the component's public API, not internal implementation. When Angular Material 15 changed from MDC to non-MDC components (renaming CSS classes), tests using DOM queries broke; tests using harnesses continued to work.

**Q2: Mental model for HarnessLoader and ComponentHarness?**
> **A:** TestbedHarnessEnvironment.loader(fixture) creates a HarnessLoader scoped to the component's DOM. loader.getHarness(MatButtonHarness) finds the FIRST MatButton and returns its harness. loader.getAllHarnesses(MatButtonHarness) finds ALL buttons. A ComponentHarness wraps a component and exposes semantic methods: click(), getText(), getValue(), isDisabled(), isFocused(). For your own components: extend ComponentHarness with a static hostSelector and add methods wrapping nativeElement interactions.

**Q3: Most dangerous misconception about CDK testing?**
> **A:** CDK harnesses replace all DOM testing:
> \`\`\`typescript
> // WRONG: trying to use harnesses for everything
> const harness = await loader.getHarness(MatTableHarness);
> const rows = await harness.getRows();
> // This works but is slow for large tables
>
> // CORRECT: use harnesses for components with complex interaction semantics
> // (date pickers, autocomplete, dialogs, form fields)
>
> // Use direct DOM queries for:
> // - Custom components without harnesses
> // - Simple presence/text assertions
> // - Performance-sensitive tests with many elements
>
> // Harnesses shine for: form interaction, dialog opening/closing, Material components
> \`\`\`

**Q4: How do custom component harnesses work?**
> **A:** Extend ComponentHarness, set static hostSelector to your component's selector, and implement methods that delegate to locator APIs: async getButtonText() { return (await this.locatorFor('button')()).text(); }. Register the harness with ComponentHarnessConstructor. Tests use loader.getHarness(MyButtonHarness) the same way they use Material harnesses. Custom harnesses make your component's test API stable — consumers test behaviour, not implementation — enabling refactoring without breaking tests.

**Q5: FAANG-grade definition of Angular CDK Testing.**
> **A:** "Angular CDK Component Test Harnesses provide a stable, semantic testing layer above component DOM — ComponentHarness subclasses exposing the component's public interaction API (click, getValue, isDisabled, setText) via HarnessLoader (TestbedHarnessEnvironment for unit, ProtractorHarnessEnvironment/PlaywrightHarnessEnvironment for E2E) — shielding tests from internal DOM structure changes, automatically handling async operations, and enabling the same test code across DOM environments — with Angular Material shipping harnesses for all 50+ components and a ComponentHarness base class enabling custom harnesses for application components."`,

    build: `## BUILD

### 🏗️ Mini Project: Custom Harness + Material Harnesses for a Search Form

**What you will build:** Tests for a search form using MatInputHarness + MatButtonHarness + a custom SearchFormHarness — demonstrating the harness pattern at both library-component and custom-component level.
**Why this project:** Forces the full harness pattern — Material harnesses for library components, custom harness for your own component.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new harness-demo --standalone --routing false
ng add @angular/material
ng generate component search-form --standalone
\`\`\`

#### Step 2 — Search Form Component
\`\`\`typescript
// search-form.component.ts
import { Component, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-search-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, NgIf],
  template: \`
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>Search</mat-label>
        <input matInput formControlName="query" data-testid="search-input">
        <mat-error *ngIf="form.get('query')?.errors?.['required']">Required</mat-error>
        <mat-error *ngIf="form.get('query')?.errors?.['minlength']">Min 3 chars</mat-error>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Search</button>
    </form>
  \`,
})
export class SearchFormComponent {
  private fb = inject(FormBuilder);
  @Output() searched = new EventEmitter<string>();

  form = this.fb.group({
    query: ['', [Validators.required, Validators.minLength(3)]],
  });

  onSubmit() { if (this.form.valid) this.searched.emit(this.form.value.query!); }
}
\`\`\`

#### Step 3 — Custom SearchForm Harness
\`\`\`typescript
// search-form.harness.ts
import { ComponentHarness } from '@angular/cdk/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatErrorHarness } from '@angular/material/form-field/testing';

export class SearchFormHarness extends ComponentHarness {
  static hostSelector = 'app-search-form';

  private getInput = this.locatorFor(MatInputHarness);
  private getButton = this.locatorFor(MatButtonHarness);

  async setQuery(value: string) { return (await this.getInput()).setValue(value); }
  async getQuery() { return (await this.getInput()).getValue(); }
  async clickSearch() { return (await this.getButton()).click(); }
  async isSearchDisabled() { return (await this.getButton()).isDisabled(); }
  async getErrors() {
    const errors = await this.locatorForAll(MatErrorHarness)();
    return Promise.all(errors.map(e => e.getText()));
  }
}
\`\`\`

#### Step 4 — Tests Using Harnesses
\`\`\`typescript
// search-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { SearchFormHarness } from './search-form.harness';
import { SearchFormComponent } from './search-form.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SearchFormComponent (with harness)', () => {
  let fixture: ComponentFixture<SearchFormComponent>;
  let harness: SearchFormHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFormComponent, NoopAnimationsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(SearchFormComponent);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    harness = await loader.getHarness(SearchFormHarness);
  });

  it('disables search button when form is empty', async () => {
    expect(await harness.isSearchDisabled()).toBe(true);
  });

  it('disables search when query is too short', async () => {
    await harness.setQuery('ab');
    expect(await harness.isSearchDisabled()).toBe(true);
  });

  it('enables search when query is valid', async () => {
    await harness.setQuery('angular');
    expect(await harness.isSearchDisabled()).toBe(false);
  });

  it('emits searched event with query', async () => {
    const emits: string[] = [];
    fixture.componentInstance.searched.subscribe((q: string) => emits.push(q));
    await harness.setQuery('angular testing');
    await harness.clickSearch();
    expect(emits).toEqual(['angular testing']);
  });
});
\`\`\`

#### Step 5 — Harness vs DOM Query Comparison
\`\`\`typescript
// WITHOUT harness — brittle DOM query
it('brittle test', () => {
  const input = fixture.nativeElement.querySelector('.mat-mdc-input-element');
  input.value = 'angular';
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
  const button = fixture.nativeElement.querySelector('.mdc-button--raised');
  expect(button.disabled).toBe(false);
  // These CSS classes change between Angular Material versions!
});

// WITH harness — stable semantic query (see above)
\`\`\`

**Expected Output:**
\`\`\`
disables search button when form is empty ✓
disables search when query too short ✓
enables search when valid ✓
emits searched event ✓
All tests pass without CSS class dependency
\`\`\`

**Stretch Challenges:**
- [ ] Add a MatSelectHarness test for a search filter dropdown
- [ ] Build a harness for a custom data-table component
- [ ] Run the same harness tests in a Playwright E2E environment`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is a component harness and why is it better than DOM querying?
**Q2:** How do you get a MatButtonHarness in a test?
**Q3:** Write the minimal custom ComponentHarness class. From memory.

### Day 3 — Comprehension
**Q4:** When would you use direct DOM queries instead of harnesses?
**Q5:** A team updates Angular Material and half their tests break — explain why.
**Q6:** What does locatorFor() do in a custom harness?

### Day 7 — Application
**Q7:** Write a complete harness for a custom autocomplete component.
**Q8:** A PR tests a MatDialog by querying DOM CSS classes — why will this break?
**Q9:** How do you test a harness's async methods without calling detectChanges manually?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Angular CDK component harnesses — what problem they solve and how to write a custom harness."
**Q11:** Draw: harness class hierarchy — ComponentHarness, HarnessLoader, TestbedHarnessEnvironment.
**Q12:** ★ System design: "Design a test harness library for a custom Angular component library — coverage, stability, migration path."`
  },

  // ── 33. zonejs-deep ──────────────────────────────────────────────────────
  'zonejs-deep': {
    feynman: `## FEYNMAN CHECK

### Explain Zone.js Deep Like I'm 10 Years Old
> Zone.js is a JavaScript library that MONKEY-PATCHES every async API in the browser — setTimeout, Promises, XMLHttpRequest, DOM events, fetch — to wrap them with notification hooks. When any async operation completes, Zone.js fires an "async done" notification. Angular's NgZone listens for this notification and triggers change detection. Without Zone.js, Angular wouldn't know when to update the screen after a network response arrives — you'd have to manually call detectChanges(). The non-obvious depth: Zone.js is an invisible monkey-patcher. It replaces the global setTimeout with its own wrapped version — every third-party library that uses setTimeout now runs inside Zone.js's tracking. This is why Angular's change detection "just works" for any async code, but also why Zone.js adds startup overhead and wraps every async call with extra code.

---

### 5 Deep Conceptual Questions

**Q1: What does Zone.js actually patch?**
> **A:** Zone.js patches all browser async APIs: setTimeout/setInterval/clearTimeout, requestAnimationFrame, MutationObserver, IntersectionObserver, Promise.then/catch/finally, XMLHttpRequest.open/send, fetch, EventTarget.addEventListener/removeEventListener, and all Node.js async APIs when running in Node. It does this at STARTUP by replacing the global function references. Any code running after Zone.js loads uses the patched versions, triggering zone tracking. Third-party libraries using these APIs are automatically tracked — no configuration needed.

**Q2: Mental model for NgZone and zone.run()?**
> **A:** NgZone wraps Angular's change detection in a Zone.js zone. Any async operation INSIDE the Angular zone triggers change detection when it completes. zone.runOutsideAngular(() => { heavyWork() }) runs code OUTSIDE the Angular zone — no change detection triggered for async operations in that block. Use this for: continuous animations (requestAnimationFrame loops), WebSocket message handlers, WebWorker communication, intensive computations that update the view only occasionally. zone.run(() => { updateUIState() }) re-enters the Angular zone to trigger change detection at the right moment.

**Q3: Most dangerous misconception about Zone.js?**
> **A:** Zone.js has zero performance overhead:
> \`\`\`typescript
> // Zone.js overhead is real and measurable:
> // 1. Startup: Zone.js adds ~15KB to bundle and patches 40+ APIs at boot
> // 2. Per-call: each async call has Zone.js wrapper overhead
> // 3. CD triggering: every microtask completion triggers Angular CD check
>
> // For high-frequency scenarios:
> // ❌ WebSocket receiving 100 messages/second -> 100 CD cycles/second
>
> // ✅ Run WebSocket outside Angular zone:
> this.ngZone.runOutsideAngular(() => {
>   this.socket.on('message', (msg) => {
>     this.messages.push(msg);  // no CD triggered
>     if (this.messages.length % 10 === 0) {
>       this.ngZone.run(() => this.latestMessages = [...this.messages]);  // CD only every 10
>     }
>   });
> });
> \`\`\`

**Q4: How does zoneless Angular work without Zone.js?**
> **A:** Angular 18+ supports zoneless mode via provideExperimentalZonelessChangeDetection(). Without Zone.js, change detection is triggered ONLY by: signal changes (reactive), markForCheck() explicit calls, ChangeDetectorRef.markForCheck() in OnPush components, and Angular's own lifecycle hooks. All async code must use signals or explicitly mark for check. Signals make this practical — signal.set() automatically marks components as dirty. Zoneless Angular: ~15KB smaller bundle, no monkey-patching startup cost, faster async operations, but requires all state updates to flow through signals or explicit marking.

**Q5: FAANG-grade definition of Zone.js in Angular.**
> **A:** "Zone.js is a JavaScript execution context library that monkey-patches browser async APIs (setTimeout, Promise, XHR, fetch, DOM events) at startup — creating execution zones that track async operations and fire onMicrotaskEmpty/onStable events that Angular's NgZone uses to trigger change detection — enabling automatic UI updates after any async operation without manual detectChanges() calls — with NgZone.runOutsideAngular() for performance-critical code that should not trigger CD, NgZone.run() to re-enter for explicit CD triggering — and Angular 18+ zoneless mode (provideExperimentalZonelessChangeDetection) replacing Zone.js entirely with signals-based reactive CD for smaller bundles and reduced async overhead."`,

    build: `## BUILD

### 🏗️ Mini Project: Zone.js Performance Lab — Inside vs Outside Angular Zone

**What you will build:** An app with three scenarios: (1) WebSocket messages triggering too many CD cycles (baseline), (2) WebSocket outside zone with batched updates (optimised), (3) Signals-based version (optimal) — with CD cycle counting to measure the difference.
**Why this project:** Makes Zone.js overhead observable with measurable CD cycle counts.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
ng new zonejs-demo --standalone --routing false
cd zonejs-demo
ng generate component message-feed --standalone
\`\`\`

#### Step 2 — Message Feed Baseline (inside zone — too many CD cycles)
\`\`\`typescript
// message-feed.component.ts
import { Component, NgZone, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-message-feed',
  imports: [NgFor],
  template: \`
    <h2>Message Feed (CD cycles: {{ cdCount }})</h2>
    <p>Strategy: {{ strategy }}</p>
    <button (click)="startFeed()">Start</button>
    <button (click)="stopFeed()">Stop</button>
    <ul>
      <li *ngFor="let msg of messages.slice(-5)">{{ msg }}</li>
    </ul>
  \`,
})
export class MessageFeedComponent implements OnDestroy {
  strategy = 'Inside Zone (default)';
  messages: string[] = [];
  cdCount = 0;
  private interval?: ReturnType<typeof setInterval>;
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  ngDoCheck() { this.cdCount++; }

  startFeed() {
    this.strategy = 'Inside Zone (default)';
    // Every setInterval fires inside Zone.js -> triggers CD every 100ms
    this.interval = setInterval(() => {
      this.messages.push('Message ' + this.messages.length + ' at ' + new Date().toISOString());
    }, 100);
  }

  startFeedOptimised() {
    this.strategy = 'Outside Zone (batched)';
    // setInterval outside zone -> no CD triggered
    this.ngZone.runOutsideAngular(() => {
      this.interval = setInterval(() => {
        this.messages.push('Message ' + this.messages.length);
        // Only trigger CD every 10 messages -> 10x fewer CD cycles
        if (this.messages.length % 10 === 0) {
          this.ngZone.run(() => {});  // force single CD cycle
        }
      }, 100);
    });
  }

  stopFeed() { clearInterval(this.interval); }
  ngOnDestroy() { this.stopFeed(); }
}
\`\`\`

#### Step 3 — Signals Version (Optimal — No Zone Needed)
\`\`\`typescript
// signals-feed.component.ts
import { Component, signal, computed, effect, inject, NgZone, OnDestroy } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-signals-feed',
  imports: [NgFor],
  template: \`
    <h2>Signals Feed (targeted updates)</h2>
    <button (click)="start()">Start</button>
    <button (click)="stop()">Stop</button>
    <p>Messages: {{ count() }}</p>
    <ul>
      <li *ngFor="let msg of latestFive()">{{ msg }}</li>
    </ul>
  \`,
})
export class SignalsFeedComponent implements OnDestroy {
  private _messages = signal<string[]>([]);
  count = computed(() => this._messages().length);
  latestFive = computed(() => this._messages().slice(-5));
  private ngZone = inject(NgZone);
  private interval?: ReturnType<typeof setInterval>;

  start() {
    // Even inside zone, signals only update components that read them
    this.interval = setInterval(() => {
      this._messages.update(msgs => [...msgs, 'Signal msg ' + msgs.length]);
    }, 100);
  }

  stop() { clearInterval(this.interval); }
  ngOnDestroy() { this.stop(); }
}
\`\`\`

#### Step 4 — Measurement
\`\`\`typescript
// Add to AppComponent to count CD cycles across strategies
@Component({
  standalone: true,
  imports: [MessageFeedComponent, SignalsFeedComponent],
  template: \`
    <h1>Zone.js Performance Lab</h1>
    <app-message-feed/>
    <app-signals-feed/>
  \`,
})
export class AppComponent {
  ngDoCheck() { console.count('AppComponent CD'); }
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
it('outside zone does not trigger CD directly', fakeAsync(() => {
  const fixture = TestBed.createComponent(MessageFeedComponent);
  const cdSpy = spyOn(fixture.componentInstance, 'ngDoCheck').and.callThrough();
  const ngZone = TestBed.inject(NgZone);
  fixture.detectChanges();
  const before = cdSpy.calls.count();

  // Simulate outside-zone operation
  ngZone.runOutsideAngular(() => {
    fixture.componentInstance.messages.push('test');
  });
  tick(100);
  // CD should NOT have fired for the out-of-zone update
  expect(cdSpy.calls.count()).toBe(before);
}));
\`\`\`

**Expected Output:**
\`\`\`
Start (inside zone): CD cycles increment every 100ms (10/sec)
Open Angular DevTools profiler: constant CD activity

Start optimised (outside zone): CD cycles increment every 1s (batched)
DevTools profiler: 10x fewer CD marks

Signals feed: only the signal-reading components update
\`\`\`

**Stretch Challenges:**
- [ ] Enable zoneless change detection and verify signals still work
- [ ] Remove zone.js from the bundle and measure startup time improvement
- [ ] Add a WebWorker for heavy computation and measure CD isolation`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does Zone.js patch and why?
**Q2:** What is NgZone.runOutsideAngular and when do you use it?
**Q3:** Write the Angular provider for zoneless change detection. From memory.

### Day 3 — Comprehension
**Q4:** A WebSocket handler receives 100 messages/second — how does this affect change detection?
**Q5:** A PR wraps a requestAnimationFrame loop inside an Angular component — diagnose the perf issue.
**Q6:** What is the startup overhead of Zone.js and how does zoneless eliminate it?

### Day 7 — Application
**Q7:** Move a continuous animation loop outside Angular zone and measure CD reduction.
**Q8:** A PR removes Zone.js and CD stops working — what's missing?
**Q9:** How do you trigger one CD cycle after batch-processing 1000 events outside the zone?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain how Zone.js enables Angular change detection — what it patches, when CD fires, and how signals replace it."
**Q11:** Draw: Zone.js async operation tracking — setInterval call, zone notification, Angular CD trigger.
**Q12:** ★ System design: "Design a real-time trading dashboard in Angular — 1000 price updates/second, smooth 60fps rendering, minimal CPU usage."`
  }
};


