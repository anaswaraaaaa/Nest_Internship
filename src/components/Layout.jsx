import React from 'react';
import NavigationBar from './NavigationBar';

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0f17", color: "#cbd5e1" }}>
      <NavigationBar />
      <main>{children}</main>
    </div>
  );
}