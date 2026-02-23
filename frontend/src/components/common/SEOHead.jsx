
import { useEffect } from "react";

/**
 * SEOHead - Dynamic page title and meta management
 * Since we're not using react-helmet, this uses document APIs
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 */
export default function SEOHead({
    title = "THE COMPUTING SOCIETY",
    description = "THE COMPUTING SOCIETY (TCS) - Department of Computer Science, UAF. Join us for events, workshops, and tech excellence."
}) {
    const fullTitle = title === "THE COMPUTING SOCIETY"
        ? title
        : `${title} | TCS`;

    useEffect(() => {
        // Update document title
        document.title = fullTitle;

        // Update meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", description);
        }

        // Update OG title
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute("content", fullTitle);
        }

        // Update OG description
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) {
            ogDesc.setAttribute("content", description);
        }

        return () => {
            // Reset to default on unmount
            document.title = "THE COMPUTING SOCIETY";
        };
    }, [fullTitle, description]);

    return null; // This component doesn't render anything
}
