import React, { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import "./Login.css";
import "./SiteConfigEditor.css";
import siteConfig from "./siteConfig";

// סיסמת הכניסה לעריכת תוכן האתר – מומלץ להחליף לפני שימוש בפועל
const EDITOR_PASSWORD = "12345";
const SESSION_KEY = "site-config-editor-authed";

const clone = (value) => JSON.parse(JSON.stringify(value));

const emptyService = () => ({
  icon: "wrench",
  title: "שירות חדש",
  text: "תיאור השירות"
});

const emptyTestimonial = () => ({
  name: "לקוח חדש",
  text: "חוות דעת הלקוח"
});

const emptyCard = () => ({
  icon: "check",
  title: "כותרת",
  text: "תיאור"
});

export default function SiteConfigEditor() {
  const [authed, setAuthed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [config, setConfig] = useState(() => clone(siteConfig));
  const [tab, setTab] = useState("brand");
  const [message, setMessage] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    if (password === EDITOR_PASSWORD) {
      setAuthError("");
      setAuthed(true);

      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        // sessionStorage לא זמין – ההתחברות עדיין תעבוד לטאב הנוכחי
      }
    } else {
      setAuthError("סיסמה שגויה. נסו שוב.");
    }
  }

  function logout() {
    setAuthed(false);
    setPassword("");

    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }

  const update = (path, value) => {
    setConfig((current) => {
      const next = clone(current);
      let target = next;
      path.slice(0, -1).forEach((key) => {
        target[key] = target[key] ?? {};
        target = target[key];
      });
      target[path[path.length - 1]] = value;
      return next;
    });
    setMessage("");
  };

  const updateArrayItem = (path, index, value) => {
    setConfig((current) => {
      const next = clone(current);
      let target = next;
      path.forEach((key) => {
        target = target[key];
      });
      target[index] = value;
      return next;
    });
    setMessage("");
  };

  const removeArrayItem = (path, index) => {
    setConfig((current) => {
      const next = clone(current);
      let target = next;
      path.forEach((key) => (target = target[key]));
      target.splice(index, 1);
      return next;
    });
  };

  const addArrayItem = (path, item) => {
    setConfig((current) => {
      const next = clone(current);
      let target = next;
      path.forEach((key) => (target = target[key]));
      target.push(clone(item));
      return next;
    });
  };

  const configText = useMemo(
    () =>
      `const siteConfig = ${JSON.stringify(config, null, 2)};\n\nexport default siteConfig;\n`,
    [config]
  );

  const copyConfig = async () => {
    await navigator.clipboard.writeText(configText);
    setMessage("siteConfig הועתק ללוח ✓");
  };

  const downloadConfig = () => {
    const blob = new Blob([configText], {
      type: "text/javascript;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "siteConfig.js";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("הקובץ siteConfig.js הורד ✓");
  };

  const handleImageUpload = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const images = [...(config.gallery?.images || [])];
      images[index] = reader.result;
      update(["gallery", "images"], images);
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setConfig(clone(siteConfig));
    setMessage("ההגדרות אופסו ✓");
  };

  const tabs = [
    ["brand", "פרטי העסק"],
    ["nav", "תפריט"],
    ["colors", "צבעים"],
    ["hero", "ראשי"],
    ["services", "שירותים"],
    ["gallery", "גלריה"],
    ["testimonials", "לקוחות"],
    ["contact", "צור קשר"],
    ["about", "אודות"],
    ["export", "ייצוא"]
  ];

  if (!authed) {
    return (
      <div className="login-screen" dir="rtl">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-icon">
            <Lock size={20} />
          </div>

          <h1>כניסה לניהול התוכן</h1>
          <p>הזינו סיסמה כדי לערוך את תוכן האתר</p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמה"
            autoFocus
          />

          {authError && <div className="login-error">{authError}</div>}

          <button className="btn-primary1" type="submit">
            כניסה
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="config-page" dir="rtl">
      <header className="config-header">
        <div>
          <span className="config-kicker">SITE CONFIG</span>
          <h1>ניהול תוכן האתר</h1>
          <p>ערוך את הטקסטים, הצבעים, התמונות ופרטי העסק במקום אחד.</p>
        </div>
        <div className="header-actions">
          <button className="btn secondary" onClick={reset}>
            איפוס
          </button>
          <button className="btn primary" onClick={downloadConfig}>
            ⬇ הורד siteConfig.js
          </button>
          <button className="btn secondary" onClick={logout}>
            יציאה
          </button>
        </div>
      </header>

      <div className="editor-layout">
        <aside className="sidebar">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              className={`tab ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </aside>

        <main className="editor-card">
          {tab === "brand" && (
            <Section
              title="פרטי העסק"
              subtitle="הפרטים שמופיעים בכותרת ובאזורי הקשר."
            >
              <Field label="שם העסק">
                <input
                  value={config.brand.name}
                  onChange={(e) => update(["brand", "name"], e.target.value)}
                />
              </Field>
              <Field label="סלוגן">
                <input
                  value={config.brand.tagline}
                  onChange={(e) => update(["brand", "tagline"], e.target.value)}
                />
              </Field>
              <div className="grid-2">
                <Field label="טלפון להצגה">
                  <input
                    value={config.brand.phone}
                    onChange={(e) => update(["brand", "phone"], e.target.value)}
                  />
                </Field>
                <Field label="טלפון לחיוג">
                  <input
                    value={config.brand.phoneHref}
                    onChange={(e) =>
                      update(["brand", "phoneHref"], e.target.value)
                    }
                  />
                </Field>
              </div>
              <Field label="אימייל">
                <input
                  type="email"
                  value={config.brand.email}
                  onChange={(e) => update(["brand", "email"], e.target.value)}
                />
              </Field>
            </Section>
          )}

          {tab === "nav" && (
            <Section
              title="תפריט ניווט"
              subtitle="הוסף, מחק או שנה את שמות הקישורים."
            >
              <div className="array-list">
                {config.nav.map((item, i) => (
                  <div className="array-row" key={i}>
                    <input
                      value={item.label}
                      onChange={(e) =>
                        updateArrayItem(["nav"], i, {
                          ...item,
                          label: e.target.value
                        })
                      }
                      placeholder="שם הקישור"
                    />
                    <input
                      value={item.to}
                      onChange={(e) =>
                        updateArrayItem(["nav"], i, {
                          ...item,
                          to: e.target.value
                        })
                      }
                      placeholder="/path"
                    />
                    <button
                      className="icon-btn danger"
                      onClick={() => removeArrayItem(["nav"], i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="add-btn"
                onClick={() =>
                  addArrayItem(["nav"], { to: "/", label: "קישור חדש" })
                }
              >
                ＋ הוסף קישור
              </button>
            </Section>
          )}

          {tab === "colors" && (
            <Section title="צבעי האתר" subtitle="בחר צבעים למיתוג.">
              <div className="color-grid">
                {Object.entries(config.colors).map(([key, value]) => (
                  <div className="color-field" key={key}>
                    <label>{key}</label>
                    <div>
                      <input
                        type="color"
                        value={value}
                        onChange={(e) =>
                          update(["colors", key], e.target.value)
                        }
                      />
                      <input
                        value={value}
                        onChange={(e) =>
                          update(["colors", key], e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {tab === "hero" && (
            <Section title="אזור ראשי" subtitle="הטקסט שמקבל את פני המבקרים.">
              <Field label="Eyebrow">
                <input
                  value={config.hero.eyebrow}
                  onChange={(e) => update(["hero", "eyebrow"], e.target.value)}
                />
              </Field>
              <Field label="כותרת">
                <input
                  value={config.hero.titleLine1}
                  onChange={(e) =>
                    update(["hero", "titleLine1"], e.target.value)
                  }
                />
              </Field>
              <Field label="מילה מודגשת">
                <input
                  value={config.hero.titleSpan}
                  onChange={(e) =>
                    update(["hero", "titleSpan"], e.target.value)
                  }
                />
              </Field>
              <Field label="טקסט">
                <textarea
                  value={config.hero.text}
                  onChange={(e) => update(["hero", "text"], e.target.value)}
                />
              </Field>
              <div className="grid-2">
                <Field label="כפתור ראשי">
                  <input
                    value={config.hero.ctaPrimaryText}
                    onChange={(e) =>
                      update(["hero", "ctaPrimaryText"], e.target.value)
                    }
                  />
                </Field>
                <Field label="כפתור משני">
                  <input
                    value={config.hero.ctaSecondaryText}
                    onChange={(e) =>
                      update(["hero", "ctaSecondaryText"], e.target.value)
                    }
                  />
                </Field>
              </div>
              <StringList
                label="נקודות יתרון"
                values={config.hero.points}
                onChange={(v) => update(["hero", "points"], v)}
              />
            </Section>
          )}

          {tab === "services" && (
            <Section
              title="שירותים"
              subtitle="ניהול כותרות, תיאורים ואייקונים."
            >
              <Field label="Eyebrow">
                <input
                  value={config.services.eyebrow}
                  onChange={(e) =>
                    update(["services", "eyebrow"], e.target.value)
                  }
                />
              </Field>
              <Field label="כותרת">
                <input
                  value={config.services.title}
                  onChange={(e) =>
                    update(["services", "title"], e.target.value)
                  }
                />
              </Field>
              <Field label="תיאור">
                <textarea
                  value={config.services.subtitle}
                  onChange={(e) =>
                    update(["services", "subtitle"], e.target.value)
                  }
                />
              </Field>
              {config.services.list.map((item, i) => (
                <div className="item-card" key={i}>
                  <div className="item-head">
                    <strong>שירות {i + 1}</strong>
                    <button
                      className="icon-btn danger"
                      onClick={() => removeArrayItem(["services", "list"], i)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid-2">
                    <Field label="אייקון">
                      <input
                        value={item.icon}
                        onChange={(e) =>
                          updateArrayItem(["services", "list"], i, {
                            ...item,
                            icon: e.target.value
                          })
                        }
                      />
                    </Field>
                    <Field label="כותרת">
                      <input
                        value={item.title}
                        onChange={(e) =>
                          updateArrayItem(["services", "list"], i, {
                            ...item,
                            title: e.target.value
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="טקסט">
                    <textarea
                      value={item.text}
                      onChange={(e) =>
                        updateArrayItem(["services", "list"], i, {
                          ...item,
                          text: e.target.value
                        })
                      }
                    />
                  </Field>
                </div>
              ))}
              <button
                className="add-btn"
                onClick={() =>
                  addArrayItem(["services", "list"], emptyService())
                }
              >
                ＋ הוסף שירות
              </button>
            </Section>
          )}

          {tab === "gallery" && (
            <Section
              title="גלריה"
              subtitle="שנה כתובות תמונות או העלה תמונה מהמחשב."
            >
              <Field label="כותרת">
                <input
                  value={config.gallery.title}
                  onChange={(e) => update(["gallery", "title"], e.target.value)}
                />
              </Field>
              <div className="gallery-grid">
                {config.gallery.images.map((src, i) => (
                  <div className="image-card" key={i}>
                    <img src={src} alt="" />
                    <input
                      value={src.startsWith("data:") ? "תמונה מקומית" : src}
                      onChange={(e) =>
                        updateArrayItem(
                          ["gallery", "images"],
                          i,
                          e.target.value
                        )
                      }
                    />
                    <label className="upload-btn">
                      החלף תמונה
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(i, e.target.files[0])
                        }
                      />
                    </label>
                    <button
                      className="remove-image"
                      onClick={() => removeArrayItem(["gallery", "images"], i)}
                    >
                      הסר
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="add-btn"
                onClick={() => addArrayItem(["gallery", "images"], "")}
              >
                ＋ הוסף תמונה
              </button>
            </Section>
          )}

          {tab === "testimonials" && (
            <Section title="לקוחות מספרים">
              <Field label="Eyebrow">
                <input
                  value={config.testimonials.eyebrow}
                  onChange={(e) =>
                    update(["testimonials", "eyebrow"], e.target.value)
                  }
                />
              </Field>
              <Field label="כותרת">
                <input
                  value={config.testimonials.title}
                  onChange={(e) =>
                    update(["testimonials", "title"], e.target.value)
                  }
                />
              </Field>
              {config.testimonials.list.map((item, i) => (
                <div className="item-card" key={i}>
                  <div className="item-head">
                    <strong>חוות דעת {i + 1}</strong>
                    <button
                      className="icon-btn danger"
                      onClick={() =>
                        removeArrayItem(["testimonials", "list"], i)
                      }
                    >
                      ✕
                    </button>
                  </div>
                  <Field label="שם">
                    <input
                      value={item.name}
                      onChange={(e) =>
                        updateArrayItem(["testimonials", "list"], i, {
                          ...item,
                          name: e.target.value
                        })
                      }
                    />
                  </Field>
                  <Field label="טקסט">
                    <textarea
                      value={item.text}
                      onChange={(e) =>
                        updateArrayItem(["testimonials", "list"], i, {
                          ...item,
                          text: e.target.value
                        })
                      }
                    />
                  </Field>
                </div>
              ))}
              <button
                className="add-btn"
                onClick={() =>
                  addArrayItem(["testimonials", "list"], emptyTestimonial())
                }
              >
                ＋ הוסף חוות דעת
              </button>
            </Section>
          )}

          {tab === "contact" && (
            <Section title="צור קשר">
              {["eyebrow", "title", "lead", "address", "hours"].map((key) => (
                <Field key={key} label={key}>
                  {key === "lead" ? (
                    <textarea
                      value={config.contact[key]}
                      onChange={(e) => update(["contact", key], e.target.value)}
                    />
                  ) : (
                    <input
                      value={config.contact[key]}
                      onChange={(e) => update(["contact", key], e.target.value)}
                    />
                  )}
                </Field>
              ))}
              <StringList
                label="קטגוריות שירות"
                values={config.contact.categories}
                onChange={(v) => update(["contact", "categories"], v)}
              />
            </Section>
          )}

          {tab === "about" && (
            <Section title="אודות">
              {[
                "heroEyebrow",
                "heroTitle",
                "sectionEyebrow",
                "sectionTitle"
              ].map((key) => (
                <Field key={key} label={key}>
                  <input
                    value={config.about[key]}
                    onChange={(e) => update(["about", key], e.target.value)}
                  />
                </Field>
              ))}
              <StringList
                label="פסקאות"
                values={config.about.paragraphs}
                onChange={(v) => update(["about", "paragraphs"], v)}
                multiline
              />
              {config.about.cards.map((item, i) => (
                <div className="item-card" key={i}>
                  <div className="item-head">
                    <strong>כרטיס {i + 1}</strong>
                    <button
                      className="icon-btn danger"
                      onClick={() => removeArrayItem(["about", "cards"], i)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid-2">
                    <Field label="אייקון">
                      <input
                        value={item.icon}
                        onChange={(e) =>
                          updateArrayItem(["about", "cards"], i, {
                            ...item,
                            icon: e.target.value
                          })
                        }
                      />
                    </Field>
                    <Field label="כותרת">
                      <input
                        value={item.title}
                        onChange={(e) =>
                          updateArrayItem(["about", "cards"], i, {
                            ...item,
                            title: e.target.value
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="טקסט">
                    <textarea
                      value={item.text}
                      onChange={(e) =>
                        updateArrayItem(["about", "cards"], i, {
                          ...item,
                          text: e.target.value
                        })
                      }
                    />
                  </Field>
                </div>
              ))}
              <button
                className="add-btn"
                onClick={() => addArrayItem(["about", "cards"], emptyCard())}
              >
                ＋ הוסף כרטיס
              </button>
            </Section>
          )}

          {tab === "export" && (
            <Section
              title="ייצוא siteConfig.js"
              subtitle="הקובץ שנוצר מתאים למבנה של siteConfig שלך."
            >
              <div className="export-actions">
                <button className="btn primary" onClick={copyConfig}>
                  העתק קוד
                </button>
                <button className="btn secondary" onClick={downloadConfig}>
                  הורד קובץ
                </button>
              </div>
              {message && <div className="success">{message}</div>}
              <pre className="code-preview">{configText}</pre>
            </Section>
          )}
        </main>

        <aside className="preview-card">
          <div className="preview-label">תצוגה מקדימה</div>
          <div
            className="preview"
            style={{
              "--accent": config.colors.accent,
              "--dark": config.colors.dark
            }}
          >
            <div className="preview-top">
              <strong>{config.brand.name}</strong>
              <span>{config.brand.phone}</span>
            </div>
            <div className="preview-hero">
              <small>{config.hero.eyebrow}</small>
              <h2>
                {config.hero.titleLine1} <span>{config.hero.titleSpan}</span>
              </h2>
              <p>{config.hero.text}</p>
              <button>{config.hero.ctaPrimaryText}</button>
            </div>
            <div className="preview-services">
              <small>{config.services.eyebrow}</small>
              <h3>{config.services.title}</h3>
              <div className="mini-grid">
                {config.services.list.slice(0, 4).map((s, i) => (
                  <div key={i}>
                    <b>{s.title}</b>
                    <p>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="section">
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function StringList({ label, values, onChange, multiline = false }) {
  const update = (i, value) => {
    const next = [...values];
    next[i] = value;
    onChange(next);
  };
  return (
    <div className="string-list">
      <span className="list-label">{label}</span>
      {values.map((value, i) => (
        <div className="array-row" key={i}>
          {multiline ? (
            <textarea
              value={value}
              onChange={(e) => update(i, e.target.value)}
            />
          ) : (
            <input value={value} onChange={(e) => update(i, e.target.value)} />
          )}
          <button
            className="icon-btn danger"
            onClick={() => onChange(values.filter((_, x) => x !== i))}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        className="add-btn small"
        onClick={() => onChange([...values, "פריט חדש"])}
      >
        ＋ הוסף
      </button>
    </div>
  );
}
