'use client';

import { Mic, Brain, BarChart3, Users, FileText, Sparkles } from 'lucide-react';
import { AtenaPrompts } from '@/lib/prompts/atena-prompts';

interface FutureFeature {
  icon: React.ReactNode;
  label: string;
  description: string;
  status: string;
}

const { features: f, status: s } = AtenaPrompts.ui.futureFeatures;

const futureFeatures: FutureFeature[] = [
  {
    icon: <Mic className="w-5 h-5" />,
    label: f.voiceInteraction.label,
    description: f.voiceInteraction.description,
    status: s.soon,
  },
  {
    icon: <Brain className="w-5 h-5" />,
    label: f.mindMaps.label,
    description: f.mindMaps.description,
    status: s.soon,
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    label: f.studyAnalytics.label,
    description: f.studyAnalytics.description,
    status: s.soon,
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: f.studyGroups.label,
    description: f.studyGroups.description,
    status: s.development,
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: f.summaries.label,
    description: f.summaries.description,
    status: s.beta,
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    label: f.smartFlashcards.label,
    description: f.smartFlashcards.description,
    status: s.soon,
  },
];

export function FutureFeatures() {
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {AtenaPrompts.ui.futureFeatures.title}
        </h3>
        <p className="text-sm text-gray-600">
          {AtenaPrompts.ui.futureFeatures.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {futureFeatures.map((feature, idx) => (
          <button
            key={idx}
            disabled
            className="p-4 bg-white rounded-lg border border-gray-200 opacity-75 cursor-not-allowed hover:opacity-85 transition-opacity"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg text-gray-400">
                {feature.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-700">
                    {feature.label}
                  </h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      feature.status === s.beta
                        ? 'bg-green-100 text-green-700'
                        : feature.status === s.development
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {feature.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {feature.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          {AtenaPrompts.ui.futureFeatures.tip}
        </p>
      </div>
    </div>
  );
}