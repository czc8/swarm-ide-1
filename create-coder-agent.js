#!/usr/bin/env node

/**
 * Create Coder Agent - Interactive CLI Tool
 * 
 * This tool helps you create and manage coder agents in the swarm-ide system.
 * 
 * Usage:
 *   node create-coder-agent.js [options]
 * 
 * Options:
 *   --workspace-id <id>    Workspace ID (required)
 *   --creator-id <id>      Creator Agent ID (defaults to human agent)
 *   --guidance <text>      Custom guidance for the coder agent
 *   --help                 Show this help message
 */

import fetch from 'node:fetch';

interface CreateAgentOptions {
  workspaceId: string;
  creatorId: string;
  role: string;
  guidance?: string;
}

interface CreateAgentResponse {
  agentId: string;
  groupId: string;
  createdAt: string;
}

const DEFAULT_API_URL = 'http://localhost:3017';

const DEFAULT_CODER_GUIDANCE = `You are a professional coder agent specialized in software development.

Responsibilities:
- Write clean, maintainable, and well-documented code
- Follow best practices and design patterns
- Provide technical solutions and implementations
- Debug and troubleshoot code issues
- Review code for quality and efficiency
- Collaborate with other agents on complex projects

When responding:
- Be concise and focus on practical solutions
- Provide code examples when relevant
- Explain your approach and reasoning
- Ask for clarification when needed`;

async function createCoderAgent(
  options: CreateAgentOptions,
  apiUrl: string = DEFAULT_API_URL
): Promise<CreateAgentResponse> {
  console.log('🚀 Creating coder agent...');
  console.log(`   Workspace: ${options.workspaceId}`);
  console.log(`   Creator: ${options.creatorId}`);
  console.log(`   Role: ${options.role}`);
  
  const response = await fetch(`${apiUrl}/api/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workspaceId: options.workspaceId,
      creatorId: options.creatorId,
      role: options.role,
      guidance: options.guidance,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create agent: ${response.status} ${error}`);
  }

  const result = (await response.json()) as CreateAgentResponse;
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.some((arg) => arg === '--help' || arg === '-h')) {
    console.log(`
Create Coder Agent - Interactive CLI Tool

Usage:
  node create-coder-agent.js [options]

Options:
  --workspace-id <id>    Workspace ID (required)
  --creator-id <id>      Creator Agent ID (optional, defaults to workspace human agent)
  --guidance <text>      Custom guidance for the coder agent (optional)
  --api-url <url>        API URL (default: http://localhost:3017)
  --help, -h             Show this help message

Example:
  node create-coder-agent.js \\
    --workspace-id abc123 \\
    --creator-id def456 \\
    --guidance "You are an expert Python developer"
    `);
    process.exit(0);
  }

  let workspaceId = '';
  let creatorId = '';
  let guidance = DEFAULT_CODER_GUIDANCE;
  let apiUrl = DEFAULT_API_URL;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--workspace-id':
        workspaceId = args[++i] || '';
        break;
      case '--creator-id':
        creatorId = args[++i] || '';
        break;
      case '--guidance':
        guidance = args[++i] || DEFAULT_CODER_GUIDANCE;
        break;
      case '--api-url':
        apiUrl = args[++i] || DEFAULT_API_URL;
        break;
    }
  }

  if (!workspaceId) {
    console.error('❌ Error: --workspace-id is required');
    process.exit(1);
  }

  if (!creatorId) {
    // In a real scenario, we'd fetch the workspace defaults
    creatorId = workspaceId;
    console.log('⚠️  Using workspace ID as creator ID');
  }

  try {
    const result = await createCoderAgent(
      {
        workspaceId,
        creatorId,
        role: 'coder',
        guidance,
      },
      apiUrl
    );

    console.log('\n✅ Coder agent created successfully!');
    console.log(`\n📊 Agent Details:`);
    console.log(`   Agent ID: ${result.agentId}`);
    console.log(`   Group ID: ${result.groupId}`);
    console.log(`   Created At: ${result.createdAt}`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Visit the IM interface at http://localhost:3017/im?workspaceId=${workspaceId}`);
    console.log(`   2. Send a message to the coder agent`);
    console.log(`   3. The agent will start processing tasks`);
  } catch (error) {
    console.error(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`\n❌ Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
