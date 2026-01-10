import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getUserDecks } from "@/db/queries/deck-queries";
import { DeletionAlert } from "./deletion-alert";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const { userId, has } = await auth();

  // Redirect to home if not authenticated
  if (!userId) {
    redirect("/");
  }

  // Fetch user's decks using query function
  const decks = await getUserDecks(userId);
  
  // Check if user has unlimited decks feature
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
  const deckLimit = hasUnlimitedDecks ? null : 3;
  const canCreateDeck = hasUnlimitedDecks || decks.length < 3;

  return (
    <>
      <Suspense fallback={null}>
        <DeletionAlert />
      </Suspense>
      <DashboardContent
        decks={decks}
        hasUnlimitedDecks={hasUnlimitedDecks}
        deckLimit={deckLimit}
        canCreateDeck={canCreateDeck}
      />
    </>
  );
}

