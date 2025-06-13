import { FieldType } from "../../enums/field-type.enum";

export class Field {
    id: string;
    title: string;
    type: FieldType;

    constructor(id: string, title: string, type: FieldType) {
        this.id = id;
        this.title = title;
        this.type = type;
    }
}