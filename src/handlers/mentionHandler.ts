import { App } from '@slack/bolt';
import { OmniOpsAgentEngine } from '../services/aiAgent.js';
import { BlockKitUIBuilder } from '../ui/blockKit.js';

export function registerMentionHandler(app: App, agentEngine: OmniOpsAgentEngine) {
  // Listen for app mentions (e.g. "@OmniOps status of API Gateway")
  app.event('app_mention', async ({ event, say, client }) => {
    try {
      const userText = event.text.replace(/<@[A-Z0-9]+>/g, '').trim() || 'incident status';

      // Send initial typing / processing message
      const loadingMsg = await say({
        text: `🔎 *OmniOps Agent is searching workspace context via RTS API and executing MCP tools...*`,
        thread_ts: event.ts,
      });

      // Process query with Agent Engine
      const report = await agentEngine.processQuery(userText);

      // Render rich Block Kit card
      const blocks = BlockKitUIBuilder.buildAnalysisReportBlocks(report);

      await client.chat.update({
        channel: event.channel,
        ts: loadingMsg.ts || event.ts,
        text: `OmniOps Agent Analysis for "${userText}"`,
        blocks,
      });
    } catch (error) {
      console.error('[Mention Handler Error]', error);
      await say({
        text: `⚠️ Error processing agent request: ${error instanceof Error ? error.message : String(error)}`,
        thread_ts: event.ts,
      });
    }
  });
}
