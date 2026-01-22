import React, { useEffect } from "react";
import Header from "../commons/header.jsx";
import Footer from "../commons/footer.jsx";
import Keyboard from "../play/keyboard.jsx";
import Options from "../play/options.jsx";

export function PlayKalimbaPage() {
  useEffect(() => {
    // Ensure the legacy jQuery kalimba UI re-initializes after SPA navigation.
    window.dispatchEvent(new Event("kalimba:mount"));
  }, []);

  return (
    <React.Fragment>
      <main className="container" data-theme="generated">
        <Header />
        <Keyboard />
        <Options />
        <Footer />
      </main>
    </React.Fragment>
  );
}
export default PlayKalimbaPage;
