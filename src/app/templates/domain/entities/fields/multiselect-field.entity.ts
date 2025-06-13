import { FieldType } from "../../enums/field-type.enum";
import { FieldData } from "../../interfaces/field.interface";
import { Field } from "./field.entity";

export class MultiselectField extends Field {
    resourceId: string;

    constructor(data: FieldData) {
        super(data, FieldType.MULTISELECT);
        this.resourceId = data.resourceId || '';
    }
}