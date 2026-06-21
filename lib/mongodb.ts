import { MongoClient } from 'mongodb';

function buildUri(raw: string): string {
  if (!raw.startsWith('mongodb+srv://')) return raw;
  const hosts = [
    'ac-yhglrs0-shard-00-00.9lgoisg.mongodb.net:27017',
    'ac-yhglrs0-shard-00-01.9lgoisg.mongodb.net:27017',
    'ac-yhglrs0-shard-00-02.9lgoisg.mongodb.net:27017',
  ];
  const atIdx = raw.indexOf('@');
  const qIdx = raw.indexOf('?');
  const creds = raw.slice(11, atIdx);
  const query = qIdx !== -1 ? raw.slice(qIdx + 1) : '';
  const params = new URLSearchParams(query);
  if (!params.has('ssl')) params.set('ssl', 'true');
  if (!params.has('replicaSet')) params.set('replicaSet', 'atlas-11gr8t-shard-0');
  if (!params.has('authSource')) params.set('authSource', 'admin');
  params.set('retryWrites', 'true');
  return `mongodb://${creds}@${hosts.join(',')}/research-gate?${params.toString()}`;
}

const rawUri = process.env.MONGODB_URI || '';
const isDev = process.env.NODE_ENV === 'development';
const uri = isDev && rawUri ? buildUri(rawUri) : rawUri;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  clientPromise = client.connect();
}

export default clientPromise;
