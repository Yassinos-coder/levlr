CREATE TABLE "levlr"."ai_provider_keys" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "secret_ref" TEXT NOT NULL,
    "key_hint" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "ai_provider_keys_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ai_provider_keys_user_id_provider_key" ON "levlr"."ai_provider_keys"("user_id", "provider");

ALTER TABLE "levlr"."ai_provider_keys" ADD CONSTRAINT "ai_provider_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "levlr"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "levlr"."ai_provider_keys" ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER "ai_provider_keys_set_updated_at"
BEFORE UPDATE ON "levlr"."ai_provider_keys"
FOR EACH ROW EXECUTE FUNCTION "levlr"."set_updated_at"();
