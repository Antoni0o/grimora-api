import { Field } from "./fields/field.entity";

export class Template {
	id: string;
	title: string;
	fields: Field[];

	constructor(id: string, title: string, fields: Field[] = []) {
		this.id = id;
		this.title = title;
		this.fields = fields;
	}
}
