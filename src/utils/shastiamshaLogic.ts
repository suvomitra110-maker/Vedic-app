export type DignityStatus =
  | 'Exalted'
  | 'Debilitated (Cancelled)'
  | 'Debilitated (D1 Exalted -> D9 Debil)'
  | 'Own Sign / Moolatrikona'
  | 'Vargottama'
  | 'Friendly Sign'
  | 'Neutral Sign'
  | 'Enemy Sign'
  | 'Trans-Saturnian';

export type VargaCode = 'D1' | 'D2' | 'D4' | 'D9' | 'D10' | 'D30' | 'D45' | 'D60';

export interface VargaChartDefinition {
  code: VargaCode;
  name: string;
  sanskritName: string;
  domain: string;
  lagnaSign: number;
  lagnaName: string;
  lagnaDegree?: string;
  lagnaNakshatra?: string;
  sourceImage: string;
  keySignature: string;
  lunarAstroSynthesis: string;
  houses: {
    house: number;
    signNumber: number;
    signName: string;
    occupants: string[];
    note: string;
  }[];
}

export interface CrossVargaPlanetRow {
  planet: string;
  symbol: string;
  d1Degree: string;
  d1Nakshatra: string;
  jaiminiKaraka: string;
  d1Placement: string;
  d2Placement: string;
  d4Placement: string;
  d9Placement: string;
  d10Placement: string;
  d30Placement: string;
  d45Placement: string;
  d60Placement: string;
  lunarAstroDictum: string;
}

export interface LunarAstroDictum {
  id: string;
  number: string;
  title: string;
  techniqueCategory:
    | 'Lunar Astro (Deepanshu Giri)'
    | 'Bhrigu Nandi Nadi (BNN)'
    | 'Parashari Cross-Varga'
    | 'Jaimini & Nakshatra'
    | 'Ashtakavarga & Dasha';
  involvedCharts: VargaCode[];
  involvedPlanets: string[];
  dictumRule: string;
  chartApplication: string;
  concretePrediction: string;
  remedialAlignment: string;
}

export interface DashaPeriod {
  mahadasha: string;
  periodRange: string;
  isCurrent: boolean;
  coreTheme: string;
  crossVargaActivation: string;
}

export interface AshtakavargaRow {
  signNumber: number;
  signName: string;
  d1House: number;
  sun: number;
  moon: number;
  mars: number;
  mercury: number;
  jupiter: number;
  venus: number;
  saturn: number;
  totalSarvashtakavarga: number;
  dictumNote: string;
}

export interface PlanetPlacement {
  id: string;
  symbol: string;
  name: string;
  sanskritName: string;
  house: number;
  signNumber: number;
  signName: string;
  sanskritSign: string;
  signLord: string;
  ruledHouses: number[];
  dignity: DignityStatus;
  isTraditional: boolean;
  specialAspects: number[];
  aspectedHouses: number[];
  wellBeingRole: string;
  karmicReading: string;
  remedialFocus: string;
}

export interface HouseDetail {
  house: number;
  bhavaName: string;
  domainTitle: string;
  signNumber: number;
  signName: string;
  sanskritSign: string;
  element: 'Water' | 'Fire' | 'Earth' | 'Air';
  modality: 'Dual' | 'Movable' | 'Fixed';
  lord: string;
  lordPlacedInHouse: number;
  occupants: string[];
  aspectedBy: string[];
  karmicTheme: string;
  synthesis: string;
  strengthLevel: 'Strong' | 'Balanced' | 'Karmic Test';
}

export interface KarmicYoga {
  id: string;
  name: string;
  sanskritTerm: string;
  involvedPlanets: string[];
  involvedHouses: number[];
  category: 'Raja Yoga' | 'Neecha Bhanga' | 'Kendra-Trikona' | 'Karmic Axis';
  impactSummary: string;
  detailedExplanation: string;
}

export interface LifePillar {
  id: string;
  title: string;
  subtitle: string;
  primaryHouses: number[];
  keyPlanets: string[];
  statusLabel: '● ELEVATED STRENGTH' | '◆ BALANCED FLOW' | '▲ KARMIC VIGILANCE';
  score: number;
  summary: string;
  actionableGuidance: string[];
}

export const SIGN_NAMES: Record<number, string> = {
  1: 'Aries',
  2: 'Taurus',
  3: 'Gemini',
  4: 'Cancer',
  5: 'Leo',
  6: 'Virgo',
  7: 'Libra',
  8: 'Scorpio',
  9: 'Sagittarius',
  10: 'Capricorn',
  11: 'Aquarius',
  12: 'Pisces',
};

export function getSignForHouse(lagnaSign: number, houseNumber: number): number {
  if (houseNumber < 1 || houseNumber > 12) {
    throw new Error(`Invalid house number: ${houseNumber}`);
  }
  return ((lagnaSign - 1 + (houseNumber - 1)) % 12) + 1;
}

export function getAspectedHouse(fromHouse: number, offset: number): number {
  return ((fromHouse - 1 + (offset - 1)) % 12) + 1;
}

export function computeAspectedHouses(fromHouse: number, offsets: number[]): number[] {
  return offsets.map((offset) => getAspectedHouse(fromHouse, offset));
}

function buildVargaHouses(
  lagnaSign: number,
  occupantsByHouse: Record<number, string[]>,
  notesByHouse: Record<number, string>
) {
  return Array.from({ length: 12 }, (_, idx) => {
    const house = idx + 1;
    const signNumber = getSignForHouse(lagnaSign, house);
    return {
      house,
      signNumber,
      signName: SIGN_NAMES[signNumber],
      occupants: occupantsByHouse[house] || [],
      note: notesByHouse[house] || `${SIGN_NAMES[signNumber]} on House ${house} cusp.`,
    };
  });
}

export const ALL_VARGA_CHARTS: VargaChartDefinition[] = [
  {
    code: 'D1',
    name: 'D-1 Lagna (Rashi Chart)',
    sanskritName: 'Rashi Chakra',
    domain: 'Physical Manifestation, Body, Environment & Core Destiny',
    lagnaSign: 3,
    lagnaName: 'Gemini (Mithuna)',
    lagnaDegree: '22° 35\' 03"',
    lagnaNakshatra: 'Punarvasu (Pada 1 — Jupiter)',
    sourceImage: '/assets/aistudio/IMG_7800_0daa28f8.jpeg',
    keySignature: 'Exalted Mercury in 4th (Bhadra Mahapurusha Yoga) + Own-Sign Retrograde Saturn (AK) in 9th',
    lunarAstroSynthesis:
      'Gemini Lagna (Punarvasu-1) with 37 Sarvashtakavarga bindus in the 1st house grants exceptional intellectual adaptability and self-renewal. Lagna lord Mercury is Exalted in the 4th house (Virgo), while 5th house Libra holds a high-voltage churning of Mars, Rahu (Chitra), and Moon (Vishakha).',
    houses: buildVargaHouses(
      3,
      {
        3: ['Ve', 'Su'],
        4: ['Me'],
        5: ['Ma', 'Mo', 'Ra'],
        6: ['Pl', 'Ju'],
        7: ['Ne'],
        8: ['Ur'],
        9: ['Sa'],
        11: ['Ke'],
      },
      {
        1: 'Gemini Ascendant (22°35\' Punarvasu-1) · Highest SAV of 37 bindus in the entire chart!',
        2: 'Cancer 2nd House · Lord Moon in 5th (Vishakha-2) creating 2nd-5th Dhana-Vidya link.',
        3: 'Leo 3rd House · Own-sign Sun (14°09\' Purva Phalguni) + Venus (17°07\' Purva Phalguni) -> Creative/Media/Self-Made Initiative.',
        4: 'Virgo 4th House · Exalted Lagna Lord Mercury (09°46\' Uttara Phalguni-4) -> Bhadra Mahapurusha Yoga.',
        5: 'Libra 5th House · Mars (1°58\' Chitra) + Rahu (5°06\' Chitra) + Moon (24°01\' Vishakha) -> Deep research, technical intuition & emotional churning (23 SAV bindus).',
        6: 'Scorpio 6th House · 7th/10th Lord Jupiter (13°01\' Anuradha-3) + Pluto -> Forensic problem-solving, healing/legal/analytical service.',
        7: 'Sagittarius 7th House · Neptune (29°13\' Uttara Ashadha) · Lord Jupiter in 6th.',
        8: 'Capricorn 8th House · Uranus (03°19\' Uttara Ashadha) · Lord Saturn in 9th.',
        9: 'Aquarius 9th House · Retrograde Saturn [R] (28°34\' Purva Bhadrapada-3) in Moolatrikona · Atmakaraka!',
        10: 'Pisces 10th House · Unoccupied (28 SAV bindus); Lord Jupiter in 6th aspecting 10th & 2nd.',
        11: 'Aries 11th House · Ketu [R] (05°06\' Ashwini-2) -> Detached network, sudden windfalls via niche mastery.',
        12: 'Taurus 12th House · Lord Venus in 3rd with Sun.',
      }
    ),
  },
  {
    code: 'D2',
    name: 'D-2 Hora (Wealth)',
    sanskritName: 'Hora Chakra',
    domain: 'Sustenance, Liquid Wealth, Family Resources & Financial Flow',
    lagnaSign: 4,
    lagnaName: 'Cancer (Karka)',
    sourceImage: '/assets/aistudio/IMG_7802_0e6ca4bd.jpeg',
    keySignature: '6 Planets in Cancer Hora (1st) + 4 Fiery/Nodal Grahas in Solar Leo Hora (2nd)',
    lunarAstroSynthesis:
      'In D-2 Hora, Cancer (Chandra Hora) rises with Moon, Jupiter, Mercury, Venus, Saturn, Uranus, Neptune, and Pluto in the 1st house—indicating wealth generated through intellect, advisory wisdom, and intuition. Meanwhile, Sun, Mars, Rahu, and Ketu occupy the 2nd house (Surya Hora in Leo), giving fierce executive drive to accumulate independent capital.',
    houses: buildVargaHouses(
      4,
      {
        1: ['Sa', 'Pl', 'Mo', 'Ju', 'Me', 'Ve', 'Ne', 'Ur'],
        2: ['Ra', 'Ma', 'Ke', 'Su'],
      },
      {
        1: 'Cancer (Chandra Hora) · Mo, Ju, Me, Ve, Sa, Pl, Ne, Ur clustered in 1st -> Intuitive & intellectual wealth magnetism.',
        2: 'Leo (Surya Hora) · Su, Ma, Ra, Ke in 2nd house of wealth -> Aggressive, authoritative capital accumulation.',
      }
    ),
  },
  {
    code: 'D4',
    name: 'D-4 Chaturthamsha (Luck & Assets)',
    sanskritName: 'Turyamsha',
    domain: 'Fixed Assets, Real Estate, Inner Peace & Bhagya (Destiny)',
    lagnaSign: 12,
    lagnaName: 'Pisces (Meena)',
    sourceImage: '/assets/aistudio/IMG_7802_0e6ca4bd.jpeg',
    keySignature: 'Own-Sign Moon in 5th (Cancer) + Mercury in 10th + Venus-Jupiter in 12th',
    lunarAstroSynthesis:
      'Pisces rises in D-4 (just like in D-60!). The Moon is in its own sign Cancer in the 5th house, blessing emotional security through learning and children/creativity. Venus and Jupiter in the 12th (Aquarius) point to prosperity and property/sanctuary in foreign lands, peaceful retreats, or lontano investments, while Mars + Rahu in the 8th (Libra) warns against impulsive real-estate litigation.',
    houses: buildVargaHouses(
      12,
      {
        2: ['Ke'],
        5: ['Mo'],
        7: ['Ne'],
        8: ['Ra', 'Ma'],
        9: ['Su', 'Sa', 'Pl'],
        10: ['Me'],
        11: ['Ur'],
        12: ['Ve', 'Ju'],
      },
      {
        1: 'Pisces Ascendant in D-4 · Lord Jupiter in 12th with Venus (Foreign/Retreat sanctuary).',
        2: 'Aries 2nd House · Ketu in 2nd.',
        5: 'Cancer 5th House · Own-sign Moon in 5th -> Deep inner emotional merit.',
        8: 'Libra 8th House · Rahu + Mars -> Always perform strict due diligence on joint property titles.',
        9: 'Scorpio 9th House · Sun + Saturn + Pluto -> Karmic transformation of beliefs and paternal inheritance.',
        10: 'Sagittarius 10th House · Mercury in Kendra.',
        12: 'Aquarius 12th House · Venus + Jupiter -> High comfort in distant/foreign residences or spiritual ashrams.',
      }
    ),
  },
  {
    code: 'D9',
    name: 'D-9 Navamsha (Spouse & Fruit)',
    sanskritName: 'Navamsha Chakra',
    domain: 'Dharma, Marriage/Spouse, Inner Soul Fruit & Second Half of Life',
    lagnaSign: 1,
    lagnaName: 'Aries (Mesha)',
    lagnaDegree: '23° 16\'',
    lagnaNakshatra: 'Bharani (Lord: Venus)',
    sourceImage: '/assets/aistudio/IMG_7798_069758cd.jpeg',
    keySignature: 'Exalted Moon in 2nd + Vargottama Sun in 5th + Vargottama Mars & Jupiter in 7th + Debilitated Me (12th) & Ve (6th)',
    lunarAstroSynthesis:
      'Aries (23°16\' Bharani) rises in D-9. Notice the crucial Lunar Astro contrast: Mercury is Exalted in D-1 (Virgo 4th) but Debilitated in D-9 (Pisces 12th at 27°51\' Revati), and Venus is Debilitated in D-9 (Virgo 6th at 4°01\' Uttara Phalguni). Meanwhile, Mars (17°41\' Swati — Vargottama!) and Jupiter (27°00\' Vishakha) occupy the 7th house (Libra), Sun is Vargottama in Leo (5th, 7°19\' Magha), and Moon is Exalted in Taurus (2nd, 6°22\' Krittika).',
    houses: buildVargaHouses(
      1,
      {
        2: ['Ke', 'Mo'],
        3: ['Sa'],
        5: ['Pl', 'Su'],
        6: ['Ve'],
        7: ['Ma', 'Ju'],
        8: ['Ra'],
        9: ['Ne'],
        10: ['Ur'],
        12: ['Me'],
      },
      {
        1: 'Aries Navamsha Lagna (23°16\' Bharani) · Lord Mars in 7th house with Jupiter.',
        2: 'Taurus 2nd House · Exalted Moon (6°22\' Krittika) + Ketu (16°00\' Rohini) -> Powerful spiritual speech & intuitive wealth.',
        3: 'Gemini 3rd House · Saturn (17°17\' Ardra) -> Determined self-effort and technical communication.',
        5: 'Leo 5th House · Vargottama Own-Sign Sun (7°19\' Magha) + Pluto -> Royal Purva Punya and dharmic authority.',
        6: 'Virgo 6th House · Debilitated Venus (4°01\' Uttara Phalguni) -> Requires conscious service & humility in relationships.',
        7: 'Libra 7th House · Vargottama Mars (17°41\' Swati) + Jupiter (27°00\' Vishakha) -> Dynamic, principled, independent spouse.',
        8: 'Scorpio 8th House · Rahu (16°00\' Anuradha) -> Deep occult & research transformation.',
        12: 'Pisces 12th House · Debilitated Mercury (27°51\' Revati) -> Transcends rigid logic into intuitive/mystical synthesis.',
      }
    ),
  },
  {
    code: 'D10',
    name: 'D-10 Dashamamsha (Profession)',
    sanskritName: 'Dashamamsha Chakra',
    domain: 'Career, Public Authority, Command & Social Standing',
    lagnaSign: 10,
    lagnaName: 'Capricorn (Makara)',
    lagnaDegree: '15° 55\'',
    lagnaNakshatra: 'Shravana (Lord: Moon)',
    sourceImage: '/assets/aistudio/IMG_7799_b8a55567.jpeg',
    keySignature: 'Yogakaraka Venus in 1st + Digbala Vargottama Mars in 10th (Libra) + Sa-Ju-Ra Powerhouse in 11th (Scorpio)',
    lunarAstroSynthesis:
      'Capricorn (15°55\' Shravana) rises in D-10 with Yogakaraka Venus (21°07\' Shravana) right in the 1st house! Even more remarkably, Mars (19°37\' Swati) sits in Libra for the THIRD time (Vargottama across D-1, D-9, and D-10!) right in the 10th house with 100% Digbala. And in the 11th house (Scorpio), D-10 Lagna lord Saturn (15°51\' Anuradha), Jupiter (09°58\' Anuradha), and Rahu (21°05\' Jyeshtha) unite with mutual 10th-11th Parivartana between Mars and Venus!',
    houses: buildVargaHouses(
      10,
      {
        1: ['Ve'],
        5: ['Ke'],
        6: ['Mo'],
        8: ['Pl', 'Me'],
        9: ['Ne'],
        10: ['Ur', 'Ma'],
        11: ['Sa', 'Ju', 'Ra'],
        12: ['Su'],
      },
      {
        1: 'Capricorn Ascendant (15°55\' Shravana) · Occupied by Yogakaraka Venus (21°07\' Shravana) in 1st-10th exchange with Mars!',
        5: 'Taurus 5th House · Ketu (21°05\' Rohini) -> Natural instinct for specialized advisory/financial strategy.',
        6: 'Gemini 6th House · Moon (00°23\' Mrigashirsha) -> Agile problem-solving in daily operations.',
        8: 'Leo 8th House · Mercury (07°35\' Magha) + Pluto -> Deep forensic research, auditing, and hidden systems mastery.',
        10: 'Libra 10th House · Mars (19°37\' Swati — Vargottama & Digbala!) + Uranus -> Unstoppable executive command & technical autonomy.',
        11: 'Scorpio 11th House · Lagna Lord Saturn (Anuradha) + Jupiter (Anuradha) + Rahu (Jyeshtha) -> Massive professional gains through research, occult, or large institutions.',
        12: 'Sagittarius 12th House · Sun (21°26\' Purva Ashadha) -> Behind-the-scenes global or institutional authority.',
      }
    ),
  },
  {
    code: 'D30',
    name: 'D-30 Trimshamsha (Crisis Matrix)',
    sanskritName: 'Trimshamsha Chakra',
    domain: 'Crisis Resilience, Protection from Misfortune, Shadripu (6 Inner Weaknesses)',
    lagnaSign: 3,
    lagnaName: 'Gemini (Mithuna)',
    sourceImage: '/assets/aistudio/IMG_7796_89cf1e65.png',
    keySignature: 'Vargottama Gemini Lagna + Exalted Me (4th), Exalted Sa (5th), Own-Sign Ju (10th), Own-Sign Ma (11th)',
    lunarAstroSynthesis:
      'In Lunar Astro methodology, D-30 shows how you survive crises and where subconscious vulnerabilities lie. Astonishingly, your D-30 is fortified like a fortress: Vargottama Gemini Lagna with Moon in 1st, Exalted Mercury in 4th (Virgo), Exalted Saturn in 5th (Libra), Own-Sign Jupiter in 10th (Pisces), and Own-Sign Mars in 11th (Aries)! Almost every planet is in exaltation or own sign in D-30—meaning crises actually trigger your highest evolutionary rise.',
    houses: buildVargaHouses(
      3,
      {
        1: ['Mo'],
        4: ['Me'],
        5: ['Ne', 'Sa'],
        7: ['Su', 'Ve'],
        9: ['Ra', 'Ke'],
        10: ['Ju'],
        11: ['Ma'],
        12: ['Pl', 'Ur'],
      },
      {
        1: 'Gemini Lagna (Vargottama with D-1) · Moon in 1st house -> Emotional alertness during crisis.',
        4: 'Virgo 4th House · Exalted Mercury (Vargottama with D-1!) -> Unshakable analytical core.',
        5: 'Libra 5th House · Exalted Saturn + Neptune -> Calm, cold strategic patience under pressure.',
        7: 'Sagittarius 7th House · Sun + Venus -> Watch ego or expectation clashes in public partnerships.',
        9: 'Aquarius 9th House · Rahu + Ketu axis -> Unconventional dharmic tests.',
        10: 'Pisces 10th House · Own-Sign Jupiter (Hamsa Yoga in D-30!) -> Divine grace protects reputation.',
        11: 'Aries 11th House · Own-Sign Mars -> Crisis converts into material victory.',
      }
    ),
  },
  {
    code: 'D45',
    name: 'D-45 Akshvedamsha (Ethics & Character)',
    sanskritName: 'Akshvedamsha Chakra',
    domain: 'Moral Fiber, Paternal/Ancestral Lineage Grace & Higher Integrity',
    lagnaSign: 6,
    lagnaName: 'Virgo (Kanya)',
    sourceImage: '/assets/aistudio/IMG_7801_f9a5a2cb.jpeg',
    keySignature: 'Own-Sign Ju in 7th (Pisces) + Digbala Ma in 10th (Gemini) + Own-Sign Sa & Lagna Lord Me in 6th (Aquarius)',
    lunarAstroSynthesis:
      'Virgo rises in D-45 with Venus in the 1st house, while Lagna lord Mercury sits with own-sign Saturn in the 6th house (Aquarius)—confirming the soul’s forensic commitment to solving complex problems, service, and structural truth. Jupiter in its own sign Pisces (7th) and Mars with Digbala in the 10th (Gemini) anchor ethical leadership.',
    houses: buildVargaHouses(
      6,
      {
        1: ['Ve'],
        3: ['Ke', 'Ra'],
        6: ['Sa', 'Me', 'Pl'],
        7: ['Ju'],
        8: ['Mo'],
        9: ['Su'],
        10: ['Ma'],
        11: ['Ne'],
        12: ['Ur'],
      },
      {
        1: 'Virgo Ascendant · Venus in 1st house.',
        3: 'Scorpio 3rd House · Rahu + Ketu -> Fearless investigative communication.',
        6: 'Aquarius 6th House · Own-sign Saturn + Lagna lord Mercury + Pluto -> Mastery over systems, law, medicine, or analytics.',
        7: 'Pisces 7th House · Own-sign Jupiter aspecting Lagna -> Strong ethical conscience.',
        8: 'Aries 8th House · Moon in 8th (Echoing D-60 Moon in 8th!) -> Deep psychic sensitivity.',
        9: 'Taurus 9th House · Sun in 9th.',
        10: 'Gemini 10th House · Mars in 10th with Digbala -> Decisive karmic execution.',
      }
    ),
  },
  {
    code: 'D60',
    name: 'D-60 Shastiamsha (Root Karma & Well-Being)',
    sanskritName: 'Shashtiamsha Chakra',
    domain: 'Past-Life Sanchita Karma, Constitutional Well-Being & Final Verdict',
    lagnaSign: 12,
    lagnaName: 'Pisces (Meena)',
    sourceImage: '/assets/aistudio/IMG_8279_d6fa3311.jpeg',
    keySignature: 'Exalted Mars + Jupiter (Neecha Bhanga) in 11th + Dual Digbala Ve (4th) & Su (10th) + 9th-11th Parivartana',
    lunarAstroSynthesis:
      'The supreme divisional chart of Parashara: Pisces rises with Lagna lord Jupiter and Exalted Mars in the 11th house (Capricorn), locked in a 9th-11th Maha Parivartana Yoga with Saturn in Scorpio (9th). Venus (4th) and Sun (10th) hold dual Digbala, while Ketu in the 12th (Aquarius) seals spiritual liberation.',
    houses: buildVargaHouses(
      12,
      {
        2: ['Me'],
        4: ['Ve'],
        5: ['Pl', 'Ur'],
        6: ['Ra'],
        8: ['Ne', 'Mo'],
        9: ['Sa'],
        10: ['Su'],
        11: ['Ju', 'Ma'],
        12: ['Ke'],
      },
      {
        1: 'Pisces Ascendant · Unblemished Lagna; Lord Jupiter in 11th with Neecha Bhanga.',
        2: 'Aries 2nd House · Mercury in 2nd aspected by exalted Mars.',
        4: 'Gemini 4th House · Venus with 100% Digbala -> Inner emotional sanctuary.',
        6: 'Leo 6th House · Rahu in 6th (Ari-Hanta obstacle crusher).',
        8: 'Libra 8th House · Moon + Neptune -> Deep intuitive & psychosomatic sensitivity.',
        9: 'Scorpio 9th House · Saturn in Parivartana with 9th lord Mars.',
        10: 'Sagittarius 10th House · Sun with 100% Digbala -> Sovereign karmic purpose.',
        11: 'Capricorn 11th House · Exalted Mars + Jupiter -> Guru-Mangala & Neecha Bhanga Raja Yoga.',
        12: 'Aquarius 12th House · Ketu in 12th -> Moksha & contemplative mastery.',
      }
    ),
  },
];

