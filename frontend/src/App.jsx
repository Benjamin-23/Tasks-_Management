import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TaskCreator from "./TaskCreator"; // Rename your current App.jsx to TaskCreator.jsx
import TaskMarketplace from "./components/taskMarket";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between">
              <div className="flex space-x-7">
                <div>
                  <Link to="/" className="flex items-center py-4 px-2">
                    <span className="font-semibold text-gray-500 text-lg">
                      Task Project
                    </span>
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  to="/"
                  className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-green-500 hover:text-white transition duration-300"
                >
                  Create Tasks
                </Link>
                <Link
                  to="/marketplace"
                  className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-green-500 hover:text-white transition duration-300"
                >
                  Task Marketplace
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<TaskCreator />} />
          <Route path="/marketplace" element={<TaskMarketplace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
