import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import Jobs from "./pages/Jobs";
import Applicants from "./pages/Applicants";
import AdminDashboard from "./pages/AdminDashboard";
import AtsScoreDashboard from "./pages/AtsScoreDashboard";
import CandidateMockInterview from "./pages/CandidateMockInterview";
import JobPipelineKanban from "./pages/JobPipelineKanban";
import CompanyProfileManager from "./pages/CompanyProfileManager";
import PublicCompanyProfile from "./pages/PublicCompanyProfile";
import CandidatePortfolioManager from "./pages/CandidatePortfolioManager";
import PublicPortfolio from "./pages/PublicPortfolio";
import SavedJobs from "./pages/SavedJobs";
import SubscriptionPricing from "./pages/SubscriptionPricing";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import CommandPalette from "./components/CommandPalette";
import ResumeBuilder from "./pages/ResumeBuilder";
import PaymentHistory from "./pages/PaymentHistory";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";

function App() {

  return (

    <BrowserRouter>

      <ScrollToTop />

      <Navbar />

      <CommandPalette />

      <ErrorBoundary>
        <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-email/:token"
          element={<VerifyEmail />}
        />

        <Route
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/applicants/:jobId"
          element={<Applicants />}
        />

        <Route
          path="/company/:recruiterId"
          element={<PublicCompanyProfile />}
        />

        <Route
          path="/portfolio/:candidateId"
          element={<PublicPortfolio />}
        />

        <Route
          path="/recruiter-dashboard"
          element={
            <ProtectedRoute role="RECRUITER">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/company-profile"
          element={
            <ProtectedRoute role="RECRUITER">
              <CompanyProfileManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/pipeline/:jobId"
          element={
            <ProtectedRoute role="RECRUITER">
              <JobPipelineKanban />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate-dashboard"
          element={
            <ProtectedRoute role="CANDIDATE">
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/portfolio"
          element={
            <ProtectedRoute role="CANDIDATE">
              <CandidatePortfolioManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/saved-jobs"
          element={
            <ProtectedRoute role="CANDIDATE">
              <SavedJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/ats"
          element={
            <ProtectedRoute role="CANDIDATE">
              <AtsScoreDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/mock-interview"
          element={
            <ProtectedRoute role="CANDIDATE">
              <CandidateMockInterview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/resume-builder"
          element={
            <ProtectedRoute role="CANDIDATE">
              <ResumeBuilder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pricing"
          element={<SubscriptionPricing />}
        />

        <Route
          path="/payment/history"
          element={
            <ProtectedRoute>
              <PaymentHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/payment-history"
          element={
            <ProtectedRoute role="CANDIDATE">
              <PaymentHistory />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
      </ErrorBoundary>

    </BrowserRouter>
  );
}

export default App;