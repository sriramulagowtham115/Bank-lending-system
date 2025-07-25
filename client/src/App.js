
import React from 'react';


import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CreateCustomer from './components/CreateCustomer';
import CreateLoan from './components/CreateLoan';
import MakePayment from './components/MakePayment';
import LoanLedger from './components/LoanLedger';
import AccountOverview from './components/AccountOverview';
import './App.css'; 

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1 style={{ textAlign: 'center' }}>Bank Lending System</h1>
          <nav className="app-nav">
            <ul>
              <li><Link to="/create-customer">Create Customer</Link></li>
              <li><Link to="/create-loan">Create Loan</Link></li>
              <li><Link to="/make-payment">Make Payment</Link></li>
              <li><Link to="/loan-ledger">Loan Ledger</Link></li>
              <li><Link to="/account-overview">Account Overview</Link></li>
            </ul>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/create-customer" element={<CreateCustomer />} />
            <Route path="/create-loan" element={<CreateLoan />} />
            <Route path="/make-payment" element={<MakePayment />} />
            <Route path="/loan-ledger" element={<LoanLedger />} />
            <Route path="/account-overview" element={<AccountOverview />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
