import React, { useState } from 'react';

const SUGGESTIONS = [
  { label: '☕ 20% Off Coffee Weekend', prompt: 'Create an engaging weekend coffee special: 20% off all handcrafted espresso drinks from 8 AM to 2 PM this Saturday and Sunday. Friendly, warm tone.' },
  { label: '🥐 Artisan Bakery Special', prompt: 'Announce fresh sourdough and almond croissants baked daily at 6 AM. Mention organic local ingredients and a limited morning batch.' },
  { label: '💇‍♀️ Boutique Salon Flash Sale', prompt: 'Offer 15% off first-time haircuts and styling sessions booked before this Friday. Highlighting personalized hair care and complimentary tea.' },
  { label: '🍕 BOGO Pizza Friday', prompt: 'Promote buy-one-get-one-free gourmet woodfired pizzas every Friday evening for dine-in and takeout. Casual and celebratory vibe.' }
];

const PLATFORMS = [
  { id: 'Instagram', label: 'Instagram', icon: '📸' },
  { id: 'Twitter/X', label: 'X / Twitter', icon: '𝕏' },
  { id: 'Flyer', label: 'Print Flyer', icon: '📄' },
  { id: 'Google Business', label: 'Google Business', icon: '📍' }
];

const CATEGORIES = [
  'General',
  'Food & Beverage',
  'Retail & Shopping',
  'Services & Wellness',
  'Events & Entertainment'
];

function PromptForm({ onGenerate, isLoading }) {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('Food & Beverage');
  const [platform, setPlatform] = useState('Instagram');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate({ prompt: prompt.trim(), category, platform });
  };

  return (
    <div className="apple-glass rounded-3xl p-6 sm:p-8 transition-all duration-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Platform Segmented Control */}
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2.5" id="platform-label">
            Target Platform
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/[0.06]" role="group" aria-labelledby="platform-label">
            {PLATFORMS.map((p) => {
              const active = platform === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  aria-pressed={active}
                  onClick={() => setPlatform(p.id)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all duration-150 active:scale-[0.98] ${
                    active
                      ? 'bg-white/10 text-white shadow-sm border border-white/10 font-semibold'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="text-sm">{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider" htmlFor="campaign-prompt">
              Marketing Campaign Brief
            </label>
            <span className="text-[11px] text-white/30 font-mono">
              {prompt.length} characters
            </span>
          </div>
          
          <div className="relative rounded-2xl bg-black/40 border border-white/[0.08] focus-within:border-bot/60 focus-within:ring-2 focus-within:ring-bot/10 transition-all duration-200">
            <textarea
               id="campaign-prompt"
               maxLength={4000}
               className="w-full bg-transparent p-4 text-sm text-white placeholder-white/25 focus:outline-none resize-none h-32 leading-relaxed"
              placeholder="Describe your promotion, discount, event, or brand story..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            {/* Quick Inspiration Chips */}
            <div className="p-3 pt-0 flex flex-wrap gap-1.5 border-t border-white/[0.04]">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-white/30 self-center mr-1">
                Presets:
              </span>
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(s.prompt)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.05] transition-all duration-150 active:scale-[0.97]"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category & Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-1/2">
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2" htmlFor="business-category">
              Business Category
            </label>
            <div className="relative">
              <select
                id="business-category"
                className="w-full appearance-none bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white/90 focus:outline-none focus:border-bot/60 focus:ring-1 focus:ring-bot/20 pr-8 cursor-pointer transition-colors"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-neutral-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 sm:self-end">
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-bot hover:bg-[#00e8ba] text-black text-sm font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] shadow-lg shadow-bot/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Generating Copy...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate Campaign Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

export default PromptForm;
