import { useState, useEffect } from "react";
import { ethers } from "ethers";

const contractABI = [
  "function createTask(string memory _description) public payable",
  "function assignTask(uint256 _taskId) public",
  "function completeTask(uint256 _taskId) public",
  "function releasePayment(uint256 _taskId) public",
  "function getTask(uint256 _taskId) public view returns (string memory description, uint256 payment, address creator, address assignee, bool completed, bool paid)",
  "function getUserTasks(address _user) public view returns (uint256[] memory)",
  "event TaskCreated(uint256 taskId, string description, uint256 payment)",
  "event TaskAssigned(uint256 taskId, address assignee)",
  "event TaskCompleted(uint256 taskId)",
  "event PaymentSent(uint256 taskId, address recipient, uint256 amount)",
];
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPayment, setNewTaskPayment] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const loadTasks = async (contract, address) => {
    try {
      const taskIds = await contract.getUserTasks(address);
      const loadedTasks = await Promise.all(
        taskIds.map(async (id) => {
          const task = await contract.getTask(id);
          return { id: id.toNumber(), ...task };
        })
      );
      setTasks(loadedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          console.log(address, "address");
          console.log(signer, "signer");

          setAccount(address);
          setIsConnected(true);

          const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          setContract(contract);

          loadTasks(contract, address);

          contract.on("TaskCreated", () => loadTasks(contract, address));
          contract.on("TaskCompleted", () => loadTasks(contract, address));

          window.ethereum.on("accountsChanged", handleAccountsChanged);
        } catch (error) {
          console.error("Failed to connect to MetaMask:", error);
          setIsConnected(false);
        }
      } else {
        console.log("Please install MetaMask!");
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      console.log("Please connect to MetaMask.");
      setIsConnected(false);
    } else if (accounts[0] !== account) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setAccount(accounts[0]);
      setIsConnected(true);
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      setContract(contract);
      loadTasks(contract, accounts[0]);
    }
  };

  const createTask = async () => {
    if (contract && newTaskDescription && newTaskPayment) {
      try {
        const tx = await contract.createTask(newTaskDescription, {
          value: ethers.utils.parseEther(newTaskPayment),
        });
        await tx.wait();
        setNewTaskDescription("");
        setNewTaskPayment("");
        loadTasks(contract, account);
      } catch (error) {
        console.error("Error creating task:", error);
      }
    }
  };

  const completeTask = async (taskId) => {
    if (contract) {
      try {
        const tx = await contract.completeTask(taskId);
        await tx.wait();
        loadTasks(contract, account);
      } catch (error) {
        console.error("Error completing task:", error);
      }
    }
  };

  const removeTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-4xl font-bold mb-5 text-center text-gray-800">
            Task Project on Arbitrum Sepolia
          </h1>

          {isConnected ? (
            <p className="mb-4 text-green-600">Connected Account: {account}</p>
          ) : (
            <p className="mb-4 text-red-600">
              Not connected. Please ensure MetaMask is installed and connected.
            </p>
          )}

          {isConnected && (
            <>
              <h2 className="text-2xl font-semibold mb-3 text-gray-700">
                Create New Task
              </h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Task description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Payment amount (ETH)"
                  value={newTaskPayment}
                  onChange={(e) => setNewTaskPayment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <button
                onClick={createTask}
                className="w-full bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
              >
                Create Task
              </button>

              <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-700">
                Your Tasks
              </h2>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-50 rounded-lg p-4 mb-4 shadow"
                >
                  <p className="text-sm text-gray-600">Task ID: {task.id}</p>
                  <p className="font-semibold text-gray-800">
                    {task.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    Payment: {ethers.utils.formatEther(task.payment)} ETH
                  </p>
                  <p className="text-sm text-gray-600">
                    Progress: {task.completed ? "Completed" : "In Progress"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Paid: {task.paid ? "Yes" : "No"}
                  </p>
                  {!task.completed && task.assignee === account && (
                    <button
                      onClick={() => completeTask(task.id)}
                      className="mt-2 bg-green-500 text-white py-1 px-3 rounded-md text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                      Mark as Complete
                    </button>
                  )}
                  <button
                    onClick={() => removeTask(task.id)}
                    className="mt-2 ml-2 bg-red-500 text-white py-1 px-3 rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
