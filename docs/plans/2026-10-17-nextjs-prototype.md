# EasyCarCare Next.js Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working two-week prototype where a driver can create an account, add a car, see a plain-language maintenance plan, update mileage, log completed work, and review that history on a phone or a desktop.

**Architecture:** One Next.js app using the App Router. Pages are rendered on the server. Form saves use Server Actions. Supabase provides Postgres and email/password accounts. Database rules (row-level security) keep each person on their own vehicles, tasks, logs, and notifications. A small pure TypeScript module owns due-status math so the dashboard, mileage update, and logs all use the same rules.

**Tech Stack:** Next.js (App Router, TypeScript, Tailwind CSS), Supabase Auth, Supabase Postgres, `@supabase/ssr`, Vitest for the scheduling rules.

## Global Constraints

- This is a prototype. Prefer a working path over extra features.
- Work on the existing branch `meta-framework-bakeoff`.
- Stack is Next.js plus Vercel hosting, with the already provisioned Supabase Postgres project.
- Starter maintenance intervals are general guidance, not manufacturer advice. The UI must say that.
- A user can read and change only their own vehicles, tasks, logs, and notifications.
- Mileage cannot go down.
- Status is shown in words, not by color alone.
- Layouts work from 320px wide through desktop. Forms have labels, visible focus, and field errors.
- At least one feature is written by hand, with AI only helping when stuck. That feature is mileage update and due-status calculation (`lib/scheduling.ts` and the mileage form that calls it).
- Do not build VIN lookup, email reminders, offline mode, admin template screens, receipt upload, cost charts, or shop search in this prototype.
- Never commit `.env` or `.env.local`. The existing `.env` password stays out of git and out of the plan.

---

## How to read this

Build the tasks in order. Each task should run on its own before the next one starts. The behavior details already live in `docs/plans/F1` through `F8`. This file decides the stack, the numbers, the files, and what "done" means for the prototype.

If the core path works and time remains, do the stretch tasks at the end. Do not start stretch work while sign-in, vehicles, the starter plan, mileage, logs, or the dashboard are broken.

## Prototype scope

| In this prototype | Stretch, only after the core path works | Not in this prototype |
| --- | --- | --- |
| Sign up, sign in, sign out, password-reset request | Profile name, email, and reminder preference | VIN decoding |
| Add, list, view, edit, and delete a vehicle | Custom maintenance tasks | Email reminders beyond Supabase's reset mail |
| Seven starter tasks on every new vehicle | In-app due-soon and overdue notifications | Offline / installable app |
| Update mileage and show Upcoming, Due soon, or Overdue | | Admin screens for service templates |
| Log, edit, delete, and review completed service | | Receipts, cost charts, recalls, shop search |
| Dashboard with a vehicle switcher | | |

The success check from the product spec: a user can create an account, add a vehicle, see recommended maintenance, log a completed service, update mileage, and review history from a phone-sized window and a desktop window.

## Locked product rules

These numbers were open in the feature plans. They are closed for the prototype.

**Due soon** means within **500 miles** or **30 days**, and not yet past due.

A task is:

- **Overdue** when today's mileage is at or past `next_due_mileage`, or today's date is at or past `next_due_date`.
- **Due soon** when it is inside the 500-mile or 30-day window and is not overdue.
- **Upcoming** otherwise.

If a task has both a mileage target and a date target, show the more urgent of the two. Urgency order is overdue, then due soon, then upcoming.

**Health label** on the dashboard, starting from 100:

- Each overdue task subtracts 15.
- Each due-soon task subtracts 5.
- The score cannot go below 0.
- 80–100 is "Good shape". 50–79 is "Needs attention". 0–49 is "Overdue care".

**Starter tasks.** Created once, inside the same database transaction as the vehicle. `is_custom` is false. Copy must say these are general estimates.

| Name | Miles | Months | Plain-language description |
| --- | --- | --- | --- |
| Oil change | 5000 | 6 | Fresh oil keeps the engine running smoothly. This is general guidance, not a manufacturer schedule. |
| Tire rotation | 7500 | 6 | Rotating tires helps them wear evenly. This is general guidance, not a manufacturer schedule. |
| Tire-pressure check | 1000 | 1 | Tires at the right pressure are safer and use less fuel. This is general guidance, not a manufacturer schedule. |
| Air-filter replacement | 15000 | 12 | A clean air filter helps the engine breathe. This is general guidance, not a manufacturer schedule. |
| Brake inspection | 10000 | 12 | A periodic brake check can catch wear before it becomes a safety problem. This is general guidance, not a manufacturer schedule. |
| Battery check | none | 6 | A quick battery check can prevent a no-start surprise. This is general guidance, not a manufacturer schedule. |
| Coolant inspection | 30000 | 24 | Coolant protects the engine from overheating and freezing. This is general guidance, not a manufacturer schedule. |

