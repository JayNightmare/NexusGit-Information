import React from "react";

function LinkCard({ link, displayName, info, image, enabled }) {
    const hostname = (() => {
        try {
            return new URL(link).hostname.replace("www.", "");
        } catch {
            return "";
        }
    })();

    return (
        <li className="link-card-wrapper">
            <a
                className={`link-card ${enabled ? "" : "disabled"}`}
                draggable="false"
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${displayName} – opens in new tab`}
            >
                <div className="thumb" aria-hidden="true">
                    {image ? (
                        <img src={image} alt="" loading="lazy" />
                    ) : (
                        <div className="fallback" role="presentation">
                            {displayName?.[0] || "•"}
                        </div>
                    )}
                </div>
                <div className="meta">
                    <h2 className="title">{displayName}</h2>
                    {info && <p className="info">{info}</p>}
                    {hostname && (
                        <p className="host" aria-label="Host">
                            {hostname}
                        </p>
                    )}
                </div>
                <span className="chevron" aria-hidden="true">
                    →
                </span>
            </a>
        </li>
    );
}

export default LinkCard;
