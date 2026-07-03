import { App, ExpressReceiver } from '@slack/bolt';
import dotenv from 'dotenv';
import { OmniOpsAgentEngine } from './services/aiAgent.js';
import { registerMentionHandler } from './handlers/mentionHandler.js';
import { registerCommandHandler } from './handlers/commandHandler.js';
import { registerActionHandler } from './handlers/actionHandler.js';

dotenv.config();

const port = Number(process.env.PORT) || 3000;
const botToken = process.env.SLACK_BOT_TOKEN;
const appToken = process.env.SLACK_APP_TOKEN;
const signingSecret = process.env.SLACK_SIGNING_SECRET || 'fallback_secret';
const userToken = process.env.SLACK_USER_TOKEN;

// Initialize Express receiver for webhooks & health checks
const receiver = new ExpressReceiver({
  signingSecret,
  endpoints: '/slack/events',
});

// Health check route
receiver.app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'OmniOps Slack Agent',
    rtsApiEnabled: !!userToken && userToken !== 'xoxp-your-user-token-with-search-read-scopes',
    mcpConnected: true,
    timestamp: new Date().toISOString(),
  });
});

let app: InstanceType<typeof App>;

if (appToken && appToken.startsWith('xapp-')) {
  console.log('⚡ Initializing Slack App in Socket Mode...');
  app = new App({
    token: botToken,
    appToken: appToken,
    socketMode: true,
  });
} else {
  console.log('⚡ Initializing Slack App with Express Receiver (HTTP Mode)...');
  app = new App({
    token: botToken || 'xoxb-dummy-token',
    receiver,
  });
}

// Instantiate OmniOps AI Agent Engine (RTS + MCP + Slack AI)
const agentEngine = new OmniOpsAgentEngine(userToken, botToken);

// Register Slack event handlers
registerMentionHandler(app, agentEngine);
registerCommandHandler(app, agentEngine);
registerActionHandler(app, agentEngine);

(async () => {
  try {
    if (appToken && appToken.startsWith('xapp-')) {
      await app.start();
      console.log('🚀 OmniOps Slack Agent started in Socket Mode!');
    } else {
      await receiver.start(port);
      console.log(`🚀 OmniOps Slack Agent HTTP Receiver listening on port ${port}!`);
    }
  } catch (error) {
    console.error('❌ Failed to start OmniOps Slack Agent:', error);
  }
})();
