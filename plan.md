# Plano de Extensão - Ações Contextuais do PDF

## Visão Geral
Expandir as ações disponíveis no menu de seleção de texto do PDF, mantendo a simplicidade da implementação atual e preparando para migração futura do backend.

## Ações Contextuais Atuais (Implementadas)
1. **Explicar** - Explicações didáticas do texto selecionado
2. **Exemplos** - Exemplos práticos e situações reais
3. **Quiz Me** - Criação de quiz interativo

## Novas Ações Propostas

### 1. Break It Down (Destrinchar)
**Objetivo**: Análise passo a passo de conceitos complexos
- Quebra o conceito em partes menores
- Explica cada componente individualmente
- Mostra como as partes se conectam
- **Contexto necessário**: Apenas texto selecionado

### 2. Summarize Section (Resumir Seção)
**Objetivo**: Resumos concisos da seção selecionada
- Identifica pontos principais
- Remove informações redundantes
- Mantém conceitos essenciais
- **Contexto necessário**: Texto selecionado + contexto da página atual

### 3. Related Topics (Tópicos Relacionados)
**Objetivo**: Encontrar conexões dentro do documento
- Busca conceitos similares no documento completo
- Identifica pré-requisitos e dependências
- Sugere ordem de estudo
- **Contexto necessário**: DOCUMENTO COMPLETO

## Implementação Técnica

### Fase 1: Estrutura Base (Imediata)
```typescript
// components/pdf-viewer/SelectionMenu.tsx
const menuOptions = [
  { id: 'explain', label: 'Explicar', icon: MessageSquare },
  { id: 'examples', label: 'Exemplos', icon: Lightbulb },
  { id: 'quiz', label: 'Quiz Me', icon: HelpCircle },
  // Novas opções
  { id: 'breakdown', label: 'Destrinchar', icon: Layers },
  { id: 'summarize', label: 'Resumir', icon: FileText },
  { id: 'related', label: 'Tópicos Relacionados', icon: Link }
];
```

### Fase 2: Prompts Específicos
```typescript
// lib/prompts/atena-prompts.ts
selectionMenu: {
  // Existentes...
  
  breakdown: (selectedText: string) => `
    Quero entender este conceito passo a passo:
    "${selectedText}"
    Por favor, quebre em partes menores e explique cada uma.
  `,
  
  summarize: (selectedText: string) => `
    Preciso de um resumo conciso desta seção:
    "${selectedText}"
    Destaque apenas os pontos essenciais.
  `,
  
  related: (selectedText: string, fullDocument: string) => `
    Encontre tópicos relacionados a:
    "${selectedText}"
    
    No documento completo, identifique:
    - Conceitos similares mencionados
    - Pré-requisitos necessários
    - Aplicações posteriores
    - Ordem sugerida de estudo
  `
}
```

### Fase 3: Contexto do Documento

#### Opção A: Contexto Expandido (Recomendada para MVP)
```typescript
// app/page.tsx - CopilotKitProvider
useCopilotReadable({
  description: "Documento PDF completo",
  value: {
    // Contexto atual da página
    currentPageContent: currentPageText,
    
    // Documento completo para ações que precisam
    fullDocumentText: extractedText, // Já disponível!
    
    // Metadados
    documentName: document.name,
    totalPages: totalPages
  }
});
```

#### Opção B: Contexto Dinâmico por Ação
```typescript
// Enviar contexto diferente baseado na ação
const getContextForAction = (action: string) => {
  switch(action) {
    case 'related':
      return { fullDocument: extractedText };
    case 'summarize':
      return { currentPage: currentPageText, context: pageBuffer };
    default:
      return { selectedText: selection };
  }
};
```

## Considerações de UX

### Menu de Seleção
- Máximo 6 opções para não sobrecarregar
- Ícones claros e labels em português
- Ordem por frequência de uso esperada

### Feedback Visual
- Loading state enquanto processa
- Indicador de que está analisando documento completo (para Related Topics)
- Mensagens de erro claras se falhar

## Migração Futura

### Preparação para Backend
```typescript
// services/pdf-actions.service.ts
interface PDFAction {
  id: string;
  execute: (context: PDFContext) => Promise<Response>;
}

// Facilita migração futura para API
const executeAction = async (actionId: string, context: any) => {
  // Hoje: Executa localmente via CopilotKit
  // Futuro: POST /api/pdf-actions/${actionId}
  return await actionHandlers[actionId].execute(context);
};
```

## Cronograma de Implementação

### Sprint 1 (2 horas)
- [ ] Adicionar novas opções no SelectionMenu
- [ ] Criar prompts para Breakdown e Summarize
- [ ] Testar com contexto atual (página)

### Sprint 2 (3 horas)  
- [ ] Implementar Related Topics com documento completo
- [ ] Ajustar contexto do CopilotReadable
- [ ] Otimizar para não enviar documento completo sempre

### Sprint 3 (2 horas)
- [ ] Refinar prompts baseado em testes
- [ ] Adicionar loading states
- [ ] Documentar padrões para futuras ações

## Métricas de Sucesso
- Tempo de resposta < 3 segundos para ações simples
- Tempo de resposta < 5 segundos para Related Topics
- Taxa de uso das novas features > 30%
- Feedback positivo dos usuários

## Notas de Implementação

### Prioridade das Ações
1. **Alta**: Breakdown, Summarize (contexto simples)
2. **Média**: Related Topics (precisa documento completo)
3. **Futura**: Mais ações baseadas em feedback

### Limitações Atuais
- Token limit do GPT-4o (~128k tokens)
- PDFs muito grandes podem precisar chunking
- Sem persistência de análises (sempre recalcula)

### Otimizações Futuras
- Cache de análises por documento
- Pré-processamento ao carregar PDF
- Índice de conteúdo para buscas rápidas
- API dedicada para processamento pesado

## Decisões de Design

### Por que não Semantic Search agora?
- Complexidade adicional desnecessária para MVP
- PDFs acadêmicos geralmente < 100 páginas
- GPT-4o consegue processar documento completo
- Facilita migração quando backend estiver pronto

### Por que manter em português?
- Consistência com a interface
- Melhor experiência para usuário brasileiro
- Prompts otimizados para português
- Labels do menu em português

## Exemplo de Uso

```typescript
// Usuario seleciona "Bubble Sort" e clica em "Tópicos Relacionados"

// Resposta esperada:
"## 🔗 Tópicos Relacionados no Documento

### Conceitos Anteriores (Pré-requisitos)
- **Arrays** (Página 3) - Estrutura base para ordenação
- **Loops** (Página 5) - Necessário para iterações

### Conceitos Similares
- **Selection Sort** (Página 15) - Outro algoritmo O(n²)
- **Insertion Sort** (Página 18) - Complexidade similar

### Aplicações Posteriores  
- **Quick Sort** (Página 22) - Evolução com melhor performance
- **Análise de Complexidade** (Página 25) - Comparações

### Ordem Sugerida de Estudo
1. Revise Arrays e Loops primeiro
2. Estude Bubble Sort (atual)
3. Compare com Selection/Insertion
4. Avance para Quick Sort"
```

## Conclusão
Implementação incremental focada em valor imediato para o usuário, mantendo simplicidade técnica e preparando terreno para evolução futura com backend dedicado.