# Task Frontend Application

Overview
The frontend application provides a user-friendly interface for interacting with the TaskProject smart contract. Built with React and React Router, it features a modern, responsive design using Tailwind CSS for styling.
Features

- Responsive navigation system
- Task creation interface
- Task marketplace for browsing available tasks
- Clean, modern UI with hover effects
- Mobile-friendly design

The main application component that handles routing and navigation:

- Navigation bar with responsive design
- Route configuration for different pages
- Consistent layout structure

Navigation Features

- Home/Task Creation page (/)
- Task Marketplace (/marketplace)
- Hover effects on navigation items
- Mobile-responsive design

# Technical Stack

- React: Frontend framework
- React Router: Navigation and routing
- Tailwind CSS: Styling and UI components
- Web3.js/Ethers.js: Ethereum interaction (implementation required)

Setup Instructions

Install dependencies:

```
npm install react react-router-dom
npm install -D tailwindcss postcss autoprefixer
```

Initialize Tailwind CSS:

```
npx tailwindcss init -p
```

Configure environment:

# .env

```
REACT_APP_CONTRACT_ADDRESS=your_contract_address
```

Start the development server:

```
npm run dev
```
