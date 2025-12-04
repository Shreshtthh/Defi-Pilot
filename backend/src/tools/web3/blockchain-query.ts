import { createTool } from '@iqai/adk';
import axios from 'axios';
import { z } from 'zod';

export const blockchainQueryTool = createTool({
  name: 'query_blockchain',
  description: 'Query blockchain data including balances, transactions, and token transfers via Etherscan API',
  schema: z.object({
    address: z.string().optional().describe('Wallet address to query'),
    action: z.enum(['balance', 'txlist', 'tokentx']).describe('Type of data to retrieve')
  }),
  fn: async (params: { 
    address?: string; 
    action: 'balance' | 'txlist' | 'tokentx';
  }) => {
    try {
      const apiKey = process.env.ETHERSCAN_API_KEY;
      const baseUrl = 'https://api-sepolia.basescan.org/api';
      
      const response = await axios.get(baseUrl, {
        params: {
          module: 'account',
          action: params.action,
          address: params.address,
          apikey: apiKey,
        }
      });

      return JSON.stringify({
        success: true,
        data: response.data.result,
        source: 'Etherscan API'
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});
