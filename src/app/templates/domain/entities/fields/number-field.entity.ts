import { FieldType } from "../../enums/field-type.enum";
import { Field } from "./field.entity";

export class NumberFieldEntity extends Field {
    constructor(id: string, title: string) {
        super(id, title, FieldType.NUMBER);
    }
}