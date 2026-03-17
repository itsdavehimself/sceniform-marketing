import React, { useState } from "react";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Imported hamburger icons
import NavButton from "./NavButton/NavButton";
import styles from "./Navbar.module.scss";
import ActionButton from "../ActionButton/ActionButton";
import logo from "../../assets/sceniform-logo.png";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        {/* LOGO GROUP */}
        <div className={styles.navLogoGroup}>
          <button
            className={styles.branding}
            onClick={() => {
              navigate("/");
              closeMenu();
            }}
          >
            <img className={styles.logo} src={logo} alt="Sceniform Logo" />
            Sceniform
          </button>
        </div>

        {/* HAMBURGER TOGGLE (Mobile Only) */}
        <button
          className={styles.hamburger}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* MENU CONTENT (Links & Auth) */}
        <div
          className={`${styles.menuContent} ${isMobileMenuOpen ? styles.isOpen : ""}`}
        >
          <div className={styles.navGroup}>
            <NavButton
              title="Features"
              onClick={() => {
                const element = document.getElementById("features");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                } else {
                  window.location.href = "/#features";
                }
                closeMenu();
              }}
            />
            <NavButton
              title="Pricing"
              onClick={() => {
                navigate("/pricing");
                closeMenu();
              }}
            />
          </div>

          <div className={styles.authGroup}>
            <SignInButton
              forceRedirectUrl={"https://app.sceniform.com/scenarios"}
              signUpForceRedirectUrl={"https://app.sceniform.com/onboarding"}
            >
              <div onClick={closeMenu}>
                <ActionButton title="Sign In" variant="secondary" />
              </div>
            </SignInButton>

            <SignUpButton
              forceRedirectUrl={"https://app.sceniform.com/onboarding"}
              signInForceRedirectUrl={"https://app.sceniform.com/scenarios"}
            >
              <div onClick={closeMenu}>
                <ActionButton title="Sign Up" variant="primary" />
              </div>
            </SignUpButton>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
