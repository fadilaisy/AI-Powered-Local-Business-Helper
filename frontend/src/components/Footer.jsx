import React from 'react';

function Footer() {
  return (
    <footer className="w-full max-w-4xl p-6 mt-8 border-t border-gray-800 text-center text-sm text-gray-500">
      <p className="mb-2">Built on <span className="text-bot font-semibold">BOT Chain</span></p>
      <div className="flex justify-center space-x-4 mb-4">
        <a href="https://botchain.ai" target="_blank" rel="noopener noreferrer" className="hover:text-bot transition">botchain.ai</a>
        <span>|</span>
        <a href="https://scan.botchain.ai" target="_blank" rel="noopener noreferrer" className="hover:text-bot transition">scan.botchain.ai</a>
      </div>
      <p>&copy; {new Date().getFullYear()} PromoVault. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
