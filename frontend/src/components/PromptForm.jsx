import React, { useState } from 'react';

function PromptForm({ onGenerate, isLoading }) {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('General');
  const [platform, setPlatform] = useState('Instagram');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt) return;
    onGenerate({ prompt, category, platform });
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Marketing Prompt</label>
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-bot h-32"
            placeholder="Write an Instagram caption for a 20% off weekend coffee sale..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          ></textarea>
        </div>
        
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-bot"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>General</option>
              <option>Food & Beverage</option>
              <option>Retail</option>
              <option>Services</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">Platform</label>
            <select
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-bot"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option>Instagram</option>
              <option>Twitter/X</option>
              <option>Flyer</option>
              <option>Google Business</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt}
          className="w-full bg-bot text-black font-semibold py-3 rounded-lg hover:bg-[#00b894] transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Generate Copy'}
        </button>
      </form>
    </div>
  );
}

export default PromptForm;
