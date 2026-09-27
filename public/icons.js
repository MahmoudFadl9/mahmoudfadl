const paths={
  arrow:'<path d="M5 15 15 5M6 5h9v9"/>',
  down:'<path d="M12 4v15m-6-6 6 6 6-6"/>',
  play:'<path d="m7 4 12 8-12 8z"/>',
  pause:'<path d="M7 5v14M17 5v14"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  message:'<path d="M20 11.5a8 8 0 0 1-8 8 9 9 0 0 1-3.5-.7L4 20l1.2-4.3A8 8 0 1 1 20 11.5Z"/><path d="M8 11h8"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  close:'<path d="M5 5 19 19M19 5 5 19"/>'
  ,spark:'<path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z"/><path d="m19 17 .6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17Z"/>'
};
export const icon=name=>`<svg class="icon ${name}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]||paths.arrow}</svg>`;
