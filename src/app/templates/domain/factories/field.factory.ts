import { Field } from "../entities/fields/field.entity";
import { GroupField } from "../entities/fields/group-field.entity";
import { FieldData } from "../interfaces/field.interface";
import { fieldRegistry } from "../registries/field.registry";

export class FieldFactory {
    public static create(data: FieldData): Field {
        const fieldClass = fieldRegistry.get(data.type);

        if (!fieldClass) throw new Error(`Field type ${data.type} is not registered.`);

        const fieldInstance = new fieldClass(data);

        FieldFactory.createGroupChilds(fieldInstance, data);

        return fieldInstance;
    }

    private static createGroupChilds(fieldInstance: Field, data: FieldData) {
        if (FieldFactory.isGroupField(fieldInstance) && FieldFactory.hasChildFields(data)) {
            fieldInstance.fields = data.fields!.map(childFieldData => {
                return FieldFactory.create(childFieldData);
            });
        }
    }

    private static isGroupField(fieldInstance: Field) {
        return fieldInstance instanceof GroupField;
    }

    private static hasChildFields(data: FieldData) {
        return data.fields && data.fields.length > 0;
    }
}