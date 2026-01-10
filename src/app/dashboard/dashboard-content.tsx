"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CreateDeckButton } from "./create-deck-button";
import { DeckLimitDisplay } from "./deck-limit-display";

interface DashboardContentProps {
  decks: Array<{
    id: number;
    name: string;
    description: string | null;
    updatedAt: Date;
  }>;
  hasUnlimitedDecks: boolean;
  deckLimit: number | null;
  canCreateDeck: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function DashboardContent({
  decks,
  hasUnlimitedDecks,
  deckLimit,
  canCreateDeck,
}: DashboardContentProps) {
  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-4xl font-bold mb-2">My Decks</h1>
          <p className="text-muted-foreground">
            Manage and study your flashcard decks
          </p>
        </motion.div>

        {/* Action Bar */}
        <motion.div
          className="mb-8 flex items-center justify-between"
          variants={itemVariants}
        >
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
        </motion.div>

        {/* Decks Grid */}
        {decks.length === 0 ? (
          <motion.div variants={itemVariants}>
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
                  Get started by creating your first flashcard deck. Build custom
                  decks for any subject you want to master.
                </p>
                <CreateDeckButton
                  canCreateDeck={canCreateDeck}
                  currentDeckCount={decks.length}
                  deckLimit={deckLimit}
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
          >
            {decks.map((deck, index) => (
              <motion.div key={deck.id} variants={cardVariants}>
                <Link href={`/dashboard/deck/${deck.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
