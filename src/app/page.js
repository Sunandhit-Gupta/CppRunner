"use client";

import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}`);
  const [input, setInput] = useState("5 7");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Run Code
  const runCode = async () => {
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, input }),
      });

      const data = await res.json();
      setOutput(data.output || data.error);
    } catch {
      setOutput("Error running code");
    }

    setLoading(false);
  };

  // ✅ File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      alert("Please upload a .txt file");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      setInput(event.target.result);
    };

    reader.readAsText(file);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white text-lg font-semibold flex justify-between items-center">
        <span>C++ Online Compiler</span>
        <button
          onClick={runCode}
          disabled={loading}
          className={`px-4 py-2 rounded ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-white text-blue-600 hover:bg-gray-200"
            }`}
        >
          {loading ? "Running..." : "Run Code"}
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">

        {/* LEFT: Code Editor */}
        <div className="flex-1 flex flex-col p-2">
          <div className="bg-white rounded shadow flex flex-col h-full">
            <div className="p-2 font-semibold border-b text-black">Code</div>
            <textarea
              className="flex-1 p-3 font-mono text-sm outline-none resize-none bg-white text-black"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT: Input + Output */}
        <div className="w-full md:w-[40%] flex flex-col p-2 gap-2">

          {/* Input */}
          <div className="bg-white rounded shadow flex flex-col h-[40%]">
            <div className="p-2 font-semibold border-b text-black flex justify-between items-center">
              <span>Input</span>

              {/* Upload Button */}
              <label className="text-sm bg-blue-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-blue-600">
                Upload .txt
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              className="flex-1 p-3 font-mono text-sm outline-none resize-none bg-white text-black"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          {/* Output */}
          <div className="bg-black text-green-400 rounded shadow flex flex-col h-[60%] relative">
            <div className="p-2 font-semibold border-b border-gray-700 text-white">
              Output
            </div>

            {/* Loader Overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white">Executing...</span>
                </div>
              </div>
            )}

            <pre className="flex-1 p-3 overflow-auto whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="text-center text-sm text-gray-600 py-2 bg-white border-t">
        Developed by <span className="font-semibold">Sunandhit Gupta</span>
      </div>
    </div>
  );
}