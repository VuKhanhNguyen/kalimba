import React from "react";
import Header from "../commons/header.jsx";
import Footer from "../commons/footer.jsx";
import Keyboard from "../play/keyboard.jsx";
import Options from "../play/options.jsx";

export function PlayKalimbaPage() {
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