On vehicle creation:

- `next_due_mileage = current_mileage + interval_miles` when the template has miles.
- `next_due_date = today plus interval_months` when the template has months.
- Then run the status rules above.

On a new or edited log, the latest log for that task sets the next due values:

- `next_due_mileage = completed_mileage + interval_miles` when the task has miles.
- `next_due_date = completed_date plus interval_months` when the task has months.
- If the completed mileage is higher than the vehicle's current mileage, raise the vehicle mileage to match. Never lower it.
- Deleting a log recalculates from the newest remaining log.
- If no logs remain, calculate the next due values the same way as a new vehicle: from the vehicle's current mileage and its `created_at` date. This can differ from the very first due values if mileage has changed since the car was added. That is an accepted prototype limit.

**Validation**

- Email is required and must look like an email. Password is required and at least 8 characters. Name is required.
- Vehicle year, make, model, and current mileage are required. Mileage is a whole number, 0 or greater, and cannot decrease.
- Year is from 1980 through next calendar year.
- VIN is optional. When present it is 17 characters, letters and numbers, excluding I, O, and Q, and unique.
- Log date is required and cannot be in the future. Log mileage is required and 0 or greater. Cost and notes are optional. Cost is stored in cents.

## File map

```text
app/
  layout.tsx                         Shared page shell and fonts
  page.tsx                           Public landing page
  globals.css
  sign-in/page.tsx
  sign-up/page.tsx
  reset-password/page.tsx
  auth/sign-out/route.ts             Ends the session
  (protected)/layout.tsx             Redirects visitors who are not signed in
  (protected)/dashboard/page.tsx
  (protected)/vehicles/page.tsx
  (protected)/vehicles/new/page.tsx
  (protected)/vehicles/[vehicleId]/page.tsx
  (protected)/vehicles/[vehicleId]/edit/page.tsx
  (protected)/vehicles/[vehicleId]/history/page.tsx
  (protected)/tasks/[taskId]/page.tsx
  (protected)/tasks/[taskId]/log/page.tsx
  (protected)/logs/[logId]/edit/page.tsx
components/
  auth-form.tsx
  vehicle-form.tsx
  mileage-form.tsx                   Hand-built UI for the scheduling feature
  log-form.tsx
  task-list.tsx
  app-nav.tsx
lib/
  supabase/client.ts                 Browser Supabase client
  supabase/server.ts                 Server Supabase client
  scheduling.ts                      Hand-built due-status rules
  scheduling.test.ts
  starter-tasks.ts                   The seven templates
  validation.ts
  dates.ts                           Date-only add-months helper
supabase/migrations/0001_init.sql
.env.local.example
```

Each file has one job. Page files load data and render. Form components submit Server Actions that live next to the page that owns them (`actions.ts` in that route folder). `lib/scheduling.ts` does not talk to the database.

## Pages

| URL | Who can open it | What it does |
| --- | --- | --- |
| `/` | Anyone | Explains EasyCarCare and links to sign up or sign in. |
| `/sign-up` | Anyone | Name, email, password. |
| `/sign-in` | Anyone | Email and password. |
| `/reset-password` | Anyone | Email only. Always shows the same confirmation. |
| `/dashboard` | Signed in | Selected vehicle, health, due soon, overdue, recent logs. |
| `/vehicles` | Signed in | List, add, delete. |
| `/vehicles/new` | Signed in | Create a vehicle and its starter plan. |
| `/vehicles/[vehicleId]` | Owner | Plan, update mileage, link to history. |
| `/vehicles/[vehicleId]/edit` | Owner | Edit vehicle details. |
| `/vehicles/[vehicleId]/history` | Owner | Completed work, newest first. |
| `/tasks/[taskId]` | Owner | One task, its explanation, and its logs. |
| `/tasks/[taskId]/log` | Owner | Record completion. |
| `/logs/[logId]/edit` | Owner | Fix a log. |

There is no separate REST API in this prototype. The product spec says the endpoint list describes capabilities, and the URL style is chosen with the stack. Server Actions are those capabilities. Row-level security is the authorization check.

---

### Task 1: Create the Next.js app and Supabase clients

**Files:**
- Create: `package.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css` via `create-next-app`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `.env.local.example`
- Modify: `.gitignore` only if `create-next-app` does not already ignore `.env*.local`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local`
- Produces: `createBrowserClient()` from `lib/supabase/client.ts` with no arguments, and `createServerClient()` from `lib/supabase/server.ts` as an async function that returns a Supabase client bound to the request cookies

- [ ] **Step 1: Scaffold the app**

Run from the repository root:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --turbopack
```

