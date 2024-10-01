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

async function createVerificationToken(userId,token,expiresAt){
    const storedToken = await prisma.verificationToken.create({
        data:{
            token: token,
            expiresAt: expiresAt,
            user: {connect: {id: userId}}
        }
    });

    console.log('Verification token created and linked to user!');
    return storedToken;
}

export {
    createUser, createVerificationToken
}