export const CROSS_VARGA_MATRIX: CrossVargaPlanetRow[] = [
  {
    planet: 'Ascendant (Lagna)',
    symbol: 'Asc',
    d1Degree: '22° 35\' 03"',
    d1Nakshatra: 'Punarvasu (1) · Ju',
    jaiminiKaraka: 'Lagna (37 SAV)',
    d1Placement: 'Gemini (3) · H1',
    d2Placement: 'Cancer (4) · H1',
    d4Placement: 'Pisces (12) · H1',
    d9Placement: 'Aries (1) · Bharani',
    d10Placement: 'Capricorn (10) · Shravana',
    d30Placement: 'Gemini (3) · Vargottama',
    d45Placement: 'Virgo (6) · H1',
    d60Placement: 'Pisces (12) · H1',
    lunarAstroDictum:
      'Dual-sign Lagnas in D1 (Gemini), D4 (Pisces), D30 (Gemini), D45 (Virgo), and D60 (Pisces) combined with movable Aries (D9) and Capricorn (D10): versatile strategist who synthesizes multiple disciplines into decisive executive action.',
  },
  {
    planet: 'Sun (Surya)',
    symbol: 'Su',
    d1Degree: '14° 09\' 13"',
    d1Nakshatra: 'Purva Phalguni (1) · Ve',
    jaiminiKaraka: 'Darakaraka / GK (14°09\')',
    d1Placement: 'H3 Leo (Own)',
    d2Placement: 'H2 Leo (Solar Hora)',
    d4Placement: 'H9 Scorpio',
    d9Placement: 'H5 Leo (Vargottama!)',
    d10Placement: 'H12 Sagittarius (Purva Ashadha)',
    d30Placement: 'H7 Sagittarius',
    d45Placement: 'H9 Taurus',
    d60Placement: 'H10 Sagittarius (Digbala!)',
    lunarAstroDictum:
      'Vargottama Own-Sign Sun in Leo (D1 H3, D2 H2, D9 H5) + 100% Digbala in D60 H10: Unshakeable self-respect, independent authority, and ancestral merit (Magha/Purva Phalguni) that refuses subordinate micromanagement.',
  },
  {
    planet: 'Moon (Chandra)',
    symbol: 'Mo',
    d1Degree: '24° 01\' 54"',
    d1Nakshatra: 'Vishakha (2) · Ju',
    jaiminiKaraka: 'Amatyakaraka (AmK)',
    d1Placement: 'H5 Libra (Churning)',
    d2Placement: 'H1 Cancer (Own Hora)',
    d4Placement: 'H5 Cancer (Own Sign)',
    d9Placement: 'H2 Taurus (Exalted!)',
    d10Placement: 'H6 Gemini (Mrigashirsha)',
    d30Placement: 'H1 Gemini',
    d45Placement: 'H8 Aries',
    d60Placement: 'H8 Libra (with Ne)',
    lunarAstroDictum:
      'Moon is Exalted in D9 (2nd) and Own-Sign in D2/D4, yet sits in the 8th house in BOTH D45 and D60 (and in a 23-bindu 5th house with Ma+Ra in D1). Dictum: Extraordinary diagnostic/occult intuition, but mental peace is the #1 health lever.',
  },
  {
    planet: 'Mars (Mangala)',
    symbol: 'Ma',
    d1Degree: '01° 58\' 55"',
    d1Nakshatra: 'Chitra (3) · Ma',
    jaiminiKaraka: 'Darakaraka (DK - 01°58\')',
    d1Placement: 'H5 Libra (with Ra, Mo)',
    d2Placement: 'H2 Leo',
    d4Placement: 'H8 Libra (with Ra)',
    d9Placement: 'H7 Libra (Vargottama!)',
    d10Placement: 'H10 Libra (Vargottama + Digbala!)',
    d30Placement: 'H11 Aries (Own Sign!)',
    d45Placement: 'H10 Gemini (Digbala!)',
    d60Placement: 'H11 Capricorn (Exalted!)',
    lunarAstroDictum:
      'Triple-Vargottama Mars in Libra across D1 (Chitra), D9 (Swati), and D10 (Swati — 10th House Digbala!), plus Digbala in D45 (10th) and Exalted in D60 (11th): The single most relentless career & crisis-conquering engine in the horoscope.',
  },
  {
    planet: 'Mercury (Budha)',
    symbol: 'Me',
    d1Degree: '09° 46\' 13"',
    d1Nakshatra: 'Uttara Phalguni (4) · Su',
    jaiminiKaraka: 'Putrakaraka (PK)',
    d1Placement: 'H4 Virgo (Exalted!)',
    d2Placement: 'H1 Cancer',
    d4Placement: 'H10 Sagittarius',
    d9Placement: 'H12 Pisces (Debilitated!)',
    d10Placement: 'H8 Leo (Magha)',
    d30Placement: 'H4 Virgo (Exalted!)',
    d45Placement: 'H6 Aquarius (with Sa)',
    d60Placement: 'H2 Aries',
    lunarAstroDictum:
      'Classic Deepanshu Giri Dictum: Planet Exalted in D1 (Virgo 4th) going Debilitated in D9 (Pisces 12th, Revati) and 8th in D10 (Magha). In Mercury Mahadasha (2025–2042), pure textbook degrees transform into deep research, occult/mystical synthesis, or foreign/advisory consulting.',
  },
  {
    planet: 'Jupiter (Guru)',
    symbol: 'Ju',
    d1Degree: '13° 01\' 39"',
    d1Nakshatra: 'Anuradha (3) · Sa',
    jaiminiKaraka: 'Matrikaraka (MK)',
    d1Placement: 'H6 Scorpio (Anuradha)',
    d2Placement: 'H1 Cancer (Exalted Sign)',
    d4Placement: 'H12 Aquarius (with Ve)',
    d9Placement: 'H7 Libra (Vishakha)',
    d10Placement: 'H11 Scorpio (Anuradha)',
    d30Placement: 'H10 Pisces (Own Sign!)',
    d45Placement: 'H7 Pisces (Own Sign!)',
    d60Placement: 'H11 Capricorn (Neecha Bhanga)',
    lunarAstroDictum:
      'Vargottama Scorpio Jupiter across D1 (6th) and D10 (11th, both in Anuradha!), plus Own-Sign Pisces in D30 (10th) and D45 (7th): Forensic counselor, healer, auditor, or strategist who turns 6th-house conflicts/litigation/diagnostics into 11th-house high-level gains.',
  },
  {
    planet: 'Venus (Shukra)',
    symbol: 'Ve',
    d1Degree: '17° 07\' 35"',
    d1Nakshatra: 'Purva Phalguni (2) · Ve',
    jaiminiKaraka: 'Bhratrikaraka (BK)',
    d1Placement: 'H3 Leo (with Su)',
    d2Placement: 'H1 Cancer',
    d4Placement: 'H12 Aquarius (with Ju)',
    d9Placement: 'H6 Virgo (Debilitated!)',
    d10Placement: 'H1 Capricorn (Yogakaraka!)',
    d30Placement: 'H7 Sagittarius',
    d45Placement: 'H1 Virgo (Debilitated)',
    d60Placement: 'H4 Gemini (Digbala!)',
    lunarAstroDictum:
      'Venus is Yogakaraka in D10 H1 (Capricorn) and holds 100% Digbala in D60 H4, yet is Debilitated in Virgo in D9 (H6) and D45 (H1). Dictum: Immense professional charisma and domestic refinement, but never mix romantic/personal ego with workplace disputes; serve partners selflessly.',
  },
  {
    planet: 'Saturn [R] (Shani)',
    symbol: 'Sa',
    d1Degree: '28° 34\' 00"',
    d1Nakshatra: 'Purva Bhadrapada (3) · Ju',
    jaiminiKaraka: 'Atmakaraka (AK - 28°34\')',
    d1Placement: 'H9 Aquarius [R] (Own Sign)',
    d2Placement: 'H1 Cancer',
    d4Placement: 'H9 Scorpio (with Su)',
    d9Placement: 'H3 Gemini (Ardra)',
    d10Placement: 'H11 Scorpio (Anuradha)',
    d30Placement: 'H5 Libra (Exalted!)',
    d45Placement: 'H6 Aquarius (Own Sign!)',
    d60Placement: 'H9 Scorpio (Parivartana)',
    lunarAstroDictum:
      'Retrograde Atmakaraka Saturn at 28°34\' in 9th House (Aquarius) in Jupiter’s star (Purva Bhadrapada), while Jupiter sits in Saturn’s star (Anuradha)! Deepanshu Giri Pending Karma Dictum: Repeating 9th-house placement (D1, D4, D60) shows heavy dharmic/institutional responsibility carried over from past lives.',
  },
  {
    planet: 'Rahu [R]',
    symbol: 'Ra',
    d1Degree: '05° 06\' 19"',
    d1Nakshatra: 'Chitra (4) · Ma',
    jaiminiKaraka: 'Co-Lord Aquarius (H9)',
    d1Placement: 'H5 Libra (Chitra)',
    d2Placement: 'H2 Leo',
    d4Placement: 'H8 Libra',
    d9Placement: 'H8 Scorpio (Anuradha)',
    d10Placement: 'H11 Scorpio (Jyeshtha)',
    d30Placement: 'H9 Aquarius',
    d45Placement: 'H3 Scorpio',
    d60Placement: 'H6 Leo (Ari-Hanta)',
    lunarAstroDictum:
      'Rahu occupies Scorpio (8th sign) in D9 (H8), D10 (H11), and D45 (H3), and sits in Chitra (5th house) with Mars in D1. Grants obsession with uncovering hidden architectures, occult sciences, deep coding/engineering, or forensic investigation.',
  },
  {
    planet: 'Ketu [R]',
    symbol: 'Ke',
    d1Degree: '05° 06\' 19"',
    d1Nakshatra: 'Ashwini (2) · Ke',
    jaiminiKaraka: 'Mokshakaraka',
    d1Placement: 'H11 Aries (Ashwini)',
    d2Placement: 'H2 Leo',
    d4Placement: 'H2 Aries',
    d9Placement: 'H2 Taurus (Rohini)',
    d10Placement: 'H5 Taurus (Rohini)',
    d30Placement: 'H9 Aquarius',
    d45Placement: 'H3 Scorpio',
    d60Placement: 'H12 Aquarius (Moksha!)',
    lunarAstroDictum:
      'Ketu in Ashwini (Magha/Ashwini/Moola root) in D1 11th house, moving to 2nd house in D4/D9 and 12th house in D60: Intuitive healer’s instinct (Ashwini) that detaches from superficial social circles to achieve spiritual autonomy.',
  },
];

