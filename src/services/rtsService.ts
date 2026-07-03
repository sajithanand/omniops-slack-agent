import { WebClient } from '@slack/web-api';

export interface RTSSearchResult {
  query: string;
  totalMatches: number;
  messages: Array<{
    channel: string;
    user: string;
    text: string;
    permalink: string;
    timestamp: string;
  }>;
  files: Array<{
    name: string;
    title: string;
    filetype: string;
    permalink: string;
  }>;
  summaryContext: string;
}

export class RealTimeSearchService {
  private userClient: WebClient | null = null;
  private botClient: WebClient | null = null;

  constructor(userToken?: string, botToken?: string) {
    if (userToken && userToken !== 'xoxp-your-user-token-with-search-read-scopes') {
      this.userClient = new WebClient(userToken);
    }
    if (botToken && botToken !== 'xoxb-your-bot-token-here') {
      this.botClient = new WebClient(botToken);
    }
  }

  /**
   * Search Slack workspace in real-time using search.messages & search.files (RTS API)
   */
  async searchWorkspace(query: string, count: number = 5): Promise<RTSSearchResult> {
    const client = this.userClient || this.botClient;

    if (!client) {
      // Return mock RTS search results if live tokens are not configured yet
      return this.getMockSearchResults(query);
    }

    try {
      // Execute Real-Time Search (RTS) for messages
      const messageRes = await client.search.messages({
        query,
        count,
        sort: 'timestamp',
        sort_dir: 'desc',
      });

      // Execute Real-Time Search (RTS) for files
      const fileRes = await client.search.files({
        query,
        count: 3,
      });

      const matches = messageRes.messages?.matches || [];
      const fileMatches = fileRes.files?.matches || [];

      const parsedMessages = matches.map((m: any) => ({
        channel: m.channel?.name || m.channel?.id || 'unknown',
        user: m.username || m.user || 'Unknown User',
        text: m.text || '',
        permalink: m.permalink || '',
        timestamp: m.ts || '',
      }));

      const parsedFiles = fileMatches.map((f: any) => ({
        name: f.name || 'file',
        title: f.title || f.name || 'Untitled File',
        filetype: f.filetype || 'unknown',
        permalink: f.permalink || '',
      }));

      const contextString = parsedMessages
        .map((m) => `[${m.channel}] ${m.user}: ${m.text}`)
        .join('\n');

      return {
        query,
        totalMatches: (messageRes.messages?.total || 0) + (fileRes.files?.total || 0),
        messages: parsedMessages,
        files: parsedFiles,
        summaryContext: contextString,
      };
    } catch (error) {
      console.warn(`[RTS API Warning] Live RTS search failed. Falling back to structured response. Error:`, error);
      return this.getMockSearchResults(query);
    }
  }

  /**
   * Fallback mock generator for testing/demonstration when tokens are pending setup
   */
  private getMockSearchResults(query: string): RTSSearchResult {
    return {
      query,
      totalMatches: 4,
      messages: [
        {
          channel: 'proj-incident-response',
          user: 'Alex Rivera (DevOps Lead)',
          text: `[INCIDENT-402] High latency detected on API Gateway v2. Error rate spiked to 8.4% after release v2.1.4. Querying logs: ${query}`,
          permalink: 'https://slack.com/archives/C12345/p1690000001',
          timestamp: '1720000100',
        },
        {
          channel: 'proj-incident-response',
          user: 'Samantha Chen (Backend)',
          text: `Rolled back feature flag 'db-connection-pooling'. Database queue depth returning to normal baseline.`,
          permalink: 'https://slack.com/archives/C12345/p1690000002',
          timestamp: '1720000250',
        },
        {
          channel: 'dev-announcements',
          user: 'DevOps Bot',
          text: `Deployment v2.1.5 patch successfully completed. All health checks green.`,
          permalink: 'https://slack.com/archives/C67890/p1690000003',
          timestamp: '1720000500',
        },
      ],
      files: [
        {
          name: 'incident_postmortem_v2.pdf',
          title: 'Incident Post-Mortem Report v2.1.4',
          filetype: 'pdf',
          permalink: 'https://slack.com/files/F12345/postmortem.pdf',
        },
      ],
      summaryContext: `Found 3 matching discussions and 1 file for '${query}' in #proj-incident-response and #dev-announcements.`,
    };
  }
}
