
import React, { useState } from 'react';
import './CreateCustomer.css';

function CreateCustomer() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCustomerId(null);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });

      if (response.status === 409) {
        setError('❌ Email already exists');
        return;
      }

      if (!response.ok) {
        setError('⚠️ Failed to create customer');
        return;
      }

      const data = await response.json();
      setCustomerId(data.customer_id);
      setName('');
      setEmail('');
    } catch (err) {
      setError('⚠️ Server error');
    }
  };

  return (
    <div className="form-container">
      <h2>Create Customer</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>

      {customerId && (
        <div className="result success">
          ✅ Customer created with ID: <strong>{customerId}</strong>
        </div>
      )}

      {error && (
        <div className="result error">
          {error}
        </div>
      )}
    </div>
  );
}

export default CreateCustomer;
