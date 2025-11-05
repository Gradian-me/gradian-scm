'use client';

import { SignInPage, Testimonial } from "@/components/ui/sign-in";

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
  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Sign In submitted:", data);
    // TODO: Implement actual sign-in logic
    alert(`Sign In Submitted! Check the browser console for form data.`);
  };

  const handleResetPassword = () => {
    // TODO: Implement password reset logic
    alert("Reset Password clicked");
  };

  const handleCreateAccount = () => {
    // TODO: Implement account creation navigation
    alert("Create Account clicked");
  };

  return (
    <SignInPage
      heroImageSrc="https://picsum.photos/1080/1920?w=1920&q=100"
      testimonials={sampleTestimonials}
      onSignIn={handleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
}

