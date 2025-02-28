import { AbstractBot } from './abstract-bot';
import { AnswerParams, GPTModel } from './types';
import { streamToLineIterator } from './utils';
import * as process from 'process';

const API_END_POINT = process.env.OPENAI_ENDPOINT ?? 'https://api.openai.com';
const COMPLETIONS_URL = `${API_END_POINT}/v1/chat/completions`;

export class OpenAIBot extends AbstractBot {
  constructor(
    private readonly apiKey: string,
    private readonly model: GPTModel = 'gpt-3.5-turbo'
  ) {
    super();
  }

  protected async *doAnswer(params: AnswerParams): AsyncIterable<string> {
    const { conversation, maxTokens, signal } = params;
    console.log(this.model);
    if (conversation.length <= 2) {
      console.log(conversation[conversation.length - 1]);
    } else {
      console.log([conversation[conversation.length - 3], conversation[conversation.length - 2]]);
    }
    const response = await fetch(COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: conversation,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const lines = streamToLineIterator(response.body!);

    for await (const line of lines) {
      if (!line.startsWith('data:')) continue;

      const data = line.slice('data:'.length).trim();

      if (!data || data === '[DONE]') continue;

      const {
        choices: [
          {
            delta: { content },
          },
        ],
      } = JSON.parse(data);
      
      if (!content) continue;
      yield content;
    }
  }
}
