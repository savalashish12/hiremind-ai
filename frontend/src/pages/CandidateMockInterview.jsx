import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
// Recharts removed since charts are not rendered in this component

// Static list of 300 companies for corporate mock assessment
const COMPANIES_LIST = [
  "Amazon", "Google", "Microsoft", "Meta", "Apple", "Netflix", "Accenture", "TCS", "Infosys", "Wipro",
  "Cognizant", "Capgemini", "HCL", "IBM", "Deloitte", "EY", "KPMG", "PwC", "Oracle", "Salesforce",
  "Adobe", "PayPal", "Twitter/X", "Stripe", "Uber", "Lyft", "Airbnb", "Snap", "Pinterest", "Zoom",
  "Slack", "Cisco", "Intel", "HP", "Nvidia", "AMD", "Qualcomm", "VMware", "RedHat", "Shopify",
  "Spotify", "Dropbox", "Tesla", "SpaceX", "Walmart", "Target", "Costco", "Boeing", "Lockheed Martin",
  "Sony", "Nintendo", "Sega", "Electronic Arts", "Ubisoft", "Activision", "Riot Games", "Epic Games",
  "Roblox", "ByteDance", "Tencent", "Alibaba", "Baidu", "Xiaomi", "Samsung", "LG", "Hyundai",
  "Hexaware", "Mphasis", "Persistent", "Zensar", "Coforge", "UST Global", "Zoho", "Freshworks",
  "Paytm", "PhonePe", "Razorpay", "Ola", "Swiggy", "Zomato", "Flipkart", "JPMorgan Chase", "Goldman Sachs",
  "Morgan Stanley", "Citi", "Bank of America", "Wells Fargo", "HSBC", "Barclays", "UBS", "Deutsche Bank",
  "Intellect Design", "LTI Mindtree", "Tata Elxsi", "KPIT Technologies", "Cyient", "Zensar Technologies",
  "Tech Mahindra", "Birlasoft", "Sonata Software", "Happiest Minds", "Affle", "Intellect Design Arena",
  "ServiceNow", "Workday", "Snowflake", "Databricks", "Splunk", "Atlassian", "Jira", "Confluence",
  "Asana", "Monday.com", "Notion", "Twilio", "HubSpot", "Dropbox", "DocuSign", "Box", "ZoomInfo",
  "Cloudera", "MongoDB", "Elastic", "Confluent", "HashiCorp", "PagerDuty", "Cloudflare", "Fastly",
  "Okta", "CrowdStrike", "Zscaler", "Palo Alto Networks", "Fortinet", "F5 Networks", "Juniper Networks",
  "Arista Networks", "Extreme Networks", "CommScope", "NetApp", "Pure Storage", "Western Digital",
  "Seagate", "Micron", "Applied Materials", "Lam Research", "KLA Corporation", "ASML", "Tokyo Electron",
  "TSMC", "GlobalFoundries", "SMIC", "UMC", "Samsung Electronics", "SK Hynix", "NXP Semiconductors",
  "Infineon", "STMicroelectronics", "Renesas", "Texas Instruments", "Analog Devices", "Microchip",
  "ON Semiconductor", "Skyworks", "Qorvo", "Broadcom", "Marvell", "Nvidia GPU Tech", "Ciena",
  "Juniper Networks", "Extreme Networks", "Ubiquiti", "Netgear", "Linksys", "TP-Link", "D-Link",
  "Synology", "QNAP", "Asustor", "Buffalo", "Western Digital", "Seagate Technology", "Toshiba",
  "Fujitsu", "NEC", "Hitachi", "Toshiba", "Panasonic", "Mitsubishi Electric", "Sharp", "Kyocera",
  "Murata", "TDK", "Nidec", "Omron", "Keyence", "Fanuc", "Yaskawa", "SMC", "THK", "Harmonic Drive",
  "Cognex", "National Instruments", "Keysight", "Anritsu", "Rohde & Schwarz", "Tektronix", "Fluke",
  "Teledyne", "FLIR", "Trimble", "Garmin", "TomTom", "Here Technologies", "Mapbox", "Esri",
  "Autodesk", "Bentley Systems", "Trimble", "Hexagon", "Leica Geosystems", "Topcon", "Sokkia",
  "FARO", "Riegl", "Optech", "Velodyne", "Luminar", "Ouster", "Innovaiz", "Aeva", "RoboSense",
  "Hesai", "Cepton", "Baraja", "Blickfeld", "Quanergy", "LeddarTech", "Outster LiDAR", "MicroVision",
  "Vuzix", "RealWear", "Magic Leap", "HTC Vive", "Oculus", "Meta Quest", "Valve Index", "Sony PSVR",
  "HP Reverb", "Pico Interactive", "Varjo", "DPVR", "Lenovo Mirage", "Google Cardboard", "Samsung Gear VR",
  "Microsoft HoloLens", "Apple Vision Pro", "Unreal Engine", "Unity Technologies", "Epic Games Store",
  "Steam", "GOG", "Humble Bundle", "Green Man Gaming", "Fanatical", "Itch.io", "GameJolt", "Kongregate",
  "Armor Games", "Newgrounds", "Addicting Games", "Miniclip", "Poki", "CrazyGames", "Y8", "A10", "Friv"
];

