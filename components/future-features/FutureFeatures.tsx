'use client';

import { Mic, Brain, BarChart3, Users, FileText, Sparkles } from 'lucide-react';

interface FutureFeature {
  icon: React.ReactNode;
  label: string;
  description: string;
  status: 'Em Breve' | 'Desenvolvimento' | 'Beta';
}

const futureFeatures: FutureFeature[] = [
  {
    icon: <Mic className="w-5 h-5" />,
    label: 'Interação por Voz',
    description: 'Converse com a Atena usando sua voz',
    status: 'Em Breve',
  },
  {
    icon: <Brain className="w-5 h-5" />,
    label: 'Mapas Mentais',
    description: 'Crie mapas mentais visuais do conteúdo',
    status: 'Em Breve',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    label: 'Analytics de Estudo',
    description: 'Acompanhe seu progresso de aprendizado',
    status: 'Em Breve',
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: 'Grupos de Estudo',
    description: 'Compartilhe e estude com colegas',
    status: 'Desenvolvimento',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: 'Resumos Automáticos',
    description: 'Gere resumos personalizados do conteúdo',
    status: 'Beta',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    label: 'Flashcards Inteligentes',
    description: 'Cartões de estudo gerados por IA',
    status: 'Em Breve',
  },
];

export function FutureFeatures() {
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🚀 Funcionalidades Futuras
        </h3>
        <p className="text-sm text-gray-600">
          Estamos trabalhando em novas ferramentas incríveis para melhorar sua experiência de estudo!
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
                      feature.status === 'Beta'
                        ? 'bg-green-100 text-green-700'
                        : feature.status === 'Desenvolvimento'
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
          💡 <strong>Dica:</strong> Essas funcionalidades estarão disponíveis em breve! 
          Continue usando a Atena e aproveite as ferramentas atuais para potencializar seus estudos.
        </p>
      </div>
    </div>
  );
}