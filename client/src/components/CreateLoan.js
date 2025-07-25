import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateLoan() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [loanPeriod, setLoanPeriod] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const API = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  // Fetch customers
  useEffect(() => {
    axios.get(`${API}/api/customers`)
      .then(res => setCustomers(res.data))
      .catch(err => {
        console.error('❌ Error fetching customers:', err);
        setMessage('❌ Failed to load customers.');
      });
  }, [API]);

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!selectedCustomer || !amount || !loanPeriod || !interestRate) {
      setMessage('❌ Please fill all fields.');
      return;
    }

    const newLoan = {
      customer_id: selectedCustomer,
      loan_amount: parseFloat(amount),
      loan_period_years: parseFloat(loanPeriod),
      interest_rate_yearly: parseFloat(interestRate),
    };

    try {
      setLoading(true);
      await axios.post(`${API}/api/loans`, newLoan);
      setMessage('✅ Loan created successfully!');
      setAmount('');
      setLoanPeriod('');
      setInterestRate('');
      setSelectedCustomer('');
    } catch (err) {
      console.error('❌ Error creating loan:', err);
      setMessage(err.response?.data?.error || '❌ Failed to create loan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Create New Loan</h2>

      {message && (
        <div style={{
          padding: '10px',
          backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da',
          color: message.startsWith('✅') ? '#155724' : '#721c24',
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleLoanSubmit}>
        <label>Customer:</label>
        <select
          value={selectedCustomer}
          onChange={e => setSelectedCustomer(e.target.value)}
          required
        >
          <option value="">-- Select Customer --</option>
          {customers.map(customer => (
            <option key={customer.customer_id} value={customer.customer_id}>
              {customer.name} ({customer.email})
            </option>
          ))}
        </select>

        <br /><br />

        <label>Loan Amount (₹):</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="e.g. 10000"
          min="100"
          step="100"
          required
        />

        <br /><br />

        <label>Loan Period (Years):</label>
        <input
          type="number"
          value={loanPeriod}
          onChange={e => setLoanPeriod(e.target.value)}
          placeholder="e.g. 2"
          min="1"
          required
        />

        <br /><br />

        <label>Interest Rate (% per year):</label>
        <input
          type="number"
          value={interestRate}
          onChange={e => setInterestRate(e.target.value)}
          placeholder="e.g. 10"
          min="1"
          step="0.1"
          required
        />

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Loan...' : 'Create Loan'}
        </button>
      </form>
    </div>
  );
}

export default CreateLoan;
