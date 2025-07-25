const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow both local and deployed frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://bank-lending-system-client.onrender.com'
  ],
  credentials: true
}));

app.use(bodyParser.json());

// Routes
const loanRoutes = require('./routes/loanRoutes');
const customerRoutes = require('./routes/customerRoutes');

app.use('/api/loans', loanRoutes);
app.use('/api/customers', customerRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('🚀 Bank Lending API is running!');
});

// Sync DB and start server
db.sequelize.sync({ force: false })
  .then(() => {
    console.log('✅ Database synced.');
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error syncing database:', err);
  });
