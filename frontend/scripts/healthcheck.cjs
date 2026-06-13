/**
 * Groq API Health Check
 * Run with: npm run health:check
 */

const fs = require("node:fs");
const path = require("node:path");

const GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models";
const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 15000;
const PLACEHOLDER_KEYS = new Set([
  "",
  "paste_your_groq_api_key_here",
  "your_api_key_here",
]);
const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "openai/gpt-oss-120b",
];

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function pass(message) {
  console.log(`  ${colors.green}[ok]${colors.reset} ${message}`);
}

function fail(message) {
  console.log(`  ${colors.red}[x]${colors.reset} ${message}`);
}

function warn(message) {
  console.log(`  ${colors.yellow}[!]${colors.reset} ${message}`);
}

function info(message) {
  console.log(`  ${colors.cyan}->${colors.reset} ${message}`);
}

function maskApiKey(apiKey) {
  if (apiKey.length <= 12) {
    return `${apiKey.slice(0, 4)}...`;
  }

  return `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`;
}

function readEnvApiKey() {
  const envPath = path.resolve(__dirname, "..", ".env");

  if (!fs.existsSync(envPath)) {
    return {
      apiKey: "",
      exists: false,
    };
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/^VITE_GROQ_API_KEY\s*=\s*(.+)$/m);
  const apiKey = match?.[1]?.trim().replace(/^["']|["']$/g, "") ?? "";

  return {
    apiKey,
    exists: true,
  };
}

async function fetchWithTimeout(url, options = {}) {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: abortController.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function checkGroqReachable() {
  const response = await fetchWithTimeout(GROQ_MODELS_URL, {
    method: "GET",
  });

  return response.status === 200 || response.status === 401;
}

async function testModel(apiKey, model) {
  try {
    const response = await fetchWithTimeout(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a health check. Reply with only OK.",
          },
          {
            role: "user",
            content: "Respond with only: OK",
          },
        ],
        temperature: 0,
        max_completion_tokens: 16,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim() ?? "";

      return {
        ok: true,
        reply: reply.slice(0, 40),
      };
    }

    const errorData = await response.json().catch(() => ({}));

    return {
      ok: false,
      status: response.status,
      error: errorData?.error?.message || response.statusText,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log(`\n${colors.bold}Groq API Health Check${colors.reset}\n`);

  let allPassed = true;
  let apiKey = "";

  console.log(`${colors.bold}[1/3] .env${colors.reset}`);
  const envResult = readEnvApiKey();

  if (!envResult.exists) {
    fail("File .env tidak ditemukan.");
    info("Buat .env di root project dengan VITE_GROQ_API_KEY=your_api_key_here");
    allPassed = false;
  } else if (PLACEHOLDER_KEYS.has(envResult.apiKey)) {
    fail("VITE_GROQ_API_KEY kosong atau masih placeholder.");
    info("Ganti nilainya dengan API key dari https://console.groq.com/keys");
    allPassed = false;
  } else {
    apiKey = envResult.apiKey;
    pass(`VITE_GROQ_API_KEY terdeteksi (${maskApiKey(apiKey)})`);

    if (!apiKey.startsWith("gsk_")) {
      warn("API key Groq biasanya diawali dengan gsk_. Pastikan key sudah benar.");
    }
  }

  console.log(`\n${colors.bold}[2/3] Groq API reachability${colors.reset}`);
  try {
    if (await checkGroqReachable()) {
      pass("Server Groq dapat dijangkau.");
    } else {
      fail("Server Groq merespons tidak normal.");
      allPassed = false;
    }
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
    allPassed = false;
  }

  console.log(`\n${colors.bold}[3/3] Model chat aktif${colors.reset}`);
  if (!apiKey) {
    warn("Tes model dilewati karena API key belum valid.");
    allPassed = false;
  } else {
    let workingModelCount = 0;

    for (const model of MODELS) {
      const result = await testModel(apiKey, model);

      if (result.ok) {
        workingModelCount += 1;
        pass(`${model} works. Reply: "${result.reply}"`);
      } else {
        const statusLabel = result.status ? `HTTP ${result.status}` : "request failed";

        fail(`${model} failed (${statusLabel}): ${result.error}`);
      }
    }

    if (workingModelCount === 0) {
      allPassed = false;
      info("Cek API key, quota, koneksi internet, atau status model di Groq Console.");
    }
  }

  console.log("");
  if (allPassed) {
    pass("Health check selesai.");
  } else {
    fail("Health check menemukan masalah.");
    process.exitCode = 1;
  }
}

void main();
