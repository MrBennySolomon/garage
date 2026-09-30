import React from "react";
import { Quote, Star } from "lucide-react";
import siteConfig from "../data/siteConfig";

export default function Testimonials() {
  const { testimonials } = siteConfig;

  return (
    <section className="section testimonials">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow dark">{testimonials.eyebrow}</span>
          <h2>{testimonials.title}</h2>
        </div>
        <div className="testimonial-grid">
          {testimonials.list.map((t) => (
            <article className="testimonial" key={t.name}>
              <Quote className="quote-icon" size={34} />
              <div className="stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={16} fill="currentColor" />
                ))}
              </div>
              <p>"{t.text}"</p>
              <strong>{t.name}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
