// utils/calculations.js

function calculateInterest(P, N, R) {
  return P * N * (R / 100);
}

function calculateTotalAmount(P, I) {
  return P + I;
}

function calculateEMI(total, months) {
  return parseFloat((total / months).toFixed(2));
}

module.exports = {
  calculateInterest,
  calculateTotalAmount,
  calculateEMI
};
