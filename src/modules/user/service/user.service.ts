import { Injectable } from "@nestjs/common";


@Injectable()
export class UserSerivce {
    getUsers(): string {
        return "Success get users";
    }
}