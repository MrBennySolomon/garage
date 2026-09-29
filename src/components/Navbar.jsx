import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Phone, Wrench } from "lucide-react";
import siteConfig from "../data/siteConfig";

export default function Navbar() {
  const { brand, nav } = siteConfig;
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-icon">
            <Wrench size={22} />
          </span>
          <span>
            <b>{brand.name}</b>
            <small>{brand.tagline}</small>
          </span>
        </Link>

        <nav className={open ? "nav-links open" : "nav-links"}>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={close}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <a className="nav-phone" href={`tel:${brand.phoneHref}`}>
          <Phone size={17} /> {brand.phone}
        </a>

        <button
          className="menu-btn"
          onClick={() => setOpen(!open)}
          aria-label="פתיחת תפריט"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
