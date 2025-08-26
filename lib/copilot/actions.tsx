'use client';

import { useCopilotAction } from '@copilotkit/react-core';
import { useCopilotChatSuggestions } from '@copilotkit/react-ui';
import { useDocumentStore } from '@/stores/document.store';

export function useCopilotActions() {
  const { setCurrentPage, totalPages, currentPage, currentDocument, extractedText } = useDocumentStore();
  
  // Configure contextual Portuguese suggestions based on current page content
  useCopilotChatSuggestions({
    instructions: `Baseado no conteúdo do ${currentDocument?.name || 'documento'} (página ${currentPage}/${totalPages}), sugira 3 ações de estudo relevantes e específicas:
    
    Contexto do documento atual: ${extractedText?.substring((currentPage - 1) * 1000, currentPage * 1000) || ''}
    
    Gere sugestões como:
    - 📚 Resumir [tópico específico da página]
    - 🎯 Questões sobre [conceito presente na página]  
    - 💭 Explicar [termo técnico encontrado]
    - 🔍 Aprofundar [assunto mencionado]
    - 🧪 Exemplos práticos de [teoria apresentada]
    
    As sugestões devem ser curtas, específicas ao conteúdo atual e em português brasileiro.`,
    minSuggestions: 3,
    maxSuggestions: 3,
  }, [currentPage, currentDocument, extractedText]);
  // Action 1: Explicar conteúdo selecionado
  useCopilotAction({
    name: 'explicar',
    description: 'Explica o conteúdo selecionado do PDF de forma simples e didática',
    parameters: [
      {
        name: 'conteudo',
        type: 'string',
        description: 'O conteúdo do PDF que precisa ser explicado',
        required: true,
      },
    ],
    handler: async ({ conteudo }) => {
      // The actual explanation will be handled by the Agno agent
      return {
        action: 'explicar',
        content: conteudo,
      };
    },
  });

  // Action 2: Gerar exemplos práticos
  useCopilotAction({
    name: 'exemplos',
    description: 'Gera exemplos práticos e situações reais sobre o conteúdo',
    parameters: [
      {
        name: 'topico',
        type: 'string',
        description: 'O tópico para o qual gerar exemplos',
        required: true,
      },
    ],
    handler: async ({ topico }) => {
      return {
        action: 'exemplos',
        topic: topico,
      };
    },
  });

  // Action 3: Quiz Me - Gerar questões de prática com Generative UI
  useCopilotAction({
    name: 'createQuiz',
    description: 'Cria um quiz interativo com questões de múltipla escolha sobre o conteúdo do documento',
    parameters: [
      {
        name: 'topic',
        type: 'string',
        description: 'O tópico do quiz baseado no documento atual',
        required: true,
      },
      {
        name: 'questions',
        type: 'object[]',
        description: 'Array de questões do quiz',
        required: true,
        attributes: [
          {
            name: 'question',
            type: 'string',
            description: 'A pergunta',
            required: true,
          },
          {
            name: 'options',
            type: 'string[]',
            description: 'As opções de resposta',
            required: true,
          },
          {
            name: 'correctAnswer',
            type: 'number',
            description: 'O índice da resposta correta (0-based)',
            required: true,
          },
          {
            name: 'explanation',
            type: 'string',
            description: 'Explicação da resposta correta',
            required: true,
          },
        ],
      },
    ],
    render: ({ status, args }) => {
      if (status === 'inProgress') {
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Gerando quiz...</p>
          </div>
        );
      }
      
      // Lazy load the quiz component
      const QuizComponent = require('@/components/quiz/QuizComponent').QuizComponent;
      return <QuizComponent questions={args.questions} topic={args.topic} />;
    },
  });

  // Action 4: Mostrar funcionalidades futuras
  useCopilotAction({
    name: 'showFutureFeatures',
    description: 'Mostra as funcionalidades que estão em desenvolvimento ou planejadas',
    parameters: [],
    render: () => {
      const FutureFeatures = require('@/components/future-features/FutureFeatures').FutureFeatures;
      return <FutureFeatures />;
    },
  });

  // Action 5: Navigate to specific page
  useCopilotAction({
    name: 'navigateToPage',
    description: 'Navega para uma página específica do PDF',
    parameters: [
      {
        name: 'pageNumber',
        type: 'number',
        description: 'O número da página para navegar (1-indexed)',
        required: true,
      },
    ],
    handler: async ({ pageNumber }) => {
      if (pageNumber < 1 || pageNumber > totalPages) {
        return {
          success: false,
          message: `Página inválida. O documento tem ${totalPages} páginas.`,
        };
      }
      setCurrentPage(pageNumber);
      return {
        success: true,
        message: `Navegando para página ${pageNumber} de ${totalPages}`,
      };
    },
  });

  // Action 6: Go to next page
  useCopilotAction({
    name: 'nextPage',
    description: 'Vai para a próxima página do PDF',
    parameters: [],
    handler: async () => {
      if (currentPage >= totalPages) {
        return {
          success: false,
          message: 'Você já está na última página',
        };
      }
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      return {
        success: true,
        message: `Indo para página ${nextPage} de ${totalPages}`,
      };
    },
  });

  // Action 7: Go to previous page
  useCopilotAction({
    name: 'previousPage',
    description: 'Vai para a página anterior do PDF',
    parameters: [],
    handler: async () => {
      if (currentPage <= 1) {
        return {
          success: false,
          message: 'Você já está na primeira página',
        };
      }
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      return {
        success: true,
        message: `Voltando para página ${prevPage} de ${totalPages}`,
      };
    },
  });
}