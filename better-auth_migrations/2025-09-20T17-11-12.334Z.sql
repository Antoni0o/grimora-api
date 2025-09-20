-- sheetsLimit and sheetsCount already exist in the table
-- Only adding the plan column that doesn't exist yet

alter table "user" add column "plan" integer null default 0;
update "user" set "plan" = 0 where "plan" is null;
alter table "user" alter column "plan" set not null;