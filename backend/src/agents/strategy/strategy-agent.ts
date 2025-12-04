import { LlmAgent } from '@iqai/adk';
import { transactionBuilderTool } from '../../tools/web3/transaction-builder-tool';

export const strategyAgent = new LlmAgent({
  name: 'strategy_agent',
  model: 'gemini-2.5-flash',
  description: 'Builds transactions immediately',
  instruction: `You build DeFi transactions. NEVER ask questions.

Extract amount and protocol from input. Default to Morpho if protocol not specified.

Input: "deposit 100 usdc to morpho"
→ Call: build_transaction({ action: "deposit", amount: "100", protocol: "Morpho", strategy: "Lending" })
→ Say: "Transaction ready"

Input: "100 usdc"
→ Call: build_transaction({ action: "deposit", amount: "100", protocol: "Morpho", strategy: "Lending" })

ALWAYS call tool. NO questions. Under 20 words.`,
  
  tools: [transactionBuilderTool],
});
