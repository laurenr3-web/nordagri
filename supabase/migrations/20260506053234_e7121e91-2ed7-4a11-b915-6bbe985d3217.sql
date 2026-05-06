-- Create planned_shifts table for scheduled team presence
create table if not exists public.planned_shifts (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  farm_member_id uuid not null references public.farm_members(id) on delete cascade,
  shift_date date not null,
  start_time time null,
  end_time time null,
  role text null,
  notes text null,
  status text not null default 'scheduled',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint planned_shifts_status_check
    check (status in ('scheduled','confirmed','absent','completed')),
  constraint planned_shifts_time_order_check
    check (start_time is null or end_time is null or start_time < end_time)
);

create index if not exists planned_shifts_farm_date_idx on public.planned_shifts(farm_id, shift_date);
create index if not exists planned_shifts_member_date_idx on public.planned_shifts(farm_member_id, shift_date);
create index if not exists planned_shifts_farm_status_date_idx on public.planned_shifts(farm_id, status, shift_date);

alter table public.planned_shifts enable row level security;

-- Idempotent policies
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='planned_shifts' and policyname='Planned shifts viewable by farm member') then
    create policy "Planned shifts viewable by farm member"
      on public.planned_shifts for select
      to authenticated
      using (public.is_farm_member(farm_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='planned_shifts' and policyname='Planned shifts insertable by farm member') then
    create policy "Planned shifts insertable by farm member"
      on public.planned_shifts for insert
      to authenticated
      with check (public.has_farm_role(farm_id, 'member'));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='planned_shifts' and policyname='Planned shifts updatable by farm member') then
    create policy "Planned shifts updatable by farm member"
      on public.planned_shifts for update
      to authenticated
      using (public.has_farm_role(farm_id, 'member'));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='planned_shifts' and policyname='Planned shifts deletable by farm admin') then
    create policy "Planned shifts deletable by farm admin"
      on public.planned_shifts for delete
      to authenticated
      using (public.has_farm_role(farm_id, 'admin'));
  end if;
end $$;

-- Trigger updated_at (reuse existing public.set_updated_at)
drop trigger if exists planned_shifts_set_updated_at on public.planned_shifts;
create trigger planned_shifts_set_updated_at
  before update on public.planned_shifts
  for each row execute function public.set_updated_at();