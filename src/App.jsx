import React, { useState, useEffect } from "react";
import CreateTicketDashboard from "./features/tickets/CreateTicketDashboard";
import MetricsRow from "./features/dashboard/MetricsRow";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("qc");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentDashboard, setCurrentDashboard] = useState("main");
  const [systemTime, setSystemTime] = useState(new Date().toISOString().replace('T', ' ').substring(0, 19));

  // Modal State for viewing items under a specific Work Order
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Pagination Configuration states (Strictly applied to prevent scrolling)
  const [currentPage, setCurrentPage] = useState(1);
  const [registryPage, setRegistryPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setSystemTime(new Date().toISOString().replace('T', ' ').substring(0, 19));
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setRegistryPage(1);
    setUserPage(1);
  }, [searchQuery, statusFilter, currentDashboard]);

  const [productsRegistry, setProductsRegistry] = useState([
    { orderNo: "ITM-902", desc: "High-Density PCB Module", imageSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop", partType: "Assembled part" },
    { orderNo: "ITM-441", desc: "Transformer Copper Coil", imageSrc: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&auto=format&fit=crop", partType: "Loosed part" }
  ]);

  const [masterTickets, setMasterTickets] = useState([
    {
      orderNo: "ORD-7712",
      initiator: "inspector1@natdc.org",
      status: "Open",
      createTime: "2026-06-11 08:30:00",
      qaRemarks: "",
      items: [
        { uid: "i1", modelNo: "ITM-902", desc: "High-Density PCB Module", qty: 1, partType: "Assembled part", imageSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120", qcChecked: true, checklist: "Verified", remarks: "Passed continuity checks" },
        { uid: "i2", modelNo: "ITM-441", desc: "Transformer Copper Coil", qty: 2, partType: "Loosed part", imageSrc: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=120", qcChecked: false, checklist: "Rejected", remarks: "Surface insulation scratch detected" }
      ]
    },
    {
      orderNo: "ORD-8821",
      initiator: "inspector2@natdc.org",
      status: "Closed",
      createTime: "2026-06-12 10:15:22",
      qaRemarks: "All components structurally verified and approved.",
      items: [
        { uid: "i3", modelNo: "ITM-902", desc: "High-Density PCB Module", qty: 5, partType: "Assembled part", imageSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120", qcChecked: true, checklist: "Verified", remarks: "Passed comprehensive stress tolerance diagnostics." }
      ]
    }
  ]);

  const [usersList, setUsersList] = useState([
    { id: 1, name: "Alpha Inspector", email: "inspector1@natdc.org", designation: "Lead QC Officer", operation: "Grid Validation", isDisabled: false },
    { id: 2, name: "Bravo Auditor", email: "inspector2@natdc.org", designation: "Senior QA Signatory", operation: "Clearance Release", isDisabled: false },
    { id: 3, name: "System Administrator", email: "admin@natdc.org", designation: "IT Infrastructure Admin", operation: "Full Root Access", isDisabled: false }
  ]);

  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserDesig, setNewUserDesig] = useState("");
  const [newUserOper, setNewUserOper] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
      setCurrentDashboard("main");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    setCurrentDashboard("main");
  };

  const handleSaveTicket = (orderId, compiledItemsList) => {
    const newOrderRecord = {
      orderNo: orderId,
      initiator: email,
      status: "Open",
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      qaRemarks: "",
      items: compiledItemsList
    };
    setMasterTickets([newOrderRecord, ...masterTickets]);
    setCurrentDashboard("main");
  };

  const handleQAAction = (orderNo, approve, remarks) => {
    setMasterTickets(prev => prev.map(order => 
      order.orderNo === orderNo ? { ...order, status: approve ? "Closed" : "Open", qaRemarks: remarks } : order
    ));
    alert(`Order ${orderNo} finalized.`);
  };

  const handleToggleUserStatus = (id) => {
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, isDisabled: !u.isDisabled } : u));
  };

  const handleAddNewUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    const freshUser = {
      id: Date.now(),
      name: newUserName,
      email: newUserEmail,
      designation: newUserDesig || "General Inspector",
      operation: newUserOper || "Standard Terminal Scan",
      isDisabled: false
    };
    setUsersList([...usersList, freshUser]);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserDesig("");
    setNewUserOper("");
    setShowAddUserForm(false);
  };

  const tabs = [
    { id: "main", label: "Data Dashboard", visible: true }, 
    { id: "my_tickets", label: "My Tickets", visible: userRole === "qc" },
    { id: "master_data", label: "Master Data", visible: userRole === "admin" || userRole === "engineer" },
    { id: "user_matrix", label: "User Management", visible: userRole === "admin" },
    { id: "qa_gate", label: "QA Verification Gate", visible: userRole !== "admin" && userRole !== "engineer" && userRole !== "qc" && userRole !== "master_data" },
  ];

  let filteredTickets = masterTickets.filter(t => {
    const matchesSearch = t.orderNo.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (currentDashboard === "my_tickets") {
    filteredTickets = filteredTickets.filter(t => t.initiator === email);
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedTickets = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalTicketPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const indexOfLastRegistry = registryPage * itemsPerPage;
  const indexOfFirstRegistry = indexOfLastRegistry - itemsPerPage;
  const paginatedRegistry = productsRegistry.slice(indexOfFirstRegistry, indexOfLastRegistry);
  const totalRegistryPages = Math.ceil(productsRegistry.length / itemsPerPage);

  const indexOfLastUser = userPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const paginatedUsers = usersList.slice(indexOfFirstUser, indexOfLastUser);
  const totalUserPages = Math.ceil(usersList.length / itemsPerPage);

  const NeSTLogoEmblem = () => (
    <svg width="42" height="28" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(5, 5)">
        <ellipse cx="55" cy="35" rx="52" ry="32" fill="#e2e8f0" transform="translate(2, 3)" />
        <ellipse cx="55" cy="35" rx="52" ry="32" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M55 3 C25 3, 5 15, 5 35 C5 52, 20 63, 40 65 C48 55, 54 42, 57 33 L38 45 L55 3 Z" fill="#1a3a8f" />
        <path d="M55 67 C85 67, 105 55, 105 35 C105 18, 90 7, 70 5 C62 15, 56 28, 53 37 L72 25 L55 67 Z" fill="#e11d48" />
        <text x="55" y="42" fontFamily="'Arial Black', Impact, sans-serif" fontSize="16" fontWeight="900" fill="#0f172a" textAnchor="middle" letterSpacing="-0.5">NeST</text>
      </g>
    </svg>
  );

  if (!isLoggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <NeSTLogoEmblem />
              <h2 style={{ margin: 0, color: "#1a3a8f", fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>NEST GROUP</h2>
            </div>
            <p style={{ margin: "0", color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "700" }}>Secure Quality Assurance Terminal</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={styles.fieldLabel}>Authentication Clearance Role</label>
              <select value={userRole} onChange={(e) => setUserRole(e.target.value)} style={styles.loginSelect}>
                <option value="qc">Quality Control (QC) Inspector</option>
                <option value="engineer">Engineer Terminal</option>
                <option value="qa">Quality Assurance (QA) Authority</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
            <div>
              <label style={styles.fieldLabel}>Corporate Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@natdc.org" style={styles.loginInput} required />
            </div>
            <div>
              <label style={styles.fieldLabel}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={styles.loginInput} required />
            </div>
            <button type="submit" style={styles.submitButton}>Verify Terminal Identity</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appWrapper}>
      <header style={styles.topBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "40px", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <NeSTLogoEmblem />
            <span style={{ fontSize: "20px", fontWeight: "800", color: "#1a3a8f", letterSpacing: "-0.5px" }}>NeST</span>
            <span style={{ color: "#cbd5e1", fontSize: "16px" }}>|</span>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>Grid Management</span>
          </div>
          
          <nav style={{ display: "flex", height: "100%", gap: "4px" }}>
            {tabs.filter(t => t.visible).map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentDashboard(tab.id)}
                style={{
                  ...styles.tabItem,
                  borderBottom: currentDashboard === tab.id ? "3px solid #1a3a8f" : "3px solid transparent",
                  color: currentDashboard === tab.id ? "#1a3a8f" : "#64748b",
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
            <div style={{ color: "#0f172a", fontWeight: "700", fontSize: "13px" }}>{email}</div>
            <div style={{ color: "#64748b", fontSize: "10px", fontWeight: "700" }}>CLEARANCE: {userRole.toUpperCase()}</div>
            <div style={{ color: "#1a3a8f", fontSize: "11px", fontWeight: "600", marginTop: "1px" }}>{systemTime}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </header>

      <main style={styles.contentArea}>
        {(currentDashboard === "main" || currentDashboard === "my_tickets") && (
          <div style={styles.workspaceContainer}>
            <MetricsRow 
              masterTickets={currentDashboard === "my_tickets" ? masterTickets.filter(t => t.initiator === email) : masterTickets} 
              statusFilter={statusFilter} 
              setStatusFilter={setStatusFilter} 
              styles={styles} 
            />
            
            <div style={{ display: "flex", justifyContent: "space-between", margin: "24px 0 16px 0", alignItems: "center" }}>
              <input type="text" placeholder="Search by work order id..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.textInput} />
              {(userRole === "qc" || userRole === "admin") && (
                <button onClick={() => setCurrentDashboard("create_ticket")} style={styles.submitButton}>+ Generate New Work Order</button>
              )}
            </div>

            <div style={styles.panel}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Work Order ID</th>
                    <th style={styles.th}>Initiator</th>
                    <th style={styles.th}>Timestamp</th>
                    <th style={styles.th}>Items Count</th>
                    <th style={styles.th}>QC Approval Status</th>
                    <th style={styles.th}>QA Approval Status</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>View Breakdown</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTickets.length === 0 ? (
                    <tr><td colSpan="8" style={{ ...styles.td, textAlign: "center", color: "#94a3b8" }}>No work records matched criteria.</td></tr>
                  ) : (
                    paginatedTickets.map((ticket, idx) => {
                      const totalItemsCount = ticket.items ? ticket.items.reduce((sum, i) => sum + i.qty, 0) : 0;
                      const hasRejectedQC = ticket.items ? ticket.items.some(i => !i.qcChecked) : false;
                      return (
                        <tr key={idx} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: "700", color: "#1a3a8f" }}>{ticket.orderNo}</td>
                          <td style={styles.td}>{ticket.initiator}</td>
                          <td style={{ ...styles.td, fontFamily: "monospace" }}>{ticket.createTime}</td>
                          <td style={styles.td}>{totalItemsCount} units</td>
                          <td style={styles.td}>
                            <span style={{ ...styles.badge, backgroundColor: hasRejectedQC ? "#fff5f5" : "#f0fdf4", color: hasRejectedQC ? "#e11d48" : "#16a34a" }}>
                              {hasRejectedQC ? "QC Discrepancy" : "QC Approved"}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ ...styles.badge, backgroundColor: ticket.status === "Closed" ? "#f0fdf4" : "#fffbeb", color: ticket.status === "Closed" ? "#16a34a" : "#d97706" }}>
                              {ticket.status === "Closed" ? "QA Released" : "QA Pending"}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ ...styles.badge, backgroundColor: ticket.status === "Closed" ? "#f1f5f9" : "#eff6ff", color: ticket.status === "Closed" ? "#475569" : "#1a3a8f" }}>
                              {ticket.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button onClick={() => setSelectedOrderDetails(ticket)} style={styles.actionInlineBtn}>View</button>
                          </td>
                        </tr>
                      );
                    })
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

        {currentDashboard === "create_ticket" && (
          <div style={styles.workspaceContainer}>
            <CreateTicketDashboard 
              productsRegistry={productsRegistry} 
              onSaveTicket={handleSaveTicket} 
              onCancel={() => setCurrentDashboard("main")} 
              styles={styles} 
            />
          </div>
        )}

        {currentDashboard === "master_data" && (
          <div style={styles.workspaceContainer}>
            <div style={styles.panel}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>System Component Master Registers</h3>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>Primary inventory structural blueprints control deck</p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => alert("Simulate CSV file scanner routine.")} style={{ ...styles.submitButton, backgroundColor: "#475569" }}>Add Item as File (.csv / .txt)</button>
                  <button onClick={() => alert("Launch configuration matrix workflow.")} style={styles.submitButton}>+ Add Item as Single</button>
                </div>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Model Blueprint ID</th>
                    <th style={styles.th}>Nomenclature Specification</th>
                    <th style={styles.th}>Classification Group</th>
                    <th style={styles.th}>High-Visibility Asset Reference</th>
                    <th style={styles.th}>Operational Control</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRegistry.map((item, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: "700" }}>{item.orderNo}</td>
                      <td style={styles.td}>{item.desc}</td>
                      <td style={styles.td}><span style={{ ...styles.badge, backgroundColor: "#f1f5f9", color: "#334155" }}>{item.partType}</span></td>
                      <td style={styles.td}>
                        <div style={styles.largeImageFrame}>
                          <img src={item.imageSrc} alt={item.desc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => alert(`Target configuration node ${item.orderNo}`)} style={styles.actionInlineBtn}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.paginationRow}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>Showing page <b>{registryPage}</b> of {totalRegistryPages || 1}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button disabled={registryPage === 1} onClick={() => setRegistryPage(p => p - 1)} style={styles.paginationButton}>Previous</button>
                  <button disabled={registryPage >= totalRegistryPages} onClick={() => setRegistryPage(p => p + 1)} style={styles.paginationButton}>Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentDashboard === "user_matrix" && (
          <div style={styles.workspaceContainer}>
            <div style={styles.panel}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ margin: "0", color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>Corporate Operator Permissions Log</h3>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>Control active lines and monitor identity status keys</p>
                </div>
                <button onClick={() => setShowAddUserForm(!showAddUserForm)} style={styles.submitButton}>
                  {showAddUserForm ? "Hide Overlay Form" : "+ Add User"}
                </button>
              </div>

              {showAddUserForm && (
                <form onSubmit={handleAddNewUser} style={styles.embeddedFormBlock}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#1a3a8f", fontWeight: "700" }}>Provision Personnel Node Matrix</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={styles.fieldLabel}>Operator Name</label>
                      <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Full Name" style={styles.formInlineInput} required />
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>Email</label>
                      <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="email@natdc.org" style={styles.formInlineInput} required />
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>Designation</label>
                      <input type="text" value={newUserDesig} onChange={(e) => setNewUserDesig(e.target.value)} placeholder="Role Level" style={styles.formInlineInput} />
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>Operation</label>
                      <input type="text" value={newUserOper} onChange={(e) => setNewUserOper(e.target.value)} placeholder="Functional Scope" style={styles.formInlineInput} />
                    </div>
                  </div>
                  <button type="submit" style={{ ...styles.submitButton, backgroundColor: "#16a34a" }}>Commit Node Access</button>
                </form>
              )}

              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Operator Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Designation</th>
                    <th style={styles.th}>Operation</th>
                    <th style={styles.th}>Account Status Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((userNode) => (
                    <tr key={userNode.id} style={{ ...styles.tr, opacity: userNode.isDisabled ? 0.5 : 1, backgroundColor: userNode.isDisabled ? "#f8fafc" : "transparent" }}>
                      <td style={{ ...styles.td, fontWeight: "600" }}>{userNode.name}</td>
                      <td style={{ ...styles.td, fontFamily: "monospace" }}>{userNode.email}</td>
                      <td style={styles.td}>{userNode.designation}</td>
                      <td style={styles.td}><span style={{ ...styles.badge, backgroundColor: "#f0fdf4", color: "#16a34a" }}>{userNode.operation}</span></td>
                      <td style={styles.td}>
                        <button 
                          onClick={() => handleToggleUserStatus(userNode.id)} 
                          style={{ 
                            ...styles.toggleStatusButton, 
                            backgroundColor: userNode.isDisabled ? "#f0fdf4" : "#fff5f5", 
                            color: userNode.isDisabled ? "#16a34a" : "#e11d48",
                            border: userNode.isDisabled ? "1px solid #bbf7d0" : "1px solid #fee2e2"
                          }}
                        >
                          {userNode.isDisabled ? "✓ Enable Profile" : "✕ Disable User"}
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

        {currentDashboard === "qa_gate" && (
          <div style={styles.workspaceContainer}>
            <QAGateView masterTickets={masterTickets} onQAAction={handleQAAction} styles={styles} />
          </div>
        )}
      </main>

      {/* Product Breakdown Modal Overlay */}
      {selectedOrderDetails && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #f1f5f9", paddingBottom: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>Work Order Blueprint Breakdown: <span style={{ color: "#1a3a8f" }}>{selectedOrderDetails.orderNo}</span></h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Initiator Node verification tracking context: {selectedOrderDetails.initiator}</p>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} style={styles.closeModalCrossButton}>✕ Close</button>
            </div>
            <table style={{ ...styles.table, marginBottom: "20px" }}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Model Component ID</th>
                  <th style={styles.th}>Nomenclature Description</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Line Classification</th>
                  <th style={styles.th}>QC Baseline Status</th>
                  <th style={styles.th}>Validation Log Notes</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrderDetails.items && selectedOrderDetails.items.map((item, keyIdx) => (
                  <tr key={keyIdx} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: "700" }}>{item.modelNo}</td>
                    <td style={styles.td}>{item.desc}</td>
                    <td style={{ ...styles.td, fontWeight: "600" }}>{item.qty} units</td>
                    <td style={styles.td}>{item.partType}</td>
                    <td style={{ ...styles.td, fontWeight: "700", color: item.qcChecked ? "#16a34a" : "#e11d48" }}>{item.checklist}</td>
                    <td style={styles.td}>{item.remarks || "No supplemental remarks logs found."}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedOrderDetails(null)} style={{ ...styles.submitButton, backgroundColor: "#475569" }}>Dismiss Log Overview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QAGateView({ masterTickets, onQAAction, styles }) {
  const [decisionRemarks, setDecisionRemarks] = useState({});
  const pendingOrders = masterTickets.filter(t => t.status === "Open");
  
  return (
    <div style={styles.panel}>
      <h3 style={{ margin: "0 0 20px 0", color: "#0f172a" }}>QA Final Clearance Gate</h3>
      {pendingOrders.length === 0 ? <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No batches awaiting confirmation.</div> : 
        pendingOrders.map((order) => (
          <div key={order.orderNo} style={{ border: "1px solid #e2e8f0", borderRadius: "6px", padding: "20px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
              <span style={{ fontWeight: "700" }}>Batch: {order.orderNo}</span>
              <span style={{ color: "#2563eb", fontWeight: "600" }}>Status: {order.status}</span>
            </div>
            <table style={{ ...styles.table, marginBottom: "16px" }}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Model</th>
                  <th style={styles.th}>Desc</th>
                  <th style={styles.th}>Qty</th>
                  <th style={styles.th}>QC Check</th>
                  <th style={styles.th}>Inspector Remarks</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} style={styles.tr}>
                    <td style={styles.td}>{item.modelNo}</td>
                    <td style={styles.td}>{item.desc}</td>
                    <td style={styles.td}>{item.qty}</td>
                    <td style={{ ...styles.td, fontWeight: "700", color: item.qcChecked ? "#16a34a" : "#e11d48" }}>{item.checklist}</td>
                    <td style={styles.td}>{item.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="text" placeholder="QA Remarks" value={decisionRemarks[order.orderNo] || ""} onChange={(e) => setDecisionRemarks({...decisionRemarks, [order.orderNo]: e.target.value})} style={styles.textInput} />
              <button onClick={() => onQAAction(order.orderNo, true, decisionRemarks[order.orderNo])} style={{ ...styles.submitButton, backgroundColor: "#16a34a" }}>Approve</button>
              <button onClick={() => onQAAction(order.orderNo, false, decisionRemarks[order.orderNo])} style={{ ...styles.submitButton, backgroundColor: "#ef4444" }}>Reject</button>
            </div>
          </div>
      ))}
    </div>
  );
}

// Enterprise Dark Blue Slate Palette (Official Corporate Aesthetic Map)
const styles = {
  appWrapper: { minHeight: "100vh", width: "100vw", backgroundColor: "#f8fafc", color: "#334155", fontFamily: 'system-ui, -apple-system, sans-serif', display: "flex", flexDirection: "column", boxSizing: "border-box" },
  loginPage: { minHeight: "100vh", width: "100vw", backgroundColor: "#0f172a", display: "flex", justifyContent: "center", alignItems: "center" },
  loginCard: { width: "420px", backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" },
  topBar: { height: "70px", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", position: "sticky", top: 0, zIndex: 100, boxSizing: "border-box" },
  tabItem: { height: "100%", padding: "0 16px", border: "none", backgroundColor: "transparent", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", transition: "all 0.15s ease" },
  userProfileBadge: { display: "flex", flexDirection: "column", fontSize: "11px", textAlign: "right" },
  logoutButton: { padding: "6px 14px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", color: "#475569", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  contentArea: { padding: "32px 40px", flexGrow: 1, display: "flex", flexDirection: "column", boxSizing: "border-box" },
  workspaceContainer: { width: "100%", display: "flex", flexDirection: "column" },
  fieldLabel: { display: "block", fontSize: "11px", textTransform: "uppercase", color: "#475569", fontWeight: "700", marginBottom: "6px" },
  textInput: { width: "100%", maxWidth: "340px", padding: "10px 14px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", color: "#0f172a" },
  loginInput: { width: "100%", padding: "12px 14px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" },
  loginSelect: { width: "100%", padding: "12px 14px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", cursor: "pointer", boxSizing: "border-box" },
  submitButton: { padding: "10px 20px", backgroundColor: "#1a3a8f", border: "none", color: "#ffffff", fontWeight: "600", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  panel: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "24px", boxSizing: "border-box", marginBottom: "20px" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thRow: { backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" },
  th: { padding: "12px 16px", fontSize: "11px", color: "#475569", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" },
  tr: { borderBottom: "1px solid #e2e8f0" },
  td: { padding: "14px 16px", fontSize: "13px", color: "#334155" },
  badge: { padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", display: "inline-block" },
  actionInlineBtn: { padding: "6px 12px", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "4px", color: "#1a3a8f", fontWeight: "700", fontSize: "12px", cursor: "pointer" },
  toggleStatusButton: { padding: "6px 12px", borderRadius: "4px", fontWeight: "700", fontSize: "12px", cursor: "pointer" },
  largeImageFrame: { width: "180px", height: "115px", borderRadius: "6px", overflow: "hidden", border: "1px solid #cbd5e1", backgroundColor: "#f1f5f9" },
  embeddedFormBlock: { padding: "20px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", marginBottom: "20px" },
  formInlineInput: { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#ffffff", fontSize: "13px", boxSizing: "border-box" },
  paginationRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" },
  paginationButton: { padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "4px", backgroundColor: "#ffffff", color: "#334155", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalContentBox: { width: "90%", maxWidth: "1200px", backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" },
  closeModalCrossButton: { background: "none", border: "none", color: "#64748b", fontWeight: "700", fontSize: "13px", cursor: "pointer" }
};