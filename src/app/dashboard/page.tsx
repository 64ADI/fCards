import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getUserDecks } from "@/db/queries/deck-queries";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CreateDeckButton } from "./create-deck-button";
import { DeletionAlert } from "./deletion-alert";
import { DeckLimitDisplay } from "./deck-limit-display";

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
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Decks</h1>
          <p className="text-muted-foreground">
            Manage and study your flashcard decks
          </p>
        </div>

        {/* Action Bar */}
        <div className="mb-8 flex items-center justify-between">
          <DeckLimitDisplay
            currentCount={decks.length}
            limit={deckLimit}
            hasUnlimited={hasUnlimitedDecks}
          />
          <CreateDeckButton 
            canCreateDeck={canCreateDeck}
            currentDeckCount={decks.length}
            deckLimit={deckLimit}
          />
        </div>

        {/* Decks Grid */}
        {decks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <svg 
                  className="w-12 h-12 text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No decks yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Get started by creating your first flashcard deck. Build custom decks for any subject you want to master.
              </p>
              <CreateDeckButton 
                canCreateDeck={canCreateDeck}
                currentDeckCount={decks.length}
                deckLimit={deckLimit}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <Link 
                key={deck.id}
                href={`/dashboard/deck/${deck.id}`}
              >
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer h-full"
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{deck.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {deck.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <svg 
                          className="w-4 h-4" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                          />
                        </svg>
                        <span>0 cards</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg 
                          className="w-4 h-4" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                          />
                        </svg>
                        <span>
                          {new Date(deck.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

