import { MongoClient } from "mongodb"
import dotenv from "dotenv"
dotenv.config()

const USER = process.env.USER,
      PASSWORD = process.env.PASSWORD,
      URL = process.env.URL

export class Connection {
    /**
     * Singleton connection to database
     * @param { string } name Database name
     */
    static async getDatabase(name){
        if( this.client == undefined )
            this.client = await MongoClient.connect(`mongodb+srv://${ USER }:${ PASSWORD }@${ URL }`)

        return this.client.db(name)
    }
}