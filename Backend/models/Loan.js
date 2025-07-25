module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define('Loan', {
    loan_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    principal_amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    interest_rate: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    loan_period_years: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    monthly_emi: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'ACTIVE'
    }
  }, {
    tableName: 'Loans',
    timestamps: true 
  });

  Loan.associate = (models) => {
    Loan.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      as: 'Customer'
    });

    Loan.hasMany(models.Payment, {
      foreignKey: 'loan_id',
      as: 'Payments'
    });
  };

  return Loan;
};
