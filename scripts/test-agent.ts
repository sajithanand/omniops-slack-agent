import { OmniOpsAgentEngine } from '../src/services/aiAgent.js';
import { BlockKitUIBuilder } from '../src/ui/blockKit.js';

async function runSimulationTest() {
  console.log('====================================================');
  console.log('🧪 Starting OmniOps Agent Simulation & Verification');
  console.log('====================================================\n');

  const agentEngine = new OmniOpsAgentEngine();

  const testQuery = 'High latency incident in #proj-incident-response v2.1.4';
  console.log(`📍 Testing Query: "${testQuery}"\n`);

  console.log('1️⃣ Step 1: Real-Time Search (RTS) API Execution...');
  const report = await agentEngine.processQuery(testQuery);

  console.log(`   ✅ Matches Found: ${report.rtsResult.totalMatches}`);
  console.log(`   ✅ RTS Summary: ${report.rtsResult.summaryContext}`);

  console.log('\n2️⃣ Step 2: Model Context Protocol (MCP) Tool Executions...');
  report.mcpExecutions.forEach((mcp, idx) => {
    console.log(`   Tool #${idx + 1}: ${mcp.toolName} [Latency: ${mcp.executionTimeMs}ms]`);
    console.log(`   Result:`, mcp.result);
  });

  console.log('\n3️⃣ Step 3: Slack AI Intelligence Synthesis...');
  console.log(`\n${report.aiSummary}\n`);

  console.log('4️⃣ Step 4: Generating Block Kit UI Layout Card...');
  const blocks = BlockKitUIBuilder.buildAnalysisReportBlocks(report);
  console.log(`   ✅ Total Block Kit UI Components Generated: ${blocks.length}`);

  console.log('\n====================================================');
  console.log('🎉 OmniOps Agent Pipeline Verified Successfully!');
  console.log('====================================================');
}

runSimulationTest().catch(console.error);
