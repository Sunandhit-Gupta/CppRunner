const fs = require("fs");
const { exec } = require("child_process");
const os = require("os");
const path = require("path");

// =======================================
// ✅ FILE-BASED C++ EXECUTION (ONLY METHOD)
// =======================================
const runCppFile = (code, inputFilePath) => {
  return new Promise((resolve) => {
    const jobId = Date.now();
    const tmpDir = os.tmpdir();

    const cppFile = path.join(tmpDir, `code_${jobId}.cpp`);
    const exeFile =
      process.platform === "win32"
        ? path.join(tmpDir, `code_${jobId}.exe`)
        : path.join(tmpDir, `code_${jobId}`);

    try {
      // ✅ Write C++ code to temp file
      fs.writeFileSync(cppFile, code);

      // ✅ Compile + Execute with file input redirection
      const command = `g++ "${cppFile}" -o "${exeFile}" && "${exeFile}" < "${inputFilePath}"`;

      exec(command, { timeout: 20000 }, (error, stdout, stderr) => {
        // ✅ Cleanup (VERY IMPORTANT)
        try {
          if (fs.existsSync(cppFile)) fs.unlinkSync(cppFile);
          if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile);
          if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        } catch {}

        // ✅ Handle errors
        if (error) {
          return resolve(stderr || error.message);
        }

        resolve(stdout || "");
      });

    } catch (err) {
      resolve("Server Error: " + err.message);
    }
  });
};

// =======================================
// ✅ EXPORT
// =======================================
module.exports = { runCppFile };