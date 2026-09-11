/**
 * High-Reliability Print Helper for Mobile & Desktop Web
 * Solves the Android Chrome / Safari issue where full webpage background prints instead of modal.
 */

export interface PrintOptions {
  documentTitle?: string;
  landscape?: boolean;
  pageMargin?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

/**
 * Prints a specific HTML element or HTML string in complete isolation using a hidden iframe.
 * Completely eliminates background webpage bleeding on Android Chrome & desktop browsers.
 */
export function printIsolatedElement(
  target: HTMLElement | string | null,
  options: PrintOptions = {}
): void {
  if (!target) return;

  const htmlContent = typeof target === 'string' ? target : target.innerHTML;
  const title = options.documentTitle || document.title || 'Official Receipt';
  const pageOrientation = options.landscape ? 'landscape' : 'portrait';
  const margin = options.pageMargin || '8mm 10mm 10mm 10mm';

  // 1. Create a clean hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.zIndex = '-9999';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    // Fallback to window.print with body class if iframe fails
    fallbackDirectPrint();
    return;
  }

  // 2. Collect computed stylesheets & custom print styles
  const styles = `
    @page {
      size: A4 ${pageOrientation};
      margin: ${margin};
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      background: #ffffff !important;
      color: #000000 !important;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.35;
      margin: 0;
      padding: 0;
      width: 100%;
    }
    table {
      border-collapse: collapse !important;
      width: 100% !important;
      page-break-inside: auto !important;
      font-size: 10pt;
    }
    tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    th, td {
      border: 1px solid #1e293b !important;
      padding: 4px 6px !important;
      color: #000000 !important;
    }
    thead th {
      background-color: #f1f5f9 !important;
      font-weight: 800 !important;
      text-transform: uppercase !important;
    }
    tfoot td {
      background-color: #f8fafc !important;
      font-weight: 800 !important;
      border-top: 2px solid #000000 !important;
    }
    .print\\:hidden, .no-print, button, input[type="search"], .modal-backdrop-blur {
      display: none !important;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
    }
    .font-bold { font-weight: 700 !important; }
    .font-black { font-weight: 900 !important; }
    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }
    .text-left { text-align: left !important; }
    .uppercase { text-transform: uppercase !important; }
    .capitalize { text-transform: capitalize !important; }
    .break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
    .border-b-2 { border-bottom: 2px solid #000 !important; }
    .border-b { border-bottom: 1px solid #000 !important; }
    .border-t-2 { border-top: 2px solid #000 !important; }
    .border-t { border-top: 1px solid #000 !important; }
    .border { border: 1px solid #1e293b !important; }
    .border-dashed { border-style: dashed !important; }
    .p-1 { padding: 4px !important; }
    .p-2 { padding: 8px !important; }
    .p-3 { padding: 12px !important; }
    .p-4 { padding: 16px !important; }
    .p-6 { padding: 24px !important; }
    .pt-2 { padding-top: 8px !important; }
    .pt-4 { padding-top: 16px !important; }
    .pt-8 { padding-top: 32px !important; }
    .pt-12 { padding-top: 48px !important; }
    .pb-2 { padding-bottom: 8px !important; }
    .pb-3 { padding-bottom: 12px !important; }
    .mt-1 { margin-top: 4px !important; }
    .mt-2 { margin-top: 8px !important; }
    .mb-0\\.5 { margin-bottom: 2px !important; }
    .mb-6 { margin-bottom: 24px !important; }
    .space-y-1 > * + * { margin-top: 4px !important; }
    .space-y-2 > * + * { margin-top: 8px !important; }
    .space-y-3 > * + * { margin-top: 12px !important; }
    .space-y-4 > * + * { margin-top: 16px !important; }
    .space-y-6 > * + * { margin-top: 24px !important; }
    .flex { display: flex !important; }
    .grid { display: grid !important; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
    .items-center { align-items: center !important; }
    .justify-between { justify-content: space-between !important; }
    .justify-center { justify-content: center !important; }
    .gap-2 { gap: 8px !important; }
    .gap-3 { gap: 12px !important; }
    .gap-4 { gap: 16px !important; }
    .gap-6 { gap: 24px !important; }
    .gap-8 { gap: 32px !important; }
    .gap-12 { gap: 48px !important; }
    .w-full { width: 100% !important; }
    .w-24 { width: 96px !important; }
    .w-28 { width: 112px !important; }
    .text-xs { font-size: 9pt !important; }
    .text-sm { font-size: 10.5pt !important; }
    .text-base { font-size: 12pt !important; }
    .text-lg { font-size: 13.5pt !important; }
    .text-xl { font-size: 15pt !important; }
    .text-\\[10px\\] { font-size: 7.5pt !important; }
    .text-\\[11px\\] { font-size: 8.5pt !important; }
    .text-slate-500, .text-slate-600, .text-slate-700, .text-gray-500, .text-gray-600 { color: #334155 !important; }
    .bg-slate-100, .bg-slate-50, .bg-gray-50 { background-color: #f1f5f9 !important; }
    .bg-slate-200 { background-color: #e2e8f0 !important; }
    .bg-slate-900, .bg-black, .bg-\\[\\#2D2A26\\] { background-color: #0f172a !important; color: #ffffff !important; }
  `;

  // Write content to iframe document
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="hi">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>
        <style>${styles}</style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);
  doc.close();

  // Trigger print after iframe renders
  setTimeout(() => {
    try {
      options.onBeforePrint?.();
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      options.onAfterPrint?.();
    } catch (err) {
      console.warn('Iframe print error, falling back to direct print:', err);
      fallbackDirectPrint();
    } finally {
      // Remove iframe after 3 seconds to ensure mobile OS finished spooling
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 3000);
    }
  }, 250);
}

/**
 * Direct print fallback with strict body isolation class
 */
export function fallbackDirectPrint(): void {
  document.body.classList.add('modal-printing-active');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('modal-printing-active');
  }, 1000);
}
