const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Customer = require('./Customer')(sequelize, DataTypes);
db.Loan = require('./Loan')(sequelize, DataTypes);
db.Payment = require('./Payment')(sequelize, DataTypes);

// Setup associations manually
db.Customer.hasMany(db.Loan, { foreignKey: 'customer_id', as: 'Loans' });
db.Loan.belongsTo(db.Customer, { foreignKey: 'customer_id', as: 'Customer' });

db.Loan.hasMany(db.Payment, { foreignKey: 'loan_id', as: 'Payments' });
db.Payment.belongsTo(db.Loan, { foreignKey: 'loan_id', as: 'Loan' });

module.exports = db;
