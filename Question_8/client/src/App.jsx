import React, { useState, useEffect } from 'react';

export default function App() {
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('Computer Science');
  const [marks, setMarks] = useState('');

  // Status message
  const [message, setMessage] = useState('');

  // Fetch all students from Express + Sequelize API
  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const payload = {
      rollNo,
      name,
      email,
      course,
      marks: parseFloat(marks)
    };

    try {
      let res;
      if (editingId) {
        // UPDATE (PUT)
        res = await fetch(`/api/students/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // CREATE (POST)
        res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();

      if (res.ok) {
        setMessage(editingId ? 'Student updated successfully!' : 'Student added successfully!');
        resetForm();
        fetchStudents();
      } else {
        setMessage(data.error || 'Operation failed.');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    }
  };

  // Populate form for editing
  const startEdit = (student) => {
    setEditingId(student.id);
    setRollNo(student.rollNo);
    setName(student.name);
    setEmail(student.email);
    setCourse(student.course);
    setMarks(student.marks.toString());
    setMessage(`Editing student: ${student.name}`);
  };

  // Cancel edit mode
  const resetForm = () => {
    setEditingId(null);
    setRollNo('');
    setName('');
    setEmail('');
    setCourse('Computer Science');
    setMarks('');
  };

  // Delete student
  const handleDelete = async (id, studentName) => {
    if (!window.confirm(`Are you sure you want to delete student: ${studentName}?`)) return;

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage(`Student ${studentName} deleted.`);
        fetchStudents();
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '30px' }}>
      <h2>Student Records Management (Sequelize ORM + Express + React)</h2>
      <p>Demonstrating full CRUD operations for the Student collection using Sequelize.</p>

      {message && (
        <div
          style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: message.includes('failed') || message.includes('Error') ? '#ffebee' : '#e8f5e9',
            border: `1px solid ${message.includes('failed') || message.includes('Error') ? '#d32f2f' : '#4caf50'}`,
            width: '600px'
          }}
        >
          {message}
        </div>
      )}

      {/* FORM: ADD OR EDIT STUDENT */}
      <div style={{ border: '1px solid #ccc', padding: '15px', width: '620px', marginBottom: '30px' }}>
        <h3>{editingId ? 'Edit Student Details' : 'Add New Student'}</h3>
        <form onSubmit={handleSubmit}>
          <table border="0" cellPadding="6" style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td><label>Roll Number:</label></td>
                <td>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. CS-105"
                    required
                    style={{ width: '90%', padding: '6px' }}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Student Full Name:</label></td>
                <td>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    style={{ width: '90%', padding: '6px' }}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Email Address:</label></td>
                <td>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@college.edu"
                    required
                    style={{ width: '90%', padding: '6px' }}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Course / Program:</label></td>
                <td>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    style={{ width: '95%', padding: '6px' }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td><label>Total Marks (0-100):</label></td>
                <td>
                  <input
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    placeholder="e.g. 85"
                    min="0"
                    max="100"
                    step="any"
                    required
                    style={{ width: '90%', padding: '6px' }}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan="2" align="center">
                  <button
                    type="submit"
                    style={{
                      padding: '8px 18px',
                      backgroundColor: editingId ? '#007bff' : '#28a745',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '3px'
                    }}
                  >
                    {editingId ? 'Update Student Record' : 'Save Student Record'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      style={{ padding: '8px 14px', marginLeft: '10px', cursor: 'pointer' }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>

      {/* TABLE: LIST OF ALL STUDENTS */}
      <h3>Registered Students List ({students.length})</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>Roll No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Course</th>
            <th>Marks</th>
            <th>Calculated Grade</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((st) => (
              <tr key={st.id}>
                <td><strong>{st.rollNo}</strong></td>
                <td>{st.name}</td>
                <td>{st.email}</td>
                <td>{st.course}</td>
                <td>{st.marks} / 100</td>
                <td>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '3px',
                      fontWeight: 'bold',
                      backgroundColor: st.grade.startsWith('A') ? '#e8f5e9' : '#fff3e0',
                      color: st.grade.startsWith('A') ? '#2e7d32' : '#e65100'
                    }}
                  >
                    {st.grade}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => startEdit(st)}
                    style={{ padding: '4px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', marginRight: '6px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(st.id, st.name)}
                    style={{ padding: '4px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" align="center">No students found. Add a student using the form above.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
