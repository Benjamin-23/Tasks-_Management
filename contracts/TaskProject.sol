// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TaskProject {
    struct Task {
        string description;
        uint256 payment;
        address creator;
        address assignee;
        bool completed;
        bool paid;
    }

    struct SubAccount {
        uint256 balance;
        bool exists;
    }

    Task[] public tasks;
    mapping(address => uint256[]) public userTasks;
    mapping(address => mapping(uint256 => SubAccount)) public subAccounts;
    mapping(address => uint256) public subAccountCount;

    event TaskCreated(uint256 taskId, string description, uint256 payment);
    event TaskAssigned(uint256 taskId, address assignee);
    event TaskCompleted(uint256 taskId);
    event PaymentSent(uint256 taskId, address recipient, uint256 amount);
    event SubAccountCreated(address owner, uint256 subAccountId);

    function createTask(string memory _description) public payable {
        require(msg.value > 0, "Payment must be greater than 0");
        
        uint256 taskId = tasks.length;
        tasks.push(Task({
            description: _description,
            payment: msg.value,
            creator: msg.sender,
            assignee: address(0),
            completed: false,
            paid: false
        }));

        userTasks[msg.sender].push(taskId);
        emit TaskCreated(taskId, _description, msg.value);
    }

    function assignTask(uint256 _taskId) public {
        require(_taskId < tasks.length, "Task does not exist");
        require(tasks[_taskId].assignee == address(0), "Task already assigned");
        
        tasks[_taskId].assignee = msg.sender;
        userTasks[msg.sender].push(_taskId);
        emit TaskAssigned(_taskId, msg.sender);
    }

    function createSubAccount() public {
        uint256 subAccountId = subAccountCount[msg.sender];
        subAccounts[msg.sender][subAccountId] = SubAccount({
            balance: 0,
            exists: true
        });
        subAccountCount[msg.sender]++;
        emit SubAccountCreated(msg.sender, subAccountId);
    }

    function completeTask(uint256 _taskId, uint256 _subAccountId) public {
        require(_taskId < tasks.length, "Task does not exist");
        require(tasks[_taskId].assignee == msg.sender, "Only assignee can complete the task");
        require(!tasks[_taskId].completed, "Task already completed");
        require(subAccounts[msg.sender][_subAccountId].exists, "Sub-account does not exist");
        
        tasks[_taskId].completed = true;
        subAccounts[msg.sender][_subAccountId].balance += tasks[_taskId].payment;
        emit TaskCompleted(_taskId);
    }

    function withdrawFromSubAccount(uint256 _subAccountId, uint256 _amount) public {
        require(subAccounts[msg.sender][_subAccountId].exists, "Sub-account does not exist");
        require(subAccounts[msg.sender][_subAccountId].balance >= _amount, "Insufficient balance");

        subAccounts[msg.sender][_subAccountId].balance -= _amount;
        payable(msg.sender).transfer(_amount);
    }

    function releasePayment(uint256 _taskId) public {
        require(_taskId < tasks.length, "Task does not exist");
        require(tasks[_taskId].creator == msg.sender, "Only creator can release payment");
        require(tasks[_taskId].completed, "Task not completed yet");
        require(!tasks[_taskId].paid, "Payment already sent");

        tasks[_taskId].paid = true;
        emit PaymentSent(_taskId, tasks[_taskId].assignee, tasks[_taskId].payment);
    }

    function getTask(uint256 _taskId) public view returns (
        string memory description,
        uint256 payment,
        address creator,
        address assignee,
        bool completed,
        bool paid
    ) {
        require(_taskId < tasks.length, "Task does not exist");
        Task storage task = tasks[_taskId];
        return (task.description, task.payment, task.creator, task.assignee, task.completed, task.paid);
    }
//to redo
    function getUserTasks(address _user) public view returns (uint256[] memory) {
        return userTasks[_user];
    }

   //Changes here

// Consider adding a function to check if user has any tasks
function hasUserTasks(address _user) public view returns (bool) {
    return userTasks[_user].length > 0;
}

    function getSubAccountBalance(address _user, uint256 _subAccountId) public view returns (uint256) {
        require(subAccounts[_user][_subAccountId].exists, "Sub-account does not exist");
        return subAccounts[_user][_subAccountId].balance;
    }
}