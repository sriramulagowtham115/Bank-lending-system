const db = require('./models');

async function addCreatedAtToPayments() {
  const queryInterface = db.sequelize.getQueryInterface();

  try {
    console.log('🔧 Adding created_at column to Payments...');

    // 1. Add the column WITHOUT default
    await queryInterface.addColumn('Payments', 'created_at', {
      type: db.Sequelize.DATE,
      allowNull: true,
    });

    // 2. Manually update all existing rows with current timestamp
    await db.sequelize.query(
      `UPDATE Payments SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL`
    );

    console.log('✅ Column created_at added and backfilled successfully!');
  } catch (error) {
    console.error('❌ Failed to add created_at column:', error.message);
  } finally {
    process.exit();
  }
}

addCreatedAtToPayments();
