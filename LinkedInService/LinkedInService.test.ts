import { IUsersRepository } from "../ConnectionsRepository/IUsersRepository"
import { Substitute, Arg, SubstituteOf } from '@fluffy-spoon/substitute'
import { IUser } from "../ConnectionsRepository/IUser"
import { faker } from "@faker-js/faker"
import { LinkedInService } from "./LinkedInService"

    interface IUserJoins {
        id: number
        connectionId: number
    }

    let testUsers: IUser[] = []

    let testUserJoins: IUserJoins[] = []

    let _mockUsersRepository: SubstituteOf<IUsersRepository>
    let _testLinkedInService: LinkedInService

    describe('LinkedIn Service', () => {

        beforeAll(() => {
            _mockUsersRepository = Substitute.for<IUsersRepository>()

            _mockUsersRepository.getImmediateConnections(Arg.any('number'))
                .mimicks(id => {
                    const connectionIds = testUserJoins.filter(u => u.id === id)
                    return Promise.resolve(testUsers.filter(u => connectionIds.find(c => c.connectionId === u.id)))
                })

            _mockUsersRepository.findUser(Arg.any('number'))
                .mimicks(id => Promise.resolve(testUsers.find(u => u.id === id)))

            _mockUsersRepository.insertIntoJoinsTable(Arg.any('number'), Arg.any('number'))
            .mimicks((id1: number, id2: number) => {
                if (!testUserJoins.find(r => r.id === id1 && r.connectionId === id2)) {
                    testUserJoins.push({
                        id: id1,
                        connectionId: id2
                    })
                }
                if (!testUserJoins.find(r => r.id === id2 && r.connectionId === id1)) {
                    testUserJoins.push({
                        id: id2,
                        connectionId: id1
                    })
                }
                return Promise.resolve()
            })

            _testLinkedInService = new LinkedInService(_mockUsersRepository)
        })

        describe('getConnections(userId: number) returns the list of people that are connected to the user with the supplied id', () => {

            beforeEach(() => {
                testUserJoins = []
                testUsers = []
                for (let i=0; i<20; ++i) {
                    testUsers.push({
                        id: i,
                        name: faker.name.findName()
                    })
                }
            })

            it('returns an empty list for all the users since they are not connected to each other', async () => {
                for (let i=0; i<20; ++i) {
                    const connections = await _testLinkedInService.getConnections(i)
                    expect(0).toEqual(connections.length)
                }
            })

            it('returns a list consisting of users 2 and 3 since they are connected to users 1', async () => {
                testUserJoins.push({id: 1, connectionId: 2}, {id: 1, connectionId: 3})
                const connections = await _testLinkedInService.getConnections(1)
                expect(2).toEqual(connections.length)
            })
        })

        describe('getConnectionDegree', () => {
            describe('returns the connection degree between two users', () => {
                
                beforeEach(() => {
                    testUserJoins = []
                    testUsers = []
                    for (let i=0; i<20; ++i) {
                        testUsers.push({
                            id: i,
                            name: faker.name.findName()
                        })
                    }
                })

                it('returns 0 since no connections exist yet', async () => {
                    const actualDegree = await _testLinkedInService.getConnectionDegree(6)
                    expect(0).toEqual(actualDegree)
                })

                it('make users 1 and 3 a second degree connection', async () => {
                    await _testLinkedInService.connectTwoPeople(1, 2)
                    await _testLinkedInService.connectTwoPeople(2, 3)
                    const actualDegree = await _testLinkedInService.getConnectionDegree(3)
                    expect(2).toEqual(actualDegree)
                })
            })
        })
    })


