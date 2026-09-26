// Re-exported from platforms.js so the platform/category registry stays the
// single source of truth and the import path remains stable.
const { buildPrompt } = require('./platforms');

module.exports = { buildPrompt };
