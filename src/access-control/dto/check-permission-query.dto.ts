import { IsEmail, IsUUID, IsString } from 'class-validator';

export class CheckPermissionQueryDto {
  @IsEmail()
  user_email: string;

  @IsUUID()
  resource_id: string;

  @IsString()
  permission: string;
}
