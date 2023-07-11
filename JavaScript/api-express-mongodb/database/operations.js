import MongoDB from "mongodb"

const DEFAULT_SKIP = 0,
      DEFAULT_LIMIT = 50

/**
 * find by key:value pairs
 * @param { MongoDB.Collection<MongoDB.Document> } collection 
 * @param { MongoDB.Filter<MongoDB.Document> } find 
 * @param { number | string } limit 
 * @param { number | string } skip 
 */
export async function find_simple( collection, find, skip = DEFAULT_SKIP, limit = DEFAULT_LIMIT ){
    return await collection.find(find)
        .skip( parseInt(skip) )
        .limit( parseInt(limit) )
        .toArray()
}

/**
 * find by id
 * @param { MongoDB.Collection<MongoDB.Document> } collection 
 * @param { string } id 
 */
export async function find_id( collection, id ){
    id = new MongoDB.ObjectId(id)
    return await collection.findOne({ _id: id })
}

/**
 * insert one
 * @param { MongoDB.Collection<MongoDB.Document> } collection 
 * @param { Record<string, string> } item 
 */
export async function insert_one( collection, item ){
    return await collection.insertOne(item)
}

/**
 * replace one
 * @param { MongoDB.Collection<MongoDB.Document> } collection 
 * @param { string } id 
 * @param { Record<string, string> } item 
 */
export async function replace_one( collection, id, item ){
    id = new MongoDB.ObjectId(id)
    return await collection.replaceOne({ _id: id }, item)
}

/**
 * update one
 * @param { MongoDB.Collection<MongoDB.Document> } collection 
 * @param { string } id 
 * @param { Record<string, string> } item 
 */
export async function update_one( collection, id, item ){
    id = new MongoDB.ObjectId(id)
    return await collection.updateOne(
        { _id: id }, 
        { $set: {...item} }
    )
}
/**
 * delete one
 * @param { MongoDB.Collection<MongoDB.Document> } collection 
 * @param { string } id 
 */
export async function delete_one( collection, id ){
    id = new MongoDB.ObjectId(id)
    return await collection.deleteOne({ _id: id })
}