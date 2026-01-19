import React from "react";
import Header from "../commons/header.jsx";
import Footer from "../commons/footer.jsx";
import Keyboard from "../play/keyboard.jsx";

export function PlayKalimbaPage() {
  return (
    <React.Fragment>
      <main className="container" data-theme="generated">
        <Header />
        <Keyboard />
        <Footer />
      </main>
    </React.Fragment>
  );
}
export default PlayKalimbaPage;
