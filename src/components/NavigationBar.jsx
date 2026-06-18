import React from 'react';

export default function NavigationBar() {
  return (
    <nav style={{ padding: "10px 24px", backgroundColor: "#0b0f17", borderBottom: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontWeight: "600", color: "#0284c7", letterSpacing: "1px", fontSize: "13px" }}>
        NATDC ENTERPRISE GRID INTERFACE
      </span>
      <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#4b5563" }}>
        SYSTEM DATA FEED LAYER: ONLINE
      </div>
    </nav>
  );
}