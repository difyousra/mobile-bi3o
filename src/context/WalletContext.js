import { createContext, useContext, useMemo, useState } from "react";
import { MOCK_TRANSACTIONS, PROFILE_USER } from "../data/mockProfile";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(1396.24);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);

  const topUp = (amount) => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    setBalance((prev) => prev + value);
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        type: "Top Up",
        label: "Top Up via Credit Card",
        date: "Today",
        amount: value,
      },
      ...prev,
    ]);
  };

  const value = useMemo(
    () => ({
      balance,
      transactions,
      balanceUpdated: PROFILE_USER.balanceUpdated,
      topUp,
    }),
    [balance, transactions]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}
