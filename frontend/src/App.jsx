import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import JobDetailPage from "./pages/JobDetailPage";
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

// Nested pages (lazy for faster initial load)
const CandidateDashboard = lazy(() => import("./pages/CandidateDashboard"));
const RecruiterDashboard = lazy(() => import("./pages/RecruiterDashboard"));
const CandidateApplications = lazy(() => import("./pages/candidate/CandidateApplications"));
const ResumeUploadPage = lazy(() => import("./pages/candidate/ResumeUploadPage"));
const SkillGapPage = lazy(() => import("./pages/candidate/SkillGapPage"));
const CareerRoadmapPage = lazy(() => import("./pages/candidate/CareerRoadmapPage"));
const MockHistoryPage = lazy(() => import("./pages/candidate/MockHistoryPage"));
const MockSessionPage = lazy(() => import("./pages/candidate/MockSessionPage"));
const CandidateProfilePage = lazy(() => import("./pages/candidate/CandidateProfilePage"));
const NotificationsPage = lazy(() => import("./pages/candidate/NotificationsPage"));
const RecruiterJobsPage = lazy(() => import("./pages/recruiter/RecruiterJobsPage"));
const RecruiterJobDetailPage = lazy(() => import("./pages/recruiter/RecruiterJobDetailPage"));
const PostJobPage = lazy(() => import("./pages/recruiter/PostJobPage"));
const CandidateViewPage = lazy(() => import("./pages/recruiter/CandidateViewPage"));
const ComparePage = lazy(() => import("./pages/recruiter/ComparePage"));
const InterviewsPage = lazy(() => import("./pages/recruiter/InterviewsPage"));
const RecruiterAnalyticsPage = lazy(() => import("./pages/recruiter/RecruiterAnalyticsPage"));
const DocumentsPage = lazy(() => import("./pages/recruiter/DocumentsPage"));
const ChatbotPage = lazy(() => import("./pages/recruiter/ChatbotPage"));
const AdminOverviewPage = lazy(() => import("./pages/admin/AdminOverviewPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminJobsPage = lazy(() => import("./pages/admin/AdminJobsPage"));
const AdminActivityLogPage = lazy(() => import("./pages/admin/AdminActivityLogPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));

const Lazy = ({ children }) => (
  <Suspense fallback={<div className="p-10 text-slate-400 text-sm animate-pulse">Loading...</div>}>{children}</Suspense>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <CommandPalette />
      <ErrorBoundary>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/pricing" element={<SubscriptionPricing />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/company/:recruiterId" element={<PublicCompanyProfile />} />
          <Route path="/portfolio/:candidateId" element={<PublicPortfolio />} />

          {/* ── Candidate (nested sidebar shell) ── */}
          <Route path="/candidate" element={<ProtectedRoute role="CANDIDATE"><DashboardLayout role="CANDIDATE" /></ProtectedRoute>}>
            <Route path="dashboard" element={<Lazy><CandidateDashboard /></Lazy>} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetailPage />} />
            <Route path="applications" element={<Lazy><CandidateApplications /></Lazy>} />
            <Route path="resume-upload" element={<Lazy><ResumeUploadPage /></Lazy>} />
            <Route path="resume-builder" element={<ResumeBuilder />} />
            <Route path="ats-score" element={<AtsScoreDashboard />} />
            <Route path="skill-gap/:jobId" element={<Lazy><SkillGapPage /></Lazy>} />
            <Route path="career-roadmap" element={<Lazy><CareerRoadmapPage /></Lazy>} />
            <Route path="mock-interview" element={<CandidateMockInterview />} />
            <Route path="mock-interview/history" element={<Lazy><MockHistoryPage /></Lazy>} />
            <Route path="mock-interview/:id" element={<Lazy><MockSessionPage /></Lazy>} />
            <Route path="portfolio" element={<CandidatePortfolioManager />} />
            <Route path="saved-jobs" element={<SavedJobs />} />
            <Route path="profile" element={<Lazy><CandidateProfilePage /></Lazy>} />
            <Route path="payment-history" element={<ProtectedRoute role="CANDIDATE"><PaymentHistory /></ProtectedRoute>} />
            <Route path="notifications" element={<Lazy><NotificationsPage /></Lazy>} />
          </Route>

          {/* ── Recruiter ── */}
          <Route path="/recruiter" element={<ProtectedRoute role="RECRUITER"><DashboardLayout role="RECRUITER" /></ProtectedRoute>}>
            <Route path="dashboard" element={<Lazy><RecruiterDashboard /></Lazy>} />
            <Route path="jobs" element={<Lazy><RecruiterJobsPage /></Lazy>} />
            <Route path="jobs/:id" element={<Lazy><RecruiterJobDetailPage /></Lazy>} />
            <Route path="post-job" element={<Lazy><PostJobPage /></Lazy>} />
            <Route path="applicants/:jobId" element={<Applicants />} />
            <Route path="pipeline/:jobId" element={<JobPipelineKanban />} />
            <Route path="candidate/:id" element={<Lazy><CandidateViewPage /></Lazy>} />
            <Route path="compare" element={<Lazy><ComparePage /></Lazy>} />
            <Route path="interviews" element={<Lazy><InterviewsPage /></Lazy>} />
            <Route path="company-profile" element={<CompanyProfileManager />} />
            <Route path="analytics" element={<Lazy><RecruiterAnalyticsPage /></Lazy>} />
            <Route path="documents" element={<Lazy><DocumentsPage /></Lazy>} />
            <Route path="chatbot" element={<Lazy><ChatbotPage /></Lazy>} />
            <Route path="notifications" element={<Lazy><NotificationsPage /></Lazy>} />
          </Route>

          {/* ── Admin ── */}
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><DashboardLayout role="ADMIN" /></ProtectedRoute>}>
            <Route path="dashboard" element={<Lazy><AdminOverviewPage /></Lazy>} />
            <Route path="users" element={<Lazy><AdminUsersPage /></Lazy>} />
            <Route path="jobs" element={<Lazy><AdminJobsPage /></Lazy>} />
            <Route path="activity-log" element={<Lazy><AdminActivityLogPage /></Lazy>} />
            <Route path="analytics" element={<Lazy><AdminAnalyticsPage /></Lazy>} />
          </Route>

          {/* ── Legacy flat-route redirects (bookmarks compat) ── */}
          <Route path="/candidate-dashboard" element={<Navigate to="/candidate/dashboard" replace />} />
          <Route path="/candidate/ats" element={<Navigate to="/candidate/ats-score" replace />} />
          <Route path="/recruiter-dashboard" element={<Navigate to="/recruiter/dashboard" replace />} />
          <Route path="/applicants/:jobId" element={<Applicants />} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/payment/history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
