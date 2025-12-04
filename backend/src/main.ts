import 'dotenv/config';

// PRODUCTION CHECK - Don't run tests in production
if (process.env.NODE_ENV === 'production') {
  console.log('🚫 main.ts skipped in production mode');
  console.log('✅ Use server.ts for production API');
  process.exit(0);
}

// Only import and run if in development
import { AgentBuilder } from '@iqai/adk';
import { coordinatorAgent } from './agents/coordinator/coordinator-agent';

async function main() {
  console.log('🚀 DefiPilot - Development Test Mode');
  console.log('==========================================\n');

  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY not set');
  }

  console.log('✅ Running development tests...\n');

  const { runner } = await AgentBuilder
    .create('DefiPilot')
    .withAgent(coordinatorAgent)
    .build();

  const queries = [
    "What are the top 3 DeFi lending protocols on Base?",
  ];

  for (const query of queries) {
    console.log(`\n📝 QUERY: ${query}\n`);
    try {
      const response = await runner.ask(query);
      console.log('🤖 RESPONSE:\n', response, '\n');
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }

  console.log('✅ Tests completed!\n');
}

main().catch(console.error);
