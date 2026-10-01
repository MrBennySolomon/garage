// netlify/functions/save-config.mjs
// מקבל את תוכן siteConfig.js מהעורך, עושה commit ל-GitHub, ו-Netlify בונה את האתר מחדש אוטומטית.
//
// משתני סביבה (Netlify → Site configuration → Environment variables):
//   EDITOR_SECRET   סיסמת פרסום שרק את/ה והלקוח מכירים
//   GITHUB_TOKEN    Fine-grained token עם הרשאת Contents: Read and write על הריפו בלבד
//   GITHUB_REPO     למשל MrBennySolomon/garage
//   GITHUB_BRANCH   (אופציונלי) ברירת מחדל: main
//   CONFIG_PATH     (אופציונלי) ברירת מחדל: src/data/siteConfig.js

import { createHash, timingSafeEqual } from "node:crypto";

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });

function safeEqual(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// ה-sha ש-GitHub מחשב לקובץ (git blob) - כך אפשר לזהות "אין שינוי" בלי להוריד את הקובץ
function gitBlobSha(text) {
  const buf = Buffer.from(text, "utf8");
  return createHash("sha1")
    .update(`blob ${buf.length}\0`)
    .update(buf)
    .digest("hex");
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const {
    EDITOR_SECRET,
    GITHUB_TOKEN,
    GITHUB_REPO,
    GITHUB_BRANCH = "main",
    CONFIG_PATH = "src/data/siteConfig.js"
  } = process.env;

  if (!EDITOR_SECRET || !GITHUB_TOKEN || !GITHUB_REPO) {
    return json(500, { error: "השרת לא מוגדר: חסרים משתני סביבה ב-Netlify" });
  }

  const provided = req.headers.get("x-editor-secret") || "";
  if (!safeEqual(provided, EDITOR_SECRET)) {
    return json(401, { error: "סיסמת פרסום שגויה" });
  }

  let content;
  try {
    ({ content } = await req.json());
  } catch {
    return json(400, { error: "גוף הבקשה אינו JSON תקין" });
  }

  if (
    typeof content !== "string" ||
    content.length > 5_000_000 ||
    !content.includes("const siteConfig =") ||
    !content.includes("export default siteConfig")
  ) {
    return json(400, { error: "תוכן הקובץ אינו תקין" });
  }

  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${CONFIG_PATH}`;
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "garage-config-editor"
  };

  async function getCurrentSha() {
    const res = await fetch(`${url}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, { headers });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub GET ${res.status}`);
    return (await res.json()).sha;
  }

  async function putFile(sha) {
    return fetch(url, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Update siteConfig from site editor",
        content: Buffer.from(content, "utf8").toString("base64"),
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {})
      })
    });
  }

  try {
    let sha = await getCurrentSha();

    if (sha && sha === gitBlobSha(content)) {
      return json(200, { ok: true, unchanged: true });
    }

    let res = await putFile(sha);

    // התנגשות (מישהו עשה push באותו זמן): מושכים sha עדכני ומנסים פעם נוספת
    if (res.status === 409 || res.status === 422) {
      sha = await getCurrentSha();
      res = await putFile(sha);
    }

    if (!res.ok) {
      const detail = await res.text();
      console.error("GitHub PUT failed", res.status, detail);
      return json(502, { error: `שמירה ל-GitHub נכשלה (${res.status})` });
    }

    const data = await res.json();
    return json(200, { ok: true, commit: data.commit?.html_url });
  } catch (err) {
    console.error(err);
    return json(502, { error: "שגיאה בתקשורת עם GitHub" });
  }
};
