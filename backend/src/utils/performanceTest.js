const prisma = require('../config/prisma');
const { calculateMatchScore } = require('../services/matchingService');

async function runPerformanceTests() {
  console.log("=========================================");
  console.log("RUNNING HIREMIND AI PERFORMANCE TESTS");
  console.log("=========================================");

  // 1. Benchmark calculateMatchScore Algorithm Throughput
  console.log("Benchmarking candidate matching algorithm throughput (10,000 iterations)...");
  const matchStart = Date.now();
  const sampleCandidateSkills = ["React", "Node.js", "JavaScript", "HTML", "CSS", "Git", "SQL"];
  const sampleRequiredSkills = ["React", "Node.js", "Docker", "AWS", "Git", "REST APIs"];
  
  for (let i = 0; i < 10000; i++) {
    calculateMatchScore(
      sampleCandidateSkills,
      sampleRequiredSkills,
      "3 years of experience as a full stack dev",
      "MCA graduate"
    );
  }
  const matchDuration = Date.now() - matchStart;
  console.log(`Matching Throughput: Completed 10,000 matching evaluations in ${matchDuration}ms`);
  console.log(`Average processing time per evaluation: ${(matchDuration / 10000).toFixed(4)}ms`);

  // 2. Benchmark Single Database Query Speed
  console.log("\nMeasuring database query latency (finding sample jobs)...");
  const dbStart = Date.now();
  const jobsCount = await prisma.job.count();
  const sampleJobs = await prisma.job.findMany({ take: 10 });
  const dbDuration = Date.now() - dbStart;
  console.log(`Database Lookup: Found ${jobsCount} jobs, fetched 10 jobs in ${dbDuration}ms`);

  // 3. Benchmark Concurrency: Run 50 Database Operations in Parallel
  console.log("\nSimulating high-concurrency connections (50 parallel user queries)...");
  const concurrencyStart = Date.now();
  const queries = [];
  for (let i = 0; i < 50; i++) {
    queries.push(prisma.user.findFirst({ select: { id: true } }));
  }
  await Promise.all(queries);
  const concurrencyDuration = Date.now() - concurrencyStart;
  console.log(`Simulated Concurrency: Executed 50 parallel DB queries in ${concurrencyDuration}ms`);
  console.log(`Average connection + query latency: ${(concurrencyDuration / 50).toFixed(2)}ms`);

  console.log("-----------------------------------------");
  console.log("Performance testing checks completed.");
  console.log("=========================================");

  await prisma.$disconnect();
  process.exit(0);
}

runPerformanceTests().catch(err => {
  console.error("Performance tests failed:", err);
  process.exit(1);
});
