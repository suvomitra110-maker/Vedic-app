import React from 'react';
import {
  PLANET_PLACEMENTS,
  VargaChartDefinition,
  computeAspectedHouses,
} from '../utils/shastiamshaLogic';

interface NorthIndianChartProps {
  vargaChart: VargaChartDefinition;
  selectedHouse: number;
  selectedPlanetSymbol: string | null;
  showAspects: boolean;
  showOuterPlanets: boolean;
  onSelectHouse: (houseNumber: number) => void;
  onSelectPlanet: (symbol: string, houseNumber: number) => void;
}

interface HouseGeometry {
  house: number;
  polygon: string;
  signPos: { x: number; y: number };
  centerPos: { x: number; y: number };
  labelPos: { x: number; y: number };
}

const HOUSE_GEOMETRIES: HouseGeometry[] = [
  {
    house: 1,
    polygon: '200,12 106,106 200,200 294,106',
    signPos: { x: 200, y: 182 },
    centerPos: { x: 200, y: 105 },
    labelPos: { x: 200, y: 42 },
  },
  {
    house: 2,
    polygon: '12,12 106,106 200,12',
    signPos: { x: 106, y: 90 },
    centerPos: { x: 104, y: 50 },
    labelPos: { x: 46, y: 28 },
  },
  {
    house: 3,
    polygon: '12,12 12,200 106,106',
    signPos: { x: 88, y: 112 },
    centerPos: { x: 48, y: 108 },
    labelPos: { x: 26, y: 162 },
  },
  {
    house: 4,
    polygon: '106,106 12,200 106,294 200,200',
    signPos: { x: 176, y: 205 },
    centerPos: { x: 104, y: 200 },
    labelPos: { x: 56, y: 200 },
  },
  {
    house: 5,
    polygon: '12,200 12,388 106,294',
    signPos: { x: 86, y: 294 },
    centerPos: { x: 46, y: 292 },
    labelPos: { x: 28, y: 352 },
  },
  {
    house: 6,
    polygon: '12,388 200,388 106,294',
    signPos: { x: 106, y: 318 },
    centerPos: { x: 106, y: 356 },
    labelPos: { x: 158, y: 376 },
  },
  {
    house: 7,
    polygon: '200,200 106,294 200,388 294,294',
    signPos: { x: 192, y: 226 },
    centerPos: { x: 200, y: 300 },
    labelPos: { x: 200, y: 365 },
  },
  {
    house: 8,
    polygon: '294,294 200,388 388,388',
    signPos: { x: 286, y: 318 },
    centerPos: { x: 292, y: 356 },
    labelPos: { x: 352, y: 374 },
  },
  {
    house: 9,
    polygon: '294,294 388,388 388,200',
    signPos: { x: 312, y: 294 },
    centerPos: { x: 354, y: 296 },
    labelPos: { x: 372, y: 245 },
  },
  {
    house: 10,
    polygon: '200,200 294,294 388,200 294,106',
    signPos: { x: 218, y: 205 },
    centerPos: { x: 296, y: 200 },
    labelPos: { x: 348, y: 200 },
  },
  {
    house: 11,
    polygon: '294,106 388,200 388,12',
    signPos: { x: 312, y: 108 },
    centerPos: { x: 356, y: 108 },
    labelPos: { x: 368, y: 46 },
  },
  {
    house: 12,
    polygon: '200,12 294,106 388,12',
    signPos: { x: 292, y: 90 },
    centerPos: { x: 296, y: 54 },
    labelPos: { x: 240, y: 28 },
  },
];

const SPECIAL_ASPECT_OFFSETS: Record<string, number[]> = {
  Ma: [4, 7, 8],
  Ju: [5, 7, 9],
  Sa: [3, 7, 10],
  Ra: [5, 7, 9],
  Ke: [5, 7, 9],
};

