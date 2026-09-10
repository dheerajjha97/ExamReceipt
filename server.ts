import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Set payload limit to handle base64 PDFs and images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini Client lazily or safely
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// PDF / Image Student Extraction API using Gemini 3.7 Flash
app.post("/api/extract-students", async (req, res) => {
  try {
    const { fileData, mimeType, filename } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: "fileData is required." });
    }

    // Clean base64 string
    const base64Content = fileData.includes(",") ? fileData.split(",")[1] : fileData;

    // Normalize MIME type
    let effectiveMimeType = mimeType || "application/pdf";
    if (filename && filename.toLowerCase().endsWith(".pdf")) {
      effectiveMimeType = "application/pdf";
    } else if (mimeType && mimeType.toLowerCase().includes("pdf")) {
      effectiveMimeType = "application/pdf";
    }

    const ai = getGeminiAI();

    const prompt = `You are an expert OCR and document data extractor for Indian Intermediate and Matriculation board examination fee lists (such as Bihar Board, UP Board, CBSE, State Board examination registration/fee lists).

Examine this uploaded document/image carefully and extract ALL student records listed in the table.

Required fields for each student record:
- sNo: Serial number integer (e.g. 1, 2, 3)
- registrationNo: Registration number (e.g., "R-313370010-25" or whatever is in the table)
- studentName: Full name of student in uppercase (e.g. "ANU KUMARI")
- fatherName: Father's full name in uppercase (e.g. "DHARMENDRA SINGH")
- motherName: Mother's full name in uppercase (e.g. "PINKI DEVI")
- dob: Date of birth (e.g. "12-10-2008" or "DD-MM-YYYY")
- casteCategory: Caste category (e.g., "General", "BC", "EBC", "SC", "ST")
- examType: Examination type (e.g., "REGULAR", "EX-REGULAR", "IMPROVEMENT")
- feeAmount: Base fee amount as a number (e.g., 1400, 1140). If missing, infer typical fee (1400 for General/BC, 1140 for SC/ST/EBC).

Also extract overall metadata if present:
- instituteName: School/College Name if mentioned at top
- classOrStream: Intermediate (11th/12th Science/Arts/Commerce) or Matric (10th) if indicated

Please return a clean JSON object containing the list of extracted students. Extract every single row in the document without omitting any student.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
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
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            instituteName: { type: Type.STRING, description: "School or College Name if detected" },
            classOrStream: { type: Type.STRING, description: "Class or Stream name" },
            students: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sNo: { type: Type.INTEGER },
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
          required: ["students"],
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

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Error in AI extraction:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to extract student data from file.",
    });
  }
});

// Intermediate Registration AI Extraction (Image, PDF, or Raw Text)
app.post("/api/extract-registration-students", async (req, res) => {
  try {
    const { fileData, mimeType, filename, rawText } = req.body;

    if (!fileData && !rawText) {
      return res.status(400).json({ error: "Either fileData or rawText is required." });
    }

    const ai = getGeminiAI();

    const systemPrompt = `You are an expert OCR & admission data parser for Intermediate Registration in Indian high schools and intermediate colleges (BSEB / State Board 11th & 12th Registration, OFSS Bihar, Science, Arts, Commerce).

Extract student registration records from the provided content (image/PDF or raw text list).

FEE CALCULATION RULES:
1. BSEB (Bihar School Examination Board): Base Fee = ₹485, Online/Service Charge = ₹30 => Total Registration Fee = ₹515.
2. OTHER BOARDS (CBSE, ICSE, NIOS, Delhi, UP Board, or any other non-BSEB board): Base Fee = ₹685, Online/Service Charge = ₹30 => Total Registration Fee = ₹715 (685+30).

