/**
 * Cloudflare Worker - OpenDataBio (INPA) API CORS Reverse Proxy
 *
 * Forwards requests from the browser to opendatabio.inpa.gov.br,
 * injecting CORS headers so GitHub Pages (or any static site) can
 * call the API without being blocked by the browser's same-origin policy.
 *
 * Usage:
 *   GET https://<your-worker>.workers.dev/opendatabio/api/v0/taxons?name=Panthera%20tigris&limit=5
 *   → proxied to https://opendatabio.inpa.gov.br/opendatabio/api/v0/taxons?name=Panthera%20tigris&limit=5
 *
 * Deploy:
 *   1. Go to Cloudflare Dashboard → Workers & Pages → Create Worker
 *   2. Paste this entire file and click Deploy
 *   3. Copy the Worker URL and paste it in the dataFishing OpenDataBio configuration
 */

const OPENDATABIO_ORIGIN = 'https://opendatabio.inpa.gov.br';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
    'Access-Control-Max-Age': '86400',
};

export default {
    async fetch(request, env, ctx) {

        // ── Preflight (OPTIONS) ──────────────────────────────────────
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 200,
                headers: CORS_HEADERS,
            });
        }

        // ── Only GET is allowed ──────────────────────────────────────
        if (request.method !== 'GET') {
            return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            });
        }

        // ── Build target URL ─────────────────────────────────────────
        const url = new URL(request.url);
        const targetUrl = `${OPENDATABIO_ORIGIN}${url.pathname}${url.search}`;

        // ── Forward Authorization header ─────────────────────────────
        const requestHeaders = {
            'Accept': 'application/json',
            'User-Agent': 'dataFishing-OpenDataBio-Proxy/1.0',
        };

        const authHeader = request.headers.get('Authorization');
        if (authHeader) {
            requestHeaders['Authorization'] = authHeader;
        }

        try {
            const apiResponse = await fetch(targetUrl, {
                method: 'GET',
                headers: requestHeaders,
            });

            const body = await apiResponse.text();

            return new Response(body, {
                status: apiResponse.status,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Cache-Control': 'public, max-age=3600',
                    ...CORS_HEADERS,
                },
            });

        } catch (err) {
            return new Response(
                JSON.stringify({ error: 'Proxy error', message: err.message }),
                {
                    status: 502,
                    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
                }
            );
        }
    },
};
