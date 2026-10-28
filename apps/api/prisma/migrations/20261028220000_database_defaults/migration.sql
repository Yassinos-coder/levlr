ALTER TABLE "levlr"."broker_connections" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "levlr"."workspaces" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "levlr"."watchlists" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "levlr"."chart_layouts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "levlr"."chart_drawings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "levlr"."trades" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "levlr"."ai_conversations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "levlr"."ai_messages" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "levlr"."alerts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "levlr"."workspaces" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE "levlr"."chart_layouts" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE "levlr"."chart_drawings" ALTER COLUMN "updated_at" SET DEFAULT now();

CREATE OR REPLACE FUNCTION "levlr"."set_updated_at"() RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW."updated_at" = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER "workspaces_set_updated_at" BEFORE UPDATE ON "levlr"."workspaces" FOR EACH ROW EXECUTE FUNCTION "levlr"."set_updated_at"();
CREATE TRIGGER "chart_layouts_set_updated_at" BEFORE UPDATE ON "levlr"."chart_layouts" FOR EACH ROW EXECUTE FUNCTION "levlr"."set_updated_at"();
CREATE TRIGGER "chart_drawings_set_updated_at" BEFORE UPDATE ON "levlr"."chart_drawings" FOR EACH ROW EXECUTE FUNCTION "levlr"."set_updated_at"();
