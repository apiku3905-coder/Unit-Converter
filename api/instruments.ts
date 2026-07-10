import { kv } from '@vercel/kv';

const DEFAULT_INSTRUMENTS = [
  {
    id: 'inst-1',
    name: '標準白金電阻溫度計 (Pt100)',
    model: 'Fluke 5609',
    serialNumber: 'SN-98765',
    createdAt: 1710000000000,
  },
  {
    id: 'inst-2',
    name: '一級標準白金電阻溫度計 (Pt25)',
    model: 'Fluke 5699',
    serialNumber: 'SN-SPRT-001',
    createdAt: 1710000000000,
  }
];

export default async function handler(req: any, res: any) {
  try {
    const { method } = req;

    if (method === 'GET') {
      const data = await kv.get('prt_instruments');
      return res.status(200).json(data || DEFAULT_INSTRUMENTS);
    } 
    
    if (method === 'POST') {
      const newInst = req.body;
      if (!newInst || !newInst.id) {
        return res.status(400).json({ error: 'Invalid data' });
      }
      const data: any = await kv.get('prt_instruments') || DEFAULT_INSTRUMENTS;
      const updated = [...data, newInst];
      await kv.set('prt_instruments', updated);
      return res.status(200).json({ success: true });
    }

    if (method === 'PUT') {
      const updatedInst = req.body;
      if (!updatedInst || !updatedInst.id) {
        return res.status(400).json({ error: 'Invalid data' });
      }
      const data: any = await kv.get('prt_instruments') || DEFAULT_INSTRUMENTS;
      const updated = data.map((i: any) => i.id === updatedInst.id ? updatedInst : i);
      await kv.set('prt_instruments', updated);
      return res.status(200).json({ success: true });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing id query parameter' });
      }
      // Delete instrument
      const data: any = await kv.get('prt_instruments') || DEFAULT_INSTRUMENTS;
      const updated = data.filter((i: any) => i.id !== id);
      await kv.set('prt_instruments', updated);

      // Cascade delete calibration records
      const recordsData: any = await kv.get('prt_records');
      if (recordsData) {
        const updatedRecords = recordsData.filter((r: any) => r.instrumentId !== id);
        await kv.set('prt_records', updatedRecords);
      }

      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
