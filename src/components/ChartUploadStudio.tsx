import React, { useState } from 'react';
import { NavagrahaIcon, NINE_NAVAGRAHA_SYMBOLS, NAVAGRAHA_METADATA } from './NavagrahaIcon';

export interface PlanetHouseInput {
  symbol: string;
  house: number;
}

interface ChartUploadStudioProps {
  chartTitle: string;
  onChangeChartTitle: (val: string) => void;
  lagnaSign: number;
  onChangeLagnaSign: (val: number) => void;
  userWish: string;
  onChangeUserWish: (val: string) => void;
  horizonMonths: 3 | 6 | 12;
  onChangeHorizonMonths: (val: 3 | 6 | 12) => void;
  planetHouses: PlanetHouseInput[];
  onChangePlanetHouse: (symbol: string, house: number) => void;
  uploadedPreviewUrl: string | null;
  onFileUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearUploadedFile: () => void;
  onSubmitChart: (e: React.FormEvent) => void;
  isAnalyzingChart: boolean;
  validationError: string;
  hasActiveChart: boolean;
  onReturnToActiveChart?: () => void;
  onOpenGitHubSkills?: () => void;
}

export const ChartUploadStudio: React.FC<ChartUploadStudioProps> = ({
  chartTitle,
  onChangeChartTitle,
  lagnaSign,
  onChangeLagnaSign,
  userWish,
  onChangeUserWish,
  horizonMonths,
  onChangeHorizonMonths,
  planetHouses,
  onChangePlanetHouse,
  uploadedPreviewUrl,
  onFileUploadChange,
  onClearUploadedFile,
  onSubmitChart,
  isAnalyzingChart,
  validationError,
  hasActiveChart,
  onReturnToActiveChart,
  onOpenGitHubSkills,
}) => {
  const [showPlanetCustomizer, setShowPlanetCustomizer] = useState<boolean>(false);

  return (
    <section
      aria-label="Upload or Build Your Vedic Horoscope"
      className="max-w-4xl mx-auto py-4"
    >
      {/* Clean Wix Studio Editorial Header */}
      <div className="mb-8">
        <div className="text-xs font-mono-tabular text-neutral-500 mb-2">
          Vedic Foundation · Wix Studio, Vercel Edge &amp; GitHub Skills Edition · Deepanshu Giri Methodology
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 font-display text-balance">
          Vedic Foundation — Upload Your Horoscope Chart
        </h1>
        <p className="mt-2.5 text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
          Upload a screenshot or photo of your Vedic birth chart, or configure your Ascendant and 9 Navagraha planetary placements below to launch your interactive 3D Blender Mandapa, spoken voice guidance, and personalized natural Remedy Report.
        </p>
      </div>

      {/* Main Wix Studio Clean Surface Card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 sm:p-8">
        <form onSubmit={onSubmitChart} noValidate className="space-y-6">
          {/* Step 1: Horoscope Picture / Screenshot Dropzone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="chart-image-input"
                className="block text-sm font-semibold text-neutral-900"
              >
                01. Upload Your Chart Image (Optional if entering details below)
              </label>
              {uploadedPreviewUrl && (
                <button
                  type="button"
                  onClick={onClearUploadedFile}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                >
                  Remove Image
                </button>
              )}
            </div>

            <div className="p-5 bg-[#F7F7F5] border border-dashed border-neutral-300 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-neutral-800">
                  Select a North Indian, South Indian, or Divisional chart image (.jpg, .png, .webp)
                </p>
                <p className="text-xs text-neutral-500">
                  Our AI Vision reader automatically extracts your Ascendant and 9 Navagraha planetary houses.
                </p>
              </div>

              <input
                id="chart-image-input"
                type="file"
                accept="image/*"
                onChange={onFileUploadChange}
                className="block text-xs text-neutral-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 cursor-pointer shrink-0"
              />
            </div>

            {uploadedPreviewUrl && (
              <div className="mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center gap-4">
                <img
                  src={uploadedPreviewUrl}
                  alt="Uploaded user horoscope preview"
                  referrerPolicy="no-referrer"
                  className="h-24 w-auto rounded border border-neutral-300 object-contain bg-white"
                />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-neutral-900">
                    Horoscope Image Attached
                  </div>
                  <div className="text-neutral-600">
                    Click &ldquo;Build My 3D Vedic Chart&rdquo; below to extract placements and launch the 3D Mandapa.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Native Name, Ascendant & Primary Wish */}
          <div className="pt-6 border-t border-neutral-200 space-y-4">
            <div className="text-sm font-semibold text-neutral-900">
              02. Chart Details &amp; Life Horizon Wish
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="upload-chart-title"
                  className="block text-xs font-medium text-neutral-700 mb-1.5"
                >
                  Your Name or Chart Title
                </label>
                <input
                  id="upload-chart-title"
                  type="text"
                  value={chartTitle}
                  onChange={(e) => onChangeChartTitle(e.target.value)}
                  placeholder="e.g., Aarav Sharma — Natal Rashi Chart"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label
                  htmlFor="wish-lagna-select"
                  className="block text-xs font-medium text-neutral-700 mb-1.5"
                >
                  Ascendant (Lagna) Sign
                </label>
                <select
                  id="wish-lagna-select"
                  value={lagnaSign}
                  onChange={(e) => onChangeLagnaSign(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:border-neutral-900"
                >
                  <option value={1}>#1 Aries (Mesha)</option>
                  <option value={2}>#2 Taurus (Vrishabha)</option>
                  <option value={3}>#3 Gemini (Mithuna)</option>
                  <option value={4}>#4 Cancer (Karka)</option>
                  <option value={5}>#5 Leo (Simha)</option>
                  <option value={6}>#6 Virgo (Kanya)</option>
                  <option value={7}>#7 Libra (Tula)</option>
                  <option value={8}>#8 Scorpio (Vrishchika)</option>
                  <option value={9}>#9 Sagittarius (Dhanu)</option>
                  <option value={10}>#10 Capricorn (Makara)</option>
                  <option value={11}>#11 Aquarius (Kumbha)</option>
                  <option value={12}>#12 Pisces (Meena)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="sm:col-span-2">
                <label
                  htmlFor="upload-user-wish"
                  className="block text-xs font-medium text-neutral-700 mb-1.5"
                >
                  Your Primary Life Wish or Consultation Goal
                </label>
                <input
                  id="upload-user-wish"
                  type="text"
                  value={userWish}
                  onChange={(e) => onChangeUserWish(e.target.value)}
                  placeholder="e.g., Career Leadership, Harmonious Marriage, Financial Freedom"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Plan Duration
                </span>
                <div
                  role="group"
                  aria-label="Select Plan Horizon"
                  className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-md"
                >
                  {([3, 6, 12] as const).map((m) => {
                    const isSelected = horizonMonths === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => onChangeHorizonMonths(m)}
                        aria-pressed={isSelected}
                        className={`py-1.5 text-xs font-mono-tabular font-semibold rounded transition-all duration-150 cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-neutral-900 text-white shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {m}M
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Optional 9-Planet (Navagraha) House Placement Customizer */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-neutral-900">
                  03. Customize 9 Navagraha Planetary Houses (Optional)
                </div>
                <p className="text-xs text-neutral-500">
                  Set exact Bhava houses (H1–H12) for the 9 Vedic planets if you are entering your chart manually
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPlanetCustomizer((prev) => !prev)}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                {showPlanetCustomizer ? 'Hide Planet Houses' : 'Customize 9 Planets'}
              </button>
            </div>

            {showPlanetCustomizer && (
              <div className="wix-dropdown-transition mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#F7F7F5] border border-neutral-200 rounded-lg">
                {NINE_NAVAGRAHA_SYMBOLS.map((sym) => {
                  const meta = NAVAGRAHA_METADATA[sym];
                  const currentHouse =
                    planetHouses.find((p) => p.symbol === sym)?.house ?? 1;
                  return (
                    <div
                      key={sym}
                      className="flex items-center justify-between gap-2 p-2.5 bg-white border border-neutral-200 rounded-md"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <NavagrahaIcon symbol={sym} size="sm" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-neutral-900 truncate">
                            {meta.englishName}
                          </div>
                          <div className="text-[11px] font-mono-tabular text-neutral-500">
                            {meta.sanskritName}
                          </div>
                        </div>
                      </div>

                      <select
                        aria-label={`${meta.englishName} House Placement`}
                        value={currentHouse}
                        onChange={(e) => onChangePlanetHouse(sym, Number(e.target.value))}
                        className="px-2 py-1 text-xs font-mono-tabular bg-neutral-50 border border-neutral-300 rounded text-neutral-900"
                      >
                        {Array.from({ length: 12 }, (_, idx) => idx + 1).map((h) => (
                          <option key={h} value={h}>
                            H{h}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {validationError && (
            <p
              role="alert"
              className="p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md"
            >
              {validationError}
            </p>
          )}

          {/* Submit CTA Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isAnalyzingChart}
                className="px-6 py-3 text-xs font-semibold bg-neutral-900 text-white rounded-md hover:bg-neutral-800 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
              >
                {isAnalyzingChart
                  ? 'Reading Chart & Building 3D Mandapa...'
                  : 'Build My 3D Vedic Chart'}
              </button>

              {onOpenGitHubSkills && (
                <button
                  type="button"
                  onClick={onOpenGitHubSkills}
                  className="px-4 py-3 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  GitHub Skills &amp; Vercel Hub
                </button>
              )}
            </div>

            {hasActiveChart && onReturnToActiveChart && (
              <button
                type="button"
                onClick={onReturnToActiveChart}
                className="px-4 py-2.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                Return to Active 3D Chart
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};
