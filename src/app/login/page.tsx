'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { useUserStore } from "@/stores/user.store";
import { toast } from "sonner";

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "Supply Chain Director",
    text: "Gradian has revolutionized our pharmaceutical supply chain management. Real-time tracking and inventory visibility have reduced our operational costs by 30%."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "Operations Manager",
    text: "The comprehensive dashboard and analytics in Gradian give us complete visibility into our supply chain. Compliance tracking has never been easier."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "Procurement Lead",
    text: "Gradian's intuitive interface and powerful features make managing complex pharmaceutical supply chains effortless. It's transformed our workflow completely."
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = 'Login | Gradian App';
  }, []);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    setError(null); // Clear previous errors
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (!email || !password) {
        const errorMessage = 'Please enter both email and password';
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Show appropriate error message
        const errorMessage = data.error || 'Login failed. Please check your credentials.';
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      // Store tokens (if needed for client-side usage)
      if (data.tokens) {
        // Store access token in localStorage for API calls
        localStorage.setItem('auth_token', data.tokens.accessToken);
        localStorage.setItem('refresh_token', data.tokens.refreshToken);
      }

      // Store user in zustand store
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          lastname: data.user.lastname,
          role: data.user.role as 'admin' | 'procurement' | 'vendor',
          department: data.user.department,
          avatar: data.user.avatar,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      toast.success(data.message || 'Login successful!');
      
      // Redirect to dashboard or home page
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'An error occurred during login. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    // TODO: Implement password reset logic
    toast.info("Password reset functionality coming soon");
  };

  const handleCreateAccount = () => {
    // TODO: Implement account creation navigation
    toast.info("Account creation functionality coming soon");
  };

  return (
    <SignInPage
      heroImageSrc="/screenshots/gradian.me_bg_desktop.png"
      testimonials={sampleTestimonials}
      onSignIn={handleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
      error={error}
      isLoading={isLoading}
    />
  );
}