If the directory is not empty, allow the command to continue in the current folder. Do not overwrite `docs/`, the specification files, or `meta-framework.md`.

Install the Supabase and test packages:

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D vitest
```

- [ ] **Step 2: Add the environment example**

Create `.env.local.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Copy it to `.env.local` and fill in the project URL and anon key from the Supabase dashboard. Do not put the database password in this file. Do not commit `.env.local`.

- [ ] **Step 3: Add the browser client**

```ts
// lib/supabase/client.ts
import { createBrowserClient as createClient } from "@supabase/ssr";

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 4: Add the server client**

```ts
// lib/supabase/server.ts
import { createServerClient as createClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClient() {
  const cookieStore = await cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always write cookies. Middleware refreshes the session.
          }
        },
      },
    },
  );
}
```

- [ ] **Step 5: Confirm the app starts**

Run: `npm run dev`

Expected: the default Next.js page loads at `http://localhost:3000` with no missing-module error.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json app components lib next.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs .gitignore .env.local.example
git commit -m "feat: scaffold Next.js app and Supabase clients"
```

---

### Task 2: Create the database

**Files:**
- Create: `supabase/migrations/0001_init.sql`
- Create: `lib/starter-tasks.ts`
- Create: `lib/dates.ts`

**Interfaces:**
- Consumes: nothing from app code
- Produces: tables `profiles`, `vehicles`, `service_templates`, `maintenance_tasks`, `maintenance_logs`, `notifications`
- Produces: `STARTER_TASKS` in `lib/starter-tasks.ts`, an array of `{ name, description, intervalMiles, intervalMonths }`
- Produces: `addMonths(isoDate: string, months: number): string` in `lib/dates.ts`. `isoDate` is `YYYY-MM-DD`. The result is also `YYYY-MM-DD`.

- [ ] **Step 1: Write the date helper and a failing test**

```ts
// lib/dates.test.ts
import { describe, expect, it } from "vitest";
import { addMonths } from "./dates";

describe("addMonths", () => {
  it("adds months inside the same year", () => {
    expect(addMonths("2026-01-15", 6)).toBe("2026-07-15");
  });

  it("rolls into the next year", () => {
    expect(addMonths("2026-10-31", 6)).toBe("2027-04-30");
  });
});
```

Add to `package.json` scripts: `"test": "vitest run"`.

Run: `npx vitest run lib/dates.test.ts`

Expected: FAIL because `lib/dates.ts` does not exist.

- [ ] **Step 2: Implement the date helper**

```ts
// lib/dates.ts
export function addMonths(isoDate: string, months: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString().slice(0, 10);
}
```

Run: `npx vitest run lib/dates.test.ts`

Expected: PASS.

- [ ] **Step 3: Write the starter task list**

```ts
// lib/starter-tasks.ts
export type StarterTask = {
  name: string;
  description: string;
  intervalMiles: number | null;
  intervalMonths: number | null;
};

const guidance = "This is general guidance, not a manufacturer schedule.";

export const STARTER_TASKS: StarterTask[] = [
  { name: "Oil change", description: `Fresh oil keeps the engine running smoothly. ${guidance}`, intervalMiles: 5000, intervalMonths: 6 },
  { name: "Tire rotation", description: `Rotating tires helps them wear evenly. ${guidance}`, intervalMiles: 7500, intervalMonths: 6 },
  { name: "Tire-pressure check", description: `Tires at the right pressure are safer and use less fuel. ${guidance}`, intervalMiles: 1000, intervalMonths: 1 },
  { name: "Air-filter replacement", description: `A clean air filter helps the engine breathe. ${guidance}`, intervalMiles: 15000, intervalMonths: 12 },
  { name: "Brake inspection", description: `A periodic brake check can catch wear before it becomes a safety problem. ${guidance}`, intervalMiles: 10000, intervalMonths: 12 },
  { name: "Battery check", description: `A quick battery check can prevent a no-start surprise. ${guidance}`, intervalMiles: null, intervalMonths: 6 },
  { name: "Coolant inspection", description: `Coolant protects the engine from overheating and freezing. ${guidance}`, intervalMiles: 30000, intervalMonths: 24 },
];
```

- [ ] **Step 4: Apply this SQL in the Supabase SQL editor**

Save the same SQL as `supabase/migrations/0001_init.sql`.

```sql
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  reminder_preference text not null default 'in_app' check (reminder_preference in ('in_app')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  vin text,
  year integer not null check (year between 1980 and 2100),
  make text not null,
  model text not null,
  trim text,
  current_mileage integer not null check (current_mileage >= 0),
  purchase_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicles_vin_format check (vin is null or vin ~ '^[A-HJ-NPR-Z0-9]{17}$'),
  constraint vehicles_vin_unique unique (vin)
);

