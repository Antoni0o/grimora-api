import FieldGroupModel from './field/extensions/field-group.model';
import BaseFieldWithValueModel from './field/field-with-value.model';
import BaseFieldModel from './field/field.model';
import TemplateModel from './template.model';

export default class SheetModel {
  id: string;
  fields: Map<string, BaseFieldModel>;

  constructor(id: string, template: TemplateModel) {
    this.id = id;
    this.fields = new Map();

    this.startupFields(template);
  }

  private startupFields(template: TemplateModel) {
    for (const section of template.sections) {
      for (const field of section.fields) {
        this._createField(field);
      }
    }
  }

  private _createField(field: BaseFieldModel) {
    if (field instanceof FieldGroupModel) {
      for (const subField of field.children) {
        this._createField(subField);
      }
    } else {
      const clone = field.clone();
      this.fields.set(clone.key, clone);
    }
  }

  getValue<T = any>(key: string): T | undefined {
    const field = this.fields.get(key);

    if (field instanceof BaseFieldWithValueModel) {
      return field.getValue() as T;
    }

    return undefined;
  }

  setValue<T = any>(key: string, value: T) {
    const field = this.fields.get(key);

    if (field instanceof BaseFieldWithValueModel && field && !field.readonly) {
      field.setValue(value);
    }
  }

  getField(key: string): BaseFieldModel | undefined {
    return this.fields.get(key);
  }

  getAllFields(): BaseFieldModel[] {
    return Array.from(this.fields.values());
  }
}
