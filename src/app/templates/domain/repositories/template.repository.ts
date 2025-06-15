import { Template } from "../entities/template.entity";

export interface ITemplateRepository {
	findAll(): Promise<Template[] | null>;

	findById(id: string): Promise<Template | null>;

	create(template: Template): Promise<Template | null>;

	update(id: string, template: Template): Promise<Template | null>;

	delete(id: string): Promise<boolean>;
}