// src/App.jsx
import React, { useState, useEffect } from "react";
import CreateTicketDashboard from "./features/tickets/CreateTicketDashboard";
import MetricsRow from "./features/dashboard/MetricsRow";
import NeSTLogoEmblem from "./components/NeSTLogoEmblem"; 
import { styles } from "./styles/appStyles";           

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentDashboard, setCurrentDashboard] = useState("main");
  const [systemTime, setSystemTime] = useState("2026-06-19 02:38:00");

  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => { setToastMessage(null); }, 4000);
  };

  const [masterDataSearchQuery, setMasterDataSearchQuery] = useState("");

  // Pagination Registers
  const [currentPage, setCurrentPage] = useState(1);
  const [registryPage, setRegistryPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [qaGatePage, setQaGatePage] = useState(1);
  const itemsPerPage = 5;
  const galleryPerPage = 8; 

  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newProductImg, setNewProductImg] = useState("");

  const [editingItemNode, setEditingItemNode] = useState(null);
  const [productsRegistry, setProductsRegistry] = useState([]);

  // MASTER WORK ORDERS MATRIX
  const [masterTickets, setMasterTickets] = useState([
    {
      orderNo: "ORD-7712",
      initiator: "qc_inspector@natdc.org",
      status: "Open",
      createTime: "2026-06-11 08:30:00",
      closedTime: "—",
      qaApprovedBy: "—",
      items: [
        { uid: "i1", modelNo: "ITM-902", desc: "High-Density PCB Module", qty: 4, imageSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120", status: "Verified", remarks: "Continuity pass.", selectedCheckpoints: ["Dimensions & Tolerances Verification", "Solder Joint Structural Integrity"] },
        { uid: "i2", modelNo: "ITM-441", desc: "Transformer Copper Coil", qty: 2, imageSrc: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=120", status: "Rejected", remarks: "Surface scratch.", selectedCheckpoints: ["Dimensions & Tolerances Verification"] }
      ]
    },
    {
      orderNo: "ORD-8821",
      initiator: "inspector2@natdc.org",
      status: "Closed",
      createTime: "2026-06-12 10:15:00",
      closedTime: "2026-06-12 11:24:10",
      qaApprovedBy: "qa_authority@natdc.org",
      items: [
        { uid: "i3", modelNo: "ITM-108", desc: "Silicon Diode Rectifier Array", qty: 15, imageSrc: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120", status: "Verified", remarks: "All criteria compliant.", selectedCheckpoints: ["Dimensions & Tolerances Verification", "Surface Insulation & Scratch Check", "Solder Joint Structural Integrity", "Thermal Signature Boundary Pass"] }
      ]
    }
  ]);

  const [usersList, setUsersList] = useState([
    { id: 1, name: "System Administrator", email: "admin@natdc.org", isDisabled: false },
    { id: 2, name: "Quality Control Lead", email: "qc_inspector@natdc.org", isDisabled: false },
    { id: 3, name: "Component Engineer", email: "engineer@natdc.org", isDisabled: false },
    { id: 4, name: "Quality Assurance Chief", email: "qa_authority@natdc.org", isDisabled: false }
  ]);

  // HOOK 1: Pull all Work Orders and Line Items live from MySQL on Login
  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:5198/api/WorkOrders') 
        .then(response => {
          if (!response.ok) throw new Error('Failed to synchronize work orders ledger.');
          return response.json();
        })
        .then(data => {
          const mappedTickets = data.map(order => ({
            orderNo: order.orderNo,
            initiator: order.initiatorEmail,
            status: order.status,
            createTime: order.createTime ? new Date(order.createTime).toISOString().replace('T', ' ').substring(0, 19) : "—",
            closedTime: order.closedTime || "—",
            qaApprovedBy: order.qaApprovedBy || "—",
            items: (order.orderItems || []).map(item => ({
              uid: item.itemUid.toString(),
              modelNo: item.modelNo,
              desc: item.description,
              qty: item.quantity,
              partArrangement: item.partArrangement,
              status: item.qcStatus,
              remarks: item.remarks,
              imageSrc: item.imageSrc || "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400"
            }))
          }));
          setMasterTickets(mappedTickets);
        })
        .catch(error => console.error('Tickets sync failed:', error));
    }
  }, [isLoggedIn]);

  // FIXED: HOOK 2 ADDED HERE -> Automatically auto-loads all Master Registry Data on page open!
  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:5198/api/Products')
        .then(res => {
          if (!res.ok) throw new Error('Failed to synchronize catalog master data.');
          return res.json();
        })
        .then(data => {
          const mappedProducts = data.map(item => ({
            id: item.productId,
            orderNo: item.modelNo,
            desc: item.description,
            imageSrc: item.imageUrl || "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400"
          }));
          setProductsRegistry(mappedProducts);
        })
        .catch(error => console.error('Catalog synchronization failed:', error));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setCurrentPage(1);
    setRegistryPage(1);
    setUserPage(1);
    setQaGatePage(1);
  }, [searchQuery, statusFilter, currentDashboard, masterDataSearchQuery]);

  const tabs = [
    { id: "main", label: "Data Dashboard", visible: userRole === "engineer" || userRole === "admin" || userRole === "qa" || userRole === "qc" }, 
    { id: "my_tickets", label: "My Tickets", visible: userRole === "qc" },
    { id: "master_data", label: "Master Data", visible: userRole === "engineer" || userRole === "admin" },
    { id: "user_matrix", label: "User Management", visible: userRole === "admin" },
    { id: "qa_gate", label: "QA Verification Gate", visible: userRole === "qa" }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('http://localhost:5198/api/Auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password }) 
    })
    .then(response => {
      if (!response.ok) throw new Error('Access denied. Check email credentials or password matching sequence.');
      return response.json();
    })
    .then(activeUser => {
      setIsLoggedIn(true);
      setUserRole(activeUser.role);
      setEmail(activeUser.email);
      setCurrentDashboard(activeUser.role === "qa" ? "qa_gate" : "main");
      triggerNotification(`Access granted. Welcome back, ${activeUser.name}.`);
    })
    .catch(err => alert(err.message));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    setCurrentDashboard("main");
  };

  const handleSaveTicket = (orderId, compiledItemsList) => {
    const workOrderPayload = {
      orderNo: orderId,
      initiatorEmail: email,
      status: "Open"
    };

    const orderItemsPayload = compiledItemsList.map(item => ({
      orderNo: orderId,
      modelNo: item.modelNo,
      description: item.desc || "Component Manifest Data Entry",
      quantity: parseInt(item.qty) || 1,
      partArrangement: item.partArrangement || "Assembled", 
      qcStatus: item.status || "Verified",
      selectedCheckpoints: (item.selectedCheckpoints || []).join(" | "),
      remarks: item.remarks || "No log entries",
      imageSrc: item.imageSrc || null
    }));

    fetch('http://localhost:5198/api/WorkOrders/create-full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: workOrderPayload,
        items: orderItemsPayload
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to commit transaction logs. Verify schema alignments.');
      return response.json();
    })
    .then(() => {
      const newOrderRecord = {
        orderNo: orderId,
        initiator: email,
        status: "Open",
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        closedTime: "—",
        qaApprovedBy: "—",
        items: compiledItemsList
      };

      setMasterTickets([newOrderRecord, ...masterTickets]);
      setCurrentDashboard("main");
      triggerNotification(`Full Ticket ${orderId} with all item parameters safely saved!`);
    })
    .catch(err => alert(err.message));
  };

  const handleQAAction = (orderNo, approve) => {
    const qaPayload = {
      orderNo: orderNo,
      approve: approve,
      qaApprovedBy: email
    };

    fetch(`http://localhost:5198/api/WorkOrders/${orderNo}/clearance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qaPayload)
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to update work order status on the database.');
      return response.json();
    })
    .then(() => {
      setMasterTickets(prev => prev.map(order => 
        order.orderNo === orderNo ? { 
          ...order, 
          status: approve ? "Closed" : "Open", 
          closedTime: approve ? new Date().toISOString().replace('T', ' ').substring(0, 19) : "—",
          qaApprovedBy: approve ? email : "—"
        } : order
      ));
      triggerNotification(`Batch manifest ${orderNo} has been saved as ${approve ? "Approved" : "Rejected"}!`);
    })
    .catch(err => alert(err.message));
  };

  const handleAddNewUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const freshUser = { id: Date.now(), name: newUserName.trim(), email: newUserEmail.trim(), isDisabled: false };
    setUsersList([...usersList, freshUser]);
    triggerNotification(`Operator profile for "${newUserName.trim()}" successfully registered.`);
    setNewUserName("");
    setNewUserEmail("");
    setShowAddUserForm(false);
  };

  const handleNativeImageFileUpload = (e) => {
    const assetFile = e.target.files[0];
    if (!assetFile) return;
    const streamReader = new FileReader();
    streamReader.onloadend = () => {
      setNewProductImg(streamReader.result);
      triggerNotification("Product preview graphic buffered successfully.");
    };
    streamReader.readAsDataURL(assetFile);
  };

  const handleEditModalImageUpload = (e) => {
    const assetFile = e.target.files[0];
    if (!assetFile) return;
    const streamReader = new FileReader();
    streamReader.onloadend = () => {
      setEditingItemNode(prev => ({ ...prev, imageSrc: streamReader.result }));
      triggerNotification("New asset node graphic replacement loaded into frame cache.");
    };
    streamReader.readAsDataURL(assetFile);
  };

  const handleAddNewProductNode = (e) => {
    e.preventDefault();
    if (!newProductDesc.trim()) return;
    
    const targetIdCode = newProductDesc.trim().toUpperCase();
    const freshProductPayload = {
      modelNo: targetIdCode,
      description: `Master Blueprint specifications ledger row entry for item ${targetIdCode}`,
      imageUrl: newProductImg || "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400"
    };

    fetch('http://localhost:5198/api/Products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(freshProductPayload)
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to commit item entry to database storage.');
      return response.json();
    })
    .then(() => fetch('http://localhost:5198/api/Products'))
    .then(res => res.json())
    .then(data => {
      const mappedProducts = data.map(item => ({
        id: item.productId,
        orderNo: item.modelNo,
        desc: item.description,
        imageSrc: item.imageUrl
      }));
      setProductsRegistry(mappedProducts);
      triggerNotification(`Master item node asset ${targetIdCode} saved permanently inside EF Core Database!`);
      setNewProductDesc("");
      setNewProductImg("");
      setShowAddProductForm(false);
    })
    .catch(err => alert(err.message));
  };

  const handleBulkCSVUploadImport = (e) => {
    const rawFileNode = e.target.files[0];
    if (!rawFileNode) return;
    const readerInstance = new FileReader();
    readerInstance.onload = (evt) => {
      const plainTextContent = evt.target.result;
      const matrixLines = plainTextContent.split("\n");
      const loadedNodes = [];

      for (let i = 1; i < matrixLines.length; i++) {
        const structuralRow = matrixLines[i].split(",");
        if (structuralRow.length >= 2 && structuralRow[0].trim()) {
          loadedNodes.push({
            id: Date.now() + i,
            orderNo: structuralRow[0].replace(/"/g, "").trim().toUpperCase(),
            desc: structuralRow[1].replace(/"/g, "").trim(),
            imageSrc: structuralRow[2] ? structuralRow[2].replace(/"/g, "").trim() : "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400"
          });
        }
      }
      if (loadedNodes.length > 0) {
        setProductsRegistry([...loadedNodes, ...productsRegistry]);
        triggerNotification(`Manifest integration parsed: Imported ${loadedNodes.length} items from CSV.`);
      }
    };
    readerInstance.readAsText(rawFileNode);
  };

  const handleCommitInlineEdit = (e) => {
    e.preventDefault();
    setProductsRegistry(prev => prev.map(p => p.id === editingItemNode.id ? editingItemNode : p));
    triggerNotification(`Master parameters for product node ${editingItemNode.orderNo} updated successfully.`);
    setEditingItemNode(null);
  };

  const handleToggleUserStatus = (id) => {
    let targetedUserName = "";
    let willDisable = false;
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        targetedUserName = u.name;
        willDisable = !u.isDisabled;
        return { ...u, isDisabled: !u.isDisabled };
      }
      return u;
    }));
    triggerNotification(`Operator account "${targetedUserName}" has been ${willDisable ? "Deactivated" : "Activated"}.`);
  };

  const downloadExcelManifest = (order) => {
    const baselineChecklistOptions = [
      "Dimensions & Tolerances Verification",
      "Surface Insulation & Scratch Check",
      "Solder Joint Structural Integrity",
      "Thermal Signature Boundary Pass"
    ];

    let rowData = [
      ["NEST GROUP COMPREHENSIVE WORKFLOW LOG MATRIX REPORT"],
      ["Work Order Name", order.orderNo],
      ["Initiated By", order.initiator],
      ["Initiated Time", order.createTime],
      ["Closed Time", order.closedTime],
      ["Overall Status", order.status],
      ["QA Authorized Clearing Signatory", order.qaApprovedBy],
      [],
      ["DETAILED MASTER PRODUCT FLOWS REGISTRY"],
      ["Model ID Blueprint", "Item Nomenclature", "Allocated Quantity", "QC Output Status Status", "Active Component Graphics Resource Link Destination Path", "Accepted Checklist Options Passed", "Denied Checkpoints Skipped", "Inspector Diagnostic Remarks Entries"]
    ];

    order.items.forEach(item => {
      const accepted = (item.selectedCheckpoints || []).join(" | ") || "None";
      const denied = baselineChecklistOptions.filter(x => !(item.selectedCheckpoints || []).includes(x)).join(" | ") || "None";
      
      rowData.push([
        item.modelNo, item.desc, item.qty, item.status || "Verified", item.imageSrc || "—", accepted, denied, item.remarks || "—"
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rowData.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `WORKFLOW_REPORT_${order.orderNo}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    triggerNotification(`Workflow report matrix downloaded for order ${order.orderNo}`);
  };

  // Derivative Calculations & Mappings
  let filteredTickets = masterTickets.filter(t => {
    const matchesSearch = t.orderNo.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingQAOrders = masterTickets;
  let filteredRegistry = productsRegistry.filter(item => 
    item.orderNo.toLowerCase().includes(masterDataSearchQuery.toLowerCase().trim())
  );

  const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalTicketPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedRegistry = filteredRegistry.slice((registryPage - 1) * galleryPerPage, registryPage * galleryPerPage);
  const totalRegistryPages = Math.ceil(filteredRegistry.length / galleryPerPage);
  const paginatedUsers = usersList.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);
  const totalUserPages = Math.ceil(usersList.length / itemsPerPage);
  const paginatedQAOrders = pendingQAOrders.slice((qaGatePage - 1) * itemsPerPage, qaGatePage * itemsPerPage);
  const totalQAPages = Math.ceil(pendingQAOrders.length / itemsPerPage);

  if (!isLoggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <NeSTLogoEmblem />
              <h2 style={{ margin: 0, color: "#0a255c", fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>SFO TECHNOLOGIES</h2>
            </div>
            <p style={{ margin: "0", color: "#0066cc", fontSize: "11px", transform: "translateY(-4px)", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "700" }}>Secure Quality Assurance Terminal</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={styles.fieldLabel}>Corporate Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@sfotechnologies.net" style={styles.loginInput} required />
            </div>
            <div>
              <label style={styles.fieldLabel}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={styles.loginInput} required />
            </div>
            <button type="submit" style={{...styles.submitButton, width: "100%", padding: "14px"}}>Verify Terminal Identity</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appWrapper}>
      {toastMessage && (
        <div style={styles.toastContainer}>
          <div style={styles.toastCard}>
            <span style={{ fontWeight: "600", letterSpacing: "-0.1px" }}>{toastMessage}</span>
          </div>
        </div>
      )}

      <header style={styles.topBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "40px", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <NeSTLogoEmblem />
            <span style={{ fontSize: "20px", fontWeight: "800", color: "#0a255c", letterSpacing: "-0.5px" }}>SFO Technologies</span>
            <span style={{ color: "#e2e8f0", fontSize: "16px" }}>|</span>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#0066cc", textTransform: "uppercase", letterSpacing: "1.2px", backgroundColor: "#e6f0fa", padding: "5px 10px", borderRadius: "6px" }}>A NeST Group Company</span>
          </div>
          
          <nav style={{ display: "flex", height: "100%", gap: "6px" }}>
            {tabs.filter(t => t.visible).map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentDashboard(tab.id)}
                style={{
                  ...styles.tabItem,
                  borderBottom: currentDashboard === tab.id ? "3px solid #0066cc" : "3px solid transparent",
                  color: currentDashboard === tab.id ? "#0a255c" : "#64748b",
                  fontWeight: currentDashboard === tab.id ? "700" : "500",
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={styles.userProfileBadge}>
            <div style={{ color: "#0a255c", fontWeight: "700", fontSize: "13px" }}>{email}</div>
            <div style={{ color: "#0066cc", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px", marginTop: "2px" }}>CLEARANCE: {userRole.toUpperCase()}</div>
            <div style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "500", marginTop: "2px", fontFamily: "monospace" }}>{systemTime}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </header>

      <header style={styles.contentArea}>
        {currentDashboard === "main" && (
          <div style={styles.workspaceContainer}>
            <MetricsRow masterTickets={masterTickets} statusFilter={statusFilter} setStatusFilter={setStatusFilter} styles={styles} />
            <div style={{ display: "flex", justifyContent: "space-between", margin: "28px 0 16px 0", alignItems: "center" }}>
              <input type="text" placeholder="Search by work order id..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.textInput} />
              {(userRole === "qc" || userRole === "admin") && (
                <button onClick={() => setCurrentDashboard("create_ticket")} style={styles.submitButton}>+ Generate New Work Order</button>
              )}
            </div>

            <div style={styles.panel}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Order Name</th>
                    <th style={styles.th}>Initiated By</th>
                    <th style={styles.th}>Initiated Time</th>
                    <th style={styles.th}>Closed Time</th>
                    <th style={styles.th}>Status (Overall Status)</th>
                    <th style={styles.th}>View Breakdown</th>
                    <th style={styles.th}>Comprehensive Export</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTickets.length === 0 ? (
                    <tr><td colSpan="7" style={{ ...styles.td, textAlign: "center", color: "#94a3b8", padding: "32px" }}>No records matched search conditions.</td></tr>
                  ) : (
                    paginatedTickets.map((ticket, idx) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: "700", color: "#0a255c" }}>{ticket.orderNo}</td>
                        <td style={styles.td}>{ticket.initiator}</td>
                        <td style={{ ...styles.td, fontFamily: "monospace", color: "#475569" }}>{ticket.createTime}</td>
                        <td style={{ ...styles.td, fontFamily: "monospace", color: "#475569" }}>{ticket.closedTime}</td>
                        <td style={styles.td}>
                          <span style={{ 
                            ...styles.badge, 
                            backgroundColor: ticket.status === "Closed" ? "#e6f4ea" : "#fff4e5", 
                            color: ticket.status === "Closed" ? "#137333" : "#b06000" 
                          }}>
                            {ticket.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button onClick={() => setSelectedOrderDetails(ticket)} style={styles.actionInlineBtn}>View Breakdown</button>
                        </td>
                        <td style={styles.td}>
                          <button onClick={() => downloadExcelManifest(ticket)} style={{ ...styles.actionInlineBtn, backgroundColor: "#137333", color: "#ffffff", border: "none" }}>
                            ⬇ Download Excel
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div style={styles.paginationRow}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>Showing page <b>{currentPage}</b> of {totalTicketPages || 1}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={styles.paginationButton}>Previous</button>
                  <button disabled={currentPage >= totalTicketPages} onClick={() => setCurrentPage(p => p + 1)} style={styles.paginationButton}>Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentDashboard === "my_tickets" && userRole === "qc" && (
          <div style={styles.workspaceContainer}>
            <div style={styles.panel}>
              <h3 style={{ margin: "0 0 20px 0", color: "#0a255c", fontWeight: "700" }}>Inspector Workspace Logs</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Work Order ID</th>
                    <th style={styles.th}>Time Stamped</th>
                    <th style={styles.th}>Verification Status</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {masterTickets.filter(t => t.initiator === email).map((ticket, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: "700", color: "#0a255c" }}>{ticket.orderNo}</td>
                      <td style={styles.td}>{ticket.createTime}</td>
                      <td style={styles.td}><span style={{ ...styles.badge, backgroundColor: "#fff4e5", color: "#b06000" }}>{ticket.status}</span></td>
                      <td style={styles.td}><button onClick={() => setSelectedOrderDetails(ticket)} style={styles.actionInlineBtn}>Review Items</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentDashboard === "create_ticket" && (userRole === "qc" || userRole === "admin") && (
          <div style={styles.workspaceContainer}>
            <CreateTicketDashboard productsRegistry={productsRegistry} onSaveTicket={handleSaveTicket} onCancel={() => setCurrentDashboard("main")} styles={styles} />
          </div>
        )}

        {currentDashboard === "master_data" && (userRole === "engineer" || userRole === "admin") && (
          <div style={styles.workspaceContainer}>
            <div style={styles.panel}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid #e6f0fa", paddingBottom: "18px" }}>
                <h3 style={{ margin: 0, color: "#0a255c", fontSize: "18px", fontWeight: "700" }}>System Component Master Registers</h3>
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <input type="text" placeholder="Search Item ID (e.g. ITM-902)..." value={masterDataSearchQuery} onChange={(e) => setMasterDataSearchQuery(e.target.value)} style={styles.textInput} />
                  <label style={{ ...styles.submitButton, backgroundColor: "#475569", display: "inline-block", cursor: "pointer", lineHeight: "20px" }}>
                    Add as File (.csv)
                    <input type="file" accept=".csv" onChange={handleBulkCSVUploadImport} style={{ display: "none" }} />
                  </label>
                  <button onClick={() => { setShowAddProductForm(!showAddProductForm); setNewProductImg(""); }} style={styles.submitButton}>
                    {showAddProductForm ? "Hide Form Layer" : "+ Upload as Item Image"}
                  </button>
                </div>
              </div>

              {showAddProductForm && (
                <form onSubmit={handleAddNewProductNode} style={styles.embeddedFormBlock}>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "14px", color: "#0a255c", fontWeight: "700" }}>Manual Item Overlay Asset Pipeline</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={styles.fieldLabel}>Choose Image</label>
                      <input type="file" accept="image/*" onChange={handleNativeImageFileUpload} style={styles.formInlineInput} required />
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>Image Name (Item ID)</label>
                      <input type="text" placeholder="e.g. ITM-100" value={newProductDesc} onChange={(e) => setNewProductDesc(e.target.value)} style={styles.formInlineInput} required />
                    </div>
                  </div>
                  <button type="submit" style={{ ...styles.submitButton, backgroundColor: "#137333" }}>Commit Provision Node</button>
                </form>
              )}

              <div style={styles.immersiveGalleryRowGrid}>
                {filteredRegistry.length === 0 ? (
                  <div style={{ gridColumn: "span 4", padding: "60px", textAlign: "center", color: "#94a3b8" }}>No Master Component assets match your ID query criteria.</div>
                ) : (
                  paginatedRegistry.map((item) => (
                    <div key={item.id} style={styles.galleryCardContainerFrame}>
                      <div style={styles.galleryCardDisplayMediaFrame}>
                        <img src={item.imageSrc} alt={item.orderNo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={styles.galleryContentFrameMetaRow}>
                        <div style={styles.galleryItemNomenclatureTitleLabel}>{item.orderNo}</div>
                        <button onClick={() => setEditingItemNode(item)} style={styles.galleryEditIconTriggerButton}>✏️ EDIT</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={styles.paginationRow}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>Displaying Gallery Sheet <b>{registryPage}</b> of {totalRegistryPages || 1}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button disabled={registryPage === 1} onClick={() => setRegistryPage(p => p - 1)} style={styles.paginationButton}>Previous</button>
                  <button disabled={registryPage >= totalRegistryPages} onClick={() => setRegistryPage(p => p + 1)} style={styles.paginationButton}>Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentDashboard === "user_matrix" && userRole === "admin" && (
          <div style={styles.workspaceContainer}>
            <div style={styles.panel}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: "0", color: "#0a255c", fontSize: "18px", fontWeight: "700" }}>Corporate Operator Permissions Log</h3>
                <button onClick={() => setShowAddUserForm(!showAddUserForm)} style={styles.submitButton}>
                  {showAddUserForm ? "Hide Overlay Frame" : "+ Add User"}
                </button>
              </div>

              {showAddUserForm && (
                <form onSubmit={handleAddNewUser} style={styles.embeddedFormBlock}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={styles.fieldLabel}>Operator Name</label>
                      <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Full Identity Name" style={styles.formInlineInput} required />
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>Mail ID</label>
                      <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="corporate@sfotechnologies.net" style={styles.formInlineInput} required />
                    </div>
                  </div>
                  <button type="submit" style={{ ...styles.submitButton, backgroundColor: "#137333" }}>Commit Node Access Profile</button>
                </form>
              )}

              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Operator Name</th>
                    <th style={styles.th}>Their Email</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((userNode) => (
                    <tr key={userNode.id} style={{ ...styles.tr, opacity: userNode.isDisabled ? 0.5 : 1 }}>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#0f172a" }}>{userNode.name}</td>
                      <td style={{ ...styles.td, fontFamily: "monospace", color: "#475569" }}>{userNode.email}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleToggleUserStatus(userNode.id)} style={{ ...styles.toggleStatusButton, backgroundColor: userNode.isDisabled ? "#e6f4ea" : "#fce8e6", color: userNode.isDisabled ? "#137333" : "#c5221f", border: "1px solid" }}>
                          {userNode.isDisabled ? "✓ Enable Profile" : "✕ Disable Profile"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.paginationRow}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>Showing page <b>{userPage}</b> of {totalUserPages || 1}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)} style={styles.paginationButton}>Previous</button>
                  <button disabled={userPage >= totalUserPages} onClick={() => setUserPage(p => p + 1)} style={styles.paginationButton}>Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentDashboard === "qa_gate" && userRole === "qa" && (
          <div style={styles.workspaceContainer}>
            <div style={styles.panel}>
              <h3 style={{ margin: "0 0 24px 0", color: "#0a255c", fontSize: "18px", fontWeight: "700" }}>QA Final Clearance Verification Gate</h3>
              {paginatedQAOrders.length === 0 ? (
                <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>No active work batches currently awaiting gate validation keys.</div>
              ) : (
                paginatedQAOrders.map((order) => (
                  <div key={order.orderNo} style={{ border: "1px solid #cbd5e1", borderRadius: "12px", padding: "28px", marginBottom: "32px", backgroundColor: "#ffffff", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #e2e8f0", paddingBottom: "14px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "800", color: "#0a255c" }}>Order Number: {order.orderNo}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{ fontSize: "13px", color: "#0066cc", fontWeight: "600" }}>Originator Inspector: {order.initiator}</span>
                        <span style={{ ...styles.badge, backgroundColor: order.status === "Closed" ? "#e6f4ea" : "#fff4e5", color: order.status === "Closed" ? "#137333" : "#b06000" }}>
                          {order.status === "Closed" ? "Approved" : "Pending Clearance"}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                      <table style={styles.table}>
                        <thead>
                          <tr style={{ ...styles.thRow, backgroundColor: "#f8fafc" }}>
                            <th style={styles.th}>Image</th>
                            <th style={styles.th}>Model ID</th>
                            <th style={styles.th}>Product Title</th>
                            <th style={styles.th}>Qty</th>
                            <th style={styles.th}>QC Verified Checkpoints</th>
                            <th style={styles.th}>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((component, cIdx) => (
                            <tr key={cIdx} style={styles.tr}>
                              <td style={styles.td}>
                                <img src={component.imageSrc} alt="" style={{ width: "70px", height: "50px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e6f0fa" }} />
                              </td>
                              <td style={{ ...styles.td, fontWeight: "700", fontFamily: "monospace", color: "#0a255c" }}>{component.modelNo}</td>
                              <td style={styles.td}>{component.desc}</td>
                              <td style={{ ...styles.td, fontWeight: "600" }}>{component.qty} units</td>
                              <td style={styles.td}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  {(component.selectedCheckpoints || []).map((cp, cpIdx) => (
                                    <span key={cpIdx} style={{ fontSize: "11px", color: "#137333", fontWeight: "600" }}>✓ {cp}</span>
                                  ))}
                                </div>
                              </td>
                              <td style={{ ...styles.td, fontStyle: "italic", color: "#64748b" }}>{component.remarks || "No log entries"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: "flex", gap: "14px", justifyContent: "flex-end", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
                      {order.status === "Closed" ? (
                        <button onClick={() => downloadExcelManifest(order)} style={{ ...styles.submitButton, backgroundColor: "#137333", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                          ⬇ Download Excel
                        </button>
                      ) : (
                        <>
                          <button onClick={() => handleQAAction(order.orderNo, false)} style={{ ...styles.submitButton, backgroundColor: "#c5221f" }}>REJECT</button>
                          <button onClick={() => handleQAAction(order.orderNo, true)} style={{ ...styles.submitButton, backgroundColor: "#137333" }}>APPROVE</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}

              <div style={styles.paginationRow}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>Showing QA Gate Queue Page <b>{qaGatePage}</b> of {totalQAPages || 1}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button disabled={qaGatePage === 1} onClick={() => setQaGatePage(p => p - 1)} style={styles.paginationButton}>Previous</button>
                  <button disabled={qaGatePage >= totalQAPages} onClick={() => setQaGatePage(p => p + 1)} style={styles.paginationButton}>Next</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* COMPREHENSIVE MODAL FOR EDITING */}
      {editingItemNode && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContentBox, maxWidth: "480px" }}>
            <h3 style={{ margin: "0 0 18px 0", color: "#0a255c", fontSize: "18px", fontWeight: "700" }}>Update Image Asset Parameters</h3>
            <form onSubmit={handleCommitInlineEdit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ textAlign: "center", padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "2px dashed #cbd5e1" }}>
                <img src={editingItemNode.imageSrc} alt="Preview" style={{ maxWidth: "100%", maxHeight: "180px", objectFit: "contain", borderRadius: "6px" }} />
              </div>
              <div>
                <label style={styles.fieldLabel}>Choose New Image from PC</label>
                <input type="file" accept="image/*" onChange={handleEditModalImageUpload} style={styles.formInlineInput} />
              </div>
              <div>
                <label style={styles.fieldLabel}>Item ID Code</label>
                <input type="text" value={editingItemNode.orderNo} onChange={(e) => setEditingItemNode({ ...editingItemNode, orderNo: e.target.value.toUpperCase() })} style={styles.formInlineInput} required />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button type="button" onClick={() => setEditingItemNode(null)} style={{ ...styles.submitButton, backgroundColor: "#64748b" }}>Cancel</button>
                <button type="submit" style={{ ...styles.submitButton, backgroundColor: "#0a255c" }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Breakdown Drawer Modal */}
      {selectedOrderDetails && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentBox}>
            <div style={{ display: "flex", justifyContent: "space-between", fontAlign: "center", marginBottom: "24px", alignItems: "center" }}>
              <h3 style={{ color: "#0a255c", fontSize: "20px", fontWeight: "700", margin: 0 }}>Work Order Breakdown Allocation: {selectedOrderDetails.orderNo}</h3>
              <button onClick={() => setSelectedOrderDetails(null)} style={styles.closeModalCrossButton}>✕ Close</button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Model ID</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>QC Status Output</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrderDetails.items.map((item, idx) => (
                  <tr key={idx} style={styles.tr}>
                    <td style={{...styles.td, fontWeight: "700", fontFamily: "monospace"}}>{item.modelNo}</td>
                    <td style={styles.td}>{item.desc}</td>
                    <td style={styles.td}>{item.qty} units</td>
                    <td style={{ ...styles.td, color: item.status === "Verified" ? "#137333" : "#c5221f", fontWeight: "700" }}>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}