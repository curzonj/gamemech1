create table schemaless (
  type text not null,
  details jsonb,

  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create index type_idx on schemaless (type);

create table game_accounts (
  id bigserial primary key,

  -- type can be one of player, corporation, maybe bot
  type text not null,

  details jsonb,

  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create table user_profiles (
  id bigserial primary key,

  discord_id text unique not null,
  discord_details jsonb not null,

  game_account_id bigint references game_accounts (id),

  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create index discord_id_idx on user_profiles (discord_id);

create table timer_queues (
  id bigserial primary key,

  blocked_type_id bigint,
  blocked_container bigint,
  blocked_quantity bigint
);

create index timer_queue_blockage_idx on timer_queues (blocked_type_id, blocked_container, blocked_quantity);

create table timers (
  id bigserial primary key,
  game_account_id bigint not null references game_accounts (id),

  handler text not null,
  trigger_at timestamp with time zone,

  queue_id bigint references timer_queues (id),
  next_id bigint references timers (id),
  list_head boolean not null default false,

  details jsonb
);

create index trigger_at_idx on timers (trigger_at) where trigger_at is not null;
create index queue_id_next_id_idx on timers (queue_id, next_id) where queue_id is not null;
create unique index queue_id_list_head_idx on timers (queue_id) where list_head and queue_id is not null;

create table types (
  id bigserial primary key,

  name text not null
);

create unique index type_name_idx on types (name);

create table assets (
  game_account_id bigint not null references game_accounts (id),
  type_id bigint not null references types (id),

  quantity integer not null,

  primary key(game_account_id, type_id)
);