create table public.service_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  default_interval_miles integer check (default_interval_miles is null or default_interval_miles > 0),
  default_interval_months integer check (default_interval_months is null or default_interval_months > 0),
  active boolean not null default true
);

create table public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  service_template_id uuid references public.service_templates (id),
  name text not null,
  description text not null,
  interval_miles integer check (interval_miles is null or interval_miles > 0),
  interval_months integer check (interval_months is null or interval_months > 0),
  next_due_mileage integer,
  next_due_date date,
  status text not null check (status in ('upcoming', 'due', 'overdue')),
  is_custom boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint one_starter_name_per_vehicle unique (vehicle_id, name)
);

create table public.maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  maintenance_task_id uuid not null references public.maintenance_tasks (id) on delete cascade,
  completed_date date not null,
  completed_mileage integer not null check (completed_mileage >= 0),
  cost_cents integer check (cost_cents is null or cost_cents >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  maintenance_task_id uuid references public.maintenance_tasks (id) on delete cascade,
  kind text not null check (kind in ('due_soon', 'overdue')),
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.service_templates enable row level security;
alter table public.maintenance_tasks enable row level security;
alter table public.maintenance_logs enable row level security;
alter table public.notifications enable row level security;

create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own vehicles" on public.vehicles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "read active templates" on public.service_templates
  for select using (active = true);

create policy "own tasks" on public.maintenance_tasks
  for all using (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

create policy "own logs" on public.maintenance_logs
  for all using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.user_id = auth.uid()
    )
    and exists (
      select 1 from public.maintenance_tasks t
      where t.id = maintenance_task_id
        and t.vehicle_id = maintenance_logs.vehicle_id
        and exists (
          select 1 from public.vehicles v
          where v.id = t.vehicle_id and v.user_id = auth.uid()
        )
    )
  ) with check (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.user_id = auth.uid()
    )
    and exists (
      select 1 from public.maintenance_tasks t
      where t.id = maintenance_task_id
        and t.vehicle_id = vehicle_id
        and exists (
          select 1 from public.vehicles v
          where v.id = t.vehicle_id and v.user_id = auth.uid()
        )
    )
  );

create policy "own notifications" on public.notifications
  for all using (
    user_id = auth.uid()
    and exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.user_id = auth.uid()
    )
    and (
      maintenance_task_id is null
      or exists (
        select 1 from public.maintenance_tasks t
        where t.id = maintenance_task_id
          and t.vehicle_id = notifications.vehicle_id
          and exists (
            select 1 from public.vehicles v
            where v.id = t.vehicle_id and v.user_id = auth.uid()
          )
      )
    )
  ) with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.user_id = auth.uid()
    )
    and (
      maintenance_task_id is null
      or exists (
        select 1 from public.maintenance_tasks t
        where t.id = maintenance_task_id
          and t.vehicle_id = vehicle_id
          and exists (
            select 1 from public.vehicles v
            where v.id = t.vehicle_id and v.user_id = auth.uid()
          )
      )
    )
  );
```

Seed `service_templates` with the same seven names, descriptions, and intervals as `STARTER_TASKS`. The app copies those values onto each new vehicle so later template edits do not rewrite existing cars.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0001_init.sql lib/dates.ts lib/dates.test.ts lib/starter-tasks.ts package.json
git commit -m "feat: add maintenance schema and starter task definitions"
```

---

### Task 3: Authentication