Key columns to identify and extract:
- sNo: Serial integer
- ofssNo: OFSS Reference / Application / CAF Number (e.g., "26J54670842", "24J...", or reference number if found)
- formNo: Form number (e.g., "REG-2026-001" or as detected)
- studentName: Full name in UPPERCASE (NAME)
- fatherName: Father's name in UPPERCASE (FATHER NAME)
- motherName: Mother's name in UPPERCASE (MOTHER NAME, or empty string if not given)
- dob: Date of Birth in DD-MM-YYYY (DOB)
- boardName: 10th/Matric Board Name (e.g., "BSEB,Bihar", "CBSE,Delhi", "ICSE", "NIOS", or as given)
- baseFee: Base fee integer (485 for BSEB, 685 for Other Boards)
- serviceCharge: Service/Online fee integer (always 30)
- totalFee: Total fee (515 for BSEB, 715 for Other Boards)
- casteCategory: Caste Category ("General", "BC", "EBC", "SC", "ST")
- gender: "MALE", "FEMALE", or "OTHER"
- stream: "Science (I.Sc)", "Arts (I.A)", "Commerce (I.Com)", or "Vocational"
- mobile: 10-digit mobile number if present
- email: email if present
- aadharNo: 12-digit Aadhaar number if mentioned
- apaarId: 12-digit APAAR/EduID if mentioned
- matricRollCode: Matric Roll Code (5 digits)
- matricRollNo: Matric Roll Number (7 digits)
- matricPassingYear: e.g. "2024"
- prevSchoolName: Previous school name for TC if mentioned
- tcNo: Transfer Certificate number if mentioned
- casteCertNo: Caste certificate number if mentioned

