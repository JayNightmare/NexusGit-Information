import React from "react";
import LinkCard from "./LinkCard";

function LinkList({ links }) {
    if (!Array.isArray(links) || links.length === 0) {
        return (
            <p className="empty" role="status">
                No links configured yet.
            </p>
        );
    }

    return (
        <ul className="links" aria-label="Project Links">
            {links.map((item) => (
                <LinkCard
                    key={item.Link}
                    link={item.Link}
                    displayName={item.DisplayName}
                    info={item.Info}
                    image={item.Image}
                    enabled={item.Enabled}
                />
            ))}
        </ul>
    );
}

export default LinkList;
