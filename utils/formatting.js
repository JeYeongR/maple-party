const formatCombatPower = (num) => {
  if (typeof num !== 'number' || isNaN(num) || num === 0) {
    return '0';
  }

  const units = ['', '만', '억', '조', '경'];
  const parts = [];
  let tempNum = num;

  while (tempNum > 0) {
    parts.push(tempNum % 10000);
    tempNum = Math.floor(tempNum / 10000);
  }

  const result = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] > 0) {
      result.push(`${parts[i]}${units[i]}`);
    }
  }

  return result.reverse().join(' ');
};

module.exports = { formatCombatPower };