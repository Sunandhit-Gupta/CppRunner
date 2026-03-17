const express = require("express");
const next = require("next");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const os = require("os");

const { runCppFile } = require("./runner"); // ONLY this function needed

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// ✅ Multer setup (for file uploads)
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

app.prepare().then(() => {
  const server = express();

  // ✅ Allow JSON (for code + small input)
  server.use(express.json({ limit: "10mb" }));
  server.use(express.urlencoded({ limit: "10mb", extended: true }));

  // =========================================
  // ✅ MAIN RUN API (FILE-BASED ONLY)
  // =========================================
  server.post("/run", upload.single("inputFile"), async (req, res) => {
    try {
      const code = req.body.code;

      let inputFilePath;

      // 🔥 CASE 1: User uploaded file
      if (req.file) {
        inputFilePath = req.file.path;
      }
      // 🔥 CASE 2: Textarea input → convert to file
      else {
        const input = req.body.input || "";

        const tmpDir = os.tmpdir();
        const fileName = `input_${Date.now()}.txt`;
        inputFilePath = path.join(tmpDir, fileName);

        fs.writeFileSync(inputFilePath, input);
      }

      // ✅ Run C++ using file
      const output = await runCppFile(code, inputFilePath);

      return res.json({ output });

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Execution failed",
      });
    }
  });

  // =========================================
  // ✅ NEXT HANDLER (IMPORTANT FIX)
  // =========================================
  server.use((req, res) => {
    return handle(req, res);
  });

  // =========================================
  // ✅ START SERVER
  // =========================================
  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});