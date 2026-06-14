import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Roles from './pages/Roles';
import Trackr from './pages/Trackr';
import Firms from './pages/Firms';
import Questions from './pages/Questions';
import Mock from './pages/Mock';
import Options from './pages/Options';
import OptionsChapter from './pages/OptionsChapter';
import Games from './pages/Games';
import Resources from './pages/Resources';

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
