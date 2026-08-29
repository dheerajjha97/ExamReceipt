import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { fileData, mimeType, filename } = req.body || {};

    if (!fileData) {
      return res.status(400).json({ error: "fileData is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is missing on server. Please add GEMINI_API_KEY in your deployment environment settings.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Clean base64 string
    const base64Content = fileData.includes(",") ? fileData.split(",")[1] : fileData;

    // Normalize MIME type
    let effectiveMimeType = mimeType || "application/pdf";
    if (filename && filename.toLowerCase().endsWith(".pdf")) {
      effectiveMimeType = "application/pdf";
    } else if (mimeType && mimeType.toLowerCase().includes("pdf")) {
      effectiveMimeType = "application/pdf";
    }

    const prompt = `You are an expert OCR and document data extractor for Indian Intermediate and Matriculation board examination fee lists (such as Bihar Board, UP Board, CBSE, State Board examination registration/fee lists).
Analyze the provided document (PDF pages or image) and extract all student records into a structured JSON array.

Required fields for each student record:
- sNo: Serial number integer (e.g. 1, 2, 3)
- registrationNo: Registration number (e.g., "R-313370010-25" or whatever is in the table)
- studentName: Full name of student in uppercase (e.g. "ANU KUMARI")
- fatherName: Father's full name in uppercase (e.g. "DHARMENDRA SINGH")
- motherName: Mother's full name in uppercase (e.g. "PINKI DEVI")
- dob: Date of birth string if present (e.g. "12/05/2007") or empty string
- casteCategory: Caste Category strictly one of "General", "BC", "EBC", "SC", "ST"
- examType: Strictly one of "REGULAR", "EX-REGULAR", "IMPROVEMENT", "COMPARTMENTAL"
- feeAmount: Total fee numeric amount (e.g. 1430, 1130)

Also extract document header details if present:
- collegeName: Name of College/Institute or empty
- academicYear: Session/Year (e.g. "2024-2026" or "2026-2027")
- classOrStream: Stream or Class (e.g. "I.A. (ARTS)", "I.Sc. (SCIENCE)", "I.Com. (COMMERCE)", "Class 10")`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Content,
            mimeType: effectiveMimeType,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            collegeName: { type: Type.STRING },
            academicYear: { type: Type.STRING },
            classOrStream: { type: Type.STRING },
            students: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sNo: { type: Type.NUMBER },
                  registrationNo: { type: Type.STRING },
                  studentName: { type: Type.STRING },
                  fatherName: { type: Type.STRING },
                  motherName: { type: Type.STRING },
                  dob: { type: Type.STRING },
                  casteCategory: { type: Type.STRING },
                  examType: { type: Type.STRING },
                  feeAmount: { type: Type.NUMBER },
                },
                required: ["studentName"],
              },
            },
          },
        },
      },
    });

    const resultText = response.text || "{}";
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(resultText);
    } catch (parseErr) {
      const cleaned = resultText.replace(/```json\n?|\n?```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.status(200).json({
      success: true,
      data: parsedData,
    });
  } catch (err: any) {
    console.error("Extraction failed:", err);
    return res.status(500).json({
      error: err.message || "Failed to extract student data from PDF/image.",
    });
  }
}
