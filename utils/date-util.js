const startDate = new Date('2025-06-18T00:00:00+09:00');

function getCurrentWeek() {
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
}

module.exports = { getCurrentWeek };