export const LUNAR_ASTRO_DICTUMS: LunarAstroDictum[] = [
  {
    id: 'dictum-1-mercury-d1-d9-inversion',
    number: 'DICTUM 01',
    title: 'The Exalted-to-Debilitated Inversion Rule (Mercury: Exalted in D-1 -> Debilitated in D-9)',
    techniqueCategory: 'Lunar Astro (Deepanshu Giri)',
    involvedCharts: ['D1', 'D9', 'D10', 'D60'],
    involvedPlanets: ['Me', 'Ju'],
    dictumRule:
      'Lunar Astro Dictum: "When a planet is Exalted in D-1 (creating a Mahapurusha Yoga on the physical stage) but becomes Debilitated in the 12th house of D-9 (Navamsha) and 8th house of D-10, the native starts with conventional academic/analytical brilliance, but the soul forces a pivot away from rigid logic toward esoteric, occult, research, or borderless advisory domains."',
    chartApplication:
      'Your Lagna & 4th lord Mercury is Exalted at 09°46\' Virgo in D-1 (4th house Bhadra Yoga) and Exalted in D-30 (4th), yet sits at 27°51\' Pisces (Revati — 12th house) in D-9 and in the 8th house (Leo/Magha) in D-10, finally resolving into the 2nd house (Aries) of D-60.',
    concretePrediction:
      'Having just entered your 17-year Mercury Mahadasha (Oct 30, 2025 – Oct 30, 2042), your career will NOT remain confined to routine corporate desk work. Through D-10 8th-house Magha and D-9 12th-house Revati, Mercury will pull you into deep research, predictive sciences/astrology, forensic auditing, psychology, or international consulting—converting hidden knowledge into 2nd-house wealth (D-60 H2).',
    remedialAlignment:
      'Never cling to rigid intellectual pride (Virgo 4th); embrace intuitive synthesis, foreign/global clients (D-9 12th), and deep research (D-10 8th).',
  },
  {
    id: 'dictum-2-retrograde-ak-saturn-nakshatra-exchange',
    number: 'DICTUM 02',
    title: 'Retrograde Atmakaraka Saturn (28°34\') & The Anuradha–Purva Bhadrapada Nakshatra Parivartana',
    techniqueCategory: 'Lunar Astro (Deepanshu Giri)',
    involvedCharts: ['D1', 'D9', 'D10', 'D45', 'D60'],
    involvedPlanets: ['Sa', 'Ju'],
    dictumRule:
      'Lunar Astro Pending Karma Dictum: "A Retrograde planet in its Moolatrikona sign holding the highest degree (Atmakaraka) in the 9th house—while exchanging Nakshatras with the 10th lord in the 6th house—represents an uncompleted past-life vow toward Dharma, law, healing, or institutional reform."',
    chartApplication:
      'In D-1, Retrograde Saturn is at 28°34\' Aquarius (9th house) in Purva Bhadrapada-3 (ruled by Jupiter), while 7th/10th lord Jupiter sits in Scorpio (6th house) in Anuradha-3 (ruled by Saturn)! Then in D-10, BOTH Saturn and Jupiter conjoin in Scorpio (11th house) in Anuradha Nakshatra! And in D-60, Saturn sits in the 9th house (Scorpio) in sign Parivartana with Mars.',
    concretePrediction:
      'Whenever you take shortcuts in ethics or ignore your higher teachers/father figures, 9th-house Saturn blocks fortune. Conversely, when you take on hard, unglamorous problem-solving (D-1 6th house Jupiter in Anuradha), the Nakshatra exchange triggers massive 11th-house institutional gains (D-10 & D-60 11th house).',
    remedialAlignment:
      'Honor promises to mentors; complete long-term educational or research lineages that you once paused during your 2006–2025 Saturn Mahadasha.',
  },
  {
    id: 'dictum-3-triple-vargottama-mars-digbala',
    number: 'DICTUM 03',
    title: 'Triple-Vargottama Mars in Libra (D-1, D-9, D-10) Rising to Exaltation in D-60',
    techniqueCategory: 'Parashari Cross-Varga',
    involvedCharts: ['D1', 'D9', 'D10', 'D30', 'D45', 'D60'],
    involvedPlanets: ['Ma', 'Ve', 'Ra'],
    dictumRule:
      'Cross-Varga Dictum: "A planet that remains Vargottama across D-1, D-9, and D-10, gains directional strength (Digbala) in the 10th house of D-10 and D-45, owns its sign in D-30, and achieves Exaltation in D-60 becomes the supreme Yoga-giver of the chart despite tough house lordships in D-1."',
    chartApplication:
      'For Gemini Lagna, textbook astrology calls Mars (6th & 11th lord) a functional malefic placed in the 5th house with Rahu (Chitra). Yet look across the Vargas: Mars is in Libra in D-1 (H5), Libra in D-9 (H7 Swati), Libra in D-10 (H10 Swati with Digbala + Parivartana with Lagna-occupant Venus!), Own-Sign Aries in D-30 (H11), Digbala in D-45 (H10), and EXALTED in Capricorn in D-60 (H11)!',
    concretePrediction:
      'Every time life throws a 6th-house battle, competition, or crisis at you, your Mars wakes up. In your profession (D-10 10th house), you possess surgical execution speed, independent command, and the ability to build pioneering systems (Mars + Uranus in D-10 H10, Mars in Swati).',
    remedialAlignment:
      'Channel the intense Mars–Rahu (Chitra) 5th-house fire into architectural design, coding, fitness, or strategic analysis rather than interpersonal debate.',
  },
  {
    id: 'dictum-4-bnn-trinal-progression',
    number: 'DICTUM 04',
    title: 'Bhrigu Nandi Nadi (BNN) Trinal & Directional Circuits in D-1',
    techniqueCategory: 'Bhrigu Nandi Nadi (BNN)',
    involvedCharts: ['D1', 'D9', 'D10'],
    involvedPlanets: ['Ma', 'Ra', 'Mo', 'Sa', 'Ke', 'Ju'],
    dictumRule:
      'BNN Dictum: "Planets in the 1-5-9 Air Trine (Gemini, Libra, Aquarius) and 3-7-11 Fire Trine (Leo, Sagittarius, Aries) merge their energies into a single karmic circuit, modified by the next sign in zodiacal order."',
    chartApplication:
      '1) Air Trine (Libra + Aquarius): Mars + Rahu + Moon (Libra) link directly with Retrograde Saturn (Aquarius) -> Mo+Sa+Ra+Ma forms a classic BNN combination for deep technical/occult research, psychological intensity, and unconventional problem-solving, with Jupiter (Scorpio) sitting right in the 2nd from the Libra stellium to guide it.\n2) Fire Trine (Leo + Aries): Sun + Venus (Leo) link with Ketu (Aries) -> Creative, authoritative self-expression (Sun+Venus)infused with spiritual/intuitive precision (Ketu in Ashwini).',
    concretePrediction:
      'In BNN, Jupiter (Jeeva Karaka) in Scorpio (watery, secret 8th sign of the zodiac) flanked between Mars+Rahu+Moon (Libra) and Saturn (Aquarius) shows a native whose life purpose revolves around uncovering hidden truths, diagnostics, auditing, or transformative counseling.',
    remedialAlignment:
      'Keep your workspace structured and clutter-free (balancing Saturn + Rahu + Moon in the Air trine).',
  },
  {
    id: 'dictum-5-venus-debilitated-d9-d45-vs-digbala-d60',
    number: 'DICTUM 05',
    title: 'The Purva Phalguni Venus Paradox: Combust in D-1, Debilitated in D-9/D-45, Yogakaraka in D-10 & Digbala in D-60',
    techniqueCategory: 'Lunar Astro (Deepanshu Giri)',
    involvedCharts: ['D1', 'D9', 'D10', 'D45', 'D60'],
    involvedPlanets: ['Ve', 'Su', 'Me'],
    dictumRule:
      'Lunar Astro Dictum: "When Venus is within 3° of the Sun in Leo (Purva Phalguni) and falls into Virgo (debilitation) in the 6th house of D-9 and 1st house of D-45, relationships undergo karmic testing whenever transactional expectations or criticism (Virgo 6th) enter marriage—yet D-60 4th-house Digbala guarantees ultimate inner heart recovery."',
    chartApplication:
      'In D-1, Sun (14°09\') and Venus (17°07\') sit together in Leo (3rd house) in Purva Phalguni. In D-9, Venus drops to 4°01\' Virgo in the 6th house (conflict/service), while the 7th house of D-9 holds Vargottama Mars + Jupiter in Libra. However, in D-10 Venus is the #1 planet in the 1st house (Capricorn), and in D-60 Venus holds 100% Digbala in the 4th house (Gemini).',
    concretePrediction:
      'In career and public image (D-10 Lagna), Venus makes you magnetic, diplomatic, and respected. In marriage/partnerships (D-9 H6 Venus + H7 Mars-Jupiter), your partner is principled, dynamic, and strong-willed (Mars+Jupiter in Libra), and harmony requires replacing critical analysis (Virgo 6th) with conscious acts of service and shared dharmic goals.',
    remedialAlignment:
      'Respect your partner’s independence (Swati Mars in D-9 7th) and never bring perfectionistic critique (Virgo) into domestic intimacy.',
  },
  {
    id: 'dictum-6-ashtakavarga-sav-asymmetry',
    number: 'DICTUM 06',
    title: 'Sarvashtakavarga (SAV) Asymmetry: 37 Bindus in 1st House vs. 23 Bindus in 5th & 8th Houses',
    techniqueCategory: 'Ashtakavarga & Dasha',
    involvedCharts: ['D1', 'D9', 'D60'],
    involvedPlanets: ['Me', 'Mo', 'Ma', 'Ra', 'Ve'],
    dictumRule:
      'Parashari & Lunar Astro Ashtakavarga Dictum: "A Lagna with 37+ SAV bindus makes the native personally indestructible and self-reliant, while 23 bindus in the 5th house (containing Moon, Mars, Rahu) indicates that emotional speculation, impulsive romance, or over-thinking drains energy unless anchored in the 34-bindu 3rd house of skill and execution."',
    chartApplication:
      'From your uploaded Ashtakavarga table: House 1 (Gemini) = 37 bindus (Mercury contributes 6, Jupiter 7, Venus 7, Moon 6!). House 3 (Leo) = 34 bindus. House 6 (Scorpio) = 31 bindus. House 11 (Aries) = 30 bindus. Contrast this with House 5 (Libra) = 23 bindus and House 8 (Capricorn) = 23 bindus.',
    concretePrediction:
      'Whenever you rely on your own intellect, presence, and personal initiative (H1 = 37, H3 = 34) or competitive problem-solving (H6 = 31), you win effortlessly. Conversely, passive speculative gambling or emotional rumination (H5 = 23 bindus with Mo+Ma+Ra, plus Moon in 8th in D-45 & D-60) creates mental fatigue.',
    remedialAlignment:
      'Favour skill-based execution and systematic asset building (H1 37 / H3 34 / H11 30) over high-risk speculative trading (H5 23).',
  },
  {
    id: 'dictum-7-mercury-mahadasha-activation',
    number: 'DICTUM 07',
    title: 'Active Vimshottari Timeline: Transition from 19-Year Saturn Dasha into 17-Year Mercury Mahadasha (2025–2042)',
    techniqueCategory: 'Ashtakavarga & Dasha',
    involvedCharts: ['D1', 'D9', 'D10', 'D30', 'D60'],
    involvedPlanets: ['Me', 'Ke', 'Ve', 'Su'],
    dictumRule:
      'Dasha Synthesis Dictum: "Exiting a 19-year Retrograde Atmakaraka Saturn Mahadasha (ages 11–30) and entering the Mahadasha of an Exalted Lagna Lord (Mercury, ages 30–47) marks the great structural emancipation of the native’s life—shifting from heavy karmic endurance to intellectual sovereignty."',
    chartApplication:
      'From 30/10/2006 to 30/10/2025, you ran Saturn Mahadasha (retrograde 8th/9th lord at 28°34\'), which forged you through intense discipline, delays, and deep internal maturation. On October 30, 2025, you entered Mercury Mahadasha (running until October 30, 2042), starting with Mercury–Mercury (until 27/03/2028), followed by Mercury–Ketu (until 24/03/2029) and Mercury–Venus (24/03/2029 – 24/01/2032).',
    concretePrediction:
      '1) 2025–2028 (Me–Me): Establishment of your independent home base, consultancy, or specialized research authority (D-1 H4 Exalted, D-10 H8, D-60 H2).\n2) 2028–2029 (Me–Ke): Deep spiritual/occult breakthrough or international/digital pivot (D-9 H12 Me + D-60 H12 Ke).\n3) 2029–2032 (Me–Ve): Peak career & financial expansion as D-1 Lagna lord Mercury activates D-10 1st-house Yogakaraka Venus and D-60 4th-house Digbala Venus!',
    remedialAlignment:
      'Use the current 2025–2028 Mercury–Mercury sub-period to publish, credential, and solidify your core intellectual platform.',
  },
];

export const VIMSHOTTARI_DASHAS: DashaPeriod[] = [
  {
    mahadasha: 'Jupiter (16 Yrs)',
    periodRange: '01/09/1995 – 30/10/2006',
    isCurrent: false,
    coreTheme: 'Childhood Foundation & Early Learning',
    crossVargaActivation: 'D-1 6th house Scorpio (Anuradha) · Early analytical curiosity & health/environment sensitivity.',
  },
  {
    mahadasha: 'Saturn [R] (19 Yrs)',
    periodRange: '30/10/2006 – 30/10/2025',
    isCurrent: false,
    coreTheme: 'Karmic Crucible, Endurance & Deep Self-Forging',
    crossVargaActivation:
      'Atmakaraka Retrograde Saturn in 9th (D1), 3rd (D9), 11th (D10), Exalted 5th (D30), 9th (D60) · Built unshakeable grit through tests.',
  },
  {
    mahadasha: 'Mercury (17 Yrs) ★ ACTIVE NOW',
    periodRange: '30/10/2025 – 30/10/2042',
    isCurrent: true,
    coreTheme: 'Bhadra Mahapurusha Rise, Research Mastery & Wealth Consolidation',
    crossVargaActivation:
      'Me–Me (to Mar 2028), Me–Ke (to Mar 2029), Me–Ve (2029–2032) · Activates Exalted D1 H4, Mystical D9 H12, Research D10 H8 & Wealth D60 H2.',
  },
  {
    mahadasha: 'Ketu (7 Yrs)',
    periodRange: '30/10/2042 – 30/10/2049',
    isCurrent: false,
    coreTheme: 'Spiritual Autonomy, Niche Authority & Detachment',
    crossVargaActivation: 'D1 H11 (Ashwini), D9 H2 (Rohini), D10 H5, D60 H12 (Moksha) · Peak intuitive/advisory wisdom.',
  },
  {
    mahadasha: 'Venus (20 Yrs)',
    periodRange: '30/10/2049 – 30/10/2069',
    isCurrent: false,
    coreTheme: 'Crowning Legacy, Comfort & Sovereign Command',
    crossVargaActivation: 'D10 H1 Yogakaraka (Capricorn) + D60 H4 Full Digbala (Gemini) · Golden era of peace and institutional respect.',
  },
];

export const ASHTAKAVARGA_TABLE: AshtakavargaRow[] = [
  { signNumber: 1, signName: 'Aries', d1House: 11, sun: 4, moon: 5, mars: 3, mercury: 5, jupiter: 6, venus: 3, saturn: 4, totalSarvashtakavarga: 30, dictumNote: 'Strong 11th house of gains (Ketu in Ashwini)' },
  { signNumber: 2, signName: 'Taurus', d1House: 12, sun: 5, moon: 3, mars: 3, mercury: 4, jupiter: 5, venus: 4, saturn: 2, totalSarvashtakavarga: 26, dictumNote: '12th house < 11th house -> Positive net savings ratio' },
  { signNumber: 3, signName: 'Gemini', d1House: 1, sun: 3, moon: 6, mars: 3, mercury: 6, jupiter: 7, venus: 7, saturn: 5, totalSarvashtakavarga: 37, dictumNote: '★ Peak 37 Bindus in Ascendant -> Supreme personal resilience' },
  { signNumber: 4, signName: 'Cancer', d1House: 2, sun: 5, moon: 4, mars: 3, mercury: 5, jupiter: 4, venus: 4, saturn: 4, totalSarvashtakavarga: 29, dictumNote: 'Solid 2nd house resource accumulation' },
  { signNumber: 5, signName: 'Leo', d1House: 3, sun: 6, moon: 4, mars: 5, mercury: 5, jupiter: 4, venus: 5, saturn: 5, totalSarvashtakavarga: 34, dictumNote: '★ 34 Bindus in 3rd house (Su+Ve) -> Powerful self-effort & communication' },
  { signNumber: 6, signName: 'Virgo', d1House: 4, sun: 4, moon: 2, mars: 2, mercury: 5, jupiter: 5, venus: 6, saturn: 4, totalSarvashtakavarga: 28, dictumNote: 'Balanced 4th house anchored by Exalted Mercury' },
  { signNumber: 7, signName: 'Libra', d1House: 5, sun: 2, moon: 4, mars: 4, mercury: 4, jupiter: 4, venus: 4, saturn: 1, totalSarvashtakavarga: 23, dictumNote: '▲ Low 23 Bindus in 5th (Ma+Mo+Ra) -> Guard against emotional/speculative drain' },
  { signNumber: 8, signName: 'Scorpio', d1House: 6, sun: 5, moon: 5, mars: 4, mercury: 6, jupiter: 5, venus: 4, saturn: 2, totalSarvashtakavarga: 31, dictumNote: '★ 31 Bindus in 6th (Ju) -> Crushes obstacles & excels in forensic service' },
  { signNumber: 9, signName: 'Sagittarius', d1House: 7, sun: 2, moon: 5, mars: 3, mercury: 3, jupiter: 4, venus: 4, saturn: 3, totalSarvashtakavarga: 24, dictumNote: 'Moderate 7th house; requires conscious partnership communication' },
  { signNumber: 10, signName: 'Capricorn', d1House: 8, sun: 3, moon: 2, mars: 4, mercury: 5, jupiter: 5, venus: 3, saturn: 1, totalSarvashtakavarga: 23, dictumNote: 'Low 8th house bindus -> Avoid sudden physical overexertion' },
  { signNumber: 11, signName: 'Aquarius', d1House: 9, sun: 4, moon: 4, mars: 2, mercury: 2, jupiter: 5, venus: 4, saturn: 3, totalSarvashtakavarga: 24, dictumNote: '9th house (Retrograde Sa) -> Dharma earned through deep inquiry' },
  { signNumber: 12, signName: 'Pisces', d1House: 10, sun: 5, moon: 5, mars: 3, mercury: 4, jupiter: 2, venus: 4, saturn: 5, totalSarvashtakavarga: 28, dictumNote: '28 Bindus in 10th -> Steady career authority supported by Sun & Saturn' },
];

export const LAGNA_SIGN = 12; // Default D-60 Pisces Lagna for deep D-60 inspector compatibility

