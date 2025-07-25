module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    customer_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'Customers',
    timestamps: true
  });

  Customer.associate = (models) => {
    Customer.hasMany(models.Loan, {
      foreignKey: 'customer_id',
      as: 'Loans'
    });
  };

  return Customer;
};
