import React, { useState, useEffect } from 'react';
import { VargaChartDefinition } from '../utils/shastiamshaLogic';

interface WixStudioEmbedPanelProps {
  userChart: VargaChartDefinition | null;
  preferredTechniques: string[];
  horizonMonths: 3 | 6 | 12;
}

export function notifyWixParent(eventType: string, payload: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
    try {
      window.parent.postMessage(
        {
          source: 'wix-lunar-astro-studio',
          platform: 'vercel-edge',
          type: eventType,
          timestamp: new Date().toISOString(),
          payload,
        },
        '*'
      );
    } catch {
      // Ignore cross-origin frame restrictions in standalone mode
    }
  }
}

type EmbedTabMode = 'velo' | 'iframe' | 'vercel';

export const WixStudioEmbedPanel: React.FC<WixStudioEmbedPanelProps> = ({
  userChart,
  preferredTechniques,
  horizonMonths,
}) => {
  const [wixSiteUrl, setWixSiteUrl] = useState<string>(
    'https://mystudio.wixstudio.io/vedic-foundation'
  );
  const [vercelAppUrl, setVercelAppUrl] = useState<string>(
    'https://vedic-foundation.vercel.app'
  );
  const [embedMode, setEmbedMode] = useState<EmbedTabMode>('velo');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const effectiveEmbedOrigin =
    vercelAppUrl.trim() ||
    (typeof window !== 'undefined'
      ? window.location.origin
      : 'https://vedic-foundation.vercel.app');

  useEffect(() => {
    notifyWixParent('WIX_VEDIC_STUDIO_READY', {
      hasChart: Boolean(userChart),
      chartTitle: userChart?.name || null,
      lagnaName: userChart?.lagnaName || null,
      techniques: preferredTechniques,
      horizonMonths,
      vercelDeploymentUrl: effectiveEmbedOrigin,
    });
  }, [userChart, preferredTechniques, horizonMonths, effectiveEmbedOrigin]);

  const wixVeloSnippet = `// Wix Studio / Wix Velo Page Code (page.js) — Powered by Vercel Edge
// 1. Deploy Vedic Foundation to Vercel (${effectiveEmbedOrigin})
// 2. Add an HTML Component or Custom Element named #vedicChartStudio in Wix Studio Editor
// 3. Set its Source URL to: ${effectiveEmbedOrigin}

import wixWindowFrontend from 'wix-window-frontend';

$w.onReady(function () {
  const studioFrame = $w('#vedicChartStudio');

  // Send visitor preferences from Wix Studio to the Vercel-hosted 3D Vedic Chart Studio
  studioFrame.postMessage({
    type: 'WIX_INIT_CONFIG',
    siteUrl: '${wixSiteUrl.trim() || 'https://mystudio.wixstudio.io/vedic-foundation'}',
    vercelUrl: '${effectiveEmbedOrigin}',
    defaultHorizonMonths: ${horizonMonths},
  });

  // Listen for user chart uploads & Remedy Report events from the Vercel app
  studioFrame.onMessage((event) => {
    if (!event.data || event.data.source !== 'wix-lunar-astro-studio') return;

    if (event.data.type === 'WIX_CHART_UPLOADED') {
      console.log('User uploaded chart in Wix Studio (Vercel Edge):', event.data.payload);
    }
  });
});`;

  const wixIframeSnippet = `<!-- Wix Studio HTML Embed / Custom Element (Hosted on Vercel) -->
<iframe
  src="${effectiveEmbedOrigin}"
  title="Vedic Foundation — 3D Interactive Chart & Voice Guide"
  width="100%"
  height="920"
  style="border: 1px solid #E5E7EB; border-radius: 8px; background: #FFFFFF;"
  allow="microphone; clipboard-write"
  loading="lazy"
></iframe>`;

  const vercelConfigSnippet = JSON.stringify(
    {
      $schema: 'https://openapi.vercel.sh/vercel.json',
      version: 2,
      name: 'vedic-foundation',
      framework: 'vite',
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      rewrites: [
        { source: '/api/(.*)', destination: '/api/$1' },
        { source: '/((?!api/|assets/).*)', destination: '/index.html' },
      ],
      headers: [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value:
                "frame-ancestors 'self' https://*.wixstudio.io https://*.wixsite.com https://*.editorx.io https://*.vercel.app *;",
            },
          ],
        },
      ],
    },
    null,
    2
  );

  const activeSnippet =
    embedMode === 'velo'
      ? wixVeloSnippet
      : embedMode === 'iframe'
      ? wixIframeSnippet
      : vercelConfigSnippet;

  const handleCopySnippet = () => {
    navigator.clipboard?.writeText(activeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleDownloadVercelJson = () => {
    const blob = new Blob([vercelConfigSnippet], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vercel.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs: Array<{ id: EmbedTabMode; label: string }> = [
    { id: 'velo', label: 'Wix Velo Code ($w)' },
    { id: 'iframe', label: 'Wix HTML Embed' },
    { id: 'vercel', label: 'Vercel Config (vercel.json)' },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <div className="text-xs font-mono-tabular text-neutral-500">
            Vercel Edge Deployment · Wix Studio &amp; Wix Velo Integration
          </div>
          <h3 className="text-base font-bold text-neutral-900 mt-0.5">
            Deploy on Vercel &amp; Embed in Your Wix Studio Website
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pre-configured with <code className="font-mono-tabular">vercel.json</code> CSP frame-ancestors headers for seamless Wix Studio embedding and two-way Velo postMessage events
          </p>
        </div>

        {/* Segmented Control for Wix / Vercel Tabs */}
        <div
          role="tablist"
          aria-label="Wix and Vercel Integration Modes"
          className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg"
        >
          {tabs.map((tab) => {
            const isActive = embedMode === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setEmbedMode(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
        <div className="sm:col-span-4">
          <label
            htmlFor="vercel-app-url-input"
            className="block text-xs font-medium text-neutral-700 mb-1"
          >
            Vercel Production URL
          </label>
          <input
            id="vercel-app-url-input"
            type="url"
            value={vercelAppUrl}
            onChange={(e) => setVercelAppUrl(e.target.value)}
            placeholder="https://vedic-foundation.vercel.app"
            className="w-full px-3 py-2 text-xs font-mono-tabular bg-neutral-50 border border-neutral-300 rounded-md text-neutral-900"
          />
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor="wix-site-url-input"
            className="block text-xs font-medium text-neutral-700 mb-1"
          >
            Your Wix Studio Site URL
          </label>
          <input
            id="wix-site-url-input"
            type="url"
            value={wixSiteUrl}
            onChange={(e) => setWixSiteUrl(e.target.value)}
            placeholder="https://mystudio.wixstudio.io/vedic-foundation"
            className="w-full px-3 py-2 text-xs font-mono-tabular bg-neutral-50 border border-neutral-300 rounded-md text-neutral-900"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySnippet}
            className="flex-1 px-3.5 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            {copiedCode ? 'Copied Snippet' : 'Copy Code'}
          </button>
          <button
            type="button"
            onClick={handleDownloadVercelJson}
            className="px-3 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 rounded-md transition-colors cursor-pointer whitespace-nowrap"
          >
            Download vercel.json
          </button>
        </div>
      </div>

      <pre
        key={embedMode}
        className="wix-code-transition p-3.5 bg-neutral-950 text-neutral-200 rounded-md border border-neutral-800 text-[11px] font-mono-tabular overflow-x-auto leading-relaxed"
      >
        {activeSnippet}
      </pre>
    </div>
  );
};
