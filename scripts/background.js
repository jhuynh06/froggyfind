const BACKEND_BASE = "https://research-rabbit-app-m37s3.ondigitalocean.app";
const RANK_URL = `${BACKEND_BASE}/rank-chunks`;
const QA_URL = `${BACKEND_BASE}/qa`;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "RR_RANK_CHUNKS") {
    rankChunks(message.payload)
      .then((body) => sendResponse({ ok: true, body }))
      .catch((error) =>
        sendResponse({ ok: false, error: error.message, status: error.status || 0 }),
      );
    return true;
  }

  if (message?.type === "RR_QA") {
    askQuestion(message.payload)
      .then((body) => sendResponse({ ok: true, body }))
      .catch((error) =>
        sendResponse({ ok: false, error: error.message, status: error.status || 0 }),
      );
    return true;
  }

  return false;
});

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const detail = body && typeof body.detail === "string" ? body.detail : "Backend request failed.";
    const err = new Error(detail);
    err.status = response.status;
    throw err;
  }
  return body;
}

function rankChunks(payload) {
  return postJson(RANK_URL, payload);
}

function askQuestion(payload) {
  return postJson(QA_URL, payload);
}
