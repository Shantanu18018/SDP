global.DOMMatrix = class {};
global.ImageData = class {};

import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

async function test() {
  try {
    const pdfBuffer = fs.readFileSync('test.pdf');
    const data = await pdfParse(pdfBuffer);
    console.log("PDF Text length:", data.text.length);
  } catch (error) {
    console.error("Error parsing PDF:", error);
  }
}

test();
