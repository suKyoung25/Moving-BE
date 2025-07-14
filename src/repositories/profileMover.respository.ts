/**
 * @file profile.repository.ts
 * @description
 * 프로필 관련 유저 데이터를 다루는 repository 모듈
 */

import prisma from "../configs/prisma.config";
import { ErrorMessage } from "../constants/ErrorMessage";
import { NotFoundError } from "../types/errors";
import { createMoverProfile } from "../types/mover/auth/authMover.type";


// //기사님 프로필 생성
// async function createMoverProfile(user: createMoverProfile) {
//     const existedMover = await prisma.mover.findUnique({
//         where: { email: user.email },
//     });

//     if (existedMover) {
//        throw new 
//       };

//       const createdMoverProfile = await prisma.mover.update({
//         where:{email: user.email},
//         data: {
//           image: user.image,
//           nickName: user.nickName,
//           career: user.career,
//           introduction: user.introduction,
//           description: user.description,
//           serviceType: user.serviceType,
//             // region
//         },
//     )
//         return { ...createdMoverProfile, userType: "mover" }; //userType은 FE의 header에서 필요
//     } else {
//       throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
//     }
// }

//기사님 프로필 등록
async function saveMoverProfile(user: createMoverProfile) {
    const existedMover = await prisma.mover.findUnique({
        where: { id: user.userId },
    });

    //회원가입 기사님만 프로필 등록 가능
    if (!existedMover) { 
     throw new NotFoundError(ErrorMessage.USER_NOT_FOUND)
      };

        const createdMoverProfile = await prisma.mover.update({
        where:{email: user.userId},
        data: {
          image: user.image,
          nickName: user.nickName,
          career: user.career,
          introduction: user.introduction,
          description: user.description,
          serviceType: user.serviceType,
            // region
        },
    )
        return { ...createdMoverProfile, userType: "mover" }; //userType은 FE의 header에서 필요
    } else {
      throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
    }
}

export default {
    saveMoverProfile,
};
