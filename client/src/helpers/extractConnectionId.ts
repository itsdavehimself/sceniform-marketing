export const extractConnectionId = (obj: any): number | null => {
  if (!obj || typeof obj !== "object" || obj.id === undefined) return null;

  let connId = obj.account || obj.connection;

  if (!connId && obj.parameters) {
    const connKey = Object.keys(obj.parameters).find((k) =>
      k.startsWith("__IMTCONN__"),
    );
    if (connKey) connId = obj.parameters[connKey];
  }

  return connId ? Number(connId) : null;
};
