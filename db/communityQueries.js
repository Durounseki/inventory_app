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

async function findUserByEmail(email){
    const user = await prisma.users.findUnique({where: {email: email}});
    console.log('Found user');
    return user;
}

async function findUserById(userId){
    const user = await prisma.users.findUnique({where: {id: userId}});
    console.log('Found user');
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

async function removeVerificationToken(userId){
    
    const storedToken = await prisma.verificationToken.findUnique({where: {userId: userId}});
    if(storedToken){
        await prisma.verificationToken.delete({where: {userId: userId}})
        console.log("Token removed");
    }    
    return true;

}

async function validateVerificationToken(tokenId){
    try{
        const validatedToken = await prisma.verificationToken.findUnique({where: {id: tokenId}});
        if(!validatedToken){
            throw new Error('Invalid verification link')
        }
        const currentTime = new Date();
        if(validatedToken.expiresAt < currentTime){
            throw new Error('Verification link expired')
        }
        console.log("Token validated");
        return validatedToken;
    }catch(error){
        console.error('Error validating token: ', error);
        if(error.message === 'Invalid verification link' || error.message === 'Verification link expired'){
            throw error;
        }else{
            throw new Error('Failed to validate token')
        }
    }
}

async function verifyUser(userId){
    try{
        const verifiedUser = await prisma.users.findUnique({
            where: {id: userId}
        });

        if(!verifiedUser){
            throw new Error('User not found');
        }

        const now = new Date();
        await prisma.users.update({
            where: { id: verifiedUser.id },
            data: {
                verified: true,
                updatedAt: now,
                lastLogin: now,
                loginCount: {increment: 1}
            }
        });

        console.log("user verified");
        return verifiedUser;
    }catch(error){
        throw error;
    }
}

async function storeResetToken(userId,token,expiresAt){
    const storedToken = await prisma.resetToken.create({
        data:{
            token: token,
            expiresAt: expiresAt,
            user: {connect: {id: userId}}
        }
    });

    console.log('Reset token created and linked to user!');
    return storedToken;
}

async function removeResetToken(userId){
    
    const storedToken = await prisma.resetToken.findUnique({where: {userId: userId}});
    if(storedToken){
        await prisma.resetToken.delete({where: {userId: userId}})
        console.log("Token removed");
    }    
    return true;

}

async function validateResetToken(tokenId){
    try{
        const validatedToken = await prisma.resetToken.findUnique({where: {id: tokenId}});
        if(!validatedToken){
            throw new Error('Invalid reset link')
        }
        const currentTime = new Date();
        if(validatedToken.expiresAt < currentTime){
            throw new Error('Reset link expired')
        }
        console.log("Token validated");
        return validatedToken;
    }catch(error){
        console.error('Error validating token: ', error);
        if(error.message === 'Invalid reset link' || error.message === 'Reset link expired'){
            throw error;
        }else{
            throw new Error('Failed to validate token')
        }
    }
}

async function resetPassword(userId, hashedPassword){
    try{

        const user = await prisma.users.findUnique({
            where: {id: userId}
        });

        if(!user){
            throw new Error('User not found');
        }

        await prisma.users.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordUpdatedAt: new Date()
            }
        });

        console.log("New password stored");
        return true;
    }catch(error){
        throw error;
    }
}


async function updateLastLogin(userId){
    
    const now = new Date();
    await prisma.users.update({
        where: {id: userId},
        data: {
            lastLogin: now,
            loginCount: {increment: 1},
            updatedAt: now
        }
    });
    
    console.log("user updated");
    return true;
}

export {
    createUser,
    findUserByEmail,
    storeVerificationToken,
    validateVerificationToken,
    verifyUser,
    removeVerificationToken,
    storeResetToken,
    validateResetToken,
    resetPassword,
    removeResetToken,
    updateLastLogin
}