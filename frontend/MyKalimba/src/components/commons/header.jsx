import React from "react";
export function Header() {
  return (
    <header className="container">
      <hgroup>
        <h1 data-i18n="title">My Kalimba</h1>
        <p data-i18n="description">
          Đây là nơi bạn có thể dễ dàng chơi kalimba trực tiếp trong trình duyệt
          của mình.
        </p>
      </hgroup>
    </header>
  );
}
export default Header;
