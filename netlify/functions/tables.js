// This function is deprecated. Fetch tables directly from Supabase in the frontend.
exports.handler = async function(event, context) {
  return {
    statusCode: 410,
    body: JSON.stringify({ message: 'Deprecated. Fetch tables from Supabase.' })
  };
}; 