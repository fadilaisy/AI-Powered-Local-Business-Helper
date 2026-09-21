import React from 'react';
import { CONFIG } from '../lib/config';

function GeneratedCopy({ generatedText, contentHash, onAnchor, isAnchoring, txHash }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    alert('Copied to clipboard!');
  };

  const explorerUrl = CONFIG[CONFIG.NETWORK].blockExplorerUrls[0];

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-bot mb-2">Generated Marketing Copy</h3>
      
      <div className="bg-gray-900 p-4 rounded-lg text-gray-200 whitespace-pre-wrap">
        {generatedText}
      </div>
      
      {contentHash && (
        <div className="text-xs text-gray-500 font-mono">
          Content Hash: {contentHash.slice(0, 10)}...{contentHash.slice(-8)}
        </div>
      )}

      <div className="flex space-x-4 pt-2">
        <button
          onClick={handleCopy}
          className="flex-1 border border-bot text-bot font-semibold py-2 rounded-lg hover:bg-bot/10 transition"
        >
          Copy to Clipboard
        </button>
        
        {!txHash ? (
          <button
            onClick={onAnchor}
            disabled={isAnchoring}
            className="flex-1 bg-bot text-black font-semibold py-2 rounded-lg hover:bg-[#00b894] transition disabled:opacity-50 flex justify-center items-center"
          >
            {isAnchoring ? 'Anchoring...' : 'Anchor on BOT Chain'}
          </button>
        ) : (
          <a
            href={`${explorerUrl}tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-700 text-bot font-semibold py-2 rounded-lg hover:bg-gray-600 transition flex justify-center items-center text-center"
          >
            View on Explorer ↗
          </a>
        )}
      </div>
    </div>
  );
}

export default GeneratedCopy;
