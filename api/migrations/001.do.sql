CREATE TABLE schemaless (
  type text NOT NULL,
  details jsonb,

  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX type_idx ON schemaless (type);

CREATE TABLE timer_queues (
  id BIGSERIAL PRIMARY KEY,

  blocked_type text,
  blocked_container bigint,
  blocked_quantity bigint
);

CREATE INDEX timer_queue_blockage_idx ON timer_queues (blocked_type, blocked_container, blocked_quantity);

CREATE TABLE timers (
  id BIGSERIAL PRIMARY KEY,

  handler text NOT NULL,
  trigger_at TIMESTAMP WITH TIME ZONE,

  queue_id bigint REFERENCES timer_queues (id),
  next_id bigint REFERENCES timers (id),
  list_head boolean NOT NULL default false,

  details jsonb
);

CREATE INDEX trigger_at_idx ON timers (trigger_at) WHERE trigger_at IS NOT NULL;
CREATE INDEX queue_id_next_id_idx ON timers (queue_id, next_id) WHERE queue_id IS NOT NULL;
CREATE UNIQUE INDEX queue_id_list_head_idx ON timers (queue_id) WHERE list_head AND queue_id IS NOT NULL;

CREATE TABLE assets (
  id text PRIMARY KEY,
  amount integer NOT NULL
);