const ROLES_LIST = [
  "Software Engineer", "Full Stack Developer", "Java Developer", "React Developer",
  "Data Analyst", "Business Analyst", "HR Executive", "Marketing Executive",
  "Customer Support", "Sales Executive"
];

const TEST_TYPES_LIST = [
  "Aptitude",
  "Cognitive Ability",
  "Logical Reasoning",
  "Quantitative Aptitude",
  "Verbal Ability",
  "Communication Skills",
  "Technical MCQ",
  "Programming MCQ",
  "HR Questions",
  "Group Discussion",
  "Behavioral Assessment"
];

const CandidateMockInterview = () => {
  const location = useLocation();

  // Mode Selection: "live" (Live Q&A Simulator) or "mcq" (Corporate MCQ Test Engine)
  const [activeMode, setActiveMode] = useState("mcq");

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Searchable Company Dropdown states
  const [companySearch, setCompanySearch] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");

  // Select input states
  const [selectedRole, setSelectedRole] = useState(ROLES_LIST[0]);
  const [selectedTestType, setSelectedTestType] = useState(TEST_TYPES_LIST[0]);

  // MCQ Exam Engine states
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [mcqAnswers, setMcqAnswers] = useState({}); // { questionId: option }
  const [mcqMarked, setMcqMarked] = useState(new Set()); // Marked for review
  const [currentIdx, setCurrentIdx] = useState(0);
  const [examInProgress, setExamInProgress] = useState(false);
  const [examTimer, setExamTimer] = useState(1800); // 30 mins limit
  const [loadingAction, setLoadingAction] = useState(false);

  // MCQ Evaluation Results
  const [mcqResult, setMcqResult] = useState(null);

  // Live Q&A states
  const [liveJobRole, setLiveJobRole] = useState("");
  const [liveQuestions, setLiveQuestions] = useState([]);
  const [liveAnswers, setLiveAnswers] = useState({});
  const [liveCurrentIdx, setLiveCurrentIdx] = useState(0);
  const [liveInProgress, setLiveInProgress] = useState(false);
  const [liveResult, setLiveResult] = useState(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await API.get("/interview/history");
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assessment history");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [location.pathname, location.key]);

  // Timer logic for MCQ exam
  useEffect(() => {
    let timerId;
    if (examInProgress && examTimer > 0) {
      timerId = setInterval(() => {
        setExamTimer((prev) => prev - 1);
      }, 1000);
    } else if (examInProgress && examTimer === 0) {
      toast.error("Time's up! Submitting your answers automatically.");
      handleSubmitMcq();
    }
    return () => clearInterval(timerId);
  }, [examInProgress, examTimer]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // STEP 4: Start MCQ assessment
  const handleStartMcq = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return toast.error("Please select a target Company");

    setLoadingAction(true);
    try {
      const res = await API.post("/interview/mcq/generate", {
        company: selectedCompany,
        role: selectedRole,
        testType: selectedTestType,
      });

      if (res.data.success) {
        setMcqQuestions(res.data.data);
        setMcqAnswers({});
        setMcqMarked(new Set());
        setCurrentIdx(0);
        setMcqResult(null);
        setExamTimer(1800); // Reset timer to 30 mins
        setExamInProgress(true);
        toast.success("MCQ Assessment generated! The timer is running.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate corporate test questions");
    } finally {
      setLoadingAction(false);
    }
  };

  // Select Option Handler
  const selectOption = (qId, option) => {
    setMcqAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  // Toggle Marked for review
  const toggleMarkReview = (qId) => {
    const nextSet = new Set(mcqMarked);
    if (nextSet.has(qId)) {
      nextSet.delete(qId);
    } else {
      nextSet.add(qId);
    }
    setMcqMarked(nextSet);
  };

  // STEP 5: Evaluate MCQ
  async function handleSubmitMcq() {
    setLoadingAction(true);
    const elapsedSeconds = 1800 - examTimer;
    try {
      const res = await API.post("/interview/mcq/evaluate", {
        company: selectedCompany,
        role: selectedRole,
        testType: selectedTestType,
        questions: mcqQuestions,
        answers: mcqAnswers,
        elapsedSeconds,
      });

      if (res.data.success) {
        const evalData = res.data.data;
        setMcqResult(evalData);
        setExamInProgress(false);

        // STEP 6: Save MCQs attempt to DB
        await API.post("/interview/mcq/save", {
          company: selectedCompany,
          role: selectedRole,
          testType: selectedTestType,
          questions: mcqQuestions,
          answers: mcqAnswers,
          correct: evalData.correct,
          wrong: evalData.wrong,
          unanswered: evalData.unanswered,
          scorePercentage: evalData.scorePercentage,
          percentileEstimate: evalData.percentileEstimate,
          difficultyLevel: evalData.difficultyLevel,
          strengths: evalData.strengths,
          weaknesses: evalData.weaknesses,
          improvementAreas: evalData.improvementAreas,
          recommendedTopics: evalData.recommendedTopics,
          recommendedCertifications: evalData.recommendedCertifications,
          recommendedLearningResources: evalData.recommendedLearningResources,
          detailedFeedback: evalData.detailedFeedback,
          timeTaken: evalData.timeTaken,
          accuracy: evalData.accuracy,
        });

        toast.success("Test evaluation saved successfully!");
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to evaluate test answers");
    } finally {
      setLoadingAction(false);
    }
  };

  // Live Q&A Handlers
  const handleStartLive = async (e) => {
    e.preventDefault();
    if (!liveJobRole.trim()) return toast.error("Please specify a target Job Role");

    setLoadingAction(true);
    try {
      const res = await API.post("/interview/start", { jobRole: liveJobRole });
      if (res.data.success) {
        setLiveQuestions(res.data.data);
        setLiveAnswers({});
        setLiveCurrentIdx(0);
        setLiveResult(null);
        setLiveInProgress(true);
        toast.success("Live Mock Q&A Interview Started!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate live interview questions");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLiveAnswerChange = (text) => {
    const currentQ = liveQuestions[liveCurrentIdx];
    setLiveAnswers((prev) => ({ ...prev, [currentQ.id]: text }));
  };

  const handleSubmitLive = async () => {
    const currentQ = liveQuestions[liveCurrentIdx];
    if (!liveAnswers[currentQ.id] || !liveAnswers[currentQ.id].trim()) {
      return toast.error("Please provide a response before submitting.");
    }

    setLoadingAction(true);
    try {
      const qaPairs = liveQuestions.map((q) => ({
        question: q.question,
        answer: liveAnswers[q.id] || "",
      }));

      const evalRes = await API.post("/interview/evaluate", { jobRole: liveJobRole, qaPairs });
      if (evalRes.data.success) {
        const evalData = evalRes.data.data;
        setLiveResult(evalData);
        setLiveInProgress(false);

        await API.post("/interview/save", {
          jobRole: liveJobRole,
          questions: liveQuestions,
          answers: liveAnswers,
          communicationScore: evalData.communicationScore,
          technicalScore: evalData.technicalScore,
          confidenceScore: evalData.confidenceScore,
          overallRating: evalData.overallRating,
          recommendation: evalData.recommendation,
        });

        toast.success("Live Interview Session Evaluated and Logged!");
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      toast.error("Evaluation failed. Try again.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Helper score colors
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  // Export Assessment PDF Report (Mock or MCQ)
  const triggerDownloadReport = (session) => {
    const doc = new jsPDF();
    const isMCQ = session.jobRole.startsWith("[MCQ]");

    // Header Banner
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 45, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("HireMind AI Portal", 20, 26);
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(
      isMCQ
        ? "AI CORPORATE MULTIPLE CHOICE ASSESSMENT REPORT"
        : "AI LIVE MOCK QUESTIONS SIMULATOR REPORT",
      20,
      36
    );

    // Profile Details
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text(`Candidate ID: ${session.candidateId}`, 20, 58);
    doc.text(
      isMCQ
        ? `Assessment Parameters: ${session.jobRole.replace("[MCQ] ", "")}`
        : `Job Role Evaluated: ${session.jobRole}`,
      20,
      64
    );
    doc.text(`Date of Assessment: ${new Date(session.createdAt).toLocaleDateString()}`, 20, 70);

    if (isMCQ) {
      // MCQ detailed structure
      doc.setFillColor(241, 245, 249);
      doc.rect(20, 78, 170, 25, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text("CORRECT RESPONSES", 25, 86);
      doc.text("WRONG RESPONSES", 82, 86);
      doc.text("UNANSWERED ITEMS", 137, 86);
      doc.setFontSize(12);
      doc.text(`${session.technicalScore} / 50`, 25, 96);
      doc.text(`${session.communicationScore} / 50`, 82, 96);
      doc.text(`${session.confidenceScore} / 50`, 137, 96);

      // Feedback Details
      let metadata;
      try {
        metadata = typeof session.recommendation === "string" ? JSON.parse(session.recommendation) : session.recommendation;
      } catch {
        metadata = { detailedFeedback: session.recommendation };
      }

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Overall Score Level: ${session.overallRating}`, 20, 115);
      doc.text(`Estimated Performance Percentile: ${metadata.percentileEstimate || "75th"}`, 20, 122);
      doc.text(`Test Difficulty Level: ${metadata.difficultyLevel || "Medium"}`, 20, 129);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      const feedbackLines = doc.splitTextToSize(`Expert AI Advice:\n${metadata.detailedFeedback || ""}`, 170);
      doc.text(feedbackLines, 20, 138);

      // Section Strengths / Weaknesses
      doc.setFont("Helvetica", "bold");
      doc.text("Competency Highlights:", 20, 175);
      doc.setFont("Helvetica", "normal");
      doc.text(`Strengths: ${(metadata.strengths || []).join(", ")}`, 20, 183);
      doc.text(`Weaknesses: ${(metadata.weaknesses || []).join(", ")}`, 20, 190);
      doc.text(`Improvement Targets: ${(metadata.improvementAreas || []).join(", ")}`, 20, 197);

      // Suggested Certifications
      doc.setFont("Helvetica", "bold");
      doc.text("Learning & Roadmap Recommendations:", 20, 212);
      doc.setFont("Helvetica", "normal");
      doc.text(`Recommended Topics: ${(metadata.recommendedTopics || []).slice(0, 4).join(", ")}`, 20, 220);
      doc.text(`Target Certifications: ${(metadata.recommendedCertifications || []).slice(0, 3).join(", ")}`, 20, 227);
      doc.text(`Study Resources: ${(metadata.recommendedLearningResources || []).slice(0, 3).join(", ")}`, 20, 234);

    } else {
      // Live QA Table Summary
      doc.setFillColor(241, 245, 249);
      doc.rect(20, 78, 170, 25, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text("COMMUNICATION SCORE", 25, 86);
      doc.text("TECHNICAL SCORE", 82, 86);
      doc.text("CONFIDENCE SCORE", 137, 86);
      doc.setFontSize(12);
      doc.text(`${session.communicationScore}/100`, 25, 96);
      doc.text(`${session.technicalScore}/100`, 82, 96);
      doc.text(`${session.confidenceScore}/100`, 137, 96);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Overall Rating: ${session.overallRating}`, 20, 115);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      const recLines = doc.splitTextToSize(`Expert Recommendation:\n${session.recommendation}`, 170);
      doc.text(recLines, 20, 122);
    }

    // Question Summary Page Break
    doc.addPage();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 20, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("EXAM CONTENT SUMMARY & REVIEW", 20, 14);

    let y = 35;
    const qList = typeof session.questions === "string" ? JSON.parse(session.questions) : session.questions;
    const aList = typeof session.answers === "string" ? JSON.parse(session.answers) : session.answers;

    qList.forEach((q, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 25;
      }

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      
      const qText = doc.splitTextToSize(`Q${idx + 1}: ${q.question} [Section: ${q.section || "General"}]`, 170);
      doc.text(qText, 20, y);
      y += qText.length * 4.5;

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      
      if (isMCQ) {
        const optionKeys = ["A", "B", "C", "D"];
        optionKeys.forEach((optKey) => {
          const optText = q.options ? q.options[optKey] : "";
          doc.text(`   ${optKey}) ${optText}`, 20, y);
          y += 4;
        });

        const candSelection = aList[q.id] || "No selection";
        const isCorrect = candSelection.toUpperCase() === q.correctAnswer.toUpperCase();
        
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(isCorrect ? 34 : 220, isCorrect ? 197 : 38, isCorrect ? 94 : 38);
        doc.text(`Selected Answer: ${candSelection} | Correct Answer: ${q.correctAnswer}`, 20, y + 1);
        y += 7;
      } else {
        const answerText = aList[q.id] || "No response submitted.";
        const wrappedAns = doc.splitTextToSize(`Answer Response: ${answerText}`, 160);
        doc.text(wrappedAns, 25, y);
        y += wrappedAns.length * 4.5 + 4;
      }
    });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Generated by HireMind AI Examination Platform", 20, 287);

    doc.save(`${session.jobRole.replace(/[^a-zA-Z0-9]/g, "_")}_Report.pdf`);
    toast.success("PDF Scorecard Downloaded!");
  };

  const filteredCompanies = COMPANIES_LIST.filter((comp) =>
    comp.toLowerCase().includes(companySearch.toLowerCase())
  );

  return (
    <div className="p-10 max-w-7xl mx-auto text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            AI Assessment & Mock Center
          </h1>
          <p className="text-slate-400 mt-1">
            Simulate MCQ examinations for specific companies or undergo live interview simulators.
          </p>
        </div>

        {/* Global tab selector */}
        {!examInProgress && !liveInProgress && (
          <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 gap-1 text-xs">
            <button
              onClick={() => setActiveMode("mcq")}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                activeMode === "mcq" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🏢 Corporate MCQ Engine
            </button>
            <button
              onClick={() => setActiveMode("live")}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                activeMode === "live" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🎙️ Live Q&A Simulator
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Work area */}
        <div className="lg:col-span-3 space-y-8">
          {/* TAB 1: MCQ Assessment Engine */}
          {activeMode === "mcq" && (
            <>
              {/* Setup Configuration */}
              {!examInProgress && !mcqResult && (
                <form onSubmit={handleStartMcq} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6">
                  <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
                    📋 Set Up Corporate MCQ Test
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Searchable Company Dropdown */}
                    <div className="relative">
                      <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">Select Target Company</label>
                      <input
                        type="text"
                        placeholder="Search 300+ companies (e.g. Amazon, TCS)..."
                        value={selectedCompany || companySearch}
                        onChange={(e) => {
                          setCompanySearch(e.target.value);
                          setSelectedCompany("");
                          setShowCompanyDropdown(true);
                        }}
                        onFocus={() => setShowCompanyDropdown(true)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-blue-500 shadow-inner"
                        required
                      />
                      {showCompanyDropdown && filteredCompanies.length > 0 && (
                        <ul className="absolute z-20 w-full mt-2 bg-slate-900 border border-slate-750 rounded-xl max-h-56 overflow-y-auto divide-y divide-slate-800 shadow-2xl">
                          {filteredCompanies.map((c) => (
                            <li
                              key={c}
                              onClick={() => {
                                setSelectedCompany(c);
                                setCompanySearch(c);
                                setShowCompanyDropdown(false);
                              }}
                              className="p-3 text-sm hover:bg-blue-600 hover:text-white cursor-pointer transition-colors"
                            >
                              🏢 {c}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Role dropdown */}
                    <div>
                      <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">Target Job Role</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      >
                        {ROLES_LIST.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    {/* Test Type dropdown */}
                    <div className="md:col-span-2">
                      <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">Assessment Focus Area</label>
                      <select
                        value={selectedTestType}
                        onChange={(e) => setSelectedTestType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      >
                        {TEST_TYPES_LIST.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl disabled:opacity-50 transition-all active:scale-95 text-sm shadow-lg shadow-blue-500/20"
                  >
                    {loadingAction ? "Generating Corporate Paper..." : "⚡ Launch Exam Session (50 questions)"}
                  </button>
                </form>
              )}

              {/* Running MCQ Exam Module */}
              {examInProgress && mcqQuestions.length > 0 && (
                <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6">
                  {/* Status header */}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-blue-400 bg-slate-900/60 px-3 py-1 rounded-lg">
                        Q. {currentIdx + 1} / {mcqQuestions.length}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        📁 Section: {mcqQuestions[currentIdx].section}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Timer Display */}
                      <span className="text-sm font-mono font-extrabold bg-red-950/40 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg">
                        ⏰ Time Left: {formatTime(examTimer)}
                      </span>
                      {/* Mark for review */}
                      <button
                        onClick={() => toggleMarkReview(mcqQuestions[currentIdx].id)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all ${
                          mcqMarked.has(mcqQuestions[currentIdx].id)
                            ? "bg-yellow-600/20 text-yellow-400 border-yellow-500/30"
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        ⭐️ {mcqMarked.has(mcqQuestions[currentIdx].id) ? "Marked" : "Mark Review"}
                      </button>
                    </div>
                  </div>

                  {/* Question Title */}
                  <div className="py-4">
                    <h3 className="text-lg font-bold text-slate-100 leading-relaxed">
                      {mcqQuestions[currentIdx].question}
                    </h3>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 gap-4">
                    {["A", "B", "C", "D"].map((optKey) => {
                      const optionText = mcqQuestions[currentIdx].options?.[optKey] || "";
                      const isSelected = mcqAnswers[mcqQuestions[currentIdx].id] === optKey;

                      return (
                        <div
                          key={optKey}
                          onClick={() => selectOption(mcqQuestions[currentIdx].id, optKey)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                            isSelected
                              ? "bg-blue-600/20 border-blue-500 text-blue-300 font-semibold"
                              : "bg-slate-900 border-slate-750 hover:border-slate-600 text-slate-300"
                          }`}
                        >
                          <span className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ${
                            isSelected ? "bg-blue-500 border-blue-400 text-white" : "border-slate-700 bg-slate-800 text-slate-400"
                          }`}>
                            {optKey}
                          </span>
                          <span className="text-sm">{optionText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Side Exam Grid Navigation and Actions */}
                  <div className="flex flex-wrap gap-1.5 p-4 bg-slate-900/60 border border-slate-750 rounded-xl justify-center max-h-[140px] overflow-y-auto">
                    {mcqQuestions.map((q, idx) => {
                      const isAnswered = !!mcqAnswers[q.id];
                      const isMarked = mcqMarked.has(q.id);
                      const isCurrent = idx === currentIdx;

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIdx(idx)}
                          className={`w-8 h-8 rounded text-xs font-bold transition-all ${
                            isCurrent ? "ring-2 ring-blue-500 bg-slate-800 text-white font-black" :
                            isMarked ? "bg-yellow-600/30 text-yellow-400 border border-yellow-500/30" :
                            isAnswered ? "bg-green-600/20 text-green-400 border border-green-500/20" :
                            "bg-slate-800/60 text-slate-500 hover:text-slate-300"
                          }`}
                          title={`Go to Question ${idx + 1}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                    <button
                      onClick={() => currentIdx > 0 && setCurrentIdx((p) => p - 1)}
                      disabled={currentIdx === 0}
                      className="bg-slate-700 hover:bg-slate-600 disabled:opacity-30 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
                    >
                      ◀ Previous
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to finish the exam and view scoring results?")) {
                          handleSubmitMcq();
                        }
                      }}
                      className="bg-red-600 hover:bg-red-500 px-6 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95"
                    >
                      Finish Test 🏁
                    </button>

                    <button
                      onClick={() => currentIdx < mcqQuestions.length - 1 && setCurrentIdx((p) => p + 1)}
                      disabled={currentIdx === mcqQuestions.length - 1}
                      className="bg-slate-700 hover:bg-slate-600 disabled:opacity-30 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
                    >
                      Next ▶
                    </button>
                  </div>
                </div>
              )}

              {/* MCQ Evaluation Detailed Result Panel */}
              {mcqResult && (
                <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl space-y-8 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100">MCQ Score Dashboard</h2>
                      <p className="text-slate-400 text-xs mt-1">Company: {selectedCompany} | Role: {selectedRole}</p>
                    </div>
                    <button
                      onClick={() => {
                        setMcqResult(null);
                        setSelectedCompany("");
                        setCompanySearch("");
                      }}
                      className="text-xs text-blue-400 hover:underline font-bold"
                    >
                      Start New Practice Test
                    </button>
                  </div>

                  {/* Summary Dials Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Score</span>
                      <strong className="text-2xl text-blue-400">{mcqResult.correct} / {mcqResult.total}</strong>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Accuracy</span>
                      <strong className="text-2xl text-green-400">{mcqResult.accuracy}%</strong>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Time Taken</span>
                      <strong className="text-2xl text-amber-400">{mcqResult.timeTaken}</strong>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Percentile</span>
                      <strong className="text-2xl text-purple-400">{mcqResult.percentileEstimate}</strong>
                    </div>
                  </div>

                  {/* Highlights section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-700/60">
                    <div className="space-y-2">
                      <h4 className="font-bold text-green-400 text-sm">💡 Competency Strengths</h4>
                      <ul className="list-disc ml-5 text-slate-300 text-xs space-y-1">
                        {mcqResult.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-red-400 text-sm">⚠️ Focus Deficits</h4>
                      <ul className="list-disc ml-5 text-slate-300 text-xs space-y-1">
                        {mcqResult.weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
                      </ul>
                    </div>

                    <div className="md:col-span-2 space-y-2 pt-4 border-t border-slate-800">
                      <h4 className="font-bold text-indigo-400 text-sm">🧠 Detailed AI Performance Review</h4>
                      <p className="text-slate-300 text-xs leading-relaxed leading-relaxed">{mcqResult.detailedFeedback}</p>
                    </div>
                  </div>

                  {/* Section Recommendations */}
                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/60 space-y-4">
                    <h3 className="text-base font-bold text-slate-200">Recommended Next Steps & Learning Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 uppercase tracking-wide block font-bold text-[9px]">Target Topics</span>
                        <p className="text-slate-300">{(mcqResult.recommendedTopics || []).join(", ")}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 uppercase tracking-wide block font-bold text-[9px]">Certifications</span>
                        <p className="text-slate-300">{(mcqResult.recommendedCertifications || []).join(", ")}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 uppercase tracking-wide block font-bold text-[9px]">Learning Links</span>
                        <p className="text-slate-300">{(mcqResult.recommendedLearningResources || []).join(", ")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: Live Q&A Simulator */}
          {activeMode === "live" && (
            <>
              {/* Setup Configuration */}
              {!liveInProgress && !liveResult && (
                <form onSubmit={handleStartLive} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6">
                  <h2 className="text-2xl font-bold text-slate-200">Start Live Interview Practice</h2>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Specify Target Job Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend React Engineer, Backend Developer"
                      value={liveJobRole}
                      onChange={(e) => setLiveJobRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500 shadow-inner"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="bg-blue-600 hover:bg-blue-700 font-bold px-8 py-3.5 rounded-xl disabled:opacity-50 transition-all active:scale-95 text-sm"
                  >
                    {loadingAction ? "Structuring Simulator..." : "🎙️ Start Practice Session"}
                  </button>
                </form>
              )}

              {/* Simulator Run */}
              {liveInProgress && liveQuestions.length > 0 && (
                <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                    <span className="text-sm font-bold text-blue-400">
                      Question {liveCurrentIdx + 1} of {liveQuestions.length}
                    </span>
                    <span className="bg-slate-700/60 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-slate-300">
                      {liveQuestions[liveCurrentIdx].type}
                    </span>
                  </div>

                  <div className="py-4">
                    <h3 className="text-xl font-bold text-slate-100 leading-relaxed">
                      {liveQuestions[liveCurrentIdx].question}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Provide Your Answer</label>
                    <textarea
                      rows="6"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500 shadow-inner"
                      placeholder="Input your technical response..."
                      value={liveAnswers[liveQuestions[liveCurrentIdx].id] || ""}
                      onChange={(e) => handleLiveAnswerChange(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => liveCurrentIdx > 0 && setLiveCurrentIdx((p) => p - 1)}
                      disabled={liveCurrentIdx === 0}
                      className="bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
                    >
                      ◀ Previous
                    </button>

                    {liveCurrentIdx < liveQuestions.length - 1 ? (
                      <button
                        onClick={() => {
                          if (!liveAnswers[liveQuestions[liveCurrentIdx].id]?.trim()) {
                            return toast.error("Write an answer before proceeding");
                          }
                          setLiveCurrentIdx((p) => p + 1);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all"
                      >
                        Next Question ▶
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitLive}
                        disabled={loadingAction}
                        className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md"
                      >
                        {loadingAction ? "Scoring..." : "Submit and Score 🚀"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Live Q&A Result */}
              {liveResult && (
                <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl space-y-8 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-100">Live Practice Scores</h2>
                    <button
                      onClick={() => {
                        setLiveResult(null);
                        setLiveJobRole("");
                      }}
                      className="text-xs text-blue-400 hover:underline font-bold"
                    >
                      New Live Session
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Communication", score: liveResult.communicationScore },
                      { label: "Technical", score: liveResult.technicalScore },
                      { label: "Confidence", score: liveResult.confidenceScore },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">{item.label}</span>
                        <span className={`text-2xl font-extrabold ${getScoreColor(item.score)}`}>{item.score}/100</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/60 space-y-4">
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">Overall Rating</span>
                      <p className="text-base font-bold text-blue-400">{liveResult.overallRating}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">AI Detailed Feedback</span>
                      <p className="text-sm text-slate-350 leading-relaxed whitespace-pre-line">{liveResult.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar History Panel */}
        <div className="lg:col-span-1 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl flex flex-col max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-bold text-slate-200 mb-4 pb-2 border-b border-slate-700 flex items-center gap-2">
            ⏳ Attempt Logs
          </h2>

          {loadingHistory ? (
            <div className="py-10 text-center animate-pulse text-slate-400 text-xs">Fetching logs...</div>
          ) : history.length === 0 ? (
            <p className="text-slate-500 text-xs py-10 text-center">No past practice logs found.</p>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {history.map((session) => {
                const isMCQ = session.jobRole.startsWith("[MCQ]");
                const displayTitle = isMCQ
                  ? session.jobRole.replace("[MCQ] Company: ", "").split(" | ")[0]
                  : session.jobRole;

                return (
                  <div
                    key={session.id}
                    className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer relative"
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className="text-xs font-bold text-slate-200 block truncate" title={displayTitle}>
                        {isMCQ ? `🏢 ${displayTitle}` : `🎙️ ${displayTitle}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">{new Date(session.createdAt).toLocaleDateString()}</p>
                    <div className="text-[10px] text-slate-400 flex justify-between items-center mt-2.5 pt-2 border-t border-slate-800/40">
                      <span>Rating: <strong className="text-blue-400">{session.overallRating.split(" | ")[0].replace("Score: ", "")}</strong></span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerDownloadReport(session);
                        }}
                        className="text-blue-400 hover:text-blue-300 font-bold"
                        title="Download report as PDF file"
                      >
                        📥 PDF
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details View Modal for past sessions */}
      {selectedSession && (() => {
        const isMCQ = selectedSession.jobRole.startsWith("[MCQ]");
        let mcqMeta = {};
        if (isMCQ) {
          try {
            mcqMeta = typeof selectedSession.recommendation === "string"
              ? JSON.parse(selectedSession.recommendation)
              : selectedSession.recommendation;
          } catch {
            mcqMeta = { detailedFeedback: selectedSession.recommendation };
          }
        }

        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[85vh]">
              <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950/40">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isMCQ ? "Corporate MCQ scorecard" : "Live Q&A scorecard"}
                  </h3>
                  <p className="text-xs text-blue-400 mt-1">
                    {selectedSession.jobRole} | Date: {new Date(selectedSession.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-xs font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-350">
                {isMCQ ? (
                  <>
                    {/* Score display */}
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Score</span>
                        <strong className="text-base text-blue-400">
                          {selectedSession.technicalScore} / {(typeof selectedSession.questions === "string" ? JSON.parse(selectedSession.questions) : selectedSession.questions).length}
                        </strong>
                      </div>
                      <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Accuracy</span>
                        <strong className="text-base text-green-400">
                          {mcqMeta.accuracy ? `${mcqMeta.accuracy}%` : "N/A"}
                        </strong>
                      </div>
                      <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Time Taken</span>
                        <strong className="text-base text-amber-400">
                          {mcqMeta.timeTaken || "N/A"}
                        </strong>
                      </div>
                      <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Percentile</span>
                        <strong className="text-base text-purple-400">
                          {mcqMeta.percentileEstimate || "N/A"}
                        </strong>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-850 space-y-3">
                      <p><strong>Difficulty Level:</strong> <span className="text-yellow-400 font-bold">{mcqMeta.difficultyLevel || "Medium"}</span></p>
                      <p><strong>Estimated Percentile:</strong> <span className="text-purple-400 font-bold">{mcqMeta.percentileEstimate || "75th"}</span></p>
                      <p><strong>AI feedback:</strong> {mcqMeta.detailedFeedback}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-850 space-y-1">
                        <strong className="text-xs text-green-400">Strengths</strong>
                        <ul className="list-disc ml-5 text-xs text-slate-400 space-y-0.5">
                          {mcqMeta.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                        </ul>
                      </div>
                      <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-850 space-y-1">
                        <strong className="text-xs text-red-400">Weaknesses</strong>
                        <ul className="list-disc ml-5 text-xs text-slate-400 space-y-0.5">
                          {mcqMeta.weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Comm.</span>
                        <strong className="text-base text-slate-200">{selectedSession.communicationScore}/100</strong>
                      </div>
                      <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Tech.</span>
                        <strong className="text-base text-slate-200">{selectedSession.technicalScore}/100</strong>
                      </div>
                      <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Conf.</span>
                        <strong className="text-base text-slate-200">{selectedSession.confidenceScore}/100</strong>
                      </div>
                    </div>

                    <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-850 space-y-3">
                      <p><strong>Overall Rating:</strong> <span className="text-blue-400 font-bold">{selectedSession.overallRating}</span></p>
                      <p><strong>AI Recommendation:</strong> {selectedSession.recommendation}</p>
                    </div>
                  </>
                )}

                {/* Q&A list for review */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h4 className="font-bold text-slate-200 pb-2 flex items-center gap-2">
                    📋 Question-by-Question Review
                  </h4>
                  {(typeof selectedSession.questions === "string" ? JSON.parse(selectedSession.questions) : selectedSession.questions).map((q, i) => {
                    const answersMap = typeof selectedSession.answers === "string"
                      ? JSON.parse(selectedSession.answers)
                      : selectedSession.answers;
                    const candAns = answersMap[q.id] || "";

                    if (isMCQ) {
                      const isCorrect = candAns.toUpperCase() === q.correctAnswer.toUpperCase();
                      return (
                        <div key={q.id} className="bg-slate-950/20 p-4 rounded-xl border border-slate-850 space-y-3">
                          <p className="font-bold text-xs text-slate-200">
                            Q{i + 1}: {q.question} <span className="text-slate-500 font-normal">({q.section})</span>
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pl-2">
                            {["A", "B", "C", "D"].map((key) => (
                              <p key={key} className={key === q.correctAnswer ? "text-green-400 font-bold" : ""}>
                                {key}) {q.options ? q.options[key] : ""}
                              </p>
                            ))}
                          </div>
                          <p className={`text-xs pl-2 pt-1 font-semibold border-t border-slate-850/40 ${
                            isCorrect ? "text-green-400" : "text-red-400"
                          }`}>
                            Your Choice: {candAns || "None"} | Correct Choice: {q.correctAnswer}
                          </p>
                        </div>
                      );
                    } else {
                      return (
                        <div key={q.id} className="bg-slate-950/20 p-4 rounded-xl border border-slate-850 space-y-2">
                          <p className="font-bold text-xs text-blue-300">Q{i + 1}: {q.question} ({q.type})</p>
                          <p className="text-xs text-slate-400 leading-relaxed italic">Answer: "{candAns || "No response"}"</p>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>

              <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-2">
                <button
                  onClick={() => triggerDownloadReport(selectedSession)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                >
                  Download PDF Report
                </button>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default CandidateMockInterview;
