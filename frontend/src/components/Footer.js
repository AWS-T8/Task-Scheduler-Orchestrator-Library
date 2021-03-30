import React from "react";

const Footer = () => {
  return (
    <footer className="absolute bottom-0 w-full flex justify-center">
      <a
        href="http://13.68.242.205:3000/api/tasks"
        className="text-xs sm:text-base mb-2 focus:outline-none transition-all duration-200 text-gray-500 hover:text-blue-500"
      >
        &copy; Built By Sanskar Agarwal & Saksham Arora
      </a>
    </footer>
  );
};

export default Footer;
