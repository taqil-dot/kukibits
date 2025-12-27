// api/upload.js untuk Vercel
// Tidak perlu install library tambahan, pakai fetch bawaan Node
export const config = {
    api: {
        bodyParser: false, // Kita matikan ini biar bisa terima file upload raw
    },
};

export default async function handler(req, res) {
    // Setup CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // URL N8N Webhook Anda
        const WEBHOOK_URL = 'https://n8n.kodekalabs.com/webhook/d1b5552a-714a-4908-b9c2-0015e14a3b4c';

        // Meneruskan request body (stream) langsung ke N8N
        // Kita ambil semua headers dari request asli (content-type, boundary, dll)
        const headers = { ...req.headers };
        delete headers.host; // Hapus header host asli agar tidak conflict

        const n8nResponse = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: headers,
            body: req, // Stream langsung body dari browser ke N8N
            duplex: 'half' // Diperlukan untuk node fetch streaming
        });

        const data = await n8nResponse.text();

        if (n8nResponse.ok) {
            return res.status(200).json({ status: 'success', data: tryParseJSON(data) });
        } else {
            return res.status(n8nResponse.status).json({ status: 'error', message: 'N8N Error', detail: data });
        }

    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
}

function tryParseJSON(str) {
    try { return JSON.parse(str); } catch (e) { return str; }

}
