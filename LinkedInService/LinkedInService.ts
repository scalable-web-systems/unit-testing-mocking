import { IUser } from "ConnectionsRepository/IUser";
import { IUsersRepository } from "../ConnectionsRepository/IUsersRepository";

export class LinkedInService {
    private readonly _usersRepository: IUsersRepository

    constructor(usersRepository: IUsersRepository) {
        this._usersRepository = usersRepository
    }

    getConnectionDegree = async (connectionId: number): Promise<number> => {
        const userId = 1
        
        // DFS business logic
        const visitedIds = new Set<number>()
        let depth = 0
        const store = new Array<number>();
        store.push(userId)

        while (store.length !== 0) {
            const poppedId = store.pop()
            if (poppedId === connectionId) {
                break
            }
            if (!visitedIds.has(poppedId!)) {
                visitedIds.add(poppedId!)
            }
            const neighbors = await this._usersRepository.getImmediateConnections(poppedId!)
            if (!neighbors || neighbors.length === 0)
                continue
            for (const neighbor of neighbors) {
                if (visitedIds.has(neighbor.id)) {
                    continue
                }
                store.push(neighbor.id)
            }
            depth++
        }

        return depth
    }

    getConnections = async (userId: number): Promise<IUser[]> => {
        const connections = await this._usersRepository.getImmediateConnections(userId)
        return connections ?? []
    }

    connectTwoPeople = async (id1: number, id2: number): Promise<void> => {
        try {
            const user1 = await this._usersRepository.findUser(id1)
            const user2 = await this._usersRepository.findUser(id2)
            if (!user1) {
                throw new Error(`User with ID #${id1} not found`)
            }
            if (!user2) {
                throw new Error(`User with ID #${id2} not found`)
            }
            this._usersRepository.insertIntoJoinsTable(id1, id2)
        } catch(error: any) {
            console.log(error.message)
            return
        }
    }
}