**Files:**
- Create: `app/sign-in/page.tsx`
- Create: `app/sign-up/page.tsx`
- Create: `app/reset-password/page.tsx`
- Create: `app/sign-in/actions.ts`
- Create: `app/sign-up/actions.ts`
- Create: `app/reset-password/actions.ts`
- Create: `app/auth/sign-out/route.ts`
- Create: `app/(protected)/layout.tsx`
- Create: `components/auth-form.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `createServerClient()` from `lib/supabase/server.ts`
- Produces: a `profiles` row with `id`, `name`, and `email` for every new account
- Produces: `(protected)/layout.tsx` redirects to `/sign-in` when `supabase.auth.getUser()` has no user

- [ ] **Step 1: Replace the landing page**

`app/page.tsx` explains the product in one short paragraph: EasyCarCare tells you what your car needs next, in plain language. Show two links: Create account (`/sign-up`) and Sign in (`/sign-in`). If a session already exists, link to `/dashboard` as well.

- [ ] **Step 2: Build sign up**

The form fields are Name, Email, and Password. The Server Action:

1. Trims the name and lowercases the email.
2. Rejects an empty name, an email without `@`, or a password shorter than 8 characters with a field message.
3. Calls `supabase.auth.signUp({ email, password })`.
4. Inserts `profiles` with the new user id, name, and email.
5. Redirects to `/dashboard` on success.
6. If the email is already registered, shows "That email is already in use." on the email field.

- [ ] **Step 3: Build sign in and sign out**

Sign in accepts email and password. A wrong pair shows one message: "Email or password is incorrect." Do not say which field was wrong. Success redirects to `/dashboard`.

`POST /auth/sign-out` calls `supabase.auth.signOut()` and redirects to `/`.

- [ ] **Step 4: Build password reset**

The form accepts an email and always redirects back with the same notice: "If an account exists for that email, a reset link is on its way." Call `supabase.auth.resetPasswordForEmail` only when the email looks valid. An invalid email gets a field error and does not show the confirmation.

- [ ] **Step 5: Protect the app**

`app/(protected)/layout.tsx` loads the current user. No user means `redirect("/sign-in")`. The layout shows the app name, a link to Vehicles, a link to the dashboard, and a Sign out button.

- [ ] **Step 6: Check it in the browser**

1. Open `/dashboard` while signed out. Expected: the sign-in page.
2. Create an account. Expected: the dashboard route loads, even if it is still an empty placeholder.
3. Sign out. Expected: `/dashboard` sends you to sign in again.
4. Request a reset for a fake email and a real email. Expected: the same confirmation sentence both times.

- [ ] **Step 7: Commit**

```bash
git add app components
git commit -m "feat: add sign up, sign in, sign out, and password reset"
```

---

### Task 4: Vehicles

**Files:**
- Create: `lib/validation.ts`
- Create: `lib/validation.test.ts`
- Create: `components/vehicle-form.tsx`
- Create: `app/(protected)/vehicles/page.tsx`
- Create: `app/(protected)/vehicles/actions.ts`
- Create: `app/(protected)/vehicles/new/page.tsx`
- Create: `app/(protected)/vehicles/[vehicleId]/page.tsx`
- Create: `app/(protected)/vehicles/[vehicleId]/edit/page.tsx`

**Interfaces:**
- Consumes: `createServerClient()`, the signed-in user id
- Produces: `parseVehicleForm(formData: FormData): { ok: true, value: VehicleInput } | { ok: false, errors: Record<string, string> }`
- Produces: `VehicleInput` with `year: number`, `make: string`, `model: string`, `currentMileage: number`, `vin: string | null`, `purchaseDate: string | null`

- [ ] **Step 1: Write failing validation tests**

```ts
// lib/validation.test.ts
import { describe, expect, it } from "vitest";
import { parseVehicleForm } from "./validation";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("parseVehicleForm", () => {
  it("accepts the required fields", () => {
    const result = parseVehicleForm(form({
      year: "2018",
      make: "Honda",
      model: "Civic",
      currentMileage: "54200",
    }));
    expect(result).toEqual({
      ok: true,
      value: { year: 2018, make: "Honda", model: "Civic", currentMileage: 54200, vin: null, purchaseDate: null },
    });
  });

  it("rejects a short VIN", () => {
    const result = parseVehicleForm(form({
      year: "2018", make: "Honda", model: "Civic", currentMileage: "10", vin: "ABC",
    }));
    expect(result.ok).toBe(false);
  });

  it("rejects a lower mileage when previousMileage is provided", () => {
    const result = parseVehicleForm(form({
      year: "2018", make: "Honda", model: "Civic", currentMileage: "10",
    }), 50);
    expect(result.ok).toBe(false);
  });
});
```

Run: `npx vitest run lib/validation.test.ts`

Expected: FAIL because `parseVehicleForm` is not defined.

- [ ] **Step 2: Implement the validator**

`parseVehicleForm(formData, previousMileage?)` returns field errors for a missing make or model, a year outside 1980 through next year, a mileage that is not a whole number of 0 or more, a mileage below `previousMileage`, or a VIN that is not 17 valid characters. Blank VIN and blank purchase date become `null`.

Run: `npx vitest run lib/validation.test.ts`

Expected: PASS.

- [ ] **Step 3: Build the list, create, edit, and delete screens**

The list shows year, make, model, and mileage. The empty state says "No vehicles yet" and links to Add vehicle. Delete asks for confirmation, then deletes the vehicle. Dependent tasks and logs disappear because the foreign keys use `on delete cascade`.

The detail page shows the vehicle and an Update mileage link, which Task 6 fills in. Until then it can render the heading and mileage.

Create and edit use `parseVehicleForm`. On success, go to that vehicle's detail page. On failure, show the field errors and keep the typed values.

- [ ] **Step 4: Check ownership**

Create two accounts, each with one vehicle. While signed in as the first account, open the second account's vehicle URL. Expected: not found, and no vehicle details on the page.

- [ ] **Step 5: Commit**

```bash
git add lib/validation.ts lib/validation.test.ts app/(protected)/vehicles components/vehicle-form.tsx
git commit -m "feat: add vehicle list, create, edit, and delete"
```

---

### Task 5: Starter maintenance plan

**Files:**
- Modify: `app/(protected)/vehicles/actions.ts`
- Modify: `app/(protected)/vehicles/[vehicleId]/page.tsx`
- Create: `components/task-list.tsx`

**Interfaces:**
- Consumes: `STARTER_TASKS` and `addMonths`. New tasks are saved with status `upcoming`. Task 6 replaces that with `taskStatus` as soon as the scheduling module exists.
- Produces: exactly seven `maintenance_tasks` rows for each new vehicle, one per starter name

- [ ] **Step 1: Create the tasks in the same action as the vehicle**

After the vehicle insert succeeds, insert seven rows. For each starter task:

- Copy name, description, `interval_miles`, and `interval_months`.
- Set `is_custom` to false.
- Set `next_due_mileage` to `currentMileage + intervalMiles` when miles exist.
- Set `next_due_date` with `addMonths(today, intervalMonths)` when months exist.
- The unique `(vehicle_id, name)` constraint stops a second insert from creating duplicates. If the task insert fails, delete the new vehicle and show "We could not create the maintenance plan. Please try again."

- [ ] **Step 2: Show the plan**

The vehicle page lists each task's name, description, next due mileage, next due date, and the words Upcoming, Due soon, or Overdue. Include the sentence "These intervals are general estimates."

- [ ] **Step 3: Check it**

Add a 2018 Honda Civic at 54,200 miles. Expected: seven tasks, oil change due at 59,200 miles, and no duplicate tasks after a refresh. A second user cannot open this vehicle's task list.

- [ ] **Step 4: Commit**

```bash
git add app/(protected)/vehicles components/task-list.tsx
git commit -m "feat: generate a starter maintenance plan for each vehicle"
```

---

### Task 6: Mileage and due status, built by hand

This is the feature to write by hand. Use AI to explain an error message if you get stuck, but type the status rules and the mileage form yourself.

**Files:**
- Create: `lib/scheduling.ts`
- Create: `lib/scheduling.test.ts`
- Create: `components/mileage-form.tsx`
- Create: `app/(protected)/vehicles/[vehicleId]/mileage-actions.ts`
- Modify: `app/(protected)/vehicles/[vehicleId]/page.tsx`
- Modify: the vehicle-create action so new tasks use `taskStatus`

**Interfaces:**
- Consumes: `addMonths` is not required here
- Produces:

```ts
export const DUE_SOON_MILES = 500;
export const DUE_SOON_DAYS = 30;
export type TaskStatus = "upcoming" | "due" | "overdue";

