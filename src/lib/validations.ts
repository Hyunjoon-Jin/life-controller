import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
    password: z.string().min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
    name: z.string().min(2, { message: "이름은 최소 2자 이상이어야 합니다." }),
    phone: z.string().optional(),
});

export const syncDataSchema = z.object({
    data: z.record(z.string(), z.any()).refine(data => Object.keys(data).length > 0, {
        message: "동기화할 데이터가 비어있습니다."
    })
});
