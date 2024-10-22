import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

function SubAccountManager({ contract, account }) {
  const [subAccounts, setSubAccounts] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedSubAccount, setSelectedSubAccount] = useState(null);

  useEffect(() => {
    if (contract && account) {
      loadSubAccounts();
    }
  }, [contract, account]);

  const loadSubAccounts = async () => {
    try {
      const subAccountCount = await contract.subAccountCount(account);
      const accounts = [];
      for (let i = 0; i < subAccountCount; i++) {
        const balance = await contract.getSubAccountBalance(account, i);
        accounts.push({ id: i, balance: ethers.utils.formatEther(balance) });
      }
      setSubAccounts(accounts);
    } catch (error) {
      console.error("Error loading sub-accounts:", error);
    }
  };

  const createSubAccount = async () => {
    try {
      const tx = await contract.createSubAccount();
      await tx.wait();
      loadSubAccounts();
    } catch (error) {
      console.error("Error creating sub-account:", error);
    }
  };

  const withdrawFromSubAccount = async () => {
    if (!selectedSubAccount || !withdrawAmount) return;
    try {
      const tx = await contract.withdrawFromSubAccount(
        selectedSubAccount,
        ethers.utils.parseEther(withdrawAmount)
      );
      await tx.wait();
      loadSubAccounts();
      setWithdrawAmount("");
      setSelectedSubAccount(null);
    } catch (error) {
      console.error("Error withdrawing from sub-account:", error);
    }
  };

  return (
    <div className="mt-8 bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Sub-Account Manager</h2>
      <button
        onClick={createSubAccount}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
      >
        Create New Sub-Account
      </button>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Your Sub-Accounts</h3>
        {subAccounts.map((subAccount) => (
          <div
            key={subAccount.id}
            className="flex justify-between items-center mb-2 p-2 bg-gray-100 rounded"
          >
            <span>Sub-Account #{subAccount.id}</span>
            <span>Balance: {subAccount.balance} ETH</span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Withdraw Funds</h3>
        <select
          value={selectedSubAccount || ""}
          onChange={(e) => setSelectedSubAccount(e.target.value)}
          className="mr-2 p-2 border rounded"
        >
          <option value="">Select Sub-Account</option>
          {subAccounts.map((subAccount) => (
            <option key={subAccount.id} value={subAccount.id}>
              Sub-Account #{subAccount.id}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Amount to withdraw"
          className="mr-2 p-2 border rounded"
        />
        <button
          onClick={withdrawFromSubAccount}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}

export default SubAccountManager;
