export function safeLLMJsonParse(raw) {
    try {
        // ✅ First attempt: strict parsing on cleaned raw
        return strictParse(raw);
    } catch (err1) {
        console.warn("Strict parse failed → applying fallback repairs...");

        // ✅ Fallback 1 — repair common LLM issues
        const repaired = raw
            // remove backticks & code fences
            .replace(/```(?:json)?/gi, "")
            // remove control characters
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
            // undefined → null
            .replace(/\bundefined\b/gi, "null")
            .replace(/\bNaN\b/g, "null")
            // escape illegal quotes inside HTML tags
            .replace(/<([^>"]*)"([^>"]*)>/g, (m) => m.replace(/"/g, "'"))
            // convert smart quotes
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            // remove JS comments
            .replace(/\/\/.*$/gm, "")
            .replace(/\/\*[\s\S]*?\*\//gm, "")
            // wrap unquoted keys
            .replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":')
            // remove trailing commas
            .replace(/,\s*([}\]])/g, "$1")
            // attempt to ensure JSON starts/ends cleanly
            .replace(/^[\s\S]*?({|\[)/, "$1")
            .replace(/(}|\])[\s\S]*$/, "$1");

        try {
            return strictParse(repaired);
        } catch (err2) {
            console.warn("Fallback parse also failed → applying LAST RESORT loose fix...");

            // ✅ Fallback 2 — last resort: escape any remaining unescaped "
            let loose = repaired.replace(
                /"(.*?)":\s*"([^"]*?)"([^,}])/g,
                (m, a, b, c) => `"${a}":"${b.replace(/"/g, "'")}"${c}`
            );

            return JSON.parse(loose);
        }
    }
}



/* ------------------------------------------
   ✅ STRICT PARSER (primary engine)
------------------------------------------- */
function strictParse(txt) {
    let text = txt;

    // extract JSON between first { or [ and last } or ]
    const start = Math.min(
        ...["{", "["].map(ch => text.indexOf(ch)).filter(i => i >= 0)
    );
    const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));

    if (start === -1 || end === -1) {
        throw new Error("No JSON object found.");
    }

    const sliced = text.slice(start, end + 1);

    // strip trailing commas
    const clean = sliced
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");

    return JSON.parse(clean);
}
