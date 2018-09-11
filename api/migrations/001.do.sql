create table schemaless (
  type text not null,
  details jsonb,

  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create index type_idx on schemaless (type);

create table user_profiles (
  id bigserial primary key,

  discord_id text unique not null,
  discord_details jsonb not null,

  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create index discord_id_idx on user_profiles (discord_id);

create table game_accounts (
  id bigserial primary key,
  user_profile_id bigint not null references user_profiles (id),

  details jsonb
);

create table timer_queues (
  id bigserial primary key,

  blocked_type text,
  blocked_container bigint,
  blocked_quantity bigint
);

create index timer_queue_blockage_idx on timer_queues (blocked_type, blocked_container, blocked_quantity);

create table timers (
  id bigserial primary key,

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

create table assets (
  id text primary key,
  amount integer not null
);