export function taskStatus(input: {
  currentMileage: number;
  today: string;
  nextDueMileage: number | null;
  nextDueDate: string | null;
}): TaskStatus;

export function healthSummary(tasks: { status: TaskStatus }[]): {
  score: number;
  label: "Good shape" | "Needs attention" | "Overdue care";
};
```

- [ ] **Step 1: Write the failing tests**

```ts
// lib/scheduling.test.ts
import { describe, expect, it } from "vitest";
import { healthSummary, taskStatus } from "./scheduling";

const today = "2026-10-17";

describe("taskStatus", () => {
  it("is overdue when mileage is at the due mileage", () => {
    expect(taskStatus({
      currentMileage: 59000, today, nextDueMileage: 59000, nextDueDate: null,
    })).toBe("overdue");
  });

  it("is overdue when the date is today", () => {
    expect(taskStatus({
      currentMileage: 1000, today, nextDueMileage: null, nextDueDate: today,
    })).toBe("overdue");
  });

  it("is due soon within 500 miles", () => {
    expect(taskStatus({
      currentMileage: 58500, today, nextDueMileage: 59000, nextDueDate: null,
    })).toBe("due");
  });

  it("is due soon within 30 days", () => {
    expect(taskStatus({
      currentMileage: 1000, today, nextDueMileage: null, nextDueDate: "2026-11-16",
    })).toBe("due");
  });

  it("is upcoming outside both windows", () => {
    expect(taskStatus({
      currentMileage: 1000, today, nextDueMileage: 10000, nextDueDate: "2027-10-17",
    })).toBe("upcoming");
  });

  it("uses the more urgent of mileage and date", () => {
    expect(taskStatus({
      currentMileage: 59000, today, nextDueMileage: 59000, nextDueDate: "2027-01-01",
    })).toBe("overdue");
  });
});

