import React, { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  RefreshCcw,
} from 'lucide-react';

export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  url?: string;
}

export interface EventData {
  id: string;
  name: string;
  type: string;
  timestamp: string;
  source?: string;
  path?: string;
}

interface FeatureUnlockCelebrationProps {
  features: Feature[];
  eventCount?: number;
  onFeaturesUnlocked?: (unlockedFeatures: Feature[]) => void;
  events?: EventData[];
  title?: string;
  description?: string | React.ReactNode;
  completed?: boolean;
  verificationContent?: React.ReactNode;
  handleRefresh?: () => void;
  hideRecentEvents?: boolean;
}

export function FeatureUnlockCelebration({
  features: initialFeatures,
  eventCount,
  onFeaturesUnlocked,
  events,
  title = "Events detected! 🎉",
  description = "Great job! We've detected the events. You've unlocked the following features:",
  completed = false,
  verificationContent,
  handleRefresh,
  hideRecentEvents = false,
}: FeatureUnlockCelebrationProps) {
  const [showFeatures, setShowFeatures] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [visibleEvents, setVisibleEvents] = useState<EventData[]>([]);

  const displayedTitle = completed ? "Features Unlocked! 🎉" : title;

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return timestamp;
    }
  };

  useEffect(() => {
    if (completed) {
      setShowFeatures(true);
      setShowVerification(true);
      if (events) {
        setVisibleEvents(events);
      }
      setTimeout(() => {
        document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else if (events) {
      setVisibleEvents([]);

      setTimeout(() => {
        document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" });
      }, 300);

      events.forEach((event, index) => {
        setTimeout(() => {
          setVisibleEvents((prev) => [...prev, event]);

          if (index === events.length - 1) {
            setTimeout(() => {
              setShowFeatures(true);
              setTimeout(() => {
                setShowVerification(true);
                setTimeout(() => {
                  document.getElementById("verification-section")?.scrollIntoView({ behavior: "smooth" });
                }, 300);
              }, 1500);
            }, 1500);
          }
        }, 500 * (index + 1));
      });
    }

    return () => {
      setShowFeatures(false);
      setShowVerification(false);
    };
  }, [events, completed]);

  useEffect(() => {
    if (completed) {
      setFeatures((prev) => prev.map((f) => ({ ...f, unlocked: true })));
      onFeaturesUnlocked?.(initialFeatures.map((f) => ({ ...f, unlocked: true })));
    } else {
      let allUnlocked = true;
      features.forEach((feature, index) => {
        if (!feature.unlocked) {
          allUnlocked = false;
          setTimeout(() => {
            setFeatures((prev) =>
              prev.map((f, i) => (i === index ? { ...f, unlocked: true } : f))
            );
          }, 1500 * (index + 1));
        }
      });
      if (allUnlocked) {
        onFeaturesUnlocked?.(features);
      }
    }
  }, [completed]);

  useEffect(() => {
    if (features.every((f) => f.unlocked)) {
      onFeaturesUnlocked?.(features);
    }
  }, [features, onFeaturesUnlocked]);

  return (
    <div style={{ animation: 'fade-in 0.5s ease-in-out' }}>
      <div
        style={{
          background: 'linear-gradient(to right, #eef2ff, #dbeafe)',
          borderRadius: '8px',
          border: '1px solid #e0e7ff',
          padding: '24px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#dcfce7', padding: '8px', borderRadius: '50%' }}>
              <CheckCircle2 style={{ width: '20px', height: '20px', color: '#16a34a' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>{displayedTitle}</h3>
          </div>
          {eventCount && (
            <div
              style={{
                backgroundColor: '#e0e7ff',
                padding: '4px 12px',
                borderRadius: '9999px',
                color: '#4338ca',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {eventCount} events received
            </div>
          )}

          {
            handleRefresh != null &&
            <button
              onClick={handleRefresh}
              className={`flex items-center space-x-2 px-6 py-3 rounded-3xl
                                  bg-[#C4DCFD] text-[#3730a3] cursor-pointer font-semibold transition-colors`}>
                                    <RefreshCcw className="w-4 h-4"/>
              <><span> Refresh</span></>
            </button>
          }
        </div>

        <div style={{ color: '#4b5563', marginBottom: '24px' }}>{description}</div>
                    

        {/* Event Data Section (if not completed) */}
        {!hideRecentEvents && (
          <div
            className={`mb-6 transition-all duration-500 ease-out ${ 'opacity-100 transform translate-y-0' }`}
          >
            <div id="events-section" className="bg-white rounded-lg border border-blue-200 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-800">Recent Events</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-2 text-sm font-medium text-gray-600">Event Type</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-600">Event Name</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-600">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleEvents.map((event, index) => (
                      <tr
                        key={`${event.id}-${index}`}
                        style={{
                          opacity: 0,
                          transform: 'translateY(20px)',
                          animation: `fade-in-up 0.5s ease-out ${index * 0.5}s forwards`,
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-900">{event.type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {event.name && event.name !== "" && (
                              <Activity className="w-4 h-4 text-blue-600" />
                            )}
                            <span className="font-medium text-gray-900">
                              {event.name && event.name !== "" ? event.name : "  -  "}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatTime(event.timestamp)}</td>
                      </tr>
                    ))}
                    {visibleEvents.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                          No events detected yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <style>{`
                    @keyframes fade-in-up {
                      from {
                        opacity: 0;
                        transform: translateY(20px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                  `}</style>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {showFeatures && (
          <>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h4 className="font-medium text-indigo-800">Unlocked Features</h4>
            </div>
            <div id="features-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {features.map((feature) => (
                <div
                  key={feature.id}
                  style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${feature.unlocked ? '#bbf7d0' : '#e5e7eb'}`,
                    backgroundColor: feature.unlocked ? '#f0fdf4' : '#f9fafb',
                    opacity: feature.unlocked ? '1' : '0.5',
                    transform: completed ? 'none' : (feature.unlocked ? 'translateY(0)' : 'translateY(8px)'),
                    transition: completed ? 'none' : 'all 0.5s ease-in-out',
                    cursor: feature.url ? 'pointer' : 'default',
                  }}
                  onClick={() => feature.url && window.open(feature.url)}
                >
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '50%',
                      backgroundColor: feature.unlocked ? '#dcfce7' : '#e5e7eb',
                      transition: 'background-color 0.3s ease-in-out',
                    }}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h4
                      style={{
                        fontWeight: '500',
                        color: feature.unlocked ? '#15803d' : '#6b7280',
                        transition: 'color 0.3s ease-in-out',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {feature.name}
                      {feature.url && (
                        <ExternalLink style={{ width: '16px', height: '16px', color: '#15803d' }} />
                      )}
                      {feature.unlocked && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            marginLeft: '8px',
                            fontSize: '12px',
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                          }}
                        >
                          <Sparkles style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                          Unlocked
                        </span>
                      )}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Verification Section: Render only if verificationContent prop is provided */}
      {verificationContent && showVerification && (
        <div
          id="verification-section"
          className={`mt-6 ${completed ? '' : 'transition-all duration-500 ease-out'} ${
            showVerification ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}
          style={{
            backgroundColor: '#ffffff',
            marginTop: '24px',
          }}
        >
          {verificationContent}
        </div>
      )}
    </div>
  );
}
