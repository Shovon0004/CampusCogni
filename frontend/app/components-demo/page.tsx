"use client";

import { BackgroundPaths } from "@/components/background-paths";
import { FloatingNavbar } from "@/components/floating-navbar";
import { BentoGrid } from "@/components/ui/bento-grid";
import { BentoCard } from "@/components/ui/bento-card";
import {
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Video,
  Globe,
  Users,
  Briefcase,
  Heart,
  Settings,
  MessageSquare,
  Calendar,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";

export default function ComponentsShowcase() {
  const bentoItems = [
    {
      title: "Analytics Dashboard",
      meta: "v2.4.1",
      description: "Real-time metrics with AI-powered insights and predictive analytics for better decision making",
      icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
      status: "Live",
      tags: ["Statistics", "Reports", "AI"],
      colSpan: 2,
      hasPersistentHover: true,
    },
    {
      title: "User Management",
      meta: "v1.2.0", 
      description: "Comprehensive user roles and permissions system with advanced security features",
      icon: <Users className="w-4 h-4 text-green-500" />,
      status: "Active",
      tags: ["Users", "Security"],
      colSpan: 1,
    },
    {
      title: "Content Library",
      meta: "v3.1.0",
      description: "Organized media assets with smart categorization and AI-powered search",
      icon: <Video className="w-4 h-4 text-purple-500" />,
      status: "Beta",
      tags: ["Media", "Storage"],
      colSpan: 1,
    },
    {
      title: "Global Network",
      meta: "v2.0.0",
      description: "Connect with users worldwide through our distributed infrastructure",
      icon: <Globe className="w-4 h-4 text-indigo-500" />,
      status: "Active",
      tags: ["Network", "Global"],
      colSpan: 1,
    },
    {
      title: "Job Board",
      meta: "v1.8.5",
      description: "Advanced job matching algorithm with personalized recommendations",
      icon: <Briefcase className="w-4 h-4 text-orange-500" />,
      status: "Featured",
      tags: ["Jobs", "AI"],
      colSpan: 1,
      hasPersistentHover: true,
    },
    {
      title: "Real-time Chat",
      meta: "v4.2.1",
      description: "Instant messaging with file sharing, reactions, and thread support",
      icon: <MessageSquare className="w-4 h-4 text-cyan-500" />,
      status: "Live",
      tags: ["Chat", "Real-time"],
      colSpan: 1,
    },
  ];

  return (
    <div className="min-h-screen">
      <BackgroundPaths />
      <FloatingNavbar userRole="USER" userName="Demo User" />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Beautiful Bento Components</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Elegant cards with smooth animations and modern design
            </p>
          </div>

          {/* Bento Grid Demo */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Bento Grid Layout</h2>
            <BentoGrid items={bentoItems} />
          </div>

          {/* Individual Bento Cards Demo */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Individual Bento Cards</h2>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <BentoCard
                title="Total Users"
                description="Active users on the platform"
                icon={<Users className="h-4 w-4 text-blue-500" />}
                status="Growing"
                meta="12,543 users"
                tags={["Active", "Growth"]}
                cta="View Details →"
              >
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  12,543
                </div>
              </BentoCard>

              <BentoCard
                title="Revenue"
                description="Monthly recurring revenue"
                icon={<BarChart3 className="h-4 w-4 text-green-500" />}
                status="Up 12%"
                meta="$45,678"
                tags={["Revenue", "Monthly"]}
                cta="Analytics →"
                hasPersistentHover={true}
              >
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  $45,678
                </div>
              </BentoCard>

              <BentoCard
                title="Success Rate"
                description="Application success rate"
                icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
                status="Excellent"
                meta="94.2%"
                tags={["Success", "High"]}
                cta="Improve →"
              >
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  94.2%
                </div>
              </BentoCard>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <BentoCard
                title="Advanced Security"
                description="Multi-layer security with encryption and monitoring"
                icon={<Shield className="h-4 w-4 text-red-500" />}
                status="Protected"
                tags={["Security", "Encryption", "Monitoring"]}
                cta="Learn More →"
                variant="large"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    End-to-end encryption
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    24/7 monitoring
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Advanced threat detection
                  </div>
                </div>
              </BentoCard>

              <BentoCard
                title="Lightning Fast"
                description="Optimized performance with edge computing"
                icon={<Zap className="h-4 w-4 text-yellow-500" />}
                status="Optimized"
                tags={["Performance", "Speed", "Edge"]}
                cta="Benchmark →"
                variant="large"
                hasPersistentHover={true}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-blue-500" />
                    &lt; 100ms response time
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4 text-green-500" />
                    Global CDN network
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    99.9% uptime
                  </div>
                </div>
              </BentoCard>
            </div>

            {/* Compact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <BentoCard
                title="Settings"
                description="Configure your preferences"
                icon={<Settings className="h-4 w-4 text-gray-500" />}
                status="Available"
                cta="Configure →"
                variant="compact"
              />

              <BentoCard
                title="Calendar"
                description="Schedule and manage events"
                icon={<Calendar className="h-4 w-4 text-indigo-500" />}
                status="Synced"
                cta="View →"
                variant="compact"
              />

              <BentoCard
                title="Favorites"
                description="Your saved items"
                icon={<Heart className="h-4 w-4 text-pink-500" />}
                status="Updated"
                cta="Browse →"
                variant="compact"
                hasPersistentHover={true}
              />

              <BentoCard
                title="Reviews"
                description="Customer feedback"
                icon={<Star className="h-4 w-4 text-amber-500" />}
                status="4.9★"
                cta="Read →"
                variant="compact"
              />
            </div>
          </div>

          {/* Usage Guide */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">How to Use</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">BentoGrid Component:</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
{`<BentoGrid items={[
  {
    title: "Feature Name",
    description: "Feature description",
    icon: <Icon className="w-4 h-4 text-blue-500" />,
    status: "Active",
    tags: ["tag1", "tag2"],
    colSpan: 2,
    hasPersistentHover: true
  }
]} />`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">BentoCard Component:</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
{`<BentoCard
  title="Card Title"
  description="Card description"
  icon={<Icon className="h-4 w-4 text-blue-500" />}
  status="Active"
  tags={["tag1", "tag2"]}
  cta="Action →"
  variant="default" // or "large" or "compact"
  hasPersistentHover={true}
  onClick={() => console.log('clicked')}
>
  <div>Custom content here</div>
</BentoCard>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
