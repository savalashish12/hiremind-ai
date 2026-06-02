const axios = require("axios");
const cheerio = require("cheerio");
const Parser = require("rss-parser");
const cron = require("node-cron");
const prisma = require("../config/prisma");
const { GoogleGenAI } = require("@google/genai");

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const parser = new Parser();

// Gemini enhancement function
const enhanceJobWithAI = async (title, company, description) => {
  try {
    const prompt = `
You are an expert technical recruiting assistant. Analyze this external job post and extract metadata:
Job Title: ${title}
Company: ${company}
Job Description:
${description}

Generate a JSON object with:
1. summary (string, short 2-sentence summary)
2. requiredSkills (array of strings, key skills needed)
3. experienceLevel (string: "Entry", "Mid", "Senior", or "Lead")
4. category (string: "Frontend", "Backend", "Fullstack", "Mobile", "Data Science", "DevOps", "Management", "Design", "QA", "Sales", "Support", or "Other")

Return ONLY valid JSON.
`;
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed AI job enhancement, using local extraction:", error.message);
    // Simple local parsing fallback
    const skills = [];
    const lowerDesc = description.toLowerCase();
    const commonSkills = ["react", "node", "java", "python", "aws", "docker", "kubernetes", "sql", "javascript", "figma", "django", "spring"];
    commonSkills.forEach(s => {
      if (lowerDesc.includes(s)) skills.push(s.toUpperCase());
    });

    let exp = "Mid";
    if (lowerDesc.includes("senior") || lowerDesc.includes("lead")) exp = "Senior";
    else if (lowerDesc.includes("entry") || lowerDesc.includes("fresher") || lowerDesc.includes("junior")) exp = "Entry";

    let cat = "Other";
    if (lowerDesc.includes("front") || lowerDesc.includes("react")) cat = "Frontend";
    else if (lowerDesc.includes("back") || lowerDesc.includes("node") || lowerDesc.includes("django")) cat = "Backend";
    else if (lowerDesc.includes("full") || lowerDesc.includes("mern")) cat = "Fullstack";
    else if (lowerDesc.includes("devops") || lowerDesc.includes("cloud")) cat = "DevOps";
    else if (lowerDesc.includes("data") || lowerDesc.includes("pandas")) cat = "Data Science";

    return {
      summary: `${title} role at ${company}. Experience with required software stack and standard methodologies preferred.`,
      requiredSkills: skills.length > 0 ? skills : ["SOFTWARE"],
      experienceLevel: exp,
      category: cat
    };
  }
};

// 1. Fetch RemoteOK RSS
const fetchRemoteOK = async () => {
  console.log("Fetching RemoteOK RSS feed...");
  const jobs = [];
  try {
    const feed = await parser.parseURL("https://remoteok.com/remote-jobs.rss");
    for (const item of feed.items.slice(0, 10)) { // Limit to 10 for speed & API rate limits
      // RemoteOK titles are formatted as "Company: Title (Tags)"
      const titleParts = item.title ? item.title.split(":") : ["Remote Job"];
      const company = titleParts[0]?.trim() || "Remote Company";
      const title = titleParts[1]?.split("(")[0]?.trim() || "Software Engineer";

      jobs.push({
        title,
        company,
        location: "Remote",
        description: item.contentSnippet || item.content || "Remote Job Opening",
        skills: item.categories || ["REMOTE"],
        salary: "$70,000 - $110,000",
        applyUrl: item.link || "https://remoteok.com",
        source: "RemoteOK",
        sourceType: "RSS",
        postedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      });
    }
  } catch (error) {
    console.error("RemoteOK RSS fetch failed:", error.message);
  }
  return jobs;
};

