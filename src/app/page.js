"use client";

import Editor from "@monaco-editor/react";
import { Play, Terminal, Upload } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const defaultCode = `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}`;

  // 🔥 Load from localStorage
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCode = localStorage.getItem("code");
    const savedInput = localStorage.getItem("input");

    setCode(savedCode || defaultCode);
    setInput(savedInput || "5 7");
  }, []);

  // 💾 Auto-save
  useEffect(() => {
    localStorage.setItem("code", code);
  }, [code]);

  useEffect(() => {
    localStorage.setItem("input", input);
  }, [input]);

  // ⌨️ Keyboard Shortcut (Ctrl + Enter)
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const runCode = async () => {
    setLoading(true);
    setOutput("");

    try {
      const formData = new FormData();
      formData.append("code", code);

      if (file) formData.append("inputFile", file);
      else formData.append("input", input);

      const res = await fetch("/run", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setOutput(data.error || data.output);
    } catch {
      setOutput("Server error. Please try again.");
    }

    setLoading(false);
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith(".txt")) {
      alert("Upload a .txt file only");
      return;
    }

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => setInput(event.target.result);
    reader.readAsText(uploadedFile);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] text-gray-200">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700 bg-[#020617]">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">🚀 C++ Compiler</h1>
          <span className="text-xs text-gray-500">
            Supports large testcases • Ctrl + Enter to run
          </span>
        </div>

        <button
          onClick={runCode}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          <Play size={16} />
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">

        {/* MONACO EDITOR */}
        <div className="flex-1 flex flex-col border-r border-gray-700">
          <div className="px-4 py-2 text-sm bg-[#020617] border-b border-gray-700">
            📝 Code Editor
          </div>

          <Editor
            height="100%"
            defaultLanguage="cpp"
            value={code}
            theme="vs-dark"
            onChange={(value) => setCode(value || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[40%] flex flex-col">

          {/* INPUT PANEL */}
          <div className="h-[40%] flex flex-col border-b border-gray-700">

            <div className="flex justify-between items-center px-4 py-2 bg-[#020617] border-b border-gray-700">
              <span className="text-sm font-medium">📥 Testcase Input</span>

              <div className="flex gap-2 text-xs">

                <button
                  onClick={() => setInput("5 7")}
                  className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Sample
                </button>

                <button
                  onClick={() => {
                    setInput("");
                    setFile(null);
                  }}
                  className="px-2 py-1 bg-red-500 rounded hover:bg-red-600"
                >
                  Clear
                </button>

                <label className="flex items-center gap-1 bg-blue-500 px-2 py-1 rounded cursor-pointer hover:bg-blue-600">
                  <Upload size={14} />
                  Upload
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">

              {/* LINE NUMBERS */}
              <div className="bg-[#020617] text-gray-500 text-xs px-2 py-3 select-none">
                {input.split("\n").map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* TEXTAREA */}
              <textarea
                className="flex-1 p-3 font-mono text-sm bg-[#0f172a] outline-none resize-none text-gray-200"
                placeholder={`Example:
5 7

Input format:
a b`}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setFile(null);
                }}
              />
            </div>

            <div className="text-xs text-gray-500 px-3 py-1 bg-[#020617] border-t border-gray-700">
              💾 Auto-saved 🐱‍🏍Handles large inputs efficiently
            </div>
          </div>

          {/* OUTPUT PANEL */}
          <div className="flex-1 flex flex-col relative">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#020617] border-b border-gray-700">
              <Terminal size={16} />
              <span className="text-sm">Output</span>
            </div>

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full"></div>
              </div>
            )}

            <pre className="flex-1 p-4 overflow-auto text-green-400 font-mono text-sm">
              {output || "// Output will appear here"}
            </pre>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs text-gray-500 py-2 border-t border-gray-700 bg-[#020617]">
        Built by <span className="text-gray-300">Sunandhit Gupta</span>
      </div>
    </div>
  );
}