export const NorthIndianChart: React.FC<NorthIndianChartProps> = ({
  vargaChart,
  selectedHouse,
  selectedPlanetSymbol,
  showAspects,
  showOuterPlanets,
  onSelectHouse,
  onSelectPlanet,
}) => {
  const activeHouseData = vargaChart.houses.find((h) => h.house === selectedHouse) || vargaChart.houses[0];
  const activeGeometry = HOUSE_GEOMETRIES.find((g) => g.house === selectedHouse) || HOUSE_GEOMETRIES[0];

  // Compute Graha Drishti from the selected house's active planet(s) in this Varga
  const visibleActiveOccupants = activeHouseData.occupants.filter((sym) => {
    if (showOuterPlanets) return true;
    const p = PLANET_PLACEMENTS.find((pl) => pl.symbol === sym);
    return p ? p.isTraditional : true;
  });

  const aspectSourceSymbols =
    selectedPlanetSymbol && visibleActiveOccupants.includes(selectedPlanetSymbol)
      ? [selectedPlanetSymbol]
      : visibleActiveOccupants;

  const aspectTargetHouses = Array.from(
    new Set(
      aspectSourceSymbols.flatMap((sym) => {
        const offsets = SPECIAL_ASPECT_OFFSETS[sym] || [7];
        return computeAspectedHouses(selectedHouse, offsets);
      })
    )
  );

  return (
    <div className="w-full">
      <div className="relative mx-auto aspect-square max-w-[460px] bg-slate-50/60 rounded-lg p-2">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full select-none"
          role="img"
          aria-label={`Interactive North Indian ${vargaChart.name} with ${vargaChart.lagnaName} Ascendant`}
        >
          <defs>
            <marker
              id="aspect-arrow"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284C7" />
            </marker>
          </defs>

          <rect
            x="6"
            y="6"
            width="388"
            height="388"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="2.5"
          />
          <rect
            x="12"
            y="12"
            width="376"
            height="376"
            fill="none"
            stroke="#0F172A"
            strokeWidth="1.5"
          />

          {HOUSE_GEOMETRIES.map((geo) => {
            const houseInfo = vargaChart.houses.find((h) => h.house === geo.house)!;
            const isSelected = selectedHouse === geo.house;
            const isAspected = showAspects && aspectTargetHouses.includes(geo.house);

            const visibleOccupants = houseInfo.occupants.filter((sym) => {
              if (showOuterPlanets) return true;
              const p = PLANET_PLACEMENTS.find((pl) => pl.symbol === sym);
              return p ? p.isTraditional : true;
            });

            const isSideTriangle =
              geo.house === 3 || geo.house === 5 || geo.house === 9 || geo.house === 11;

            return (
              <g
                key={geo.house}
                onClick={() => onSelectHouse(geo.house)}
                className="cursor-pointer transition-colors"
              >
                <polygon
                  points={geo.polygon}
                  fill={
                    isSelected
                      ? '#E0F2FE'
                      : isAspected
                        ? '#FEF3C7'
                        : '#FFFFFF'
                  }
                  stroke="#0F172A"
                  strokeWidth="1.75"
                  className="hover:fill-slate-100 transition-colors duration-150"
                />

                <text
                  x={geo.labelPos.x}
                  y={geo.labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="500"
                  fill={isSelected ? '#0369A1' : '#94A3B8'}
                  className="font-mono-tabular pointer-events-none"
                >
                  H{geo.house}
                </text>

                <text
                  x={geo.signPos.x}
                  y={geo.signPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="15"
                  fontWeight="600"
                  fill="#334155"
                  className="font-display pointer-events-none"
                >
                  {houseInfo.signNumber}
                </text>

                {visibleOccupants.map((sym, idx) => {
                  const total = visibleOccupants.length;
                  let offsetX = 0;
                  let offsetY = 0;

                  if (total > 1) {
                    if (total >= 4) {
                      // Grid layout for D-2 Hora cluster
                      const cols = 3;
                      const col = idx % cols;
                      const row = Math.floor(idx / cols);
                      offsetX = (col - 1) * 28;
                      offsetY = (row - 1) * 22;
                    } else if (isSideTriangle) {
                      offsetX = (idx - (total - 1) / 2) * 18;
                      offsetY = (idx - (total - 1) / 2) * 22;
                    } else {
                      offsetX = (idx - (total - 1) / 2) * 28;
                    }
                  }

                  const isPlanetSelected = selectedPlanetSymbol === sym && isSelected;

                  return (
                    <g
                      key={sym}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPlanet(sym, geo.house);
                      }}
                      className="cursor-pointer"
                    >
                      {isPlanetSelected && (
                        <circle
                          cx={geo.centerPos.x + offsetX}
                          cy={geo.centerPos.y + offsetY}
                          r="14"
                          fill="#0F172A"
                        />
                      )}
                      <text
                        x={geo.centerPos.x + offsetX}
                        y={geo.centerPos.y + offsetY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={total >= 4 ? '13' : '15'}
                        fontWeight="700"
                        fill={isPlanetSelected ? '#FFFFFF' : '#0F172A'}
                        className="font-display"
                      >
                        {sym}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {showAspects &&
            aspectTargetHouses.map((targetH) => {
              const targetGeo = HOUSE_GEOMETRIES.find((g) => g.house === targetH);
              if (!targetGeo) return null;
              return (
                <line
                  key={`aspect-${vargaChart.code}-${selectedHouse}-${targetH}`}
                  x1={activeGeometry.centerPos.x}
                  y1={activeGeometry.centerPos.y}
                  x2={targetGeo.centerPos.x}
                  y2={targetGeo.centerPos.y}
                  stroke="#0284C7"
                  strokeWidth="2"
                  strokeDasharray="5,4"
                  markerEnd="url(#aspect-arrow)"
                  className="pointer-events-none"
                />
              );
            })}
        </svg>
      </div>

      {/* Quick House Jump Bar */}
      <div className="mt-4">
        <div className="text-xs font-medium text-slate-500 mb-2 flex items-center justify-between">
          <span>Select Bhava (House 1–12) in {vargaChart.code}</span>
          <span className="font-mono-tabular text-slate-700">
            Active: H{activeHouseData.house} · {activeHouseData.signName} (#{activeHouseData.signNumber})
          </span>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5" role="group" aria-label="Select House 1 to 12">
          {vargaChart.houses.map((h) => {
            const isSelected = h.house === selectedHouse;
            return (
              <button
                key={h.house}
                type="button"
                onClick={() => onSelectHouse(h.house)}
                aria-label={`Inspect House ${h.house} (${h.signName})`}
                aria-pressed={isSelected}
                className={`py-2 px-1 text-xs font-mono-tabular font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                H{h.house}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
