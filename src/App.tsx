import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Shield, Eye, Check, Star, X, ChevronDown, BarChart3, Users, Target, MousePointer2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { FeatureUnlockCelebration } from './FeatureUnlockCelebration';

// Animation Demo Data
const validEmail = "alex@acme-corp.com";
const invalidEmail = "scammer@burner.xyz";

type AbuseStep = 'detection' | 'prevention';

function App() {
  const [animationStep, setAnimationStep] = useState(0);
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });
  const [showPointer, setShowPointer] = useState(false);
  const [animationCycleCount, setAnimationCycleCount] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  // Pre-select flagged accounts to demonstrate soft delete workflow
  const [selectedAccounts, setSelectedAccounts] = useState(new Set([2, 4]));

  // Dropdown states for collapsible sections
  const [isWhatItIsOpen, setIsWhatItIsOpen] = useState(true);
  const [isWhatYouWillGetOpen, setIsWhatYouWillGetOpen] = useState(true);
  const [isAbuseManagementOpen, setIsAbuseManagementOpen] = useState(true);

  // Active abuse step (detection or prevention)
  const [activeAbuseStep, setActiveAbuseStep] = useState<AbuseStep>('detection');

  // State for feature unlock celebration
  const [showFeatureUnlock, setShowFeatureUnlock] = useState(false);

  // State for the login animation demo
  const [animationState, setAnimationState] = useState<{
    email: string;
    status: 'idle' | 'typing' | 'showing-result';
    result: 'success' | 'failure' | null;
  }>({
    email: '',
    status: 'idle',
    result: null,
  });

  // Refs for tracking element positions
  const abuseStatusHeaderRef = useRef<HTMLDivElement>(null);
  const firstFlaggedAccountRef = useRef<HTMLDivElement>(null);
  const secondFlaggedAccountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pointer offset constant
  const POINTER_OFFSET = 12;

  const sampleAccounts = [
    { id: 1, name: 'Acme Inc.', deleted: false, abuseStatus: 'Clean', abuseResult: 'Domain Exists', abuseRules: [] },
    { id: 2, name: 'fxzig.com', deleted: false, abuseStatus: 'Flagged', abuseResult: 'Disposable Domain', abuseRules: ['Disposable Domain'] },
    { id: 4, name: 'forexzig.com', deleted: false, abuseStatus: 'Flagged', abuseResult: 'Disposable Domain', abuseRules: ['Disposable Domain'] },
  ];

  // Function to calculate position with scroll handling
  const calculatePosition = (targetRef: React.RefObject<HTMLElement>) => {
    if (!targetRef.current || !containerRef.current) return { x: 0, y: 0 };

    const targetElement = targetRef.current;

    const targetRect = targetElement.getBoundingClientRect();

    // Use viewport coordinates for fixed positioning
    return {
      x: targetRect.left + targetElement.offsetWidth / 2 - POINTER_OFFSET,
      y: targetRect.top + targetElement.offsetHeight / 2 - POINTER_OFFSET,
    };
  };

  // Handle scroll events to update pointer position
  useEffect(() => {
    const handleScroll = () => {
      if (!showPointer || animationStep === 0) return;

      let targetRef: React.RefObject<HTMLElement> | null = null;

      if (animationStep === 1) {
        targetRef = abuseStatusHeaderRef;
      } else if (animationStep === 2) {
        targetRef = firstFlaggedAccountRef;
      } else if (animationStep === 3) {
        targetRef = secondFlaggedAccountRef;
      }

      if (targetRef) {
        const newPosition = calculatePosition(targetRef);
        setPointerPosition(newPosition);
      }
    };

    // Add scroll listeners
    window.addEventListener('scroll', handleScroll);
    const containerElement = containerRef.current;
    if (containerElement) {
      containerElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (containerElement) {
        containerElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [showPointer, animationStep]);

  // Animation sequence for detection demo
  useEffect(() => {
    if (activeAbuseStep !== 'detection') {
      setAnimationCycleCount(0);
      setShouldAnimate(true);
      return;
    }
    
    if (animationCycleCount >= 3) {
      setShouldAnimate(false);
      setShowPointer(false);
      return;
    }

    const animationSequence = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowPointer(true);

      // Point to Abuse Status header
      if (abuseStatusHeaderRef.current && containerRef.current) {
        setAnimationStep(1);
        setPointerPosition(calculatePosition(abuseStatusHeaderRef));
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Point to first flagged account
      if (firstFlaggedAccountRef.current && containerRef.current) {
        setAnimationStep(2);
        setPointerPosition(calculatePosition(firstFlaggedAccountRef));
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Point to second flagged account
      if (secondFlaggedAccountRef.current && containerRef.current) {
        setAnimationStep(3);
        setPointerPosition(calculatePosition(secondFlaggedAccountRef));
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      setShowPointer(false);
      setAnimationStep(0);

      // Increment cycle count
      setAnimationCycleCount(prev => prev + 1);
    };

    const timeoutId = setTimeout(animationSequence, 0);
    return () => clearTimeout(timeoutId);
  }, [activeAbuseStep, animationCycleCount]);


  // Animation for prevention demo
  useEffect(() => {
    if (activeAbuseStep !== 'prevention') {
        setAnimationState({ email: '', status: 'idle', result: null });
        return;
    }

    let timeoutId: number;

    const typeEmail = (email: string, onComplete: () => void) => {
        let i = 0;
        setAnimationState({ email: '', status: 'typing', result: null });
        const intervalId = setInterval(() => {
            if (i < email.length) {
                setAnimationState(prev => ({ ...prev, email: email.slice(0, i + 1) }));
                i++;
            } else {
                clearInterval(intervalId);
                onComplete();
            }
        }, 100);
    };

    const runAnimationCycle = () => {
        // Step 1: Type valid email and show success
        typeEmail(validEmail, () => {
            timeoutId = window.setTimeout(() => {
                setAnimationState(prev => ({ ...prev, status: 'showing-result', result: 'success' }));

                // Step 2: Wait, then type invalid email
                timeoutId = window.setTimeout(() => {
                    typeEmail(invalidEmail, () => {
                        timeoutId = window.setTimeout(() => {
                            setAnimationState(prev => ({ ...prev, status: 'showing-result', result: 'failure' }));

                            // Step 3: Wait, then restart
                            timeoutId = window.setTimeout(runAnimationCycle, 4000);
                        }, 500);
                    });
                }, 4000);
            }, 500);
        });
    };

    timeoutId = window.setTimeout(runAnimationCycle, 1000);

    return () => clearTimeout(timeoutId);
  }, [activeAbuseStep]);


  const toggleSelection = (accountId: number) => {
    const newSelection = new Set(selectedAccounts);
    if (newSelection.has(accountId)) {
      newSelection.delete(accountId);
    } else {
      newSelection.add(accountId);
    }
    setSelectedAccounts(newSelection);
  };

  const clearAll = () => {
    setSelectedAccounts(new Set());
  };

  const getAbuseStatusColor = (status: string) => {
    if (status.includes('Flagged')) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getAbuseStatusIcon = (status: string) => {
    if (status.includes('Flagged')) {
      return <AlertTriangle className="w-4 h-4 text-red-500 inline-block mr-1" />;
    }
    return <Check className="w-4 h-4 text-green-500 inline-block mr-1" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Setup Telemetry</h1>
              <p className="text-gray-600">Follow these to begin tracking product usage and gain insights into how your features deliver value to customers.</p>
            </div>
          </div>
        </div>

        {/* Progress and tabs */}
        <div className="max-w-7xl mx-auto mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2"></div>
              ~10 mins setup
            </div>
            <div className="text-sm text-gray-600">0/6</div>
            <button className="flex items-center text-blue-600 font-medium text-sm">
              MARKETING TEAMS
              <Star className="w-4 h-4 ml-1" />
            </button>
            <button className="flex items-center text-blue-600 font-medium text-sm">
              PRODUCT TEAMS
              <Star className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">BASIC SETUP</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <BarChart3 className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Product URL</span>
                </div>
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-5 h-5 text-gray-400 mr-3 flex items-center justify-center">
                    <code className="text-xs">&lt;/&gt;</code>
                  </div>
                  <span className="text-gray-700">Install ThriveStack</span>
                </div>
                
                {/* Set Users & Accounts with Sub-step */}
                <div className="space-y-2">
                  {/* Parent Step */}
                  <div className="flex items-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-blue-700 font-medium">Set Users & Accounts</span>
                  </div>

                  {/* Sub-step: Abuse Detection */}
                  <div className="ml-6 space-y-2 border-l-2 border-gray-200 pl-4">
                    <div
                      onClick={() => setActiveAbuseStep('detection')}
                      className={`flex items-center p-2 rounded-lg cursor-pointer ${
                        activeAbuseStep === 'detection' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-6 h-6 ${activeAbuseStep === 'detection' ? 'bg-blue-600' : 'bg-gray-400'} rounded-full flex items-center justify-center mr-3`}>
                        <Eye className="w-3 h-3 text-white" />
                      </div>
                      <span className={`text-sm ${activeAbuseStep === 'detection' ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>Abuse Detection</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">ADVANCED SETUP</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Users className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Track Signups</span>
                </div>
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Target className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Track Groups</span>
                </div>

                {/* Abuse Prevention as Main Step */}
                <div
                  onClick={() => setActiveAbuseStep('prevention')}
                  className={`flex items-center p-3 rounded-lg cursor-pointer ${
                    activeAbuseStep === 'prevention' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 ${activeAbuseStep === 'prevention' ? 'bg-blue-600' : 'bg-gray-400'} rounded-full flex items-center justify-center mr-3`}>
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <span className={`${activeAbuseStep === 'prevention' ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>Abuse Prevention</span>
                </div>

                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <BarChart3 className="w-5 h-5 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <span className="text-gray-700">Track Campaign ROI</span>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">Planned</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div ref={containerRef} className="flex-1 p-8 overflow-y-auto max-h-screen">
          <div className="max-w-4xl">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  {activeAbuseStep === 'detection' ? (
                    <Eye className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Shield className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeAbuseStep === 'detection' ? 'Abuse Detection' : 'Abuse Prevention'}
                  </h2>
                  <p className="text-gray-600">
                    {activeAbuseStep === 'detection'
                      ? 'Identify and flag suspicious emails to protect your platform from fake signups and abuse.'
                      : 'Actively block suspicious emails at signup to prevent abuse before it happens.'}
                  </p>
                </div>
              </div>

              {/* What it is? Section */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg mb-8">
                <button onClick={() => setIsWhatItIsOpen(!isWhatItIsOpen)} className="flex items-center justify-between w-full text-left p-4">
                    <div className="flex items-center">
                        <Check className="w-5 h-5 text-amber-600 mr-3" />
                        <span className="font-semibold text-amber-800">What It is?</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-amber-600 transition-transform duration-200 ${isWhatItIsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isWhatItIsOpen && (
                     <div className="p-6 pt-0 text-gray-700">
                        {activeAbuseStep === 'detection' ? (
                          <>
                            <ul className="mt-2 space-y-2 list-disc pl-5">
                                <li>Instantly detects and protects from fake signups based on rules like blocked/malicious domains, personal domains, plus-sign addressing, duplicates, suspicious signups, or multiple accounts from the same IP/browser.</li>
                                <li>View abuse status directly in your Full-Journey CRM, Lead Scoring pages, email notifications, and more.</li>
                            </ul>

                            <div className="mt-4">
                              <div className="flex items-center space-x-2 mb-2">
                                  <Target className="w-5 h-5 text-indigo-600" />
                                  <strong className="text-gray-800">Capabilities</strong>
                              </div>
                              <div className="ml-7">
                                  <ul className="space-y-1 list-disc pl-4">
                                      <li>Instantly identify risky or fake signups</li>
                                      <li>Allows you to change the abuse status of accounts</li>
                                      <li>Soft delete the accounts which don't add value to your analytics</li>
                                  </ul>
                              </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Target className="w-5 h-5 text-indigo-600" />
                                    <strong className="text-gray-800">Why it matters</strong>
                                </div>
                                <div className="ml-7">
                                    <ul className="space-y-1 list-disc pl-4">
                                        <li>47%+ of all self-serve signups are spam/abuse</li>
                                        <li>Each bad lead can waste ~$20K across Sale rep and product COGS annually.</li>
                                    </ul>
                                </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="mt-2">
                              <div className="flex items-center space-x-2 mb-2">
                                  <Target className="w-5 h-5 text-indigo-600" />
                                  <strong className="text-gray-800">What it does:</strong>
                              </div>
                              <div className="ml-7">
                                  <ul className="space-y-1 list-disc pl-4">
                                      <li>Automatically stops account creation from known bad actors or suspicious patterns</li>
                                      <li>Enforces rules like banned domains, device/IP blacklists, and address manipulation tactics</li>
                                      <li>Limits signups per IP/browser/device to prevent farming or bot-based attacks</li>
                                  </ul>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="flex items-center space-x-2 mb-2">
                                  <Target className="w-5 h-5 text-indigo-600" />
                                  <strong className="text-gray-800">When it happens:</strong>
                              </div>
                              <div className="ml-7">
                                  <ul className="space-y-1 list-disc pl-4">
                                      <li>At the point of signup — before the account is created or any onboarding costs are incurred</li>
                                  </ul>
                              </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Target className="w-5 h-5 text-indigo-600" />
                                    <strong className="text-gray-800">Why it matters:</strong>
                                </div>
                                <div className="ml-7">
                                    <ul className="space-y-1 list-disc pl-4">
                                        <li>A single bad lead can cost ~$20K in wasted sales time and product COGS. Blocking abuse upfront protects your funnel, data integrity, and team bandwidth.</li>
                                    </ul>
                                </div>
                            </div>
                          </>
                        )}
                    </div>
                )}
              </div>
            </div>

            <>
            {/* What you will get? Section */}
            <div className="mb-8">
                <div className="border-2 border-blue-300 bg-white rounded-lg overflow-hidden">
                  <button
                    onClick={() => setIsWhatYouWillGetOpen(!isWhatYouWillGetOpen)}
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">What you will get?</h3>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-600 transition-transform duration-200 ${
                          isWhatYouWillGetOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {isWhatYouWillGetOpen && (
                    <div className="px-6 pb-6">
                      {activeAbuseStep === 'detection' && (
                        <div>
                          {/* Default Abuse Detection Section */}
                          <div className="mb-6">
                            <div className="flex items-center mb-4">
                              <Check className="w-6 h-6 text-green-500 mr-3" />
                              <h4 className="text-xl font-semibold text-gray-900">Default - Abuse Detection</h4>
                            </div>
                            <p className="text-gray-600 mb-2">Abuse results are shown in your Accounts page.</p>
                            <p className="text-gray-600 mb-8">
                              The Abuse Status column flags abusive accounts, and the Abuse Rule Results column shows specific rules that flagged each account.
                            </p>
                          </div>

                          {/* Account List Page View */}
                          <div className="bg-gray-50 rounded-lg p-6 border border-blue-100 mb-8">
                            <h5 className="text-lg font-semibold text-blue-900 mb-6">Account List Page</h5>

                            {/* Warning Banner for Flagged Accounts */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center">
                              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                              <span className="text-red-800 font-medium">
                                {selectedAccounts.size} flagged account{selectedAccounts.size > 1 ? 's' : ''} detected
                              </span>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                              {/* Animated Pointer */}
                              {showPointer && (
                                <div
                                  className="fixed z-50 pointer-events-none transition-all duration-1000 ease-in-out"
                                  style={{
                                    left: `${pointerPosition.x}px`,
                                    top: `${pointerPosition.y}px`,
                                  }}
                                >
                                  <div className="relative animate-bounce">
                                    <MousePointer2 className="w-6 h-6 text-blue-600 transform -rotate-12" />
                                    <div className="absolute -top-8 left-6 bg-blue-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                                      {animationStep === 1 && "Check abuse status!"}
                                      {animationStep === 2 && "Flagged account"}
                                      {animationStep === 3 && "Another flagged account"}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Floating Action Bar - Always visible to show flagged accounts selected */}
                              <div className="bg-blue-100 text-blue-900 px-4 py-3 flex items-center justify-between relative">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedAccounts.size > 0}
                                    onChange={() => {}}
                                    className="mr-3 rounded border-blue-300"
                                  />
                                  <span className="font-medium">{selectedAccounts.size} selected</span>
                                  <span className="ml-2 text-blue-600 text-sm">(flagged accounts)</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <button
                                    onClick={clearAll}
                                    className="text-blue-900 hover:text-blue-700 transition-colors flex items-center"
                                  >
                                    Clear All
                                  </button>
                                  <button
                                    className="text-orange-600 transition-colors flex items-center px-3 py-1 rounded"
                                  >
                                    <Shield className="w-4 h-4 mr-1" />
                                    Change Abuse Status
                                  </button>
                                  <button
                                    onClick={clearAll}
                                    className="text-blue-900 hover:text-blue-700 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Table Header */}
                              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <div className="grid grid-cols-12 items-center text-sm font-medium text-gray-700">
                                  <div className="col-span-1 flex items-center">
                                    <input
                                      type="checkbox"
                                      className="rounded border-gray-300"
                                      onChange={() => {}}
                                    />
                                  </div>
                                  <div className="col-span-3 flex items-center">
                                    <span className="mr-2">ACCOUNT NAME</span>
                                  </div>
                                  <div className="col-span-2 flex items-center">
                                    <span className="mr-2">DELETED</span>
                                  </div>
                                  <div
                                    ref={abuseStatusHeaderRef}
                                    className={`col-span-3 flex items-center ${animationStep === 1 ? 'animate-pulse ring-2 ring-blue-400 rounded' : ''}`}
                                  >
                                    <span className="mr-2 font-bold">ABUSE STATUS</span>
                                  </div>
                                  <div className="col-span-3 flex items-center">
                                    <span className="mr-2">ABUSE RULE RESULTS</span>
                                  </div>
                                </div>
                              </div>

                              {/* Table Body */}
                              <div className="divide-y divide-gray-200">
                                {sampleAccounts.map((account, index) => (
                                  <div
                                    key={account.id}
                                    className={`px-4 py-4 hover:bg-gray-50 transition-colors ${
                                      account.deleted ? 'opacity-60' : ''
                                    } ${selectedAccounts.has(account.id) ? 'bg-blue-50' : ''}`}
                                  >
                                    <div className="grid grid-cols-12 items-center">
                                      <div className="col-span-1">
                                        <input
                                          type="checkbox"
                                          checked={selectedAccounts.has(account.id)}
                                          onChange={() => toggleSelection(account.id)}
                                          className="rounded border-gray-300"
                                        />
                                      </div>
                                      <div className="col-span-3">
                                        <div className="flex items-center">
                                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                            <span className="text-blue-600 font-semibold text-sm">
                                              {account.name.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                          <span className={`font-medium ${account.deleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                            {account.name}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <span
                                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                            account.deleted
                                              ? 'bg-red-50 text-red-800 border-red-200'
                                              : 'bg-gray-50 text-gray-800 border-gray-200'
                                          }`}
                                        >
                                          {account.deleted ? 'TRUE' : 'FALSE'}
                                        </span>
                                      </div>
                                      <div
                                        ref={index === 1 ? firstFlaggedAccountRef : index === 2 ? secondFlaggedAccountRef : null}
                                        className={`col-span-3 ${(animationStep === 2 && index === 1) || (animationStep === 3 && index === 2) ? 'animate-pulse' : ''}`}
                                      >
                                        {account.abuseStatus === 'Flagged' ? (
                                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border-2 border-red-300 cursor-help ${shouldAnimate ? 'animate-pulse-glow' : ''}`}>
                                            <AlertTriangle className={`w-4 h-4 ${shouldAnimate ? 'animate-bounce-subtle' : ''}`} />
                                            FLAGGED ({account.abuseRules.length} {account.abuseRules.length === 1 ? 'rule' : 'rules'})
                                          </span>
                                        ) : (
                                          <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getAbuseStatusColor(
                                              account.abuseStatus
                                            )}`}
                                          >
                                            {getAbuseStatusIcon(account.abuseStatus)}
                                            {account.abuseStatus}
                                          </span>
                                        )}
                                      </div>
                                      <div className="col-span-3">
                                        <span
                                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                            account.abuseStatus.includes('Flagged')
                                              ? 'bg-red-50 text-red-700 border-red-200'
                                              : 'bg-green-50 text-green-700 border-green-200'
                                          }`}
                                        >
                                          {account.abuseResult}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeAbuseStep === 'prevention' && (
                        <div>
                          <div className="flex items-center space-x-2 mb-4">
                            <Check className="w-5 h-5 text-green-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Abuse Prevention - Premium feature</h3>
                          </div>

                          <p className="text-gray-600 mb-2">
                            <span className="font-medium">Seamless for genuine users</span> — Customers with a valid work email can sign up or log in smoothly.
                          </p>

                          <p className="text-gray-600 mb-8">
                            <span className="font-medium">Block fake signups</span> — If someone tries with a fake or abusive email, they'll be blocked
                          </p>
                          {/* Animation Demo Box */}
                          <div className="bg-gray-50 rounded-lg p-6">
                            <div className="max-w-md mx-auto">
                              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center">Login Demo</h4>

                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-600 mb-2">
                                    User enters:
                                  </label>
                                  <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 font-mono text-sm min-h-[24px]">
                                    {animationState.email}
                                    {animationState.status === 'typing' && (
                                      <span className="animate-pulse">|</span>
                                    )}
                                  </div>
                                </div>
                                {animationState.status === 'showing-result' && animationState.result && (
                                  <div className="mt-4">
                                    <div className="flex items-center justify-center mb-3">
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                        animationState.result === 'success'
                                          ? 'bg-green-100'
                                          : 'bg-red-100'
                                      }`}>
                                        {animationState.result === 'success' ? (
                                          <Check className="w-6 h-6 text-green-600" />
                                        ) : (
                                          <X className="w-6 h-6 text-red-600" />
                                        )}
                                      </div>
                                    </div>

                                    <div className={`text-center p-4 rounded-lg ${
                                      animationState.result === 'success'
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-red-50 border border-red-200'
                                    }`}>
                                      {animationState.result === 'success' ? (
                                        <>
                                          <div className="font-medium text-green-800 mb-1">Login Successful</div>
                                          <div className="text-sm text-green-600">Access granted to dashboard</div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="font-medium text-red-800 mb-1">Access Blocked</div>
                                          <div className="text-sm text-red-600">"Log in with a work email"</div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="mt-8 flex justify-end">
                          <button
                              onClick={() => {
                                  setIsWhatYouWillGetOpen(false);
                                  setIsAbuseManagementOpen(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg flex items-center transition-all duration-200"
                          >
                              Continue
                              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                          </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Choose your Abuse Management Method */}
            <div className="mb-8">
                <div className="border-2 border-blue-300 bg-white rounded-lg overflow-hidden">
                  <button
                    onClick={() => setIsAbuseManagementOpen(!isAbuseManagementOpen)}
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {activeAbuseStep === 'detection' ? 'Enable Abuse Detection' : 'Enable Abuse Prevention'}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {activeAbuseStep === 'detection'
                            ? 'Identify and flag suspicious emails for review'
                            : 'Actively block suspicious emails at signup'}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-600 transition-transform duration-200 ${
                          isAbuseManagementOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {isAbuseManagementOpen && (
                    <div className="px-6 pb-6">
                      {activeAbuseStep === 'detection' ? (
                        // <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            This protection is enabled by default — no additional setup required.
                          </p>
                        // </div>
                      ) : (
                        <div className="mt-4">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Script Integration</h4>
                          <div className="bg-gray-900 rounded-lg p-4 max-w-full overflow-hidden">
                            <div className="flex flex-col gap-2 mb-4">
                              <div className="text-sm text-gray-200 font-bold tracking-wide">Abuse Prevention Script</div>
                              <div className="text-sm text-gray-400 italic border-l-2 border-gray-700 pl-3 pr-12 leading-relaxed">
                              Add the following script right after the email input field and just before the “Sign Up” button in your signup page.
                              </div>
                            </div>
                            <div className="bg-gray-800 rounded p-3 font-mono text-sm text-gray-300 overflow-x-auto">
                              <pre className="whitespace-pre-wrap">
{`// Abuse Prevention Script
<script>
// Add abuse prevention logic here
function validateSignup(userData) {
    // Check for suspicious patterns
    // Block if criteria are met
}
</script>`}
                              </pre>
                            </div>
                          </div>

                          {/* Example Usage */}
                          <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-gray-300">
                            <h5 className="text-sm text-gray-200 font-bold tracking-wide">Example: How to use the script</h5>
                            <div className="bg-gray-800 rounded p-3 font-mono text-sm text-gray-300 overflow-x-auto">
                              <pre className="whitespace-pre-wrap">
{`<input type="email" id="email" name="email" />
<!-- Paste the script here -->
<button type="submit">Sign Up</button>`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="mt-8 flex justify-end">
                        <button
                          onClick={() => {
                            setIsAbuseManagementOpen(false);
                            setShowFeatureUnlock(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg flex items-center transition-all duration-200"
                        >
                          Continue
                          <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </button>
                      </div>
                  </div>
                  )}
                </div>
              </div>
            </>

            {/* Feature Unlock Celebration */}
            {showFeatureUnlock && (
              <div className="mb-8">
                <FeatureUnlockCelebration
                  features={[
                    {
                      id: 'account-list',
                      name: 'Accounts List',
                      description: 'View and manage all your accounts with abuse detection status',
                      icon: <Users className="w-5 h-5 text-green-600" />,
                      unlocked: true,
                    },
                    {
                      id: 'user-list',
                      name: 'User List',
                      description: 'Access detailed user information and abuse prevention insights',
                      icon: <Users className="w-5 h-5 text-green-600" />,
                      unlocked: true,
                    },
                  ]}
                  title="Great job! We've detected the events. You've unlocked the following features:"
                  description={activeAbuseStep === 'prevention' ? (
                    <div>
                      <p className="mb-2">You have unlocked a premium feature.</p>
                      <p>Great job! We've detected the events. You've unlocked the following features:</p>
                    </div>
                  ) : (
                    "Great job! We've detected the events. You've unlocked the following features:"
                  )}
                  completed={true}
                  hideRecentEvents={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 right-0 left-80 bg-white border-t border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between max-w-4xl">
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Skip setup, try demo mode →
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center">
            Next Step
            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
