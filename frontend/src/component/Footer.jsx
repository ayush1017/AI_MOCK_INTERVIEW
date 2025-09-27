import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <p>&copy; 2025 RRR. All rights reserved.</p>
            <p className="text-sm text-gray-400 mt-2">
              Providing quality service and solutions to help you succeed.
            </p>
          </div>

          {/* Quick Links */}
          <div className="mt-6 md:mt-0">
            <ul className="flex flex-col md:flex-row justify-center gap-6">
              <li>
                <a
                  href="/about"
                  className="text-sm hover:text-purple-400 transition duration-300"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-sm hover:text-purple-400 transition duration-300"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  className="text-sm hover:text-purple-400 transition duration-300"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-sm hover:text-purple-400 transition duration-300"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div className="mt-6 md:mt-0">
            <div className="flex gap-6 justify-center md:justify-end">
              {/* Twitter */}
              <a
                href="https://twitter.com/yourusername"  // Replace with your actual Twitter link
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-gray-300 hover:text-purple-400 transition duration-300"
              >
                <i className="fab fa-twitter"></i>
              </a>
              {/* Facebook */}
              <a
                href="https://facebook.com/yourusername"  // Replace with your actual Facebook link
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-gray-300 hover:text-purple-400 transition duration-300"
              >
                <i className="fab fa-facebook"></i>
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/yourusername"  // Replace with your actual LinkedIn link
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-gray-300 hover:text-purple-400 transition duration-300"
              >
                <i className="fab fa-linkedin"></i>
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com/yourusername"  // Replace with your actual Instagram link
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-gray-300 hover:text-purple-400 transition duration-300"
              >
                <i className="fab fa-instagram"></i>
              </a>
              {/* GitHub */}
              <a
                href="https://github.com/yourusername"  // Replace with your actual GitHub link
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-gray-300 hover:text-purple-400 transition duration-300"
              >
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
