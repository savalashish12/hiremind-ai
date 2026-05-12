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

function App() {

  return (

    <BrowserRouter>

      <Navbar />

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
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/applicants/:jobId"
          element={<Applicants />}
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
          path="/candidate-dashboard"
          element={
            <ProtectedRoute role="CANDIDATE">
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;