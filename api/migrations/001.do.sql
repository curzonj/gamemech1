create table schemaless (
  type text not null,
  details jsonb,

  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create index on schemaless (type);

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

create table loot_tables (
  name text not null,
  threshold double precision not null,

  details jsonb,

  primary key (name, threshold)
);

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

create index on user_profiles (discord_id);

create table assets (
  game_account_id bigint not null references game_accounts (id),
  location_id bigint not null references locations (id),
  type_id bigint not null references types (id),

  -- this is denormalized and matches the type_id's group. It'll make queries a lot faster
  type_group_id bigint not null references type_groups (id),

  quantity integer not null,

  primary key (game_account_id, location_id, type_id)
);

create index on assets (type_group_id, game_account_id, location_id);

create table asset_instances (
  id bigserial primary key,

  game_account_id bigint not null references game_accounts (id),
  location_id bigint not null references locations (id),
  type_id bigint not null references types (id),

  details jsonb
);

create table recipes  (
  id bigserial primary key,

  -- used to facilitate generating recipes and updating them
  identity_key text unique not null,

  facility_type_id bigint references types (id),

  dependencies bigint[] not null,
  consumables bigint[] not null,
  outputs bigint[] not null,

  details jsonb
);

-- definition: a stock or supply of money, materials, staff, and other assets that can be drawn on by a person or organization in order to function effectively.
-- create table resources

create table timer_queues (
  game_account_id bigint not null references game_accounts (id),
  asset_instance_id bigint not null references asset_instances (id),

  blocked_type_id bigint,
  blocked_container_id bigint not null,
  blocked_quantity bigint,

  primary key (game_account_id, asset_instance_id)
);

create index on timer_queues (blocked_type_id, blocked_container_id, blocked_quantity) where blocked_type_id IS NOT NULL and blocked_quantity IS NOT NULL;

create table timers (
  id bigserial primary key,
  game_account_id bigint not null references game_accounts (id),

  handler text not null,
  trigger_at timestamp with time zone,
  retries int not null default 0,

  asset_instance_id bigint not null references asset_instances (id),
  next_id bigint references timers (id),
  list_head boolean not null default false,

  details jsonb
);

create index on timers (trigger_at, retries) where trigger_at is not null;
create index on timers (game_account_id, asset_instance_id, next_id) where next_id is not null;

-- postgresql is unable to represent this as a constraint
create unique index queue_list_head_idx on timers (game_account_id, asset_instance_id) where list_head;