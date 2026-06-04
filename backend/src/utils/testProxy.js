const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function test() {
  const url1 = "https://res.cloudinary.com/dtewde9uz/image/upload/v1780469690/hiremind-resumes/1780469688920_xvsxi4.pdf";
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
