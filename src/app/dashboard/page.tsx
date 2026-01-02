import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Welcome back, {user?.firstName || "there"}!
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">My Decks</h3>
            <p className="text-sm text-muted-foreground">
              View and manage your flashcard decks
            </p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Study Session</h3>
            <p className="text-sm text-muted-foreground">
              Start a new study session
            </p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Progress</h3>
            <p className="text-sm text-muted-foreground">
              Track your learning progress
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

