import React from "react";
import Header from "./components/Header.jsx";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <Outlet />
    </>
  );
}

export default Layout;
