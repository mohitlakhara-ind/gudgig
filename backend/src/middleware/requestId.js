import { randomUUID } from 'crypto';

export const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || randomUUID();
  req.id = String(id);
  res.setHeader('X-Request-ID', req.id);
  next();
};

export default requestId;
