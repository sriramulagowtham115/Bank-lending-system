import React, { useState } from 'react';
import './AccountOverview.css';

function AccountOverview() {
  const [input, setInput] = useState('');
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const fetchAccount = async () => {
    setError('');
    setLoans([]);
    setLoading(true);

    const trimmed = input.trim();
    if (!trimmed) {
      setError('Please enter Customer ID or Email');
      setLoading(false);
      return;
    }

    const url = isEmail(trimmed)
      ? `http://localhost:5000/api/customers/email/${encodeURIComponent(trimmed)}/loans`
      : `http://localhost:5000/api/customers/${trimmed}/loans`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setLoans(data);
      } else {
        setError(data.error || 'Failed to fetch account overview');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Network error. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPaid = (payments) =>
    payments.reduce((sum, p) => sum + p.amount, 0);

  const calculateEMIsLeft = (loan, totalPaid) => {
    if (!loan.monthly_emi || loan.monthly_emi === 0) return 0;
    const remaining = Math.max(loan.total_amount - totalPaid, 0);
    return Math.ceil(remaining / loan.monthly_emi);
  };

  const formatCurrency = (num) =>
    Number(num || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  return (
    <div className="account-overview">
      <h2>📄 Account Overview</h2>

      <div className="input-group">
        <input
          type="text"
          placeholder="Enter Customer ID or Email"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={fetchAccount} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Loans'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loans.length > 0 && (
        <table className="loan-table">
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Principal (P)</th>
              <th>Total Amount (A)</th>
              <th>Interest (%)</th>
              <th>Interest Amount</th>
              <th>Loan Period (Y)</th>
              <th>EMI</th>
              <th>Total Paid</th>
              <th>EMIs Left</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const totalPaid = calculateTotalPaid(loan.Payments || []);
              const emisLeft = calculateEMIsLeft(loan, totalPaid);
              const interestAmount = loan.total_amount - loan.principal_amount;

              return (
                <tr key={loan.loan_id}>
                  <td>{loan.loan_id}</td>
                  <td>{formatCurrency(loan.principal_amount)}</td>
                  <td>{formatCurrency(loan.total_amount)}</td>
                  <td>{loan.interest_rate}%</td>
                  <td>{formatCurrency(interestAmount)}</td>
                  <td>{loan.loan_period_years}</td>
                  <td>{formatCurrency(loan.monthly_emi)}</td>
                  <td>{formatCurrency(totalPaid)}</td>
                  <td>{loan.status === 'PAID' ? 0 : emisLeft}</td>
                  <td>{loan.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AccountOverview;
