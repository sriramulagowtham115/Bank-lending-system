import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MakePayment() {
  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [message, setMessage] = useState('');

  // Fetch loans from backend
  useEffect(() => {
    axios.get('http://localhost:5000/api/loans')
      .then(res => setLoans(res.data))
      .catch(err => {
        console.error('❌ Error fetching loans:', err);
        setMessage('Failed to load loans.');
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedLoanId || !paymentAmount) {
      setMessage('Please select a loan and enter an amount.');
      return;
    }

    axios.post('http://localhost:5000/api/loans/payment', {
      loan_id: selectedLoanId,
      payment_amount: parseFloat(paymentAmount)
    })
      .then(res => {
        setMessage('✅ Payment successful!');
        setPaymentAmount('');
        setSelectedLoanId('');
      })
      .catch(err => {
        console.error('❌ Payment failed:', err.response?.data || err.message);
        setMessage(err.response?.data?.error || 'Payment failed.');
      });
  };

  return (
    <div>
      <h2>Make Payment</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>Loan:</label>
        <select value={selectedLoanId} onChange={(e) => setSelectedLoanId(e.target.value)}>
          <option value="">-- Select Loan --</option>
          {loans.map(loan => (
            <option key={loan.loan_id} value={loan.loan_id}>
              {loan.loan_id} — {loan.Customer?.name} ({loan.Customer?.email})
            </option>
          ))}
        </select>

        <br />

        <label>Payment Amount:</label>
        <input
          type="number"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          placeholder="e.g. 2000"
        />

        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default MakePayment;
