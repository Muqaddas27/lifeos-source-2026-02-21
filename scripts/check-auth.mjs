const rawBase = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const base = rawBase.replace(/\/$/, "");

const email = process.env.CHECK_AUTH_EMAIL || `health_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
const password = process.env.CHECK_AUTH_PASSWORD || "Pass1234!";
const name = process.env.CHECK_AUTH_NAME || "Health Check User";

async function postJson(path, body) {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(`Expected JSON from ${url}, got ${contentType || "unknown"}. Body: ${text.slice(0, 200)}`);
  }

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(`${url} failed ${res.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function run() {
  try {
    const signup = await postJson("/auth/signup", { email, password, name });
    if (!signup?.token || !signup?.user?.id) {
      throw new Error(`Signup payload invalid: ${JSON.stringify(signup)}`);
    }

    const login = await postJson("/auth/login", { email, password });
    if (!login?.token || !login?.user?.id) {
      throw new Error(`Login payload invalid: ${JSON.stringify(login)}`);
    }

    console.log("AUTH_OK");
    console.log(JSON.stringify({
      apiBase: base,
      signupUserId: signup.user.id,
      loginUserId: login.user.id,
      email,
    }));
  } catch (error) {
    console.error("AUTH_FAILED", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

run();
