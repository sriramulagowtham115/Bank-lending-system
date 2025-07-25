const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../models'); 
const { calculateInterest, calculateTotalAmount, calculateEMI } = require('../utils/calculations');

// LEND: POST /api/loans
router.post('/', async (req, res) => {
  const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;

  if (!customer_id || !loan_amount || !loan_period_years || !interest_rate_yearly) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const interest = calculateInterest(loan_amount, loan_period_years, interest_rate_yearly);
    const total_amount = calculateTotalAmount(loan_amount, interest);
    const monthly_emi = calculateEMI(total_amount, loan_period_years * 12);

    const loan = await db.Loan.create({
      loan_id: uuidv4(),
      customer_id,
      principal_amount: loan_amount,
      interest_rate: interest_rate_yearly,
      total_amount,
      loan_period_years,
      monthly_emi,
      status: 'ACTIVE'
    });

    res.status(201).json({
      loan_id: loan.loan_id,
      customer_id,
      total_amount_payable: total_amount,
      monthly_emi
    });
  } catch (error) {
    console.error('❌ Loan creation error:', error);
    res.status(500).json({ error: 'Failed to create loan' });
  }
});

// PAYMENT: POST /api/loans/payment
router.post('/payment', async (req, res) => {
  const { loan_id, payment_amount } = req.body;

  if (!loan_id || !payment_amount) {
    return res.status(400).json({ error: 'Missing loan_id or payment_amount' });
  }

  try {
    const loan = await db.Loan.findByPk(loan_id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    if (loan.status === 'PAID') {
      return res.status(400).json({ error: 'Loan already fully paid' });
    }

    await db.Payment.create({
      payment_id: uuidv4(),
      loan_id,
      amount: payment_amount,
      payment_type: 'EMI',
      payment_date: new Date()
    });

    const payments = await db.Payment.findAll({ where: { loan_id } });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    if (totalPaid >= loan.total_amount) {
      loan.status = 'PAID';
      await loan.save();
    }

    res.status(200).json({
      message: 'Payment recorded successfully',
      totalPaid,
      remaining: Math.max(loan.total_amount - totalPaid, 0),
      loanStatus: loan.status
    });
  } catch (error) {
    console.error('❌ Payment error:', error);
    res.status(500).json({ error: 'Failed to record payment', details: error.message });
  }
});

// LEDGER: GET /api/loans/:loan_id/ledger
router.get('/:loan_id/ledger', async (req, res) => {
  const { loan_id } = req.params;

  try {
    const loan = await db.Loan.findByPk(loan_id, {
      include: [
        {
          model: db.Payment,
          as: 'Payments',
          order: [['payment_date', 'ASC']]
        }
      ]
    });

    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    const totalPaid = loan.Payments.reduce((sum, p) => sum + p.amount, 0);
    const emi = loan.monthly_emi;
    const totalEmis = Math.ceil(loan.loan_period_years * 12);
    const emisPaid = Math.floor(totalPaid / emi);
    const emisLeft = totalEmis - emisPaid;
    const remainingBalance = loan.total_amount - totalPaid;

    res.json({
      loan_id: loan.loan_id,
      emi,
      totalPaid,
      remainingBalance,
      emisLeft,
      Payments: loan.Payments
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ledger', details: err.message });
  }
});

// GET all loans
router.get('/', async (req, res) => {
  try {
    const loans = await db.Loan.findAll({
      include: [{ model: db.Customer, as: 'Customer', attributes: ['name', 'email'] }]
    });
    res.status(200).json(loans);
  } catch (error) {
    console.error('❌ Error fetching loans:', error);
    res.status(500).json({ error: 'Failed to load loans', details: error.message });
  }
});

// GET all loans of a customer
router.get('/customer/:customer_id', async (req, res) => {
  try {
    const loans = await db.Loan.findAll({
      where: { customer_id: req.params.customer_id },
      include: [
        {
          model: db.Payment,
          as: 'Payments',
          attributes: ['payment_id', 'amount', 'payment_date', 'created_at']
        },
        {
          model: db.Customer,
          as: 'Customer',
          attributes: ['name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(loans);
  } catch (err) {
    console.error('❌ Error fetching customer loans:', err);
    res.status(500).json({ error: 'Failed to fetch loans', details: err.message });
  }
});

module.exports = router;
