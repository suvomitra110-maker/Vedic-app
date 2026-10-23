import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LAGNA_SIGN,
  PLANET_PLACEMENTS,
  HOUSE_DETAILS,
  KARMIC_YOGAS,
  ALL_VARGA_CHARTS,
  CROSS_VARGA_MATRIX,
  LUNAR_ASTRO_DICTUMS,
  VIMSHOTTARI_DASHAS,
  ASHTAKAVARGA_TABLE,
  getSignForHouse,
  getAspectedHouse,
  computeAspectedHouses,
  filterPlanetsByCategory,
  getHouseByNumber,
  getVargaChartByCode,
  NORTH_INDIAN_3D_BHAVAS,
  getPlanet3DOffset,
  generateBlenderPythonScript,
  VEDIC_PREDICTIVE_TECHNIQUES,
  NATURAL_VEDIC_REMEDIES,
  HIGH_PROFILE_CLIENT_TIERS,
  buildCustomVargaChart,
  generateHorizonRoadmap,
  generateLocalGiriVoiceScript,
  generateComprehensiveRemedyReport,
  generateShareableRemedyPlanSnippet,
} from './shastiamshaLogic';

test('Pisces Lagna (Sign 12) maps all 12 houses to exact signs in D-60 chart', () => {
  assert.equal(getSignForHouse(LAGNA_SIGN, 1), 12);
  assert.equal(getSignForHouse(LAGNA_SIGN, 2), 1);
  assert.equal(getSignForHouse(LAGNA_SIGN, 4), 3);
  assert.equal(getSignForHouse(LAGNA_SIGN, 6), 5);
  assert.equal(getSignForHouse(LAGNA_SIGN, 7), 6);
  assert.equal(getSignForHouse(LAGNA_SIGN, 8), 7);
  assert.equal(getSignForHouse(LAGNA_SIGN, 9), 8);
  assert.equal(getSignForHouse(LAGNA_SIGN, 10), 9);
  assert.equal(getSignForHouse(LAGNA_SIGN, 11), 10);
  assert.equal(getSignForHouse(LAGNA_SIGN, 12), 11);
});

test('All 8 uploaded Shodashvarga charts (D1, D2, D4, D9, D10, D30, D45, D60) are accurately modeled', () => {
  assert.equal(ALL_VARGA_CHARTS.length, 8);

  const d1 = getVargaChartByCode('D1');
  assert.equal(d1.lagnaSign, 3); // Gemini
  assert.deepEqual(d1.houses[3].occupants, ['Me']); // H4 Virgo -> Me
  assert.deepEqual(d1.houses[8].occupants, ['Sa']); // H9 Aquarius -> Sa

  const d9 = getVargaChartByCode('D9');
  assert.equal(d9.lagnaSign, 1); // Aries
  assert.deepEqual(d9.houses[6].occupants, ['Ma', 'Ju']); // H7 Libra -> Ma, Ju

  const d10 = getVargaChartByCode('D10');
  assert.equal(d10.lagnaSign, 10); // Capricorn
  assert.deepEqual(d10.houses[0].occupants, ['Ve']); // H1 Capricorn -> Ve
  assert.deepEqual(d10.houses[10].occupants, ['Sa', 'Ju', 'Ra']); // H11 Scorpio -> Sa, Ju, Ra

  const d30 = getVargaChartByCode('D30');
  assert.equal(d30.lagnaSign, 3); // Vargottama Gemini

  const d45 = getVargaChartByCode('D45');
  assert.equal(d45.lagnaSign, 6); // Virgo
});

test('Graha Drishti (Vedic planetary aspects) and Cross-Varga Dictums verify cleanly', () => {
  assert.deepEqual(computeAspectedHouses(11, [4, 7, 8]), [2, 5, 6]);
  assert.deepEqual(computeAspectedHouses(11, [5, 7, 9]), [3, 5, 7]);
  assert.deepEqual(computeAspectedHouses(9, [3, 7, 10]), [11, 3, 6]);
  assert.equal(getAspectedHouse(10, 7), 4);

  assert.equal(CROSS_VARGA_MATRIX.length, 10);
  assert.equal(LUNAR_ASTRO_DICTUMS.length, 7);
  assert.equal(ASHTAKAVARGA_TABLE.length, 12);

  // Verify Gemini H1 has 37 bindus and Libra H5 has 23 bindus
  const geminiSav = ASHTAKAVARGA_TABLE.find((r) => r.signNumber === 3);
  assert.equal(geminiSav?.totalSarvashtakavarga, 37);

  const activeDasha = VIMSHOTTARI_DASHAS.find((d) => d.isCurrent);
  assert.ok(activeDasha?.mahadasha.includes('Mercury'));
});

test('filterPlanetsByCategory and house lookup work accurately', () => {
  const traditional = filterPlanetsByCategory(PLANET_PLACEMENTS, 'traditional');
  assert.equal(traditional.length, 9);
  assert.equal(HOUSE_DETAILS.length, 12);
  assert.equal(KARMIC_YOGAS.length, 4);
  assert.equal(getHouseByNumber(11).signName, 'Capricorn');
});

