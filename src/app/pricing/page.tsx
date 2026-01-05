import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Select the perfect plan for your learning journey
          </p>
        </div>
        <div className="flex justify-center">
          <PricingTable />
        </div>
      </div>
    </div>
  );
}

