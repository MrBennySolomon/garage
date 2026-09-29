import React from "react";
import siteConfig from "../data/siteConfig";

export default function Gallery() {
  const { gallery } = siteConfig;

  return (
    <section className="section gallery-section">
      <div className="container">
        <div className="section-heading light-heading">
          <span className="eyebrow"></span>
          <h2>{gallery.title}</h2>
        </div>
        <div className="gallery-grid">
          {gallery.images.map((src, i) => (
            <img key={src} src={src} alt={`עבודת מוסך ${i + 1}`} loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}
