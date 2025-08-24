import React from "react";
import siteIcon from "../assets/icon.svg";

function Header({ title }) {
    return (
        <>
            <div className="site-icon">
                <img src={siteIcon} alt="Site Icon" width="32" height="32" />
            </div>
            <header className="site-header" aria-label={title}>
                <h1 className="gradient-text">{title}</h1>
            </header>
        </>
    );
}

export default Header;
