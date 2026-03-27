import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';

const HomeNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex gap-8 text-lg font-semibold">
          <a href="/" className="hover:text-primary-color">
            হোম
          </a>
          <a href="#doctors" className="hover:text-primary-color">
            ডাক্তার
          </a>
          <a href="#blogs" className="hover:text-primary-color">
            ব্লগ
          </a>
          <a href="#videos" className="hover:text-primary-color">
            ভিডিও
          </a>
          <a href="/contact" className="hover:text-primary-color">
            যোগাযোগ
          </a>
        </div>

        {/* Mobile Menu (Hamburger) */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-2xl text-gray-600">
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col items-center gap-4 py-4 bg-white shadow-lg">
          <a href="/" className="hover:text-primary-color">
            হোম
          </a>
          <a href="#doctors" className="hover:text-primary-color">
            ডাক্তার
          </a>
          <a href="#blogs" className="hover:text-primary-color">
            ব্লগ
          </a>
          <a href="#videos" className="hover:text-primary-color">
            ভিডিও
          </a>
          <a href="/contact" className="hover:text-primary-color">
            যোগাযোগ
          </a>
        </div>
      )}
    </nav>
  );
};

export default HomeNavbar;
