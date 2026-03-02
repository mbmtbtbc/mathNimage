import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

import Generate from "../pages/Generate";
import Playground from "../pages/Playground";
import Fractals from "../pages/Fractals";
import AudioLab from "../pages/AudioLab";
import Decode from "../pages/Decode";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Generate />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/fractals" element={<Fractals />} />
          <Route path="/audio" element={<AudioLab />} />
          <Route path="/decode" element={<Decode />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}