export const PLANET_PLACEMENTS: PlanetPlacement[] = [
  {
    id: 'sun',
    symbol: 'Su',
    name: 'Sun',
    sanskritName: 'Surya',
    house: 10,
    signNumber: 9,
    signName: 'Sagittarius',
    sanskritSign: 'Dhanu',
    signLord: 'Jupiter',
    ruledHouses: [6],
    dignity: 'Friendly Sign',
    isTraditional: true,
    specialAspects: [7],
    aspectedHouses: computeAspectedHouses(10, [7]),
    wellBeingRole: 'D1: H3 Leo (Own, 14°09\' Purva Phalguni) · D9: H5 Leo (Vargottama) · D60: H10 Sagittarius (Digbala)',
    karmicReading:
      'Across your entire Shodashvarga, the Sun is a pillar of dignity: Own-sign Leo in D-1 (3rd), Solar Hora in D-2 (2nd), Vargottama Leo in D-9 (5th, Magha), and 100% Digbala in D-60 (10th, Sagittarius). Past-life administrative, dharmic, and creative authority protects your vitality and self-command.',
    remedialFocus: 'Lead through mentorship and ethical transparency; honor ancestral lineages (Magha/Purva Phalguni).'
  },
  {
    id: 'moon',
    symbol: 'Mo',
    name: 'Moon',
    sanskritName: 'Chandra',
    house: 8,
    signNumber: 7,
    signName: 'Libra',
    sanskritSign: 'Tula',
    signLord: 'Venus',
    ruledHouses: [5],
    dignity: 'Neutral Sign',
    isTraditional: true,
    specialAspects: [7],
    aspectedHouses: computeAspectedHouses(8, [7]),
    wellBeingRole: 'D1: H5 Libra (24°01\' Vishakha-2, AmK) · D9: H2 Taurus (Exalted!) · D45 & D60: H8 (Psychic Depth)',
    karmicReading:
      'As your Amatyakaraka (24°01\'), the Moon is Exalted in D-9 (2nd house Taurus) and in its Own Sign in D-2 & D-4, granting superb financial intuition. However, in D-1 it sits in a 23-bindu 5th house with Mars+Rahu, and in BOTH D-45 and D-60 it occupies the 8th house—confirming intense psychic sensitivity and emotional churning.',
    remedialFocus: 'Guard emotional boundaries strictly; never make major decisions during late-night emotional fatigue.'
  },
  {
    id: 'mars',
    symbol: 'Ma',
    name: 'Mars',
    sanskritName: 'Mangala',
    house: 11,
    signNumber: 10,
    signName: 'Capricorn',
    sanskritSign: 'Makara',
    signLord: 'Saturn',
    ruledHouses: [2, 9],
    dignity: 'Exalted',
    isTraditional: true,
    specialAspects: [4, 7, 8],
    aspectedHouses: computeAspectedHouses(11, [4, 7, 8]),
    wellBeingRole: 'Triple-Vargottama Libra (D1 H5, D9 H7, D10 H10 Digbala) · D30: Own Sign · D60: Exalted H11!',
    karmicReading:
      'Mars is the hidden superstar of your entire multi-chart matrix. It stays Vargottama in Libra across D-1 (Chitra), D-9 (Swati), and D-10 (Swati, 10th house with full Digbala!), sits in its own sign Aries in D-30 (11th), holds Digbala in D-45 (10th), and is Exalted in Capricorn in D-60 (11th), canceling Jupiter’s debilitation.',
    remedialFocus: 'Direct your fierce Chitra/Swati engineering & executive focus into high-stakes career building.'
  },
  {
    id: 'mercury',
    symbol: 'Me',
    name: 'Mercury',
    sanskritName: 'Budha',
    house: 2,
    signNumber: 1,
    signName: 'Aries',
    sanskritSign: 'Mesha',
    signLord: 'Mars',
    ruledHouses: [4, 7],
    dignity: 'Debilitated (D1 Exalted -> D9 Debil)',
    isTraditional: true,
    specialAspects: [7],
    aspectedHouses: computeAspectedHouses(2, [7]),
    wellBeingRole: 'ACTIVE MAHADASA LORD (2025–2042) · D1 & D30: Exalted H4 · D9: Debilitated H12 · D10: H8 Leo · D60: H2 Aries',
    karmicReading:
      'Following Deepanshu Giri’s signature cross-varga rule: your Lagna lord Mercury is Exalted in D-1 (Virgo 4th) and D-30 (4th), but becomes Debilitated in D-9 (Pisces 12th, Revati) and occupies the 8th house in D-10 (Magha) and 6th house in D-45 (Aquarius). In your current 2025–2042 Mercury Mahadasha, surface analytical skills evolve into deep research, occult/astrological mastery, and global consulting.',
    remedialFocus: 'Allow your intellect to move beyond rigid Virgo perfectionism into intuitive Pisces/8th-house synthesis.'
  },
  {
    id: 'jupiter',
    symbol: 'Ju',
    name: 'Jupiter',
    sanskritName: 'Guru',
    house: 11,
    signNumber: 10,
    signName: 'Capricorn',
    sanskritSign: 'Makara',
    signLord: 'Saturn',
    ruledHouses: [1, 10],
    dignity: 'Debilitated (Cancelled)',
    isTraditional: true,
    specialAspects: [5, 7, 9],
    aspectedHouses: computeAspectedHouses(11, [5, 7, 9]),
    wellBeingRole: 'D1: H6 Scorpio (Anuradha) · D10: H11 Scorpio (Vargottama!) · D30 H10 & D45 H7: Own Sign Pisces · D60: H11 NB',
    karmicReading:
      'Jupiter is Vargottama in Scorpio (Anuradha Nakshatra) across D-1 (6th house) and D-10 (11th house), sits in its Own Sign Pisces in D-30 (10th) and D-45 (7th), and forms Neecha Bhanga Raja Yoga with Exalted Mars in D-60 (11th). This links 6th-house diagnostic/forensic service directly to 11th-house institutional gains.',
    remedialFocus: 'Serve as a trusted advisor, healer, or auditor; your wisdom shines brightest when resolving complex crises.'
  },
  {
    id: 'venus',
    symbol: 'Ve',
    name: 'Venus',
    sanskritName: 'Shukra',
    house: 4,
    signNumber: 3,
    signName: 'Gemini',
    sanskritSign: 'Mithuna',
    signLord: 'Mercury',
    ruledHouses: [3, 8],
    dignity: 'Friendly Sign',
    isTraditional: true,
    specialAspects: [7],
    aspectedHouses: computeAspectedHouses(4, [7]),
    wellBeingRole: 'D1: H3 Leo (Purva Phalguni) · D9 H6 & D45 H1: Debilitated Virgo · D10: H1 Yogakaraka · D60: H4 Digbala',
    karmicReading:
      'Venus is a study in contrast: Debilitated in Virgo in D-9 (6th house) and D-45 (1st house), warning against overly critical or transactional dynamics in relationships. Yet in D-10 it sits in the 1st house (Capricorn) as Yogakaraka, and in D-60 it holds 100% Digbala in the 4th house—granting public grace and deep inner renewal.',
    remedialFocus: 'Practice unconditional acceptance in marriage/partnerships while leveraging your natural diplomacy in career.'
  },
  {
    id: 'saturn',
    symbol: 'Sa',
    name: 'Saturn',
    sanskritName: 'Shani',
    house: 9,
    signNumber: 8,
    signName: 'Scorpio',
    sanskritSign: 'Vrishchika',
    signLord: 'Mars',
    ruledHouses: [11, 12],
    dignity: 'Enemy Sign',
    isTraditional: true,
    specialAspects: [3, 7, 10],
    aspectedHouses: computeAspectedHouses(9, [3, 7, 10]),
    wellBeingRole: 'ATMAKARAKA (28°34\') · D1: H9 Aquarius [R] · D10: H11 Scorpio · D30: Exalted H5 · D45: Own H6 · D60: H9',
    karmicReading:
      'Retrograde Atmakaraka Saturn sits in the 9th house in D-1 (Aquarius), D-4 (Scorpio), and D-60 (Scorpio), is Exalted in D-30 (5th), Own-Sign in D-45 (6th), and rules the D-10 Ascendant from the 11th house (Scorpio, Anuradha). Your soul’s highest evolution comes through truth-seeking, structural endurance, and dharmic accountability.',
    remedialFocus: 'Fulfill every commitment to mentors, elders, and long-term institutional responsibilities.'
  },
  {
    id: 'rahu',
    symbol: 'Ra',
    name: 'Rahu',
    sanskritName: 'Rahu (North Node)',
    house: 6,
    signNumber: 5,
    signName: 'Leo',
    sanskritSign: 'Simha',
    signLord: 'Sun',
    ruledHouses: [],
    dignity: 'Enemy Sign',
    isTraditional: true,
    specialAspects: [5, 7, 9],
    aspectedHouses: computeAspectedHouses(6, [5, 7, 9]),
    wellBeingRole: 'D1: H5 Libra (Chitra) · D9 H8, D10 H11 & D45 H3: Scorpio · D60: H6 Leo (Obstacle Crusher)',
    karmicReading:
      'Rahu repeatedly occupies Scorpio across D-9 (8th), D-10 (11th, Jyeshtha), and D-45 (3rd), while sitting in Chitra (5th) in D-1 and Leo (6th) in D-60. This gives a fearless investigative mind capable of penetrating black-box systems, occult sciences, and high-stakes professional arenas.',
    remedialFocus: 'Avoid obsessive mental loops in the 5th house; channel Rahu’s research intensity into structured outputs.'
  },
  {
    id: 'ketu',
    symbol: 'Ke',
    name: 'Ketu',
    sanskritName: 'Ketu (South Node)',
    house: 12,
    signNumber: 11,
    signName: 'Aquarius',
    sanskritSign: 'Kumbha',
    signLord: 'Saturn',
    ruledHouses: [],
    dignity: 'Friendly Sign',
    isTraditional: true,
    specialAspects: [5, 7, 9],
    aspectedHouses: computeAspectedHouses(12, [5, 7, 9]),
    wellBeingRole: 'D1: H11 Aries (Ashwini) · D9: H2 Taurus (Rohini) · D10: H5 Taurus · D60: H12 Aquarius (Moksha)',
    karmicReading:
      'Ketu in Ashwini (D-1 11th), Rohini (D-9 2nd & D-10 5th), and Aquarius (D-60 12th) bestows innate diagnostic/healing intuition, past-life mastery over mantra and subtle sciences, and ultimate spiritual liberation.',
    remedialFocus: 'Protect daily meditative solitude and trust your first intuitive flash.'
  },
  {
    id: 'uranus',
    symbol: 'Ur',
    name: 'Uranus',
    sanskritName: 'Prajapati / Arun',
    house: 5,
    signNumber: 4,
    signName: 'Cancer',
    sanskritSign: 'Karka',
    signLord: 'Moon',
    ruledHouses: [],
    dignity: 'Trans-Saturnian',
    isTraditional: false,
    specialAspects: [7],
    aspectedHouses: computeAspectedHouses(5, [7]),
    wellBeingRole: 'D1: H8 Capricorn · D9 & D10: H10 · D60: H5 Cancer',
    karmicReading:
      'Conjunct Mars in the 10th house of D-10 and placed in the 10th house of D-9, Uranus electrifies your career with sudden technological, engineering, or paradigm-shifting breakthroughs.',
    remedialFocus: 'Ground sudden flashes of innovation into repeatable frameworks.'
  },
  {
    id: 'neptune',
    symbol: 'Ne',
    name: 'Neptune',
    sanskritName: 'Varuna',
    house: 8,
    signNumber: 7,
    signName: 'Libra',
    sanskritSign: 'Tula',
    signLord: 'Venus',
    ruledHouses: [],
    dignity: 'Trans-Saturnian',
    isTraditional: false,
    specialAspects: [7],
    aspectedHouses: computeAspectedHouses(8, [7]),
    wellBeingRole: 'D1: H7 Sagittarius (29°13\') · D9 & D10: H9 · D60: H8 Libra (with Moon)',
    karmicReading:
      'Placed in the 9th house of both D-9 and D-10 and conjunct the Moon in D-60 (8th), Neptune amplifies mystical perception, prophetic dreams, and sensitivity to subtle environments.',
    remedialFocus: 'Maintain clear energetic and emotional boundaries in close partnerships.'
  },
  {
    id: 'pluto',
    symbol: 'Pl',
    name: 'Pluto',
    sanskritName: 'Yama',
    house: 5,
    signNumber: 4,
    signName: 'Cancer',
    sanskritSign: 'Karka',
    signLord: 'Moon',
    ruledHouses: [],
    dignity: 'Trans-Saturnian',
    isTraditional: false,
    specialAspects: [7],
    aspectedHouses: computeAspectedHouses(5, [7]),
    wellBeingRole: 'D1: H6 Scorpio (with Ju) · D9: H5 Leo (with Su) · D10: H8 Leo (with Me) · D60: H5 Cancer',
    karmicReading:
      'Pluto travels closely with your key intellectual planets—conjunct Jupiter in D-1 (6th), Sun in D-9 (5th), and Mercury in D-10 (8th) & D-45 (6th)—giving X-ray forensic depth.',
    remedialFocus: 'Use deep investigative power for constructive transformation.'
  }
];

