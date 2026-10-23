/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  VEDIC_PREDICTIVE_TECHNIQUES,
  NATURAL_VEDIC_REMEDIES,
  HIGH_PROFILE_CLIENT_TIERS,
  HighProfileClientTierId,
  VargaChartDefinition,
  buildCustomVargaChart,
  generateHorizonRoadmap,
  generateComprehensiveRemedyReport,
  generateShareableRemedyPlanSnippet,
} from './utils/shastiamshaLogic';
import { NorthIndianChart } from './components/NorthIndianChart';
import { NorthIndianChart3D } from './components/NorthIndianChart3D';
import { PlanetInspector } from './components/PlanetInspector';
import { GiriVoiceGuidePanel } from './components/GiriVoiceGuidePanel';
import { NavagrahaIcon } from './components/NavagrahaIcon';
import { ChartUploadStudio, PlanetHouseInput } from './components/ChartUploadStudio';
import { WixStudioEmbedPanel, notifyWixParent } from './components/WixStudioEmbedPanel';
import {
  GitHubSkillsUpgradePanel,
  INITIAL_GITHUB_SKILL_PACKS,
  GitHubVedicSkillPack,
} from './components/GitHubSkillsUpgradePanel';

type AppModuleId =
  | '1-workbench'
  | '2-settings'
  | '3-chart-upload'
  | '4-remedies'
  | '5-track-plan'
  | '6-track-remedies'
  | '7-horizon-plan';

type ChartViewMode = '3d' | '2d' | 'image';

interface TrackedDailyItem {
  id: string;
  itemType: 'plan' | 'remedy';
  title: string;
  naturalMethod: string;
  targetPlanet: string;
  completed: boolean;
  dateKey: string;
}

const MENU_MODULES: Array<{
  id: AppModuleId;
  numberLabel: string;
  title: string;
  subtitle: string;
}> = [
  {
    id: '1-workbench',
    numberLabel: '1. Custom Options',
    title: '3D Interactive Chart & Giri Voice Guide',
    subtitle: 'Explore your uploaded chart in 3D Blender Mandapa + Spoken Dictums',
  },
  {
    id: '2-settings',
    numberLabel: '2. Settings & GitHub',
    title: 'Vedic Techniques, GitHub Skills, Security & Wix',
    subtitle: 'GitHub Skill Packs, Lunar Astro, BNN, Jaimini, KP, SAV & Wix Velo',
  },
  {
    id: '3-chart-upload',
    numberLabel: '3. Chart Upload',
    title: 'Upload Your Chart or Generate by Wish',
    subtitle: 'Upload horoscope image or configure your 9 Navagraha placements',
  },
  {
    id: '4-remedies',
    numberLabel: '4. Remedies',
    title: '9-Planet Remedies & Remedy Report',
    subtitle: 'Natural Pranic, Behavioral, Vastu & Dinacharya Prescriptions',
  },
  {
    id: '5-track-plan',
    numberLabel: '5. Track Plan Everyday',
    title: 'Daily Dasha & Action Plan Tracker',
    subtitle: 'Structured daily execution synced with your chart goals',
  },
  {
    id: '6-track-remedies',
    numberLabel: '6. Track Remedies Daily',
    title: 'Daily Natural Remedy Habit Tracker',
    subtitle: 'Track natural remedies on a daily basis with cloud backup',
  },
  {
    id: '7-horizon-plan',
    numberLabel: '7. 3 / 6 / 12-Month Plan',
    title: 'Custom 3, 6, or 12-Month Vedic Plan',
    subtitle: 'Plan according to your wish across 3, 6, or 12 months',
  },
];

const DEFAULT_PLANET_HOUSES: PlanetHouseInput[] = [
  { symbol: 'Su', house: 10 },
  { symbol: 'Mo', house: 5 },
  { symbol: 'Ma', house: 10 },
  { symbol: 'Me', house: 1 },
  { symbol: 'Ju', house: 11 },
  { symbol: 'Ve', house: 4 },
  { symbol: 'Sa', house: 9 },
  { symbol: 'Ra', house: 3 },
  { symbol: 'Ke', house: 9 },
];

