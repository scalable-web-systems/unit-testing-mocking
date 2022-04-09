import { IUser } from "./IUser";

export interface IUsersRepository {
    getImmediateConnections(id: number): Promise<IUser[] | undefined>
    findUser(id: number): Promise<IUser | undefined>
    insertIntoJoinsTable(id1: number, id2: number): Promise<void>
}