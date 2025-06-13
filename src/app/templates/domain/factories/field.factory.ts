import { Field } from "../entities/fields/field.entity";
import { GroupField } from "../entities/fields/group-field.entity";
import { FieldData } from "../interfaces/field.interface";
import { fieldRegistry } from "../registries/field.registry";

export class FieldFactory {
    public static create(data: FieldData): Field {
        const fieldClass = fieldRegistry.get(data.type);

        if (!fieldClass) throw new Error(`Field type ${data.type} is not registered.`);

        const fieldInstance = new fieldClass(data);

        if (fieldInstance instanceof GroupField && (data.fields && data.fields.length > 0)) {
            fieldInstance.fields = data.fields.map(childFieldData => {
                return FieldFactory.create(childFieldData);
            })
        }

        return fieldInstance;
    }
}