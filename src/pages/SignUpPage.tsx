import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECE8E2] dark:bg-[#1B1B1B]">
      <SignUp
        path="/sign-up"
        routing="path"
        afterSignInUrl="/"
        afterSignUpUrl="/"
      />
    </div>
  );
}
