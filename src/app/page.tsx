import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { HeroScrollDemo } from "@/components/ui/hero-scroll-demo";
import { GlowingEffectDemo } from "@/components/ui/glowing-effect-demo";
import { FeatureStepsDemo } from "@/components/ui/feature-steps-demo";

export default async function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Master Any Subject with Flashcards
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Create, study, and track your progress with intelligent flashcard decks
        </p>

        <div className="space-y-4">
          <p className="text-lg text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
            <SignUpButton mode="modal">
              <Button variant="default" size="sm">Sign up</Button>
            </SignUpButton>
            <span>to start creating and studying your flashcards</span>
          </p>
        </div>

        {/* Demo + product summary below the hero */}
        <HeroScrollDemo />
        <FeatureStepsDemo />
      </div>

      <section className="mt-10 max-w-5xl mx-auto text-left px-4">
        <h2 className="text-2xl font-semibold mb-3">Learn faster with flashcards</h2>
        <p className="text-muted-foreground mb-6">Create, study, and retain knowledge with spaced repetition, AI-assisted card generation, and progress tracking.</p>
        <GlowingEffectDemo />
      </section>
    </div>
  );
}
