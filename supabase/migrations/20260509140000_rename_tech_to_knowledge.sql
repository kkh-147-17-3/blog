-- Rename TECH category to KNOWLEDGE.
-- Postgres 10+ supports renaming enum values in place; existing rows keep their data.
alter type public.post_category rename value 'TECH' to 'KNOWLEDGE';