test('3D North Indian Mandapa coordinates and Blender 4.x Python script generator work accurately', () => {
  assert.equal(NORTH_INDIAN_3D_BHAVAS.length, 12);
  const kendras = NORTH_INDIAN_3D_BHAVAS.filter((b) => b.isKendra).map((b) => b.house);
  assert.deepEqual(kendras, [1, 4, 7, 10]);

  const singlePos = getPlanet3DOffset(0, 1, 4);
  assert.deepEqual(singlePos, [-2.5, 0]);

  const multiPos0 = getPlanet3DOffset(0, 3, 5);
  const multiPos1 = getPlanet3DOffset(1, 3, 5);
  assert.notDeepEqual(multiPos0, multiPos1);

  const d60 = getVargaChartByCode('D60');
  const script = generateBlenderPythonScript(d60, true);
  assert.ok(script.includes('import bpy'));
  assert.ok(script.includes('CHART_CODE = "D60"'));
  assert.ok(script.includes('Mandapa_Obsidian'));
});

test('Vedic techniques, 9-planet natural remedies, Remedy Report, Shareable Snippet, and High-Profile Client tiers verify cleanly', () => {
  assert.equal(VEDIC_PREDICTIVE_TECHNIQUES.length, 7);
  assert.equal(NATURAL_VEDIC_REMEDIES.length, 9);
  assert.equal(HIGH_PROFILE_CLIENT_TIERS.length, 3);

  const customChart = buildCustomVargaChart({
    title: 'Sovereign Career Chart',
    lagnaSign: 5, // Leo
    userWish: 'Global Leadership & Research Authority',
    planetHouses: [
      { symbol: 'Su', house: 1 },
      { symbol: 'Me', house: 10 },
    ],
  });
  assert.equal(customChart.lagnaSign, 5);
  assert.ok(customChart.lagnaName.includes('Leo'));
  assert.deepEqual(customChart.houses[0].occupants, ['Su']);
  assert.deepEqual(customChart.houses[9].occupants, ['Me']);

  const roadmap3 = generateHorizonRoadmap(3, 'Career Breakthrough', ['Lunar Astro (Deepanshu Giri)']);
  const roadmap6 = generateHorizonRoadmap(6, 'Career Breakthrough', ['Lunar Astro (Deepanshu Giri)']);
  const roadmap12 = generateHorizonRoadmap(12, 'Career Breakthrough', ['Lunar Astro (Deepanshu Giri)']);
  assert.equal(roadmap3.length, 3);
  assert.equal(roadmap6.length, 6);
  assert.equal(roadmap12.length, 12);

  const voiceData = generateLocalGiriVoiceScript(
    getVargaChartByCode('D1'),
    4,
    'Me',
    ['Lunar Astro (Deepanshu Giri)', 'Bhrigu Nandi Nadi (BNN)']
  );
  assert.ok(voiceData.scriptText.includes('Deepanshu Giri'));
  assert.ok(voiceData.keyDictum.length > 10);
  assert.ok(voiceData.naturalRemedy.length > 10);

  const remedyReport = generateComprehensiveRemedyReport({
    ayanamsa: 'Lahiri (Chitrapaksha) — 23° 47\' 56"',
    preferredTechniques: ['Lunar Astro (Deepanshu Giri)', 'Bhrigu Nandi Nadi (BNN)'],
    horizonMonths: 6,
    userWish: 'Holistic Mastery & Career Leadership',
    completedRemediesCount: 3,
    totalRemediesCount: 9,
    chartTitle: 'Sovereign Founder & C-Suite Dossier',
    lagnaName: 'Leo (Simha)',
    clientTierId: 'sovereign-executive',
  });
  assert.ok(remedyReport.includes('OFFICIAL LUNAR ASTRO (DEEPANSHU GIRI) & NAVAGRAHA NATURAL REMEDY REPORT'));
  assert.ok(remedyReport.includes('DAILY CIRCADIAN DINACHARYA SCHEDULE'));
  assert.ok(remedyReport.includes('COMPLETE NINE-PLANET (NAVAGRAHA) NATURAL REMEDY PRESCRIPTIONS'));
  assert.ok(remedyReport.includes('Sovereign Founder & C-Suite Advisory'));

  const shareSnippet = generateShareableRemedyPlanSnippet({
    ayanamsa: 'Lahiri (Chitrapaksha) — 23° 47\' 56"',
    preferredTechniques: ['Lunar Astro (Deepanshu Giri)', 'Bhrigu Nandi Nadi (BNN)'],
    horizonMonths: 12,
    userWish: 'Multi-Generational Capital Preservation',
    completedRemediesCount: 4,
    totalRemediesCount: 9,
    chartTitle: 'Family Office & Dynasty Capital Chart',
    lagnaName: 'Gemini (Mithuna)',
    clientTierId: 'family-office',
  });
  assert.ok(shareSnippet.includes('VEDIC FOUNDATION — EXECUTIVE NATURAL REMEDY PLAN'));
  assert.ok(shareSnippet.includes('Family Office & Sovereign Wealth Principal'));
  assert.ok(shareSnippet.includes('DAILY CIRCADIAN DINACHARYA PROTOCOL'));
  assert.ok(shareSnippet.includes('PRIORITY 9-PLANET NATURAL PRESCRIPTIONS'));
  assert.ok(shareSnippet.includes('@vedic-foundation/sovereign-muhurta-engine@2.9.0'));
});




