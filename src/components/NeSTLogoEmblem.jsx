// src/components/NeSTLogoEmblem.jsx
import React from "react";

const NeSTLogoEmblem = () => (
  <svg width="46" height="30" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(5, 5)">
      <ellipse cx="55" cy="35" rx="52" ry="32" fill="#e2e8f0" transform="translate(2, 3)" />
      <ellipse cx="55" cy="35" rx="52" ry="32" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M55 3 C25 3, 5 15, 5 35 C5 52, 20 63, 40 65 C48 55, 54 42, 57 33 L38 45 L55 3 Z" fill="#0a255c" />
      <path d="M55 67 C85 67, 105 55, 105 35 C105 18, 90 7, 70 5 C62 15, 56 28, 53 37 L72 25 L55 67 Z" fill="#d91414" />
      <text x="55" y="42" fontFamily="'Arial Black', Impact, sans-serif" fontSize="16" fontWeight="900" fill="#0f172a" textAnchor="middle" letterSpacing="-0.5">NeST</text>
    </g>
  </svg>
);

export default NeSTLogoEmblem;