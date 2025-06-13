import { FieldType } from "../../enums/field-type.enum";
import { Field } from "./field.entity";

export class KeyValueField extends Field {
    key: string;
    value: string;

    constructor(id: string, title: string, key: string, value: string) {
        super(id, title, FieldType.KEYVALUE);
        this.key = key;
        this.value = value;
    }
}