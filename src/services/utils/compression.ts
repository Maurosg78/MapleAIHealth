import { gzip, gunzip } from 'zlib';;;;;
import { promisify } from 'util';;;;;

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export async function compress(data: unknown): Promise<Buffer> {
  const stringData = JSON.stringify(data);
  return gzipAsync(Buffer.from(stringData));
}

export async function decompress(data: Buffer): Promise<unknown> {
  const decompressed = await gunzipAsync(data);
  return JSON.parse(decompressed.toString());
} 