export const HOUSE_DETAILS: HouseDetail[] = [
  {
    house: 1,
    bhavaName: 'Tanu Bhava',
    domainTitle: 'Constitutional Vitality, Soul Orientation & Self-Mastery',
    signNumber: 12,
    signName: 'Pisces',
    sanskritSign: 'Meena',
    element: 'Water',
    modality: 'Dual',
    lord: 'Jupiter',
    lordPlacedInHouse: 11,
    occupants: [],
    aspectedBy: [],
    karmicTheme: '37-Bindu D1 Gemini Lagna + Unblemished D60 Pisces Lagna',
    synthesis:
      'Comparing D-1 (Gemini Lagna with 37 SAV bindus and Exalted Lagna lord Mercury in 4th) with D-60 (Pisces Lagna with Lagna lord Jupiter in 11th in Neecha Bhanga Raja Yoga): your physical and intellectual constitution is remarkably self-renewing. Even when tested by crises (Vargottama Gemini Lagna in D-30), you emerge stronger.',
    strengthLevel: 'Strong'
  },
  {
    house: 2,
    bhavaName: 'Dhana Bhava',
    domainTitle: 'Accumulated Wealth, Speech, Family Lineage & Sustenance',
    signNumber: 1,
    signName: 'Aries',
    sanskritSign: 'Mesha',
    element: 'Fire',
    modality: 'Movable',
    lord: 'Mars',
    lordPlacedInHouse: 11,
    occupants: ['Me'],
    aspectedBy: ['Mo', 'Ma', 'Ra', 'Ne'],
    karmicTheme: 'Exalted Moon in D9 H2 + Active Dasha Lord Mercury in D60 H2',
    synthesis:
      'In D-1, 2nd lord Moon goes to the 5th (29 SAV bindus in H2). In D-2 Hora, 4 fiery planets occupy the 2nd house (Leo). In D-9, the Moon is Exalted in Taurus in the 2nd house with Ketu. And in D-60, current Mahadasha lord Mercury sits in the 2nd house aspected by Exalted 2nd-lord Mars from the 11th! Speech and specialized knowledge are your primary wealth engines.',
    strengthLevel: 'Strong'
  },
  {
    house: 3,
    bhavaName: 'Sahaja Bhava',
    domainTitle: 'Courage, Communication, Technical Skill & Self-Made Initiative',
    signNumber: 2,
    signName: 'Taurus',
    sanskritSign: 'Vrishabha',
    element: 'Earth',
    modality: 'Fixed',
    lord: 'Venus',
    lordPlacedInHouse: 4,
    occupants: [],
    aspectedBy: ['Ju', 'Sa'],
    karmicTheme: '34-Bindu D1 3rd House (Sun + Venus in Leo) + Saturn in D9 3rd',
    synthesis:
      'Your 3rd house in D-1 holds 34 SAV bindus with Own-Sign Sun and Venus in Purva Phalguni, while Saturn occupies the 3rd house (Gemini, Ardra) in D-9, and Nodes occupy the 3rd house (Scorpio) in D-45. Everything you build is earned through your own hands, investigative writing/communication, and fearless technical skill.',
    strengthLevel: 'Strong'
  },
  {
    house: 4,
    bhavaName: 'Sukha Bhava',
    domainTitle: 'Inner Peace, Home Sanctuary, Property & Heart Contentment',
    signNumber: 3,
    signName: 'Gemini',
    sanskritSign: 'Mithuna',
    element: 'Air',
    modality: 'Dual',
    lord: 'Mercury',
    lordPlacedInHouse: 2,
    occupants: ['Ve'],
    aspectedBy: ['Su', 'Ke'],
    karmicTheme: 'Bhadra Mahapurusha Mercury in D1 & D30 H4 + Digbala Venus in D60 H4',
    synthesis:
      'One of the most fortified houses across all charts: Exalted Mercury in Virgo occupies the 4th house in both D-1 and D-30, while Venus holds 100% Digbala in the 4th house (Gemini) of D-60! Your home environment, library/study space, and inner aesthetic sanctuary are your ultimate sources of rejuvenation.',
    strengthLevel: 'Strong'
  },
  {
    house: 5,
    bhavaName: 'Putra Bhava',
    domainTitle: 'Purva Punya, Deep Research Intelligence, Speculation & Progeny',
    signNumber: 4,
    signName: 'Cancer',
    sanskritSign: 'Karka',
    element: 'Water',
    modality: 'Movable',
    lord: 'Moon',
    lordPlacedInHouse: 8,
    occupants: ['Pl', 'Ur'],
    aspectedBy: ['Ma', 'Ju'],
    karmicTheme: 'D1 H5 (Ma+Mo+Ra in Libra, 23 SAV) vs. D9 H5 Vargottama Sun & D30 H5 Exalted Saturn',
    synthesis:
      'In D-1, the 5th house (Libra) holds Mars + Rahu (Chitra) + Moon (Vishakha) with a low 23 SAV bindus—creating intense mental churning and warning against impulsive financial speculation or volatile romance. Yet D-9 (Vargottama Sun in Leo H5), D-4 (Own-sign Moon in Cancer H5), D-30 (Exalted Saturn in Libra H5), and D-60 (Jupiter + Exalted Mars aspecting H5) turn this churning into brilliant research and diagnostic intelligence.',
    strengthLevel: 'Balanced'
  },
  {
    house: 6,
    bhavaName: 'Ripu / Roga Bhava',
    domainTitle: 'Forensic Problem-Solving, Service, Litigation & Immunity',
    signNumber: 5,
    signName: 'Leo',
    sanskritSign: 'Simha',
    element: 'Fire',
    modality: 'Fixed',
    lord: 'Sun',
    lordPlacedInHouse: 10,
    occupants: ['Ra'],
    aspectedBy: ['Ma', 'Sa', 'Ke'],
    karmicTheme: '31-Bindu D1 H6 (Jupiter in Anuradha) + D45 H6 (Sa+Me) + D60 H6 (Rahu)',
    synthesis:
      'Following Lunar Astro’s 6th-house service dictum: with 31 SAV bindus and 10th-lord Jupiter in Scorpio (Anuradha) in D-1 H6, Own-sign Saturn + Lagna lord Mercury in D-45 H6, and Rahu in Leo in D-60 H6, you are wired to diagnose and solve other people’s complex problems (law, medicine, auditing, engineering troubleshooting, or astrological counseling).',
    strengthLevel: 'Strong'
  },
  {
    house: 7,
    bhavaName: 'Kalatra Bhava',
    domainTitle: 'Marriage, Spouse Dynamics, Contracts & Public Counterparts',
    signNumber: 6,
    signName: 'Virgo',
    sanskritSign: 'Kanya',
    element: 'Earth',
    modality: 'Dual',
    lord: 'Mercury',
    lordPlacedInHouse: 2,
    occupants: [],
    aspectedBy: ['Ju'],
    karmicTheme: 'D9 H7 (Vargottama Mars + Jupiter in Libra) + D60 H7 Aspected by Lagna Lord Ju',
    synthesis:
      'In D-1, 7th lord Jupiter goes to the 6th house (Scorpio), and in D-9, Venus is debilitated in the 6th house (Virgo)—indicating that marriage requires conscious maturity, service, and avoiding petty debate. However, D-9 7th house holds Vargottama Mars (Swati) + Jupiter (Vishakha), D-45 7th holds Own-Sign Jupiter, and D-60 7th receives Jupiter’s 9th aspect—promising a principled, intelligent, and loyal partner when ego clashes are set aside.',
    strengthLevel: 'Balanced'
  },
  {
    house: 8,
    bhavaName: 'Ayur Bhava',
    domainTitle: 'Occult Mastery, Deep Research, Transformation & Psychosomatic Vigilance',
    signNumber: 7,
    signName: 'Libra',
    sanskritSign: 'Tula',
    element: 'Air',
    modality: 'Movable',
    lord: 'Venus',
    lordPlacedInHouse: 4,
    occupants: ['Ne', 'Mo'],
    aspectedBy: ['Me', 'Ke'],
    karmicTheme: 'D9 H8 (Rahu in Scorpio) + D10 H8 (Me+Pl in Magha) + D45 & D60 H8 (Moon)',
    synthesis:
      'Notice the unmistakable cross-chart pattern: Rahu in Scorpio in D-9 H8, Mercury + Pluto in Leo (Magha) in D-10 H8, and the Moon in the 8th house in BOTH D-45 and D-60! This gives extraordinary X-ray intuition for occult sciences, research, and hidden truths, while reminding you to protect your nervous system and sleep hygiene.',
    strengthLevel: 'Karmic Test'
  },
  {
    house: 9,
    bhavaName: 'Dharma / Bhagya Bhava',
    domainTitle: 'Higher Dharma, Gurus, Long-Term Fortune & Past-Life Pending Vows',
    signNumber: 8,
    signName: 'Scorpio',
    sanskritSign: 'Vrishchika',
    element: 'Water',
    modality: 'Fixed',
    lord: 'Mars',
    lordPlacedInHouse: 11,
    occupants: ['Sa'],
    aspectedBy: [],
    karmicTheme: 'Retrograde Atmakaraka Saturn in H9 across D1 (Aquarius), D4 (Scorpio) & D60 (Scorpio)',
    synthesis:
      'Saturn occupies the 9th house in D-1 (Retrograde at 28°34\' Aquarius), D-4 (Scorpio), and D-60 (Scorpio, in Parivartana with Exalted Mars in 11th). In Lunar Astro predictive rules, a repeating 9th-house Retrograde Atmakaraka Saturn shows deep dharmic duty: your fortune unlocks fully after age 30–32 as you step into ethical teaching and structural leadership.',
    strengthLevel: 'Strong'
  },
  {
    house: 10,
    bhavaName: 'Karma Bhava',
    domainTitle: 'Profession, Executive Command, Reputation & Sovereign Action',
    signNumber: 9,
    signName: 'Sagittarius',
    sanskritSign: 'Dhanu',
    element: 'Fire',
    modality: 'Dual',
    lord: 'Jupiter',
    lordPlacedInHouse: 11,
    occupants: ['Su'],
    aspectedBy: ['Ve', 'Ra'],
    karmicTheme: 'D10 H10 Digbala Vargottama Mars + D30 H10 Own-Sign Ju + D45 H10 Digbala Mars + D60 H10 Digbala Sun',
    synthesis:
      'Look at the 10th house across your divisional charts: in D-4, Mercury sits in H10; in D-10, Vargottama Mars sits in H10 with 100% Digbala; in D-30, Own-Sign Jupiter sits in H10; in D-45, Mars sits in H10 with 100% Digbala; and in D-60, Sun sits in H10 with 100% Digbala! This is an unmistakable signature of an independent authority, strategist, and leader.',
    strengthLevel: 'Strong'
  },
  {
    house: 11,
    bhavaName: 'Labha Bhava',
    domainTitle: 'Institutional Gains, Fulfillment of Desires & Network Elevation',
    signNumber: 10,
    signName: 'Capricorn',
    sanskritSign: 'Makara',
    element: 'Earth',
    modality: 'Movable',
    lord: 'Saturn',
    lordPlacedInHouse: 9,
    occupants: ['Ju', 'Ma'],
    aspectedBy: ['Sa', 'Ur', 'Pl'],
    karmicTheme: '30-Bindu D1 H11 (Ke) + D10 H11 (Sa+Ju+Ra in Scorpio) + D30 H11 (Own-Sign Ma) + D60 H11 (Exalted Ma + Ju)',
    synthesis:
      'The 11th house is the grand convergence point of your horoscope. In D-10, Lagna lord Saturn, Jupiter (both in Anuradha), and Rahu unite in the 11th house (Scorpio). In D-30, Own-Sign Mars sits in the 11th. And in D-60, Exalted Mars and Lagna lord Jupiter form Neecha Bhanga Raja Yoga in the 11th house—guaranteeing that sustained effort yields massive professional and financial rewards.',
    strengthLevel: 'Strong'
  },
  {
    house: 12,
    bhavaName: 'Vyaya / Moksha Bhava',
    domainTitle: 'Global Reach, Subconscious Release, Spiritual Sanctuary & Moksha',
    signNumber: 11,
    signName: 'Aquarius',
    sanskritSign: 'Kumbha',
    element: 'Air',
    modality: 'Fixed',
    lord: 'Saturn',
    lordPlacedInHouse: 9,
    occupants: ['Ke'],
    aspectedBy: ['Ra'],
    karmicTheme: 'D4 H12 (Ve+Ju) + D9 H12 (Me in Revati) + D10 H12 (Su) + D60 H12 (Ketu in Aquarius)',
    synthesis:
      'With Venus+Jupiter in D-4 H12, Mercury in Revati in D-9 H12, Sun in D-10 H12, and Ketu in Aquarius in D-60 H12, you have strong ties to foreign lands, global/remote advisory work, research retreats, and authentic spiritual emancipation.',
    strengthLevel: 'Strong'
  }
];

export const KARMIC_YOGAS: KarmicYoga[] = [
  {
    id: 'bhadra-to-mystic-mercury',
    name: 'D-1 Bhadra Mahapurusha Yoga -> D-9/D-10 Research Inversion',
    sanskritTerm: 'भद्र महापुरुष योग एवं नवमांश-दशमांश शोध परिवर्तन',
    involvedPlanets: ['Me', 'Ju', 'Sa'],
    involvedHouses: [1, 4, 8, 12],
    category: 'Kendra-Trikona',
    impactSummary:
      'Lagna & 4th lord Mercury Exalted in D-1 & D-30 (H4 Virgo), shifting to D-9 H12 (Pisces/Revati), D-10 H8 (Leo/Magha), and D-60 H2 (Aries).',
    detailedExplanation:
      'In Parashari + Lunar Astro synthesis, Bhadra Mahapurusha Yoga in D-1 grants razor-sharp analytical intellect, while its D-9 12th-house and D-10 8th-house placements ensure that during Mercury Mahadasha (2025–2042) your intellect transcends ordinary clerical work into high-level research, predictive sciences, auditing, or global strategy.'
  },
  {
    id: 'triple-vargottama-digbala-mars',
    name: 'Triple-Vargottama Mars (D1, D9, D10) + D60 Exaltation & Neecha Bhanga',
    sanskritTerm: 'त्रिवर्गोत्तम दिग्बली मंगल एवं षष्ट्यंश नीचभंग राजयोग',
    involvedPlanets: ['Ma', 'Ju', 'Ve'],
    involvedHouses: [5, 7, 10, 11],
    category: 'Neecha Bhanga',
    impactSummary:
      'Mars stays in Libra across D-1 (Chitra), D-9 (Swati), and D-10 (Swati, H10 Digbala), sits in Own Sign in D-30 (H11), and is Exalted in D-60 (H11) canceling Jupiter’s debilitation.',
    detailedExplanation:
      'Also locked in a 1st–10th sign exchange with Yogakaraka Venus in D-10 and a 9th–11th sign exchange with Saturn in D-60, Mars provides unstoppable professional execution and crisis recovery.'
  },
  {
    id: 'anuradha-purvabhadra-nakshatra-exchange',
    name: 'Atmakaraka Saturn [R] & Jupiter Nakshatra Parivartana + D10 H11 Conjunction',
    sanskritTerm: 'आत्मकारक शनि-गुरु नक्षत्र परिवर्तन एवं दशमांश लाभ युति',
    involvedPlanets: ['Sa', 'Ju', 'Ra'],
    involvedHouses: [6, 9, 10, 11],
    category: 'Raja Yoga',
    impactSummary:
      'In D-1, Retrograde Saturn (9th house, Purva Bhadrapada — Jupiter’s star) exchanges Nakshatras with 10th lord Jupiter (6th house, Anuradha — Saturn’s star), then conjoins in Anuradha in D-10 H11!',
    detailedExplanation:
      'A textbook Deepanshu Giri Nakshatra technique: when the 9th lord and 10th lord exchange constellations in D-1 and unite in the 11th house of D-10 (Scorpio, Anuradha), the native achieves enduring institutional authority by solving complex 6th-house challenges with 9th-house dharmic integrity.'
  },
  {
    id: 'dual-digbala-axis',
    name: 'Multi-Varga Directional Strength (Digbala) Fortress',
    sanskritTerm: 'बहु-वर्ग दिग्बल कवच (चतुर्थ-दशम अक्ष)',
    involvedPlanets: ['Ve', 'Su', 'Ma'],
    involvedHouses: [4, 10],
    category: 'Karmic Axis',
    impactSummary:
      'Mars holds 100% Digbala in D-10 (H10) & D-45 (H10), while Venus (H4) and Sun (H10) hold Simultaneous 100% Digbala in D-60!',
    detailedExplanation:
      'Having multiple planets achieve full directional strength (Digbala) across D-10, D-45, and D-60 guarantees that you never lose your compass in professional or personal storms.'
  }
];

export const LIFE_PILLARS: LifePillar[] = [
  {
    id: 'd10-d60-career-command',
    title: 'Profession, Authority & Wealth Execution (D-1, D-2, D-10, D-60)',
    subtitle: 'D10 Capricorn Lagna (Ve in H1, Ma in H10, Sa+Ju+Ra in H11) + D60 H11 Guru-Mangala',
    primaryHouses: [1, 2, 10, 11],
    keyPlanets: ['Ma', 'Ve', 'Sa', 'Ju', 'Me'],
    statusLabel: '● ELEVATED STRENGTH',
    score: 96,
    summary:
      'Your professional architecture (D-10 + D-60) is extraordinary. Yogakaraka Venus in D-10 H1 exchanges signs with Digbala Vargottama Mars in H10, while Lagna lord Saturn, Jupiter, and Rahu occupy H11 (Scorpio). In Mercury Mahadasha (2025–2042), deep research and advisory leadership unlock peak financial rewards.',
    actionableGuidance: [
      'Position yourself in roles requiring deep diagnostic, analytical, research, or strategic authority (D-1 H6 Ju + D-10 H8 Me + D-10 H11 Sa-Ju-Ra).',
      'Leverage the 2025–2032 Mercury–Mercury, Mercury–Ketu, and Mercury–Venus periods to establish an independent brand or advisory practice.',
      'Rely on your 37-bindu Lagna and 34-bindu 3rd house: lead from the front rather than waiting for passive luck.'
    ]
  },
  {
    id: 'd9-d60-relationships-dharma',
    title: 'Marriage, Partnerships & Relational Equilibrium (D-1, D-9, D-45, D-60)',
    subtitle: 'D9 Aries Lagna (Ve in H6 Virgo, Vargottama Ma + Ju in H7 Libra) + D60 H4 Digbala Ve',
    primaryHouses: [3, 4, 6, 7],
    keyPlanets: ['Ve', 'Ma', 'Ju', 'Me'],
    statusLabel: '◆ BALANCED FLOW',
    score: 84,
    summary:
      'In D-9, the 7th house holds Vargottama Mars (Swati) and Jupiter (Vishakha), indicating a dynamic, principled, and independent spouse. However, because 7th lord Jupiter is in D-1 H6 and Venus is debilitated in Virgo in D-9 H6 and D-45 H1, relationships require conscious humility and zero nitpicking.',
    actionableGuidance: [
      'Never bring Virgo-style analytical criticism or 6th-house debate into romantic or domestic life.',
      'Engage in shared dharmic, fitness, or service-oriented activities with your partner to harmonize D-9 H6 Venus and H7 Mars-Jupiter.',
      'Lean on your D-60 4th-house Digbala Venus—cultivate beauty, music, and warmth at home.'
    ]
  },
  {
    id: 'd30-d60-mental-health-vitality',
    title: 'Psychosomatic Well-Being & Crisis Resilience (D-1, D-30, D-45, D-60)',
    subtitle: 'D1 H5 (Ma+Mo+Ra, 23 SAV) + D45 & D60 H8 Moon vs. D30 Exalted Me/Sa & Own Ju/Ma',
    primaryHouses: [1, 5, 6, 8],
    keyPlanets: ['Mo', 'Ra', 'Ma', 'Ju', 'Sa'],
    statusLabel: '▲ KARMIC VIGILANCE',
    score: 79,
    summary:
      'Your physical crisis resilience (D-30) is near-invincible (Exalted Me, Exalted Sa, Own-sign Ju & Ma). Your only true vulnerability across all charts is emotional/nervous over-churning: D-1 Moon with Mars+Rahu in a 23-bindu 5th house, echoed by Moon in the 8th house in both D-45 and D-60.',
    actionableGuidance: [
      'Protect your Moon in the 8th (D-45/D-60): prioritize uninterrupted sleep, evening digital detox, and hydration.',
      'Watch Pitta/inflammation and digestive acidity (D-1 Leo H3 Su+Ve, D-60 Leo H6 Ra aspected by Ma).',
      'Avoid high-stress speculative day-trading (23 bindus in D-1 H5); channel 5th-house Chitra/Vishakha into deep technical mastery.'
    ]
  },
  {
    id: 'pending-karma-spiritual',
    title: 'Pending Past-Life Karma & Moksha Evolution (Atmakaraka Sa + Ketu)',
    subtitle: 'Retrograde AK Saturn (28°34\' H9) + Ketu in D1 H11 (Ashwini), D9 H2 (Rohini) & D60 H12 (Aquarius)',
    primaryHouses: [5, 9, 11, 12],
    keyPlanets: ['Sa', 'Ke', 'Ju'],
    statusLabel: '● ELEVATED STRENGTH',
    score: 93,
    summary:
      'With Retrograde Atmakaraka Saturn in the 9th house of D-1, D-4, and D-60, and Ketu in the 12th house of D-60, your soul carries deep contemplative maturity from past lives. Completing your duties to teachers, lineage, and truth unlocks effortless spiritual peace.',
    actionableGuidance: [
      'Study Jyotish, philosophy, or sacred texts systematically—your D-9 H12 Mercury + D-10 H8 Mercury + D-60 H12 Ketu is a natural predictive astrologer/researcher combination.',
      'Keep every vow made to mentors or elders (9th house Retrograde Atmakaraka Saturn).',
      'Balance intense analytical work with quiet contemplative solitude.'
    ]
  }
];

