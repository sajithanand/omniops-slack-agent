import { AgentAnalysisReport } from '../services/aiAgent.js';

export class BlockKitUIBuilder {
  /**
   * Builds an interactive, modern Slack Block Kit UI card for the OmniOps Agent response
   */
  static buildAnalysisReportBlocks(report: AgentAnalysisReport): any[] {
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🤖 OmniOps Agent • Workspace & Infrastructure Intelligence',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Query:* \`${report.userQuery}\``,
          },
          {
            type: 'mrkdwn',
            text: `*Timestamp:* <!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toLocaleTimeString()}>`,
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*✨ Slack AI Synthesis Summary*\n${report.aiSummary}`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*📡 Real-Time Search (RTS) API Hits (${report.rtsResult.totalMatches} found)*`,
        },
      },
    ];

    // Render top message matches
    report.rtsResult.messages.slice(0, 3).forEach((msg) => {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `>*${msg.user}* in *#${msg.channel}*:\n>${msg.text}`,
        },
        accessory: msg.permalink
          ? {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Thread 🔗',
                emoji: true,
              },
              url: msg.permalink,
              action_id: 'view_rts_thread',
            }
          : undefined,
      });
    });

    blocks.push({
      type: 'divider',
    });

    // Render MCP Executions
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🛠️ Model Context Protocol (MCP) Tool Executions (${report.mcpExecutions.length} executed)*`,
      },
    });

    report.mcpExecutions.forEach((mcp) => {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• \`${mcp.toolName}\` [Status: *${mcp.status.toUpperCase()}* • Latency: ${mcp.executionTimeMs}ms]\n\`\`\`${JSON.stringify(mcp.result, null, 2)}\`\`\``,
        },
      });
    });

    blocks.push({
      type: 'divider',
    });

    // Interactive Action Buttons
    blocks.push({
      type: 'actions',
      block_id: 'agent_actions_block',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🔄 Re-run RTS Scan',
            emoji: true,
          },
          style: 'primary',
          value: report.userQuery,
          action_id: 'action_rescan_rts',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '⚡ Execute MCP Health Check',
            emoji: true,
          },
          value: 'ops_query_service_health',
          action_id: 'action_mcp_health',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📋 Export to Slack Canvas',
            emoji: true,
          },
          value: report.userQuery,
          action_id: 'action_export_canvas',
        },
      ],
    });

    return blocks;
  }

  /**
   * Interactive Modal view for slash command `/omniops`
   */
  static buildSlashCommandModal(triggerId: string): any {
    return {
      type: 'modal',
      callback_id: 'omniops_query_modal',
      title: {
        type: 'plain_text',
        text: 'OmniOps Agent',
        emoji: true,
      },
      submit: {
        type: 'plain_text',
        text: 'Run Agent 🚀',
        emoji: true,
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
        emoji: true,
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Query your entire Slack workspace history (via *RTS API*), execute infrastructure actions (via *MCP Server*), and synthesize answers with *Slack AI*.',
          },
        },
        {
          type: 'input',
          block_id: 'query_input_block',
          element: {
            type: 'plain_text_input',
            action_id: 'query_input',
            placeholder: {
              type: 'plain_text',
              text: 'e.g., What caused the high latency incident in #proj-incident-response yesterday?',
            },
            multiline: true,
          },
          label: {
            type: 'plain_text',
            text: 'Enter Query or Incident ID:',
            emoji: true,
          },
        },
      ],
    };
  }
}
