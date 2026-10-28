-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "levlr";

-- CreateTable
CREATE TABLE "levlr"."profiles" (
    "id" UUID NOT NULL,
    "display_name" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levlr"."broker_connections" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "broker" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "external_account_id" TEXT NOT NULL,
    "account_label" TEXT,
    "secret_ref" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "last_sync_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broker_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levlr"."workspaces" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "layout" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levlr"."watchlists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "symbols" TEXT[],
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levlr"."chart_layouts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "chart_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levlr"."chart_drawings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "symbol" TEXT NOT NULL,
    "shape_type" TEXT NOT NULL,
    "points" JSONB NOT NULL,
    "properties" JSONB NOT NULL,
    "label" TEXT,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "chart_drawings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levlr"."risk_settings" (
    "user_id" UUID NOT NULL,
    "max_risk_pct" DECIMAL(6,3) NOT NULL DEFAULT 1,
    "max_open_risk_pct" DECIMAL(6,3) NOT NULL DEFAULT 3,
    "daily_loss_pct" DECIMAL(6,3) NOT NULL DEFAULT 3,
    "cooldown_losses" INTEGER NOT NULL DEFAULT 2,
    "cooldown_minutes" INTEGER NOT NULL DEFAULT 60,
    "max_trades_window" INTEGER NOT NULL DEFAULT 5,
    "window_minutes" INTEGER NOT NULL DEFAULT 30,
    "weak_hours" INTEGER[],
    "prop_mode" JSONB,

    CONSTRAINT "risk_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "levlr"."trades" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "connection_id" UUID NOT NULL,
    "broker_position_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "volume" DECIMAL(18,6) NOT NULL,
    "entry" DECIMAL(18,8) NOT NULL,
    "exit" DECIMAL(18,8),
    "sl" DECIMAL(18,8),
    "tp" DECIMAL(18,8),
    "risk_amount" DECIMAL(18,2),
    "pnl" DECIMAL(18,2),
    "r_multiple" DECIMAL(8,3),
    "opened_at" TIMESTAMPTZ NOT NULL,
    "closed_at" TIMESTAMPTZ,
    "session" TEXT,
    "snapshot_path" TEXT,
    "analysis" JSONB,
    "notes" TEXT,
    "tags" TEXT[],

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levlr"."ai_settings" (
    "user_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT NOT NULL DEFAULT 'claude-sonnet-5-5',
    "methodology_prompt" TEXT,
    "key_secret_ref" TEXT,

    CONSTRAINT "ai_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "levlr"."ai_conversations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "symbol" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levlr"."ai_messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levlr"."alerts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "params" JSONB NOT NULL,
    "ai_comment" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "broker_connections_user_id_idx" ON "levlr"."broker_connections"("user_id");

-- CreateIndex
CREATE INDEX "workspaces_user_id_idx" ON "levlr"."workspaces"("user_id");

-- CreateIndex
CREATE INDEX "watchlists_user_id_idx" ON "levlr"."watchlists"("user_id");

-- CreateIndex
CREATE INDEX "chart_layouts_user_id_idx" ON "levlr"."chart_layouts"("user_id");

-- CreateIndex
CREATE INDEX "chart_drawings_user_id_symbol_idx" ON "levlr"."chart_drawings"("user_id", "symbol");

-- CreateIndex
CREATE INDEX "trades_user_id_opened_at_idx" ON "levlr"."trades"("user_id", "opened_at");

-- CreateIndex
CREATE UNIQUE INDEX "trades_connection_id_broker_position_id_key" ON "levlr"."trades"("connection_id", "broker_position_id");

-- CreateIndex
CREATE INDEX "ai_conversations_user_id_idx" ON "levlr"."ai_conversations"("user_id");

-- CreateIndex
CREATE INDEX "ai_messages_conversation_id_idx" ON "levlr"."ai_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "alerts_user_id_idx" ON "levlr"."alerts"("user_id");

-- AddForeignKey
ALTER TABLE "levlr"."broker_connections" ADD CONSTRAINT "broker_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "levlr"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levlr"."workspaces" ADD CONSTRAINT "workspaces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "levlr"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levlr"."watchlists" ADD CONSTRAINT "watchlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "levlr"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levlr"."chart_layouts" ADD CONSTRAINT "chart_layouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "levlr"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levlr"."chart_drawings" ADD CONSTRAINT "chart_drawings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "levlr"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levlr"."risk_settings" ADD CONSTRAINT "risk_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "levlr"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levlr"."trades" ADD CONSTRAINT "trades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "levlr"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levlr"."trades" ADD CONSTRAINT "trades_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "levlr"."broker_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levlr"."ai_settings" ADD CONSTRAINT "ai_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "levlr"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levlr"."ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "levlr"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levlr"."ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "levlr"."ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levlr"."alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "levlr"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

