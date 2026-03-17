import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

export async function runCpp(code, input) {
  return new Promise((resolve) => {
    const fileName = `code_${Date.now()}`;
    const tempDir = os.tmpdir();

    const cppPath = path.join(tempDir, `${fileName}.cpp`);
    const exePath = path.join(
      tempDir,
      process.platform === "win32" ? `${fileName}.exe` : fileName
    );

    // Write code to file
    fs.writeFileSync(cppPath, code);

    // Step 1: Compile
    const compile = spawn("g++", [cppPath, "-o", exePath]);

    let compileError = "";

    compile.stderr.on("data", (data) => {
      compileError += data.toString();
    });

    compile.on("close", (code) => {
      if (code !== 0) {
        cleanup();
        return resolve(compileError);
      }

      // Step 2: Run
      const run = spawn(exePath);

      let output = "";
      let error = "";

      run.stdout.on("data", (data) => {
        output += data.toString();
      });

      run.stderr.on("data", (data) => {
        error += data.toString();
      });

      // Send input
      run.stdin.write(input);
      run.stdin.end();

      // Timeout (important)
      const timer = setTimeout(() => {
        run.kill();
        cleanup();
        resolve("Time Limit Exceeded");
      }, 30000);

      run.on("close", () => {
        clearTimeout(timer);
        cleanup();
        resolve(error || output);
      });
    });

    function cleanup() {
      try {
        if (fs.existsSync(cppPath)) fs.unlinkSync(cppPath);
        if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
      } catch {}
    }
  });
}