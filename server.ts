import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

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

    if (!fileData || !mimeType) {
      return res.status(400).json({ error: "fileData and mimeType are required." });
    }

    // Clean base64 string
    const base64Content = fileData.includes(",") ? fileData.split(",")[1] : fileData;

    const ai = getGeminiAI();

    const prompt = `You are an expert OCR and document data extractor for Indian Intermediate and Matriculation board examination fee lists (such as Bihar Board, UP Board, CBSE, State Board examination registration/fee lists).

Examine this uploaded document/image carefully and extract ALL student records listed in the table.

Required fields for each student record:
- sNo: Serial number integer (e.g. 1, 2, 3)
- registrationNo: Registration number (e.g., "R-313370010-25")
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
      model: "gemini-3.7-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Content,
              mimeType: mimeType,
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
                required: ["studentName", "registrationNo", "feeAmount"],
              },
            },
          },
          required: ["students"],
        },
      },
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);

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
  const distPath = path.join(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(path.join(distPath, "index.html"));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
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
