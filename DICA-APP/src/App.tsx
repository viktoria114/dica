import "./App.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import { NavBar } from "./Components/NavBar";
import Login from "./Pages/Login";
import { Inicio } from "./Pages/Inicio";

function App() {
 const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Login />} />
        
        <Route element={<NavBar />}>
        <Route path="/inicio" element={<Inicio />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </>
    )
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;