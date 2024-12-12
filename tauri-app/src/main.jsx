import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Group from "./pages/Group.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Register from './pages/Register.jsx';
import './App.css';

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
      <Routes>
          <Route
              path="/"
              element={
                  <ProtectedRoute>
                      <Home />
                  </ProtectedRoute>
              }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/group/:id" element={<Group />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<NotFound />}></Route>
      </Routes>
  </Router>
);
