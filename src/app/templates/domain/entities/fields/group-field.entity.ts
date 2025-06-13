import { FieldType } from "../../enums/field-type.enum";
import { Field } from "./field.entity";

export class GroupField extends Field {
    fields: Field[];

    constructor(id: string, title: string, fields: Field[]) {
        super(id, title, FieldType.GROUP);
        this.fields = fields;
    }
}