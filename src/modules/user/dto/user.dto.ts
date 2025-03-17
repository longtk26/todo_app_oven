import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDTO {
  @IsNotEmpty({ message: 'Please enter name' })
  @IsString({ message: 'Please enter a valid name' })
  name: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Please enter email' })
  email: string;

  @Length(6, 50, {
    message: 'Password length Must be between 6 and 50 charcters',
  })
  password: string;
}

export class SignInDTO {
  @IsEmail()
  @IsNotEmpty({ message: 'Please enter email' })
  email: string;

  @Length(6, 50, {
    message: 'Password length Must be between 6 and 50 charcters',
  })
  password: string;
}
