import { FieldType } from "../../enums/field-type.enum";
import { Field } from "./field.entity";

export class TextField extends Field {
    constructor(id: string, title: string) {
        super(id, title, FieldType.TEXT);
    }
}