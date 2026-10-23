import React, { useState } from 'react';
import {
  VargaChartDefinition,
  HIGH_PROFILE_CLIENT_TIERS,
  HighProfileClientTierId,
} from '../utils/shastiamshaLogic';
import { PlanetHouseInput } from './ChartUploadStudio';

export interface GitHubVedicSkillPack {
  id: string;
  packageName: string;
  title: string;
  version: string;
  description: string;
  enabled: boolean;
}

export const INITIAL_GITHUB_SKILL_PACKS: GitHubVedicSkillPack[] = [
  {
    id: 'gh-skill-private-client',
    packageName: '@vedic-foundation/private-client-concierge',
    title: 'High-Profile Executive & Family Office Advisory Dossier',
    version: '3.4.0',
    description:
      'Formats confidential C-suite briefings, boardroom Digbala directives, and shareable executive remedy plans.',
    enabled: true,
  },
  {
    id: 'gh-skill-sovereign-muhurta',
    packageName: '@vedic-foundation/sovereign-muhurta-engine',
    title: 'Sovereign Capital, M&A & Public Leadership Muhurta Timing',
    version: '2.9.0',
    description:
      'Aligns Sarvashtakavarga power zones (37-Bindu Gemini H1 / 34-Bindu Leo H3) with D-10 Dashamamsha for high-stakes decisions.',
    enabled: true,
  },
  {
    id: 'gh-skill-lahiri',
    packageName: '@vedic-foundation/lahiri-ephemeris',
    title: 'Lahiri Chitrapaksha Ayanamsa & Sidereal Precision',
    version: '2.4.0',
    description:
      'Calibrates sidereal planetary degrees (23° 47\' 56") and Bhava house cusps across North Indian charts.',
    enabled: true,
  },
  {
    id: 'gh-skill-lunar-astro',
    packageName: '@vedic-foundation/lunar-astro-dictums',
    title: 'Deepanshu Giri (Lunar Astro) Cross-Varga Dictum Pack',
    version: '3.1.0',
    description:
      'Applies D-1 to D-9/D-10/D-60 dignity inversion rules and spoken mentor synthesis.',
    enabled: true,
  },
  {
    id: 'gh-skill-bnn',
    packageName: '@vedic-foundation/bnn-trinal-circuit',
    title: 'Bhrigu Nandi Nadi (BNN) 1-5-9 Directional Trines',
    version: '1.8.2',
    description:
      'Connects elemental trines (Fire, Earth, Air, Water) for career and relationship timing.',
    enabled: true,
  },
  {
    id: 'gh-skill-blender3d',
    packageName: '@vedic-foundation/blender-3d-mandapa',
    title: 'Blender 4.x Python (bpy) & Three.js PBR Mandapa Engine',
    version: '4.0.1',
    description:
      'Generates native Blender 3D Vastu chambers and 9-Planet Navagraha sacred-geometry badges.',
    enabled: true,
  },
  {
    id: 'gh-skill-remedy-report',
    packageName: '@vedic-foundation/navagraha-remedy-report',
    title: '9-Planet Circadian Dinacharya & Natural Remedy Generator',
    version: '2.2.0',
    description:
      'Compiles time-stamped Dawn, Morning, Midday, Sunset, and Night natural remedies.',
    enabled: true,
  },
];

export interface HighProfileClientPreset {
  id: HighProfileClientTierId;
  archetypeLabel: string;
  repoSlug: string;
  title: string;
  lagnaSign: number;
  lagnaDisplay: string;
  wish: string;
  keyYogaSummary: string;
  planetHouses: PlanetHouseInput[];
}

