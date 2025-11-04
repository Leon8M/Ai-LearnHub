export function safeLLMJsonParse(raw) {
    try {
        let text = raw;

        // 1. Extract JSON inside triple backticks if present
        const match = text.match(/```json\s*([\s\S]*?)\s*```/i);
        if (match) text = match[1];

        // 2. Remove control characters
        text = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

        // 3. Remove leading/trailing non-JSON text
        const firstBrace = Math.min(
            ...["{", "["].map(c => text.indexOf(c)).filter(i => i >= 0)
        );
        const lastBrace = Math.max(
            text.lastIndexOf("}"),
            text.lastIndexOf("]")
        );
        text = text.substring(firstBrace, lastBrace + 1);

        // 4. Strip trailing commas inside objects/arrays
        text = text.replace(/,\s*}/g, "}");
        text = text.replace(/,\s*]/g, "]");

        // 5. Replace smart quotes with normal quotes
        text = text
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'");

        // 6. Wrap unquoted keys — extremely common LLM issue
        text = text.replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');

        // 7. Remove comments (// or /* */)
        text = text.replace(/\/\/.*$/gm, "");
        text = text.replace(/\/\*[\s\S]*?\*\//gm, "");

        // 8. Remove undefined or NaN
        text = text.replace(/\bundefined\b/g, 'null');
        text = text.replace(/\bNaN\b/g, 'null');

        // 9. Ensure valid JSON by enforcing correct quotes around strings
        text = text.replace(/:\s*'([^']*)'/g, ':"$1"');

        // Final parse
        return JSON.parse(text);

    } catch (error) {
        console.error("❌ JSON Parse Error:", error, raw);
        throw new Error("Failed to parse AI response as JSON.");
    }
}
