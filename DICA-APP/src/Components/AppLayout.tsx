import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

export const AppLayout = () => {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
};
