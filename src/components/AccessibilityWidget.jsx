import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./AccessibilityWidget.css";

const STORAGE_KEY = "a11y-settings-v1";
const MAX_FONT_STEP = 4; // each step = +10% of root font size
const MIN_FONT_STEP = -1;

const DEFAULTS = {
  fontStep: 0,
  contrast: "none", // none | high | negative | light
  grayscale: false,
  highlightLinks: false,
  highlightHeadings: false,
  readableFont: false,
  bigCursor: false,
  spacing: false,
  noAnimations: false
};

const CONTRAST_OPTIONS = [
  { value: "high", label: "ניגודיות גבוהה" },
  { value: "negative", label: "ניגודיות הפוכה" },
  { value: "light", label: "רקע בהיר" }
];

const TOGGLE_OPTIONS = [
  { key: "grayscale", label: "גווני אפור" },
  { key: "highlightLinks", label: "הדגשת קישורים" },
  { key: "highlightHeadings", label: "הדגשת כותרות" },
  { key: "readableFont", label: "גופן קריא" },
  { key: "spacing", label: "ריווח שורות ואותיות" },
  { key: "bigCursor", label: "סמן עכבר גדול" },
  { key: "noAnimations", label: "עצירת אנימציות" }
];

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function applySettings(s) {
  const root = document.documentElement;

  // Font size: scales everything that uses rem/em.
  root.style.fontSize = s.fontStep === 0 ? "" : `${100 + s.fontStep * 10}%`;

  // Page-wide filters (grayscale / negative)
  const filters = [];
  if (s.grayscale) filters.push("grayscale(1)");
  if (s.contrast === "negative") filters.push("invert(1) hue-rotate(180deg)");
  root.style.filter = filters.join(" ");

  const toggle = (cls, on) => root.classList.toggle(cls, on);
  toggle("a11y-contrast-high", s.contrast === "high");
  toggle("a11y-contrast-negative", s.contrast === "negative");
  toggle("a11y-contrast-light", s.contrast === "light");
  toggle("a11y-links", s.highlightLinks);
  toggle("a11y-headings", s.highlightHeadings);
  toggle("a11y-font", s.readableFont);
  toggle("a11y-cursor", s.bigCursor);
  toggle("a11y-spacing", s.spacing);
  toggle("a11y-no-anim", s.noAnimations);
}

function AccessibilityIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="12"
        cy="12"
        r="10.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="6.6" r="1.6" fill="currentColor" />
      <path
        d="M6.5 9.4h11M12 9.6v4.2m0 0-2.6 4.6m2.6-4.6 2.6 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Props:
 *  - statementUrl: link to your accessibility statement page (הצהרת נגישות)
 *  - position: "left" (default, common in Israel) or "right"
 */
export default function AccessibilityWidget({
  statementUrl = "/accessibility-statement",
  position = "left"
}) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply + persist whenever settings change
  useEffect(() => {
    applySettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage may be unavailable */
    }
  }, [settings]);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  // Move focus into the panel when it opens; close on Escape
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const update = (patch) => setSettings((prev) => ({ ...prev, ...patch }));

  const changeFont = (delta) =>
    setSettings((prev) => ({
      ...prev,
      fontStep: Math.min(
        MAX_FONT_STEP,
        Math.max(MIN_FONT_STEP, prev.fontStep + delta)
      )
    }));

  const setContrast = (value) =>
    setSettings((prev) => ({
      ...prev,
      contrast: prev.contrast === value ? "none" : value
    }));

  if (!mounted) return null;

  return createPortal(
    <div className={`a11y-root a11y-${position}`} dir="rtl" lang="he">
      <button
        ref={buttonRef}
        type="button"
        className="a11y-fab"
        aria-label="תפריט נגישות"
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => (open ? close() : setOpen(true))}
      >
        <AccessibilityIcon />
      </button>

      {open && (
        <div
          id="a11y-panel"
          ref={panelRef}
          className="a11y-panel"
          role="dialog"
          aria-label="תפריט נגישות"
          tabIndex={-1}
        >
          <div className="a11y-header">
            <h2 className="a11y-title">נגישות</h2>
            <button
              type="button"
              className="a11y-close"
              onClick={close}
              aria-label="סגירת תפריט הנגישות"
            >
              ×
            </button>
          </div>

          <div className="a11y-group" role="group" aria-label="גודל טקסט">
            <span className="a11y-group-label">גודל טקסט</span>
            <div className="a11y-font-row">
              <button
                type="button"
                className="a11y-btn"
                onClick={() => changeFont(1)}
                disabled={settings.fontStep >= MAX_FONT_STEP}
              >
                הגדלת טקסט
              </button>
              <button
                type="button"
                className="a11y-btn"
                onClick={() => changeFont(-1)}
                disabled={settings.fontStep <= MIN_FONT_STEP}
              >
                הקטנת טקסט
              </button>
            </div>
          </div>

          <div className="a11y-group" role="group" aria-label="צבעים וניגודיות">
            <span className="a11y-group-label">צבעים וניגודיות</span>
            <div className="a11y-grid">
              {CONTRAST_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className="a11y-btn"
                  aria-pressed={settings.contrast === o.value}
                  onClick={() => setContrast(o.value)}
                >
                  {o.label}
                </button>
              ))}
              {TOGGLE_OPTIONS.slice(0, 1).map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className="a11y-btn"
                  aria-pressed={settings[o.key]}
                  onClick={() => update({ [o.key]: !settings[o.key] })}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="a11y-group" role="group" aria-label="קריאות ותצוגה">
            <span className="a11y-group-label">קריאות ותצוגה</span>
            <div className="a11y-grid">
              {TOGGLE_OPTIONS.slice(1).map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className="a11y-btn"
                  aria-pressed={settings[o.key]}
                  onClick={() => update({ [o.key]: !settings[o.key] })}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="a11y-footer">
            <button
              type="button"
              className="a11y-btn a11y-reset"
              onClick={() => setSettings(DEFAULTS)}
            >
              איפוס הגדרות
            </button>
            <a className="a11y-statement" href={statementUrl}>
              הצהרת נגישות
            </a>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
