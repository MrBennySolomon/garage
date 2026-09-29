import React from "react";
import { Award, CheckCircle2, Users } from "lucide-react";
import siteConfig from "../data/siteConfig";

const ICONS = { award: Award, users: Users, check: CheckCircle2 };

export default function About() {
  const { about } = siteConfig;

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{about.heroEyebrow}</span>
          <h1>{about.heroTitle}</h1>
        </div>
      </section>
      <section className="section about-section">
        <div className="container about-grid">
          <div>
            <span className="eyebrow dark">{about.sectionEyebrow}</span>
            <h2>{about.sectionTitle}</h2>
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="about-cards">
            {about.cards.map((card) => {
              const Icon = ICONS[card.icon] || CheckCircle2;
              return (
                <div key={card.title}>
                  <Icon />
                  <b>{card.title}</b>
                  <span>{card.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
