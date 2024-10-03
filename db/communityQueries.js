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

async function storeVerificationToken(userId,token,expiresAt){
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

async function verifyToken(token){
    try{
        const verifiedToken = await prisma.verificationToken.findUnique({where: {token: token}});
        if(!verifiedToken){
            throw new Error('Invalid verification link')
        }
        const currentTime = new Date();
        if(verifiedToken.expiresAt < currentTime){
            throw new Error('Verification link expired')
        }
        console.log("Token verified");
        return verifiedToken;
    }catch(error){
        console.error('Error verifying token: ', error);
        if(error.message === 'Invalid verification link' || error.message === 'Verification link expired'){
            throw error;
        }else{
            throw new Error('Failed to verify token')
        }
    }
}

async function verifyUser(token){
    try{
        const verifiedUser = await prisma.users.findUnique({
            where: {id: token.userId}
        });

        if(!verifiedUser){
            throw new Error('User not found');
        }

        await prisma.users.update({
            where: { id: verifiedUser.id },
            data: {
                verified: true,
                updatedAt: new Date(),
                lastLogin: new Date()
            }
        });

        console.log("user verified");
        return verifiedUser;
    }catch(error){
        throw error;
    }
}

async function removeVerificationToken(userId){
    
    const storedToken = await prisma.verificationToken.findUnique({where: {userId: userId}});
    if(storedToken){
        await prisma.verificationToken.delete({where: {userId: userId}})
        console.log("Token removed");
    }    
    return true;
    
}

export {
    createUser, storeVerificationToken, verifyToken, verifyUser, removeVerificationToken
}