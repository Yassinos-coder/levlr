CREATE UNIQUE INDEX "broker_connections_user_id_broker_external_account_id_key" ON "levlr"."broker_connections"("user_id", "broker", "external_account_id");
