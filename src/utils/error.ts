export enum ErrorMessage {
  InvalidCredentials = 'InvalidCredentials',
  UserAlreadyExists = 'UserAlreadyExists',
  SecretsNotFound = 'SecretsNotFound',
  InvalidResetToken = 'InvalidResetToken',
  InvalidVerificationToken = 'InvalidVerificationToken',
  EmailAlreadyVerified = 'EmailAlreadyVerified',
  TwoFactorNotEnabled = 'TwoFactorNotEnabled',
  TwoFactorAlreadyEnabled = 'TwoFactorAlreadyEnabled',
  InvalidTwoFactorCode = 'InvalidTwoFactorCode',
  InvalidTwoFactorBackupCode = 'InvalidTwoFactorBackupCode',
  InvalidBrowserConnection = 'InvalidBrowserConnection',
  SomethingWentWrong = 'SomethingWentWrong',
}
