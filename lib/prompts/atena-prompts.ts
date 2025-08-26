/**
 * Centralized prompts for the Atena AI tutor
 * This file contains all the prompts used throughout the application
 */

export const AtenaPrompts = {
  // Main system context provided to the AI
  systemContext: {
    getInstructions: (document: { name: string; currentPage: number; totalPages: number } | null) => {
      if (!document) {
        return "Aguardando seleção de documento para iniciar o estudo.";
      }

      return `Você é a Atena, tutora educacional inteligente da Cruzeiro do Sul.
       Contexto atual:
       - Documento: ${document.name}
       - Página: ${document.currentPage} de ${document.totalPages}
       - Conteúdo disponível para análise
       
       Diretrizes:
       - Responda sempre em português brasileiro
       - Seja didática e clara nas explicações
       - Use o conteúdo do documento como base para suas respostas
       - Crie exemplos práticos quando apropriado
       - Ofereça questões para testar o conhecimento quando solicitado`;
    }
  },

  // Document context description
  documentContext: {
    description: "Documento PDF atual sendo estudado pelo aluno",
    getDocumentData: (document: any, extractedText: string, currentPage: number, totalPages: number) => {
      // Extract content for current page (approximately 3000 chars per page)
      const pageStart = (currentPage - 1) * 3000;
      const pageEnd = currentPage * 3000;
      const currentPageContent = extractedText 
        ? extractedText.substring(pageStart, pageEnd)
        : 'Carregando conteúdo...';
      
      return {
        documentName: document.name,
        currentPage: currentPage,
        totalPages: totalPages,
        currentPageContent: currentPageContent,
        // Include some context from previous and next pages
        contextWindow: extractedText 
          ? extractedText.substring(Math.max(0, pageStart - 500), Math.min(extractedText.length, pageEnd + 500))
          : '',
        documentType: 'Teórico'
      };
    }
  },

  // Chat sidebar labels
  chatSidebar: {
    title: "Atena - Tutora de Estudos",
    initial: "Olá! Sou a Atena, sua tutora de estudos da Cruzeiro do Sul. Estou aqui para ajudar você a compreender melhor o conteúdo teórico. Como posso te ajudar hoje?"
  },

  // Text selection menu prompts
  selectionMenu: {
    explain: (selectedText: string) => 
      `Por favor, explique o seguinte conceito de forma clara e didática: "${selectedText}"`,
    
    examples: (selectedText: string) => 
      `Por favor, forneça exemplos práticos e situações reais sobre: "${selectedText}"`,
    
    quiz: (selectedText: string) => 
      `Crie um quiz interativo com questões de múltipla escolha sobre: "${selectedText}"`
  },

  // Suggestions prompts (for auto-suggestions feature)
  suggestions: {
    // Generate contextual suggestions based on PDF content
    getContextualInstructions: () => `ANALISE O CONTEXTO FORNECIDO e gere 4 sugestões.
       
       SE currentPageContent EXISTE no contexto:
       Gere sugestões ESPECÍFICAS baseadas no conteúdo real:
       📚 Resumir [tópico do texto]
       🎯 Questões sobre [conceito visível]
       💭 Explicar [termo presente]
       🔍 Analisar [assunto da página]
       
       SE currentPageContent NÃO existe ou está vazio:
       Return null (o chat não deve estar disponível)
       
       REGRAS CRÍTICAS:
       - Use SOMENTE o que está em currentPageContent
       - Máximo 5 palavras por sugestão
       - Português brasileiro
       - Mencione elementos REAIS do texto, não invente`,
    
    // Legacy contextual suggestions (for backward compatibility)
    contextual: (documentName: string, currentPage: number) => [
      `Explique os conceitos principais da página ${currentPage}`,
      `Quais são os pontos mais importantes deste capítulo?`,
      `Me ajude a entender melhor este tópico`,
      `Crie questões de revisão sobre o conteúdo atual`,
      `Faça um resumo dos conceitos apresentados`
    ],
    
    general: [
      "Como posso estudar de forma mais eficiente?",
      "Me ajude a criar um plano de estudos",
      "Quais técnicas de memorização você recomenda?",
      "Como posso me preparar melhor para as provas?",
      "Explique a diferença entre os conceitos principais"
    ]
  },

  // Action prompts for specific learning activities
  actions: {
    summarize: {
      name: "Resumir Conteúdo",
      description: "Cria um resumo do conteúdo atual",
      prompt: (content: string) => 
        `Crie um resumo claro e conciso do seguinte conteúdo, destacando os pontos principais: ${content}`
    },
    
    createFlashcards: {
      name: "Criar Flashcards",
      description: "Gera flashcards para memorização",
      prompt: (content: string) => 
        `Crie flashcards de estudo baseados no seguinte conteúdo. Formate como perguntas e respostas: ${content}`
    },
    
    generateQuestions: {
      name: "Gerar Questões",
      description: "Cria questões de prática",
      prompt: (content: string) => 
        `Gere 5 questões de múltipla escolha baseadas no seguinte conteúdo, com 4 alternativas cada e indique a resposta correta: ${content}`
    },
    
    explainDifficult: {
      name: "Explicar Conceitos Difíceis",
      description: "Explica conceitos complexos de forma simples",
      prompt: (content: string) => 
        `Identifique os conceitos mais difíceis no seguinte conteúdo e explique-os de forma simples e com analogias: ${content}`
    }
  },

  // Error messages and fallbacks
  errors: {
    noDocument: "Por favor, selecione um documento para começar a estudar.",
    loadingDocument: "Carregando documento... Por favor, aguarde.",
    noSelection: "Por favor, selecione um texto no PDF para interagir.",
    apiError: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente."
  },

  // Encouragement and motivational messages
  motivation: {
    greeting: [
      "Vamos estudar juntos! 📚",
      "Pronto para aprender algo novo hoje? 🎯",
      "Que bom ter você aqui! Vamos começar? 🚀",
      "Olá! Como posso tornar seu estudo mais produtivo hoje? 💡"
    ],
    
    positive: [
      "Excelente pergunta! 👏",
      "Você está no caminho certo! 🌟",
      "Ótimo progresso! Continue assim! 💪",
      "Muito bem! Vejo que está compreendendo o conteúdo! ✨"
    ],
    
    encouragement: [
      "Não desista! Vamos tentar de outra forma.",
      "É normal ter dúvidas. Vamos esclarecer juntos!",
      "Cada pergunta é um passo em direção ao conhecimento!",
      "Lembre-se: aprender é um processo. Você está indo muito bem!"
    ]
  }
};

// Helper function to get contextual suggestions based on the current state
export function getContextualSuggestions(
  documentName: string | null,
  currentPage: number,
  hasSelection: boolean
): string[] {
  if (!documentName) {
    return AtenaPrompts.suggestions.general;
  }

  const suggestions = [
    ...AtenaPrompts.suggestions.contextual(documentName, currentPage),
  ];

  if (hasSelection) {
    suggestions.unshift("Explique o texto selecionado");
    suggestions.unshift("Dê exemplos sobre o texto selecionado");
  }

  return suggestions.slice(0, 5); // Return top 5 suggestions
}

// Export type for prompt categories
export type PromptCategory = keyof typeof AtenaPrompts;