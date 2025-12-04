import { createTool } from '@iqai/adk';
import axios from 'axios';
import { z } from 'zod';

export const defiDataTool = createTool({
  name: 'query_defi_protocol',
  description: 'Query DeFi protocol data including TVL, yields, and pool information from DeFiLlama',
  schema: z.object({
    protocol: z.string().optional().describe('Specific protocol name to query'),
    chain: z.string().optional().describe('Blockchain network (e.g., "base", "ethereum")'),
    action: z.enum(['tvl', 'yields', 'pools']).describe('Type of data to retrieve')
  }),
  fn: async (params) => {
    try {
      let url = 'https://api.llama.fi';
      
      switch (params.action) {
        case 'tvl':
          url += params.protocol 
            ? `/protocol/${params.protocol}` 
            : '/protocols';
          break;
        case 'yields':
          // Use the correct yields endpoint
          url = 'https://yields.llama.fi/pools';
          break;
        case 'pools':
          url = 'https://yields.llama.fi/pools';
          break;
      }

      const response = await axios.get(url, { timeout: 10000 });
      
      let data = response.data;
      
      // Filter yields data if chain specified
      if (params.action === 'yields' && params.chain) {
        if (data.data && Array.isArray(data.data)) {
          data.data = data.data.filter((item: any) => 
            item.chain?.toLowerCase() === params.chain?.toLowerCase()
          );
          // Sort by TVL and take top 10
          data.data = data.data
            .sort((a: any, b: any) => (b.tvlUsd || 0) - (a.tvlUsd || 0))
            .slice(0, 10);
        }
      }
      
      // Filter protocols by chain if specified
      if (params.action === 'tvl' && params.chain && Array.isArray(data)) {
        data = data.filter((item: any) => 
          item.chain?.toLowerCase() === params.chain?.toLowerCase() ||
          (item.chains && item.chains.includes(params.chain))
        );
        data = data.slice(0, 10);
      }

      return JSON.stringify({
        success: true,
        data: data.data || data,
        source: 'DeFiLlama API',
        chain: params.chain,
        action: params.action
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'DeFiLlama API may be temporarily unavailable'
      });
    }
  }
});
