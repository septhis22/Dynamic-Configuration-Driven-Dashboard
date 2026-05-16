import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/DashBoard';
import Assignmet2 from './page/Assignmet2';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/work2" element={<Assignmet2 />} />
      </Routes>
    </BrowserRouter>
  )
}
