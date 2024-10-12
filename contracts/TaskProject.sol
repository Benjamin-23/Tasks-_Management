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

    Task[] public tasks;
    mapping(address => uint256[]) public userTasks;

    event TaskCreated(uint256 taskId, string description, uint256 payment);
    event TaskAssigned(uint256 taskId, address assignee);
    event TaskCompleted(uint256 taskId);
    event PaymentSent(uint256 taskId, address recipient, uint256 amount);

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

    function completeTask(uint256 _taskId) public {
        require(_taskId < tasks.length, "Task does not exist");
        require(tasks[_taskId].assignee == msg.sender, "Only assignee can complete the task");
        require(!tasks[_taskId].completed, "Task already completed");
        
        tasks[_taskId].completed = true;
        emit TaskCompleted(_taskId);
    }

    function releasePayment(uint256 _taskId) public {
        require(_taskId < tasks.length, "Task does not exist");
        require(tasks[_taskId].creator == msg.sender, "Only creator can release payment");
        require(tasks[_taskId].completed, "Task not completed yet");
        require(!tasks[_taskId].paid, "Payment already sent");

        tasks[_taskId].paid = true;
        payable(tasks[_taskId].assignee).transfer(tasks[_taskId].payment);
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

    function getUserTasks(address _user) public view returns (uint256[] memory) {
        return userTasks[_user];
    }
}