"use strict"

import sql from './connection.js'

export async function createUser(id, username, password, accessToken) {
    try {
      return await sql`
        INSERT INTO users 
        VALUES (${id}, ${username}, ${password}, ${accessToken})
      `
    } catch(e) {
      console.error(`##### Database createUser resulted in error: ${e} #####`)
      throw(e)
    }
}

export async function getUserName(username) {
    try {
      return await sql`
        SELECT * 
        FROM users 
        WHERE LOWER(username) = LOWER(${username})
      `
    } catch(e) {
      console.error(`##### Database getUserName resulted in error: ${e} #####`)
      throw(e)
    }
}

export async function getUserID(id) {
    try {
      return await sql`
        SELECT * 
        FROM users 
        WHERE id = ${id}
      `
    } catch(e) {
      console.error(`##### Database getUserID resulted in error: ${e} #####`)
      throw(e)
    }
}

export async function updateUser(id, accesstoken) {
    try {
      return await sql`
        UPDATE users 
        SET accesstoken = ${accesstoken}
        WHERE id = ${id}
      `
    } catch(e) {
      console.error(`##### Database updateUser resulted in error: ${e} #####`)
      throw(e)
    }
}

export async function createSafe(fk_user, id, description, username, password) {
    try {
      return await sql`
        INSERT INTO safe 
        VALUES (${fk_user}, ${id}, ${description}, ${username},  ${password})
      `
    } catch(e) {
      console.error(`##### Database createSafe resulted in error: ${e} #####`)
      throw(e)
    }
}

export async function getUserSafe(user_id) {
    try {
      return await sql`
        SELECT id, description
        FROM safe 
        WHERE fk_user = ${user_id}
      `
    } catch(e) {
      console.error(`##### Database getSafe resulted in error: ${e} #####`)
      throw(e)
    }
}

export async function getSafeID(id) {
    try {
      return await sql`
        SELECT *
        FROM safe 
        WHERE id = ${id}
      `
    } catch(e) {
      console.error(`##### Database getSafe resulted in error: ${e} #####`)
      throw(e)
    }
}

export async function patchSafe(id, description, username, password) {
    try {
      return await sql`
        UPDATE safe
        SET
          description = ${description},
          username    = ${username}   ,
          password    = ${password}
        WHERE id = ${id}
      `
    } catch(e) {
      console.error(`##### Database getSafe resulted in error: ${e} #####`)
      throw(e)
    }
}

export async function deleteSafe(id) {
    try {
      return await sql`
        DELETE FROM safe
        WHERE id = ${id}
      `
    } catch(e) {
      console.error(`##### Database deleteSafe resulted in error: ${e} #####`)
      throw(e)
    }
}