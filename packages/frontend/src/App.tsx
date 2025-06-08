import { useState } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import { AppProps } from "next/app";
import { AuthProvider } from "./components/AuthProvider";

function App() {
  return (
      <div className="app-container">
        <Outlet />
      </div>
  );
}

export default App;