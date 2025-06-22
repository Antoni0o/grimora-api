import { FieldResponseDto } from "src/app/templates/application/dto/field-response.dto";
import { FieldType } from "../../enums/field-type.enum";
import { FieldData } from "../../interfaces/field.interface";
import { Field } from "./field.entity";

export class NumberField extends Field {
    constructor(data: FieldData) {
        super(data, FieldType.NUMBER);
    }

    toDto(): FieldResponseDto {
        throw new Error("Method not implemented.");
    }
}