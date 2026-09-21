import React, { useState } from 'react';

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function VerifyCampaign({ contract }) {
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!content || !contract) return;
    setIsVerifying(true);
    setResult(null);
    try {
      const hash = await sha256(content);
      const [exists, owner, timestamp] = await contract.verifyCampaign(hash);
      if (exists) {
        setResult({
          exists: true,
          owner,
          timestamp: new Date(Number(timestamp) * 1000).toLocaleString()
        });
      } else {
        setResult({ exists: false });
      }
    } catch (err) {
      console.error(err);
      alert('Verification failed. Contract might not be connected or configured correctly.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Verify Content Authenticity</h2>
      <p className="text-sm text-gray-400 mb-4">
        Paste any marketing copy here to check if it was generated and anchored on PromoVault.
      </p>
      
      <textarea
        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-bot h-32 mb-4"
        placeholder="Paste marketing copy here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
      
      <button
        onClick={handleVerify}
        disabled={!content || !contract || isVerifying}
        className="w-full bg-bot text-black font-semibold py-3 rounded-lg hover:bg-[#00b894] transition disabled:opacity-50"
      >
        {isVerifying ? 'Verifying...' : 'Verify Content'}
      </button>

      {result && (
        <div className={`mt-6 p-4 rounded-lg border ${result.exists ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
          {result.exists ? (
            <div className="flex items-start">
              <span className="text-green-400 text-xl mr-3">✓</span>
              <div>
                <h3 className="text-green-400 font-semibold mb-1">Authentic PromoVault Content</h3>
                <p className="text-sm text-gray-300">Registered by: <span className="font-mono text-xs">{result.owner}</span></p>
                <p className="text-sm text-gray-300">Timestamp: {result.timestamp}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              <span className="text-red-400 text-xl mr-3">✗</span>
              <div>
                <h3 className="text-red-400 font-semibold mb-1">Content Not Found</h3>
                <p className="text-sm text-gray-300">This content is not anchored on the BOT Chain by PromoVault, or it has been modified.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerifyCampaign;
