import React from "react";
import ServicesList from "../components/Services";
import siteConfig from "../data/siteConfig";

export default function Services() {
  const { servicesPage } = siteConfig;

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{servicesPage.eyebrow}</span>
          <h1>{servicesPage.title}</h1>
        </div>
      </section>
      <ServicesList />
    </main>
  );
}
