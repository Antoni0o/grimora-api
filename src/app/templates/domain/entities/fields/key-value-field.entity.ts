import { FieldResponseDto } from "src/app/templates/application/dto/field-response.dto";
import { FieldType } from "../../enums/field-type.enum";
import { FieldData } from "../../interfaces/field.interface";
import { Field } from "./field.entity";

export class KeyValueField extends Field {
    key: string;
    value: string;

    constructor(data: FieldData) {
        super(data, FieldType.KEYVALUE);
        this.key = data.key || '';
        this.value = data.value || '';
    }

    toDto(): FieldResponseDto {
        throw new Error("Method not implemented.");
    }
}