// 2. Fetch Internshala Scraper (Work from home internships)
const fetchInternshala = async () => {
  console.log("Fetching Internshala listings...");
  const jobs = [];
  try {
    const res = await axios.get("https://internshala.com/internships/work-from-home-jobs/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    const $ = cheerio.load(res.data);
    
    $(".individual_internship").slice(0, 10).each((i, el) => {
      const title = $(el).find(".heading_4_5 a").text().trim();
      const company = $(el).find(".company_name a").text().trim();
      const location = "Work From Home";
      const applyPath = $(el).find(".heading_4_5 a").attr("href");
      const salary = $(el).find(".stipend_container_table_cell").text().trim() || "Unpaid/Stipend";
      
      if (title && company) {
        jobs.push({
          title,
          company,
          location,
          description: `Work from home opportunity for ${title} at ${company}. Stipend details: ${salary}. Apply directly on Internshala.`,
          skills: [title.split(" ")[0]],
          salary,
          applyUrl: `https://internshala.com${applyPath}`,
          source: "Internshala",
          sourceType: "WEB",
          postedDate: new Date(),
        });
      }
    });
  } catch (error) {
    console.error("Internshala fetch failed:", error.message);
  }
  return jobs;
};

// 3. Telegram public preview scraper
const fetchTelegramChannel = async (channelName) => {
  console.log(`Fetching Telegram channel preview for: ${channelName}...`);
  const jobs = [];
  try {
    const res = await axios.get(`https://t.me/s/${channelName}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    const $ = cheerio.load(res.data);

    $(".tgme_widget_message_text").slice(0, 10).each((i, el) => {
      const text = $(el).text();
      // Look for posts matching job profiles (must contain Title, Company, Apply link/url)
      const hasJobKeywords = text.toLowerCase().includes("job") || text.toLowerCase().includes("role") || text.toLowerCase().includes("hiring");
      const urls = text.match(/\bhttps?:\/\/\S+/gi);

      if (hasJobKeywords && urls && urls.length > 0) {
        // Parse basic lines
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        let title = "Software Engineer";
        let company = "Telegram Channel Source";
        let location = "Remote / India";
        let salary = "Best in Industry";

        lines.forEach(line => {
          const lower = line.toLowerCase();
          if (lower.startsWith("title:") || lower.startsWith("role:")) {
            title = line.split(":")[1]?.trim() || title;
          } else if (lower.startsWith("company:") || lower.startsWith("organization:")) {
            company = line.split(":")[1]?.trim() || company;
          } else if (lower.startsWith("location:")) {
            location = line.split(":")[1]?.trim() || location;
          } else if (lower.startsWith("salary:") || lower.startsWith("stipend:")) {
            salary = line.split(":")[1]?.trim() || salary;
          }
        });

        // Fallback title to first line if not explicitly parsed
        if (title === "Software Engineer" && lines[0] && lines[0].length < 60) {
          title = lines[0];
        }

        jobs.push({
          title,
          company,
          location,
          description: text,
          skills: ["TELEGRAM"],
          salary,
          applyUrl: urls[0],
          source: `Telegram: @${channelName}`,
          sourceType: "TELEGRAM",
          postedDate: new Date(),
        });
      }
    });
  } catch (error) {
    console.error(`Telegram fetch for channel ${channelName} failed:`, error.message);
  }
  return jobs;
};

// Main Runner
const runAggregation = async () => {
  console.log("-----------------------------------------");
  console.log("LAUNCHING JOB AGGREGATION LOOP PROCESS...");
  console.log("-----------------------------------------");
  
  try {
    const rawJobs = [];
    
    // Scrape channels
    const remoteOkJobs = await fetchRemoteOK();
    rawJobs.push(...remoteOkJobs);
    
    const internshalaJobs = await fetchInternshala();
    rawJobs.push(...internshalaJobs);

    // Fetch configured Telegram channels (defaults)
    const configuredChannels = ["react_jobs", "jobspost"];
    for (const channel of configuredChannels) {
      const telegramJobs = await fetchTelegramChannel(channel);
      rawJobs.push(...telegramJobs);
    }

    console.log(`Total scraped candidates jobs count before deduplication: ${rawJobs.length}`);
    
    let addedCount = 0;
    for (const job of rawJobs) {
      // 1. Deduplicate check using applyUrl
      const exists = await prisma.externalJob.findFirst({
        where: { applyUrl: job.applyUrl }
      });
      
      if (!exists) {
        // 2. Gemini AI enhancement
        console.log(`Processing and enhancing: ${job.title} at ${job.company}`);
        const aiInfo = await enhanceJobWithAI(job.title, job.company, job.description);
        
        // 3. Save to database
        await prisma.externalJob.create({
          data: {
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            skills: aiInfo.requiredSkills || job.skills,
            salary: job.salary,
            applyUrl: job.applyUrl,
            source: job.source,
            sourceType: job.sourceType,
            postedDate: job.postedDate,
            summary: aiInfo.summary,
            requiredSkills: aiInfo.requiredSkills || job.skills,
            experienceLevel: aiInfo.experienceLevel,
            category: aiInfo.category,
          }
        });
        addedCount++;
      }
    }
    
    console.log(`SUCCESS: Job aggregation run complete. Added ${addedCount} new external jobs.`);
    
    // Log in database activity logs
    await prisma.activityLog.create({
      data: {
        action: "JOB_AGGREGATION_RUN",
        details: `Aggregation loop successfully processed. Deduplicated and added ${addedCount} external roles.`,
        userId: "SYSTEM"
      }
    });
    
  } catch (error) {
    console.error("Job aggregation loop process crashed:", error.message);
  }
};

// Scheduler config: Every 12 Hours
// "0 */12 * * *"
const startScheduler = () => {
  cron.schedule("0 */12 * * *", () => {
    runAggregation();
  });
  console.log("Aggregation Job Cron schedule registered (Runs every 12 hours)");
  
  // Trigger immediate run on server start
  setTimeout(runAggregation, 10000); // Wait 10s to not block server boot
};

module.exports = {
  startScheduler,
  runAggregation
};
