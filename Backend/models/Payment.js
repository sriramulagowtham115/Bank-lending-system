module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    payment_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    loan_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'Payments',
    timestamps: true 
    
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Loan, {
      foreignKey: 'loan_id',
      as: 'Loan'
    });
  };

  return Payment;
};
