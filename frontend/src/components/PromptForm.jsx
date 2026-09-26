import React, { useState } from 'react';

const SUGGESTIONS = [
  { label: 'Coffee weekend', prompt: 'Create an engaging weekend coffee special: 20% off all handcrafted espresso drinks from 8 AM to 2 PM this Saturday and Sunday. Friendly, warm tone.' },
  { label: 'Bakery morning', prompt: 'Announce fresh sourdough and almond croissants baked daily at 6 AM. Mention organic local ingredients and a limited morning batch.' },
  { label: 'Salon first visit', prompt: 'Offer 15% off first-time haircuts and styling sessions booked before this Friday. Highlighting personalized hair care and complimentary tea.' },
  { label: 'Pizza Friday', prompt: 'Promote buy-one-get-one-free gourmet woodfired pizzas every Friday evening for dine-in and takeout. Casual and celebratory vibe.' }
];

const PLATFORMS = [
  { id: 'Instagram', label: 'Instagram' },
  { id: 'Twitter/X', label: 'X / Twitter' },
  { id: 'Flyer', label: 'Print flyer' },
  { id: 'Google Business', label: 'Google Business' }
];

const CATEGORIES = [
  'General',
  'Food & Beverage',
  'Retail & Shopping',
  'Services & Wellness',
  'Events & Entertainment'
];

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2L5 13h6l-1 9 9-12h-6V2z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function PromptForm({ onGenerate, isLoading }) {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('Food & Beverage');
  const [platform, setPlatform] = useState('Instagram');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    onGenerate({ prompt: prompt.trim(), category, platform });
  };

  return (
    <section className="workspace-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b-2 border-line bg-brand px-5 py-4 text-on-brand sm:px-6">
        <div>
          <h2 className="text-[18px] font-extrabold tracking-[-0.035em]">Describe your promotion</h2>
          <p className="mt-1 text-[12px] text-on-brand">Plain words are enough. PromoVault handles the campaign formatting.</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-line bg-accent text-ink shadow-pop">
          <BoltIcon />
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
        <fieldset>
          <legend className="control-label">Where will this campaign run?</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Target platform">
            {PLATFORMS.map((option) => {
              const active = platform === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPlatform(option.id)}
                  className={`min-h-12 rounded-[12px] border-2 border-line px-3 text-[12px] font-extrabold transition duration-200 ${
                    active
                      ? 'bg-brand text-on-brand shadow-pop'
                      : 'bg-surface text-[var(--muted)] hover:-translate-y-0.5 hover:bg-surface-soft hover:shadow-pop'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="control-label mb-0" htmlFor="campaign-prompt">What are you promoting?</label>
            <span className="font-mono text-[11px] tabular-nums text-muted">{prompt.length}/4000</span>
          </div>
          <div className="rounded-[15px] border-2 border-line bg-surface focus-within:shadow-pop">
            <textarea
              id="campaign-prompt"
              maxLength={4000}
              className="min-h-36 w-full resize-none rounded-[14px] bg-transparent px-4 py-4 text-[15px] leading-relaxed text-ink placeholder-faint focus:outline-none"
              placeholder="A weekend special, a new opening, a local event, a product launch..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <div className="flex flex-wrap items-center gap-2 border-t-2 border-line px-4 py-3">
              <span className="mr-1 text-[10px] font-black uppercase tracking-[0.09em] text-muted">Try a brief</span>
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.label}
                  type="button"
                  onClick={() => setPrompt(suggestion.prompt)}
                  className="rounded-full border border-line bg-surface-soft px-3 py-1.5 text-[11px] font-bold transition hover:bg-accent"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[0.72fr_1.28fr] sm:items-end">
          <div>
            <label className="control-label" htmlFor="business-category">Your business</label>
            <div className="relative">
              <select
                id="business-category"
                className="control-input appearance-none pr-10 font-bold"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {CATEGORIES.map((option) => <option key={option}>{option}</option>)}
              </select>
              <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <button type="submit" disabled={isLoading || !prompt.trim()} className="primary-submit">
            <svg className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13 2L5 13h6l-1 9 9-12h-6V2z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            {isLoading ? 'Creating your campaign…' : 'Create my campaign'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default PromptForm;
