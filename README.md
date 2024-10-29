# TaskProject Smart Contract

A decentralized task management and payment system built on Ethereum. This smart contract enables users to create tasks, assign workers, manage payments through sub-accounts, and handle task completion verification.

# video link

https://www.loom.com/share/02f98e1dda5747c4bb2ef18fa0bbc1ab?sid=4b836aee-b4b2-47c3-a0e8-b20998043dda

# Errors

- Task list is not showing .
- User / task doers are not able to see they task bot complete and ongoing .

# NOTE: Working on the errors still . by the end of this November month the system will be live and working .

# Features

- Create tasks with attached payments
- Assign tasks to workers
- Manage multiple sub-accounts per user
- Secure payment release system
- Task completion verification
- Flexible payment withdrawal system

# Contract Structure

# Core Components

Tasks

- Description
  -Payment amount
- Creator address
- Assignee address
- Completion status
- Payment status

Sub-accounts

- Balance tracking
- Multiple accounts per user
- Secure withdrawal system

# Key Functions

# Task Management

```
- createTask(string memory _description) - Create a new task with payment
- assignTask(uint256 _taskId) - Assign a task to yourself
- completeTask(uint256 _taskId, uint256 _subAccountId) - Mark a task as completed
- releasePayment(uint256 _taskId) - Release payment for completed task
```

```

Sub-account Management

- createSubAccount() - Create a new sub-account
- withdrawFromSubAccount(uint256 _subAccountId, uint256 _amount) - Withdraw funds
- getSubAccountBalance(address _user, uint256 _subAccountId) - Check sub-account balance
```

```
View Functions

- getTasks() - Get all tasks
- getTask(uint256 _taskId) - Get detailed task information
- getUserTasks(address _user) - Get all tasks associated with an address
- hasUserTasks(address _user) - Check if user has any tasks
```

Events

# The contract emits the following events:

```
- TaskCreated(uint256 taskId, string description, uint256 payment)
- TaskAssigned(uint256 taskId, address assignee)
- TaskCompleted(uint256 taskId)
- PaymentSent(uint256 taskId, address recipient, uint256 amount)
- SubAccountCreated(address owner, uint256 subAccountId)
- FundsWithdrawn(address owner, uint256 subAccountId, uint256 amount)

```

```
Usage Example
Create a task with payment
taskProject.createTask("Develop landing page"){value: 1 ether}

// Worker assigns themselves to task
taskProject.assignTask(0)

// Create sub-account for receiving payment
taskProject.createSubAccount()

// Complete task and receive payment in sub-account
taskProject.completeTask(0, 0)

// Task creator releases payment
taskProject.releasePayment(0)

// Worker withdraws funds from sub-account
taskProject.withdrawFromSubAccount(0, 1 ether)
Security Considerations
```

All functions include appropriate access controls
Payment handling includes balance checks
Task status verification before payment release
Sub-account existence verification
Proper require statements for parameter validation

# Requirements

```
- Solidity ^0.8.0
Compatible with EVM-based networks
```

# License

This project is licensed under the MIT License - see the LICENSE file for details.

# Technical Notes

- The contract uses OpenZeppelin's best practices for secure smart contract development
- Implements events for all major state changes to facilitate frontend integration
- Uses mapping data structures for efficient data access
- Includes comprehensive error messages for better debugging

# Testing Recommendations

- Test task creation with various payment amounts
- Verify sub-account creation and management
- Test payment release flow
- Verify access controls for all functions
- Test edge cases in task assignment and completion
- Verify event emissions
