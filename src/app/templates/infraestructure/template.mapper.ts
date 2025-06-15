import { Types } from 'mongoose';
import { FieldMongoSchema, TemplateDocument } from './template.schema';
import { Template } from '../domain/entities/template.entity';
import { Field } from '../domain/entities/fields/field.entity';
import { FieldFactory } from '../domain/factories/field.factory';
import { FieldData } from '../domain/interfaces/field.interface';

export class TemplateMapper {
	static templateToDomain(document: TemplateDocument): Template {
		return new Template(
			document._id.toString(),
			document.title,
			document.fields?.map(field => TemplateMapper.fieldToDomain(field)) || [],
		);
	}

	static fieldToDomain(fieldSchema: FieldMongoSchema): Field {
		const fieldData = TemplateMapper.toFieldData(fieldSchema);

		return FieldFactory.create(fieldData);
	}

	static toFieldData(fieldSchema: FieldMongoSchema): FieldData {
		return <FieldData>{
			id: fieldSchema._id.toString(),
			title: fieldSchema.title,
			type: fieldSchema.type,
			fields: fieldSchema.fields ? fieldSchema.fields.map(child => this.toFieldData(child)) : [],
			key: fieldSchema.key,
			value: fieldSchema.value,
			resourceId: fieldSchema.resourceId,
		};
	}

	static toObjectId(id: string): Types.ObjectId {
		return new Types.ObjectId(id);
	}
}
