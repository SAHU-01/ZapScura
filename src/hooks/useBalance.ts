/**
 * Balance fetching hook for ZapScura.
 */

import { useState, useCallback, useEffect } from 'react';
import { useWallet } from './useWallet';
import { getPublicBalance, getTotalDeposited } from '../lib/contracts/vault';
import { getLockedCollateral, getDebtCommitment, hasCDP } from '../lib/contracts/cdp';

interface Balances {
  publicBalance: bigint | null;
  totalDeposited: bigint | null;
  lockedCollateral: bigint | null;
  debtCommitment: bigint | null;
  hasCDP: boolean;
}

export function useBalance() {
  const { account, address } = useWallet();
  const [balances, setBalances] = useState<Balances>({
    publicBalance: null,
    totalDeposited: null,
    lockedCollateral: null,
    debtCommitment: null,
    hasCDP: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!account || !address) return;
    setIsLoading(true);
    try {
      const [pubBal, totalDep, lockedCol, debtCom, cdpExists] = await Promise.all([
        getPublicBalance(account, address).catch(() => BigInt(0)),
        getTotalDeposited(account).catch(() => BigInt(0)),
        getLockedCollateral(account, address).catch(() => BigInt(0)),
        getDebtCommitment(account, address).catch(() => BigInt(0)),
        hasCDP(account, address).catch(() => false),
      ]);
      setBalances({
        publicBalance: pubBal,
        totalDeposited: totalDep,
        lockedCollateral: lockedCol,
        debtCommitment: debtCom,
        hasCDP: cdpExists,
      });
    } catch {
      // keep existing balances
    } finally {
      setIsLoading(false);
    }
  }, [account, address]);

  useEffect(() => {
    if (account && address) {
      refresh();
    }
  }, [account, address, refresh]);

  return { balances, isLoading, refresh };
}
