import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";

const contractABI = [
  // Add these new functions to your existing ABI
  "function getAllTasks() public view returns (uint256[] memory)",
  "function getAssignedTasks(address _user) public view returns (uint256[] memory)",
  // ... (keep all the existing ABI entries)
];

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function TaskMarketplace() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [allTasks, setAllTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [subAccounts, setSubAccounts] = useState([]);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });

          if (accounts.length > 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            setAccount(address);
            setIsConnected(true);

            const contract = new ethers.Contract(
              contractAddress,
              contractABI,
              signer
            );
            setContract(contract);

            loadAllTasks(contract);
            loadAssignedTasks(contract, address);
            loadSubAccounts(contract, address);

            contract.on("TaskCreated", () => loadAllTasks(contract));
            contract.on("TaskAssigned", () => {
              loadAllTasks(contract);
              loadAssignedTasks(contract, address);
            });
            contract.on("SubAccountCreated", () =>
              loadSubAccounts(contract, address)
            );

            window.ethereum.on("accountsChanged", handleAccountsChanged);
          } else {
            setError("No accounts found. Please connect to MetaMask.");
          }
        } catch (error) {
          console.error("Failed to connect to MetaMask:", error);
          setError("Failed to connect. Please check MetaMask and try again.");
          setIsConnected(false);
        }
      } else {
        setError(
          "MetaMask not detected. Please install MetaMask and refresh the page."
        );
        setIsConnected(false);
      }
    };

    init();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
      if (contract) {
        contract.removeAllListeners();
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setError("Please connect to MetaMask.");
      setIsConnected(false);
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      setIsConnected(true);
      loadAssignedTasks(contract, accounts[0]);
      loadSubAccounts(contract, accounts[0]);
    }
  };

  const loadAllTasks = async (contract) => {
    try {
      const taskCount = await contract.tasks.length;
      const loadedTasks = await Promise.all(
        Array(taskCount)
          .fill()
          .map(async (_, i) => {
            const task = await contract.getTask(i);
            return { id: i, ...task };
          })
      );
      setAllTasks(loadedTasks.filter((task) => !task.assignee));
    } catch (error) {
      console.error("Error loading all tasks:", error);
    }
  };

  const loadAssignedTasks = async (contract, address) => {
    try {
      const taskIds = await contract.getUserTasks(address);
      const loadedTasks = await Promise.all(
        taskIds.map(async (id) => {
          const task = await contract.getTask(id);
          return { id: id.toNumber(), ...task };
        })
      );
      setAssignedTasks(loadedTasks);
    } catch (error) {
      console.error("Error loading assigned tasks:", error);
    }
  };

  const loadSubAccounts = async (contract, address) => {
    try {
      const subAccountCount = await contract.subAccountCount(address);
      const accounts = [];
      for (let i = 0; i < subAccountCount; i++) {
        const balance = await contract.getSubAccountBalance(address, i);
        accounts.push({ id: i, balance: ethers.utils.formatEther(balance) });
      }
      setSubAccounts(accounts);
    } catch (error) {
      console.error("Error loading sub-accounts:", error);
    }
  };

  const assignTask = async (taskId) => {
    if (contract) {
      try {
        const tx = await contract.assignTask(taskId);
        await tx.wait();
        loadAllTasks(contract);
        loadAssignedTasks(contract, account);
      } catch (error) {
        console.error("Error assigning task:", error);
      }
    }
  };

  const completeTask = async (taskId) => {
    if (contract && subAccounts.length > 0) {
      try {
        const tx = await contract.completeTask(taskId, subAccounts[0].id);
        await tx.wait();
        loadAssignedTasks(contract, account);
        loadSubAccounts(contract, account);
      } catch (error) {
        console.error("Error completing task:", error);
      }
    } else {
      setError("Please create a sub-account first.");
    }
  };

  const renderTaskList = (tasks, isAssigned = false) => (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Task ID: {task.id}</p>
          <p className="font-semibold text-gray-800">{task.description}</p>
          <p className="text-sm text-gray-600">
            Payment: {utils.formatEther(task.payment)} ETH
          </p>
          <p className="text-sm text-gray-600">
            Status: {task.completed ? "Completed" : "In Progress"}
          </p>
          {!isAssigned && !task.assignee && (
            <button
              onClick={() => assignTask(task.id)}
              className="mt-2 bg-blue-500 text-white py-1 px-3 rounded-md text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Assign to Me
            </button>
          )}
          {isAssigned && !task.completed && (
            <button
              onClick={() => completeTask(task.id)}
              className="mt-2 bg-green-500 text-white py-1 px-3 rounded-md text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Complete Task
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-4xl font-bold mb-5 text-center text-gray-800">
            Task Marketplace
          </h1>

          {isConnected ? (
            <p className="mb-4 text-green-600">Connected Account: {account}</p>
          ) : (
            <p className="mb-4 text-red-600">
              {error ||
                "Not connected. Please ensure MetaMask is installed and connected."}
            </p>
          )}

          {
            <>
              {/* {isConnected && (
                <SubAccountManager contract={contract} account={account} />
              )} */}

              <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-700">
                Available Tasks
              </h2>
              {renderTaskList(allTasks)}

              <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-700">
                Your Assigned Tasks
              </h2>
              {renderTaskList(assignedTasks, true)}
            </>
          }
        </div>
      </div>
    </div>
  );
}

export default TaskMarketplace;
