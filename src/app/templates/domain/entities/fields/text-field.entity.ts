import { FieldResponseDto } from "src/app/templates/application/dto/field-response.dto";
import { FieldType } from "../../enums/field-type.enum";
import { FieldData } from "../../interfaces/field.interface";
import { Field } from "./field.entity";

export class TextField extends Field {
    constructor(data: FieldData) {
        super(data, FieldType.TEXT);
    }

    toDto(): FieldResponseDto {
        throw new Error("Method not implemented.");
    }
}