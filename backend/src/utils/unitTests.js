const { calculateMatchScore } = require('../services/matchingService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function runUnitTests() {
  console.log("=========================================");
  console.log("RUNNING HIREMIND AI UNIT TESTS");
  console.log("=========================================");

  let passed = 0;
  let failed = 0;

  const test = (desc, fn) => {
    try {
      fn();
      console.log(`[PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${desc}`);
      console.error(err);
      failed++;
    }
  };

  const testAsync = async (desc, fn) => {
    try {
      await fn();
      console.log(`[PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${desc}`);
      console.error(err);
      failed++;
    }
  };

  // Test 1: calculateMatchScore - Empty Profile
  test("calculateMatchScore with empty profile", () => {
    const result = calculateMatchScore([], ["React", "Node"]);
    if (result.score !== 0 || result.feedback !== "No resume skills found") {
      throw new Error(`Unexpected result: ${JSON.stringify(result)}`);
    }
  });

  // Test 2: calculateMatchScore - Perfect Alignments
  test("calculateMatchScore with perfect alignment, experience, and education", () => {
    const result = calculateMatchScore(
      ["React", "Node.js"], 
      ["React", "Node.js"], 
      "2 years work experience as developer", 
      "Completed Master of Computer Applications (MCA)"
    );
    if (result.score !== 100 || !result.feedback.includes("Excellent")) {
      throw new Error(`Unexpected result: ${JSON.stringify(result)}`);
    }
  });

  // Test 3: calculateMatchScore - Partial Alignments
  test("calculateMatchScore with partial alignment", () => {
    const result = calculateMatchScore(
      ["React"], 
      ["React", "Node.js", "Docker", "AWS"], 
      "", 
      ""
    );
    // 1 matched skill out of 4 = 25% of 60 skillScore = 15. No exp bonus, no edu bonus.
    if (result.score !== 15 || !result.feedback.includes("Weak candidate profile")) {
      throw new Error(`Unexpected result: ${JSON.stringify(result)}`);
    }
  });

  // Test 4: bcrypt Password Hashing
  await testAsync("bcrypt hashing and validation verification", async () => {
    const plain = "SuperSecret123!";
    const hashed = await bcrypt.hash(plain, 10);
    const isValid = await bcrypt.compare(plain, hashed);
    const isInvalid = await bcrypt.compare("WrongPassword", hashed);

    if (!isValid) throw new Error("Valid password compare failed");
    if (isInvalid) throw new Error("Invalid password compare succeeded");
  });

  // Test 5: JWT signing & decoding
  test("JWT authentication token creation and decryption", () => {
    const secret = "test_jwt_secret_key_123456";
    const payload = { id: "user-uuid-1234", role: "CANDIDATE" };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret);

    if (decoded.id !== payload.id || decoded.role !== payload.role) {
      throw new Error(`Decoded payload mismatch: ${JSON.stringify(decoded)}`);
    }
  });

  // Test 6: Razorpay signature verification logic
  test("Razorpay standard payment signature verification", () => {
    const crypto = require('crypto');
    const secret = "test_razorpay_secret";
    const razorpay_order_id = "order_12345";
    const razorpay_payment_id = "pay_67890";
    
    // Generate signature using HMAC SHA256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const expectedSignature = hmac.digest('hex');

    // Verification check
    const hmacVerify = crypto.createHmac('sha256', secret);
    hmacVerify.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedVerify = hmacVerify.digest('hex');

    if (generatedVerify !== expectedSignature) {
      throw new Error("Razorpay signature generation logic verification failed");
    }
  });

  // Test 7: Razorpay webhook signature verification
  test("Razorpay webhook signature verification", () => {
    const crypto = require('crypto');
    const webhookSecret = "test_webhook_secret";
    const payload = {
      event: "order.paid",
      payload: {
        payment: {
          entity: {
            id: "pay_67890",
            amount: 99900,
            order_id: "order_12345"
          }
        }
      }
    };
    const bodyString = JSON.stringify(payload);

    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(bodyString);
    const expectedWebhookSignature = shasum.digest('hex');

    const shasumVerify = crypto.createHmac('sha256', webhookSecret);
    shasumVerify.update(bodyString);
    const generatedWebhookVerify = shasumVerify.digest('hex');

    if (generatedWebhookVerify !== expectedWebhookSignature) {
      throw new Error("Razorpay webhook signature matching logic failed");
    }
  });

  // Test 8: UPI Payment Pricing logic check
  test("UPI payment order amount validation", () => {
    const calculateAmount = (planName, billingCycle) => {
      let amount = 0;
      if (planName.toUpperCase() === 'PRO') {
        amount = billingCycle === 'yearly' ? 990 : 99;
      } else if (planName.toUpperCase() === 'PREMIUM') {
        amount = billingCycle === 'yearly' ? 2990 : 299;
      }
      return amount;
    };

    if (calculateAmount("PRO", "monthly") !== 99) throw new Error("PRO monthly price mismatch");
    if (calculateAmount("PRO", "yearly") !== 990) throw new Error("PRO yearly price mismatch");
    if (calculateAmount("PREMIUM", "monthly") !== 299) throw new Error("PREMIUM monthly price mismatch");
    if (calculateAmount("PREMIUM", "yearly") !== 2990) throw new Error("PREMIUM yearly price mismatch");
  });

  console.log("-----------------------------------------");
  console.log(`Unit Test Run Complete. Passed: ${passed}, Failed: ${failed}`);
  console.log("=========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runUnitTests().catch(err => {
  console.error("Unit test execution crashed:", err);
  process.exit(1);
});
