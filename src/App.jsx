
import React, { useMemo, useState } from "react";
import "./app.css";

const VALID_MULTIPLIERS = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
const DEMO_MESSAGE = "MEET ME AT THE LIBRARY";

// Always returns a positive remainder.
function mod(number, base) {
  return ((number % base) + base) % base;
}

// Find the modular inverse of a number modulo 26.
function modInverse(number, base = 26) {
  for (let i = 1; i < base; i += 1) {
    if (mod(number * i, base) === 1) return i;
  }
  return null;
}

// Mathematical Affine Cipher.
// A = 0, B = 1, ..., Z = 25.
function transformText(text, mode, a, b) {
  const inverse = modInverse(a, 26);

  if (inverse === null) {
    return "Invalid key: choose a valid multiplier.";
  }

  return Array.from(text)
    .map((character) => {
      const code = character.charCodeAt(0);
      const isUpper = code >= 65 && code <= 90;
      const isLower = code >= 97 && code <= 122;

      // Keep spaces, numbers, punctuation, and other symbols unchanged.
      if (!isUpper && !isLower) return character;

      const base = isUpper ? 65 : 97;
      const x = code - base;

      const y =
        mode === "encrypt"
          ? mod(a * x + b, 26)
          : mod(inverse * (x - b), 26);

      return String.fromCharCode(base + y);
    })
    .join("");
}

// Small built-in SVG icons. No icon library required.
function Icon({ name, size = 18 }) {
  const paths = {
    sparkles: (
      <>
        <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
        <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <path d="M12 14v3" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
        <path d="M5 17v4h14v-4" />
      </>
    ),
    swap: (
      <>
        <path d="M16 3l4 4-4 4" />
        <path d="M4 7h16" />
        <path d="M8 21l-4-4 4-4" />
        <path d="M20 17H4" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12" />
        <path d="M18.4 15a7 7 0 0 1-11.6 2L4 12" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.sparkles}
    </svg>
  );
}