export const UPLOADED_CHART_GALLERY = [
  { id: 'img-d1-full', title: 'Master Horoscope Sheet (D1, D9, Dashas, Ashtakavarga, Chalit)', varga: 'D1', path: '/assets/aistudio/IMG_7800_0daa28f8.jpeg' },
  { id: 'img-d1', title: 'Lagna Chart (D-1 Gemini Ascendant)', varga: 'D1', path: '/assets/aistudio/IMG_7797_b41422a1.jpeg' },
  { id: 'img-d2-d4', title: 'Hora (D-2 Wealth) & Chaturthamsha (D-4 Luck)', varga: 'D2 / D4', path: '/assets/aistudio/IMG_7802_0e6ca4bd.jpeg' },
  { id: 'img-d9', title: 'Navamsha Chart (D-9 Spouse — Aries Ascendant)', varga: 'D9', path: '/assets/aistudio/IMG_7798_069758cd.jpeg' },
  { id: 'img-d9-deg-1', title: 'Navamsha (D-9) Planetary Degrees & Nakshatras (Part 1)', varga: 'D9', path: '/assets/aistudio/IMG_7803_e1dd0b7a.png' },
  { id: 'img-d9-deg-2', title: 'Navamsha (D-9) Planetary Degrees & Nakshatras (Part 2)', varga: 'D9', path: '/assets/aistudio/IMG_7804_919b5a9d.png' },
  { id: 'img-d10', title: 'Dashamamsha Chart (D-10 Profession — Capricorn Ascendant)', varga: 'D10', path: '/assets/aistudio/IMG_7799_b8a55567.jpeg' },
  { id: 'img-d10-deg-1', title: 'Dashamamsha (D-10) Planetary Degrees & Nakshatras (Part 1)', varga: 'D10', path: '/assets/aistudio/IMG_7808_575d22ef.png' },
  { id: 'img-d10-deg-2', title: 'Dashamamsha (D-10) Planetary Degrees & Nakshatras (Part 2)', varga: 'D10', path: '/assets/aistudio/IMG_7809_9ff94d17.png' },
  { id: 'img-d30-d45', title: 'Trimshamsha (D-30 Misfortune) & Akshvedamsha (D-45)', varga: 'D30 / D45', path: '/assets/aistudio/IMG_7796_89cf1e65.png' },
  { id: 'img-d45', title: 'Akshvedamsha Chart (D-45 Well Being — Virgo Ascendant)', varga: 'D45', path: '/assets/aistudio/IMG_7801_f9a5a2cb.jpeg' },
  { id: 'img-d60', title: 'Shastiamsha Chart (D-60 Well Being — Pisces Ascendant)', varga: 'D60', path: '/assets/aistudio/IMG_8279_d6fa3311.jpeg' },
  { id: 'img-slide-7', title: 'Cross-Varga Comparative Synthesis Reference Slide', varga: 'Matrix', path: '/assets/aistudio/IMG_7805_be2bc404.jpeg' },
];

export function filterPlanetsByCategory(
  planets: PlanetPlacement[],
  category: 'all' | 'traditional' | 'exalted-friendly' | 'karmic-test'
): PlanetPlacement[] {
  switch (category) {
    case 'traditional':
      return planets.filter((p) => p.isTraditional);
    case 'exalted-friendly':
      return planets.filter(
        (p) =>
          p.dignity === 'Exalted' ||
          p.dignity === 'Friendly Sign' ||
          p.dignity === 'Debilitated (Cancelled)' ||
          p.dignity === 'Debilitated (D1 Exalted -> D9 Debil)'
      );
    case 'karmic-test':
      return planets.filter(
        (p) =>
          p.dignity === 'Enemy Sign' ||
          p.dignity === 'Debilitated (D1 Exalted -> D9 Debil)' ||
          p.house === 6 ||
          p.house === 8
      );
    case 'all':
    default:
      return planets;
  }
}

export function getHouseByNumber(houseNumber: number): HouseDetail {
  const found = HOUSE_DETAILS.find((h) => h.house === houseNumber);
  if (!found) {
    throw new Error(`House ${houseNumber} not found`);
  }
  return found;
}

export function getVargaChartByCode(code: VargaCode): VargaChartDefinition {
  const found = ALL_VARGA_CHARTS.find((v) => v.code === code);
  if (!found) {
    throw new Error(`Varga chart ${code} not found`);
  }
  return found;
}

export interface Bhava3DLayout {
  house: number;
  isKendra: boolean;
  isTrikona: boolean;
  /** 2D polygon vertices in normalized [-5, 5] Mandapa XZ plane */
  polygonXZ: Array<[number, number]>;
  /** Centroid [x, z] in [-5, 5] Mandapa coordinates */
  centerXZ: [number, number];
  /** Sign number label anchor [x, z] */
  signLabelXZ: [number, number];
}

/**
 * Maps the 12 North Indian Diamond Chart houses into a 10x10 meter 3D Mandapa
 * centered at (0, 0, 0) where X is [-5, +5] (West to East) and Z is [-5, +5] (North to South).
 */
export const NORTH_INDIAN_3D_BHAVAS: Bhava3DLayout[] = [
  {
    house: 1,
    isKendra: true,
    isTrikona: true,
    polygonXZ: [
      [0, -5],
      [-2.5, -2.5],
      [0, 0],
      [2.5, -2.5],
    ],
    centerXZ: [0, -2.5],
    signLabelXZ: [0, -0.85],
  },
  {
    house: 2,
    isKendra: false,
    isTrikona: false,
    polygonXZ: [
      [-5, -5],
      [-2.5, -2.5],
      [0, -5],
    ],
    centerXZ: [-2.5, -4.05],
    signLabelXZ: [-2.5, -3.1],
  },
  {
    house: 3,
    isKendra: false,
    isTrikona: false,
    polygonXZ: [
      [-5, -5],
      [-5, 0],
      [-2.5, -2.5],
    ],
    centerXZ: [-4.05, -2.5],
    signLabelXZ: [-3.1, -2.5],
  },
  {
    house: 4,
    isKendra: true,
    isTrikona: false,
    polygonXZ: [
      [-2.5, -2.5],
      [-5, 0],
      [-2.5, 2.5],
      [0, 0],
    ],
    centerXZ: [-2.5, 0],
    signLabelXZ: [-0.85, 0],
  },
  {
    house: 5,
    isKendra: false,
    isTrikona: true,
    polygonXZ: [
      [-5, 0],
      [-5, 5],
      [-2.5, 2.5],
    ],
    centerXZ: [-4.05, 2.5],
    signLabelXZ: [-3.1, 2.5],
  },
  {
    house: 6,
    isKendra: false,
    isTrikona: false,
    polygonXZ: [
      [-5, 5],
      [0, 5],
      [-2.5, 2.5],
    ],
    centerXZ: [-2.5, 4.05],
    signLabelXZ: [-2.5, 3.1],
  },
  {
    house: 7,
    isKendra: true,
    isTrikona: false,
    polygonXZ: [
      [0, 0],
      [-2.5, 2.5],
      [0, 5],
      [2.5, 2.5],
    ],
    centerXZ: [0, 2.5],
    signLabelXZ: [0, 0.85],
  },
  {
    house: 8,
    isKendra: false,
    isTrikona: false,
    polygonXZ: [
      [0, 5],
      [5, 5],
      [2.5, 2.5],
    ],
    centerXZ: [2.5, 4.05],
    signLabelXZ: [2.5, 3.1],
  },
  {
    house: 9,
    isKendra: false,
    isTrikona: true,
    polygonXZ: [
      [5, 5],
      [5, 0],
      [2.5, 2.5],
    ],
    centerXZ: [4.05, 2.5],
    signLabelXZ: [3.1, 2.5],
  },
  {
    house: 10,
    isKendra: true,
    isTrikona: false,
    polygonXZ: [
      [0, 0],
      [2.5, 2.5],
      [5, 0],
      [2.5, -2.5],
    ],
    centerXZ: [2.5, 0],
    signLabelXZ: [0.85, 0],
  },
  {
    house: 11,
    isKendra: false,
    isTrikona: false,
    polygonXZ: [
      [5, 0],
      [5, -5],
      [2.5, -2.5],
    ],
    centerXZ: [4.05, -2.5],
    signLabelXZ: [3.1, -2.5],
  },
  {
    house: 12,
    isKendra: false,
    isTrikona: false,
    polygonXZ: [
      [5, -5],
      [0, -5],
      [2.5, -2.5],
    ],
    centerXZ: [2.5, -4.05],
    signLabelXZ: [2.5, -3.1],
  },
];

export function getPlanet3DOffset(
  indexInHouse: number,
  totalInHouse: number,
  houseNumber: number
): [number, number] {
  const layout =
    NORTH_INDIAN_3D_BHAVAS.find((b) => b.house === houseNumber) || NORTH_INDIAN_3D_BHAVAS[0];
  const [cx, cz] = layout.centerXZ;
  if (totalInHouse <= 1) {
    return [cx, cz];
  }
  const radius = totalInHouse === 2 ? 0.52 : totalInHouse <= 4 ? 0.68 : 0.78;
  const angle = (indexInHouse / totalInHouse) * Math.PI * 2 - Math.PI / 4;
  return [
    Number((cx + Math.cos(angle) * radius).toFixed(3)),
    Number((cz + Math.sin(angle) * radius).toFixed(3)),
  ];
}

/**
 * Generates a self-contained Blender 3.x / 4.x Python (`bpy`) script that builds
 * the 3D North Indian Vedic Chart (12 extruded Bhava platforms, beveled gold Yantra rails,
 * 3D planetary spheres with rings & text labels, and 3D Graha Drishti bezier aspect tubes).
 */
export function generateBlenderPythonScript(
  vargaChart: VargaChartDefinition,
  includeOuterPlanets = true
): string {
  const outerSet = new Set(['Ur', 'Ne', 'Pl']);
  const housesJson = JSON.stringify(
    vargaChart.houses.map((h) => {
      const b3d = NORTH_INDIAN_3D_BHAVAS.find((b) => b.house === h.house)!;
      const occupants = includeOuterPlanets
        ? h.occupants
        : h.occupants.filter((sym) => !outerSet.has(sym));
      return {
        house: h.house,
        signNumber: h.signNumber,
        signName: h.signName,
        occupants,
        polygonXZ: b3d.polygonXZ,
        centerXZ: b3d.centerXZ,
        isKendra: b3d.isKendra,
      };
    }),
    null,
    2
  );

  return `# ==============================================================================
# BLENDER 3.x / 4.x PYTHON SCRIPT: 3D NORTH INDIAN VEDIC CHART GENERATOR
# Chart: ${vargaChart.name} (${vargaChart.code}) | Lagna: ${vargaChart.lagnaName}
# Ayanamsa: Lahiri (Chitrapaksha) 23° 47' 56"
# Usage in Blender: Scripting Workspace -> New -> Paste Script -> Run Script
# ==============================================================================
import bpy
import bmesh
import math
import json

# 1. Clean existing mesh/curve/text objects in scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

CHART_CODE = "${vargaChart.code}"
CHART_NAME = "${vargaChart.name}"
HOUSES_DATA = json.loads('''${housesJson}''')

PLANET_COLORS = {
    "Su": (0.96, 0.62, 0.04, 1.0),
    "Mo": (0.88, 0.92, 0.98, 1.0),
    "Ma": (0.88, 0.18, 0.18, 1.0),
    "Me": (0.06, 0.72, 0.50, 1.0),
    "Ju": (0.92, 0.70, 0.05, 1.0),
    "Ve": (0.93, 0.35, 0.68, 1.0),
    "Sa": (0.23, 0.45, 0.90, 1.0),
    "Ra": (0.45, 0.35, 0.85, 1.0),
    "Ke": (0.78, 0.42, 0.22, 1.0),
    "Ur": (0.20, 0.75, 0.88, 1.0),
    "Ne": (0.28, 0.40, 0.92, 1.0),
    "Pl": (0.58, 0.48, 0.68, 1.0),
}

def make_pbr_mat(name, rgba, metallic=0.2, roughness=0.35, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = rgba
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if "Emission Color" in bsdf.inputs and emission_strength > 0:
            bsdf.inputs["Emission Color"].default_value = rgba
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

mat_obsidian = make_pbr_mat("Mandapa_Obsidian", (0.06, 0.08, 0.13, 1.0), metallic=0.35, roughness=0.4)
mat_kendra = make_pbr_mat("Mandapa_Kendra", (0.10, 0.14, 0.22, 1.0), metallic=0.45, roughness=0.3)
mat_gold = make_pbr_mat("Yantra_Gold", (0.85, 0.68, 0.24, 1.0), metallic=0.92, roughness=0.18)

# 2. Create Sanctuary Base Plinth
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, -0.25))
plinth = bpy.context.active_object
plinth.name = f"{CHART_CODE}_Sanctuary_Plinth"
plinth.scale = (10.8, 10.8, 0.35)
plinth.data.materials.append(mat_obsidian)

# 3. Create 12 Extruded North Indian Bhava Chambers & Sign Labels
for h in HOUSES_DATA:
    h_num = h["house"]
    poly = h["polygonXZ"]
    mesh = bpy.data.meshes.new(f"Bhava_{h_num}_Mesh")
    obj = bpy.data.objects.new(f"Bhava_H{h_num}_Sign{h['signNumber']}", mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()
    verts = [bm.verts.new((pt[0] * 0.96, -pt[1] * 0.96, 0.0)) for pt in poly]
    face = bm.faces.new(verts)
    extruded = bmesh.ops.extrude_face_region(bm, geom=[face])
    extrude_verts = [v for v in extruded["geom"] if isinstance(v, bmesh.types.BMVert)]
    height = 0.28 if h["isKendra"] else 0.18
    bmesh.ops.translate(bm, vec=(0, 0, height), verts=extrude_verts)
    bm.to_mesh(mesh)
    bm.free()
    obj.data.materials.append(mat_kendra if h["isKendra"] else mat_obsidian)

    # House & Sign 3D Text
    cx, cz = h["centerXZ"]
    bpy.ops.object.text_add(location=(cx - 0.45, -cz - 0.15, height + 0.04))
    txt = bpy.context.active_object
    txt.name = f"Label_H{h_num}"
    txt.data.body = f"H{h_num} ({h['signNumber']} {h['signName'][:3]})"
    txt.data.size = 0.30
    txt.data.extrude = 0.02
    txt.data.materials.append(mat_gold)

    # 4. Create 3D Planetary Orbs & Pedestals in each House
    occ = h["occupants"]
    total = len(occ)
    for idx, sym in enumerate(occ):
        angle = (idx / max(total, 1)) * math.pi * 2.0 - math.pi / 4.0
        rad = 0.0 if total == 1 else (0.55 if total == 2 else 0.72)
        px = cx + math.cos(angle) * rad
        py = -cz - math.sin(angle) * rad
        pz = height + 0.65

        p_mat = make_pbr_mat(f"Mat_{sym}", PLANET_COLORS.get(sym, (0.8, 0.8, 0.8, 1.0)), metallic=0.55, roughness=0.2, emission_strength=0.15)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.28, location=(px, py, pz))
        sphere = bpy.context.active_object
        sphere.name = f"Planet_{sym}_H{h_num}"
        sphere.data.materials.append(p_mat)
        bpy.ops.object.shade_smooth()

        # Orbital Gimbal Ring
        bpy.ops.mesh.primitive_torus_add(major_radius=0.40, minor_radius=0.025, location=(px, py, pz), rotation=(0.35, 0.2, 0.0))
        ring = bpy.context.active_object
        ring.name = f"OrbitRing_{sym}"
        ring.data.materials.append(mat_gold)

print(f"Successfully generated 3D Blender Vedic Mandapa for {CHART_NAME}!")
`;
}

export interface VedicTechniqueOption {
  id: string;
  name: string;
  masterLineage: string;
  coreMechanism: string;
  chartApplicationSummary: string;
  defaultEnabled: boolean;
}

export const VEDIC_PREDICTIVE_TECHNIQUES: VedicTechniqueOption[] = [
  {
    id: 'lunar-astro-giri',
    name: 'Lunar Astro (Deepanshu Giri)',
    masterLineage: 'Deepanshu Giri · Pending Karma, Cross-Varga Inversion & Blank Houses',
    coreMechanism:
      'Compares D-1 Exaltation/Debilitation directly against D-9 and D-60, decodes Retrograde Atmakaraka pending debts, and tracks Nakshatra exchange triggers.',
    chartApplicationSummary:
      'Explains why Exalted Virgo Mercury (D1 H4) turns inward in D9 H12 (Revati) & D10 H8, and why Retrograde Saturn (28°34\' H9) exchanges Nakshatras with Jupiter in Anuradha.',
    defaultEnabled: true,
  },
  {
    id: 'bhrigu-nandi-nadi',
    name: 'Bhrigu Nandi Nadi (BNN)',
    masterLineage: 'R.G. Rao & Nadi Samhita · Trinal 1-5-9 Planetary Circuits',
    coreMechanism:
      'Groups planets by Element Trines (Fire 1-5-9, Earth 2-6-10, Air 3-7-11, Water 4-8-12) and progresses Jupiter (Jeeva) and Saturn (Karma) across degrees.',
    chartApplicationSummary:
      'Unites Air Trine (Gemini Lagna + Libra Ma/Mo/Ra + Aquarius Retrograde Sa) into a single engineering, research, and strategic advisory circuit.',
    defaultEnabled: true,
  },
  {
    id: 'parashari-shodashvarga',
    name: 'Parashari Shodashvarga (BPHS)',
    masterLineage: 'Maharishi Parashara · 16 Divisional Charts, Mahapurusha Yogas & Digbala',
    coreMechanism:
      'Evaluates Rashi dignity, Pancha Mahapurusha Yogas, Directional Strength (Digbala), Neecha Bhanga Raja Yogas, and Vimshottari Mahadasha-Antardasha.',
    chartApplicationSummary:
      'Highlights Bhadra Mahapurusha Mercury (D1 H4), Triple-Vargottama Mars (D10 H10 Digbala), and D60 H11 Exalted Mars + Jupiter Neecha Bhanga.',
    defaultEnabled: true,
  },
  {
    id: 'jaimini-sutras',
    name: 'Jaimini Sutras (Chara Karakas & Arudha)',
    masterLineage: 'Maharishi Jaimini · Atmakaraka, Amatyakaraka, Karakamsa & Arudha Lagna',
    coreMechanism:
      'Ranks planets by degree within sign (AK to DK) to reveal soul desire, career minister (AmK), spouse indicator (DK), and material perception (AL/UL).',
    chartApplicationSummary:
      'Saturn [R] (28°34\') is Atmakaraka, Moon (24°01\') is Amatyakaraka (Exalted in D9 H2!), and Mars (01°58\') is Darakaraka (Vargottama in D9 H7!).',
    defaultEnabled: true,
  },
  {
    id: 'kp-sublord',
    name: 'Krishnamurti Paddhati (KP Sub-Lord)',
    masterLineage: 'Prof. K.S. Krishnamurti · Stellar Nakshatra Lord & Cuspal Sub-Lord',
    coreMechanism:
      '"Planet is the source, Nakshatra Lord shows the house involvement, and the Sub-Lord decides the final yes/no fruit of the event."',
    chartApplicationSummary:
      'Tracks Mercury in Uttara Phalguni (Sun Star, 3rd lord in 3rd) and Mars/Rahu in Chitra (Mars Star) to pinpoint exact sub-period event delivery.',
    defaultEnabled: false,
  },
  {
    id: 'ashtakavarga-sav',
    name: 'Sarvashtakavarga & Kakshya Transit',
    masterLineage: 'Classical Bindu Matrix · 337-Point House Strength & Transit Kakshyas',
    coreMechanism:
      'Quantifies each sign with Bindu scores (average 28) to measure effortless house fruition versus houses requiring high personal vigilance.',
    chartApplicationSummary:
      'Contrasts your 37-Bindu Gemini Lagna and 34-Bindu Leo 3rd house against the 23-Bindu Libra 5th and 23-Bindu Capricorn 8th houses.',
    defaultEnabled: true,
  },
  {
    id: 'varshaphal-sudarshana',
    name: 'Tajika Varshaphal & Sudarshana Chakra',
    masterLineage: 'Neelakantha · Annual Solar Return, Muntha & Triple-Lagna Progression',
    coreMechanism:
      'Overlays Lagna, Moon, and Sun charts simultaneously while advancing the annual Muntha sign year by year.',
    chartApplicationSummary:
      'Synchronizes your October 2025 entry into Mercury Mahadasha with annual solar return activations across your 4th, 8th, and 11th houses.',
    defaultEnabled: false,
  },
];

