import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUser } from '@/contexts/UserContext';
import { Badge, getUserBadges } from "@/services/badgeService";
import { Spinner } from "@/components/ui/spinner";
import { Shield, Award, MessageSquare, Target, Check, Lightbulb } from "lucide-react";

const BadgeCard = ({ badge }: { badge: Badge }) => {
  // Define icons for different badge types
  const getBadgeIcon = () => {
    switch (badge.type) {
      case 'cases_joined':
        return <Shield className="h-12 w-12" />;
      case 'messages_sent':
        return <MessageSquare className="h-12 w-12" />;
      case 'case_solved':
        return <Check className="h-12 w-12" />;
      case 'first_case':
        return <Lightbulb className="h-12 w-12" />;
      default:
        return <Award className="h-12 w-12" />;
    }
  };

  // Define color schemes for different badge types
  const getBadgeColorClass = () => {
    switch (badge.type) {
      case 'cases_joined':
        return "bg-blue-800/20 text-blue-400 border-blue-500/30";
      case 'messages_sent':
        return "bg-green-800/20 text-green-400 border-green-500/30";
      case 'case_solved':
        return "bg-purple-800/20 text-purple-400 border-purple-500/30";
      case 'first_case':
        return "bg-amber-800/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-800/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className={`border rounded-lg p-6 flex flex-col items-center text-center transition-all ${getBadgeColorClass()} hover:scale-105`}>
      <div className={`p-4 rounded-full ${badge.unlocked ? 'opacity-100' : 'opacity-40'}`}>
        {getBadgeIcon()}
      </div>
      <h3 className="text-lg font-bold mt-4 mb-1">{badge.name}</h3>
      <p className="text-sm mb-4">{badge.description}</p>
      {badge.unlocked ? (
        <div className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
          Unlocked {badge.unlockedDate && new Date(badge.unlockedDate).toLocaleDateString()}
        </div>
      ) : (
        <div className="text-xs px-2 py-1 rounded-full bg-slate-500/20 text-slate-400">
          {badge.progress ? `${badge.progress}% Complete` : 'Locked'}
        </div>
      )}
    </div>
  );
};

const BadgeCategorySection = ({ title, badges }: { title: string, badges: Badge[] }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Award className="mr-2 h-5 w-5" /> {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </section>
  );
};

const Badges = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const loadBadges = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const userBadges = await getUserBadges();
          setBadges(userBadges);
        } catch (error) {
          console.error("Error loading badges:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadBadges();
  }, [user]);

  // Group badges by category
  const groupedBadges = badges.reduce((groups, badge) => {
    const category = badge.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(badge);
    return groups;
  }, {} as Record<string, Badge[]>);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Loading badges...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Your Badges</h1>
            <p className="mt-2 text-muted-foreground">
              Track your achievements and progress through the platform
            </p>
          </header>

          {badges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-3">
                <Award className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">No Badges Yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Start exploring cases and participate in discussions to earn badges.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
                <BadgeCategorySection 
                  key={category} 
                  title={category} 
                  badges={categoryBadges} 
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Badges; 