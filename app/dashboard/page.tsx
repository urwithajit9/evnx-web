import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard',
  description: 'evnx cloud dashboard.',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container-base section-padding">
        <div className="max-w-2xl mx-auto">
          <div className="bg-bg-surface border border-border-muted rounded-lg p-12 text-center">
            <div className="bg-brand-500 bg-opacity-10 border border-brand-500 border-opacity-20 rounded-lg p-8 mb-8 inline-block">
              <div className="w-12 h-12 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-black mx-auto mb-4">
                e
              </div>
            </div>

            <h1 className="text-3xl font-serif font-bold mb-4">
              evnx Cloud Sync
            </h1>

            <p className="text-lg text-text-secondary mb-8">
              Coming soon. Join the waitlist at{' '}
              <Link href="/pricing" className="text-brand-500 hover:text-brand-400">
                /pricing
              </Link>{' '}
              to be notified when cloud features launch.
            </p>

            <div className="bg-bg-base border border-border-subtle rounded-lg p-6 mb-8 text-left text-sm font-mono">
              <p className="text-text-muted mb-2"># Planned features:</p>
              <ul className="text-text-secondary space-y-1">
                <li>• Cloud sync across machines and teams</li>
                <li>• Encrypted secret storage</li>
                <li>• Team collaboration & role-based access</li>
                <li>• Audit logs and activity tracking</li>
                <li>• Web dashboard for secret management</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/guides">Read Guides</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
