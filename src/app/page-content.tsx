"use client";

import { motion } from "framer-motion";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { HeroScrollDemo } from "@/components/ui/hero-scroll-demo";
import { GlowingEffectDemo } from "@/components/ui/glowing-effect-demo";
import { FeatureStepsDemo } from "@/components/ui/feature-steps-demo";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const itemTransition = {
  duration: 0.6,
  ease: "easeOut" as const,
};

export function PageContent() {
  return (
    <motion.div
      className="container mx-auto px-4 py-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="max-w-3xl mx-auto text-center" variants={itemVariants} transition={itemTransition}>
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6"
          variants={itemVariants}
          transition={itemTransition}
        >
          Master Any Subject with Flashcards
        </motion.h1>
        <motion.p
          className="text-xl text-muted-foreground mb-8"
          variants={itemVariants}
          transition={itemTransition}
        >
          Create, study, and track your progress with intelligent flashcard decks
        </motion.p>

        <motion.div className="space-y-4" variants={itemVariants} transition={itemTransition}>
          <p className="text-lg text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
            <SignUpButton mode="modal">
              <Button variant="default" size="sm">Sign up</Button>
            </SignUpButton>
            <span>to start creating and studying your flashcards</span>
          </p>
        </motion.div>

        {/* Demo + product summary below the hero */}
        <motion.div variants={itemVariants} transition={itemTransition}>
          <HeroScrollDemo />
        </motion.div>
        <motion.div variants={itemVariants} transition={itemTransition}>
          <FeatureStepsDemo />
        </motion.div>
      </motion.div>

      <motion.section
        className="mt-10 max-w-5xl mx-auto text-left px-4"
        variants={itemVariants}
        transition={itemTransition}
      >
        <h2 className="text-2xl font-semibold mb-3">Learn faster with flashcards</h2>
        <p className="text-muted-foreground mb-6">
          Create, study, and retain knowledge with spaced repetition, AI-assisted card
          generation, and progress tracking.
        </p>
        <GlowingEffectDemo />
      </motion.section>
    </motion.div>
  );
}
