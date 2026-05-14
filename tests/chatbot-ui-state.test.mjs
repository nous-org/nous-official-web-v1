import assert from 'node:assert/strict';
import test from 'node:test';
import {
  chatbotReducer,
  createChatbotMessage,
  initialChatbotState,
} from '../src/components/react/chatbot/chatbotState.ts';
import { extractSseEvents } from '../src/components/react/chatbot/chatbotApi.ts';
import { parseAssistantContent } from '../src/components/react/chatbot/messageFormatting.ts';
import {
  CHATBOT_SESSION_TIMEOUT_MS,
  parseStoredChatbotSession,
} from '../src/components/react/chatbot/chatbotSession.ts';

test('chatbot state opens panel and accepts typed input', () => {
  let state = chatbotReducer(initialChatbotState, { type: 'open' });
  state = chatbotReducer(state, { type: 'set_input', input: 'What does NOUS do?' });

  assert.equal(state.isOpen, true);
  assert.equal(state.input, 'What does NOUS do?');
});

test('chatbot state sends user message and shows streaming assistant state', () => {
  const user = createChatbotMessage('user', 'Hello', 'complete');
  const assistant = createChatbotMessage('assistant', '', 'streaming');

  let state = chatbotReducer(initialChatbotState, { type: 'add_user_message', message: user });
  state = chatbotReducer(state, { type: 'assistant_started', message: assistant });
  state = chatbotReducer(state, { type: 'assistant_delta', id: assistant.id, text: 'Hi' });

  assert.equal(state.messages.length, 2);
  assert.equal(state.isStreaming, true);
  assert.equal(state.messages[1].content, 'Hi');
  assert.equal(state.messages[1].status, 'streaming');
});

test('chatbot state exposes error and reset clears conversation', () => {
  const assistant = createChatbotMessage('assistant', '', 'streaming');

  let state = chatbotReducer(initialChatbotState, { type: 'open' });
  state = chatbotReducer(state, { type: 'assistant_started', message: assistant });
  state = chatbotReducer(state, {
    type: 'assistant_error',
    id: assistant.id,
    message: 'The assistant is unavailable.',
  });

  assert.equal(state.isStreaming, false);
  assert.equal(state.error, 'The assistant is unavailable.');
  assert.equal(state.messages[0].status, 'error');

  state = chatbotReducer(state, { type: 'reset', keepOpen: true });

  assert.equal(state.isOpen, true);
  assert.equal(state.messages.length, 0);
  assert.equal(state.previousResponseId, null);
});

test('chatbot stored session expires after inactivity window', () => {
  const now = 1_000_000_000;
  const storedSession = {
    messages: [
      {
        id: 'message-1',
        role: 'user',
        content: 'What does NOUS do?',
        createdAt: new Date(now).toISOString(),
        status: 'complete',
      },
    ],
    previousResponseId: 'resp_123',
  };

  const fresh = parseStoredChatbotSession(
    JSON.stringify({
      ...storedSession,
      updatedAt: now - CHATBOT_SESSION_TIMEOUT_MS + 1,
    }),
    now,
  );
  const stale = parseStoredChatbotSession(
    JSON.stringify({
      ...storedSession,
      updatedAt: now - CHATBOT_SESSION_TIMEOUT_MS,
    }),
    now,
  );

  assert.equal(fresh?.previousResponseId, 'resp_123');
  assert.equal(fresh?.messages?.length, 1);
  assert.equal(stale, null);
});

test('chatbot SSE parser extracts streaming events across chunks', () => {
  const parsed = extractSseEvents(
    'event: delta\ndata: {"text":"Hel"}\n\n'
      + 'event: response_id\ndata: {"id":"resp_123"}\n\n'
      + 'event: delta\ndata: {"text":"lo"}',
  );

  assert.equal(parsed.events.length, 2);
  assert.equal(parsed.events[0].event, 'delta');
  assert.equal(parsed.events[0].data.text, 'Hel');
  assert.equal(parsed.events[1].event, 'response_id');
  assert.equal(parsed.remainder, 'event: delta\ndata: {"text":"lo"}');
});

test('chatbot message formatter links real routes without linking slash-separated words', () => {
  const tokens = parseAssistantContent(
    'Available context/data: documents. Learn more at [Services](/services) or visit /about#team.',
  );

  assert.deepEqual(tokens, [
    { type: 'text', text: 'Available context/data: documents. Learn more at ' },
    { type: 'link', text: 'Services', href: '/services' },
    { type: 'text', text: ' or visit ' },
    { type: 'link', text: '/about#team', href: '/about#team' },
    { type: 'text', text: '.' },
  ]);
});

test('chatbot message formatter links public email and normalizes contact phone', () => {
  const tokens = parseAssistantContent(
    'Email: hello@nous.cr\nPhone: +506-6186-5634',
  );

  assert.deepEqual(tokens, [
    { type: 'text', text: 'Email: ' },
    { type: 'link', text: 'hello@nous.cr', href: 'mailto:hello@nous.cr' },
    { type: 'text', text: '\nPhone: ' },
    { type: 'link', text: '+506 6186-5634', href: 'https://wa.me/50661865634' },
  ]);
});
