import React from 'react';

function BotChainLogo({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 1200 1200" aria-hidden="true" focusable="false">
      <path fill="#00C58E" d="M430 160l390 200v180l-130 67V460L430 310V160Z" />
      <path fill="#00A97C" d="M820 360l120 62v170l-120 78V540l130-67V360H820Z" />
      <path fill="#00C58E" d="M430 440l390 200v180l-130 67V740l-260-150V440Z" />
      <path fill="#00A97C" d="M820 640l120 62v170l-120 78V820l130-67V640H820Z" />
      <path fill="#00C58E" d="M312 678l508 261v181H312V678Z" />
    </svg>
  );
}

export default BotChainLogo;