export interface NaturalVedicRemedy {
  id: string;
  planetSymbol: string;
  planetName: string;
  targetHouses: string;
  title: string;
  category: 'Pranic & Breath' | 'Behavioral Karma' | 'Vastu & Environment' | 'Ayurvedic Dinacharya';
  naturalMethod: string;
  astrologicalWhy: string;
  dailyTiming: string;
}

export const NATURAL_VEDIC_REMEDIES: NaturalVedicRemedy[] = [
  {
    id: 'rem-mercury-revati',
    planetSymbol: 'Me',
    planetName: 'Mercury (Budha — Active Mahadasha Lord)',
    targetHouses: 'D1 H4 (Virgo) · D9 H12 (Revati) · D10 H8 (Magha)',
    title: 'Living Green Sanctuary & Handwritten Research Journaling',
    category: 'Vastu & Environment',
    naturalMethod:
      'Keep thriving green broadleaf plants (such as Tulsi or money plant) in the North/Northeast of your study, and write 1 page of deep research or astrological synthesis by hand every morning before checking messages.',
    astrologicalWhy:
      'Lunar Astro Rule: Exalted D-1 Mercury going debilitated in D-9 H12 (Pisces) and D-10 H8 scatters nervous prana if trapped in shallow digital multitasking. Grounding Mercury in living greenery (Virgo H4) and deep contemplative writing (Pisces H12) harmonizes both Vargas.',
    dailyTiming: 'Morning (Budha Hora or 07:30–08:30 AM)',
  },
  {
    id: 'rem-saturn-ak',
    planetSymbol: 'Sa',
    planetName: 'Saturn [R] (Shani — Atmakaraka 28°34\')',
    targetHouses: 'D1 H9 (Aquarius) · D9 H3 (Ardra) · D10 H11 (Anuradha)',
    title: 'Unbroken Vow Integrity & Silent Walking Meditation',
    category: 'Behavioral Karma',
    naturalMethod:
      'Never make a casual promise to a mentor, elder, or client that you do not 100% fulfill, and take a 20-minute brisk evening walk without headphones to ground your legs and nervous system.',
    astrologicalWhy:
      'Retrograde Atmakaraka Saturn in the 9th house of Dharma (exchanging Nakshatras with Jupiter in Anuradha) tests integrity of word and duty. Walking barefoot or mindfully at dusk pacifies Aquarius/Vata over-activity.',
    dailyTiming: 'Sunset / Sandhya Kala (18:00–19:00)',
  },
  {
    id: 'rem-moon-vishakha',
    planetSymbol: 'Mo',
    planetName: 'Moon (Chandra — Amatyakaraka 24°01\')',
    targetHouses: 'D1 H5 (Libra, 23 Bindus) · D9 H2 (Exalted) · D45/D60 H8',
    title: 'Silver Vessel Hydration & 90-Minute Pre-Sleep Digital Fast',
    category: 'Ayurvedic Dinacharya',
    naturalMethod:
      'Drink pure water kept in a silver cup first thing in the morning, and shut off all screens 60–90 minutes before sleep alongside 12 rounds of Chandra Bhedana (left-nostril cooling breath).',
    astrologicalWhy:
      'Your Moon is Exalted in D-9 (2nd house wealth intuition) yet sits with Mars+Rahu in a 23-bindu D-1 5th house and occupies the 8th house in D-45 and D-60. Protecting nocturnal lunar peace prevents emotional burnout.',
    dailyTiming: 'Upon Waking & 21:30 Night Wind-Down',
  },
  {
    id: 'rem-mars-vargottama',
    planetSymbol: 'Ma',
    planetName: 'Mars (Mangala — Triple-Vargottama & Darakaraka)',
    targetHouses: 'D1 H5 · D9 H7 · D10 H10 (Digbala) · D60 H11 (Exalted)',
    title: 'Structured Sweat Discipline & Zero Domestic Debate',
    category: 'Pranic & Breath',
    naturalMethod:
      'Channel your intense Chitra/Swati Martian fire into 30 minutes of daily strength or core training, and consciously refuse to use sharp debate tactics with your spouse or family.',
    astrologicalWhy:
      'Mars holds 100% Digbala in D-10 H10 and Exaltation in D-60 H11, but sits in D-9 H7 (Libra). When physical sweat uses up excess Pitta, Mars delivers pure executive command without relational friction.',
    dailyTiming: 'Mid-Morning or Afternoon Workout',
  },
  {
    id: 'rem-jupiter-anuradha',
    planetSymbol: 'Ju',
    planetName: 'Jupiter (Guru — 7th & 10th Lord in Anuradha)',
    targetHouses: 'D1 H6 (Scorpio, 31 Bindus) · D10 H11 · D60 H11 (Neecha Bhanga)',
    title: 'Pro-Bono Diagnostic Teaching & Turmeric/Saffron Prana',
    category: 'Behavioral Karma',
    naturalMethod:
      'Dedicate 1 hour each week to freely teaching, auditing, or solving a complex problem for someone in need, and include warm turmeric or saffron in your morning regimen.',
    astrologicalWhy:
      'Jupiter in the 6th house of D-1 (31 SAV bindus) and 11th house of D-10/D-60 turns service and crisis-solving directly into institutional wealth when offered without ego.',
    dailyTiming: 'Thursday Morning or Daily Study Block',
  },
  {
    id: 'rem-venus-purvaphalguni',
    planetSymbol: 'Ve',
    planetName: 'Venus (Shukra — D10 H1 Yogakaraka & D60 H4 Digbala)',
    targetHouses: 'D1 H3 (Leo) · D9 H6 (Virgo) · D10 H1 · D60 H4',
    title: 'Aesthetic Home Fragrance & Appreciative Speech',
    category: 'Vastu & Environment',
    naturalMethod:
      'Maintain fresh natural fragrance (sandalwood, rose, or camphor) in your living space and offer one genuine, unprompted appreciation to your partner or collaborator daily.',
    astrologicalWhy:
      'Counteracts D-9 H6 / D-45 H1 Virgo Venus critical tendencies by activating your super-strong D-60 4th-house Digbala Venus.',
    dailyTiming: 'Evening Home Transition',
  },
  {
    id: 'rem-sun-surya',
    planetSymbol: 'Su',
    planetName: 'Sun (Surya — Vargottama Leo H3 & D60 H10 Digbala)',
    targetHouses: 'D1 H3 (Leo, 34 Bindus) · D9 H5 (Leo) · D60 H10 (Digbala)',
    title: 'Sunrise Surya Arghya & Sovereign Posture Alignment',
    category: 'Ayurvedic Dinacharya',
    naturalMethod:
      'Offer water to the rising sun within 20 minutes of sunrise while standing barefoot, and maintain an upright spinal posture during all executive decision-making.',
    astrologicalWhy:
      'Sun is Vargottama in Leo (Purva Phalguni) and holds 100% Digbala in the 10th house of D-60. Direct morning solar prana fortifies ocular vitality, self-command, and Pitri (ancestral) blessings.',
    dailyTiming: 'Sunrise (06:00–06:45 AM)',
  },
  {
    id: 'rem-rahu-chitra',
    planetSymbol: 'Ra',
    planetName: 'Rahu (North Node — Chitra H5 & D60 H6 Ari-Hanta)',
    targetHouses: 'D1 H5 (Libra) · D9 H11 (Aquarius) · D60 H6 (Leo)',
    title: 'Single-Pointed Deep Work & Earthen/Copper Grounding',
    category: 'Pranic & Breath',
    naturalMethod:
      'Work in uninterrupted 90-minute single-tab blocks with all notifications muted, and practice 10 rounds of Nadi Shodhana (alternate-nostril pranayama) before any speculative or architectural decision.',
    astrologicalWhy:
      'Rahu in Chitra (5th house, 23 SAV bindus) with Moon+Mars creates brilliant architectural vision but can trigger mental hyper-stimulation. Grounding Vata breath channels Rahu into D-9 11th-house (Aquarius) breakthrough gains.',
    dailyTiming: 'Before Deep Work & Mid-Afternoon',
  },
  {
    id: 'rem-ketu-bharani',
    planetSymbol: 'Ke',
    planetName: 'Ketu (South Node — Bharani H11 & D60 H12 Moksha)',
    targetHouses: 'D1 H11 (Aries, 30 Bindus) · D9 H5 (Leo) · D60 H12 (Aquarius)',
    title: 'Non-Attachment to Praise & Root-Mantra Contemplation',
    category: 'Behavioral Karma',
    naturalMethod:
      'Spend 12 minutes in silent witness meditation each night without seeking external validation for your daily achievements, and care for street animals or birds weekly.',
    astrologicalWhy:
      'Ketu in the 11th house (Aries, Bharani) and 12th house of D-60 grants effortless intuitive mastery and network fruits only when you detach from egoic credit.',
    dailyTiming: 'Night Meditation (21:45–22:00)',
  },
];

const SIGN_LOOKUP: Record<number, { name: string; sanskrit: string; lord: string }> = {
  1: { name: 'Aries', sanskrit: 'Mesha', lord: 'Mars' },
  2: { name: 'Taurus', sanskrit: 'Vrishabha', lord: 'Venus' },
  3: { name: 'Gemini', sanskrit: 'Mithuna', lord: 'Mercury' },
  4: { name: 'Cancer', sanskrit: 'Karka', lord: 'Moon' },
  5: { name: 'Leo', sanskrit: 'Simha', lord: 'Sun' },
  6: { name: 'Virgo', sanskrit: 'Kanya', lord: 'Mercury' },
  7: { name: 'Libra', sanskrit: 'Tula', lord: 'Venus' },
  8: { name: 'Scorpio', sanskrit: 'Vrishchika', lord: 'Mars' },
  9: { name: 'Sagittarius', sanskrit: 'Dhanu', lord: 'Jupiter' },
  10: { name: 'Capricorn', sanskrit: 'Makara', lord: 'Saturn' },
  11: { name: 'Aquarius', sanskrit: 'Kumbha', lord: 'Saturn' },
  12: { name: 'Pisces', sanskrit: 'Meena', lord: 'Jupiter' },
};

export function buildCustomVargaChart(params: {
  title: string;
  lagnaSign: number;
  userWish: string;
  keySignature?: string;
  lunarAstroSynthesis?: string;
  planetHouses?: Array<{ symbol: string; house: number }>;
  sourceImage?: string;
}): VargaChartDefinition {
  const safeLagna = Math.min(12, Math.max(1, Math.round(params.lagnaSign || 3)));
  const lagnaInfo = SIGN_LOOKUP[safeLagna] || SIGN_LOOKUP[3];

  // Default balanced placements if none provided
  const defaultPlacements: Array<{ symbol: string; house: number }> = [
    { symbol: 'Me', house: 1 },
    { symbol: 'Ve', house: 4 },
    { symbol: 'Su', house: 10 },
    { symbol: 'Ma', house: 10 },
    { symbol: 'Ju', house: 11 },
    { symbol: 'Sa', house: 9 },
    { symbol: 'Mo', house: 5 },
    { symbol: 'Ra', house: 3 },
    { symbol: 'Ke', house: 9 },
  ];

  const activePlacements =
    params.planetHouses && params.planetHouses.length > 0
      ? params.planetHouses
      : defaultPlacements;

  const houses: VargaHousePlacement[] = Array.from({ length: 12 }, (_, idx) => {
    const houseNum = idx + 1;
    const signNum = getSignForHouse(safeLagna, houseNum);
    const sInfo = SIGN_LOOKUP[signNum] || SIGN_LOOKUP[1];
    const occupants = activePlacements
      .filter((p) => Number(p.house) === houseNum)
      .map((p) => p.symbol);

    return {
      house: houseNum,
      signNumber: signNum,
      signName: sInfo.name,
      occupants,
      highlightNote:
        occupants.length > 0
          ? `${sInfo.name} (${sInfo.sanskrit}) · Occupied by ${occupants.join(', ')} · Aligned for "${params.userWish}"`
          : `${sInfo.name} (${sInfo.sanskrit}) · Ruled by ${sInfo.lord} · Clean channel for ${params.userWish}`,
    };
  });

  return {
    code: 'D1',
    name: params.title || 'Custom User Chart',
    sanskritSubtitle: `Custom Wish & Horoscope Synthesis · ${params.userWish}`,
    divisionNumber: 1,
    lagnaSign: safeLagna,
    lagnaName: `${lagnaInfo.name} (${lagnaInfo.sanskrit})`,
    lagnaDegree: 'Lahiri Ayanamsa 23° 47\' 56"',
    sourceImage: params.sourceImage || '/assets/aistudio/IMG_7800_0daa28f8.jpeg',
    purpose: params.userWish,
    keySignature:
      params.keySignature ||
      `${lagnaInfo.name} Ascendant Custom Synthesis for ${params.userWish}`,
    lunarAstroSynthesis:
      params.lunarAstroSynthesis ||
      `Applying Lunar Astro (Deepanshu Giri) and Bhrigu Nandi Nadi techniques to this ${lagnaInfo.name} Lagna chart reveals a direct trinal circuit supporting "${params.userWish}". Focus on Kendra and Trikona activation through daily natural remedies.`,
    houses,
  };
}

export interface HorizonMilestone {
  monthIndex: number;
  monthLabel: string;
  dashaTransitFocus: string;
  techniqueApplied: string;
  actionDirective: string;
  naturalRemedyFocus: string;
}

export function generateHorizonRoadmap(
  durationMonths: 3 | 6 | 12,
  wishGoal: string,
  preferredTechniques: string[]
): HorizonMilestone[] {
  const primaryTech = preferredTechniques[0] || 'Lunar Astro (Deepanshu Giri)';
  const secondaryTech = preferredTechniques[1] || 'Bhrigu Nandi Nadi (BNN)';

  const monthTemplates: Array<{
    phase: string;
    dashaWindow: string;
    actionTemplate: (goal: string) => string;
    remedy: string;
  }> = [
    {
      phase: 'Foundation & Lagna Prana Alignment',
      dashaWindow: 'Mercury–Mercury · Lagna (37 SAV Bindus) & 4th House Virgo Activation',
      actionTemplate: (g) =>
        `Establish your daily study/execution sanctuary and audit the core skill bottleneck for "${g}".`,
      remedy: 'Morning handwritten research planning + North/Northeast living plant Vastu alignment.',
    },
    {
      phase: '3rd House Purva Phalguni Initiative',
      dashaWindow: 'Mercury–Mercury · Sun+Venus 3rd House (34 SAV Bindus) Circuit',
      actionTemplate: (g) =>
        `Publish or present tangible work prototypes and initiate high-value communications toward "${g}".`,
      remedy: 'Surya Arghya (morning sunlight exposure) + appreciative collaborative communication.',
    },
    {
      phase: '6th-to-11th Anuradha Diagnostic Leverage',
      dashaWindow: 'Mercury–Mercury · Jupiter (Scorpio H6 -> D10 H11) Service-to-Gain Link',
      actionTemplate: (g) =>
        `Solve a complex diagnostic or technical problem in your field to unlock 11th-house authority for "${g}".`,
      remedy: 'Weekly pro-bono mentoring/problem-solving + Thursday turmeric/saffron pranic routine.',
    },
    {
      phase: 'D-9 12th House Revati & D-10 8th House Deep Research',
      dashaWindow: 'Mercury–Mercury · Cross-Varga Inversion Synthesis',
      actionTemplate: (g) =>
        `Integrate hidden/forensic research, data architecture, or predictive methodology into "${g}".`,
      remedy: '90-minute evening digital fast + silver vessel morning hydration.',
    },
    {
      phase: 'Triple-Vargottama Mars Digbala Execution',
      dashaWindow: 'Mars Chitra/Swati Transit Activation (D10 H10 & D60 H11)',
      actionTemplate: (g) =>
        `Take decisive executive command on your primary project milestone for "${g}" without emotional hesitation.`,
      remedy: '30 minutes daily structured physical strength/core training.',
    },
    {
      phase: 'Atmakaraka Saturn 9th House Consolidation',
      dashaWindow: 'Retrograde Saturn [R] (28°34\' H9) & Jupiter Nakshatra Exchange',
      actionTemplate: (g) =>
        `Formalize long-term institutional contracts, mentorship commitments, and ethical governance for "${g}".`,
      remedy: 'Evening silent walking meditation + 100% fulfillment of every spoken commitment.',
    },
    {
      phase: 'D-2 Hora & 2nd House Resource Compounding',
      dashaWindow: 'Exalted D-9 Moon (Krittika H2) & 11th/12th SAV Positive Ratio (30 vs 26)',
      actionTemplate: (g) =>
        `Consolidate net savings and reinvest surplus into long-term sovereign assets supporting "${g}".`,
      remedy: 'Chandra Bhedana cooling breathwork before financial decisions.',
    },
    {
      phase: 'BNN Air-Trine (Gemini-Libra-Aquarius) Expansion',
      dashaWindow: '1-5-9 Air Trine Network & Advisory Scaling',
      actionTemplate: (g) =>
        `Scale your intellectual property, client network, or research platform around "${g}".`,
      remedy: 'Clutter-free workspace + Nadi Shodhana alternate-nostril pranayama.',
    },
    {
      phase: 'D-30 Crisis Immunity & Nervous System Fortification',
      dashaWindow: 'D-30 Exalted Mercury (H4) & Exalted Saturn (H5) Shield',
      actionTemplate: (g) =>
        `Stress-test your systems, eliminate speculative drains (23-bindu 5th house), and protect restorative sleep.`,
      remedy: 'Strict sleep hygiene + warm grounding evening meals.',
    },
    {
      phase: 'D-45 Akshvedamsha Ethical Leadership',
      dashaWindow: 'D-45 Own-Sign Saturn (H6), Own-Sign Jupiter (H7) & Digbala Mars (H10)',
      actionTemplate: (g) =>
        `Elevate your public reputation through transparent, high-integrity delivery on "${g}".`,
      remedy: 'Honoring teachers/lineage + selfless service.',
    },
    {
      phase: 'D-60 Shastiamsha Neecha Bhanga Raja Yoga Peak',
      dashaWindow: 'D-60 H11 Exalted Mars + Jupiter & H10 Digbala Sun',
      actionTemplate: (g) =>
        `Harvest institutional recognition, leadership authority, and long-term gains from "${g}".`,
      remedy: 'Gratitude offering at sunrise + mentoring junior practitioners.',
    },
    {
      phase: 'Annual Sudarshana & Next-Cycle Blueprint',
      dashaWindow: 'Full 12-Sign Sarvashtakavarga Integration (337 Total Bindus)',
      actionTemplate: (g) =>
        `Review full-cycle outcomes for "${g}" and lock in your next annual Dasha milestone.`,
      remedy: 'Complete 3-day contemplative review and journal synthesis.',
    },
  ];

  return Array.from({ length: durationMonths }, (_, i) => {
    const tpl = monthTemplates[i % monthTemplates.length];
    return {
      monthIndex: i + 1,
      monthLabel: `Month ${i + 1}: ${tpl.phase}`,
      dashaTransitFocus: tpl.dashaWindow,
      techniqueApplied: i % 2 === 0 ? primaryTech : secondaryTech,
      actionDirective: tpl.actionTemplate(wishGoal || 'Holistic Mastery & Prosperity'),
      naturalRemedyFocus: tpl.remedy,
    };
  });
}

