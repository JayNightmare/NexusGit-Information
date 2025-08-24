import React from "react";
import Header from "./components/Header";
import LinkList from "./components/LinkList";
import links from "./links.json";
import Rain from "./components/Rain";

function App() {
    return (
        <>
            <div className="app-shell">
                <Header title="NexusGit" />
                <main>
                    <LinkList links={links} />
                </main>
                <footer className="footer" aria-label="Footer note">
                    <small>
                        &copy; {new Date().getFullYear()} NexusGit • Jay
                    </small>
                </footer>
            </div>
            <Rain />
        </>
    );
}

export default App;
