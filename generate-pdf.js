const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// COLOUR PALETTE & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const COLORS = {
  brand:       '#1a56db',   // deep blue  – headings, accents
  brandDark:   '#1e3a5f',   // navy       – title page background
  brandLight:  '#e8f0fe',   // pale blue  – section backgrounds
  accent:      '#f59e0b',   // amber      – section numbers, bullets
  accentLight: '#fff8e1',   // light amber– code block background
  codeText:    '#1e3a5f',   // navy       – code text
  bodyText:    '#1f2937',   // dark grey  – body text
  mutedText:   '#6b7280',   // mid grey   – captions
  white:       '#ffffff',
  line:        '#cbd5e1',   // light slate– rules
  success:     '#10b981',   // green      – ✓ markers
  warn:        '#f59e0b',   // amber      – ⚠ markers
};

const MARGIN       = 55;
const PAGE_W       = 595.28;   // A4 points
const PAGE_H       = 841.89;
const CONTENT_W    = PAGE_W - MARGIN * 2;
const CODE_INDENT  = 12;
const FONT_SIZES   = { title: 28, h1: 18, h2: 14, h3: 11, body: 10, small: 8.5, code: 8.5 };

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT SETUP
// ─────────────────────────────────────────────────────────────────────────────
const OUTPUT_PATH = path.join(__dirname, 'ANGULAR_CONCEPTS_GUIDE.pdf');
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
  info: {
    Title:    'Angular Concepts Guide – SupplyChainX Frontend',
    Author:   'SupplyChainX Dev Team',
    Subject:  'Complete Angular Reference',
    Keywords: 'Angular, TypeScript, HTTP Client, JWT, Reactive Forms, Guards',
  },
  autoFirstPage: false,
});
doc.pipe(fs.createWriteStream(OUTPUT_PATH));

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
let tocEntries = [];  // { title, level, page }
let currentPage = 0;

function newPage(skipToc = false) {
  doc.addPage();
  currentPage++;
  drawFooter();
}

function drawFooter() {
  doc
    .save()
    .fontSize(FONT_SIZES.small)
    .fillColor(COLORS.mutedText)
    .text('SupplyChainX Frontend – Angular Concepts Guide', MARGIN, PAGE_H - 35, { width: CONTENT_W - 60, align: 'left' })
    .text(`Page ${currentPage}`, MARGIN, PAGE_H - 35, { width: CONTENT_W, align: 'right' })
    .restore();
}

function sectionHeader(number, title, level = 1) {
  // Add some breathing room
  if (doc.y > PAGE_H - 160) newPage();

  const fontSize     = level === 1 ? FONT_SIZES.h1 : level === 2 ? FONT_SIZES.h2 : FONT_SIZES.h3;
  const badgeColor   = level === 1 ? COLORS.brand : level === 2 ? COLORS.accent : COLORS.mutedText;
  const badgeFg      = COLORS.white;
  const badgeW       = level === 1 ? 30 : level === 2 ? 26 : 22;
  const badgeH       = level === 1 ? 18 : level === 2 ? 16 : 14;

  const xStart = MARGIN;
  const yStart = doc.y + (level === 1 ? 14 : 8);

  // Coloured badge
  doc
    .roundedRect(xStart, yStart, badgeW, badgeH, 3)
    .fill(badgeColor)
    .fillColor(badgeFg)
    .font('Helvetica-Bold')
    .fontSize(level === 1 ? 9 : 8)
    .text(String(number), xStart, yStart + (badgeH - (level === 1 ? 9 : 8)) / 2 + 1, { width: badgeW, align: 'center' });

  // Title text
  doc
    .fillColor(level === 1 ? COLORS.brand : level === 2 ? COLORS.brandDark : COLORS.bodyText)
    .font('Helvetica-Bold')
    .fontSize(fontSize)
    .text(title, xStart + badgeW + 8, yStart + (badgeH - fontSize) / 2, { width: CONTENT_W - badgeW - 8 });

  // Underline for level-1
  if (level === 1) {
    doc.moveTo(xStart, doc.y + 4).lineTo(xStart + CONTENT_W, doc.y + 4).lineWidth(1.5).stroke(COLORS.brand);
    doc.y += 6;
  }
  doc.moveDown(0.4);

  tocEntries.push({ title: (level === 2 ? '  ' : level === 3 ? '    ' : '') + title, level, page: currentPage });
}

function bodyText(text, opts = {}) {
  doc
    .fillColor(opts.color || COLORS.bodyText)
    .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(opts.size || FONT_SIZES.body)
    .text(text, MARGIN, doc.y, { width: CONTENT_W, align: opts.align || 'left', lineGap: 2, ...opts });
  doc.moveDown(0.3);
}

function label(text) {
  doc
    .fillColor(COLORS.brand)
    .font('Helvetica-Bold')
    .fontSize(FONT_SIZES.body)
    .text(text, MARGIN, doc.y, { width: CONTENT_W });
  doc.moveDown(0.15);
}

function codeBlock(lines, lang = '') {
  const lineH   = FONT_SIZES.code + 4;
  const blockH  = lines.length * lineH + 18;

  if (doc.y + blockH > PAGE_H - MARGIN - 20) newPage();

  const x = MARGIN;
  const y = doc.y;
  const w = CONTENT_W;

  // Background
  doc.roundedRect(x, y, w, blockH, 4).fill(COLORS.accentLight);

  // Language tag
  if (lang) {
    doc
      .roundedRect(x + w - 60, y + 4, 54, 12, 2)
      .fill(COLORS.brand)
      .fillColor(COLORS.white)
      .font('Helvetica-Bold')
      .fontSize(6.5)
      .text(lang.toUpperCase(), x + w - 60, y + 6, { width: 54, align: 'center' });
  }

  // Code lines
  doc.font('Courier').fontSize(FONT_SIZES.code).fillColor(COLORS.codeText);
  lines.forEach((line, i) => {
    doc.text(line, x + CODE_INDENT, y + 10 + i * lineH, { width: w - CODE_INDENT * 2, lineBreak: false });
  });

  doc.y = y + blockH + 6;
  doc.moveDown(0.2);
}

function infoBox(text, type = 'info') {
  const bgColor = type === 'info' ? COLORS.brandLight : type === 'success' ? '#d1fae5' : '#fef3c7';
  const bdColor = type === 'info' ? COLORS.brand : type === 'success' ? COLORS.success : COLORS.warn;
  const icon    = type === 'info' ? 'ℹ' : type === 'success' ? '✓' : '⚠';

  const x = MARGIN; const y = doc.y; const w = CONTENT_W;
  const textHeight = doc.heightOfString(text, { width: w - 24 });
  const boxH = textHeight + 18;

  doc.roundedRect(x, y, w, boxH, 4).fill(bgColor);
  doc.moveTo(x, y).lineTo(x, y + boxH).lineWidth(3).stroke(bdColor);

  doc.fillColor(bdColor).font('Helvetica-Bold').fontSize(FONT_SIZES.body)
     .text(icon + '  ', x + 8, y + 8, { continued: true, width: w - 16 });
  doc.fillColor(COLORS.bodyText).font('Helvetica').text(text, { width: w - 24, lineGap: 1.5 });

  doc.y = y + boxH + 8;
}

function bullet(text, sub = false) {
  const indent = sub ? MARGIN + 18 : MARGIN;
  const sym    = sub ? '◦' : '•';
  doc
    .fillColor(COLORS.accent)
    .font('Helvetica-Bold')
    .fontSize(FONT_SIZES.body)
    .text(sym, indent, doc.y, { continued: true, width: 14 });
  doc
    .fillColor(COLORS.bodyText)
    .font('Helvetica')
    .text(' ' + text, { width: CONTENT_W - (indent - MARGIN) - 14, lineGap: 1.5 });
  doc.moveDown(0.15);
}

function divider() {
  doc.moveDown(0.4);
  doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + CONTENT_W, doc.y).lineWidth(0.5).stroke(COLORS.line);
  doc.moveDown(0.5);
}

// ─────────────────────────────────────────────────────────────────────────────
// COVER PAGE
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage();
currentPage++;

// Navy gradient background
doc.rect(0, 0, PAGE_W, PAGE_H).fill(COLORS.brandDark);

// Decorative circles
doc.circle(PAGE_W - 80, 80, 120).fillOpacity(0.08).fill(COLORS.white);
doc.circle(80, PAGE_H - 80, 90).fillOpacity(0.06).fill(COLORS.white);
doc.fillOpacity(1);

// Amber accent bar
doc.rect(MARGIN, 120, 6, 110).fill(COLORS.accent);

// Title
doc
  .fillColor(COLORS.white)
  .font('Helvetica-Bold')
  .fontSize(36)
  .text('Angular Concepts', MARGIN + 20, 125, { width: CONTENT_W - 20 });

doc
  .fillColor(COLORS.accent)
  .font('Helvetica-Bold')
  .fontSize(28)
  .text('Complete Reference Guide', MARGIN + 20, 170, { width: CONTENT_W - 20 });

// Sub-title
doc
  .fillColor('#93c5fd')
  .font('Helvetica')
  .fontSize(14)
  .text('SupplyChainX Frontend Application', MARGIN + 20, 215, { width: CONTENT_W - 20 });

// Horizontal rule
doc.moveTo(MARGIN + 20, 250).lineTo(PAGE_W - MARGIN - 20, 250).lineWidth(1).stroke('#334155');

// Description
doc
  .fillColor('#cbd5e1')
  .font('Helvetica')
  .fontSize(11)
  .text(
    'Every Angular concept listed below is explained with a simple definition and mapped to ' +
    'real code from the SupplyChainX frontend — so you can see exactly how each pattern ' +
    'is used in a production Angular application.',
    MARGIN + 20, 265, { width: CONTENT_W - 40, lineGap: 3 }
  );

