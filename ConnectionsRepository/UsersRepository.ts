import { IUsersRepository } from "./IUsersRepository"
import { Connection, createConnection } from "mysql"
import { IUser } from "./IUser";

export class UsersRepository implements IUsersRepository {

    private _con: Connection;
    constructor(connectionString: string) {
        this._con = createConnection(connectionString)
    }

    getImmediateConnections = async (id: number): Promise<IUser[] | undefined> => {
        try {
            return new Promise<IUser[]>((resolve, reject) => {
                this._con.query(`SELECT * FROM joint_users WHERE id = ${id}`, (error, results) => {
                    if (error) {
                        reject(error)
                    }
                    else {
                        resolve(results)
                    }
                })   
            })
        }
        catch (error: any) {
            console.log(error)
            return undefined
        }
    }

    findUser = async (id: number): Promise<IUser | undefined> => {
        try {
            return new Promise<IUser>((resolve, reject) => {
                this._con.query(`SELECT * FROM users WHERE id = ${id}`, (error, results) => {
                    if (error) {
                        reject(error)
                    }
                    else {
                        resolve(results && results.length > 0 ? results[0] : undefined)
                    }
                })   
            })
        }
        catch (error: any) {
            console.log(error)
            return undefined
        }  
    }

    insertIntoJoinsTable = async (id1: number, id2: number): Promise<void> => {
        try {
            await this._con.query(`INSERT INTO joint_users VALUES (${id1}, ${id2})`, (error, results) => {
                if (error) {
                    throw error
                }
            })
            
            await this._con.query(`INSERT INTO joint_users VALUES (${id1}, ${id2})`, (error, results) => {
                if (error) {
                    throw error
                }
            })  
        }
        catch (error: any) {
            console.log(error)
            return
        }   
    }
}