import React from "react";
import Header from "../commons/header.jsx";
import Footer from "../commons/footer.jsx";

export function SettingsPage() {
  return (
    <React.Fragment>
      <main className="container" data-theme="generated">
        <Header />
        <article>
          <header>
            <h2>Cài đặt</h2>
          </header>
          <p>Trang cài đặt đang được phát triển.</p>
        </article>
        <Footer />
      </main>
    </React.Fragment>
  );
}

export default SettingsPage;
