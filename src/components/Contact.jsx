import React, { useState } from "react";
import { Clock3, Mail, MapPin, Phone, Send } from "lucide-react";
import siteConfig from "../data/siteConfig";

// זהו API נפרד (רשימת פניות לקוחות) - לא קשור ל-siteConfig, ולא משתנה משם.
const API_URL = "https://6aae754a606bd915d110d395.mockapi.io/api/clients";

export default function Contact() {
  const { contact, brand } = siteConfig;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    category: "",
    details: "",
  });

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setSent(false);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          category: formData.category,
          details: formData.details,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("שגיאה בשליחת הטופס");

      const data = await response.json();
      console.log("נשמר בהצלחה ב-MockAPI:", data);

      setSent(true);
      setFormData({ name: "", phone: "", category: "", details: "" });
    } catch (err) {
      console.error(err);
      setError("אירעה שגיאה בשליחת הפנייה. נסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="section contact-section">
      <div className="container contact-grid">
        <div>
          <span className="eyebrow dark">{contact.eyebrow}</span>
          <h2>{contact.title}</h2>
          <p className="contact-lead">{contact.lead}</p>

          <div className="contact-details">
            <a href={`tel:${brand.phoneHref}`}>
              <span>
                <Phone />
              </span>
              <div>
                <small>טלפון</small>
                <b>{brand.phone}</b>
              </div>
            </a>

            <a href={`mailto:${brand.email}`}>
              <span>
                <Mail />
              </span>
              <div>
                <small>אימייל</small>
                <b>{brand.email}</b>
              </div>
            </a>

            <div>
              <span>
                <MapPin />
              </span>
              <div>
                <small>כתובת</small>
                <b>{contact.address}</b>
              </div>
            </div>

            <div>
              <span>
                <Clock3 />
              </span>
              <div>
                <small>שעות פעילות</small>
                <b>{contact.hours}</b>
              </div>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={submit}>
          <input required name="name" value={formData.name} onChange={handleChange} placeholder="שם מלא" />
          <input required name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="טלפון" />

          <select required name="category" value={formData.category} onChange={handleChange}>
            <option value="" disabled>
              במה נוכל לעזור?
            </option>
            {contact.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
            placeholder="ספרו לנו בקצרה על התקלה..."
            rows="5"
          />

          <button className="btn btn-primary" type="submit" disabled={loading}>
            <Send size={18} />
            {loading ? "שולח..." : "שליחת פנייה"}
          </button>

          {sent && <div className="success">הפנייה נשלחה בהצלחה! נחזור אליכם בהקדם.</div>}
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </section>
  );
}
