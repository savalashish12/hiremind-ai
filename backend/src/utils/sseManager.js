const clients = new Map(); // userId -> res

const addClient = (userId, res) => {
  // One active stream per user: close any stale connection first
  const existing = clients.get(userId);
  if (existing && existing !== res) {
    try { existing.end(); } catch { /* ignore */ }
  }
  clients.set(userId, res);
};

const removeClient = (userId, res) => {
  if (clients.get(userId) === res) {
    clients.delete(userId);
  }
};

const pushToUser = (userId, data) => {
  try {
    const client = clients.get(userId);
    if (client && !client.writableEnded) {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  } catch {
    clients.delete(userId);
  }
};

module.exports = { addClient, removeClient, pushToUser };
