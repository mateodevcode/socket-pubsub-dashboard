// src/App.jsx (o donde tengas tus rutas)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../App";
import AdminPanel from "../pages/AdminPanel";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tus rutas existentes */}
        <Route path="/" element={<App />} />

        {/* Nueva ruta para el Admin Panel */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
