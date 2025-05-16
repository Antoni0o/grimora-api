import { Injectable } from '@nestjs/common';
import CreateFieldRequest from '../../models/create-field.request';
import { Types } from 'mongoose';
import CreateFieldResponse from '../../models/create-field.response';
import CreateFieldDto from '../../dtos/create-field.dto';

@Injectable()
export default class CreateFieldMapper {
  public mapDtoToRequest(dto: CreateFieldDto, fieldTypeId: Types.ObjectId): CreateFieldRequest {
    const fieldId = new Types.ObjectId();

    return new CreateFieldRequest(
      fieldId,
      dto.name,
      fieldTypeId,
      dto.required,
      dto.readonly,
      dto.description,
      dto.value,
      [],
      dto.config,
    );
  }

  public mapRequestToResponse(request: CreateFieldRequest): CreateFieldResponse {
    return new CreateFieldResponse(
      request._id.toString(),
      request.name,
      request.childrenIds?.map(id => id.toString()) ?? [],
    );
  }
}