describe("healthSummary", () => {
  it("starts at good shape", () => {
    expect(healthSummary([{ status: "upcoming" }])).toEqual({ score: 100, label: "Good shape" });
  });

  it("drops for due and overdue tasks", () => {
    expect(healthSummary([
      { status: "overdue" },
      { status: "due" },
    ])).toEqual({ score: 80, label: "Good shape" });
  });
});
```

Run: `npx vitest run lib/scheduling.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 2: Write `lib/scheduling.ts` by hand**

Compare dates as `YYYY-MM-DD` strings. A null due field does not count. Mileage is overdue at `currentMileage >= nextDueMileage`. Mileage is due soon when `nextDueMileage - currentMileage` is from 1 through 500. A date is due soon when it is after today and no more than 30 days away. Pick the more urgent result when both exist.

`healthSummary` starts at 100, subtracts 15 per overdue task and 5 per due task, and floors at 0. Map the score to the three labels in the locked rules.

Run: `npx vitest run lib/scheduling.test.ts`

Expected: PASS. Add one test if a boundary you care about is missing, then make it pass. Do not change the locked thresholds to make a test easier.

- [ ] **Step 3: Save mileage and recalculate every task**

The mileage form shows the current mileage and one number field. The action rejects an empty value, a value below the stored mileage, and any non-number. On success it updates `vehicles.current_mileage`, loads that vehicle's tasks, writes each task's new `status` from `taskStatus`, and returns to the vehicle page.

The vehicle page shows the status word next to every task.

- [ ] **Step 4: Check the boundaries**

Using the Civic at 54,200 miles, set mileage to 58,700. Expected: oil change says Due soon, because 59,200 is 500 miles away. Set mileage to 59,200. Expected: oil change says Overdue. Try 50,000. Expected: the form shows an error and the stored mileage stays 59,200.

- [ ] **Step 5: Commit**

```bash
git add lib/scheduling.ts lib/scheduling.test.ts components/mileage-form.tsx app/(protected)/vehicles
git commit -m "feat: update mileage and calculate due status"
```

---

### Task 7: Maintenance logs and history

**Files:**
- Create: `components/log-form.tsx`
- Create: `app/(protected)/tasks/[taskId]/page.tsx`
- Create: `app/(protected)/tasks/[taskId]/log/page.tsx`
- Create: `app/(protected)/tasks/[taskId]/log/actions.ts`
- Create: `app/(protected)/logs/[logId]/edit/page.tsx`
- Create: `app/(protected)/logs/[logId]/edit/actions.ts`
- Create: `app/(protected)/vehicles/[vehicleId]/history/page.tsx`

**Interfaces:**
- Consumes: `taskStatus`, `addMonths`
- Produces: `recalculateTask(taskId: string): Promise<void>`, used after create, edit, and delete. It loads the newest remaining log by `completed_date`, then `completed_mileage`. It writes `next_due_mileage`, `next_due_date`, and `status`.

- [ ] **Step 1: Create a log**

The form asks for completed date, mileage, optional cost in dollars, and optional notes. Reject a future date and a blank or negative mileage. Store cost as cents (`Math.round(dollars * 100)`). After insert, if the log mileage is higher than the vehicle mileage, update the vehicle mileage. Then call `recalculateTask`.

Next due values come from the completed date and mileage plus that task's intervals, not from today's date.

- [ ] **Step 2: Edit and delete**

Edit uses the same validation. Delete asks for confirmation. Both call `recalculateTask`. When no logs remain, `recalculateTask` uses the vehicle's current mileage and `created_at` date, matching the locked rule above. Put that choice in a one-line comment above the calculation.

- [ ] **Step 3: Show history**

`/vehicles/[vehicleId]/history` lists logs for that vehicle, newest completed date first. Each row shows task name, date, mileage, cost when present, and notes. The empty state says "No service has been logged yet." The task page shows that task's logs and a Log completion link.

- [ ] **Step 4: Check a full service**

Log an oil change on 2026-10-01 at 54,200 miles. Expected: the task's next due mileage is 59,200, and the history page shows the entry. Edit the mileage to 55,000. Expected: next due mileage becomes 60,000. Delete the log. Expected: history is empty and the task has a due point again.

- [ ] **Step 5: Commit**

