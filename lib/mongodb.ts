import { MongoClient } from 'mongodb';

const hosts = [
  'ac-yhglrs0-shard-00-00.9lgoisg.mongodb.net:27017',
  'ac-yhglrs0-shard-00-01.9lgoisg.mongodb.net:27017',
  'ac-yhglrs0-shard-00-02.9lgoisg.mongodb.net:27017',
];

const directUri = `mongodb://liando1801_db_user:YdzxjpXvhUhHGAlO@${hosts.join(',')}/research-gate?ssl=true&replicaSet=atlas-11gr8t-shard-0&authSource=admin&retryWrites=true&w=majority`;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(directUri, { serverSelectionTimeoutMS: 15000 });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(directUri, { serverSelectionTimeoutMS: 15000 });
  clientPromise = client.connect();
}

export default clientPromise;
