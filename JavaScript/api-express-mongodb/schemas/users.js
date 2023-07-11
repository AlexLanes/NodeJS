export class UserSchema {
    constructor(){
        this.schema = {
            "type": "object",
            "additionalProperties": false,
            "properties": {}
        }
    }

    id(){
        this.schema.properties["_id"] = {
            "type": "string",
            "pattern": "^\\w{24}$"
        }
        return this
    }

    pagination(){
        Object.assign(
            this.schema.properties,
            {
                "limit": {
                    "type": "string",
                    "description": "limite de itens na resposta",
                    "pattern": "^[1-9]\\d*$"
                },
                "skip": {
                    "type": "string",
                    "description": "itens a serem",
                    "pattern": "^[1-9]\\d*$"
                }
            }
        )
        return this
    }
    
    fields( required = false ){
        Object.assign( 
            this.schema.properties,
            {
                "name": {
                    "type": "string",
                    "minLength": 1,
                    "required": required
                },
                "email": {
                    "type": "string",
                    "minLength": 1,
                    "required": required
                },
                "password": {
                    "type": "string",
                    "minLength": 1,
                    "required": required
                }
            }
        )
        return this
    }
    
    build(){
        return this.schema
    }
}