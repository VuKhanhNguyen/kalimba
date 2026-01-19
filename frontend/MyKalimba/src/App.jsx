import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PlayKalimbaPage from "./components/pages/PlayKalimbaPage.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PlayKalimbaPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
