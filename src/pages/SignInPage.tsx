import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <main className="min-h-screen spotlight-bg flex items-center justify-center px-4 py-10 md:py-0">
      
      <div
        className="
          w-full 
          max-w-sm sm:max-w-md 
          bg-white/10 
          backdrop-blur-2xl 
          border border-white/20 
          shadow-2xl 
          rounded-2xl 
          p-4 sm:p-6 md:p-6
          transition-all
        "
      >
        <SignIn
          path="/sign-in"
          routing="path"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-white text-black hover:bg-white/90 transition duration-300 rounded-lg",
              card: "bg-transparent shadow-none",
              headerTitle: "text-white text-xl sm:text-2xl",
              headerSubtitle: "text-white/70 text-sm",
              formFieldInput: "bg-white/10 text-white border-white/20",
              formFieldLabel: "text-white text-sm",
              footerActionText: "text-white/70 text-sm",
              footerActionLink: "text-white hover:text-white/70",
            },
          }}
          afterSignInUrl="/dashboard"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </main>
  );
}
