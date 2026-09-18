const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function test() {
  // Placeholder URL (standalone dev utility — replace with a real file URL to test).
  const url1 = "https://res.cloudinary.com/demo/image/upload/v1700000000/hiremind-resumes/sample_test.pdf";
  const url2 = url1.replace("/image/upload/", "/raw/upload/");
  
  console.log("Original URL:", url1);
  console.log("Rewritten URL:", url2);
  
  try {
    console.log("Attempting to fetch original URL...");
    const res1 = await axios.get(url1, { responseType: 'arraybuffer' });
    console.log("Original URL success! Bytes fetched:", res1.data.length);
  } catch (err) {
    console.error("Original URL failed:", err.message);
  }
  
  try {
    console.log("Attempting to fetch rewritten URL...");
    const res2 = await axios.get(url2, { responseType: 'arraybuffer' });
    console.log("Rewritten URL success! Bytes fetched:", res2.data.length);
  } catch (err) {
    console.error("Rewritten URL failed:", err.message);
  }
}

test();
