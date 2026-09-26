// Load server/.env once, regardless of which directory the process was started
// from. A bare dotenv.config() resolves from process.cwd(), so `npm start` from
// the repository root never found server/.env and the app silently stayed in
// template-fallback mode even with a valid API key configured.
//
// dotenv never overwrites variables that are already set, so real environment
// variables (Vercel, CI, Docker) keep taking precedence over the file.
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
