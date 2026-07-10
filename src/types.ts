export interface Instrument {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  createdAt: number;
}

export interface CalibrationRecord {
  id: string;
  instrumentId: string;
  year: number;
  
  // Positive / Full Range (正溫/全段)
  reportNumber: string;
  interceptPos: number;
  x1Pos: number;
  x2Pos: number;

  // Negative Range (負溫)
  reportNumberNeg: string;
  interceptNeg: number;
  x1Neg: number;
  x2Neg: number;

  // ITS-90 Parameters
  r0: number;
  a: number;
  b: number;
  c: number;

  // Old fields for backward compatibility
  slope?: number;
  offset?: number;
  reportNumber2?: string;

  createdAt: number;
}