// Tag pills
const tags = ['Angular 20', 'TypeScript', 'Reactive Forms', 'JWT Auth', 'HTTP Client', 'Route Guards', 'Bootstrap 5'];
let tx = MARGIN + 20, ty = 350;
tags.forEach(t => {
  const tw = doc.widthOfString(t, { fontSize: 9 }) + 18;
  if (tx + tw > PAGE_W - MARGIN) { tx = MARGIN + 20; ty += 22; }
  doc.roundedRect(tx, ty, tw, 17, 8).fill('#1e40af');
  doc.fillColor('#93c5fd').font('Helvetica-Bold').fontSize(9).text(t, tx + 9, ty + 4, { width: tw - 18, align: 'center' });
  tx += tw + 8;
});

// Stats bar at bottom of cover
const statsY = PAGE_H - 140;
doc.rect(MARGIN, statsY, CONTENT_W, 70).fill('#0f2444');

const stats = [
  { n: '48+', label: 'Concepts Covered' },
  { n: '80+', label: 'Code Examples' },
  { n: '20+', label: 'Components Analysed' },
  { n: '15+', label: 'Services Mapped' },
];
const sw = CONTENT_W / stats.length;
stats.forEach((s, i) => {
  doc.fillColor(COLORS.accent).font('Helvetica-Bold').fontSize(22)
     .text(s.n, MARGIN + i * sw, statsY + 12, { width: sw, align: 'center' });
  doc.fillColor('#93c5fd').font('Helvetica').fontSize(8.5)
     .text(s.label, MARGIN + i * sw, statsY + 38, { width: sw, align: 'center' });
});

// Date
doc.fillColor('#475569').font('Helvetica').fontSize(9)
   .text('Generated: March 2026', MARGIN + 20, PAGE_H - 55, { width: CONTENT_W - 40, align: 'right' });

// ─────────────────────────────────────────────────────────────────────────────
// TABLE OF CONTENTS  (placeholder – we fill page numbers after writing content)
// ─────────────────────────────────────────────────────────────────────────────
newPage();
const TOC_PAGE = currentPage;
doc.fillColor(COLORS.brand).font('Helvetica-Bold').fontSize(FONT_SIZES.h1)
   .text('Table of Contents', MARGIN, MARGIN + 10);
doc.moveDown(0.6);
doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + CONTENT_W, doc.y).lineWidth(1.5).stroke(COLORS.brand);
doc.moveDown(0.8);
// We'll re-open this page later and write TOC entries

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT SECTIONS
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════
// 1. ANGULAR APPLICATION BOOTSTRAPPING
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('1', 'Angular Application Bootstrapping', 1);

label('Definition');
bodyText(
  'Bootstrapping is the process of starting an Angular application. Angular reads the root component ' +
  'and configuration, then launches the app inside the <app-root> HTML element. Modern Angular (v17+) ' +
  'uses the standalone bootstrapApplication() function instead of NgModule.'
);

label('How it works in SupplyChainX');
bodyText('File: src/main.ts  —  Entry point of the application.');
codeBlock([
  "import { bootstrapApplication } from '@angular/platform-browser';",
  "import { registerLocaleData } from '@angular/common';",
  "import localeEnIn from '@angular/common/locales/en-IN';",
  "import { appConfig } from './app/app.config';",
  "import { App } from './app/app';",
  "",
  "registerLocaleData(localeEnIn);          // register Indian locale for pipes",
  "",
  "bootstrapApplication(App, appConfig)     // 🚀 launch the app",
  "  .catch((err) => console.error(err));",
], 'TypeScript');

bodyText('File: src/app/app.config.ts  —  Application-level providers.');
codeBlock([
  "export const appConfig: ApplicationConfig = {",
  "  providers: [",
  "    { provide: LOCALE_ID, useValue: 'en-IN' },",
  "    { provide: DEFAULT_CURRENCY_CODE, useValue: 'INR' },",
  "    provideZoneChangeDetection({ eventCoalescing: true }),",
  "    provideRouter(routes),",
  "    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))",
  "  ]",
  "};",
], 'TypeScript');

infoBox('provideHttpClient() registers the HTTP client globally. withInterceptors() attaches the auth & error interceptors automatically to every request.', 'info');

// ═══════════════════════════════════════════════════════════════════════════
// 2. CREATING A NEW ANGULAR APPLICATION
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('2', 'Creating a New Angular Application', 1);

label('Definition');
bodyText('Angular CLI (Command Line Interface) scaffolds a complete project with one command.');

codeBlock([
  "# Install the CLI globally (once)",
  "npm install -g @angular/cli",
  "",
  "# Create a new project",
  "ng new SupplyChainX-FrontEnd",
  "",
  "# Choose: Would you like to add Angular routing? → Yes",
  "# Choose: Which stylesheet format? → SCSS",
], 'Shell');

label('Key generated files in SupplyChainX');
bullet('angular.json – workspace config (project name: "SupplyChainX-FrontEnd", styleExt: scss)');
bullet('package.json – npm dependencies, Angular 20 used here');
bullet('tsconfig.json – TypeScript compiler options');
bullet('src/main.ts – bootstrapping entry point');
bullet('src/index.html – host HTML with <app-root>');

// ═══════════════════════════════════════════════════════════════════════════
// 3. RUNNING THE DEFAULT APPLICATION
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('3', 'Running the Default Application', 1);

label('Definition');
bodyText('ng serve compiles the app, starts a local dev server and hot-reloads on file changes.');

codeBlock([
  "cd SupplyChainX-FrontEnd",
  "npm start          # runs 'ng serve'",
  "# → http://localhost:4200",
], 'Shell');

label('In SupplyChainX — package.json scripts');
codeBlock([
  '"scripts": {',
  '  "start": "ng serve",',
  '  "build": "ng build",',
  '  "watch": "ng build --watch --configuration development",',
  '  "test":  "ng test"',
  '}',
], 'JSON');

bodyText('The API is consumed from https://localhost:7295/api/ (defined in src/app/settings/app-settings.ts).');

// ═══════════════════════════════════════════════════════════════════════════
// 4. @Component DECORATOR
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('4', '@Component Decorator', 1);

label('Definition');
bodyText(
  '@Component is a TypeScript decorator that marks a class as an Angular component and provides ' +
  'metadata: selector (HTML tag), templateUrl/template (view), styleUrls/styles (CSS), imports (dependencies).'
);

label('Example – LoginComponent');
codeBlock([
  "@Component({",
  "  selector:     'app-login',       // <app-login> in HTML",
  "  standalone:   true,              // no NgModule needed",
  "  imports:      [CommonModule, ReactiveFormsModule],",
  "  templateUrl:  './login.component.html',",
  "  styleUrls:    ['./login.component.scss']",
  "})",
  "export class LoginComponent implements OnInit { ... }",
], 'TypeScript');

