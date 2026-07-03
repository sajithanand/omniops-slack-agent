import express from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.MCP_SERVER_PORT || 8081;

/**
 * Standard Model Context Protocol (MCP) HTTP Endpoint
 */
app.post('/mcp', (req, res) => {
  const { jsonrpc, method, params, id } = req.body;

  console.log(`[MCP Server] Received JSON-RPC request method: ${method}`);

  if (method === 'tools/list') {
    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'ops_query_service_health',
            description: 'Query Kubernetes cluster health and error rates via Ops MCP',
            inputSchema: {
              type: 'object',
              properties: {
                serviceName: { type: 'string' },
              },
            },
          },
          {
            name: 'github_get_deployment_status',
            description: 'Fetch real-time GitHub commit & release deployment status',
            inputSchema: {
              type: 'object',
              properties: {
                repo: { type: 'string' },
              },
            },
          },
        ],
      },
    });
  }

  if (method === 'tools/call') {
    const { name, arguments: toolArgs } = params;

    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'SUCCESS',
              executedTool: name,
              args: toolArgs,
              timestamp: new Date().toISOString(),
              metrics: {
                cpu: '41.2%',
                memory: '58.4%',
                healthyPods: 12,
                totalPods: 12,
              },
            }),
          },
        ],
      },
    });
  }

  return res.status(400).json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: 'Method not found' },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', server: 'OmniOps MCP Server', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 [MCP Server] Running on http://localhost:${PORT}/mcp`);
});
