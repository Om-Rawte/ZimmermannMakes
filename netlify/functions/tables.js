exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify([
      { id: 1, name: "Table 1", capacity: 4, available: true },
      { id: 2, name: "Table 2", capacity: 2, available: false },
      { id: 3, name: "Table 3", capacity: 6, available: true }
    ])
  };
}; 