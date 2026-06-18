import React from "react";

export default function MetricsRow({ masterTickets, statusFilter, setStatusFilter, styles }) {
  const totalOrders = masterTickets.length;
  const openOrders = masterTickets.filter((t) => t.status === "Open").length;
  const closedOrders = masterTickets.filter((t) => t.status === "Closed").length;

  const metricCards = [
    { label: "Total Monitored Batches", count: totalOrders, key: "All", color: "#1a3a8f", bg: "#f0f4ff" },
    { label: "Pending Quality Gates", count: openOrders, key: "Open", color: "#d97706", bg: "#fffbeb" },
    { label: "Released Clearances", count: closedOrders, key: "Closed", color: "#16a34a", bg: "#f0fdf4" },
  ];

  return (
    <div style={customStyles.rowGrid}>
      {metricCards.map((card) => {
        const isSelected = statusFilter === card.key;
        return (
          <div
            key={card.key}
            onClick={() => setStatusFilter(card.key)}
            style={{
              ...styles.panel,
              ...customStyles.card,
              borderLeft: `5px solid ${card.color}`,
              backgroundColor: isSelected ? card.bg : "#ffffff",
              borderColor: isSelected ? card.color : "#e2e8f0",
            }}
          >
            <div style={customStyles.label}>{card.label}</div>
            <div style={{ ...customStyles.count, color: card.color }}>{card.count}</div>
          </div>
        );
      })}
    </div>
  );
}

const customStyles = {
  rowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    width: "100%",
    marginBottom: "12px",
  },
  card: {
    padding: "20px",
    cursor: "pointer",
    margin: 0,
    transition: "all 0.15s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  count: {
    fontSize: "28px",
    fontWeight: "800",
  },
};