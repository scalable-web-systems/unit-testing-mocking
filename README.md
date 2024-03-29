# Unit Testing, Mocking with Substitute
> **Author -** Ishaan Khurana, [LinkedIn](https://www.linkedin.com/in/ishaan-khurana-46968679/)

## Objective
This tutorial explains mocking and it's utility in writing unit tests. We'll be using [FluffySpoon's Substitute](https://github.com/ffMathy/FluffySpoon.JavaScript.Testing.Faking)
to mock an interface and use it to instantitate a service class.

## Prerequisites
1. You're required to complete [Unit Test Basics](https://github.com/scalable-web-systems/unit-testing-basics) tutorial before starting this one.
2. Prior experience with javascript, typescript and npm is needed in order to succeed in this tutorial.

## What is mocking?
Mocking allows us to create a fake version of a real internal or external service that can be used as a substitute to the actual class. It's widely used in software testing to test a service in isolation without having to create its dependencies which are mocked.

## Code

### Files Structure
In this tutorial, we'll be testing the **LinkedInService** class that exists in the directory with the same name. **LinkedInService**'s constructor requires an object of **UsersRepository** that implements the interface **IUsersRepository** and is responsible for connecting to the database and performing database-related operations. For our purposes, we won't concern ourselves with its implementation. The **LinkedInService** implements three methods:
1. **getConnectionDegree(userId: number)**  - this method returns the connection degree with the user with id 1 and the user with the supplied connection id.
2. **getConnections(userId: number)** - this methods returns a list of users that are connected to the given user
3. **connectTwoPeople(id1: number, id2: number)** - this method connects two users with the given ids

Since we're testing this class and are focusing on the mocking tool **Substitute**, we won't be looking at the actual implementation of this class here.

> LinkedInService.test.ts

```
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
```

Before starting writing our tests, we're defining two arrays to store our users and the joins between two users respsectively. They act as makeshift database tables here. In the beforeAll block, we mock our repository by calling the **for** method of the **Substitute** class with our repository's interface passed in as the generic type -  `_mockUsersRepository = Substitute.for<IUsersRepository>()`. In order to mock the interface's methods, we call them and replace the actual arguments with generic `Args.any('<type>')`. We chain this call with a call to the mimick function that accepts a lambda function, which serves as the implementation of the method. For example, 

```
            _mockUsersRepository.getImmediateConnections(Arg.any('number'))
                .mimicks(id => {
                    const connectionIds = testUserJoins.filter(u => u.id === id)
                    return Promise.resolve(testUsers.filter(u => connectionIds.find(c => c.connectionId === u.id)))
                })
```

After mimicking all the repository methods, we define **describe** blocks for each service method. Note the following code snippet at the beginning of every **describe** block:

```
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
```

This code snippet ensures that all the data is wiped out from the joins and the users arrays, and that 20 random users are pushed to users array, before every test.

The unit tests themselves are wrapped inside of **it** blocks and are pretty straightforward. In you inspect the code in **LinkedInService.ts**, you'd note that the starting user id for the DFS algorithm is hard-coded to 1 as opposed to being extracted from an identity service.

```
    getConnectionDegree = async (connectionId: number): Promise<number> => {
        const userId = 1
        
        // DFS business logic
        const visitedIds = new Set<number>()
        let depth = 0
        const store = new Array<number>();
        store.push(userId)

```

In a real application, the job to get the id of the logged in user is usually outsourced to an external dependency. This task is intentionally left as an exercise for the readers. Try creating a simple class called **IdentityService.ts** that perhaps accepts a JWT token, validates it, and returns a user id. Then, in order to test **LinkedInService.ts**, mock **IdentityService.ts** and supply the mocked class as an argument to the constructor of **LinkedInService.ts** while instantiating it.

## Steps

1. Clone the repository and cd into the project directory.
2. Run `npm install` to install all the related dependencies and then `npm test` to run the unit tests. You should get a similar output:

<img width="908" alt="image" src="https://user-images.githubusercontent.com/7733516/166746000-c4ae0a1a-73b0-4ec5-af5a-6ff84c70d98f.png">

Additionally, the coverage report can be accessed by opening the `coverage/lcov-report/index.html` in a browser. You should see a similar output:

<img width="1438" alt="image" src="https://user-images.githubusercontent.com/7733516/166747292-454b753f-ae08-459e-a872-c40e9b93b670.png">

> index.html

<img width="1309" alt="image" src="https://user-images.githubusercontent.com/7733516/166747435-44628590-e61b-4c79-8ebf-040684ff3f1c.png">

> LinkedInService.ts.html

<img width="811" alt="image" src="https://user-images.githubusercontent.com/7733516/166747476-431a749e-d798-4455-afbc-8a22d86cfe4f.png">

> LinkedInService.ts.html

## Links
1. [Defition of Mocking](https://circleci.com/blog/how-to-test-software-part-i-mocking-stubbing-and-contract-testing/)

## Conclusion
After completing this tutorial, you should able to mock dependencies and write tests for services in isolation.
