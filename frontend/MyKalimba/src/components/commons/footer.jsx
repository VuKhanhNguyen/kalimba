import React from 'react';
export function Footer() {
    return (
        <footer>
            <hr />
            <p>
                <small>
                    <span data-i18n="footer.builtwith">Built with</span> <a href="https://picocss.com" target="_blank">Pico</a> •
                    <a href="https://github.com/Dunamis4tw/kalimba-online" target="_blank" data-i18n="footer.sourcecode">Source code</a>
                </small>
                <small style={{float: "right"}}>
                    <span data-i18n="footer.hostedby">Hosted by</span> <a href="https://pages.github.com" target="_blank">GitHub Pages</a>
                </small>
            </p>
        </footer>
    );
}
export default Footer;