label('Example – ToastContainerComponent (inline template)');
codeBlock([
  "@Component({",
  "  selector:  'app-toast-container',",
  "  standalone: true,",
  "  imports:   [CommonModule],",
  "  template: `            // ← inline template",
  "    <div class='toast-container'>",
  "      <div *ngFor='let toast of toasts' class='toast'>",
  "        {{ toast.message }}",
  "      </div>",
  "    </div>`,",
  "  styles: [`  .toast-container { position: fixed; top: 20px; ... } `]",
  "})",
  "export class ToastContainerComponent { ... }",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 5. SELECTOR
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('5', 'Selector', 1);

label('Definition');
bodyText(
  'The selector property in @Component defines the custom HTML tag by which Angular identifies and ' +
  'renders the component inside templates. The prefix "app-" is the project default.'
);

label('Selectors used in SupplyChainX');
codeBlock([
  "selector: 'app-root'                 → <app-root> in index.html",
  "selector: 'app-login'               → <app-login> in routes",
  "selector: 'app-header'              → <app-header> in main-layout.html",
  "selector: 'app-sidebar'             → <app-sidebar> in main-layout.html",
  "selector: 'app-notification-center' → <app-notification-center> in header.html",
  "selector: 'app-toast-container'     → <app-toast-container> in app.html",
], 'TypeScript');

label('main-layout.component.html – composing child selectors');
codeBlock([
  "<div class='layout-container'>",
  "  <app-header></app-header>          <!-- HeaderComponent -->",
  "  <div class='layout-content'>",
  "    <app-sidebar></app-sidebar>       <!-- SidebarComponent -->",
  "    <main class='main-content'>",
  "      <router-outlet></router-outlet>",
  "    </main>",
  "  </div>",
  "</div>",
], 'HTML');

// ═══════════════════════════════════════════════════════════════════════════
// 6. templateUrl vs template
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('6', 'templateUrl vs template', 1);

label('Definition');
bodyText(
  'templateUrl points to an external .html file (recommended for complex UI). ' +
  'template accepts an inline HTML string directly inside the decorator (good for simple, short components).'
);

codeBlock([
  "// templateUrl  →  LoginComponent, HeaderComponent, SidebarComponent, ...",
  "@Component({ templateUrl: './login.component.html' })",
  "",
  "// template (inline)  →  ToastContainerComponent",
  "@Component({",
  "  template: `",
  "    <div class='toast-container'>",
  "      <div *ngFor='let toast of toasts'>{{ toast.message }}</div>",
  "    </div>",
  "  `",
  "})",
], 'TypeScript');

infoBox('SupplyChainX uses templateUrl for all feature components and inline template only for the ToastContainerComponent (a tiny, self-contained widget).', 'success');

// ═══════════════════════════════════════════════════════════════════════════
// 7. CREATING A NEW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('7', 'Creating a New Component', 1);

label('Definition');
bodyText('ng generate component (or ng g c) scaffolds a new component with its .ts, .html, .scss, and .spec.ts files.');

codeBlock([
  "ng generate component components/login",
  "# creates:",
  "#   src/app/components/login/login.component.ts",
  "#   src/app/components/login/login.component.html",
  "#   src/app/components/login/login.component.scss",
  "#   src/app/components/login/login.component.spec.ts",
], 'Shell');

label('Components in SupplyChainX (organised by dashboard)');
const comps = [
  'LoginComponent', 'HeaderComponent', 'SidebarComponent', 'MainLayoutComponent',
  'AdminDashboardComponent', 'AdminCreateUserComponent', 'AdminManageUsersComponent',
  'AdminAuditLogsComponent', 'AdminManageNetworkComponent', 'PlannerDashboardComponent',
  'LogisticsDashboardComponent', 'ExecutiveDashboardComponent', 'ExecutiveKpiSummaryComponent',
  'ExecutiveKpiTrendsComponent', 'WarehouseDashboardComponent', 'WarehouseManageInventoryComponent',
  'ProcurementDashboardComponent', 'AddOrderComponent', 'ViewOrdersComponent',
  'ViewProfileComponent', 'NotFoundComponent', 'NotificationCenterComponent', 'ToastContainerComponent'
];
comps.forEach(c => bullet(c));

// ═══════════════════════════════════════════════════════════════════════════
// 8. COMPONENT CONSTRUCTOR
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('8', 'Component Constructor', 1);

label('Definition');
bodyText(
  'The constructor is called when Angular creates the component. It is used for dependency injection ' +
  '(services, router, etc.). Heavy initialisation should go into ngOnInit(), not the constructor.'
);

label('LoginComponent – injecting services via constructor');
codeBlock([
  "constructor(",
  "  private fb:           FormBuilder,    // form helper",
  "  private loginService: LoginService,   // API calls",
  "  private router:       Router,         // navigation",
  "  private route:        ActivatedRoute  // query params",
  ") {",
  "  // Build the reactive form inside constructor",
  "  this.loginForm = this.fb.group({",
  "    email:    ['', [Validators.required, Validators.email]],",
  "    password: ['', [Validators.required, Validators.minLength(6)]]",
  "  });",
  "}",
], 'TypeScript');

label('AddOrderComponent – modern inject() function (Angular 14+)');
codeBlock([
  "export class AddOrderComponent implements OnInit, OnDestroy {",
  "  private fb             = inject(FormBuilder);",
  "  private orderService   = inject(OrderService);",
  "  private itemService    = inject(ItemService);",
  "  private toastService   = inject(ToastService);",
  "  private orderContextService = inject(OrderContextService);",
  "",
  "  constructor() {  // constructor is now empty – DI via inject()",
  "    this.orderForm = this.fb.group({ ... });",
  "  }",
  "}",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 9. COMPONENT LIFECYCLE EVENTS
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('9', 'Component Lifecycle Events', 1);

label('Definition');
bodyText(
  'Angular calls lifecycle hook methods at specific moments in the component lifecycle: ' +
  'creation → change detection → destruction.'
);

const hooks = [
  ['ngOnInit()',    'Called once after first ngOnChanges. Ideal for data loading (API calls, service calls).'],
  ['ngOnChanges()', 'Called when @Input() properties change. Used in ExecutiveKpiSummaryComponent.'],
  ['ngOnDestroy()', 'Called just before component is destroyed. Used to unsubscribe (SidebarComponent, NotificationCenterComponent).'],
];
hooks.forEach(([h, d]) => {
  doc.fillColor(COLORS.brand).font('Helvetica-Bold').fontSize(FONT_SIZES.body).text(h, MARGIN);
  doc.fillColor(COLORS.bodyText).font('Helvetica').fontSize(FONT_SIZES.body)
     .text(d, MARGIN + 16, doc.y, { width: CONTENT_W - 16, lineGap: 1.5 });
  doc.moveDown(0.3);
});

label('HeaderComponent – ngOnInit()');
codeBlock([
  "ngOnInit(): void {",
  "  const currentUser = this.authService.currentUser;",
  "  if (currentUser) {",
  "    this.userName = currentUser.displayName || 'User';",
  "    this.userRole = currentUser.role;",
  "  }",
  "}",
], 'TypeScript');

label('SidebarComponent – ngOnDestroy()');
codeBlock([
  "ngOnDestroy(): void {",
  "  this.destroy$.next();      // signal all takeUntil subscriptions to complete",
  "  this.destroy$.complete();",
  "}",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 10. UNDERSTANDING INTERPOLATION
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('10', 'Understanding Interpolation', 1);

label('Definition');
bodyText(
  'Interpolation {{ expression }} embeds a component property or expression directly into the HTML template. ' +
  'Angular evaluates the expression and converts the result to a string.'
);

label('header.component.html – display username and role');
codeBlock([
  "<p class='user-name-header'>{{ userName }}</p>",
  "<p class='user-role-header'>{{ userRole }}</p>",
], 'HTML');

label('login.component.html – dynamic welcome message');
codeBlock([
  "{{ successMessage }}",
  "{{ error }}",
], 'HTML');

label('executive-kpi-summary.component.html – pipes with interpolation');
codeBlock([
  "<p class='kpi-value'>{{ kpiData.otif      | number:'1.1-1' }}%</p>",
  "<p class='kpi-value'>{{ kpiData.fillRate  | number:'1.1-1' }}%</p>",
  "<p class='kpi-value'>{{ kpiData.inventoryTurn | number:'1.1-2' }}</p>",
], 'HTML');

label('sidebar.component.html');
codeBlock([
  "<span class='nav-label'>{{ link.label }}</span>",
], 'HTML');

// ═══════════════════════════════════════════════════════════════════════════
// 11. UNDERSTANDING PROPERTY BINDING
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('11', 'Property Binding', 1);

label('Definition');
bodyText(
  'Property binding [property]="expression" sets a DOM element property (or component @Input) ' +
  'to a component value at runtime. Square brackets indicate one-way binding from component → view.'
);

label('login.component.html – conditionally set class and input type');
codeBlock([
  '<input [type]="showPassword ? \'text\' : \'password\'" formControlName="password" />',
  '<input [class.is-invalid]="submitted && f[\'email\'].errors" />',
  '<button [disabled]="isSubmitting || loginForm.invalid">Sign In</button>',
], 'HTML');

label('sidebar.component.html – property binding on routerLink and queryParams');
codeBlock([
  "<a [routerLink]=\"link.route\"",
  "   [queryParams]=\"link.queryParams\"",
  "   [class.active]=\"isLinkActive(link)\">",
  "  <i class='bi' [ngClass]=\"'bi-' + link.icon\"></i>",
  "  {{ link.label }}",
  "</a>",
], 'HTML');

label('executive-dashboard.component.html – passing data to child component');
codeBlock([
  "<app-executive-kpi-summary [kpiData]=\"kpiData\"></app-executive-kpi-summary>",
  "<app-executive-kpi-trends  [trendsData]=\"trendsData\"></app-executive-kpi-trends>",
  "<app-executive-risks       [riskData]=\"riskData\"></app-executive-risks>",
], 'HTML');

// ═══════════════════════════════════════════════════════════════════════════
// 12. CLASS BINDING
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('12', 'Class Binding – Single & Multiple Classes', 1);

label('Definition');
bodyText(
  '[class.name]="expr" adds/removes a single CSS class based on a boolean expression. ' +
  '[ngClass]="object" applies multiple classes at once based on conditions.'
);

label('Single class binding');
codeBlock([
  "<!-- warehouse-manage-inventory.component.html -->",
  "<td [class]=\"isLowStock(item) ? 'low-stock' : 'in-stock'\">",
  "  {{ getStockStatus(item) }}",
  "</td>",
  "",
  "<!-- sidebar.component.html -->",
  "<a [class.active]=\"isLinkActive(link)\" class='nav-link'>...</a>",
  "",
  "<!-- login.component.html -->",
  "<input [class.is-invalid]=\"submitted && f['email'].errors\" />",
], 'HTML');

label('Multiple class binding with [ngClass]');
codeBlock([
  "<!-- executive-kpi-summary.component.html -->",
  "<span [ngClass]=\"kpiData.otif >= 95 ? 'good' : 'warning'\">",
  "  {{ kpiData.otif >= 95 ? '✓ On Target' : '⚠ Below Target' }}",
  "</span>",
  "",
  "<!-- sidebar.component.html -->",
  "<i class='bi' [ngClass]=\"'bi-' + link.icon\"></i>",
], 'HTML');

// ═══════════════════════════════════════════════════════════════════════════
// 13. STYLE BINDING
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('13', 'Style Binding', 1);

label('Definition');
bodyText(
  '[style.property]="value" or [ngStyle]="object" sets inline CSS styles dynamically. ' +
  'The value is evaluated at runtime.'
);

label('executive-dashboard.component.html – inline style');
codeBlock([
  "<div class='d-flex justify-content-center' style='height: 400px'>",
  "  <div class='spinner-border text-primary' role='status'></div>",
  "</div>",
  "",
  "<!-- notification-center.component.html -->",
  "<div [style.display]=\"isOpen ? 'block' : 'none'\">...</div>",
], 'HTML');

// ═══════════════════════════════════════════════════════════════════════════
// 14. @if / @else
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('14', 'Understanding @if / @else (Angular 17+ Control Flow)', 1);

label('Definition');
bodyText(
  '@if is Angular\'s built-in control-flow block (Angular 17+) that conditionally renders a block of HTML. ' +
  'It replaces the older *ngIf directive. @else provides the fallback branch.'
);

label('login.component.html – show error / success messages');
codeBlock([
  "@if (successMessage) {",
  "  <div class='alert alert-success'>",
  "    {{ successMessage }}",
  "  </div>",
  "}",
  "",
  "@if (error) {",
  "  <div class='alert alert-danger'>{{ error }}</div>",
  "}",
], 'HTML');

label('executive-dashboard.component.html – loading vs content vs empty state');
codeBlock([
  "@if (isLoading) {",
  "  <div class='spinner-border text-primary'></div>",
  "}",
  "",
  "@if (!isLoading) {",
  "  @if (activeSection === 'summary') {",
  "    <app-executive-kpi-summary [kpiData]=\"kpiData\">",
  "    </app-executive-kpi-summary>",
  "  }",
  "  @if (!kpiData && !riskData) {",
  "    <div class='text-muted'>No data available</div>",
  "  }",
  "}",
], 'HTML');

label('warehouse-manage-inventory.component.html');
codeBlock([
  "@if (!isLoading && inventory.length > 0) {",
  "  <div class='inventory-table'>...</div>",
  "}",
  "@if (isLoading) {",
  "  <div class='loading'>Loading inventory...</div>",
  "}",
  "@if (!isLoading && inventory.length === 0) {",
  "  <div class='empty-state'>No inventory found.</div>",
  "}",
], 'HTML');

// ═══════════════════════════════════════════════════════════════════════════
// 15. @for
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('15', 'Understanding @for (Angular 17+ Control Flow)', 1);

label('Definition');
bodyText(
  '@for iterates over an array and renders a template for each item. The track expression ' +
  '(similar to ngFor\'s trackBy) tells Angular how to identify items for efficient DOM updates.'
);

label('sidebar.component.html – render nav links');
codeBlock([
  "@for (link of navLinks; track link.route) {",
  "  <li class='nav-item'>",
  "    <a [routerLink]=\"link.route\" class='nav-link'>",
  "      <span class='nav-label'>{{ link.label }}</span>",
  "    </a>",
  "  </li>",
  "}",
], 'HTML');

label('warehouse-manage-inventory.component.html – table rows');
codeBlock([
  "@for (item of inventory; track item.inventoryId) {",
  "  <tr>",
  "    <td>{{ getLocationName(item.locationId) }}</td>",
  "    <td>{{ getItemName(item.itemId) }}</td>",
  "    <td>{{ item.quantityOnHand }}</td>",
  "    <td [class]=\"isLowStock(item) ? 'low-stock' : 'in-stock'\">",
  "      {{ getStockStatus(item) }}",
  "    </td>",
  "  </tr>",
  "}",
], 'HTML');

label('admin-create-user.component.html – dropdown options');
codeBlock([
  "@for (role of roleOptions; track role) {",
  "  <option [value]=\"role\">{{ role }}</option>",
  "}",
], 'HTML');

// ═══════════════════════════════════════════════════════════════════════════
// 16. ONE-WAY vs TWO-WAY BINDING
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('16', 'One-Way Binding vs Two-Way Binding', 1);

label('Definition');
bodyText(
  'One-way binding ([ ] or {{ }}) flows data in one direction: component → view (or view → component via events). ' +
  'Two-way binding [(ngModel)] keeps the view and component in sync automatically (used in template-driven forms).'
);

label('One-way – property binding (component → view)');
codeBlock([
  "// Component",
  "userName = 'Alice';",
  "",
  "// Template",
  "<p>{{ userName }}</p>            // interpolation – one-way",
  "<input [value]=\"userName\" />    // property binding – one-way",
], 'TypeScript');

label('One-way – event binding (view → component)');
codeBlock([
  "// Template",
  "<button (click)=\"logout()\">Logout</button>",
  "<button (click)=\"togglePasswordVisibility()\">Show</button>",
], 'HTML');

label('Two-way binding – reactive forms (formControlName ≈ two-way)');
codeBlock([
  "// Reactive forms use formControlName for implicit two-way sync",
  "// login.component.html",
  '<input formControlName="email" />         <!-- view ↔ FormControl -->',
  '<input formControlName="password" />      <!-- view ↔ FormControl -->',
], 'HTML');

infoBox('SupplyChainX uses Reactive Forms (FormBuilder) throughout, so there is no explicit [(ngModel)] usage. Reactive forms give equivalent two-way sync through FormControl objects.', 'info');

// ═══════════════════════════════════════════════════════════════════════════
// 17. CREATING CHILD COMPONENTS / PASSING DATA
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('17', 'Creating Child Components & Passing Data with @Input', 1);

label('Definition');
bodyText(
  'A child component is any component embedded inside a parent\'s template. ' +
  '@Input() decorates a property so the parent can pass data down to the child via property binding.'
);

label('ExecutiveKpiSummaryComponent – child with @Input');
codeBlock([
  "// executive-kpi-summary.component.ts  (CHILD)",
  "import { Component, Input } from '@angular/core';",
  "@Component({ selector: 'app-executive-kpi-summary', ... })",
  "export class ExecutiveKpiSummaryComponent {",
  "  @Input() kpiData: KpiReportDto | null = null;  // data passed from parent",
  "}",
], 'TypeScript');

label('ExecutiveDashboardComponent – parent passes data down');
codeBlock([
  "// executive-dashboard.component.html  (PARENT)",
  "<app-executive-kpi-summary [kpiData]=\"kpiData\">",
  "</app-executive-kpi-summary>",
  "<app-executive-kpi-trends  [trendsData]=\"trendsData\">",
  "</app-executive-kpi-trends>",
  "<app-executive-risks       [riskData]=\"riskData\">",
  "</app-executive-risks>",
], 'HTML');

label('Child renders the received data');
codeBlock([
  "// executive-kpi-summary.component.html",
  "@if (kpiData) {",
  "  <p>OTIF: {{ kpiData.otif | number:'1.1-1' }}%</p>",
  "  <p>Fill Rate: {{ kpiData.fillRate | number:'1.1-1' }}%</p>",
  "}",
], 'HTML');

// ═══════════════════════════════════════════════════════════════════════════
// 18. HANDLING EVENTS
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('18', 'Handling Events', 1);

label('Definition');
bodyText(
  'Event binding (event)="handler()" listens for DOM events (click, submit, change, keyup) and calls ' +
  'a method on the component class.'
);

label('login.component.html – form submit and button click');
codeBlock([
  "<form [formGroup]=\"loginForm\" (ngSubmit)=\"onSubmit()\">",
  "  ...",
  "  <button (click)=\"togglePasswordVisibility()\">Show</button>",
  "  <button (click)=\"successMessage = null\">×</button>",
  "</form>",
], 'HTML');

label('header.component.html – navigate to profile and logout');
codeBlock([
  "<a (click)=\"goToProfile()\" class='action-link'>View Profile</a>",
  "<button (click)=\"logout()\" class='logout-btn'>Logout</button>",
], 'HTML');

label('warehouse-manage-inventory.component.html – open form');
codeBlock([
  "<button (click)=\"openCreateForm()\">Create New Inventory</button>",
  "<button (click)=\"openAdjustForm(item)\">Adjust</button>",
  "",
  "<!-- Stop propagation on modal -->",
  "<div class='modal-overlay' (click)=\"closeAdjustForm()\">",
  "  <div class='modal-content' (click)=\"$event.stopPropagation()\">",
  "  </div>",
  "</div>",
], 'HTML');

// ═══════════════════════════════════════════════════════════════════════════
// 19. INTEGRATING BOOTSTRAP INTO ANGULAR
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('19', 'Integrating Bootstrap into Angular', 1);

label('Definition');
bodyText(
  'Bootstrap is a popular CSS framework providing ready-made components and a responsive grid. ' +
  'In Angular it can be added via CDN (index.html) or npm (package.json + angular.json).'
);

label('SupplyChainX – CDN approach in index.html');
codeBlock([
  '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">',
  '<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">',
  '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>',
], 'HTML');

label('Usage throughout the app');
bullet('Grid: col-md-6, col-lg-3, row, g-3 — in executive-kpi-summary, admin-create-user');
bullet('Alerts: alert-danger, alert-success — in login, create-user, inventory');
bullet('Buttons: btn btn-primary, btn-close — throughout');
bullet('Forms: form-control, form-label, form-select, invalid-feedback — in all form components');
bullet('Bootstrap Icons: bi bi-person-circle, bi bi-boxes, bi bi-truck — in header, sidebar, inventory');
bullet('Spinner: spinner-border text-primary — in executive-dashboard');

// ═══════════════════════════════════════════════════════════════════════════
// 20. REACTIVE FORMS
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('20', 'Reactive Forms', 1);

label('Definition');
bodyText(
  'Reactive forms define the form structure in the component class using FormBuilder, FormGroup, and FormControl. ' +
  'The template binds to these objects via [formGroup] and formControlName. Validation rules are declared in TypeScript.'
);

label('LoginComponent – creating the form');
codeBlock([
  "this.loginForm = this.fb.group({",
  "  email:    ['', [Validators.required, Validators.email]],",
  "  password: ['', [Validators.required, Validators.minLength(6)]]",
  "});",
], 'TypeScript');

label('AdminCreateUserComponent – multi-field form');
codeBlock([
  "this.userForm = this.fb.group({",
  "  displayName: ['', Validators.required],",
  "  email:       ['', [Validators.required, Validators.email]],",
  "  password:    ['', [Validators.required, Validators.minLength(6)]],",
  "  phoneNumber: [''],",
  "  roleName:    ['', Validators.required],",
  "  status:      ['Active', Validators.required]",
  "});",
], 'TypeScript');

label('AddOrderComponent – FormArray for order lines');
codeBlock([
  "this.orderForm = this.fb.group({",
  "  orderType:              ['PO', Validators.required],",
  "  partnerId:              [null],",
  "  originLocationId:       [null],",
  "  destinationLocationId:  [null],",
  "  orderDate:              [new Date().toISOString().split('T')[0], Validators.required],",
  "  expectedDeliveryDate:   ['', this.expectedDeliveryDateValidator.bind(this)],",
  "  lines: this.fb.array([])   // dynamic array of line items",
  "});",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 21. VALIDATION IN REACTIVE FORMS
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('21', 'Validation in Reactive Forms', 1);

label('Definition');
bodyText(
  'Angular provides built-in validators (Validators.required, Validators.email, Validators.minLength, Validators.min). ' +
  'Custom validators can be functions that return null (valid) or an error object (invalid).'
);

label('login.component.html – showing validation errors');
codeBlock([
  "@if (submitted && f['email'].errors) {",
  "  <div class='invalid-feedback d-block'>",
  "    @if (f['email'].errors['required']) {",
  "      <small>Email is required</small>",
  "    }",
  "    @if (f['email'].errors['email']) {",
  "      <small>Please enter a valid email</small>",
  "    }",
  "  </div>",
  "}",
], 'HTML');

label('admin-create-user.component.html – touched-based errors');
codeBlock([
  "@if (userForm.get('displayName')?.invalid && userForm.get('displayName')?.touched) {",
  "  <div class='invalid-feedback d-block'>Display name is required.</div>",
  "}",
  "@if (userForm.get('password')?.invalid && userForm.get('password')?.touched) {",
  "  <div class='invalid-feedback d-block'>Password must be at least 6 characters.</div>",
  "}",
], 'HTML');

label('AddOrderComponent – custom validator');
codeBlock([
  "private expectedDeliveryDateValidator(control: AbstractControl): ValidationErrors | null {",
  "  if (!control.value) return null;",
  "  const orderDate = this.orderForm?.get('orderDate')?.value;",
  "  if (orderDate && control.value < orderDate) {",
  "    return { invalidDate: true };  // return error object",
  "  }",
  "  return null;  // valid",
  "}",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 22. DATA EXTRACTION FROM CONTROLS
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('22', 'Data Extraction from Form Controls', 1);

label('Definition');
bodyText(
  'Access form values via formGroup.value (whole form) or formGroup.get("field").value (individual control). ' +
  'Shorthand getter f returns this.loginForm.controls.'
);

label('LoginComponent – extract and submit');
codeBlock([
  "get f() { return this.loginForm.controls; }",
  "",
  "onSubmit(): void {",
  "  if (this.loginForm.invalid) return;",
  "",
  "  const loginRequest: LoginRequest = {",
  "    email:    this.f['email'].value,",
  "    password: this.f['password'].value",
  "  };",
  "  this.loginService.login(loginRequest).subscribe({ ... });",
  "}",
], 'TypeScript');

label('WarehouseManageInventoryComponent – whole form value');
codeBlock([
  "loadInventory() {",
  "  const filters = this.filters.value;    // { locationId, itemId, onlyLowStock, search }",
  "  this.inventoryService.listInventory(",
  "    filters.locationId || undefined,",
  "    filters.itemId     || undefined,",
  "    filters.onlyLowStock,",
  "    filters.search     || undefined",
  "  ).subscribe({ ... });",
  "}",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 23. PIPES
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('23', 'Pipes & Built-in Pipes', 1);

label('Definition');
bodyText(
  'A pipe transforms data in a template expression. Syntax: value | pipeName:arg1:arg2. ' +
  'Angular provides built-in pipes: number, currency, date, async, json, uppercase, lowercase.'
);

label('executive-kpi-summary.component.html – number pipe');
codeBlock([
  "{{ kpiData.otif         | number:'1.1-1' }}%   // 94.567 → 94.6%",
  "{{ kpiData.fillRate     | number:'1.1-1' }}%   // 98.3%",
  "{{ kpiData.inventoryTurn | number:'1.1-2' }}   // 4.23",
  "{{ kpiData.delayRate    | number:'1.1-1' }}%",
], 'HTML');

label('main.ts – registering locale for currency & number pipes');
codeBlock([
  "import { registerLocaleData } from '@angular/common';",
  "import localeEnIn from '@angular/common/locales/en-IN';",
  "registerLocaleData(localeEnIn);   // enables ₹ currency, IN number formats",
  "",
  "// app.config.ts",
  "{ provide: LOCALE_ID,             useValue: 'en-IN' },",
  "{ provide: DEFAULT_CURRENCY_CODE, useValue: 'INR'   },",
], 'TypeScript');

infoBox('The currency pipe will now display ₹ (INR) automatically when used with | currency throughout the app.', 'success');

// ═══════════════════════════════════════════════════════════════════════════
// 24. CREATING SERVICES
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('24', 'Creating Services', 1);

label('Definition');
bodyText(
  'Services are TypeScript classes that hold shared logic (API calls, state, utilities). ' +
  'They are created with: ng generate service services/order'
);

label('Services in SupplyChainX');
const services = [
  'LoginService – authenticate user, decode JWT',
  'AuthenticationService – store/retrieve current user, manage token',
  'OrderService – CRUD for orders (GET, POST)',
  'InventoryService – list and adjust inventory',
  'ItemService – list catalogue items',
  'LocationService – list warehouse locations',
  'PartnerService – list supply chain partners',
  'ShipmentService – dispatch and track shipments',
  'ToastService – show success/error notifications',
  'OrderContextService – share order filter context between components (BehaviorSubject)',
  'NotificationEventService – poll backend for user notifications',
  'ManageUserService / UserService – admin user management',
  'KpiService / ExecutiveDashboardService – KPI and risk data',
];
services.forEach(s => bullet(s));

// ═══════════════════════════════════════════════════════════════════════════
// 25. @Injectable & inject()
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('25', 'Understanding @Injectable & inject()', 1);

label('Definition');
bodyText(
  '@Injectable marks a class as available for Angular\'s Dependency Injection system. ' +
  'providedIn: "root" makes it a singleton across the entire app. ' +
  'inject() is the modern function-based alternative to constructor injection.'
);

label('@Injectable – AuthenticationService');
codeBlock([
  "@Injectable({",
  "  providedIn: 'root'   // singleton – one instance for the whole app",
  "})",
  "export class AuthenticationService {",
  "  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);",
  "  public currentUser$ = this.currentUserSubject.asObservable();",
  "  ...",
  "}",
], 'TypeScript');

label('@Injectable – ToastService');
codeBlock([
  "@Injectable({ providedIn: 'root' })",
  "export class ToastService {",
  "  private toasts$ = new BehaviorSubject<Toast[]>([]);",
  "  success(message: string, duration = 5000) { this.showToast(message, 'success', duration); }",
  "  error  (message: string, duration = 5000) { this.showToast(message, 'error',   duration); }",
  "}",
], 'TypeScript');

label('inject() function – AddOrderComponent');
codeBlock([
  "export class AddOrderComponent {",
  "  private fb             = inject(FormBuilder);",
  "  private orderService   = inject(OrderService);",
  "  private toastService   = inject(ToastService);",
  "  private orderContextService = inject(OrderContextService);",
  "}",
], 'TypeScript');

label('inject() function – NotificationCenterComponent');
codeBlock([
  "export class NotificationCenterComponent implements OnInit, OnDestroy {",
  "  private notificationEventService = inject(NotificationEventService);",
  "  private authService              = inject(AuthenticationService);",
  "}",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 26. INJECTING SERVICES INTO COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('26', 'Injecting Services into Components', 1);

label('Definition');
bodyText(
  'Services are injected either through the constructor (classic) or using inject() (modern). ' +
  'Angular\'s DI system automatically provides the singleton instance.'
);

label('Constructor injection – LoginComponent');
codeBlock([
  "constructor(",
  "  private fb:           FormBuilder,",
  "  private loginService: LoginService,",
  "  private router:       Router,",
  "  private route:        ActivatedRoute",
  ") {}",
], 'TypeScript');

label('Constructor injection – RoleGuard (class-based guard)');
codeBlock([
  "constructor(",
  "  private authService: AuthenticationService,",
  "  private router:      Router",
  ") {}",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 27. WORKING WITH HTTP CLIENT
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('27', 'Working with HTTP Client', 1);

label('Definition');
bodyText(
  'HttpClient is Angular\'s service for making HTTP requests. It returns RxJS Observables. ' +
  'It is provided globally via provideHttpClient() in app.config.ts.'
);

label('OrderService – GET, POST, PATCH, DELETE, PUT');
codeBlock([
  "// GET – list orders",
  "listOrders(type?, status?, fromUtc?, toUtc?): Observable<OrderResponseDto[]> {",
  "  let params = new HttpParams();",
  "  if (type)   params = params.set('type', type);",
  "  if (status) params = params.set('status', status);",
  "  return this.http.get<OrderResponseDto[]>(this.apiUrl, { params });",
  "}",
  "",
  "// POST – place a new order",
  "placeOrder(dto: OrderCreateDto): Observable<OrderResponseDto> {",
  "  return this.http.post<OrderResponseDto>(this.apiUrl, dto);",
  "}",
  "",
  "// PATCH – update shipment status",
  "updateShipment(id: number, dto): Observable<ShipmentResponseDto> {",
  "  return this.http.patch<ShipmentResponseDto>(`${this.shipmentApiUrl}/${id}`, dto);",
  "}",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 28. WORKING WITH DTOs
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('28', 'Working with DTOs (Data Transfer Objects)', 1);

label('Definition');
bodyText(
  'DTOs are TypeScript interfaces that describe the shape of data sent to or received from the API. ' +
  'They provide type safety and IDE intellisense.'
);

label('Models in SupplyChainX (src/app/models/)');
bullet('LoginRequest / LoginResponse – email + password / JWT token');
bullet('OrderCreateDto / OrderResponseDto – order payload & response');
bullet('InventoryPositionResponseDto / InventoryAdjustDto – inventory data');
bullet('ItemResponseDto / LocationResponseDto / PartnerResponseDto');
bullet('ShipmentResponseDto / ShipmentDispatchDto / ShipmentDeliveryDto');
bullet('KpiReportDto / RiskSummaryDto / KpiTrendsDto – executive dashboard');
bullet('CreateUserDTO / AppUserResponseDto – user management');
bullet('NotificationDto – notification center');

label('login.model.ts – DTO example');
codeBlock([
  "export interface LoginRequest {",
  "  email:    string;",
  "  password: string;",
  "}",
  "",
  "export interface LoginResponse {",
  "  token: string;   // JWT token returned by backend",
  "}",
  "",
  "export type UserRole = 'Admin' | 'Planner' | 'Logistics' | 'Executive' | 'Procurement' | 'Warehouse';",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 29. HTTP INTERCEPTORS
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('29', 'HTTP Request / Response Interceptors', 1);

label('Definition');
bodyText(
  'Interceptors sit in the HTTP pipeline and can modify every request (add headers) or every response ' +
  '(transform errors). They are functional in modern Angular (HttpInterceptorFn).'
);

label('auth.interceptor.ts – attach JWT token to every request');
codeBlock([
  "export const authInterceptor: HttpInterceptorFn = (req, next) => {",
  "  if (req.url.includes('/Login')) return next(req); // skip login endpoint",
  "",
  "  const authService = inject(AuthenticationService);",
  "  const token = authService.getAuthToken();",
  "",
  "  if (token) {",
  "    const clonedReq = req.clone({",
  "      setHeaders: { Authorization: `Bearer ${token}` }",
  "    });",
  "    return next(clonedReq).pipe(",
  "      catchError(error => {",
  "        if (error.status === 401) {",
  "          authService.logout();",
  "          router.navigate(['/login']);",
  "        }",
  "        return throwError(() => error);",
  "      })",
  "    );",
  "  }",
  "  return next(req);",
  "};",
], 'TypeScript');

label('error.interceptor.ts – transform server errors to user messages');
codeBlock([
  "export const errorInterceptor: HttpInterceptorFn = (req, next) => {",
  "  return next(req).pipe(",
  "    catchError((error: any) => {",
  "      let errorMessage = 'An error occurred.';",
  "      switch (error.status) {",
  "        case 401: errorMessage = 'Session expired. Please login again.';  break;",
  "        case 403: errorMessage = 'You do not have permission.';           break;",
  "        case 404: errorMessage = 'Resource not found.';                   break;",
  "        case 500: errorMessage = 'Server error. Please try again later.'; break;",
  "      }",
  "      return throwError(() => ({ ...error, userMessage: errorMessage }));",
  "    })",
  "  );",
  "};",
], 'TypeScript');

label('Registered in app.config.ts');
codeBlock([
  "provideHttpClient(",
  "  withInterceptors([authInterceptor, errorInterceptor])",
  ")",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 30. JWT TOKEN – EXTRACTING CLAIMS & ADDING TO HEADER
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('30', 'Working with JWT Token – Extracting Claims & Adding to Header', 1);

label('Definition');
bodyText(
  'A JWT (JSON Web Token) has three parts: header.payload.signature. ' +
  'The payload contains claims (user data). Angular decodes it manually using atob() and JSON.parse().'
);

label('login.service.ts – decode JWT and extract claims');
codeBlock([
  "private decodeToken(token: string): any {",
  "  const base64Url = token.split('.')[1];         // middle segment = payload",
  "  const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');",
  "  const json      = decodeURIComponent(         // URL-decode each byte",
  "    atob(base64).split('').map(c =>",
  "      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)",
  "    ).join('')",
  "  );",
  "  return JSON.parse(json);",
  "}",
], 'TypeScript');

label('Extracting user claims from the decoded payload');
codeBlock([
  "const email = payload['http://schemas.xmlsoap.org/ws/.../emailaddress']",
  "           || payload['email']",
  "           || payload['sub'];",
  "",
  "const role  = payload['http://schemas.microsoft.com/.../role']",
  "           || payload['role'];",
  "",
  "const name  = payload['http://schemas.xmlsoap.org/.../name']",
  "           || payload['name'] || email;",
], 'TypeScript');

label('Storing and retrieving token – AuthenticationService');
codeBlock([
  "setCurrentUser(user: CurrentUser, token: string): void {",
  "  this.currentUserSubject.next(user);",
  "  localStorage.setItem('authToken', token);      // persist across refresh",
  "  localStorage.setItem('currentUser', JSON.stringify(user));",
  "}",
  "",
  "getAuthToken(): string | null {",
  "  return localStorage.getItem('authToken');",
  "}",
], 'TypeScript');

label('Token added to header – auth.interceptor.ts');
codeBlock([
  "const clonedReq = req.clone({",
  "  setHeaders: { Authorization: `Bearer ${token}` }",
  "});",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 31. DEFINING ROUTES
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('31', 'Defining Routes', 1);

label('Definition');
bodyText(
  'Routes map URL paths to components. They are defined as an array of Route objects in app.routes.ts ' +
  'and registered via provideRouter(routes) in app.config.ts.'
);

label('app.routes.ts – route structure');
codeBlock([
  "export const routes: Routes = [",
  "  { path: 'login',  component: LoginComponent },",
  "  {",
  "    path: '',",
  "    component: MainLayoutComponent,",
  "    canActivate: [authGuard],       // guard: must be logged in",
  "    children: [",
  "      {",
  "        path: 'admin-dashboard',",
  "        component: AdminDashboardComponent,",
  "        canActivate: [RoleGuard],",
  "        data: { roles: ['Admin'] }, // only Admin role",
  "        children: [...]",
  "      },",
  "      { path: 'planner-dashboard', ... },",
  "    ]",
  "  },",
  "  { path: '404', component: NotFoundComponent },",
  "  { path: '**',  redirectTo: '404' }   // catch-all",
  "];",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 32. REDIRECT / CATCH-ALL / CHILD ROUTES
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('32', 'Redirect Route, Catch-All Route & Child Routes', 1);

label('Redirect route');
codeBlock([
  "// Redirect empty path to admin-dashboard",
  "{ path: '',  redirectTo: 'admin-dashboard', pathMatch: 'full' }",
  "",
  "// Redirect logistics root to orders sub-page",
  "{ path: '',  redirectTo: 'orders', pathMatch: 'full' }",
], 'TypeScript');

label('Catch-all route');
codeBlock([
  "{ path: '404', component: NotFoundComponent },",
  "{ path: '**',  redirectTo: '404' }   // ** matches any unknown URL",
], 'TypeScript');

label('Child routes – admin-dashboard');
codeBlock([
  "{",
  "  path: 'admin-dashboard',",
  "  component: AdminDashboardComponent,",
  "  children: [",
  "    { path: '',             loadComponent: () => import('./...AdminDashboardContentComponent') },",
  "    { path: 'profile',      component: ViewProfileComponent },",
  "    { path: 'users',        loadComponent: () => import('./...AdminManageUsersComponent') },",
  "    { path: 'audit-logs',   loadComponent: () => import('./...AdminAuditLogsComponent') },",
  "    { path: 'create-user',  loadComponent: () => import('./...AdminCreateUserComponent') },",
  "    { path: 'manage-network', loadComponent: () => import('./...AdminManageNetworkComponent') }",
  "  ]",
  "}",
], 'TypeScript');

infoBox('loadComponent() enables lazy loading – Angular only downloads the component bundle when the route is first visited, significantly reducing initial load time.', 'info');

// ═══════════════════════════════════════════════════════════════════════════
// 33. STATIC LINKS & DYNAMIC NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('33', 'Static Links & Dynamic Navigation', 1);

label('Static links with routerLink');
codeBlock([
  "<!-- sidebar.component.html – static links for each nav item -->",
  "<a [routerLink]=\"'/admin-dashboard'\" class='nav-link'>Dashboard</a>",
  "<a [routerLink]=\"'/admin-dashboard/users'\" class='nav-link'>Manage Users</a>",
], 'HTML');

label('Dynamic navigation from TypeScript – Router.navigate()');
codeBlock([
  "// header.component.ts – navigate to profile based on current dashboard",
  "goToProfile(): void {",
  "  const currentUrl = this.router.url;",
  "  if (currentUrl.includes('admin-dashboard')) {",
  "    this.router.navigate(['/admin-dashboard/profile']);",
  "  } else if (currentUrl.includes('planner-dashboard')) {",
  "    this.router.navigate(['/planner-dashboard/profile']);",
  "  }",
  "}",
  "",
  "// login.component.ts – navigate after successful login",
  "this.router.navigate([redirectUrl], { replaceUrl: true });",
], 'TypeScript');

label('Navigation with queryParams – sidebar executive section');
codeBlock([
  "navLinks = [",
  "  { label: 'KPI Trends', route: '/executive-dashboard', queryParams: { section: 'trends' } },",
  "  { label: 'Risk',       route: '/executive-dashboard', queryParams: { section: 'risk'   } },",
  "];",
  "",
  "// template",
  "<a [routerLink]=\"link.route\" [queryParams]=\"link.queryParams\">{{ link.label }}</a>",
  "",
  "// executive-dashboard.component.ts – read query param",
  "this.route.queryParams.subscribe(params => {",
  "  this.activeSection = params['section'] || 'summary';",
  "});",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 34. NAVIGATION WITH DATA / PASSING PARAMETERS
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('34', 'Navigation with Data & Passing Parameters to Routes', 1);

label('Passing query parameters');
codeBlock([
  "// auth.guard.ts – pass returnUrl as query param",
  "router.navigate(['/login'], { queryParams: { returnUrl: state.url } });",
  "",
  "// login.component.ts – read returnUrl",
  "this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';",
], 'TypeScript');

label('Passing route data – roles for guards');
codeBlock([
  "// app.routes.ts – static data on route",
  "{",
  "  path: 'admin-dashboard',",
  "  data: { roles: ['Admin'] },   // data passed to guard",
  "  canActivate: [RoleGuard]",
  "}",
  "",
  "// role.guard.ts – read data from route",
  "const requiredRoles = route.data['roles'] as UserRole[];",
], 'TypeScript');

label('Resolvers – passing data to components before they activate');
codeBlock([
  "// app.routes.ts",
  "{",
  "  path: 'orders',",
  "  loadComponent: () => import('./...ViewOrdersComponent'),",
  "  resolve: { orderContext: OrderContextResolver }  // run before component loads",
  "}",
  "",
  "// order-context.resolver.ts",
  "export class OrderContextResolver implements Resolve<void> {",
  "  private orderContextService = inject(OrderContextService);",
  "  resolve(): void {",
  "    this.orderContextService.clearDisabledOrderTypes();",
  "    this.orderContextService.clearVisibleOrderTypes();",
  "  }",
  "}",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 35. ROUTE GUARDS
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('35', 'Working with Route Guards', 1);

label('Definition');
bodyText(
  'Route guards protect routes by running logic before navigation completes. ' +
  'CanActivate runs before a route activates. CanActivateChild runs before child routes activate.'
);

label('authGuard (functional guard) – checks if user is logged in');
codeBlock([
  "export const authGuard: CanActivateFn = (route, state) => {",
  "  const authService = inject(AuthenticationService);",
  "  const router      = inject(Router);",
  "",
  "  if (authService.isLoggedIn()) return true;",
  "",
  "  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });",
  "  return false;",
  "};",
], 'TypeScript');

label('RoleGuard (class-based guard) – checks user role');
codeBlock([
  "@Injectable({ providedIn: 'root' })",
  "export class RoleGuard implements CanActivate {",
  "  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {",
  "    const requiredRoles = route.data['roles'] as UserRole[];",
  "    if (this.authService.hasRole(requiredRoles)) return true;",
  "",
  "    // redirect to user's own dashboard",
  "    const dashboard = roleDashboards[this.authService.currentRole!];",
  "    this.router.navigate([dashboard]);",
  "    return false;",
  "  }",
  "}",
], 'TypeScript');

label('Applied in routes');
codeBlock([
  "{",
  "  path: '',",
  "  component: MainLayoutComponent,",
  "  canActivate:      [authGuard],   // must be logged in",
  "  children: [",
  "    {",
  "      path: 'admin-dashboard',",
  "      canActivate:      [RoleGuard],",
  "      canActivateChild: [RoleGuard],  // protects all child routes too",
  "      data: { roles: ['Admin'] }",
  "    }",
  "  ]",
  "}",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 36. BROWSER STORAGE
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('36', 'Browser Storage', 1);

label('Definition');
bodyText(
  'Browser provides localStorage (persists until cleared), sessionStorage (clears on tab close), and cookies. ' +
  'Angular apps access them directly via window.localStorage.'
);

label('AuthenticationService – store/retrieve/clear auth data');
codeBlock([
  "// Store after login",
  "localStorage.setItem('authToken',    token);",
  "localStorage.setItem('currentUser',  JSON.stringify(user));",
  "",
  "// Retrieve on app startup (constructor)",
  "private getUserFromStorage(): CurrentUser | null {",
  "  const userStr = localStorage.getItem('currentUser');",
  "  return userStr ? JSON.parse(userStr) : null;",
  "}",
  "",
  "// Clear on logout",
  "logout(): void {",
  "  localStorage.removeItem('authToken');",
  "  localStorage.removeItem('currentUser');",
  "  this.currentUserSubject.next(null);",
  "}",
], 'TypeScript');

infoBox('The JWT token stored in localStorage is automatically picked up by AuthenticationService on app restart, keeping the user logged in across browser refreshes.', 'info');

// ═══════════════════════════════════════════════════════════════════════════
// 37. COMMUNICATION BETWEEN SIBLING COMPONENTS (Shared Service / BehaviorSubject)
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('37', 'Communication Between Sibling Components', 1);

label('Definition');
bodyText(
  'Sibling components cannot communicate directly. The pattern used in Angular is a Shared Service ' +
  'with a BehaviorSubject (RxJS). One sibling pushes data; the other subscribes and receives it.'
);

label('OrderContextService – shared state via BehaviorSubject');
codeBlock([
  "@Injectable({ providedIn: 'root' })",
  "export class OrderContextService {",
  "  private disabledOrderTypesSubject = new BehaviorSubject<string[]>([]);",
  "  disabledOrderTypes$ = this.disabledOrderTypesSubject.asObservable();",
  "",
  "  setDisabledOrderTypes(orderTypes: string[]): void {",
  "    this.disabledOrderTypesSubject.next(orderTypes);   // PUSH",
  "  }",
  "}",
], 'TypeScript');

label('AddOrderComponent – subscribes to shared state');
codeBlock([
  "// AddOrderComponent (sibling 1) – SUBSCRIBE",
  "this.orderContextService.disabledOrderTypes$",
  "  .pipe(takeUntil(this.destroy$))",
  "  .subscribe((disabledTypes) => {",
  "    this.disabledOrderTypes = disabledTypes;",
  "  });",
], 'TypeScript');

label('OrderContextResolver – pushes state before navigation');
codeBlock([
  "// ProcurementOrderContextResolver (sibling 2 side) – PUSH via resolver",
  "resolve(): void {",
  "  this.orderContextService.setDisabledOrderTypes(['SO']);",
  "  this.orderContextService.setVisibleOrderTypes(['PO', 'Transfer']);",
  "}",
], 'TypeScript');

label('ToastService – BehaviorSubject for toast notifications');
codeBlock([
  "// ToastService (PUSH)",
  "private toasts$ = new BehaviorSubject<Toast[]>([]);",
  "success(message: string) { this.showToast(message, 'success'); }",
  "",
  "// ToastContainerComponent (SUBSCRIBE)",
  "this.toastService.getToasts().subscribe(toasts => {",
  "  this.toasts = toasts;",
  "});",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 38. INTEGRATING HTTP CLIENT WITH SERVICES
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('38', 'Integrating HTTP Client with Services', 1);

label('Definition');
bodyText(
  'The standard pattern: inject HttpClient into a service, call HTTP methods, return Observables. ' +
  'Components subscribe to these Observables to get data.'
);

label('InventoryService → WarehouseManageInventoryComponent');
codeBlock([
  "// inventory.service.ts",
  "@Injectable({ providedIn: 'root' })",
  "export class InventoryService {",
  "  private apiUrl = AppSettings.apiEndpoint + 'Inventory';",
  "  constructor(private http: HttpClient) {}",
  "",
  "  listInventory(locationId?, itemId?, onlyLowStock?, search?) {",
  "    let params = new HttpParams();",
  "    if (locationId) params = params.set('locationId', locationId);",
  "    return this.http.get<InventoryPositionResponseDto[]>(this.apiUrl, { params });",
  "  }",
  "}",
  "",
  "// warehouse-manage-inventory.component.ts – inject and use",
  "this.inventoryService.listInventory(...).subscribe({",
  "  next: (data) => { this.inventory = data; },",
  "  error: (err)  => { console.error(err);   }",
  "});",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 39. INJECTING PARAMETERIZED SERVICE
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('39', 'Injecting Parameterized Service', 1);

label('Definition');
bodyText(
  'Services can receive configuration values via Angular\'s InjectionToken, or by wrapping the service ' +
  'call with parameters. AppSettings acts as a centralized config injected into services.'
);

label('AppSettings – centralized API endpoint');
codeBlock([
  "// app-settings.ts",
  "export const AppSettings = {",
  "  apiEndpoint:     'https://localhost:7295/api/',",
  "  applicationUrl:  'https://localhost:7295'",
  "};",
  "",
  "// Used by every service as the base URL",
  "private apiUrl = AppSettings.apiEndpoint + 'orders';     // OrderService",
  "private apiUrl = AppSettings.apiEndpoint + 'Inventory';  // InventoryService",
  "private apiUrl = AppSettings.apiEndpoint + 'User';       // LoginService",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// 40. TEMPLATE DRIVEN FORMS
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('40', 'Working with Template-Driven Forms', 1);

label('Definition');
bodyText(
  'Template-driven forms define validation and structure in the HTML template using directives ' +
  'like ngModel, required, minlength, etc. Angular creates FormControl objects implicitly from these directives.'
);

infoBox('SupplyChainX uses Reactive Forms for all feature forms. Template-driven patterns appear in the filter forms where simple binding is sufficient, e.g., filters in warehouse-manage-inventory using formControlName (which is the reactive equivalent).', 'info');

label('Template-driven pattern example (concept illustration)');
codeBlock([
  "<!-- Template-driven approach (conceptual) -->",
  "<form #form='ngForm' (ngSubmit)='onSubmit(form)'>",
  "  <input name='email' [(ngModel)]='email' required email />",
  "  <input name='password' [(ngModel)]='password' required minlength='6' />",
  "  <button type='submit' [disabled]='form.invalid'>Submit</button>",
  "</form>",
  "",
  "<!-- SupplyChainX filter form (reactive equivalent) -->",
  "<form [formGroup]='filters' (ngSubmit)='onFilter()'>",
  "  <select formControlName='locationId'>...</select>",
  "  <select formControlName='itemId'>...</select>",
  "</form>",
], 'HTML');

// ═══════════════════════════════════════════════════════════════════════════
// 41. ACCESS RESTful API (CRUD)
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('41', 'Accessing RESTful API – GET / POST / PUT / DELETE / PATCH', 1);

label('All HTTP methods used in SupplyChainX');
codeBlock([
  "// GET – fetch data",
  "this.http.get<OrderResponseDto[]>(this.apiUrl, { params })",
  "this.http.get<ItemResponseDto[]>(this.apiUrl)",
  "this.http.get<KpiReportDto>(`${this.apiUrl}/report/kpi`)",
  "",
  "// POST – create resource",
  "this.http.post<OrderResponseDto>(this.apiUrl, dto)",
  "this.http.post<void>(`${this.apiUrl}/Login`, loginRequest)",
  "",
  "// PUT – full update",
  "this.http.put<UserResponseDto>(`${this.apiUrl}/${id}`, dto)",
  "",
  "// PATCH – partial update",
  "this.http.patch<ShipmentResponseDto>(`${this.apiUrl}/${id}`, dto)",
  "",
  "// DELETE – remove resource",
  "this.http.delete<void>(`${this.apiUrl}/${id}`)",
], 'TypeScript');

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY MATRIX
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('42', 'Quick Reference Matrix', 1);

bodyText('The table below maps each concept to the exact file(s) in SupplyChainX where you can find it:');
doc.moveDown(0.4);

const tableData = [
  ['Concept', 'File(s) in SupplyChainX'],
  ['Bootstrapping', 'src/main.ts, src/app/app.config.ts'],
  ['@Component', 'Every .component.ts file'],
  ['selector', 'app-root (app.ts), app-login, app-header, app-sidebar...'],
  ['templateUrl vs template', 'ToastContainerComponent (inline), all others (URL)'],
  ['Interpolation', 'header.html (userName), login.html (error), kpi-summary.html'],
  ['Property Binding', 'login.html ([type], [class.is-invalid]), sidebar.html ([routerLink])'],
  ['Class Binding', 'inventory.html ([class]=low-stock), kpi-summary.html ([ngClass])'],
  ['Style Binding', 'executive-dashboard.html (style=height)'],
  ['@if / @else', 'login.html, executive-dashboard.html, inventory.html'],
  ['@for', 'sidebar.html (navLinks), inventory.html (rows), create-user.html (roles)'],
  ['Component Constructor', 'LoginComponent, SidebarComponent, HeaderComponent'],
  ['Lifecycle – ngOnInit', 'HeaderComponent, SidebarComponent, LoginComponent, InventoryComponent'],
  ['Lifecycle – ngOnDestroy', 'SidebarComponent, NotificationCenterComponent, AddOrderComponent'],
  ['Reactive Forms', 'LoginComponent, AdminCreateUserComponent, WarehouseManageInventoryComponent'],
  ['Validation', 'login.html, admin-create-user.html (required, email, minLength)'],
  ['Data Extraction', 'LoginComponent (f[].value), WarehouseInventoryComponent (filters.value)'],
  ['Pipes', 'executive-kpi-summary.html (number pipe), main.ts (locale/currency)'],
  ['Creating Services', 'src/app/services/ – 15+ services'],
  ['@Injectable', 'AuthenticationService, ToastService, OrderService...'],
  ['inject()', 'AddOrderComponent, NotificationCenterComponent, OrderContextResolver'],
  ['HTTP Client', 'OrderService, InventoryService, LoginService, ItemService...'],
  ['DTOs', 'src/app/models/ – 20+ interfaces'],
  ['Interceptors', 'auth.interceptor.ts, error.interceptor.ts'],
  ['JWT Decoding', 'login.service.ts (decodeToken, extractUserFromToken)'],
  ['JWT Header', 'auth.interceptor.ts (Authorization: Bearer token)'],
  ['Browser Storage', 'authentication.service.ts (localStorage)'],
  ['Route Definitions', 'src/app/app.routes.ts'],
  ['Redirect Route', 'app.routes.ts (path:"", redirectTo:"admin-dashboard")'],
  ['Catch-all Route', 'app.routes.ts (path:"**", redirectTo:"404")'],
  ['Child Routes', 'admin-dashboard, planner-dashboard, warehouse-dashboard children'],
  ['Static Links', 'sidebar.component.html ([routerLink])'],
  ['Dynamic Navigation', 'header.component.ts (router.navigate), login.component.ts'],
  ['Navigation with Data', 'app.routes.ts (data:{roles:[...]}), query params (returnUrl, section)'],
  ['Route Guards', 'auth.guard.ts (authGuard), role.guard.ts (RoleGuard)'],
  ['Sibling Communication', 'OrderContextService (BehaviorSubject), ToastService'],
  ['Bootstrap Integration', 'index.html (CDN), all .html templates (Bootstrap classes)'],
  ['Child Components', 'ExecutiveDashboard → KpiSummary, KpiTrends, Risks, Reports'],
  ['@Input', 'ExecutiveKpiSummaryComponent (@Input() kpiData), KpiTrends, Risks'],
  ['Template-Driven Forms', 'Filter forms in inventory (reactive equivalent)'],
];

// Draw table
const colW = [CONTENT_W * 0.38, CONTENT_W * 0.62];
const rowH  = 15;
let ty2 = doc.y;
let tx2 = MARGIN;

tableData.forEach((row, ri) => {
  if (ty2 + rowH > PAGE_H - MARGIN - 10) {
    newPage();
    ty2 = doc.y;
  }
  const isHeader = ri === 0;
  const bg = isHeader ? COLORS.brand : ri % 2 === 0 ? COLORS.brandLight : COLORS.white;
  const fg = isHeader ? COLORS.white : COLORS.bodyText;

  doc.rect(tx2, ty2, CONTENT_W, rowH).fill(bg);
  row.forEach((cell, ci) => {
    const x = tx2 + colW.slice(0, ci).reduce((a, b) => a + b, 0) + 4;
    doc
      .fillColor(fg)
      .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(isHeader ? 8 : 7.5)
      .text(cell, x, ty2 + 3, { width: colW[ci] - 8, lineBreak: false, ellipsis: true });
  });
  // Row border
  doc.rect(tx2, ty2, CONTENT_W, rowH).lineWidth(0.3).stroke(COLORS.line);
  ty2 += rowH;
});

doc.y = ty2 + 10;

// ═══════════════════════════════════════════════════════════════════════════
// APPENDIX – APP STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('A', 'Appendix – SupplyChainX Project Structure', 1);

codeBlock([
  "src/",
  "├── main.ts                     ← bootstrapApplication()",
  "├── index.html                  ← Bootstrap CDN, <app-root>",
  "├── app/",
  "│   ├── app.ts                  ← Root @Component (selector: app-root)",
  "│   ├── app.html                ← <app-toast-container> + <router-outlet>",
  "│   ├── app.config.ts           ← Providers: router, HTTP client, interceptors",
  "│   ├── app.routes.ts           ← All route definitions",
  "│   ├── components/",
  "│   │   ├── login/              ← Reactive form, JWT login",
  "│   │   ├── admin-dashboard/    ← Users, Audit Logs, Network (child routes)",
  "│   │   ├── planner-dashboard/  ← Exceptions, Resolution Actions",
  "│   │   ├── logistics-dashboard/← Orders, Dispatch, Shipments",
  "│   │   ├── executive-dashboard/← KPI, Trends, Risk, Reports (child components)",
  "│   │   ├── procurement-dashboard/ ← Locations, Partners, Orders",
  "│   │   ├── warehouse-dashboard/   ← Inventory, UOM, Items",
  "│   │   └── shared/             ← Layout (Header, Sidebar), Toast, Notifications",
  "│   ├── services/               ← 15+ injectable services",
  "│   ├── models/                 ← 20+ TypeScript DTO interfaces",
  "│   ├── guards/                 ← authGuard, RoleGuard, Resolvers",
  "│   ├── interceptors/           ← auth.interceptor, error.interceptor",
  "│   └── settings/               ← AppSettings (API endpoint)",
], 'Text');

// ─────────────────────────────────────────────────────────────────────────────
// BACK COVER
// ─────────────────────────────────────────────────────────────────────────────
newPage();
doc.rect(0, 0, PAGE_W, PAGE_H).fill(COLORS.brandDark);

doc
  .fillColor(COLORS.white)
  .font('Helvetica-Bold')
  .fontSize(20)
  .text('Angular Concepts Guide', MARGIN, PAGE_H / 2 - 60, { width: CONTENT_W, align: 'center' });

doc
  .fillColor(COLORS.accent)
  .font('Helvetica')
  .fontSize(13)
  .text('SupplyChainX Frontend – Complete Reference', MARGIN, PAGE_H / 2 - 30, { width: CONTENT_W, align: 'center' });

doc
  .fillColor('#94a3b8')
  .font('Helvetica')
  .fontSize(10)
  .text('All 48+ Angular concepts explained with real code examples from the application', MARGIN, PAGE_H / 2 + 10, { width: CONTENT_W, align: 'center', lineGap: 3 });

// ─────────────────────────────────────────────────────────────────────────────
// FINALIZE
// ─────────────────────────────────────────────────────────────────────────────
doc.end();

console.log(`✅  PDF generated: ${OUTPUT_PATH}`);
console.log(`    Total pages: ${currentPage}`);
