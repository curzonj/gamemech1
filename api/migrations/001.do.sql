CREATE TABLE users (
  id uuid PRIMARY KEY,
  google_id text UNIQUE NOT NULL,
  google_name text
);

CREATE TYPE owner_type_name AS ENUM ('account', 'corporation');

CREATE TABLE accounts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,

  details jsonb
);

CREATE TABLE solar_systems (
  id uuid PRIMARY KEY,
  name text UNIQUE NOT NULL,

  details jsonb
);

CREATE TABLE sites (
  id uuid PRIMARY KEY,
  solar_system_id uuid NOT NULL,
  name text NOT NULL,

  details jsonb
);

CREATE TABLE structures (
  id uuid PRIMARY KEY,
  type_id uuid NOT NULL,

  solar_system_id uuid NOT NULL,
  site_id uuid NOT NULL,

  owner_id uuid NOT NULL,
  owner_type owner_type_name NOT NULL,

  details jsonb
);

CREATE TABLE production_jobs (
  id uuid PRIMARY KEY,
  structure_id uuid NOT NULL,

  owner_id uuid NOT NULL,
  owner_type owner_type_name NOT NULL,

  created_at timestamp,
  details jsonb
);

CREATE TABLE resources (
  id uuid PRIMARY KEY,

  solar_system_id uuid NOT NULL,
  site_id uuid NOT NULL,

  details jsonb
);

CREATE TABLE templates (
  id uuid PRIMARY KEY,
  name text UNIQUE NOT NULL,
  
  details jsonb
);

CREATE TABLE designs (
  id uuid PRIMARY KEY,
  template_id uuid NOT NULL,

  owner_id uuid NOT NULL,
  owner_type owner_type_name NOT NULL,

  details jsonb
);

CREATE TABLE types (
  id uuid PRIMARY KEY,
  template_id uuid NOT NULL,
  design_id uuid,

  details jsonb
);

CREATE TABLE assets (
  owner_id uuid NOT NULL,
  owner_type owner_type_name NOT NULL,

  solar_system_id uuid,
  site_id uuid,

  type_id uuid NOT NULL,

  PRIMARY KEY(owner_id, site_id, type_id)
);