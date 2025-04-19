import { Module } from '@nestjs/common';
import { KeycloakConfigService } from './keycloack-config.service';

@Module({
  providers: [KeycloakConfigService],
  exports: [KeycloakConfigService],
})
export class KeycloakConfigModule {}
