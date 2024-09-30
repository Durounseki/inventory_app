import prisma from './client.js';

async function createUser(userInfo){

    const user = await prisma.users.create({
        data: {
            name: userInfo["user-name"],
            email: userInfo["user-email"],
            password: userInfo["hashedPassword"],
            signupProvider: userInfo["provider"],
            preferences: {
                create: {}
            }
        }
    })
    console.log('User and preferences added successfully!');
    return user;

}

export {
    createUser
}