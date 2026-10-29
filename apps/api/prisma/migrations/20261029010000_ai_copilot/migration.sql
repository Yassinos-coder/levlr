ALTER TABLE "levlr"."ai_settings" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'anthropic';
ALTER TABLE "levlr"."ai_settings" ADD COLUMN "allow_plan_trades" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "levlr"."ai_settings" ADD COLUMN "allow_manage_trades" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "levlr"."ai_trade_proposals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "connection_id" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "resolved_at" TIMESTAMPTZ,

    CONSTRAINT "ai_trade_proposals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_trade_proposals_user_id_status_idx" ON "levlr"."ai_trade_proposals"("user_id", "status");

ALTER TABLE "levlr"."ai_trade_proposals" ADD CONSTRAINT "ai_trade_proposals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "levlr"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "levlr"."ai_trade_proposals" ADD CONSTRAINT "ai_trade_proposals_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "levlr"."broker_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "levlr"."ai_trade_proposals" ENABLE ROW LEVEL SECURITY;
