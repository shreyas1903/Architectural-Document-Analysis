const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyBRhxV7mO7DsMpUXNwj4Z7DCIomsQ3hWQU');

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    console.log('Gemini API working:', response.text());
  } catch (error) {
    console.error('Gemini API error:', error);
  }
}

test();