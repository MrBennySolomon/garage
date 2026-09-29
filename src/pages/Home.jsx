import React from "react";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Gallery from "../components/Gallery";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services preview />
      <Gallery />
      <Testimonials />
      <Contact />
    </main>
  );
}