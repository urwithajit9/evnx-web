import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Login',
  description: 'Sign in to your evnx account.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="w-full max-w-md">
        <div className="bg-bg-surface border border-border-muted rounded-lg p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-black text-sm">
              e
            </div>
            <span className="font-serif text-xl font-bold">evnx</span>
          </div>

          <h1 className="text-2xl font-serif font-bold text-center mb-2">Sign In</h1>
          <p className="text-text-secondary text-center text-sm mb-8">
            Access your evnx cloud workspace
          </p>

          <div className="space-y-4 mb-8 p-6 bg-bg-base border border-border-subtle rounded">
            <div className="text-center">
              <p className="text-text-secondary text-sm mb-4">
                Authentication coming soon with cloud features.
              </p>
              <p className="text-xs text-text-muted">
                Cloud sync and team collaboration launching Q2 2024
              </p>
            </div>
          </div>

          <Button className="w-full mb-4" disabled>
            Sign In with Email
          </Button>

          <div className="text-center text-sm text-text-secondary">
            <p>
              Don't have an account?{' '}
              <span className="text-brand-500">Sign up</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
