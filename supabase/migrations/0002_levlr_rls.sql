grant usage on schema levlr to authenticated, service_role;

alter table levlr.profiles enable row level security;
alter table levlr.broker_connections enable row level security;
alter table levlr.workspaces enable row level security;
alter table levlr.watchlists enable row level security;
alter table levlr.chart_layouts enable row level security;
alter table levlr.chart_drawings enable row level security;
alter table levlr.risk_settings enable row level security;
alter table levlr.trades enable row level security;
alter table levlr.ai_settings enable row level security;
alter table levlr.ai_conversations enable row level security;
alter table levlr.ai_messages enable row level security;
alter table levlr.alerts enable row level security;

create policy profiles_own on levlr.profiles for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy workspaces_own on levlr.workspaces for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy watchlists_own on levlr.watchlists for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy chart_layouts_own on levlr.chart_layouts for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy chart_drawings_own on levlr.chart_drawings for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy risk_settings_own on levlr.risk_settings for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy alerts_own on levlr.alerts for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy broker_connections_read on levlr.broker_connections for select to authenticated
  using (user_id = (select auth.uid()));
create policy trades_read on levlr.trades for select to authenticated
  using (user_id = (select auth.uid()));
create policy ai_settings_read on levlr.ai_settings for select to authenticated
  using (user_id = (select auth.uid()));
create policy ai_conversations_read on levlr.ai_conversations for select to authenticated
  using (user_id = (select auth.uid()));
create policy ai_messages_read on levlr.ai_messages for select to authenticated
  using (exists (
    select 1 from levlr.ai_conversations c
    where c.id = conversation_id and c.user_id = (select auth.uid())
  ));

grant select, insert, update, delete on
  levlr.profiles, levlr.workspaces, levlr.watchlists, levlr.chart_layouts,
  levlr.chart_drawings, levlr.risk_settings, levlr.alerts
  to authenticated;

grant select on
  levlr.broker_connections, levlr.trades, levlr.ai_settings,
  levlr.ai_conversations, levlr.ai_messages
  to authenticated;

grant all on all tables in schema levlr to service_role;
alter default privileges in schema levlr grant all on tables to service_role;
