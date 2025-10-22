import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Layout from "./Layout.jsx";
import Details from "./pages/Details.jsx";
import Hero from "./pages/Hero.jsx";
import Form from "./pages/Form.jsx";
import CardReport from "./pages/CardReport.jsx";
import Home from "./pages/Home.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="details" element={<Details />} />
      <Route path="check" element={<Hero />} />
      <Route path="report" element={<CardReport />} />
      <Route path="form" element={<Form />} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
