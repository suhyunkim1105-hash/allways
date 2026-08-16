import { Route, Routes } from 'react-router-dom';
import ExplorerLayout from './pages/ExplorerLayout';
import PlaceListSlot from './pages/PlaceListSlot';
import PlaceDetailSlot from './pages/PlaceDetailSlot';

/* =========================================================================
 * App.tsx — top-level routes.
 *
 * ExplorerLayout renders the map + filter bar (right side) and stays
 * mounted across both child routes below — only the left slot (list vs.
 * detail) swaps via <Outlet/>, so the map never reloads when navigating
 * between them:
 *
 *   "/"            → PlaceListSlot   (left slot: place list)
 *   "/places/:id"  → PlaceDetailSlot (left slot: detail — currently a stub)
 * =======================================================================*/
function App() {
  return (
    <Routes>
      <Route element={<ExplorerLayout />}>
        <Route index element={<PlaceListSlot />} />
        <Route path="places/:id" element={<PlaceDetailSlot />} />
      </Route>
    </Routes>
  );
}

export default App;
