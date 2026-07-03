import { App } from '@slack/bolt';
import { OmniOpsAgentEngine } from '../services/aiAgent.js';
import { BlockKitUIBuilder } from '../ui/blockKit.js';

export function registerCommandHandler(app: App, agentEngine: OmniOpsAgentEngine) {
  // Handle /omniops slash command
  app.command('/omniops', async ({ ack, command, client }) => {
    await ack();

    try {
      const query = command.text.trim();

      if (!query) {
        // Open interactive Modal if no arguments provided
        await client.views.open({
          trigger_id: command.trigger_id,
          view: BlockKitUIBuilder.buildSlashCommandModal(command.trigger_id),
        });
        return;
      }

      // Execute directly if arguments provided e.g. "/omniops incident v2.1.4"
      const report = await agentEngine.processQuery(query);
      const blocks = BlockKitUIBuilder.buildAnalysisReportBlocks(report);

      await client.chat.postMessage({
        channel: command.channel_id,
        user: command.user_id,
        text: `OmniOps Agent Result for "${query}"`,
        blocks,
      });
    } catch (error) {
      console.error('[Command Handler Error]', error);
    }
  });

  // Handle Modal submission
  app.view('omniops_query_modal', async ({ ack, body, view, client }) => {
    await ack();

    try {
      const query = view.state.values.query_input_block?.query_input?.value || 'workspace status';
      const userId = body.user.id;

      const report = await agentEngine.processQuery(query);
      const blocks = BlockKitUIBuilder.buildAnalysisReportBlocks(report);

      await client.chat.postEphemeral({
        channel: userId,
        user: userId,
        text: `OmniOps Agent Report`,
        blocks,
      });
    } catch (error) {
      console.error('[Modal Submit Error]', error);
    }
  });
}
