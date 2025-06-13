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
}