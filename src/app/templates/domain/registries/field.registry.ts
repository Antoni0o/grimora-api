import { Field } from '../entities/fields/field.entity';
import { GroupField } from '../entities/fields/group-field.entity';
import { MultiselectField as MultiSelectField } from '../entities/fields/multiselect-field.entity';
import { NumberField } from '../entities/fields/number-field.entity';
import { SelectField } from '../entities/fields/select-field.entity';
import { TextField } from '../entities/fields/text-field.entity';
import { FieldType } from '../enums/field-type.enum';
import { FieldData } from '../interfaces/field.interface';

export const fieldRegistry = new Map<FieldType, new (data: FieldData) => Field>();

fieldRegistry.set(FieldType.TEXT, TextField);
fieldRegistry.set(FieldType.NUMBER, NumberField);
fieldRegistry.set(FieldType.GROUP, GroupField);
fieldRegistry.set(FieldType.MULTISELECT, MultiSelectField);
fieldRegistry.set(FieldType.SELECT, SelectField);
