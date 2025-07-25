const express = require('express');
const router = express.Router();
const db = require('../models');
const { Customer, Loan, Payment } = db;

// POST /api/customers - Create a customer
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and Email are required' });

    const existing = await Customer.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const customer = await Customer.create({ name, email });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create customer', details: err.message });
  }
});

// GET /api/customers - Fetch all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve customers', details: err.message });
  }
});

// GET /api/customers/email/:email - Get a customer by email
router.get('/email/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer', details: err.message });
  }
});

// GET /api/customers/email/:email/ledger - Ledger by customer email
router.get('/email/:email/ledger', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const customer = await Customer.findOne({ where: { email } });

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const loans = await Loan.findAll({
      where: { customer_id: customer.customer_id },
      include: [{ model: Payment, as: 'Payments' }]
    });

    if (!loans.length) {
      return res.status(404).json({ error: 'No loans found for customer' });
    }

    let totalPaid = 0;
    let totalLoanAmount = 0;
    let totalEMIs = 0;
    let monthlyEMI = 0;
    const allPayments = [];

    loans.forEach(loan => {
      const loanPaid = loan.Payments.reduce((sum, p) => sum + p.amount, 0);
      totalPaid += loanPaid;
      totalLoanAmount += loan.total_amount;
      totalEMIs += loan.loan_period_years * 12;
      monthlyEMI = loan.monthly_emi;
      allPayments.push(...loan.Payments);
    });

    const emisPaid = Math.floor(totalPaid / monthlyEMI);
    const emisLeft = totalEMIs - emisPaid;

    res.json({
      customer_id: customer.customer_id,
      name: customer.name,
      emi: monthlyEMI,
      totalPaid,
      remainingBalance: totalLoanAmount - totalPaid,
      emisLeft,
      Payments: allPayments
    });

  } catch (err) {
    console.error('❌ Ledger fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch ledger', details: err.message });
  }
});


router.get('/:id/loans', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: {
        model: Loan,
        as: 'Loans', 
        include: [{ model: Payment, as: 'Payments' }]
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer.Loans); 
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve loans by customer ID', details: err.message });
  }
});


router.get('/email/:email/loans', async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { email: decodeURIComponent(req.params.email) },
      include: {
        model: Loan,
        as: 'Loans', 
        include: [{ model: Payment, as: 'Payments' }]
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer.Loans); 
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve loans by email', details: err.message });
  }
});

module.exports = router;
