import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECE8E2] dark:bg-[#1B1B1B]">
      <SignIn
        path="/sign-in"
        routing="path"
        afterSignInUrl="/"
        afterSignUpUrl="/"
      />
    </div>
  );
}