const TODAY_KEY = new Date().toISOString().slice(0, 10);
const WIX_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function App() {
  // Navigation & Top-Left Dropdown state (Clean Upload Studio first)
  const [activeModule, setActiveModule] = useState<AppModuleId>('3-chart-upload');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  // Firebase Auth & Security Vault state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authStatusMsg, setAuthStatusMsg] = useState<string>('');

  // User-Uploaded / User-Generated Chart State (starts null — no pre-built chart)
  const [userChart, setUserChart] = useState<VargaChartDefinition | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<number>(1);
  const [selectedPlanetSymbol, setSelectedPlanetSymbol] = useState<string | null>('Me');
  const [showAspects, setShowAspects] = useState<boolean>(true);
  const [showOuterPlanets, setShowOuterPlanets] = useState<boolean>(false);
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>('3d');

  // Module 2: User-selected Vedic Astrology Predictive Techniques
  const [enabledTechniqueIds, setEnabledTechniqueIds] = useState<string[]>(
    VEDIC_PREDICTIVE_TECHNIQUES.filter((t) => t.defaultEnabled).map((t) => t.id)
  );
  const [selectedAyanamsa, setSelectedAyanamsa] = useState<string>(
    'Lahiri (Chitrapaksha) — 23° 47\' 56"'
  );
  const [gitHubSkillPacks, setGitHubSkillPacks] = useState<GitHubVedicSkillPack[]>(
    INITIAL_GITHUB_SKILL_PACKS
  );

  // Module 3: Clean Chart Upload & Custom Wish Builder state
  const [uploadChartTitle, setUploadChartTitle] = useState<string>('My Natal Vedic Chart');
  const [uploadUserWish, setUploadUserWish] = useState<string>(
    'Career Leadership, Harmonious Relationships & Holistic Prosperity'
  );
  const [wishLagnaSign, setWishLagnaSign] = useState<number>(3);
  const [planetHouses, setPlanetHouses] = useState<PlanetHouseInput[]>(DEFAULT_PLANET_HOUSES);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<{ data: string; mimeType: string } | null>(
    null
  );
  const [isAnalyzingChart, setIsAnalyzingChart] = useState<boolean>(false);
  const [uploadValidationError, setUploadValidationError] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<string>('');

  // Module 4: Remedy Report preview, Share clipboard state & High-Profile Client Advisory Tier
  const [showRemedyReportPreview, setShowRemedyReportPreview] = useState<boolean>(true);
  const [clientTierId, setClientTierId] = useState<HighProfileClientTierId>('sovereign-executive');
  const [sharedRemedyCopied, setSharedRemedyCopied] = useState<boolean>(false);
  const [showShareSnippetDrawer, setShowShareSnippetDrawer] = useState<boolean>(false);

  // Module 5 & 6: Daily Plan & Daily Natural Remedies Tracking state
  const [dailyItems, setDailyItems] = useState<TrackedDailyItem[]>([
    {
      id: 'plan-1',
      itemType: 'plan',
      title: 'Morning Deep Focus & Chart Synthesis Block (90 Mins)',
      naturalMethod:
        'Complete 90 minutes of uninterrupted analytical or creative execution before checking notifications.',
      targetPlanet: 'Me',
      completed: true,
      dateKey: TODAY_KEY,
    },
    {
      id: 'plan-2',
      itemType: 'plan',
      title: '10th-House Digbala Executive Deliverable',
      naturalMethod:
        'Complete and ship one tangible milestone toward your primary 3/6/12-month goal.',
      targetPlanet: 'Ma',
      completed: false,
      dateKey: TODAY_KEY,
    },
    {
      id: 'rem-daily-1',
      itemType: 'remedy',
      title: 'North/Northeast Living Plant & Handwritten Journal',
      naturalMethod:
        'Tend green plants in your workspace and write 1 page of structured synthesis by hand each morning.',
      targetPlanet: 'Me',
      completed: true,
      dateKey: TODAY_KEY,
    },
    {
      id: 'rem-daily-2',
      itemType: 'remedy',
      title: 'Silver Vessel Morning Water & 90-Min Night Digital Fast',
      naturalMethod:
        'Drink water from a silver cup upon waking and turn off screens 90 minutes before sleep.',
      targetPlanet: 'Mo',
      completed: false,
      dateKey: TODAY_KEY,
    },
    {
      id: 'rem-daily-3',
      itemType: 'remedy',
      title: 'Sunset Silent Walk & Unbroken Vow Integrity',
      naturalMethod:
        'Take a 20-minute evening walk without headphones and honor every spoken commitment.',
      targetPlanet: 'Sa',
      completed: false,
      dateKey: TODAY_KEY,
    },
  ]);
  const [newPlanTitle, setNewPlanTitle] = useState<string>('');
  const [newPlanMethod, setNewPlanMethod] = useState<string>('');
  const [newPlanPlanet, setNewPlanPlanet] = useState<string>('Me');
  const [dailyFormError, setDailyFormError] = useState<string>('');

  // Module 7: 3 / 6 / 12-Month Horizon Planner state
  const [horizonMonths, setHorizonMonths] = useState<3 | 6 | 12>(6);
  const [completedMilestones, setCompletedMilestones] = useState<Record<number, boolean>>({
    1: true,
  });

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Close top-left dropdown menu on outside click or Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        menuContainerRef.current &&
        e.target instanceof Node &&
        !menuContainerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  // Listen to incoming Wix Velo messages when embedded in Wix Studio
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'WIX_INIT_CONFIG') {
        if (
          event.data.defaultHorizonMonths === 3 ||
          event.data.defaultHorizonMonths === 6 ||
          event.data.defaultHorizonMonths === 12
        ) {
          setHorizonMonths(event.data.defaultHorizonMonths);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Real-time Firestore listener for authenticated user's dailyPlans
  useEffect(() => {
    if (!authReady || !currentUser) return;
    const path = `users/${currentUser.uid}/dailyPlans`;
    const unsub = onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: TrackedDailyItem[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              itemType: data.itemType === 'remedy' ? 'remedy' : 'plan',
              title: String(data.title || ''),
              naturalMethod: String(data.naturalMethod || ''),
              targetPlanet: String(data.targetPlanet || 'Me'),
              completed: Boolean(data.completed),
              dateKey: String(data.dateKey || TODAY_KEY),
            };
          });
          setDailyItems(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return () => unsub();
  }, [authReady, currentUser]);

  const preferredTechniqueNames = VEDIC_PREDICTIVE_TECHNIQUES.filter((t) =>
    enabledTechniqueIds.includes(t.id)
  ).map((t) => t.name);

  const activeRoadmap = generateHorizonRoadmap(
    horizonMonths,
    uploadUserWish,
    preferredTechniqueNames
  );

  const remedyItems = dailyItems.filter((i) => i.itemType === 'remedy');
  const planItems = dailyItems.filter((i) => i.itemType === 'plan');

  const remedyReportParams = {
    ayanamsa: selectedAyanamsa,
    preferredTechniques: preferredTechniqueNames,
    horizonMonths,
    userWish: uploadUserWish,
    completedRemediesCount: remedyItems.filter((r) => r.completed).length,
    totalRemediesCount: remedyItems.length,
    chartTitle: userChart?.name || uploadChartTitle,
    lagnaName: userChart?.lagnaName || 'Gemini (Mithuna)',
    clientTierId,
  };

  const fullRemedyReportText = generateComprehensiveRemedyReport(remedyReportParams);
  const shareableRemedySnippetText = generateShareableRemedyPlanSnippet(remedyReportParams);

  const activeClientTier =
    HIGH_PROFILE_CLIENT_TIERS.find((t) => t.id === clientTierId) || HIGH_PROFILE_CLIENT_TIERS[0];

  const showTransientStatus = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(''), 4000);
  };

  const handleSelectHouse = (houseNum: number) => {
    setSelectedHouse(houseNum);
    if (!userChart) return;
    const houseData = userChart.houses.find((h) => h.house === houseNum);
    setSelectedPlanetSymbol(
      houseData && houseData.occupants.length > 0 ? houseData.occupants[0] : null
    );
  };

  const handleSelectPlanet = (symbol: string, houseNum: number) => {
    setSelectedHouse(houseNum);
    setSelectedPlanetSymbol(symbol);
  };

  const handleChangePlanetHouse = (symbol: string, house: number) => {
    setPlanetHouses((prev) =>
      prev.map((item) => (item.symbol === symbol ? { ...item, house } : item))
    );
  };

  const handleToggleTechnique = (id: string) => {
    setEnabledTechniqueIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((item) => item !== id) : prev;
      }
      return [...prev, id];
    });
  };

  const handleToggleGitHubSkillPack = (id: string) => {
    setGitHubSkillPacks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const handleImportGitHubChartPreset = (preset: {
    title: string;
    lagnaSign: number;
    wish: string;
    planetHouses: PlanetHouseInput[];
    clientTierId?: HighProfileClientTierId;
  }) => {
    setUploadChartTitle(preset.title);
    setWishLagnaSign(preset.lagnaSign);
    setUploadUserWish(preset.wish);
    setPlanetHouses(preset.planetHouses);
    if (preset.clientTierId) {
      setClientTierId(preset.clientTierId);
    }

    const built = buildCustomVargaChart({
      title: preset.title,
      lagnaSign: preset.lagnaSign,
      userWish: preset.wish,
      planetHouses: preset.planetHouses,
    });
    setUserChart(built);
    setSelectedHouse(1);
    setSelectedPlanetSymbol(built.houses[0]?.occupants[0] || 'Su');
    showTransientStatus(`Imported "${preset.title}" via GitHub Skills into 3D Mandapa.`);
    setActiveModule('1-workbench');
  };

  const handleGoogleAuthToggle = async () => {
    try {
      if (currentUser) {
        await signOutUser();
        setAuthStatusMsg('Signed out of Cloud Security Vault');
      } else {
        await signInWithGoogle();
        setAuthStatusMsg('Signed in · Zero-Trust Firestore Vault Active');
      }
    } catch (err) {
      setAuthStatusMsg(
        err instanceof Error ? err.message : 'Authentication popup closed or blocked'
      );
    } finally {
      setTimeout(() => setAuthStatusMsg(''), 4000);
    }
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadValidationError('');
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      setUploadedPreviewUrl(result);
      const commaIndex = result.indexOf(',');
      if (commaIndex !== -1) {
        setUploadedBase64({
          data: result.slice(commaIndex + 1),
          mimeType: file.type || 'image/jpeg',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearUploadedFile = () => {
    setUploadedPreviewUrl(null);
    setUploadedBase64(null);
  };

  const handleGenerateOrReadChart = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = uploadChartTitle.trim();
    if (!trimmedTitle && !uploadedBase64) {
      setUploadValidationError(
        'Please upload a horoscope image or enter your Name / Chart Title to build your 3D chart.'
      );
      return;
    }

    setUploadValidationError('');
    setIsAnalyzingChart(true);

    try {
      let extractedLagna = wishLagnaSign;
      let extractedSignature: string | undefined;
      let extractedSynthesis: string | undefined;
      let extractedPlanets: PlanetHouseInput[] = planetHouses;

      if (uploadedBase64) {
        const response = await fetch('/api/astrology/analyze-chart-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: uploadedBase64.data,
            mimeType: uploadedBase64.mimeType,
            chartTitle: trimmedTitle || 'Uploaded Vedic Horoscope',
            userWish: uploadUserWish.trim() || 'Holistic Prosperity & Mastery',
            preferredTechniques: preferredTechniqueNames,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          extractedLagna = Number(data.lagnaSign) || wishLagnaSign;
          extractedSignature = data.keySignature;
          extractedSynthesis = data.lunarAstroSynthesis;
          if (Array.isArray(data.planetHouses) && data.planetHouses.length > 0) {
            extractedPlanets = data.planetHouses;
          }
        }
      }

      const built = buildCustomVargaChart({
        title: trimmedTitle || 'Uploaded Vedic Horoscope',
        lagnaSign: extractedLagna,
        userWish: uploadUserWish.trim() || 'Holistic Prosperity & Mastery',
        keySignature: extractedSignature,
        lunarAstroSynthesis: extractedSynthesis,
        planetHouses: extractedPlanets,
        sourceImage: uploadedPreviewUrl || undefined,
      });

      setUserChart(built);
      const firstOccupied = built.houses.find((h) => h.occupants.length > 0);
      setSelectedHouse(firstOccupied?.house ?? 1);
      setSelectedPlanetSymbol(firstOccupied?.occupants[0] ?? 'Me');
      setChartViewMode('3d');

      notifyWixParent('WIX_CHART_UPLOADED', {
        title: built.name,
        lagnaSign: built.lagnaSign,
        lagnaName: built.lagnaName,
        wish: built.purpose,
      });

      if (currentUser) {
        const chartId = `chart-${Date.now()}`;
        const path = `users/${currentUser.uid}/charts/${chartId}`;
        try {
          await setDoc(doc(db, 'users', currentUser.uid, 'charts', chartId), {
            userId: currentUser.uid,
            title: built.name.slice(0, 120),
            lagnaSign: built.lagnaSign,
            wishFocus: built.purpose.slice(0, 200),
            summaryDictum: built.lunarAstroSynthesis.slice(0, 2000),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }

      showTransientStatus('3D Vedic Chart ready in your Interactive Mandapa.');
      setActiveModule('1-workbench');
    } catch {
      const fallbackBuilt = buildCustomVargaChart({
        title: trimmedTitle || 'Uploaded Vedic Horoscope',
        lagnaSign: wishLagnaSign,
        userWish: uploadUserWish.trim() || 'Holistic Prosperity & Mastery',
        planetHouses,
        sourceImage: uploadedPreviewUrl || undefined,
      });
      setUserChart(fallbackBuilt);
      setSelectedHouse(1);
      setSelectedPlanetSymbol(fallbackBuilt.houses[0]?.occupants[0] || 'Me');
      showTransientStatus('3D Vedic Chart ready in your Interactive Mandapa.');
      setActiveModule('1-workbench');
    } finally {
      setIsAnalyzingChart(false);
    }
  };

  const handleClearActiveChart = () => {
    setUserChart(null);
    setUploadedPreviewUrl(null);
    setUploadedBase64(null);
    setActiveModule('3-chart-upload');
    showTransientStatus('Chart cleared. Upload or configure a new horoscope below.');
  };

  const syncDailyItemToFirestore = async (item: TrackedDailyItem) => {
    if (!currentUser) return;
    const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120) || `item-${Date.now()}`;
    const path = `users/${currentUser.uid}/dailyPlans/${safeId}`;
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'dailyPlans', safeId), {
        userId: currentUser.uid,
        itemType: item.itemType,
        title: item.title.slice(0, 160),
        naturalMethod: item.naturalMethod.slice(0, 400),
        targetPlanet: item.targetPlanet.slice(0, 12),
        completed: item.completed,
        dateKey: item.dateKey.slice(0, 16),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleToggleDailyItem = async (id: string) => {
    const target = dailyItems.find((i) => i.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;
    setDailyItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: nextCompleted } : item))
    );

    if (currentUser) {
      const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120);
      const path = `users/${currentUser.uid}/dailyPlans/${safeId}`;
      try {
        await updateDoc(doc(db, 'users', currentUser.uid, 'dailyPlans', safeId), {
          completed: nextCompleted,
          updatedAt: serverTimestamp(),
        });
      } catch {
        await syncDailyItemToFirestore({ ...target, completed: nextCompleted });
      }
    }
  };

  const handleAddDailyTrackedItem = async (
    itemType: 'plan' | 'remedy',
    title: string,
    naturalMethod: string,
    targetPlanet: string
  ) => {
    const cleanTitle = title.trim().slice(0, 160);
    const cleanMethod = naturalMethod.trim().slice(0, 400);
    if (!cleanTitle || !cleanMethod) {
      setDailyFormError('Please enter both a title and a natural method.');
      return;
    }
    setDailyFormError('');

    const newItem: TrackedDailyItem = {
      id: `${itemType}-${Date.now()}`,
      itemType,
      title: cleanTitle,
      naturalMethod: cleanMethod,
      targetPlanet: targetPlanet.slice(0, 12) || 'Me',
      completed: false,
      dateKey: TODAY_KEY,
    };

    setDailyItems((prev) => [newItem, ...prev]);
    await syncDailyItemToFirestore(newItem);
    showTransientStatus(
      `Added to ${itemType === 'remedy' ? 'Daily Natural Remedies' : 'Daily Action Plan'}`
    );
  };

  const handleDeleteDailyItem = async (id: string) => {
    setDailyItems((prev) => prev.filter((i) => i.id !== id));
    if (currentUser) {
      const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120);
      const path = `users/${currentUser.uid}/dailyPlans/${safeId}`;
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'dailyPlans', safeId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  };

  const handleSaveHorizonPlanToCloud = async () => {
    if (!currentUser) {
      showTransientStatus(
        `${horizonMonths}-Month Plan updated in session (Sign in to back up to Cloud Vault)`
      );
      return;
    }
    const horizonId = `horizon-${horizonMonths}m`;
    const path = `users/${currentUser.uid}/horizonPlans/${horizonId}`;
    const completedCount = Object.values(completedMilestones).filter(Boolean).length;
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'horizonPlans', horizonId), {
        userId: currentUser.uid,
        durationMonths: horizonMonths,
        goalTitle: uploadUserWish.trim().slice(0, 180) || 'Vedic Mastery Plan',
        preferredTechnique: (preferredTechniqueNames[0] || 'Lunar Astro').slice(0, 100),
        completedMilestonesCount: completedCount,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showTransientStatus(`Saved ${horizonMonths}-Month Plan to Zero-Trust Cloud Vault`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleDownloadRemedyReport = () => {
    const blob = new Blob([fullRemedyReportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lunar-astro-navagraha-remedy-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notifyWixParent('WIX_REMEDY_REPORT_EXPORTED', { horizonMonths, clientTierId });
    showTransientStatus('Remedy Report downloaded (lunar-astro-navagraha-remedy-report.txt)');
  };

  const handleShareRemedyReport = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareableRemedySnippetText);
      } else {
        const tempArea = document.createElement('textarea');
        tempArea.value = shareableRemedySnippetText;
        tempArea.style.position = 'fixed';
        tempArea.style.opacity = '0';
        document.body.appendChild(tempArea);
        tempArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempArea);
      }
    } catch {
      // Fallback handled gracefully by exposing the formatted snippet box
    }
    setSharedRemedyCopied(true);
    setShowShareSnippetDrawer(true);
    notifyWixParent('WIX_REMEDY_PLAN_SHARED', {
      horizonMonths,
      clientTierId,
      snippetLength: shareableRemedySnippetText.length,
    });
    showTransientStatus(
      `Formatted Vedic Remedy Plan snippet copied to clipboard (${activeClientTier.label}).`
    );
    setTimeout(() => setSharedRemedyCopied(false), 3500);
  };

  const activeModuleMeta =
    MENU_MODULES.find((m) => m.id === activeModule) || MENU_MODULES[2];

  const effectiveModuleKey =
    activeModule === '1-workbench' && !userChart ? '3-chart-upload-empty' : activeModule;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-neutral-900">
      {/* Clean Wix Studio 3-Zone Top Bar with Left-Up Menu Dropdown */}
      <header className="relative z-30 flex items-center justify-between gap-8 px-6 py-4 bg-white border-b border-neutral-200">
        {/* Zone 1: Top-Left Menu Dropdown + Clean Single-Line Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div ref={menuContainerRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-label="Open Vedic Astrology Navigation Menu"
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-mono-tabular font-semibold bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Menu</span>
              <span className="text-neutral-300 hidden sm:inline">
                ({activeModuleMeta.numberLabel})
              </span>
              <span
                aria-hidden="true"
                className={`inline-block wix-chevron-transition ${
                  menuOpen ? 'rotate-180' : 'rotate-0'
                }`}
              >
                ▼
              </span>
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-label="Vedic Astrology Application Modules"
                className="wix-dropdown-transition absolute left-0 mt-2 w-80 sm:w-96 bg-white border border-neutral-200 rounded-lg shadow-xl py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono-tabular font-semibold text-neutral-500">
                    Vedic Foundation · 7 Modules (Vercel &amp; Wix)
                  </span>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="text-xs text-neutral-400 hover:text-neutral-800 cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="divide-y divide-neutral-100">
                  {MENU_MODULES.map((mod, idx) => {
                    const isCurrent = mod.id === activeModule;
                    return (
                      <button
                        key={mod.id}
                        role="menuitem"
                        type="button"
                        style={{ animationDelay: `${idx * 18}ms` }}
                        onClick={() => {
                          setActiveModule(mod.id);
                          setMenuOpen(false);
                        }}
                        className={`wix-dropdown-item w-full text-left px-4 py-2.5 transition-colors duration-150 cursor-pointer flex items-start justify-between gap-3 ${
                          isCurrent ? 'bg-neutral-100' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-mono-tabular font-bold text-neutral-900">
                            {mod.numberLabel} — {mod.title}
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            {mod.subtitle}
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="text-xs font-mono-tabular font-semibold text-neutral-900 shrink-0">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveModule(userChart ? '1-workbench' : '3-chart-upload');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 font-display whitespace-nowrap shrink-0"
          >
            Vedic Foundation
          </a>
        </div>

        {/* Zone 2: 4 Clean Single-Line Navigation Links with Fluid Underline Transition */}
        <nav
          aria-label="Primary Modules"
          className="hidden lg:flex items-center gap-6 text-xs font-medium text-neutral-600"
        >
          {(
            [
              { id: '3-chart-upload', label: 'Chart Upload' },
              { id: '1-workbench', label: '3D Chart & Voice' },
              { id: '4-remedies', label: 'Remedies & Report' },
              { id: '2-settings', label: 'GitHub & Settings' },
            ] as const
          ).map((mod) => {
            const isNavActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => setActiveModule(mod.id)}
                className={`relative py-1.5 transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                  isNavActive ? 'text-neutral-900 font-bold' : 'hover:text-neutral-900'
                }`}
              >
                <span>{mod.label}</span>
                <span
                  aria-hidden="true"
                  className={`wix-nav-indicator absolute left-0 right-0 -bottom-0.5 h-0.5 bg-neutral-900 rounded-full ${
                    isNavActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Security Vault + Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleGoogleAuthToggle}
            className="px-3 py-2 text-xs font-mono-tabular font-medium rounded-md border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {currentUser
              ? `Vault: ${currentUser.displayName?.split(' ')[0] || 'Protected'}`
              : 'Sign In (Vault)'}
          </button>

          <button
            type="button"
            onClick={handleDownloadRemedyReport}
            className="px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Remedy Report
          </button>
        </div>
      </header>

      <main id="top" className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-8">
        {/* Transient Feedback Banner (Only visible when triggered) */}
        {(statusBanner || authStatusMsg) && (
          <div
            role="status"
            className="wix-dropdown-transition mb-6 px-4 py-2.5 bg-white border border-neutral-300 rounded-md text-xs font-mono-tabular text-neutral-800 flex items-center justify-between"
          >
            <span>{statusBanner || authStatusMsg}</span>
            <button
              type="button"
              onClick={() => {
                setStatusBanner('');
                setAuthStatusMsg('');
              }}
              className="text-neutral-400 hover:text-neutral-800 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Fluid Module Switching Container */}
        <div key={effectiveModuleKey} className="wix-module-transition">
            {/* =====================================================================
                MODULE 3 OR EMPTY CHART STATE: CLEAN WIX STUDIO UPLOAD & BUILDER
               ===================================================================== */}
            {(activeModule === '3-chart-upload' ||
              (activeModule === '1-workbench' && !userChart)) && (
              <ChartUploadStudio
                chartTitle={uploadChartTitle}
                onChangeChartTitle={(val) => {
                  setUploadChartTitle(val);
                  if (uploadValidationError) setUploadValidationError('');
                }}
                lagnaSign={wishLagnaSign}
                onChangeLagnaSign={setWishLagnaSign}
                userWish={uploadUserWish}
                onChangeUserWish={setUploadUserWish}
                horizonMonths={horizonMonths}
                onChangeHorizonMonths={setHorizonMonths}
                planetHouses={planetHouses}
                onChangePlanetHouse={handleChangePlanetHouse}
                uploadedPreviewUrl={uploadedPreviewUrl}
                onFileUploadChange={handleFileUploadChange}
                onClearUploadedFile={handleClearUploadedFile}
                onSubmitChart={handleGenerateOrReadChart}
                isAnalyzingChart={isAnalyzingChart}
                validationError={uploadValidationError}
                hasActiveChart={Boolean(userChart)}
                onReturnToActiveChart={() => setActiveModule('1-workbench')}
                onOpenGitHubSkills={() => setActiveModule('2-settings')}
              />
            )}

        {/* =====================================================================
            MODULE 1: 3D INTERACTIVE CHART & DEEPANSHU GIRI VOICE GUIDE
            (Rendered only after the user uploads or generates their chart)
           ===================================================================== */}
        {activeModule === '1-workbench' && userChart && (
          <section className="space-y-6">
            {/* Clean Active Chart Header Bar */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono-tabular text-neutral-500">
                  Active Uploaded Chart · {selectedAyanamsa}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">
                  {userChart.name} — {userChart.lagnaName} Ascendant
                </h1>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Goal: {userChart.purpose} · Techniques: {preferredTechniqueNames.join(' · ')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModule('3-chart-upload')}
                  className="px-3.5 py-2 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  Edit / Upload Another Chart
                </button>
                <button
                  type="button"
                  onClick={handleClearActiveChart}
                  className="px-3.5 py-2 text-xs font-medium border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  Clear Chart
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (5 cols): 3D Blender Mandapa + 9-Planet Navagraha Icons */}
              <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-lg p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-neutral-200">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">
                      Interactive 3D Chart Viewport
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Click any of the 9 Navagraha icons or 3D chambers
                    </p>
                  </div>

                  <div
                    role="group"
                    aria-label="Chart Display Mode"
                    className="flex items-center gap-1 bg-neutral-100 p-1 rounded-md shrink-0"
                  >
                    {(
                      [
                        { id: '3d', label: '3D Blender' },
                        { id: '2d', label: '2D SVG' },
                        ...(uploadedPreviewUrl
                          ? ([{ id: 'image', label: 'Uploaded Image' }] as const)
                          : []),
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setChartViewMode(m.id as ChartViewMode)}
                        aria-pressed={chartViewMode === m.id}
                        className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          chartViewMode === m.id
                            ? 'bg-neutral-900 text-white'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {chartViewMode === 'image' && uploadedPreviewUrl ? (
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-col items-center">
                    <img
                      src={uploadedPreviewUrl}
                      alt={`Uploaded chart for ${userChart.name}`}
                      referrerPolicy="no-referrer"
                      className="max-h-[420px] w-auto object-contain rounded"
                    />
                  </div>
                ) : chartViewMode === '2d' ? (
                  <NorthIndianChart
                    vargaChart={userChart}
                    selectedHouse={selectedHouse}
                    selectedPlanetSymbol={selectedPlanetSymbol}
                    showAspects={showAspects}
                    showOuterPlanets={showOuterPlanets}
                    onSelectHouse={handleSelectHouse}
                    onSelectPlanet={handleSelectPlanet}
                  />
                ) : (
                  <NorthIndianChart3D
                    vargaChart={userChart}
                    selectedHouse={selectedHouse}
                    selectedPlanetSymbol={selectedPlanetSymbol}
                    showAspects={showAspects}
                    showOuterPlanets={showOuterPlanets}
                    onSelectHouse={handleSelectHouse}
                    onSelectPlanet={handleSelectPlanet}
                  />
                )}

                <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-700">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showAspects}
                      onChange={(e) => setShowAspects(e.target.checked)}
                      className="rounded border-neutral-300 text-neutral-900"
                    />
                    <span>Show Graha Drishti (Vedic Aspects)</span>
                  </label>
                </div>
              </div>

              {/* Right Column (7 cols): Deepanshu Giri Voice Mentor + Bhava Inspector */}
              <div className="lg:col-span-7 space-y-6">
                <GiriVoiceGuidePanel
                  vargaChart={userChart}
                  selectedHouse={selectedHouse}
                  selectedPlanetSymbol={selectedPlanetSymbol}
                  preferredTechniques={preferredTechniqueNames}
                  onAddNaturalRemedyToTracker={(title, method, planet) =>
                    handleAddDailyTrackedItem('remedy', title, method, planet)
                  }
                />

                <PlanetInspector
                  vargaChart={userChart}
                  selectedHouse={selectedHouse}
                  selectedPlanetSymbol={selectedPlanetSymbol}
                  onSelectHouse={handleSelectHouse}
                  onSelectPlanet={handleSelectPlanet}
                />
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            MODULE 2: SETTINGS, VEDIC TECHNIQUES, SECURITY & WIX STUDIO
           ===================================================================== */}
        {activeModule === '2-settings' && (
          <section className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    2. Select Your Preferred Vedic Astrology Predictive Techniques
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Choose which Vedic astrologer lineages guide your 3D Chart, Deepanshu Giri Voice Mentor, and 3/6/12-Month Plan
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="ayanamsa-select"
                    className="text-xs font-mono-tabular font-semibold text-neutral-700"
                  >
                    Ayanamsa:
                  </label>
                  <select
                    id="ayanamsa-select"
                    value={selectedAyanamsa}
                    onChange={(e) => setSelectedAyanamsa(e.target.value)}
                    className="px-3 py-1.5 text-xs font-mono-tabular bg-neutral-50 border border-neutral-300 rounded text-neutral-900"
                  >
                    <option value="Lahiri (Chitrapaksha) — 23° 47' 56&quot;">
                      Lahiri (Chitrapaksha) — 23° 47&apos; 56&quot;
                    </option>
                    <option value="Pushya Paksha (True Star) — 23° 34' 12&quot;">
                      Pushya Paksha (True Star) — 23° 34&apos; 12&quot;
                    </option>
                    <option value="KP New (Krishnamurti) — 23° 42' 05&quot;">
                      KP New (Krishnamurti) — 23° 42&apos; 05&quot;
                    </option>
                    <option value="B.V. Raman — 22° 21' 30&quot;">
                      B.V. Raman — 22° 21&apos; 30&quot;
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VEDIC_PREDICTIVE_TECHNIQUES.map((tech) => {
                  const isChecked = enabledTechniqueIds.includes(tech.id);
                  return (
                    <div
                      key={tech.id}
                      onClick={() => handleToggleTechnique(tech.id)}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-neutral-100 border-neutral-900'
                          : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-mono-tabular text-neutral-600">
                            {tech.masterLineage}
                          </div>
                          <h3 className="text-sm font-bold text-neutral-900 mt-0.5">
                            {tech.name}
                          </h3>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          aria-label={`Enable ${tech.name}`}
                          className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900"
                        />
                      </div>
                      <p className="mt-2 text-xs text-neutral-700 leading-relaxed">
                        {tech.coreMechanism}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Zero-Trust Cloud Security Vault */}
              <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F7F7F5] p-4 rounded-lg">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Zero-Trust Data Protection &amp; Private Horoscope Vault
                  </h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Protected by Firebase Authentication and strict UID-isolated Firestore Security Rules (`request.auth.uid == userId`).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleAuthToggle}
                  className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-md hover:bg-neutral-800 cursor-pointer shrink-0"
                >
                  {currentUser ? 'Sign Out of Cloud Vault' : 'Connect Google Security Vault'}
                </button>
              </div>
            </div>

            {/* GitHub Skills & Repository Upgrade Hub */}
            <GitHubSkillsUpgradePanel
              userChart={userChart}
              skillPacks={gitHubSkillPacks}
              onToggleSkillPack={handleToggleGitHubSkillPack}
              clientTierId={clientTierId}
              onSelectClientTier={(tier) => {
                setClientTierId(tier);
                showTransientStatus(`High-Profile Advisory Tier calibrated to ${tier}.`);
              }}
              onImportGitHubChartPreset={handleImportGitHubChartPreset}
            />

            {/* Wix Studio & Wix Velo Integration Panel */}
            <WixStudioEmbedPanel
              userChart={userChart}
              preferredTechniques={preferredTechniqueNames}
              horizonMonths={horizonMonths}
            />
          </section>
        )}

        {/* =====================================================================
            MODULE 4: NATURAL VEDIC REMEDIES HUB & OFFICIAL REMEDY REPORT
           ===================================================================== */}
        {activeModule === '4-remedies' && (
          <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200">
              <div>
                <div className="text-xs font-mono-tabular text-neutral-500">
                  {activeClientTier.badgeCode} · {activeClientTier.githubSkillPackage}
                </div>
                <h2 className="text-lg font-bold text-neutral-900 mt-0.5">
                  4. 9-Planet Navagraha Natural Remedies &amp; Official Remedy Report
                </h2>
                <p className="text-xs text-neutral-500">
                  100% natural behavioral, pranic, Vastu, and Ayurvedic Dinacharya prescriptions for high-profile clients
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareRemedyReport}
                  aria-label="Share Vedic Remedy Plan to Clipboard"
                  className="px-3.5 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  {sharedRemedyCopied ? 'Copied to Clipboard!' : 'Share'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRemedyReportPreview((prev) => !prev)}
                  className="px-3 py-2 text-xs font-mono-tabular font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 rounded-md cursor-pointer"
                >
                  {showRemedyReportPreview ? 'Hide Remedy Report' : 'View Remedy Report'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadRemedyReport}
                  className="px-3.5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-md cursor-pointer"
                >
                  Download Remedy Report (.txt)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModule('6-track-remedies')}
                  className="px-3.5 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 rounded-md cursor-pointer"
                >
                  Open Daily Remedy Tracker ({remedyItems.filter((r) => r.completed).length}/
                  {remedyItems.length})
                </button>
              </div>
            </div>

            {/* High-Profile Client GitHub Skill Advisory Bar */}
            <div className="p-4 bg-[#F7F7F5] border border-neutral-200 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono-tabular font-bold text-neutral-900">
                  High-Profile Client GitHub Skill Calibration · {activeClientTier.label}
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  <strong>Muhurta &amp; Executive Protocol:</strong> {activeClientTier.muhurtaDirective}
                </p>
              </div>

              <div
                role="group"
                aria-label="Select High-Profile Client Advisory Tier"
                className="flex flex-wrap items-center gap-1.5 bg-white p-1 border border-neutral-200 rounded-md shrink-0"
              >
                {HIGH_PROFILE_CLIENT_TIERS.map((tier) => {
                  const isActive = tier.id === clientTierId;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setClientTierId(tier.id)}
                      aria-pressed={isActive}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-neutral-900 text-white font-semibold'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {tier.id === 'sovereign-executive'
                        ? 'C-Suite & Founder'
                        : tier.id === 'family-office'
                          ? 'Family Office'
                          : 'Public Eminence'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shareable Formatted Clipboard Snippet Drawer (Revealed when Share is clicked) */}
            {showShareSnippetDrawer && (
              <div
                role="region"
                aria-label="Formatted Shareable Remedy Plan Snippet"
                className="wix-dropdown-transition p-4 bg-neutral-50 border border-neutral-300 rounded-lg space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono-tabular font-bold text-neutral-900">
                      Formatted Shareable Remedy Plan Snippet · Ready to Paste
                    </div>
                    <p className="text-xs text-neutral-600">
                      Copied to your clipboard for sharing with family offices, executive assistants, mentors, or partners
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShareRemedyReport}
                      className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800 cursor-pointer"
                    >
                      {sharedRemedyCopied ? 'Copied!' : 'Copy Snippet Again'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowShareSnippetDrawer(false)}
                      className="px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 cursor-pointer"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
                <pre className="p-3.5 bg-white border border-neutral-200 rounded text-[11px] font-mono-tabular text-neutral-800 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                  {shareableRemedySnippetText}
                </pre>
              </div>
            )}

            {showRemedyReportPreview && (
              <div className="p-5 bg-neutral-900 text-neutral-100 rounded-lg border border-neutral-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                  <div>
                    <div className="text-xs font-mono-tabular text-amber-400">
                      Official Diagnostic &amp; Circadian Prescription · {activeClientTier.badgeCode}
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Personalized 9-Planet Navagraha &amp; Lunar Astro Remedy Report
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShareRemedyReport}
                      className="px-3 py-1.5 text-xs font-mono-tabular font-semibold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 rounded cursor-pointer"
                    >
                      {sharedRemedyCopied ? 'Snippet Copied!' : 'Share Remedy Plan'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadRemedyReport}
                      className="px-3 py-1.5 text-xs font-mono-tabular font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded cursor-pointer"
                    >
                      Export Remedy Report
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 bg-neutral-800/90 border border-neutral-700 rounded">
                    <div className="font-mono-tabular font-bold text-amber-300 mb-1">
                      06:00 AM · DAWN
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      Silver vessel hydration (Moon) + Sunrise Surya Arghya (Sun).
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-800/90 border border-neutral-700 rounded">
                    <div className="font-mono-tabular font-bold text-emerald-300 mb-1">
                      07:30 AM · MORNING
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      North green plants + 1 page handwritten synthesis before screens (Mercury).
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-800/90 border border-neutral-700 rounded">
                    <div className="font-mono-tabular font-bold text-rose-300 mb-1">
                      12:30 PM · MIDDAY
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      30-min structured strength sweat discipline (Mars) + single-tab deep work.
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-800/90 border border-neutral-700 rounded">
                    <div className="font-mono-tabular font-bold text-sky-300 mb-1">
                      06:15 PM · SUNSET
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      20-min headphone-free walk (Saturn) + sandalwood/rose home transition.
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-800/90 border border-neutral-700 rounded">
                    <div className="font-mono-tabular font-bold text-purple-300 mb-1">
                      09:30 PM · NIGHT
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      90-min digital fast + Chandra Bhedana breath + Ketu witness meditation.
                    </p>
                  </div>
                </div>

                <pre className="max-h-64 overflow-y-auto p-3.5 bg-neutral-950 text-neutral-200 rounded border border-neutral-800 text-[11px] font-mono-tabular leading-relaxed whitespace-pre-wrap">
                  {fullRemedyReportText}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {NATURAL_VEDIC_REMEDIES.map((rem) => (
                <div
                  key={rem.id}
                  className="p-4 bg-[#F7F7F5] border border-neutral-200 rounded-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <NavagrahaIcon symbol={rem.planetSymbol} size="md" active />
                      <div>
                        <div className="text-xs font-mono-tabular font-bold text-neutral-900">
                          {rem.planetName}
                        </div>
                        <div className="text-[11px] font-mono-tabular text-neutral-600">
                          {rem.category} · {rem.dailyTiming}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 mb-1.5">{rem.title}</h3>
                    <p className="text-xs text-neutral-800 leading-relaxed mb-2">
                      <strong>Natural Practice:</strong> {rem.naturalMethod}
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                      <strong>Lunar Astro Mechanism:</strong> {rem.astrologicalWhy}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddDailyTrackedItem(
                        'remedy',
                        rem.title,
                        rem.naturalMethod,
                        rem.planetSymbol
                      )
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono-tabular font-semibold bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-900 rounded cursor-pointer"
                  >
                    + Add to Daily Natural Remedy Tracker
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================================
            MODULE 5 & MODULE 6: TRACK PLAN EVERYDAY & TRACK REMEDIES DAILY
           ===================================================================== */}
        {(activeModule === '5-track-plan' || activeModule === '6-track-remedies') && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-lg p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-neutral-200">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    {activeModule === '6-track-remedies'
                      ? '6. Track Natural Remedies on a Daily Basis'
                      : '5. Track Your Vedic Action Plan Everyday'}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Date: {TODAY_KEY} · Check off items daily to align your prana and Dasha karma naturally
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md">
                  <button
                    type="button"
                    onClick={() => setActiveModule('5-track-plan')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer whitespace-nowrap ${
                      activeModule === '5-track-plan'
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-700'
                    }`}
                  >
                    Daily Plan ({planItems.filter((i) => i.completed).length}/{planItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModule('6-track-remedies')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer whitespace-nowrap ${
                      activeModule === '6-track-remedies'
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-700'
                    }`}
                  >
                    Natural Remedies ({remedyItems.filter((i) => i.completed).length}/
                    {remedyItems.length})
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {(activeModule === '6-track-remedies' ? remedyItems : planItems).map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border flex items-start justify-between gap-3 ${
                      item.completed
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-[#F7F7F5] border-neutral-200'
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleDailyItem(item.id)}
                        className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900"
                      />
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono-tabular text-neutral-500">
                          <span className="font-bold text-neutral-900">
                            Planet: {item.targetPlanet}
                          </span>
                          <span>·</span>
                          <span>{item.dateKey}</span>
                        </div>
                        <div
                          className={`text-sm font-bold mt-0.5 ${
                            item.completed ? 'line-through text-neutral-500' : 'text-neutral-900'
                          }`}
                        >
                          {item.title}
                        </div>
                        <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                          {item.naturalMethod}
                        </p>
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteDailyItem(item.id)}
                      className="text-xs text-neutral-400 hover:text-red-600 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-base font-bold text-neutral-900 mb-1">
                Add Custom {activeModule === '6-track-remedies' ? 'Natural Remedy' : 'Daily Action'}
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Create a personalized natural habit or Dasha task and track it daily
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddDailyTrackedItem(
                    activeModule === '6-track-remedies' ? 'remedy' : 'plan',
                    newPlanTitle,
                    newPlanMethod,
                    newPlanPlanet
                  );
                  if (newPlanTitle.trim() && newPlanMethod.trim()) {
                    setNewPlanTitle('');
                    setNewPlanMethod('');
                  }
                }}
                noValidate
                className="space-y-3"
              >
                <div>
                  <label
                    htmlFor="new-daily-title"
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Title
                  </label>
                  <input
                    id="new-daily-title"
                    type="text"
                    value={newPlanTitle}
                    onChange={(e) => {
                      setNewPlanTitle(e.target.value);
                      if (dailyFormError) setDailyFormError('');
                    }}
                    placeholder="e.g., Morning Surya Arghya & Pranayama"
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-daily-planet"
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Target Planet (Navagraha)
                  </label>
                  <select
                    id="new-daily-planet"
                    value={newPlanPlanet}
                    onChange={(e) => setNewPlanPlanet(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md"
                  >
                    <option value="Su">Sun (Su — Surya)</option>
                    <option value="Mo">Moon (Mo — Chandra)</option>
                    <option value="Ma">Mars (Ma — Mangala)</option>
                    <option value="Me">Mercury (Me — Budha)</option>
                    <option value="Ju">Jupiter (Ju — Guru)</option>
                    <option value="Ve">Venus (Ve — Shukra)</option>
                    <option value="Sa">Saturn (Sa — Shani)</option>
                    <option value="Ra">Rahu (Ra — North Node)</option>
                    <option value="Ke">Ketu (Ke — South Node)</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="new-daily-method"
                    className="block text-xs font-medium text-neutral-700 mb-1"
                  >
                    Natural Method / Daily Execution Step
                  </label>
                  <textarea
                    id="new-daily-method"
                    rows={3}
                    value={newPlanMethod}
                    onChange={(e) => {
                      setNewPlanMethod(e.target.value);
                      if (dailyFormError) setDailyFormError('');
                    }}
                    placeholder="Describe the natural behavioral, breathwork, or routine step..."
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md"
                  />
                </div>
                {dailyFormError && (
                  <p role="alert" className="text-xs text-red-600 font-medium">
                    {dailyFormError}
                  </p>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-md hover:bg-neutral-800 cursor-pointer"
                >
                  Save to Daily Tracker
                </button>
              </form>
            </div>
          </section>
        )}

        {/* =====================================================================
            MODULE 7: 3-MONTH, 6-MONTH, OR 12-MONTH CUSTOM HORIZON PLANNER
           ===================================================================== */}
        {activeModule === '7-horizon-plan' && (
          <section className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 mb-6 border-b border-neutral-200">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-neutral-900">
                  7. Plan According to Your Wish: Choose 3 Months, 6 Months, or 12 Months
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5 mb-3">
                  Select your preferred time horizon and life goal—automatically synchronized with your selected Vedic techniques
                </p>
                <label
                  htmlFor="horizon-goal-input"
                  className="block text-xs font-medium text-neutral-700 mb-1"
                >
                  Your Primary Wish / Objective for This {horizonMonths}-Month Horizon:
                </label>
                <input
                  id="horizon-goal-input"
                  type="text"
                  value={uploadUserWish}
                  onChange={(e) => setUploadUserWish(e.target.value)}
                  className="w-full max-w-2xl px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md text-neutral-900"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div
                  role="group"
                  aria-label="Choose Planning Horizon Duration"
                  className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg"
                >
                  {([3, 6, 12] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setHorizonMonths(m)}
                      aria-pressed={horizonMonths === m}
                      className={`px-3 py-1.5 text-xs font-mono-tabular font-bold rounded-md cursor-pointer transition-colors ${
                        horizonMonths === m
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-700 hover:text-neutral-900'
                      }`}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSaveHorizonPlanToCloud}
                  className="px-3.5 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-md cursor-pointer"
                >
                  Save {horizonMonths}-Month Plan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRoadmap.map((milestone) => {
                const isDone = Boolean(completedMilestones[milestone.monthIndex]);
                return (
                  <div
                    key={milestone.monthIndex}
                    className={`p-4 rounded-lg border ${
                      isDone
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-[#F7F7F5] border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-mono-tabular font-bold text-neutral-900">
                        {milestone.monthLabel}
                      </span>
                      <label className="inline-flex items-center gap-1.5 text-[11px] font-mono-tabular text-neutral-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() =>
                            setCompletedMilestones((prev) => ({
                              ...prev,
                              [milestone.monthIndex]: !prev[milestone.monthIndex],
                            }))
                          }
                          className="rounded border-neutral-300 text-neutral-900"
                        />
                        <span>Done</span>
                      </label>
                    </div>
                    <div className="text-[11px] font-mono-tabular text-neutral-500 mb-2">
                      {milestone.dashaTransitFocus} · {milestone.techniqueApplied}
                    </div>
                    <p className="text-xs text-neutral-800 leading-relaxed mb-2">
                      <strong>Directive:</strong> {milestone.actionDirective}
                    </p>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      <strong>Natural Remedy:</strong> {milestone.naturalRemedyFocus}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        </div>
      </main>

      <footer className="mt-12 border-t border-neutral-200 bg-white py-5 px-6 text-xs text-neutral-500">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>
            Vedic Foundation · Wix Studio, Vercel Edge &amp; GitHub Skills Edition · 3D Interactive Chart, Giri Voice Mentor &amp; Natural Remedy Report
          </span>
          <span className="font-mono-tabular">
            Zero-Trust Firebase Protected · {selectedAyanamsa}
          </span>
        </div>
      </footer>
    </div>
  );
}
