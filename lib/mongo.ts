import {
  Document,
  Filter,
  MongoClient as OfficialMongoClient,
  ServerApiVersion,
} from "mongodb"

import * as path from "path"
import { dirname } from "path"
import { fileURLToPath } from "url"

export type MongoDocument = { _id: string } & Record<string, unknown>

const __dirname = dirname(fileURLToPath(import.meta.url))
const credentials = path.join(__dirname, "cert.pem")

export async function client(): Promise<MongoClient> {
  const officialClient = new OfficialMongoClient(
    "mongodb+srv://cluster0.y0alfer.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority",
    {
      sslKey: credentials,
      sslCert: credentials,
      serverApi: ServerApiVersion.v1,
      maxPoolSize: 10,
    }
  )
  await officialClient.connect()
  return new MongoClient(officialClient)
}

export class MongoClient {
  constructor(private client: OfficialMongoClient) {}
  public async get(
    db: string,
    collection: string,
    id: string
  ): Promise<MongoDocument | null> {
    const result = await this.client
      .db(db)
      .collection(collection)
      .findOne({ _id: id })
    return result as MongoDocument | null
  }

  public async set(db: string, collection: string, document: MongoDocument) {
    return this.client
      .db(db)
      .collection(collection)
      .replaceOne(
        { _id: document._id },
        Object.fromEntries(
          Object.entries(document).filter(([key]) => key !== "_id")
        ),
        { upsert: true }
      )
  }

  public async select(
    db: string,
    collection: string,
    filter: Filter<Document> = {},
    projection: Document = {}
  ): Promise<MongoDocument[]> {
    return this.client
      .db(db)
      .collection(collection)
      .find(filter, { projection })
      .toArray() as unknown as MongoDocument[]
  }

  public close() {
    this.client.close()
  }
}
