let keyIndex = 0; // This index will rotate through your API keys

/**
 * Retrieves and processes Gemini API keys from environment variables.
 * This function is called inside the main API functions to ensure process.env is fully loaded.
 * @returns {string[]} An array of valid, trimmed API keys.
 * @throws {Error} If no valid API keys are found.
 */
function getProcessedApiKeys() {
  const rawKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    // Add more if you have them, e.g., process.env.GEMINI_API_KEY_4
  ];

  // Filter out undefined/null and trim whitespace
  const processedKeys = rawKeys.map(key => key ? key.trim() : null).filter(Boolean);

  if (processedKeys.length === 0) {
    console.error("CRITICAL ERROR: No valid (non-empty) Gemini API keys found after processing. Please check your .env.local and deployment settings.");
    if (process.env.NODE_ENV !== 'production') {
      console.error("Raw environment variable values found:", rawKeys);
    }
    throw new Error("No Gemini API keys available. Check environment variables.");
  }

  return processedKeys;
}

/**
 * Makes a fetch call with exponential backoff.
 * @param {string} url - The URL to fetch.
 * @param {Object} options - Fetch options (method, headers, body).
 * @param {number} retries - Number of retries.
 * @param {number} delay - Initial delay in milliseconds.
 * @returns {Promise<Response>} - The fetch response.
 * @throws {Error} If all retries fail.
 */
async function fetchWithBackoff(url, options, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      } else if (response.status === 429 || response.status >= 500) {
        // Retry on Too Many Requests (429) or Server Errors (5xx)
        console.warn(`Attempt ${i + 1} failed with status ${response.status}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential increase
      } else {
        // For other client errors (e.g., 400, 401, 403), don't retry, just throw
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      if (i === retries - 1) {
        throw error; // Throw on last retry
      }
      console.warn(`Fetch attempt ${i + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential increase
    }
  }
  throw new Error("Max retries exceeded for API call.");
}


/**
 * Sends a text generation request to the Gemini API using a rotating API key and direct fetch.
 * @param {Array<Object>} contents - The chat history/prompt for the Gemini model.
 * @returns {Promise<Object>} - The Gemini API response.
 * @throws {Error} If all API keys fail.
 */
export async function getGeminiResponse(contents) {
  const KEYS = getProcessedApiKeys();
  let lastError = null;

  for (let i = 0; i < KEYS.length; i++) {
    const apiKey = KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % KEYS.length; // Rotate to the next key for the next call

    // Using gemini-2.5-flash-preview-05-20 for text generation
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
      const response = await fetchWithBackoff(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          generationConfig: { responseMimeType: 'text/plain' },
        }),
      });

      const result = await response.json();
      return result; // Success

    } catch (err) {
      lastError = err;
      const keyPrefix = apiKey ? apiKey.substring(0, 5) + '...' : 'N/A';
      console.warn(`Gemini API error with key ${keyPrefix} for text generation. Trying next key. Error: ${err.message}`);
      continue; // Always try the next key in the rotation
    }
  }

  // If all keys failed, throw the last encountered error
  throw lastError;
}
