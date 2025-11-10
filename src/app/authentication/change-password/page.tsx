'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockIcon, UserIcon } from 'lucide-react';
import { toast } from 'sonner';

import { useUserStore } from '@/stores/user.store';

const sampleTestimonials = [
  {
    avatarSrc: 'https://randomuser.me/api/portraits/women/57.jpg',
    name: 'Sarah Chen',
    handle: 'Supply Chain Director',
    text: 'Gradian has revolutionized our business management. Real-time tracking and inventory visibility have reduced our operational costs by 30%.',
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/64.jpg',
    name: 'Marcus Johnson',
    handle: 'Operations Manager',
    text: 'The comprehensive dashboard and analytics in Gradian give us complete visibility into our business. Compliance tracking has never been easier.',
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'David Martinez',
    handle: 'Procurement Lead',
    text: "Gradian's intuitive interface and powerful features make managing complex business operations effortless. It's transformed our workflow completely.",
  },
];

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex gap-2 flex-nowrap items-center rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: (typeof sampleTestimonials)[number]; delay: string }) => (
  <div
    className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-card/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10 p-5 w-64`}
  >
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
      <p className="text-muted-foreground">{testimonial.handle}</p>
      <p className="mt-1 text-foreground/80">{testimonial.text}</p>
    </div>
  </div>
);

export default function ChangePasswordPage() {
  const router = useRouter();
  const storeUser = useUserStore((state) => state.user);

  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Change Password | Gradian App';
    }
  }, []);

  useEffect(() => {
    if (storeUser?.email) {
      setUsername(storeUser.email);
    }
  }, [storeUser?.email]);

  const isSubmitDisabled = useMemo(
    () =>
      isLoading ||
      !username.trim() ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword,
    [confirmPassword, currentPassword, isLoading, newPassword, username],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      const message = 'Please enter your email or username.';
      setError(message);
      toast.error(message);
      return;
    }

    if (newPassword.length < 8) {
      const message = 'New password must be at least 8 characters long.';
      setError(message);
      toast.error(message);
      return;
    }

    if (newPassword !== confirmPassword) {
      const message = 'New passwords do not match.';
      setError(message);
      toast.error(message);
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

    if (!clientId || !secretKey) {
      const message = 'Client credentials are not configured. Please contact support.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          secretKey,
          username: trimmedUsername,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const message = data.error || 'Failed to change password. Please verify your credentials.';
        setError(message);
        toast.error(message);
        setIsLoading(false);
        return;
      }

      toast.success(data.message || 'Password changed successfully. Please sign in again.');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
      router.push('/authentication/login');
    } catch (err) {
      console.error('Change password error:', err);
      const message = 'An unexpected error occurred. Please try again.';
      setError(message);
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex flex-col md:flex-row font-sans overflow-hidden">
      <section className="flex-1 flex items-center justify-center p-8 overflow-y-auto min-h-0">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">
              Change password
            </h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">
              Update your password securely. You will be asked to sign in again once the change is complete.
            </p>

            {error && (
              <div className="animate-element animate-delay-250 rounded-2xl border border-red-500/50 bg-red-500/10 dark:bg-red-500/5 p-4">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="animate-element animate-delay-300 flex flex-col gap-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Email or username
                </label>
                <GlassInputWrapper>
                  <input
                    name="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    placeholder="Enter your email or username"
                    className="flex-1 bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-350 flex flex-col gap-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <LockIcon className="h-4 w-4" />
                  Current password
                </label>
                <GlassInputWrapper>
                  <input
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter your current password"
                    className="flex-1 bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center z-10"
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                    )}
                  </button>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400 flex flex-col gap-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <LockIcon className="h-4 w-4" />
                  New password
                </label>
                <GlassInputWrapper>
                  <input
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="Enter your new password"
                    className="flex-1 bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center z-10"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                    )}
                  </button>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-450 flex flex-col gap-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <LockIcon className="h-4 w-4" />
                  Confirm new password
                </label>
                <GlassInputWrapper>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="Confirm your new password"
                    className="flex-1 bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center z-10"
                    aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                    )}
                  </button>
                </GlassInputWrapper>
              </div>

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="animate-element animate-delay-550 w-full rounded-2xl bg-violet-500 py-4 font-medium text-violet-50 hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating password...' : 'Change password'}
              </button>
            </form>

            <p className="animate-element animate-delay-700 text-center text-sm text-muted-foreground">
              Need to reset instead?{' '}
              <button
                type="button"
                onClick={() => router.push('/authentication/reset-password')}
                className="text-violet-400 hover:underline transition-colors"
              >
                Go to reset password
              </button>
            </p>
          </div>
        </div>
      </section>

      <section className="hidden md:block flex-1 relative p-4 overflow-hidden">
        <div
          className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center"
          style={{ backgroundImage: 'url(/screenshots/gradian.me_bg_desktop.png)' }}
        ></div>
        {sampleTestimonials.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
            <TestimonialCard testimonial={sampleTestimonials[0]} delay="animate-delay-1000" />
            {sampleTestimonials[1] && (
              <div className="hidden xl:flex">
                <TestimonialCard testimonial={sampleTestimonials[1]} delay="animate-delay-1200" />
              </div>
            )}
            {sampleTestimonials[2] && (
              <div className="hidden 2xl:flex">
                <TestimonialCard testimonial={sampleTestimonials[2]} delay="animate-delay-1400" />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
