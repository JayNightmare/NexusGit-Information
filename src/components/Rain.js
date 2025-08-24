import React, { useEffect, useRef } from "react";

const Rain = () => {
    const frontRowRef = useRef(null);
    const backRowRef = useRef(null);

    const makeItRain = () => {
        if (frontRowRef.current) frontRowRef.current.innerHTML = "";
        if (backRowRef.current) backRowRef.current.innerHTML = "";

        let increment = 0;
        let drops = "";
        let backDrops = "";

        while (increment < 100) {
            const randoHundo = Math.floor(Math.random() * (98 - 1 + 1) + 1);
            const randoFiver = Math.floor(Math.random() * (5 - 2 + 1) + 2);
            increment += randoFiver;

            const dropStyle = `left: ${increment}%; bottom: ${
                randoFiver + randoFiver - 1 + 100
            }%; animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;`;

            drops += `<div class="drop" style="${dropStyle}"><div class="stem" style="animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;"></div><div class="splat" style="animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;"></div></div>`;

            backDrops += `<div class="drop" style="right: ${increment}%; bottom: ${
                randoFiver + randoFiver - 1 + 100
            }%; animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;"><div class="stem" style="animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;"></div><div class="splat" style="animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;"></div></div>`;
        }

        if (frontRowRef.current) frontRowRef.current.innerHTML = drops;
        if (backRowRef.current) backRowRef.current.innerHTML = backDrops;
    };

    useEffect(() => {
        makeItRain();

        // Random lightning effect: periodically flash a lighter background
        let cancelled = false;
        const scheduleFlash = () => {
            if (cancelled) return;
            const timeout = Math.random() * 8000 + 4000; // 4s - 12s
            setTimeout(() => {
                if (cancelled) return;
                triggerFlash();
                scheduleFlash();
            }, timeout);
        };
        const triggerFlash = () => {
            const body = document.body;
            if (!body) return;
            // create 1-2 quick flashes to mimic lightning
            const flashes = Math.random() < 0.5 ? 1 : 2;
            let count = 0;
            const doFlash = () => {
                if (cancelled) return;
                body.classList.add("lightning");
                setTimeout(() => {
                    body.classList.remove("lightning");
                    count++;
                    if (count < flashes) {
                        setTimeout(doFlash, 20 + Math.random() * 120);
                    }
                }, 80 + Math.random() * 120); // each flash length ~180-300ms
            };
            doFlash();
        };
        scheduleFlash();

        return () => {
            cancelled = true;
            document.body && document.body.classList.remove("lightning");
        };
    }, []);

    return (
        <>
            <div className="rain front-row" ref={frontRowRef}></div>
            <div className="rain back-row" ref={backRowRef}></div>
        </>
    );
};

export default Rain;
