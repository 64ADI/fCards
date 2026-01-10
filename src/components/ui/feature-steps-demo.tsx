"use client"

import React from "react"
import { FeatureSteps } from "@/components/ui/feature-section"

const features = [
  {
    step: "Step 1",
    title: "Create a Deck",
    content: "Set up a new deck to organize your flashcards by topic or goal.",
    image: "/images/1.png",
  },
  {
    step: "Step 2",
    title: "Add Cards",
    content: "Create cards manually or use AI generation to quickly turn your notes into flashcards.",
    image: "/images/2.png",
  },
  {
    step: "Step 3",
    title: "Start Studying",
    content: "Begin reviewing your cards, track your progress, and reinforce learning over time.",
    image: "/images/3.png",
  },
]

export function FeatureStepsDemo() {
  return (
    <FeatureSteps
      features={features}
      title="Your Journey Starts Here"
      autoPlayInterval={4000}
      imageHeight="h-[400px]"
    />
  )
}
