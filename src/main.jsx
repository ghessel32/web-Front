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
import Home from "./pages/Home.jsx";
import ScoreCard from "./pages/ScoreCard.jsx";
import Leader from "./components/Leader.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="details" element={<Details />} />
      <Route path="check" element={<ScoreCard />} />
      <Route path="leaderboard" element={<Leader />} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