export default function App() {
  const [mode, setMode] = useState("encrypt");
  const [message, setMessage] = useState(DEMO_MESSAGE);
  const [multiplier, setMultiplier] = useState(5);
  const [shift, setShift] = useState(8);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");

  const result = useMemo(
    () => transformText(message, mode, multiplier, shift),
    [message, mode, multiplier, shift]
  );

  const letterCount = (message.match(/[a-z]/gi) || []).length;
  const wordCount = message.trim()
    ? message.trim().split(/\s+/).length
    : 0;

  async function handleCopy() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setNotice("Result copied to clipboard.");

      window.setTimeout(() => setCopied(false), 1800);
      window.setTimeout(() => setNotice(""), 3000);
    } catch {
      setNotice("Clipboard access failed. Select and copy the result.");
      window.setTimeout(() => setNotice(""), 3500);
    }
  }

  function handleDownload() {
    if (!result) return;

    const blob = new Blob([result], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = mode === "encrypt"
      ? "cipher-math-encrypted.txt"
      : "cipher-math-decrypted.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice("Text file downloaded.");
    window.setTimeout(() => setNotice(""), 3000);
  }

  function handleSwap() {
    if (!message) return;

    // Reverse the operation so the current result becomes the next input.
    setMode((current) => (
      current === "encrypt" ? "decrypt" : "encrypt"
    ));
    setMessage(result);
  }

  function handleReset() {
    setMode("encrypt");
    setMessage(DEMO_MESSAGE);
    setMultiplier(5);
    setShift(8);
    setNotice("");
    setCopied(false);
  }

  function handleExample() {
    setMode("encrypt");
    setMessage(DEMO_MESSAGE);
    setNotice("");
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="ambient ambient-three" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="CipherMath Studio home">
          <span className="brand-mark">
            <Icon name="sparkles" size={22} />
          </span>
          <span className="brand-word">
            cipher<span>math</span>
          </span>
          <span className="brand-badge">STUDIO</span>
        </a>

        <div className="top-status">
          <span className="status-dot" />
          <span>CLIENT-SIDE CRYPTOGRAPHY</span>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          MATHEMATICAL SECRET CODES
        </div>

        <h1>
          Your words.
          <br />
          <span>Hidden in numbers.</span>
        </h1>

        <p className="hero-description">
          Turn ordinary messages into mathematical codes.
          Choose your keys, transform your text, and unlock the
          message whenever you are ready.
        </p>

        <div className="hero-features">
          <span>
            <Icon name="lock" size={15} />
            Runs in your browser
          </span>
          <span>
            <span className="mini-star">✦</span>
            Live transformations
          </span>
          <span>
            <span className="mini-dot" />
            No account required
          </span>
        </div>
      </section>

      <div className="workspace">
        <aside className="control-panel">
          <div className="panel-heading">
            <div>
              <span className="step-label">01 / CONFIGURATION</span>
              <h2>Build your cipher</h2>
            </div>
            <span className="heading-icon">
              <Icon name="lock" size={20} />
            </span>
          </div>

          <div className="mode-label">CHOOSE YOUR OPERATION</div>

          <div className="mode-switch" role="group" aria-label="Cipher operation">
            <button
              type="button"
              className={mode === "encrypt" ? "mode-option active" : "mode-option"}
              onClick={() => setMode("encrypt")}
              aria-pressed={mode === "encrypt"}
            >
              <Icon name="lock" size={16} />
              Encrypt
            </button>

            <button
              type="button"
              className={mode === "decrypt" ? "mode-option active" : "mode-option"}
              onClick={() => setMode("decrypt")}
              aria-pressed={mode === "decrypt"}
            >
              <Icon name="refresh" size={16} />
              Decrypt
            </button>
          </div>

          <div className="algorithm-card">
            <div className="algorithm-top">
              <span className="algorithm-orb">
                <Icon name="sparkles" size={18} />
              </span>
              <div>
                <span className="algorithm-overline">SELECTED ALGORITHM</span>
                <h3>Affine Cipher</h3>
              </div>
              <span className="algorithm-tag">MATH</span>
            </div>

            <div className="formula-box">
              <span className="formula-label">
                {mode === "encrypt" ? "ENCRYPTION FORMULA" : "DECRYPTION FORMULA"}
              </span>
              {mode === "encrypt" ? (
                <div className="formula">
                  E(x) = (a × x + b) <span>mod 26</span>
                </div>
              ) : (
                <div className="formula">
                  D(y) = a⁻¹(y − b) <span>mod 26</span>
                </div>
              )}
            </div>
          </div>

          <div className="key-heading">
            <span className="step-label">CUSTOM KEYS</span>
            <span className="key-live">
              <span className="status-dot" />
              LIVE
            </span>
          </div>

          <label className="field-label" htmlFor="multiplier">
            Multiplier key <span className="math-letter">a</span>
          </label>

          <div className="select-wrap">
            <select
              id="multiplier"
              value={multiplier}
              onChange={(event) => setMultiplier(Number(event.target.value))}
            >
              {VALID_MULTIPLIERS.map((value) => (
                <option key={value} value={value}>
                  {String(value).padStart(2, "0")} — {value === 1
                    ? "Identity multiplier"
                    : "Valid modulo 26"}
                </option>
              ))}
            </select>
            <span className="select-indicator">⌄</span>
          </div>

          <p className="field-hint">
            Must share no common factor with 26 other than 1.
          </p>

          <div className="shift-heading">
            <label className="field-label" htmlFor="shift">
              Shift key <span className="math-letter">b</span>
            </label>
            <output className="shift-value" htmlFor="shift">
              {String(shift).padStart(2, "0")}
            </output>
          </div>

          <input
            id="shift"
            className="shift-slider"
            type="range"
            min="0"
            max="25"
            step="1"
            value={shift}
            onChange={(event) => setShift(Number(event.target.value))}
          />

          <div className="range-labels">
            <span>0</span>
            <span>13</span>
            <span>25</span>
          </div>

          <div className="key-preview">
            <div>
              <span className="preview-symbol">a</span>
              <span>Multiplier</span>
              <strong>{multiplier}</strong>
            </div>
            <div>
              <span className="preview-symbol">b</span>
              <span>Shift</span>
              <strong>{shift}</strong>
            </div>
            <div>
              <span className="preview-symbol">m</span>
              <span>Modulus</span>
              <strong>26</strong>
            </div>
          </div>

          <button
            type="button"
            className="example-button"
            onClick={handleExample}
          >
            <Icon name="sparkles" size={16} />
            Load example message
            <Icon name="arrow" size={15} />
          </button>

          <div className="panel-footnote">
            <Icon name="info" size={16} />
            <p>
              Letters are mapped to numbers from 0 to 25.
              Your selected keys control the transformation.
            </p>
          </div>
        </aside>

        <section className="editor-panel">
          <div className="editor-heading">
            <div>
              <span className="step-label">02 / MESSAGE WORKSPACE</span>
              <h2>Make your message secret</h2>
              <p>Type anything. Watch the mathematics work.</p>
            </div>

            <span className="live-pill">
              <span className="status-dot" />
              LIVE ENGINE
            </span>
          </div>

          <div className="editor-grid">
            <article className="message-card input-card">
              <div className="card-topline">
                <div className="card-label">
                  <span className="card-number">01</span>
                  <span>YOUR MESSAGE</span>
                </div>
                <span className="card-status">INPUT</span>
              </div>

              <label className="sr-only" htmlFor="message-input">
                Enter your message
              </label>

              <textarea
                id="message-input"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write your secret message here..."
                spellCheck="false"
                maxLength={10000}
              />

              <div className="card-footer">
                <span>{letterCount} letters</span>
                <span>{wordCount} words</span>
                <span>{message.length}/10,000 chars</span>
              </div>
            </article>

            <div className="transform-bridge" aria-hidden="true">
              <span>
                <Icon name="arrow" size={19} />
              </span>
              <small>TRANSFORM</small>
            </div>

            <article className="message-card output-card">
              <div className="card-topline">
                <div className="card-label">
                  <span className="card-number result-number">02</span>
                  <span>{mode === "encrypt" ? "SECRET CODE" : "DECODED MESSAGE"}</span>
                </div>
                <span className="card-status result-status">
                  <span className="status-dot" />
                  RESULT
                </span>
              </div>

              <label className="sr-only" htmlFor="message-output">
                Mathematical cipher result
              </label>

              <textarea
                id="message-output"
                className="result-textarea"
                value={result}
                readOnly
                placeholder="Your result will appear here..."
                spellCheck="false"
              />

              <div className="card-footer output-footer">
                <span>{result.length} characters</span>
                <span className="output-ready">
                  <Icon name="check" size={13} />
                  Calculated
                </span>
              </div>

              <div className="output-actions">
                <button
                  type="button"
                  className="copy-button"
                  onClick={handleCopy}
                  disabled={!result}
                >
                  <Icon name={copied ? "check" : "copy"} size={16} />
                  {copied ? "Copied!" : "Copy result"}
                </button>

                <button
                  type="button"
                  className="download-button"
                  onClick={handleDownload}
                  disabled={!result}
                  aria-label="Download result as text"
                  title="Download result as text"
                >
                  <Icon name="download" size={17} />
                </button>
              </div>
            </article>
          </div>

          <div className="math-explainer">
            <div className="explainer-icon">∑</div>
            <div>
              <strong>Behind the mathematics</strong>
              <p>
                Each letter becomes a number, is multiplied by{" "}
                <b>{multiplier}</b>, shifted by <b>{shift}</b>, and wrapped
                around the alphabet using modulo 26. The inverse calculation
                reverses the process.
              </p>
            </div>
          </div>

          {notice && (
            <div className="notice" role="status" aria-live="polite">
              <Icon name="check" size={16} />
              {notice}
            </div>
          )}

          <div className="workspace-footer">
            <button
              type="button"
              className="swap-button"
              onClick={handleSwap}
              disabled={!message}
            >
              <Icon name="swap" size={16} />
              Use result as next input
            </button>

            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
            >
              <Icon name="refresh" size={15} />
              Reset
            </button>
          </div>
        </section>
      </div>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="footer-mark">
            <Icon name="sparkles" size={16} />
          </span>
          <span>CipherMath Studio</span>
          <span className="footer-separator">/</span>
          <span className="footer-muted">A little logic. A lot of mystery.</span>
        </div>

        <div className="footer-disclaimer">
          Educational cipher · Not for sensitive information
        </div>
      </footer>
    </main>
  );
}