export const HIGH_PROFILE_CLIENT_PRESETS: HighProfileClientPreset[] = [
  {
    id: 'sovereign-executive',
    archetypeLabel: 'Sovereign Founder & C-Suite Principal',
    repoSlug: 'vedic-foundation/c-suite-sovereign',
    title: 'Sovereign Founder & C-Suite Dossier',
    lagnaSign: 5,
    lagnaDisplay: 'Leo (Simha) Lagna · Sign 5',
    wish: 'IPO / Institutional Governance, Boardroom Digbala Command & Executive Vitality',
    keyYogaSummary:
      'Sun + Mercury in H1 (Budhaditya) · Mars in H10 (100% Digbala) · Jupiter in H9 (Dharma-Karmadhipati)',
    planetHouses: [
      { symbol: 'Su', house: 1 },
      { symbol: 'Mo', house: 5 },
      { symbol: 'Ma', house: 10 },
      { symbol: 'Me', house: 1 },
      { symbol: 'Ju', house: 9 },
      { symbol: 'Ve', house: 4 },
      { symbol: 'Sa', house: 7 },
      { symbol: 'Ra', house: 11 },
      { symbol: 'Ke', house: 5 },
    ],
  },
  {
    id: 'family-office',
    archetypeLabel: 'Family Office & Sovereign Wealth Principal',
    repoSlug: 'vedic-foundation/family-office-wealth',
    title: 'Family Office & Dynasty Capital Chart',
    lagnaSign: 3,
    lagnaDisplay: 'Gemini (Mithuna) Lagna · Sign 3',
    wish: 'Multi-Generational Capital Preservation, Cross-Border Asset Timing & Dynasty Harmony',
    keyYogaSummary:
      'Exalted Mercury in H4 (Bhadra Mahapurusha) · Venus in H4 (Digbala) · Jupiter in H11 · Saturn [R] in H9',
    planetHouses: [
      { symbol: 'Su', house: 3 },
      { symbol: 'Mo', house: 2 },
      { symbol: 'Ma', house: 11 },
      { symbol: 'Me', house: 4 },
      { symbol: 'Ju', house: 11 },
      { symbol: 'Ve', house: 4 },
      { symbol: 'Sa', house: 9 },
      { symbol: 'Ra', house: 5 },
      { symbol: 'Ke', house: 11 },
    ],
  },
  {
    id: 'public-eminence',
    archetypeLabel: 'Public Statesperson & Cultural Icon',
    repoSlug: 'vedic-foundation/public-eminence',
    title: 'Public Eminence & Global Statesperson Chart',
    lagnaSign: 2,
    lagnaDisplay: 'Taurus (Vrishabha) Lagna · Sign 2',
    wish: 'Global Reputation Immunity, Diplomatic Influence & Pranic Resilience',
    keyYogaSummary:
      'Exalted Moon + Venus in H1 · Sun in H10 (Digbala) · Yogakaraka Saturn in H10 (Sasa Mahapurusha)',
    planetHouses: [
      { symbol: 'Su', house: 10 },
      { symbol: 'Mo', house: 1 },
      { symbol: 'Ma', house: 9 },
      { symbol: 'Me', house: 10 },
      { symbol: 'Ju', house: 11 },
      { symbol: 'Ve', house: 1 },
      { symbol: 'Sa', house: 10 },
      { symbol: 'Ra', house: 11 },
      { symbol: 'Ke', house: 5 },
    ],
  },
];

interface GitHubRepoMetadata {
  fullName: string;
  description: string;
  stars: number;
  defaultBranch: string;
  language: string;
  updatedAt: string;
  verifiedSource: string;
}

interface GitHubSkillsUpgradePanelProps {
  userChart: VargaChartDefinition | null;
  skillPacks: GitHubVedicSkillPack[];
  onToggleSkillPack: (id: string) => void;
  clientTierId?: HighProfileClientTierId;
  onSelectClientTier?: (tierId: HighProfileClientTierId) => void;
  onImportGitHubChartPreset: (preset: {
    title: string;
    lagnaSign: number;
    wish: string;
    planetHouses: PlanetHouseInput[];
    clientTierId?: HighProfileClientTierId;
  }) => void;
}

