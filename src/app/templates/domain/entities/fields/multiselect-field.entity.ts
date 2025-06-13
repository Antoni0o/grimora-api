import { FieldType } from "../../enums/field-type.enum";
import { Field } from "./field.entity";

export class MultiselectFieldEntity extends Field {
    resourceId: string;

    constructor(id: string, title: string, resourceId: string) {
        super(id, title, FieldType.MULTISELECT);
        this.resourceId = resourceId;
    }
}