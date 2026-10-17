create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  reminder_preference text not null default 'in_app' check (reminder_preference in ('in_app')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    lower(new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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

insert into public.service_templates (name, description, default_interval_miles, default_interval_months) values
  ('Oil change', 'Fresh oil keeps the engine running smoothly. This is general guidance, not a manufacturer schedule.', 5000, 6),
  ('Tire rotation', 'Rotating tires helps them wear evenly. This is general guidance, not a manufacturer schedule.', 7500, 6),
  ('Tire-pressure check', 'Tires at the right pressure are safer and use less fuel. This is general guidance, not a manufacturer schedule.', 1000, 1),
  ('Air-filter replacement', 'A clean air filter helps the engine breathe. This is general guidance, not a manufacturer schedule.', 15000, 12),
  ('Brake inspection', 'A periodic brake check can catch wear before it becomes a safety problem. This is general guidance, not a manufacturer schedule.', 10000, 12),
  ('Battery check', 'A quick battery check can prevent a no-start surprise. This is general guidance, not a manufacturer schedule.', null, 6),
  ('Coolant inspection', 'Coolant protects the engine from overheating and freezing. This is general guidance, not a manufacturer schedule.', 30000, 24);
