import React from 'react';
import {
  HOUSE_DETAILS,
  PLANET_PLACEMENTS,
  CROSS_VARGA_MATRIX,
  VargaChartDefinition,
  PlanetPlacement,
} from '../utils/shastiamshaLogic';

interface PlanetInspectorProps {
  vargaChart: VargaChartDefinition;
  selectedHouse: number;
  selectedPlanetSymbol: string | null;
  onSelectHouse: (house: number) => void;
  onSelectPlanet: (symbol: string, house: number) => void;
}

export const PlanetInspector: React.FC<PlanetInspectorProps> = ({
  vargaChart,
  selectedHouse,
  selectedPlanetSymbol,
  onSelectHouse,
  onSelectPlanet,
}) => {
  const houseSynthesisInfo = HOUSE_DETAILS.find((h) => h.house === selectedHouse)!;
  const vargaHouse = vargaChart.houses.find((h) => h.house === selectedHouse) || vargaChart.houses[0];

  const occupants = vargaHouse.occupants
    .map((sym) => PLANET_PLACEMENTS.find((p) => p.symbol === sym))
    .filter((p): p is PlanetPlacement => Boolean(p));

  const selectedPlanet: PlanetPlacement | undefined = selectedPlanetSymbol
    ? PLANET_PLACEMENTS.find((p) => p.symbol === selectedPlanetSymbol)
    : occupants[0];

  const crossVargaRow = selectedPlanet
    ? CROSS_VARGA_MATRIX.find((r) => r.symbol === selectedPlanet.symbol)
    : undefined;

  const getStrengthIndicator = (level: 'Strong' | 'Balanced' | 'Karmic Test') => {
    switch (level) {
      case 'Strong':
        return { text: '● ELEVATED STRENGTH', color: 'text-emerald-700' };
      case 'Balanced':
        return { text: '◆ BALANCED FLOW', color: 'text-sky-700' };
      case 'Karmic Test':
        return { text: '▲ KARMIC VIGILANCE', color: 'text-amber-700' };
    }
  };

  const strengthBadge = getStrengthIndicator(houseSynthesisInfo.strengthLevel);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
          <div className="flex items-center gap-2 font-mono-tabular">
            <span>{vargaChart.code} · House {vargaHouse.house} of 12</span>
            <span aria-hidden="true">·</span>
            <span>{houseSynthesisInfo.bhavaName}</span>
            <span aria-hidden="true">·</span>
            <span>
              Sign #{vargaHouse.signNumber}: {vargaHouse.signName}
            </span>
          </div>
          <span className={`font-mono-tabular font-semibold ${strengthBadge.color}`}>
            {strengthBadge.text}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900">
          {vargaHouse.house}. {houseSynthesisInfo.domainTitle}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          <span>
            <strong>{vargaChart.code} House Note:</strong> {vargaHouse.note}
          </span>
        </div>
      </div>

      {/* Cross-Chart Bhava Synthesis */}
      <div className="py-4 border-b border-slate-200">
        <div className="text-xs font-semibold text-slate-500 mb-1">
          Cross-Varga Theme: {houseSynthesisInfo.karmicTheme}
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          {houseSynthesisInfo.synthesis}
        </p>
      </div>

      {/* Occupant Planets in Current Varga */}
      <div className="pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-slate-600">
            Occupants in {vargaChart.code} House {vargaHouse.house} ({occupants.length})
          </span>
          {occupants.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {occupants.map((p) => (
                <button
                  key={p.symbol}
                  type="button"
                  onClick={() => onSelectPlanet(p.symbol, vargaHouse.house)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedPlanet?.symbol === p.symbol
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p.name} ({p.symbol})
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedPlanet ? (
          <div className="bg-slate-50 rounded-md p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <h4 className="text-base font-bold text-slate-900">
                {selectedPlanet.name} ({selectedPlanet.sanskritName}) —{' '}
                <span className="font-mono-tabular text-sky-800">{selectedPlanet.symbol}</span>
              </h4>
              {crossVargaRow && (
                <div className="text-xs text-slate-600 font-mono-tabular">
                  D1: <strong>{crossVargaRow.d1Degree}</strong> ({crossVargaRow.d1Nakshatra}) ·{' '}
                  <strong>{crossVargaRow.jaiminiKaraka}</strong>
                </div>
              )}
            </div>

            <div className="text-xs text-slate-500 mb-2 font-mono-tabular">
              {selectedPlanet.wellBeingRole}
            </div>

            <p className="text-sm text-slate-700 leading-relaxed mb-3">
              {selectedPlanet.karmicReading}
            </p>

            {crossVargaRow && (
              <div className="mb-3 pt-2 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-tabular text-slate-600">
                <div>
                  <span className="text-slate-400">D1:</span> {crossVargaRow.d1Placement}
                </div>
                <div>
                  <span className="text-slate-400">D9:</span> {crossVargaRow.d9Placement}
                </div>
                <div>
                  <span className="text-slate-400">D10:</span> {crossVargaRow.d10Placement}
                </div>
                <div>
                  <span className="text-slate-400">D60:</span> {crossVargaRow.d60Placement}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
              <div>
                <strong className="text-slate-800">Lunar Astro Remedy:</strong>{' '}
                {selectedPlanet.remedialFocus}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-md p-4 text-sm text-slate-600">
            <p className="mb-2">
              <strong>Unoccupied Bhava in {vargaChart.code}:</strong> In Lunar Astro & Parashari cross-varga analysis, an empty house delivers its results through its sign ruler, Ashtakavarga bindu strength, and the planets occupying this same house number across D-1, D-9, D-10, and D-60.
            </p>
            <button
              type="button"
              onClick={() => onSelectHouse(houseSynthesisInfo.lordPlacedInHouse)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Inspect D-60 Sign Lord ({houseSynthesisInfo.lord}) in House {houseSynthesisInfo.lordPlacedInHouse}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
