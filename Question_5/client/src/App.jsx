import React, { useState, useEffect } from 'react';

// Main App Component for Question 5
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('emp_token') || '');
  const [activePage, setActivePage] = useState('profile'); // 'profile' or 'leave'

  // Login Form States
  const [loginEmpId, setLoginEmpId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Profile State (Page 1)
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Leave States (Page 2)
  const [leaves, setLeaves] = useState([]);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveMessage, setLeaveMessage] = useState('');

  // Handle Login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empid: loginEmpId, password: loginPassword })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('emp_token', data.token);
        setToken(data.token);
        setActivePage('profile');
      } else {
        setLoginError(data.message || 'Login failed.');
      }
    } catch (err) {
      setLoginError('Error connecting to server.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('emp_token');
    setToken('');
    setProfile(null);
    setLeaves([]);
  };

  // Fetch Employee Profile (Page 1)
  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch Leave List (Page 2)
  const fetchLeaves = async () => {
    try {
      const res = await fetch('/api/leaves', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Leave Application (Page 2)
  const handleAddLeave = async (e) => {
    e.preventDefault();
    setLeaveMessage('');

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date: leaveDate, reason: leaveReason })
      });
      const data = await res.json();

      if (res.ok) {
        setLeaveMessage('Leave applied successfully!');
        setLeaveDate('');
        setLeaveReason('');
        fetchLeaves(); // Refresh leaves list
      } else {
        setLeaveMessage(data.message || 'Failed to submit leave.');
      }
    } catch (err) {
      setLeaveMessage('Error submitting leave.');
    }
  };

  // Load data based on active page
  useEffect(() => {
    if (token) {
      if (activePage === 'profile') {
        fetchProfile();
      } else if (activePage === 'leave') {
        fetchLeaves();
      }
    }
  }, [token, activePage]);

  // ==========================================================
  // VIEW: If not logged in -> Show Login Form
  // ==========================================================
  if (!token) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', margin: '40px' }}>
        <h2>Employee Portal - Login (JWT Authentication)</h2>
        <p>Please enter your Employee ID and Password generated from Q4 Admin ERP.</p>

        {loginError && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', width: '380px', marginBottom: '15px', border: '1px solid #c62828' }}>
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '400px' }}>
            <tbody>
              <tr>
                <td><label>Employee ID:</label></td>
                <td>
                  <input
                    type="text"
                    value={loginEmpId}
                    onChange={(e) => setLoginEmpId(e.target.value)}
                    placeholder="e.g. EMP1001"
                    required
                    style={{ width: '90%', padding: '6px' }}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Password:</label></td>
                <td>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="e.g. password123"
                    required
                    style={{ width: '90%', padding: '6px' }}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan="2" align="center">
                  <button type="submit" style={{ padding: '8px 18px', cursor: 'pointer' }}>Login</button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        <div style={{ marginTop: '20px', padding: '10px', background: '#e3f2fd', width: '380px', border: '1px solid #2196f3' }}>
          <strong>Default Demo Employee (Pre-seeded):</strong><br />
          Employee ID: <code>EMP1001</code> | Password: <code>password123</code><br />
          <small>* Any employee created in Q4 can also log in here!</small>
        </div>
      </div>
    );
  }

  // ==========================================================
  // VIEW: If logged in -> Show Home Page with Links/Tabs
  // ==========================================================
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        <h2>Employee ERP Portal</h2>
        <div>
          <button
            onClick={() => setActivePage('profile')}
            style={{
              padding: '8px 14px',
              marginRight: '10px',
              fontWeight: activePage === 'profile' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            Page 1: Employee Profile
          </button>
          <button
            onClick={() => setActivePage('leave')}
            style={{
              padding: '8px 14px',
              marginRight: '10px',
              fontWeight: activePage === 'leave' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            Page 2: Application for Leave
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 14px', background: '#d9534f', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ==========================================================
          PAGE 1: Display Employee Profile
          ========================================================== */}
      {activePage === 'profile' && (
        <div style={{ marginTop: '20px' }}>
          <h3>Page 1: Employee Profile Details</h3>
          {profileLoading && <p>Loading profile...</p>}
          {profile && (
            <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '550px' }}>
              <tbody>
                <tr>
                  <th align="left" style={{ background: '#f5f5f5', width: '40%' }}>Employee ID</th>
                  <td><strong>{profile.empid}</strong></td>
                </tr>
                <tr>
                  <th align="left" style={{ background: '#f5f5f5' }}>Full Name</th>
                  <td>{profile.name}</td>
                </tr>
                <tr>
                  <th align="left" style={{ background: '#f5f5f5' }}>Email Address</th>
                  <td>{profile.email}</td>
                </tr>
                <tr>
                  <th align="left" style={{ background: '#f5f5f5' }}>Department</th>
                  <td>{profile.department}</td>
                </tr>
                <tr>
                  <th align="left" style={{ background: '#f5f5f5' }}>Designation</th>
                  <td>{profile.designation}</td>
                </tr>
                <tr>
                  <th align="left" style={{ background: '#f5f5f5' }}>Basic Salary</th>
                  <td>${profile.basicSalary}</td>
                </tr>
                <tr>
                  <th align="left" style={{ background: '#f5f5f5' }}>Allowances</th>
                  <td>${profile.allowances}</td>
                </tr>
                <tr>
                  <th align="left" style={{ background: '#f5f5f5' }}>Deductions</th>
                  <td>${profile.deductions}</td>
                </tr>
                <tr>
                  <th align="left" style={{ background: '#f5f5f5' }}>Net Monthly Salary</th>
                  <td><strong style={{ color: '#2e7d32', fontSize: '16px' }}>${profile.netSalary}</strong></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ==========================================================
          PAGE 2: Application for Leave (Add & List)
          ========================================================== */}
      {activePage === 'leave' && (
        <div style={{ marginTop: '20px' }}>
          <h3>Page 2: Application for Leave</h3>

          {leaveMessage && (
            <p style={{ color: leaveMessage.includes('successfully') ? 'green' : 'red', fontWeight: 'bold' }}>
              {leaveMessage}
            </p>
          )}

          {/* ADD LEAVE FORM */}
          <h4>1. Apply for Leave</h4>
          <form onSubmit={handleAddLeave}>
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '500px' }}>
              <tbody>
                <tr>
                  <td><label>Leave Date:</label></td>
                  <td>
                    <input
                      type="date"
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      required
                      style={{ width: '90%', padding: '6px' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td><label>Reason for Leave:</label></td>
                  <td>
                    <textarea
                      rows="3"
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      placeholder="e.g. Medical emergency / Family function"
                      required
                      style={{ width: '90%', padding: '6px' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" align="center">
                    <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>Submit Leave Request</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>

          <br />

          {/* LIST LEAVES TABLE */}
          <h4>2. List of Applied Leaves</h4>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '650px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th>Leave Date</th>
                <th>Reason</th>
                <th>Grant Status (Yes / No / Pending)</th>
                <th>Applied Date</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length > 0 ? (
                leaves.map((l) => (
                  <tr key={l._id}>
                    <td>{l.date}</td>
                    <td>{l.reason}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: l.granted === 'Yes' ? 'green' : l.granted === 'No' ? 'red' : '#e65100'
                        }}
                      >
                        {l.granted}
                      </span>
                    </td>
                    <td>{new Date(l.appliedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" align="center">No leave applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
