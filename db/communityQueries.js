import prisma from './client.js';

async function createUser(userInfo){
    //Use a transaction to ensure user and preferences are both created
    try{
        const user = await prisma.$transaction(async (tx) => {

            const user = await tx.users.create({
                data: {
                    name: userInfo["user-name"],
                    email: userInfo["user-email"],
                    password: userInfo["hashedPassword"],
                    signupProvider: userInfo["provider"],
                    preferences: {
                        create: {}
                    }
                }
            });
            console.log('User and preferences added successfully!');
            return user;
        });
        return user;
    }catch(error){
        console.log('Error creating user', error);
        throw error;
    }

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
    try{
        const storedToken = await prisma.verificationToken.create({
            data:{
                token: token,
                expiresAt: expiresAt,
                user: {connect: {id: userId}}
            }
        });

        console.log('Verification token created and linked to user!');
        return storedToken;
    }catch(error){
        console.log('Error storing token: ', error);
        throw error;
    }
}

async function findVerificationToken(userId){
    const token = prisma.verificationToken.findUnique({
        where: {userId: userId}
    })
    return token;
}

async function removeVerificationToken(tokenId){
    //Use a transaction to ensure that if one of the queries fails, not data is retrieved or modified
    try{
        const tokenRemoved = await prisma.$transaction(async (tx) => {

            const storedToken = await tx.verificationToken.findUnique({
                where: {id: tokenId}
            });
            if(storedToken){
                await tx.verificationToken.delete({
                    where: {id: tokenId}
                });
                console.log("Token removed");
            }    
            return true;
        });
        return tokenRemoved;
    }catch(error){
        console.log('Error removing verification token: ', error);
        throw error;
    }

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
        const verifiedUser = await prisma.$transaction(async (tx) => {
            
            const user = await tx.users.findUnique({
                where: {id: userId}
            });
    
            if(!user){
                throw new Error('User not found');
            }
    
            const now = new Date();
            await tx.users.update({
                where: { id: user.id },
                data: {
                    verified: true,
                    updatedAt: now,
                }
            });
    
            console.log("user verified");
            return user;
        });

        return verifiedUser;
        
    }catch(error){
        console.log('Error verifying user: ', error);
        throw error;
    }
}

async function storeResetToken(userId,token,expiresAt){
    try{

        const storedToken = await prisma.resetToken.create({
            data:{
                token: token,
                expiresAt: expiresAt,
                user: {connect: {id: userId}}
            }
        });
        
        console.log('Reset token created and linked to user!');
        return storedToken;
    }catch(error){
        console.log('Error storing token: ', error);
        throw error;
    }
}

async function findResetToken(userId){
    const token = prisma.resetToken.findUnique({
        where: {userId: userId}
    })
    return token;
}

async function removeResetToken(tokenId){
    
    try{

        const tokenRemoved = prisma.$transaction(async (tx) => {
            
            const storedToken = await tx.resetToken.findUnique({where: {id: tokenId}});
            if(storedToken){
                await tx.resetToken.delete({where: {id: tokenId}})
                console.log("Token removed");
            }
            return true;
            
        });
        
        return tokenRemoved;
    }catch(error){
        console.log('Error removing token: ', error);
        throw error;
    }

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

async function resetPassword(tokenId, hashedPassword){
    
    try{
        const passwordReset = prisma.$transaction(async (tx) => {

            const user = await tx.resetToken.findUnique({
                where: {id: tokenId},
                include: {user: true}
            }).then(resetToken => resetToken?.user);
    
            if(!user){
                throw new Error('User not found');
            }
    
            const now = new Date();
            await tx.users.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    passwordUpdatedAt: now,
                    updatedAt: now
                }
            });
    
            console.log("New password stored");
            return true;

        });

        return passwordReset;

    }catch(error){
        console.log('Error resetting password: ', error);
        throw error;
    }
}


async function updateLastLogin(userId){
    
    try{

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
    }catch(error){
        console.log('Error updating user: ', error);
        throw error;
    }
}

export {
    createUser,
    findUserByEmail,
    storeVerificationToken,
    findVerificationToken,
    validateVerificationToken,
    verifyUser,
    removeVerificationToken,
    storeResetToken,
    findResetToken,
    validateResetToken,
    resetPassword,
    removeResetToken,
    updateLastLogin
}