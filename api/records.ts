import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || '';
const redis = redisUrl ? new Redis(redisUrl) : null;

const DEFAULT_RECORDS = [
  {
    id: 'rec-1',
    instrumentId: 'inst-1',
    year: 2026,
    reportNumber: 'CAL-2026-001',
    interceptPos: 0,
    x1Pos: 1,
    x2Pos: 0,
    reportNumberNeg: '',
    interceptNeg: 0,
    x1Neg: 1,
    x2Neg: 0,
    r0: 100.000,
    a: 3.9083e-3,
    b: -5.775e-7,
    c: -4.183e-12,
    createdAt: 1710000000000,
  },
  {
    id: 'rec-2',
    instrumentId: 'inst-1',
    year: 2025,
    reportNumber: 'CAL-2025-088',
    interceptPos: 0.0150,
    x1Pos: 0.9998,
    x2Pos: 0,
    reportNumberNeg: 'CAL-2025-088-NEG',
    interceptNeg: 0.02,
    x1Neg: 0.9995,
    x2Neg: 0,
    r0: 99.998,
    a: 3.9083e-3,
    b: -5.775e-7,
    c: -4.183e-12,
    createdAt: 1710000000000 - 31536000000,
  },
  {
    id: 'rec-3',
    instrumentId: 'inst-2',
    year: 2026,
    reportNumber: 'NML-2026-SPRT',
    interceptPos: 0,
    x1Pos: 1,
    x2Pos: 0,
    reportNumberNeg: '',
    interceptNeg: 0,
    x1Neg: 1,
    x2Neg: 0,
    r0: 25.5012,
    a: 3.9083e-3,
    b: -5.775e-7,
    c: -4.183e-12,
    createdAt: 1710000000000,
  }
];

export default async function handler(req: any, res: any) {
  try {
    const { method } = req;

    if (!redis) {
      return res.status(500).json({ error: 'REDIS_URL environment variable is missing' });
    }

    if (method === 'GET') {
      const dataStr = await redis.get('prt_records');
      const data = dataStr ? JSON.parse(dataStr) : null;
      return res.status(200).json(data || DEFAULT_RECORDS);
    }

    if (method === 'POST') {
      const newRec = req.body;
      if (!newRec || !newRec.id) {
        return res.status(400).json({ error: 'Invalid data' });
      }
      const dataStr = await redis.get('prt_records');
      const data = dataStr ? JSON.parse(dataStr) : DEFAULT_RECORDS;
      const updated = [...data, newRec];
      await redis.set('prt_records', JSON.stringify(updated));
      return res.status(200).json({ success: true });
    }

    if (method === 'PUT') {
      const updatedRec = req.body;
      if (!updatedRec || !updatedRec.id) {
        return res.status(400).json({ error: 'Invalid data' });
      }
      const dataStr = await redis.get('prt_records');
      const data = dataStr ? JSON.parse(dataStr) : DEFAULT_RECORDS;
      const updated = data.map((r: any) => r.id === updatedRec.id ? updatedRec : r);
      await redis.set('prt_records', JSON.stringify(updated));
      return res.status(200).json({ success: true });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing id query parameter' });
      }
      const dataStr = await redis.get('prt_records');
      const data = dataStr ? JSON.parse(dataStr) : DEFAULT_RECORDS;
      const updated = data.filter((r: any) => r.id !== id);
      await redis.set('prt_records', JSON.stringify(updated));
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
