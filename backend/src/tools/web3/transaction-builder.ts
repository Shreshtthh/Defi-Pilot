import { ethers } from 'ethers';
import 'dotenv/config';

// Contract ABIs
const MOCK_USDC_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address) view returns (uint256)',
];

const MOCK_VAULT_ABI = [
  'function deposit(uint256 amount, string protocol, string strategy) returns (uint256)',
  'function withdraw(uint256 positionId)',
  'function getPositions(address user) view returns (tuple(uint256 amount, string protocol, string strategy, uint256 timestamp)[])',
];

// Contract addresses from .env
const MOCK_USDC_ADDRESS = process.env.MOCK_USDC_ADDRESS || '0xC9F312121CFB15885a5b5F138A6584844FB89ff0';
const MOCK_VAULT_ADDRESS = process.env.MOCK_VAULT_ADDRESS || '0xB3eF80edDC7b9AB9318678dc75323DF5cC16a579';

export interface TransactionParams {
  to: string;
  data: string;
  value: string;
  description: string;
}

export interface StrategyAction {
  action: 'deposit' | 'withdraw' | 'approve';
  amount?: string; // In token units (e.g., "100" for 100 USDC)
  protocol?: string;
  strategy?: string;
  positionId?: number;
}

/**
 * Builds transaction parameters for a given strategy action
 */
export function buildTransactionParams(action: StrategyAction): TransactionParams[] {
  console.log('🔧 Building transaction params for:', action);

  const transactions: TransactionParams[] = [];

  try {
    if (action.action === 'deposit') {
      if (!action.amount || !action.protocol || !action.strategy) {
        throw new Error('Missing required fields for deposit: amount, protocol, strategy');
      }

      // 1. Build APPROVE transaction
      const usdcInterface = new ethers.Interface(MOCK_USDC_ABI);
      const amountInWei = ethers.parseUnits(action.amount, 6); // USDC has 6 decimals
      
      const approveData = usdcInterface.encodeFunctionData('approve', [
        MOCK_VAULT_ADDRESS,
        amountInWei,
      ]);

      transactions.push({
        to: MOCK_USDC_ADDRESS,
        data: approveData,
        value: '0',
        description: `Approve ${action.amount} USDC for vault`,
      });

      console.log('✅ Built approve transaction:', {
        to: MOCK_USDC_ADDRESS,
        amount: action.amount,
      });

      // 2. Build DEPOSIT transaction
      const vaultInterface = new ethers.Interface(MOCK_VAULT_ABI);
      
      const depositData = vaultInterface.encodeFunctionData('deposit', [
        amountInWei,
        action.protocol,
        action.strategy,
      ]);

      transactions.push({
        to: MOCK_VAULT_ADDRESS,
        data: depositData,
        value: '0',
        description: `Deposit ${action.amount} USDC to ${action.protocol} (${action.strategy})`,
      });

      console.log('✅ Built deposit transaction:', {
        to: MOCK_VAULT_ADDRESS,
        protocol: action.protocol,
        strategy: action.strategy,
      });

    } else if (action.action === 'withdraw') {
      if (action.positionId === undefined) {
        throw new Error('Missing positionId for withdraw');
      }

      const vaultInterface = new ethers.Interface(MOCK_VAULT_ABI);
      
      const withdrawData = vaultInterface.encodeFunctionData('withdraw', [
        action.positionId,
      ]);

      transactions.push({
        to: MOCK_VAULT_ADDRESS,
        data: withdrawData,
        value: '0',
        description: `Withdraw from position ${action.positionId}`,
      });

      console.log('✅ Built withdraw transaction:', {
        to: MOCK_VAULT_ADDRESS,
        positionId: action.positionId,
      });

    } else {
      throw new Error(`Unsupported action: ${action.action}`);
    }

    console.log(`🎉 Successfully built ${transactions.length} transaction(s)`);
    return transactions;

  } catch (error) {
    console.error('❌ Error building transaction params:', error);
    throw error;
  }
}

/**
 * Validates transaction parameters
 */
export function validateTransactionParams(params: TransactionParams): boolean {
  if (!params.to || !ethers.isAddress(params.to)) {
    console.error('❌ Invalid "to" address:', params.to);
    return false;
  }

  if (!params.data || typeof params.data !== 'string') {
    console.error('❌ Invalid "data" field');
    return false;
  }

  if (params.value === undefined || typeof params.value !== 'string') {
    console.error('❌ Invalid "value" field');
    return false;
  }

  return true;
}
