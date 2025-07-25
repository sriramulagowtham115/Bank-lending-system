import React, { useState } from 'react';
import './LoanLedger.css';

function LoanLedger() {
  const [inputMode, setInputMode] = useState('loanId');
  const [inputValue, setInputValue] = useState('');
  const [ledger, setLedger] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  const fetchLedger = async () => {
    setError('');
    setSummary(null);
    setLedger([]);
    setLoading(true);

    if (!inputValue.trim()) {
      setError('Please enter a valid Loan ID or Email');
      setLoading(false);
      return;
    }

    try {
      const url = inputMode === 'loanId'
        ? `${API}/api/loans/${inputValue}/ledger`
        : `${API}/api/customers/email/${inputValue}/ledger`;

      const res = await fetch(url);
      const data = await res.json();

      console.log("✅ Response:", data);

      if (res.ok) {
        const summaryData = {
          emi: data.emi ?? (data.loans?.[0]?.monthly_emi ?? 0),
          totalPaid: data.totalPaid ?? 0,
          remainingBalance: data.remainingBalance ?? 0,
          emisLeft: data.emisLeft ?? 0
        };

        setSummary(summaryData);

        const payments = data.Payments || (data.loans?.flatMap(loan => loan.Payments) || []);
        setLedger(payments);
      } else {
        setError(data.error || 'Failed to fetch ledger');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Loan Ledger</h2>

      <div className="radio-group">
        <label>
          <input type="radio" value="loanId" checked={inputMode === 'loanId'} onChange={() => setInputMode('loanId')} />
          Search by Loan ID
        </label>
        <label>
          <input type="radio" value="email" checked={inputMode === 'email'} onChange={() => setInputMode('email')} />
          Search by Email
        </label>
      </div>

      <div className="input-group">
        <input
          type="text"
          placeholder={inputMode === 'loanId' ? 'Enter Loan ID' : 'Enter Customer Email'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={fetchLedger} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Ledger'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {summary && (
        <div className="summary">
          <p><strong>EMI:</strong> ₹{typeof summary.emi === 'number' ? summary.emi.toFixed(2) : 'N/A'}</p>
          <p><strong>Total Paid:</strong> ₹{typeof summary.totalPaid === 'number' ? summary.totalPaid.toFixed(2) : 'N/A'}</p>
          <p><strong>Remaining Balance:</strong> ₹{typeof summary.remainingBalance === 'number' ? summary.remainingBalance.toFixed(2) : 'N/A'}</p>
          <p><strong>EMIs Left:</strong> {typeof summary.emisLeft === 'number' ? summary.emisLeft : 'N/A'}</p>
        </div>
      )}

      {ledger.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Amount</th>
              <th>Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map(payment => (
              <tr key={payment.payment_id}>
                <td>{payment.payment_id}</td>
                <td>{payment.amount}</td>
                <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LoanLedger;
