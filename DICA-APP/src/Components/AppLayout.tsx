import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
import { useEffect } from "react";
import Footer from "./common/Footer";

export const AppLayout = () => {
  return (
    <>
      <NavBar />
      <Outlet />
      <Footer />
    </>
  );
};
