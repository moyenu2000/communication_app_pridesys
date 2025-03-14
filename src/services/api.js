// Base API configuration
const API_BASE = 'https://traq.duckdns.org/api/v3';


export const api = {
    get: (path) => fetch(`${API_BASE}${path}`, { credentials: 'include' }).then(handleResponse),

    post: (path, body) =>
        fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            // credentials: 'include'
        }).then(handleResponse),

    put: (path, body) =>
        fetch(`${API_BASE}${path}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'include'
        }).then(handleResponse),

    delete: (path) =>
        fetch(`${API_BASE}${path}`, {
            method: 'DELETE',
            credentials: 'include'
        }).then(handleResponse)
};


export const handleResponse = async (response) => {

    if (response.status === 204) {
        return null;
    }

    // Get content type from response
    const contentType = response.headers.get('content-type') || '';

    // Handle JSON responses
    if (contentType.includes('application/json')) {
        const data = await response.json();

        if (!response.ok) {
            const error = {
                status: response.status,
                message: data.message || 'An error occurred',
                validationErrors: data.errors || null,
            };
            throw error;
        }

        return data;
    }

    // Handle text responses
    if (contentType.includes('text/plain')) {
        const text = await response.text();

        if (!response.ok) {
            throw new Error(text || 'Request failed');
        }

        return text;
    }

    // Handle unexpected content types
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    // For successful responses with unknown content type
    return response.blob();
};