export function generateLocalGiriVoiceScript(
  vargaChart: VargaChartDefinition,
  houseNumber: number,
  planetSymbol: string | null,
  preferredTechniques: string[]
): { scriptText: string; keyDictum: string; naturalRemedy: string } {
  const houseInfo =
    vargaChart.houses.find((h) => h.house === houseNumber) || vargaChart.houses[0];
  const techList =
    preferredTechniques.length > 0
      ? preferredTechniques.slice(0, 2).join(' and ')
      : 'Lunar Astro (Deepanshu Giri) Cross-Varga Synthesis';

  const activeSym =
    planetSymbol || (houseInfo.occupants.length > 0 ? houseInfo.occupants[0] : null);
  const matrixRow = activeSym
    ? CROSS_VARGA_MATRIX.find((r) => r.symbol === activeSym)
    : undefined;
  const remedyObj = activeSym
    ? NATURAL_VEDIC_REMEDIES.find((r) => r.planetSymbol === activeSym) ||
      NATURAL_VEDIC_REMEDIES[0]
    : NATURAL_VEDIC_REMEDIES[0];

  if (matrixRow) {
    return {
      scriptText: `Namaste. Let us examine Bhava House ${houseNumber} (${houseInfo.signName}) in your ${vargaChart.name} using ${techList}. Here we focus on ${matrixRow.planet} at ${matrixRow.d1Degree} in ${matrixRow.d1Nakshatra} Nakshatra, acting as your ${matrixRow.jaiminiKaraka}. In Deepanshu Giri's predictive methodology, never read a planet in isolation: ${matrixRow.planet} moves from ${matrixRow.d1Placement} in D-1, to ${matrixRow.d9Placement} in Navamsha D-9, ${matrixRow.d10Placement} in Dashamamsha D-10, and ${matrixRow.d60Placement} in Shastiamsha D-60. ${matrixRow.lunarAstroDictum} To align with this energy naturally, ${remedyObj.naturalMethod}`,
      keyDictum: matrixRow.lunarAstroDictum,
      naturalRemedy: `${remedyObj.title}: ${remedyObj.naturalMethod}`,
    };
  }

  return {
    scriptText: `Namaste. Observing Bhava House ${houseNumber} in your ${vargaChart.name}, the sign ${houseInfo.signName} (#${houseInfo.signNumber}) shapes this life domain. ${houseInfo.highlightNote}. Applying ${techList}, notice how the lord of ${houseInfo.signName} links your ${vargaChart.lagnaName} Ascendant to your deeper karmic blueprint in D-9 and D-60. Keep this house's natural significations pure through steady daily discipline.`,
    keyDictum: `${vargaChart.code} House ${houseNumber} (${houseInfo.signName}): ${houseInfo.highlightNote}`,
    naturalRemedy: `${remedyObj.title}: ${remedyObj.naturalMethod}`,
  };
}

export type HighProfileClientTierId =
  | 'sovereign-executive'
  | 'family-office'
  | 'public-eminence';

export interface HighProfileClientTier {
  id: HighProfileClientTierId;
  label: string;
  badgeCode: string;
  githubSkillPackage: string;
  advisoryFocus: string;
  muhurtaDirective: string;
  confidentialProtocol: string;
}

export const HIGH_PROFILE_CLIENT_TIERS: HighProfileClientTier[] = [
  {
    id: 'sovereign-executive',
    label: 'Sovereign Founder & C-Suite Advisory',
    badgeCode: 'TIER I · C-SUITE & BOARDROOM',
    githubSkillPackage: '@vedic-foundation/private-client-concierge@3.4.0',
    advisoryFocus:
      'Institutional governance, high-stakes capital allocation, boardroom Digbala command, and nervous-system prana preservation.',
    muhurtaDirective:
      'Schedule board votes, M&A signings, and flagship launches during Abhijit Muhurta (11:48 AM – 12:36 PM) or Budha/Guru Hora when Gemini (37 SAV Bindus) or Leo (34 SAV Bindus) rises.',
    confidentialProtocol:
      'Zero-Trust UID Vault active · Executive Dossier formatted for private family office & chief-of-staff distribution.',
  },
  {
    id: 'family-office',
    label: 'Family Office & Sovereign Wealth Principal',
    badgeCode: 'TIER II · DYNASTY & CAPITAL',
    githubSkillPackage: '@vedic-foundation/sovereign-muhurta-engine@2.9.0',
    advisoryFocus:
      'Multi-generational wealth compounding (D-2 Hora & D-4 Chaturthamsha), 11th-to-12th SAV surplus protection (30 vs 26 bindus), and succession harmony.',
    muhurtaDirective:
      'Execute asset rebalancing and trust deeds on Thursdays or Wednesdays in Shukla Paksha; avoid 5th-house (23 Bindu) impulsive speculative positions.',
    confidentialProtocol:
      'Private Client Fiduciary Brief · Aligns D-9 2nd-House Exalted Moon with D-60 11th-House Neecha Bhanga Raja Yoga.',
  },
  {
    id: 'public-eminence',
    label: 'Public Statesperson & Cultural Icon',
    badgeCode: 'TIER III · GLOBAL EMINENCE',
    githubSkillPackage: '@vedic-foundation/lunar-astro-dictums@3.1.0',
    advisoryFocus:
      'Public reputation immunity (D-45 Akshvedamsha), keynote & media magnetism (3rd-House Purva Phalguni 34 Bindus), and ocular/solar vitality.',
    muhurtaDirective:
      'Initiate public addresses and diplomatic negotiations within 2 hours of sunrise (Surya Digbala activation) after 10 rounds of Nadi Shodhana breathwork.',
    confidentialProtocol:
      'High-Profile Reputation Shield · Protects nocturnal lunar stillness (D-60 H8 Moon safeguard) during intense public cycles.',
  },
];

export interface RemedyReportParams {
  ayanamsa: string;
  preferredTechniques: string[];
  horizonMonths: 3 | 6 | 12;
  userWish: string;
  completedRemediesCount: number;
  totalRemediesCount: number;
  chartTitle?: string;
  lagnaName?: string;
  clientTierId?: HighProfileClientTierId;
}

export interface ShareableRemedySnippetParams extends RemedyReportParams {
  priorityPlanetSymbols?: string[];
}

export function generateShareableRemedyPlanSnippet(params: ShareableRemedySnippetParams): string {
  const tier =
    HIGH_PROFILE_CLIENT_TIERS.find((t) => t.id === params.clientTierId) ||
    HIGH_PROFILE_CLIENT_TIERS[0];

  const techSummary =
    params.preferredTechniques.length > 0
      ? params.preferredTechniques.slice(0, 3).join(' · ')
      : 'Lunar Astro (Deepanshu Giri) · Bhrigu Nandi Nadi (BNN)';

  const prioritySymbols =
    params.priorityPlanetSymbols && params.priorityPlanetSymbols.length > 0
      ? params.priorityPlanetSymbols
      : ['Me', 'Sa', 'Mo', 'Ma', 'Su'];

  const selectedRemedies = NATURAL_VEDIC_REMEDIES.filter((r) =>
    prioritySymbols.includes(r.planetSymbol)
  );

  const chartLabel = params.chartTitle?.trim() || 'Private Client Horoscope';
  const lagnaLabel = params.lagnaName?.trim() || 'Gemini (Mithuna)';
  const objective = params.userWish?.trim() || 'Sovereign Leadership, Health & Dharmic Prosperity';

  const lines: string[] = [
    '=== VEDIC FOUNDATION — EXECUTIVE NATURAL REMEDY PLAN ===',
    `Client Dossier : ${chartLabel} · ${lagnaLabel} Ascendant`,
    `Advisory Tier  : ${tier.label} (${tier.badgeCode})`,
    `Objective      : ${objective} (${params.horizonMonths}-Month Horizon)`,
    `Vedic Lineages : ${techSummary}`,
    `Ayanamsa       : ${params.ayanamsa}`,
    `Daily Progress : ${params.completedRemediesCount}/${params.totalRemediesCount} Natural Remedies Completed Today`,
    '',
    '── DAILY CIRCADIAN DINACHARYA PROTOCOL ──',
    '• 06:00 AM (Dawn · Sun/Moon)    : Silver vessel hydration + 5-min sunrise Surya Arghya',
    '• 07:30 AM (Morning · Mercury)  : North/NE living greenery + 1-page handwritten synthesis before screens',
    '• 12:30 PM (Midday · Mars/Rahu) : 30-min structured strength sweat + 90-min single-tab deep work block',
    '• 06:15 PM (Sunset · Saturn/Ve) : 20-min headphone-free walk + natural sandalwood/rose home transition',
    '• 09:30 PM (Night · Moon/Ketu)  : 90-min pre-sleep digital fast + 12 rounds Chandra Bhedana breathwork',
    '',
    '── PRIORITY 9-PLANET NATURAL PRESCRIPTIONS ──',
    ...selectedRemedies.map(
      (rem) =>
        `• [${rem.planetSymbol}] ${rem.title} (${rem.dailyTiming})\n  → ${rem.naturalMethod}`
    ),
    '',
    '── HIGH-PROFILE MUHURTA & ENERGETIC DIRECTIVE ──',
    `• ${tier.muhurtaDirective}`,
    `• Verified via Vedic Foundation (${tier.githubSkillPackage})`,
  ];

  return lines.join('\n');
}

export function generateComprehensiveRemedyReport(params: RemedyReportParams): string {
  const techList =
    params.preferredTechniques.length > 0
      ? params.preferredTechniques.join(' · ')
      : 'Lunar Astro (Deepanshu Giri) Cross-Varga Synthesis';

  const tier =
    HIGH_PROFILE_CLIENT_TIERS.find((t) => t.id === params.clientTierId) ||
    HIGH_PROFILE_CLIENT_TIERS[0];

  const sections: string[] = [
    '================================================================================',
    'OFFICIAL LUNAR ASTRO (DEEPANSHU GIRI) & NAVAGRAHA NATURAL REMEDY REPORT',
    '================================================================================',
    `Client Horoscope        : ${params.chartTitle || 'Vedic Foundation Natal Chart'} (${params.lagnaName || 'Gemini / Mithuna'})`,
    `Private Advisory Tier   : ${tier.label} · ${tier.badgeCode}`,
    `GitHub Skill Engine     : ${tier.githubSkillPackage}`,
    `Ayanamsa Reference      : ${params.ayanamsa}`,
    `Active Mahadasha        : Mercury (Budha) Mahadasha (Oct 2025 – Oct 2042)`,
    `Applied Vedic Schools   : ${techList}`,
    `Primary Life Objective  : ${params.userWish || 'Holistic Mastery, Health & Career Authority'} (${params.horizonMonths}-Month Horizon)`,
    `Daily Remedy Compliance : ${params.completedRemediesCount} of ${params.totalRemediesCount} Daily Natural Remedies Completed Today`,
    '--------------------------------------------------------------------------------',
    '1. EXECUTIVE KARMIC & PRANIC DIAGNOSIS (WHY NATURAL REMEDIES ARE REQUIRED)',
    '--------------------------------------------------------------------------------',
    '• Core Cross-Varga Signature: Your D-1 Rashi chart features an Exalted 4th-House Virgo Mercury (09°46\' Uttara Phalguni) and a 37-Bindu Gemini Ascendant, yet in D-9 Navamsha Mercury shifts to the 12th House (Pisces, Revati) and in D-10 Dashamamsha to the 8th House (Leo, Magha).',
    '• The Lunar Astro Remedy Principle: Never prescribe superstitious or fear-based rituals. Instead, align the physical environment (Vastu), breath (Pranayama), daily biological rhythm (Ayurvedic Dinacharya), and conscious behavioral karma with the exact houses where a planet seeks expression across D-1, D-9, D-10, and D-60.',
    '• Primary Energy Bottleneck: The 5th House (Libra) holds Moon + Mars + Rahu with 23 Sarvashtakavarga Bindus, while the Moon occupies the 8th House in both D-45 and D-60. Protecting emotional/lunar stillness and channeling Martian Pitta into structured physical sweat is the master key to unlocking your Triple-Vargottama Mars and D-60 11th-House Neecha Bhanga Raja Yoga.',
    `• High-Profile Advisory Protocol: ${tier.advisoryFocus}`,
    `• Sovereign Muhurta Directive: ${tier.muhurtaDirective}`,
    '',
    '--------------------------------------------------------------------------------',
    '2. DAILY CIRCADIAN DINACHARYA SCHEDULE (NATURAL TIMING PROTOCOL)',
    '--------------------------------------------------------------------------------',
    '• [06:00–07:00 AM · Dawn / Surya & Chandra] : Drink water from a silver vessel upon waking (Moon D9 Exaltation) + 5 minutes of morning sunlight exposure (Surya Vargottama Leo H3 / D60 H10 Digbala).',
    '• [07:30–08:30 AM · Morning / Budha & Guru] : Tend living green plants in the North/Northeast study corner + write 1 page of handwritten research synthesis before opening digital devices (Mercury Mahadasha alignment).',
    '• [12:00–17:00 PM · Midday / Mangala & Rahu]: 30 minutes of structured strength/core sweat discipline (Triple-Vargottama Mars) + 90-minute single-tab deep work blocks preceded by 10 rounds of Nadi Shodhana breathwork.',
    '• [18:00–19:30 PM · Sunset / Shani & Shukra]: 20-minute headphone-free silent evening walk (Atmakaraka Saturn [R] H9) + natural sandalwood/rose home fragrance and appreciative speech with family (Venus D60 H4 Digbala).',
    '• [21:30–22:30 PM · Night / Chandra & Ketu] : Strict 60–90 minute pre-sleep screen fast + 12 rounds of Chandra Bhedana cooling breathwork + 10 minutes of non-attached witness meditation.',
    '',
    '--------------------------------------------------------------------------------',
    '3. COMPLETE NINE-PLANET (NAVAGRAHA) NATURAL REMEDY PRESCRIPTIONS',
    '--------------------------------------------------------------------------------',
    ...NATURAL_VEDIC_REMEDIES.map(
      (rem, idx) =>
        `[${idx + 1}] ${rem.planetName.toUpperCase()} (${rem.planetSymbol})\n` +
        `    • Target Vargas & Houses : ${rem.targetHouses}\n` +
        `    • Remedy Category        : ${rem.category} (${rem.dailyTiming})\n` +
        `    • Prescription Title     : ${rem.title}\n` +
        `    • Natural Daily Practice : ${rem.naturalMethod}\n` +
        `    • Astrological Mechanism : ${rem.astrologicalWhy}`
    ),
    '',
    '--------------------------------------------------------------------------------',
    '4. SARVASHTAKAVARGA (337 BINDUS) ENERGETIC SAFEGUARDS',
    '--------------------------------------------------------------------------------',
    '• High-Bindu Power Zones: H1 Gemini (37 Bindus) & H3 Leo (34 Bindus) -> Lead personally with your voice, original writing, and courageous initiative.',
    '• Low-Bindu Caution Zones: H5 Libra (23 Bindus) & H8 Capricorn (23 Bindus) -> Avoid impulsive financial speculation, late-night emotional arguments, and unverified joint liabilities.',
    '• Positive Wealth Ratio: H11 Aries (30 Bindus) > H12 Taurus (26 Bindus) -> Guarantees net capital accumulation when daily Ketu (H11) non-attachment and Venus (H12 lord) simplicity are maintained.',
    '================================================================================',
  ];

  return sections.join('\n');
}