Return a clean JSON object with instituteName, stream, and students list.`;

    let response;

    if (rawText) {
      // Text parsing mode
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            text: `${systemPrompt}\n\nHere is the raw text / CSV / list to parse:\n\n${rawText}`,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              instituteName: { type: Type.STRING },
              stream: { type: Type.STRING },
              students: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sNo: { type: Type.INTEGER },
                    ofssNo: { type: Type.STRING },
                    formNo: { type: Type.STRING },
                    studentName: { type: Type.STRING },
                    fatherName: { type: Type.STRING },
                    motherName: { type: Type.STRING },
                    dob: { type: Type.STRING },
                    boardName: { type: Type.STRING },
                    gender: { type: Type.STRING },
                    casteCategory: { type: Type.STRING },
                    stream: { type: Type.STRING },
                    mobile: { type: Type.STRING },
                    email: { type: Type.STRING },
                    aadharNo: { type: Type.STRING },
                    apaarId: { type: Type.STRING },
                    matricRollCode: { type: Type.STRING },
                    matricRollNo: { type: Type.STRING },
                    matricPassingYear: { type: Type.STRING },
                    prevSchoolName: { type: Type.STRING },
                    tcNo: { type: Type.STRING },
                    casteCertNo: { type: Type.STRING },
                  },
                  required: ["studentName"],
                },
              },
            },
            required: ["students"],
          },
        },
      });
    } else {
      // PDF or Image mode
      const base64Content = fileData.includes(",") ? fileData.split(",")[1] : fileData;
      let effectiveMimeType = mimeType || "application/pdf";
      if (filename && filename.toLowerCase().endsWith(".pdf")) {
        effectiveMimeType = "application/pdf";
      } else if (filename && (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg"))) {
        effectiveMimeType = "image/jpeg";
      } else if (filename && filename.toLowerCase().endsWith(".png")) {
        effectiveMimeType = "image/png";
      }

      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Content,
                mimeType: effectiveMimeType,
              },
            },
            {
              text: systemPrompt,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              instituteName: { type: Type.STRING },
              stream: { type: Type.STRING },
              students: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sNo: { type: Type.INTEGER },
                    ofssNo: { type: Type.STRING },
                    formNo: { type: Type.STRING },
                    studentName: { type: Type.STRING },
                    fatherName: { type: Type.STRING },
                    motherName: { type: Type.STRING },
                    dob: { type: Type.STRING },
                    boardName: { type: Type.STRING },
                    gender: { type: Type.STRING },
                    casteCategory: { type: Type.STRING },
                    stream: { type: Type.STRING },
                    mobile: { type: Type.STRING },
                    email: { type: Type.STRING },
                    aadharNo: { type: Type.STRING },
                    apaarId: { type: Type.STRING },
                    matricRollCode: { type: Type.STRING },
                    matricRollNo: { type: Type.STRING },
                    matricPassingYear: { type: Type.STRING },
                    prevSchoolName: { type: Type.STRING },
                    tcNo: { type: Type.STRING },
                    casteCertNo: { type: Type.STRING },
                  },
                  required: ["studentName"],
                },
              },
            },
            required: ["students"],
          },
        },
      });
    }

    const resultText = response.text || "{}";
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(resultText);
    } catch (parseErr) {
      const cleaned = resultText.replace(/```json\n?|\n?```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Error in Registration AI extraction:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to extract registration students.",
    });
  }
});

// GitHub Direct Commits / Database Sync API
app.post("/api/github/commit", async (req, res) => {
  try {
    const { token, owner, repo, branch = "main", filePath = "data/fee_database.json", content, commitMessage } = req.body;

    if (!token || !owner || !repo || !content) {
      return res.status(400).json({ error: "Missing token, owner, repo, or content." });
    }

    // 1. Get current file SHA if it exists
    const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    let sha: string | undefined = undefined;

    const getRes = await fetch(getFileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "FeeReceiptApp",
      },
    });

    if (getRes.ok) {
      const fileMetaData: any = await getRes.json();
      sha = fileMetaData.sha;
    }

    // 2. Base64 encode content
    const base64Content = Buffer.from(JSON.stringify(content, null, 2)).toString("base64");

    // 3. Put/Commit file
    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "FeeReceiptApp",
      },
      body: JSON.stringify({
        message: commitMessage || `Update fee records database [${new Date().toISOString()}]`,
        content: base64Content,
        branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!putRes.ok) {
      const errBody: any = await putRes.json();
      return res.status(putRes.status).json({
        error: errBody.message || "Failed to commit to GitHub repository.",
      });
    }

    const commitData: any = await putRes.json();
    res.json({
      success: true,
      commit: commitData.commit,
      contentUrl: commitData.content?.html_url,
    });
  } catch (error: any) {
    console.error("GitHub sync error:", error);
    res.status(500).json({ error: error.message || "Server error syncing with GitHub" });
  }
});

// GitHub Fetch File API
app.post("/api/github/fetch", async (req, res) => {
  try {
    const { token, owner, repo, branch = "main", filePath = "data/fee_database.json" } = req.body;

    if (!token || !owner || !repo) {
      return res.status(400).json({ error: "Missing token, owner, or repo." });
    }

    const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

    const getRes = await fetch(getFileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "FeeReceiptApp",
      },
    });

    if (!getRes.ok) {
      if (getRes.status === 404) {
        return res.status(404).json({ error: "Database file not found in GitHub repository." });
      }
      const errBody: any = await getRes.json();
      return res.status(getRes.status).json({ error: errBody.message || "Failed to fetch from GitHub." });
    }

    const fileMetaData: any = await getRes.json();
    const contentStr = Buffer.from(fileMetaData.content, "base64").toString("utf-8");
    const jsonContent = JSON.parse(contentStr);

    res.json({
      success: true,
      sha: fileMetaData.sha,
      data: jsonContent,
    });
  } catch (error: any) {
    console.error("GitHub fetch error:", error);
    res.status(500).json({ error: error.message || "Server error fetching from GitHub" });
  }
});

// Start Vite / Express
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    (process.argv[1] && process.argv[1].endsWith("server.cjs"));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Determine dist directory path (either project_root/dist or current dir if inside dist)
    const distPath = fs.existsSync(path.join(process.cwd(), "dist", "index.html"))
      ? path.join(process.cwd(), "dist")
      : __dirname;

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
