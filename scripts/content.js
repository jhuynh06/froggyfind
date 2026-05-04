/**
 * ResearchRabbit – Floating Action Button
 * Injects a persistent FAB into every page.
 * Clicking the main button toggles the Q&A and Search sub-buttons.
 */

(function () {
  "use strict";

  // Prevent double-injection (e.g. on SPA navigations)
  if (document.getElementById("rr-fab-container")) return;

  /* ── Build the container with Shadow DOM ── */
  const container = document.createElement("div");
  container.id = "rr-fab-container";

  // Create Shadow DOM to isolate styles
  const shadow = container.attachShadow({ mode: "open" });

  /* ── Inject CSS into Shadow DOM ── */
  const style = document.createElement("style");
  style.textContent = `
    /* ResearchRabbit Floating Button */
    :host {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    /* ── Shared button base ── */
    .rr-fab-btn {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(58, 80, 157, 0.25);
      transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.2s ease;
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }

    .rr-fab-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(58, 80, 157, 0.35);
    }

    .rr-fab-btn:active {
      transform: scale(0.95);
    }

    /* ── Main toggle button ── */
    #rr-fab-main {
      background: #ffffff;
      width: 56px;
      height: 56px;
      position: relative;
      z-index: 1;
      box-shadow: 0 4px 16px rgba(58, 80, 157, 0.3);
    }

    #rr-fab-main.rr-open {
      background: #3a509d;
    }

    #rr-fab-main.rr-open svg {
      fill: #ffffff;
    }

    #rr-fab-main svg {
      transition: fill 0.2s ease;
    }

    /* ── Sub-buttons (hidden by default) ── */
    .rr-fab-sub {
      background: #ffffff;
      opacity: 0;
      transform: translateY(12px) scale(0.85);
      pointer-events: none;
      transition: opacity 0.22s ease, transform 0.22s ease;
    }

    .rr-fab-sub.rr-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* Stagger the sub-button animations */
    #rr-fab-search.rr-visible {
      transition-delay: 0.04s;
    }

    #rr-fab-chat.rr-visible {
      transition-delay: 0.08s;
    }

    /* ── Tooltip labels ── */
    .rr-fab-btn::before {
      content: attr(data-tooltip);
      position: absolute;
      right: 64px;
      background: rgba(30, 40, 80, 0.88);
      color: #fff;
      font-size: 12px;
      font-weight: 500;
      padding: 5px 10px;
      border-radius: 6px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s ease;
    }

    .rr-fab-btn:hover::before {
      opacity: 1;
    }

    /* ── Simple input container ── */
    #rr-input-container {
      position: absolute !important;
      bottom: 100px;
      right: 28px;
      z-index: 2147483647 !important;
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 4px 16px rgba(58, 80, 157, 0.25);
      padding: 12px;
      border: 1px solid rgba(90, 103, 183, 0.16);
      opacity: 0;
      pointer-events: none;
      transform: translateY(8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    #rr-input-container.rr-visible {
      display: block !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      transform: translateY(0);
    }

    #rr-input-container input {
      width: 200px;
      border: none;
      background: rgba(90, 103, 183, 0.06);
      border-radius: 8px;
      padding: 8px 12px;
      color: #1f2b5e;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    #rr-input-container input:focus {
      background: rgba(90, 103, 183, 0.1);
      border-color: rgba(90, 103, 183, 0.32);
    }

    #rr-input-container input::placeholder {
      color: rgba(31, 43, 94, 0.5);
    }

    .rr-input-buttons {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .rr-input-btn {
      flex: 1;
      padding: 6px 12px;
      border: 1px solid rgba(90, 103, 183, 0.2);
      background: #ffffff;
      color: #3a509d;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .rr-input-btn:hover {
      background: rgba(90, 103, 183, 0.08);
      border-color: rgba(90, 103, 183, 0.4);
    }

    .rr-input-btn:active {
      transform: scale(0.98);
    }

    /* ── Search window panel ── */
    #rr-search-panel {
      position: fixed;
      top: 24px;
      right: 24px;
      width: 314px;
      height: 148px;
      z-index: 2147483647;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 24px 64px rgba(26, 47, 105, 0.18);
      padding: 16px;
      border: 1px solid #BFCAE3;
      color: #1f2b5e;
      font-family: inherit;
      display: none;
      flex-direction: column;
      gap: 12px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(-8px);
      transition: opacity 0.22s ease, transform 0.22s ease;
    }

    #rr-search-panel.rr-visible {
      display: flex;
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    #rr-search-panel.rr-hidden {
      display: none !important;
    }

    .rr-search-panel-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .rr-search-panel-label {
      margin: 0 0 4px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #5b6bbf;
    }

    .rr-search-panel-title {
      margin: 0;
      font-size: 18px;
      line-height: 1.2;
      color: #1f2b5e;
    }

    .rr-search-panel-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .rr-search-card-wrapper {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      border: 1px solid #d1d9e6;
      border-radius: 16px;
      background: #ffffff;
    }

    #rr-search-textarea {
      width: 100%;
      min-height: 160px;
      border: none;
      background: #ffffff;
      border-radius: 12px;
      padding: 14px 12px;
      font-size: 15px;
      color: #1f2b5e;
      font-family: inherit;
      outline: none;
      resize: none;
      line-height: 1.5;
      box-sizing: border-box;
      margin: 0;
    }

    .rr-search-card-footer,
    .rr-search-panel-footer {
      display: flex;
      flex-direction: row
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #eef2f8;
      flex-wrap: nowrap;
    }

    .rr-search-char-count {
      font-size: 12px;
      color: #5b6bbf;
      flex: 1;
      white-space: nowrap;
      min-width: 0;
      flex-shrink: 0;
    }

    .rr-search-buttons {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .rr-search-btn {
      flex: 1;
      min-height: 40px;
      padding: 10px 16px;
      border: 1px solid rgba(90, 103, 183, 0.2);
      background: #ffffff;
      color: #3a509d;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .rr-search-btn:hover {
      background: rgba(90, 103, 183, 0.08);
      border-color: rgba(90, 103, 183, 0.4);
    }

    .rr-search-btn:active {
      transform: scale(0.98);
    }

    .rr-search-results {
      display: grid;
      gap: 10px;
    }

    .rr-search-empty {
      padding: 14px 16px;
      border-radius: 16px;
      background: #f3f4ff;
      color: #4d5fae;
      font-size: 14px;
    }

    .rr-search-result-item {
      padding: 14px 16px;
      border-radius: 20px;
      background: #f8f9ff;
      border: 1px solid #BFCAE3;
      color: #243055;
      font-size: 14px;
      line-height: 1.5;
    }

    .rr-search-result-item p {
      margin: 0;
    }
  `;
  shadow.appendChild(style);

  /* ── Q&A button ── */
  const chatBtn = document.createElement("button");
  chatBtn.id = "rr-fab-chat";
  chatBtn.className = "rr-fab-btn rr-fab-sub";
  chatBtn.setAttribute("data-tooltip", "Q&A");
  chatBtn.setAttribute("aria-label", "Q&A");
  // Chat bubble with top-right corner physically cut out, large sparkle fills that space.
  chatBtn.innerHTML = `<img src="${chrome.runtime.getURL("icons/octicon_comment-ai-16.png")}" width="24" height="24" alt="Q&A" style="display:block;" />`;

  /* ── Search button ── */
  const searchBtn = document.createElement("button");
  searchBtn.id = "rr-fab-search";
  searchBtn.className = "rr-fab-btn rr-fab-sub";
  searchBtn.setAttribute("data-tooltip", "Search");
  searchBtn.setAttribute("aria-label", "Search");
  searchBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
         fill="none" stroke="#5b6bbf" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <line x1="16.5" y1="16.5" x2="22" y2="22"/>
    </svg>`;

  /* ── Main toggle button ── */
  const mainBtn = document.createElement("button");
  mainBtn.id = "rr-fab-main";
  mainBtn.className = "rr-fab-btn";
  mainBtn.setAttribute("data-tooltip", "ResearchRabbit");
  mainBtn.setAttribute("aria-label", "Toggle ResearchRabbit menu");
  mainBtn.setAttribute("aria-expanded", "false");
  // Closed state: white bg + dark-blue icon. Open state: dark-blue bg + white icon (via CSS).
  mainBtn.innerHTML = `
    <svg id="rr-fab-main-svg" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 26 26" fill="#3a509d">
      <!-- three dots -->
      <circle cx="9"  cy="9"  r="3.2"/>
      <circle cx="9"  cy="17" r="3.2"/>
      <circle cx="17" cy="17" r="3.2"/>
      <!-- sparkle (top-right, replaces 4th dot) -->
      <path d="M17 5l.8 2.2L20 8l-2.2.8L17 11l-.8-2.2L14 8l2.2-.8z"/>
    </svg>`;

  /* ── Assemble: sub-buttons first (column order: chat → search → main) ── */
  shadow.appendChild(chatBtn);
  shadow.appendChild(searchBtn);
  shadow.appendChild(mainBtn);
  document.body.appendChild(container);

  /* ── Toggle logic ── */
  let isOpen = false;

  function openMenu() {
    isOpen = true;
    mainBtn.classList.add("rr-open");
    mainBtn.setAttribute("aria-expanded", "true");
    searchBtn.classList.add("rr-visible");
    chatBtn.classList.add("rr-visible");
  }

  function closeMenu() {
    isOpen = false;
    mainBtn.classList.remove("rr-open");
    mainBtn.setAttribute("aria-expanded", "false");
    searchBtn.classList.remove("rr-visible");
    chatBtn.classList.remove("rr-visible");
  }

  mainBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    isOpen ? closeMenu() : openMenu();
  });

  /* ── Close when clicking outside ── */
  document.addEventListener("click", (e) => {
    if (isOpen && !e.composedPath().includes(container)) {
      closeMenu();
    }
  });

  /* ── Sub-button actions (wire up your features here) ── */
  chatBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[ResearchRabbit] Q&A clicked");
    // TODO: open Q&A panel
  });

  /* ── Search panel ── */
  const searchPanel = document.createElement("div");
  searchPanel.id = "rr-search-panel";
  searchPanel.className = "rr-search-panel";
  searchPanel.style.display = "none";
  searchPanel.innerHTML = `
    <div class="rr-search-panel-header">
      <div class="rr-search-panel-header-left">
        <svg class="rr-search-panel-sparkle" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 26 26" fill="#3a509d">
          <path d="M17 5l.8 2.2L20 8l-2.2.8L17 11l-.8-2.2L14 8l2.2-.8z"/>
        </svg>
        <div class="rr-search-panel-title-section">
          <h2>Search by meaning</h2>
          <p class="rr-search-panel-subtitle">Paste a paragraph · we highlight what's relevant</p>
        </div>
      </div>
      <div class="rr-search-panel-header-right">
        <button id="rr-search-close" type="button" class="rr-search-panel-close" aria-label="Close">×</button>
      </div>
    </div>
    <div class="rr-search-panel-body">
      <div id="rr-search-card-wrapper" class="rr-search-card-wrapper">
        <textarea id="rr-search-textarea" placeholder="Paste your paragraph here..."></textarea>
        <div class="rr-search-card-footer">
          <div id="rr-search-char-count" class="rr-search-char-count">0 CHARS · semantic</div>
          <div class="rr-search-buttons">
            <button id="rr-search-clear" type="button" class="rr-search-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear
            </button>
            <button id="rr-search-search" type="button" class="rr-search-btn rr-search-btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <line x1="16.5" y1="16.5" x2="22" y2="22"/>
              </svg>
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
    <div id="rr-search-results" class="rr-search-results">
      <div class="rr-search-empty">
        <p>Enter a query above to search page content.</p>
      </div>
    </div>
  `;
  document.body.appendChild(searchPanel);

  const searchTextarea = searchPanel.querySelector("#rr-search-textarea");
  const searchResults = searchPanel.querySelector("#rr-search-results");
  const searchClose = searchPanel.querySelector("#rr-search-close");
  const clearBtn = searchPanel.querySelector("#rr-search-clear");
  const searchActionBtn = searchPanel.querySelector("#rr-search-search");
  const charCount = searchPanel.querySelector("#rr-search-char-count");

  function closeSearchPanel() {
    searchPanel.style.display = "none";
    searchPanel.classList.remove("rr-visible");
    searchTextarea.value = "";
    updateCharCount();
    renderSearchResults([]);
  }

  function openSearchPanel() {
    closeMenu();
    searchPanel.style.display = "flex";
    searchPanel.classList.add("rr-visible");
    setTimeout(() => searchTextarea.focus(), 100);
  }

  function updateCharCount() {
    const length = searchTextarea.value.length;
    charCount.textContent = `${length} CHARS · semantic`;
  }

  function renderSearchResults(results) {
    if (!results || results.length === 0) {
      searchResults.innerHTML = `
        <div class="rr-search-empty">
          <p>${searchTextarea.value.trim() ? "No matching page content found." : "Enter a query above to search page content."}</p>
        </div>
      `;
      return;
    }

    searchResults.innerHTML = results
      .map(
        (result) => `
          <div class="rr-search-result-item">
            <p>${result}</p>
          </div>
        `,
      )
      .join("");
  }

  function searchPage(query) {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const text = document.body.innerText || "";
    const normalizedText = text.replace(/\s+/g, " ").trim();
    const terms = trimmed.toLowerCase().split(/\s+/);
    const snippets = [];

    const sentences = normalizedText.split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (terms.every((term) => lower.includes(term))) {
        snippets.push(sentence.trim());
        if (snippets.length >= 6) break;
      }
    }

    if (snippets.length === 0) {
      const lines = normalizedText
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);
      for (const line of lines) {
        const lower = line.toLowerCase();
        if (terms.some((term) => lower.includes(term))) {
          snippets.push(line.trim());
          if (snippets.length >= 4) break;
        }
      }
    }

    return snippets.map((line) => {
      const escaped = line.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return escaped.length > 180
        ? escaped.slice(0, 180).trim() + "…"
        : escaped;
    });
  }

  let searchDebounce = null;
  function updateSearchResults() {
    const results = searchPage(searchTextarea.value);
    renderSearchResults(results);
  }

  searchTextarea.addEventListener("input", () => {
    updateCharCount();
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(updateSearchResults, 220);
  });

  searchClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeSearchPanel();
  });

  clearBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    searchTextarea.value = "";
    updateCharCount();
    renderSearchResults([]);
    searchTextarea.focus();
  });

  searchActionBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log(
      "[ResearchRabbit] Search clicked with query:",
      searchTextarea.value.trim(),
    );
    updateSearchResults();
  });

  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (searchPanel.classList.contains("rr-visible")) {
      closeSearchPanel();
    } else {
      openSearchPanel();
    }
  });

  /* ── Drag functionality for search panel ── */
  let isDragging = false;
  let initialMouseX = 0;
  let initialMouseY = 0;
  let initialPanelTop = 0;
  let initialPanelLeft = 0;

  const searchPanelHeader = searchPanel.querySelector(
    ".rr-search-panel-header",
  );

  searchPanelHeader.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;

    // Record initial mouse position
    initialMouseX = e.clientX;
    initialMouseY = e.clientY;

    // Get current panel position
    const rect = searchPanel.getBoundingClientRect();
    initialPanelTop = rect.top;
    initialPanelLeft = rect.left;

    // Set explicit top and left, remove transform to prevent jumping
    searchPanel.style.top = initialPanelTop + "px";
    searchPanel.style.left = initialPanelLeft + "px";
    searchPanel.style.transform = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    // Calculate distance moved
    const deltaX = e.clientX - initialMouseX;
    const deltaY = e.clientY - initialMouseY;

    // Update panel position
    const newTop = initialPanelTop + deltaY;
    const newLeft = initialPanelLeft + deltaX;
    searchPanel.style.top = newTop + "px";
    searchPanel.style.left = newLeft + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  document.addEventListener("click", (e) => {
    // Check if click is inside container or search panel to avoid interference
    const isInsideContainer = e.composedPath().includes(container);
    const isInsideSearchPanel = e.composedPath().includes(searchPanel);

    // Close menu only if clicking outside BOTH container and search panel
    if (isOpen && !isInsideContainer && !isInsideSearchPanel) {
      closeMenu();
    }

    // Close search panel only if clicking outside BOTH search panel and container
    if (
      searchPanel.classList.contains("rr-visible") &&
      !isInsideSearchPanel &&
      !isInsideContainer
    ) {
      closeSearchPanel();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (searchPanel.classList.contains("rr-visible")) {
        closeSearchPanel();
      }
      if (isOpen) {
        closeMenu();
      }
    }
  });
})();
