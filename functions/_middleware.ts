// functions/_middleware.ts

// Define the CORS headers
const allowedOrigins = [
  'https://translator-478.pages.dev', // Production
  'http://localhost:8788' // Development
];

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

// Handle OPTIONS preflight requests
export const onRequestOptions: PagesFunction = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
};

// Main middleware to process requests
export const onRequest: PagesFunction = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  
  // Proceed with the next function in the chain
  const response = await context.next();

  // Add CORS headers to the response
  Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};