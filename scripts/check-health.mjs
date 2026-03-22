const rawBase = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const base = rawBase.replace(/\/$/, "");
const url = `${base}/health`;

async function run() {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    const contentType = res.headers.get("content-type") || "";
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Health check failed: ${res.status} ${res.statusText}. Body: ${body.slice(0, 200)}`);
    }

    if (!contentType.includes("application/json")) {
      const body = await res.text();
      throw new Error(`Expected JSON from ${url} but got ${contentType || "unknown"}. Body: ${body.slice(0, 200)}`);
    }

    const payload = await res.json();
    if (!payload || payload.ok !== true) {
      throw new Error(`Health payload invalid: ${JSON.stringify(payload)}`);
    }

    console.log(`HEALTH_OK ${url}`);
    console.log(JSON.stringify(payload));
  } catch (error) {
    console.error("HEALTH_FAILED", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

run();
