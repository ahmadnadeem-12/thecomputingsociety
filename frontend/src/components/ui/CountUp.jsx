import { useState, useEffect, useRef } from "react";

/**
 * CountUp Animation Component
 * Animates a number from 0 to the target value - ONLY on first page load
 * @param {string} value - The target value (can include suffix like "25+", "600+")
 * @param {number} duration - Animation duration in ms (default: 2000)
 */
export function CountUp({ value, duration = 2000 }) {
    // Parse the numeric part and suffix from value like "25+" or "600+"
    const parseValue = (val) => {
        const str = String(val);
        const match = str.match(/^(\d+)(.*)$/);
        if (match) {
            return { number: parseInt(match[1], 10), suffix: match[2] || "" };
        }
        return { number: 0, suffix: str };
    };

    const { number: targetNumber, suffix } = parseValue(value);

    // Check if animation already happened this session
    const sessionKey = "tcs_stats_animated";
    const alreadyAnimated = sessionStorage.getItem(sessionKey) === "true";

    const [count, setCount] = useState(alreadyAnimated ? targetNumber : 0);
    const [hasAnimated, setHasAnimated] = useState(alreadyAnimated);
    const ref = useRef(null);

    useEffect(() => {
        // If already animated this session, don't animate again
        if (hasAnimated) return;

        // Use Intersection Observer to trigger animation when visible
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    sessionStorage.setItem(sessionKey, "true");
                    animateCount();
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [hasAnimated, targetNumber]);

    const animateCount = () => {
        const startTime = Date.now();
        const step = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);

            const currentCount = Math.floor(easeOut * targetNumber);
            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setCount(targetNumber);
            }
        };
        requestAnimationFrame(step);
    };

    return (
        <span ref={ref}>
            {count}{suffix}
        </span>
    );
}
