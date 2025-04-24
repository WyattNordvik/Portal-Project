/*
  Warnings:

  - A unique constraint covering the columns `[confirmToken]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subscription_confirmToken_key" ON "Subscription"("confirmToken");
