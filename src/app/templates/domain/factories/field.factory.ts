import { Field } from "../entities/fields/field.entity";
import { FieldData } from "../interfaces/field.interface";
import { fieldRegistry } from "../registries/field.registry";

export class FieldFactory {
    public static create(data: FieldData): Field {
        const fieldClass = fieldRegistry.get(data.type);

        if (!fieldClass) throw new Error(`Field type ${data.type} is not registered.`);

        return new fieldClass(data);
    }
}