export const GitHubSkillsUpgradePanel: React.FC<GitHubSkillsUpgradePanelProps> = ({
  userChart,
  skillPacks,
  onToggleSkillPack,
  clientTierId = 'sovereign-executive',
  onSelectClientTier,
  onImportGitHubChartPreset,
}) => {
  const [repoInput, setRepoInput] = useState<string>('vedic-foundation/jyotish-3d-skills');
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [repoMeta, setRepoMeta] = useState<GitHubRepoMetadata>({
    fullName: 'vedic-foundation/jyotish-3d-skills',
    description:
      'Vedic Foundation Open-Source Skill Pack — High-Profile Private Client Concierge, 3D North Indian Mandapa & 9-Planet Navagraha Remedy Engine.',
    stars: 108,
    defaultBranch: 'main',
    language: 'TypeScript',
    updatedAt: '2026-10-23',
    verifiedSource: 'Vedic Foundation GitHub Skill Registry',
  });
  const [activeArtifactTab, setActiveArtifactTab] = useState<'workflow' | 'manifest'>('workflow');
  const [copiedArtifact, setCopiedArtifact] = useState<boolean>(false);

  const activeTier =
    HIGH_PROFILE_CLIENT_TIERS.find((t) => t.id === clientTierId) || HIGH_PROFILE_CLIENT_TIERS[0];

  const handleInspectRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = repoInput.trim();
    if (!trimmed) return;
    setIsInspecting(true);
    try {
      const response = await fetch('/api/github/repo-inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: trimmed }),
      });
      if (response.ok) {
        const data = await response.json();
        setRepoMeta(data);
      }
    } catch {
      // Retain current repo metadata on network error
    } finally {
      setIsInspecting(false);
    }
  };

  const githubWorkflowYaml = `name: Deploy Vedic Foundation Studio to Vercel
on:
  push:
    branches: [ "${repoMeta.defaultBranch || 'main'}" ]
  workflow_dispatch:

jobs:
  verify-build-and-deploy-vercel:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Vedic Foundation Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 22 Runtime
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Vedic Foundation Astrological & Security Tests
        run: npx tsx --test src/utils/shastiamshaLogic.test.ts firestore.rules.test.ts

      - name: Build Production Bundle
        run: npm run build

      - name: Deploy to Vercel Edge (Wix Studio Frame Enabled)
        run: npx vercel pull --yes --environment=production --token=\${{ secrets.VERCEL_TOKEN }} && npx vercel deploy --prod --token=\${{ secrets.VERCEL_TOKEN }}`;

  const githubManifestJson = JSON.stringify(
    {
      application: 'Vedic Foundation',
      repository: repoMeta.fullName,
      advisoryTier: activeTier.label,
      advisoryBadge: activeTier.badgeCode,
      deploymentTarget: 'Vercel Edge + Wix Studio Velo',
      runtime: 'Node.js 22 + Vite + React 19 + Three.js WebGL',
      activeSkills: skillPacks.filter((s) => s.enabled).map((s) => `${s.packageName}@${s.version}`),
      activeChart: userChart
        ? {
            name: userChart.name,
            lagnaSign: userChart.lagnaSign,
            lagnaName: userChart.lagnaName,
            purpose: userChart.purpose,
          }
        : null,
    },
    null,
    2
  );

  const activeCodeText =
    activeArtifactTab === 'workflow' ? githubWorkflowYaml : githubManifestJson;

  const handleCopyArtifact = () => {
    navigator.clipboard?.writeText(activeCodeText);
    setCopiedArtifact(true);
    setTimeout(() => setCopiedArtifact(false), 3000);
  };

  const handleDownloadManifest = () => {
    const blob = new Blob([activeCodeText], {
      type: activeArtifactTab === 'workflow' ? 'text/yaml;charset=utf-8' : 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download =
      activeArtifactTab === 'workflow'
        ? 'deploy-vedic-foundation-vercel.yml'
        : 'vedic-foundation-skills.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="text-xs font-mono-tabular text-neutral-500">
            GitHub Skills · High-Profile Client Concierge &amp; Vercel CI/CD Architecture
          </div>
          <h3 className="text-base font-bold text-neutral-900 mt-0.5">
            Vedic Foundation — High-Profile Client GitHub Skills &amp; Advisory Hub
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure private-client GitHub skill packages, load C-Suite / Family Office dossiers, or sync custom repositories
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onImportGitHubChartPreset({
              title: `Vedic Foundation Chart (${repoMeta.fullName.split('/')[1] || 'GitHub'})`,
              lagnaSign: 5,
              wish: 'Sovereign Leadership, Research Mastery & Dharmic Prosperity',
              clientTierId: 'sovereign-executive',
              planetHouses: [
                { symbol: 'Su', house: 1 },
                { symbol: 'Mo', house: 5 },
                { symbol: 'Ma', house: 10 },
                { symbol: 'Me', house: 1 },
                { symbol: 'Ju', house: 9 },
                { symbol: 'Ve', house: 4 },
                { symbol: 'Sa', house: 7 },
                { symbol: 'Ra', house: 11 },
                { symbol: 'Ke', house: 5 },
              ],
            })
          }
          className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap"
        >
          Load GitHub Skill Chart into 3D Mandapa
        </button>
      </div>

      {/* High-Profile Client Dossier & GitHub Skill Presets */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-neutral-900">
              High-Profile Client GitHub Skill Dossiers (One-Click Executive Presets)
            </div>
            <p className="text-xs text-neutral-500">
              Select a private-client advisory tier to calibrate your 3D Mandapa, Muhurta windows, and shareable Remedy Report
            </p>
          </div>
          <span className="text-xs font-mono-tabular text-neutral-600">
            Active Tier: {activeTier.badgeCode}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {HIGH_PROFILE_CLIENT_PRESETS.map((preset) => {
            const isSelectedTier = clientTierId === preset.id;
            return (
              <div
                key={preset.id}
                className={`p-4 rounded-lg border transition-colors flex flex-col justify-between gap-3 ${
                  isSelectedTier
                    ? 'bg-neutral-50 border-neutral-900'
                    : 'bg-[#F7F7F5] border-neutral-200'
                }`}
              >
                <div>
                  <div className="text-[11px] font-mono-tabular text-neutral-500">
                    {preset.repoSlug} · {preset.lagnaDisplay}
                  </div>
                  <div className="text-sm font-bold text-neutral-900 mt-0.5">
                    {preset.archetypeLabel}
                  </div>
                  <p className="text-xs text-neutral-700 mt-1.5 leading-relaxed">
                    <strong>Objective:</strong> {preset.wish}
                  </p>
                  <p className="text-[11px] font-mono-tabular text-neutral-600 mt-1.5 leading-relaxed">
                    {preset.keyYogaSummary}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-200/80">
                  {onSelectClientTier && (
                    <button
                      type="button"
                      onClick={() => onSelectClientTier(preset.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded cursor-pointer transition-colors ${
                        isSelectedTier
                          ? 'bg-neutral-900 text-white'
                          : 'bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                      }`}
                    >
                      {isSelectedTier ? 'Active Tier' : 'Select Tier'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectClientTier?.(preset.id);
                      onImportGitHubChartPreset({
                        title: preset.title,
                        lagnaSign: preset.lagnaSign,
                        wish: preset.wish,
                        planetHouses: preset.planetHouses,
                        clientTierId: preset.id,
                      });
                    }}
                    className="flex-1 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded cursor-pointer text-center"
                  >
                    Load Executive Dossier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live GitHub Repository Inspector */}
      <form onSubmit={handleInspectRepo} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-9">
          <label
            htmlFor="github-repo-input"
            className="block text-xs font-medium text-neutral-700 mb-1"
          >
            Connect GitHub Skill Repository (owner/repo or URL)
          </label>
          <input
            id="github-repo-input"
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="e.g., vedic-foundation/jyotish-3d-skills"
            className="w-full px-3.5 py-2 text-xs font-mono-tabular bg-neutral-50 border border-neutral-300 rounded-md text-neutral-900"
          />
        </div>
        <div className="sm:col-span-3">
          <button
            type="submit"
            disabled={isInspecting}
            className="w-full px-4 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 rounded-md transition-colors cursor-pointer whitespace-nowrap"
          >
            {isInspecting ? 'Syncing GitHub...' : 'Sync GitHub Repo'}
          </button>
        </div>
      </form>

      {/* Synced Repository Summary Bar */}
      <div className="p-4 bg-[#F7F7F5] border border-neutral-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="font-mono-tabular font-bold text-neutral-900">
            {repoMeta.fullName} · Branch: {repoMeta.defaultBranch} · {repoMeta.language}
          </div>
          <p className="text-neutral-600">{repoMeta.description}</p>
        </div>
        <div className="font-mono-tabular text-neutral-500 shrink-0">
          {repoMeta.verifiedSource} · {repoMeta.stars} Stars
        </div>
      </div>

      {/* Modular GitHub Vedic Skill Packs */}
      <div>
        <div className="text-xs font-semibold text-neutral-900 mb-2.5">
          Installed Vedic Foundation GitHub Skill Packages ({skillPacks.filter((s) => s.enabled).length}/
          {skillPacks.length} Active)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skillPacks.map((skill) => (
            <div
              key={skill.id}
              onClick={() => onToggleSkillPack(skill.id)}
              className={`p-3.5 rounded-lg border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                skill.enabled
                  ? 'bg-neutral-50 border-neutral-900'
                  : 'bg-white border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <div>
                <div className="text-[11px] font-mono-tabular text-neutral-500">
                  {skill.packageName} · v{skill.version}
                </div>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">{skill.title}</div>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {skill.description}
                </p>
              </div>
              <input
                type="checkbox"
                checked={skill.enabled}
                onChange={() => {}}
                aria-label={`Toggle ${skill.title}`}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900"
              />
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Actions + Vercel CI/CD & Skill Manifest Exporter */}
      <div className="pt-4 border-t border-neutral-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md">
            {(
              [
                { id: 'workflow', label: 'GitHub Actions + Vercel (.yml)' },
                { id: 'manifest', label: 'vedic-foundation-skills.json' },
              ] as const
            ).map((tab) => {
              const isActive = activeArtifactTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveArtifactTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-150 cursor-pointer whitespace-nowrap ${
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyArtifact}
              className="px-3 py-1.5 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md cursor-pointer"
            >
              {copiedArtifact ? 'Copied to Clipboard' : 'Copy Code'}
            </button>
            <button
              type="button"
              onClick={handleDownloadManifest}
              className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 rounded-md cursor-pointer"
            >
              Download File
            </button>
          </div>
        </div>

        <pre
          key={activeArtifactTab}
          className="wix-code-transition max-h-52 overflow-y-auto p-3.5 bg-neutral-950 text-neutral-200 rounded-md border border-neutral-800 text-[11px] font-mono-tabular leading-relaxed"
        >
          {activeCodeText}
        </pre>
      </div>
    </div>
  );
};

