import { FieldType } from "../../enums/field-type.enum";
import { FieldData } from "../../interfaces/field.interface";

export class Field {
    id: string;
    title: string;
    type: FieldType;

    constructor(data: FieldData, type: FieldType) {
        this.id = data.id;
        this.title = data.title;
        this.type = type;
    }
}