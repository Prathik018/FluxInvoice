import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import NewInvoice from "@/pages/NewInvoice";
import SavedInvoices from "./pages/SavedInvoices";


function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      {/* Protected dashboard */}
      <Route
        path="/dashboard"
        element={
          <>
            <SignedIn>
              <Dashboard />
            </SignedIn>

            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />

      {/* Protected new invoice page */}
      <Route
        path="/dashboard/new-invoice"

        element={
          <>
            <SignedIn>
              <NewInvoice />   {/* ✅ your full builder UI */}
            </SignedIn>

            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/dashboard/invoices"
        element={
          <>
            <SignedIn><SavedInvoices /></SignedIn>
            <SignedOut><RedirectToSignIn /></SignedOut>
          </>
        }
      />



      {/* 404 */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}

export default App;