```bash
git add components/log-form.tsx app/(protected)/tasks app/(protected)/logs app/(protected)/vehicles/[vehicleId]/history
git commit -m "feat: log completed maintenance and reschedule the task"
```

---

### Task 8: Dashboard

**Files:**
- Create: `app/(protected)/dashboard/page.tsx`
- Create: `app/(protected)/dashboard/actions.ts`
- Modify: `components/app-nav.tsx` if the protected layout does not already link here

**Interfaces:**
- Consumes: `healthSummary` and task `status`
- Produces: the dashboard for one selected vehicle id, read from the `vehicle` search parameter. If it is missing, use the user's most recently created vehicle.

- [ ] **Step 1: Build the page**

Show the vehicle name, current mileage, health label, score, overdue tasks, due-soon tasks, and the five newest logs. Overdue items are listed before due-soon items. Each task links to `/tasks/[taskId]`. An Update mileage button links to the vehicle page.

If the user has no vehicles, show "Add your first car" and a link to `/vehicles/new`. Do not show an empty health score.

The vehicle switcher is a list of the user's vehicles. Choosing one sets `?vehicle=` and the whole page reloads that vehicle's data.

- [ ] **Step 2: Check both widths**

At a desktop width, the vehicle summary can sit beside the task list. At 320px, the same sections stack in one column and no text is cut off. Statuses are readable without relying on color.

- [ ] **Step 3: Commit**

```bash
git add app/(protected)/dashboard components/app-nav.tsx
git commit -m "feat: show the vehicle dashboard"
```

---

### Task 9: Responsive pass and README

**Files:**
- Modify: `app/globals.css`, shared layout, and forms only where the browser check fails
- Modify: `README.md`

**Interfaces:**
- Consumes: the pages from Tasks 3 through 8
- Produces: a README with the project purpose, setup, and the prototype limits

- [ ] **Step 1: Walk the core path at two widths**

Use a desktop window and a 320px-wide window.

1. Sign up.
2. Add a vehicle.
3. Confirm seven tasks.
4. Update mileage into the due-soon window, then past due.
5. Log a service and open history.
6. Return to the dashboard and switch vehicles if you have two.

Fix any blocked button, missing label, or horizontal scroll before adding stretch features.

- [ ] **Step 2: Update the README**

Include:

- What EasyCarCare does, in the same plain language as the landing page.
- The stack: Next.js, Supabase Auth, Supabase Postgres.
- How to install, fill in `.env.local` from `.env.local.example`, run the SQL migration, and start `npm run dev`.
- How to run `npm test`.
- Known limits: general maintenance intervals, no VIN lookup, no offline mode, no email reminders other than password reset.
- The hand-built piece: mileage and due status.

- [ ] **Step 3: Commit**

```bash
git add README.md app components
git commit -m "docs: describe the Next.js prototype setup"
```

---

## Stretch tasks

Start these only after Task 9's browser walk works.

### Task 10: Profile

`/profile` shows name, email, and reminder preference. Reminder preference has one choice in this prototype: in-app. Saving updates `profiles`. Email changes also call the Supabase auth email update.

### Task 11: Custom tasks

From the vehicle page, a user can add a task with a name, description, and at least one of mileage interval or month interval. `is_custom` is true. They can edit or delete only custom tasks. Starter tasks stay in place for the prototype so the original plan cannot be wiped by accident. A custom task cannot reuse a starter task name, because each vehicle can have only one task with a given name.

### Task 12: In-app notifications

When mileage is saved or a log is recalculated, create a notification for each task that is due soon or overdue, if that user does not already have an unread notification for that task and kind. `/notifications` lists them. Mark one read, or mark all read. No email is sent.

## Spec check

| Spec requirement | Where it is handled |
| --- | --- |
| Sign up, sign in, sign out, password reset | Task 3 |
| Users see only their own data | Row-level security in Task 2, plus the two-account check in Task 4 |
| Vehicle create, read, update, delete | Task 4 |
| VIN format when provided | Task 2 constraint and Task 4 validator |
| Seven starter tasks | Task 5 |
| Custom tasks | Stretch Task 11 |
| Log create, edit, delete, and reschedule | Task 7 |
| Dashboard, switcher, health, due lists, recent activity | Task 8 |
| Mileage update | Task 6, hand-built |
| In-app notifications | Stretch Task 12 |
| Profile and reminder preference | Stretch Task 10 |
| Phone and desktop layout | Task 8 and Task 9 |
| VIN lookup, email reminders, offline, admin, receipts | Left out on purpose |

## What this plan does not do yet

It does not deploy to Vercel. Deploy after the Task 9 browser walk, using the same Supabase project and the environment variables from `.env.local.example`.
