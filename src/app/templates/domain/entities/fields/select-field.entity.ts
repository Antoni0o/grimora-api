import { FieldType } from "../../enums/field-type.enum";
import { Field } from "./field.entity";

export class SelectField extends Field {
    resourceId: string;

    constructor(id: string, title: string, resourceId: string) {
        super(id, title, FieldType.SELECT);
        this.resourceId = resourceId;
    }
}