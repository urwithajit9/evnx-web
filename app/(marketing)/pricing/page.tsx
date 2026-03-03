import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge-status';
import { Check } from 'lucide-react';

export const metadata = {
  title: 'Pricing',
  description: 'evnx pricing plans.',
};

export default function PricingPage() {
  return (
    <div>
      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base section-padding">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Simple, Transparent Pricing.
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl">
            Free CLI forever. Cloud features coming soon.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-base">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-bg-surface border border-border-muted rounded-lg p-8">
              <h3 className="text-2xl font-serif font-bold mb-2">Free</h3>
              <p className="text-text-secondary mb-6">
                CLI tool. Forever. Open source.
              </p>

              <div className="text-4xl font-serif font-bold mb-2">
                $0
                <span className="text-lg text-text-secondary font-mono font-normal">/month</span>
              </div>

              <Button className="w-full mb-8" asChild>
                <a href="https://crates.io/crates/evnx">Install Now</a>
              </Button>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>All CLI features</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Open source (MIT)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Community support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Unlimited scanning</span>
                </div>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="bg-bg-base border-2 border-brand-500 rounded-lg p-8 relative">
              <div className="absolute -top-3 left-4">
                <Badge variant="brand">Coming Soon</Badge>
              </div>

              <h3 className="text-2xl font-serif font-bold mb-2">Pro</h3>
              <p className="text-text-secondary mb-6">
                Cloud sync and team features.
              </p>

              <div className="text-4xl font-serif font-bold mb-2">
                $9
                <span className="text-lg text-text-secondary font-mono font-normal">/month</span>
              </div>

              <Button variant="outline" className="w-full mb-8" disabled>
                Join Waitlist
              </Button>

              <div className="space-y-4 text-sm text-text-secondary">
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                  <span>Everything in Free</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                  <span>Cloud sync across machines</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                  <span>Encrypted remote backup</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                  <span>Version history</span>
                </div>
              </div>
            </div>

            {/* Team Tier */}
            <div className="bg-bg-surface border border-border-muted rounded-lg p-8">
              <h3 className="text-2xl font-serif font-bold mb-2">Team</h3>
              <p className="text-text-secondary mb-6">
                Shared secrets and collaboration.
              </p>

              <div className="text-4xl font-serif font-bold mb-2">
                $29
                <span className="text-lg text-text-secondary font-mono font-normal">/month</span>
              </div>

              <Button variant="outline" className="w-full mb-8" disabled>
                Contact Sales
              </Button>

              <div className="space-y-4 text-sm text-text-secondary">
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                  <span>Everything in Pro</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                  <span>Team workspace</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                  <span>Role-based access</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                  <span>Audit logs & SSO</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-bg-surface border border-border-muted rounded-lg p-8 max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-serif font-bold mb-3">
              Cloud features launching Q2 2024
            </h3>
            <p className="text-text-secondary mb-6">
              Join the waitlist to be notified when Pro and Team tiers become available.
            </p>
            <div className="flex gap-4 justify-center">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-bg-base border border-border-muted rounded px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button>Notify Me</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
