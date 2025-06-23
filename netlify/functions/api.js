// This API is now deprecated. All data is handled by Supabase directly from the frontend.
exports.handler = async function(event, context) {
  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'API deprecated. Use Supabase directly.' })
  };
}; 