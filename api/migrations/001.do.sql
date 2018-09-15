create table schemaless (
  type text not null,
  details jsonb,

  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create index type_idx on schemaless (type);

create table locations (
  id bigserial primary key,
  name text unique not null
);

create table type_groups (
  id bigserial primary key,
  name text unique not null
);

create table types (
  id bigserial primary key,
  type_group_id bigint not null references type_groups (id),

  name text not null,
  details jsonb
);

create unique index name_on_type_group_id_idx on types (type_group_id, name);

create table game_accounts (
  id bigserial primary key,

  type_id bigint not null references types (id),

  details jsonb,

  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create table user_profiles (
  id bigserial primary key,

  discord_id text unique not null,
  discord_details jsonb not null,

  game_account_id bigint unique references game_accounts (id),

  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create index discord_id_idx on user_profiles (discord_id);

create table assets (
  game_account_id bigint not null references game_accounts (id),
  location_id bigint not null references locations (id),
  type_id bigint not null references types (id),

  quantity integer not null,

  primary key(game_account_id, location_id, type_id)
);

create table asset_instances (
  id bigserial primary key,

  game_account_id bigint not null references game_accounts (id),
  location_id bigint references locations (id),
  type_id bigint not null references types (id),

  details jsonb
);

-- definition: a stock or supply of money, materials, staff, and other assets that can be drawn on by a person or organization in order to function effectively.

-- definition: an option or service that gives the opportunity to do or benefit from something.
create table facilities (
  id bigserial primary key,

  game_account_id bigint not null references game_accounts (id),
  type_id bigint not null references types (id),

  details jsonb
);

create table timer_queues (
  id bigserial primary key,

  game_account_id bigint not null references game_accounts (id),
  facility_id bigint not null references facilities (id),

  blocked_type_id bigint,
  blocked_container_id bigint not null,
  blocked_quantity bigint
);

create index timer_queue_blockage_idx on timer_queues (blocked_type_id, blocked_container_id, blocked_quantity) where blocked_type_id IS NOT NULL and blocked_quantity IS NOT NULL;
create unique index game_account_id_facility_id_idx on timer_queues (game_account_id, facility_id);

create table timers (
  id bigserial primary key,
  game_account_id bigint not null references game_accounts (id),

  handler text not null,
  trigger_at timestamp with time zone,
  retries int not null default 0,

  facility_id bigint references facilities (id),
  queue_id bigint references timer_queues (id),
  next_id bigint references timers (id),
  list_head boolean not null default false,

  details jsonb
);

create index trigger_at_idx on timers (trigger_at, retries) where trigger_at is not null;
create index queue_id_next_id_idx on timers (queue_id, next_id) where queue_id is not null;
create unique index queue_id_list_head_idx on timers (queue_id) where list_head and queue_id is not null;