import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

// Pages are lazy-loaded so each becomes its own chunk — the initial bundle only
// carries the shell + Home, and the rest stream in as you navigate.
const Roles = lazy(() => import('./pages/Roles'));
const Trackr = lazy(() => import('./pages/Trackr'));
const Firms = lazy(() => import('./pages/Firms'));
const Questions = lazy(() => import('./pages/Questions'));
const Mock = lazy(() => import('./pages/Mock'));
const Options = lazy(() => import('./pages/Options'));
const OptionsChapter = lazy(() => import('./pages/OptionsChapter'));
const Games = lazy(() => import('./pages/Games'));
const Resources = lazy(() => import('./pages/Resources'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="roles" element={<Roles />} />
        <Route path="trackr" element={<Trackr />} />
        <Route path="firms" element={<Firms />} />
        <Route path="questions" element={<Questions />} />
        <Route path="mock" element={<Mock />} />
        <Route path="options" element={<Options />} />
        <Route path="options/:chapterId" element={<OptionsChapter />} />
        <Route path="games" element={<Games />} />
        <Route path="resources" element={<Resources />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
