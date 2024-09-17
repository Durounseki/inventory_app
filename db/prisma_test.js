const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

async function main(){
    // await prisma.user.deleteMany();
    const user =await prisma.user.findMany({
        where: {
            // name: {not: "Harris"}
            // email: {contains: "test1"}
            userPreference: {
                emailUpdates: true,
            }
        },
        orderBy: {age: "desc"}
    })
    // const users = await prisma.user.createMany({
    //     data: [
    //         {
    //         name: "Harris",
    //         email: "harris@test1.com",
    //         age: 34,
    //         // userPreference: {
    //         //     create: {
    //         //         emailUpdates: true,
    //         //     }
    //         // }
    //     },
    //     {
    //         name: "Chris",
    //         email: "chris@test1.com",
    //         age: 37,
    //     },
    // ],
    //     // select: {
    //     //     name: true,
    //     //     userPreference: {select: {id: true}}
    //     // }
    //     // include: {
    //     //     userPreference: true
    //     // }

    // })
    console.log(user)
}

main().catch(err => {
    console.error(err.message);
}).finally(async() => {
    await prisma.$disconnect();
})