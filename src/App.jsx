import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Admin from "./pages/Admin";
import ContactPage from "./pages/ContactPage";
import SiteConfigEditor from "./data/SiteConfigEditor";
import ImageUploader from "./components/ImageUploader";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/edit" element={<SiteConfigEditor />} />
        <Route path="/upload" element={<ImageUploader />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </>
  );
}
