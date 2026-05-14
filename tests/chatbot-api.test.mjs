import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CHATBOT_MAX_MESSAGE_LENGTH,
} from '../src/lib/chatbot/site-context.ts';
import {
  buildOpenAIResponsesRequest,
  resolveChatbotConfig,
  validateChatbotPayload,
} from '../src/lib/chatbot/server.ts';

test('chatbot payload validation rejects empty messages', () => {
  const result = validateChatbotPayload({ message: '' });

  assert.equal(result.success, false);
  assert.match(result.success ? '' : result.message, /shorter message|valid page context/i);
});

test('chatbot payload validation rejects too-long messages', () => {
  const result = validateChatbotPayload({
    message: 'x'.repeat(CHATBOT_MAX_MESSAGE_LENGTH + 1),
  });

  assert.equal(result.success, false);
});

test('chatbot config handles missing OpenAI API key safely', () => {
  const config = resolveChatbotConfig({
    OPENAI_CHATBOT_ENABLED: 'true',
    OPENAI_MODEL: 'gpt-test',
  });

  assert.equal(config.available, false);
  assert.equal(config.reason, 'missing_api_key');
  assert.equal(config.apiKey, undefined);
});

test('chatbot Responses request uses expected server-side structure', () => {
  const parsed = validateChatbotPayload({
    message: 'What does NOUS do?',
    previousResponseId: 'resp_123',
    pageContext: {
      url: '/services?ignored=true',
      title: 'Services | NOUS',
      description: 'Explore NOUS services.',
      headings: ['AI deployment for real organizations.'],
      visibleTextSnippet: 'NOUS helps teams build around artificial intelligence.',
    },
    locale: 'en',
  });

  assert.equal(parsed.success, true);
  if (!parsed.success) return;

  const request = buildOpenAIResponsesRequest(parsed.data, {
    enabled: true,
    available: true,
    apiKey: 'sk-test',
    model: 'gpt-test-model',
    storeResponses: true,
    maxOutputTokens: 700,
  });

  assert.equal(request.model, 'gpt-test-model');
  assert.equal(request.stream, true);
  assert.equal(request.store, true);
  assert.equal(request.previous_response_id, 'resp_123');
  assert.equal(request.max_output_tokens, 700);
  assert.match(String(request.instructions), /official AI Support Agent/i);
  assert.match(String(request.instructions), /Do not invent pricing/i);
  assert.match(String(request.instructions), /Speak in first person\. Say "I can help/i);
  assert.match(String(request.instructions), /Do not answer unrelated trivia/i);
  assert.match(String(request.instructions), /Simple calculations are acceptable only when directly tied/i);
  assert.match(String(request.instructions), /\[Services\]\(\/services\)/);
  assert.match(String(request.input), /Public site context:/);
  assert.match(String(request.input), /What does NOUS do\?/);
  assert.match(String(request.input), /Roberto Pereira Ugalde.*Chief Executive Officer \(CEO\) & Founder/s);
  assert.match(String(request.input), /Portfolio page is under construction/);
  assert.match(String(request.input), /privacy@nous\.cr/);
  assert.match(String(request.input), /No public pricing table/);
  assert.deepEqual(request.metadata, {
    feature: 'nous_website_chatbot',
    locale: 'en',
    page_path: '/services',
  });
});

test('chatbot Responses request falls back to bounded local history when storage is off', () => {
  const parsed = validateChatbotPayload({
    message: 'Can you summarize this page?',
    previousResponseId: 'resp_ignored',
    messages: [
      {
        id: '1',
        role: 'user',
        content: 'Earlier question',
        createdAt: new Date().toISOString(),
        status: 'complete',
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Earlier answer',
        createdAt: new Date().toISOString(),
        status: 'complete',
      },
    ],
    pageContext: {
      url: '/es/services',
    },
  });

  assert.equal(parsed.success, true);
  if (!parsed.success) return;

  const request = buildOpenAIResponsesRequest(parsed.data, {
    enabled: true,
    available: true,
    apiKey: 'sk-test',
    model: 'gpt-test-model',
    storeResponses: false,
    maxOutputTokens: 700,
  });

  assert.equal('previous_response_id' in request, false);
  assert.equal(request.store, false);
  assert.match(String(request.input), /Recent visible conversation:/);
  assert.match(String(request.input), /assistant: Earlier answer/);
  assert.deepEqual(request.metadata, {
    feature: 'nous_website_chatbot',
    locale: 'es',
    page_path: '/es/services',
  });
});
