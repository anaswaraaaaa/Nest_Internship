import React, { useState } from "react";

export default function CreateTicketDashboard({ productsRegistry, onSaveTicket, onCancel, styles }) {
  const [workOrderNo, setWorkOrderNo] = useState("");
  const [scannedModelInput, setScannedModelInput] = useState("");
  const [stagedItems, setStagedItems] = useState([]);
  const [expandedChecklistUid, setExpandedChecklistUid] = useState(null);

  const baselineChecklistOptions = [
    "Dimensions & Tolerances Verification",
    "Surface Insulation & Scratch Check",
    "Solder Joint Structural Integrity",
    "Thermal Signature Boundary Pass"
  ];

  const handleScanItemSubmit = (e) => {
    e.preventDefault();
    const cleanInput = scannedModelInput.trim().toUpperCase();
    if (!cleanInput) return;

    const matchedPart = productsRegistry.find(p => p.orderNo.toUpperCase() === cleanInput) || {
      orderNo: cleanInput,
      desc: "Unknown Component",
      imageSrc: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=150",
      partType: "Assembled part"
    };

    const freshScannedItem = {
      uid: "scan-" + Date.now() + Math.random().toString(36).substr(2, 4),
      modelNo: matchedPart.orderNo,
      desc: matchedPart.desc,
      qty: 1,
      imageSrc: matchedPart.imageSrc,
      partType: matchedPart.partType,
      selectedCheckpoints: [...baselineChecklistOptions],
      status: "Verified",
      remarks: ""
    };

    setStagedItems([...stagedItems, freshScannedItem]);
    setScannedModelInput("");
  };

  const updateRowProperty = (uid, property, value) => {
    setStagedItems(prev => prev.map(item => {
      if (item.uid !== uid) return item;
      let updatedItem = { ...item, [property]: value };
      if (property === "selectedCheckpoints") {
        updatedItem.status = value.length === baselineChecklistOptions.length ? "Verified" : "Rejected";
      }
      return updatedItem;
    }));
  };

  const handleToggleChecklistCheckbox = (uid, point, isChecked) => {
    const currentItem = stagedItems.find(i => i.uid === uid);
    if (!currentItem) return;

    let updatedPoints = [...currentItem.selectedCheckpoints];
    if (isChecked) {
      if (!updatedPoints.includes(point)) updatedPoints.push(point);
    } else {
      updatedPoints = updatedPoints.filter(p => p !== point);
    }
    updateRowProperty(uid, "selectedCheckpoints", updatedPoints);
  };

  const handleCommitFinalBatch = () => {
    if (!workOrderNo.trim()) {
      alert("Please specify a valid Master Work Order Number before saving.");
      return;
    }
    if (stagedItems.length === 0) {
      alert("No scanned product components found in active memory cache.");
      return;
    }
    onSaveTicket(workOrderNo.trim(), stagedItems);
  };

  return (
    <div style={styles.panel}>
      <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>
        Generate New Quality Control Work Order
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", marginBottom: "24px", alignItems: "end" }}>
        <div>
          <label style={styles.fieldLabel}>Work Order Number</label>
          <input type="text" placeholder="e.g. ORD-8415" value={workOrderNo} onChange={(e) => setWorkOrderNo(e.target.value)} style={styles.formInlineInput} />
        </div>
        <form onSubmit={handleScanItemSubmit} style={{ display: "flex", gap: "12px", width: "100%" }}>
          <div style={{ flexGrow: 1 }}>
            <label style={styles.fieldLabel}>Scan Component barcode / Enter Model ID</label>
            <input type="text" placeholder="Type model code (e.g. ITM-902) and press Enter..." value={scannedModelInput} onChange={(e) => setScannedModelInput(e.target.value)} style={styles.formInlineInput} />
          </div>
          <button type="submit" style={{ ...styles.submitButton, height: "40px", marginTop: "21px" }}>Scan Component</button>
        </form>
      </div>

      <table style={{ ...styles.table, marginBottom: "24px" }}>
        <thead>
          <tr style={styles.thRow}>
            <th style={styles.th}>Work Order Number</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Quantity</th>
            <th style={styles.th}>Reference Image</th>
            <th style={styles.th}>Assembled/Loosed Part</th>
            <th style={styles.th}>Checklist</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {stagedItems.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ ...styles.td, textAlign: "center", color: "#94a3b8", padding: "30px" }}>
                Ready for scans. Input a component model number above to map the array.
              </td>
            </tr>
          ) : (
            stagedItems.map((item) => (
              <React.Fragment key={item.uid}>
                <tr style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: "700", color: "#1a3a8f" }}>{workOrderNo || "—"}</td>
                  <td style={styles.td}>{item.desc}</td>
                  <td style={styles.td}>
                    <input type="number" min="1" value={item.qty} onChange={(e) => updateRowProperty(item.uid, "qty", parseInt(e.target.value) || 1)} style={{ ...styles.formInlineInput, width: "70px", padding: "6px" }} />
                  </td>
                  <td style={styles.td}>
                    <img src={item.imageSrc} alt="Ref Asset" style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                  </td>
                  <td style={styles.td}>
                    <select value={item.partType} onChange={(e) => updateRowProperty(item.uid, "partType", e.target.value)} style={{ ...styles.formInlineInput, padding: "6px" }}>
                      <option value="Assembled part">Assembled part</option>
                      <option value="Loosed part">Loosed part</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button type="button" onClick={() => setExpandedChecklistUid(expandedChecklistUid === item.uid ? null : item.uid)} style={{ ...styles.actionInlineBtn, backgroundColor: expandedChecklistUid === item.uid ? "#0f172a" : "#f8fafc", color: expandedChecklistUid === item.uid ? "#ffffff" : "#1a3a8f" }}>
                      {expandedChecklistUid === item.uid ? "Hide Dropdown ▲" : "View Dropdown ▼"}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: item.status === "Verified" ? "#f0fdf4" : "#fff5f5", color: item.status === "Verified" ? "#16a34a" : "#e11d48" }}>{item.status}</span>
                  </td>
                  <td style={styles.td}>
                    <input type="text" placeholder="Add logging remarks..." value={item.remarks} onChange={(e) => updateRowProperty(item.uid, "remarks", e.target.value)} style={{ ...styles.formInlineInput, padding: "6px" }} />
                  </td>
                </tr>

                {expandedChecklistUid === item.uid && (
                  <tr>
                    <td colSpan="8" style={{ backgroundColor: "#f8fafc", padding: "16px 24px", borderBottom: "1px solid #cbd5e1" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>Parameter Verification Checklist for {item.modelNo}:</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          {baselineChecklistOptions.map((checkpoint, pIdx) => {
                            const isChecked = item.selectedCheckpoints.includes(checkpoint);
                            return (
                              <label key={pIdx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer", color: "#0f172a" }}>
                                <input type="checkbox" checked={isChecked} onChange={(e) => handleToggleChecklistCheckbox(item.uid, checkpoint, e.target.checked)} style={{ transform: "scale(1.15)", cursor: "pointer" }} />
                                {checkpoint}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button onClick={onCancel} style={{ ...styles.submitButton, backgroundColor: "#64748b" }}>Cancel</button>
        <button onClick={handleCommitFinalBatch} style={styles.submitButton}>Commit Work Order</button>
      </div>
    </div>
  );
}