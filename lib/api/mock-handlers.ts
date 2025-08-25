import { http, HttpResponse, delay } from 'msw';

const aiResponses = [
  "Baseando-me no conteúdo do documento, posso explicar que...",
  "De acordo com o texto apresentado na página, isso se refere a...",
  "Analisando o contexto do PDF, observo que...",
  "O documento menciona especificamente que...",
  "Interessante pergunta! No contexto deste material...",
];

export const handlers = [
  http.post('/api/chat/message', async ({ request }) => {
    const body = await request.json() as any;
    
    // Simulate AI thinking time
    await delay(1000 + Math.random() * 2000);
    
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    const fullResponse = `${randomResponse} ${body.message}. 

Esta é uma resposta simulada para fins de demonstração. Na versão real, o sistema analisará o conteúdo do PDF e fornecerá respostas contextualizadas baseadas no documento selecionado.`;
    
    return HttpResponse.json({
      id: crypto.randomUUID(),
      response: fullResponse,
      sessionId: body.sessionId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      tokens: {
        prompt: Math.floor(Math.random() * 100) + 50,
        completion: Math.floor(Math.random() * 200) + 100,
      },
    });
  }),
  
  http.get('/api/chat/sessions/:sessionId', async ({ params }) => {
    await delay(500);
    
    return HttpResponse.json({
      sessionId: params.sessionId,
      documentId: 'doc-1',
      messages: [],
    });
  }),
];