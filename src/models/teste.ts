import FieldFormulaModel from './field/extensions/field-formula.model';
import FieldGroupModel from './field/extensions/field-group.model';
import FieldNumberModel from './field/extensions/field-number.model';
import FieldOptionsModel from './field/extensions/field-option.model';
import FieldTableModel from './field/extensions/field-table.model';
import FieldTextModel from './field/extensions/field-text.model';
import FieldModel from './field/field.model';
import SectionModel from './section.model';
import SystemModel from './system.model';
import SheetModel from './template.model';

new SystemModel('systemId', 'NomeTeste', 'descricaoTeste', true, '1.0', true, 'Antonio');

new SheetModel('template-dnd5e', 'Ficha D&D 5e', 'systemId', [
  // 🔹 INFORMAÇÕES GERAIS
  new SectionModel('sec-info', 'Informações', 1, [
    new FieldGroupModel('grupo-info', 'info', 'Informações do Personagem', false, true, false, [
      new FieldTextModel('char-id', 'nome', 'Nome', false, true, false, '', ''),
      new FieldOptionsModel('char-raca', 'raca', 'Raça', false, true, false, ['Humano', 'Elfo', 'Anão', 'Meio-Orc']),
      new FieldOptionsModel('char-classe', 'classe', 'Classe', false, true, false, ['Guerreiro', 'Mago', 'Ladrão']),
      new FieldNumberModel('char-nivel', 'nivel', 'Nível', false, true, false, 1, 1),
      new FieldTextModel('char-antecedente', 'antecedente', 'Antecedente', false, true, false, '', ''),
      new FieldTextModel('char-alinhamento', 'alinhamento', 'Alinhamento', false, true, false, '', ''),
    ]),
  ]),

  // 🔹 ATRIBUTOS
  new SectionModel('sec-atributos', 'Atributos', 2, [
    new FieldGroupModel('grupo-forca', 'forca', 'Força', false, true, false, [
      new FieldNumberModel('forca-val', 'val', 'Valor', false, true, false, 16, 16),
      new FieldFormulaModel('forca-mod', 'mod', 'Modificador', false, true, true, '(val - 10) / 2'),
    ]),
    new FieldGroupModel('grupo-destreza', 'destreza', 'Destreza', false, true, false, [
      new FieldNumberModel('des-val', 'val', 'Valor', false, true, false, 14, 14),
      new FieldFormulaModel('des-mod', 'mod', 'Modificador', false, true, true, '(val - 10) / 2'),
    ]),
    new FieldGroupModel('grupo-constituicao', 'constituicao', 'Constituição', false, true, false, [
      new FieldNumberModel('con-val', 'val', 'Valor', false, true, false, 14, 14),
      new FieldFormulaModel('con-mod', 'mod', 'Modificador', false, true, true, '(val - 10) / 2'),
    ]),
    new FieldGroupModel('grupo-inteligencia', 'inteligencia', 'Inteligência', false, true, false, [
      new FieldNumberModel('int-val', 'val', 'Valor', false, true, false, 10, 10),
      new FieldFormulaModel('int-mod', 'mod', 'Modificador', false, true, true, '(val - 10) / 2'),
    ]),
    new FieldGroupModel('grupo-sabedoria', 'sabedoria', 'Sabedoria', false, true, false, [
      new FieldNumberModel('sab-val', 'val', 'Valor', false, true, false, 12, 12),
      new FieldFormulaModel('sab-mod', 'mod', 'Modificador', false, true, true, '(val - 10) / 2'),
    ]),
    new FieldGroupModel('grupo-carisma', 'carisma', 'Carisma', false, true, false, [
      new FieldNumberModel('car-val', 'val', 'Valor', false, true, false, 8, 8),
      new FieldFormulaModel('car-mod', 'mod', 'Modificador', false, true, true, '(val - 10) / 2'),
    ]),
  ]),

  // 🔹 COMBATE
  new SectionModel('sec-combate', 'Combate', 3, [
    new FieldGroupModel('grupo-combate', 'combate', 'Combate', false, true, false, [
      new FieldFormulaModel('ca', 'ca', 'Classe de Armadura', false, true, true, '10 + des.mod'),
      new FieldFormulaModel('iniciativa', 'iniciativa', 'Iniciativa', false, true, true, 'des.mod'),
      new FieldFormulaModel('pv-max', 'pv_max', 'Pontos de Vida Máximos', false, true, true, '10 + con.mod'),
      new FieldNumberModel('pv-atual', 'pv_atual', 'Pontos de Vida Atuais', false, true, false, 11, 11),
      new FieldFormulaModel(
        'bonus-proficiencia',
        'bonus_proficiencia',
        'Bônus de Proficiência',
        false,
        true,
        true,
        '2',
      ),
    ]),
  ]),

  // 🔹 PERÍCIAS (exemplo com algumas)
  new SectionModel('sec-pericias', 'Perícias', 4, [
    new FieldGroupModel('grupo-pericias', 'pericias', 'Perícias', false, true, false, [
      new FieldFormulaModel('atletismo', 'atletismo', 'Atletismo', false, true, true, 'forca.mod + bonus_proficiencia'),
      new FieldFormulaModel('intimidacao', 'intimidacao', 'Intimidação', false, true, true, 'car.mod'),
      new FieldFormulaModel('furtividade', 'furtividade', 'Furtividade', false, true, true, 'des.mod'),
    ]),
  ]),

  // 🔹 INVENTÁRIO (exemplo simples de tabela)
  new SectionModel('sec-inventario', 'Inventário', 5, [
    new FieldTableModel(
      'grupo-inventario',
      'inventario',
      'Inventário',
      false,
      true,
      false,
      [
        new FieldModel('nameId', 'name', 'Name', true, false, false),
        new FieldModel('qtId', 'qt', 'Quantity', true, false, false),
        new FieldModel('weightId', 'weight', 'Weight', true, false, false),
      ],
      [
        { name: 'Espada Longa', qt: 1, weight: 3 },
        { name: 'Cota de Malha', qt: 1, weight: 20 },
        { name: 'Kit de Aventureiro', qt: 1, weight: 10 },
      ],
    ),
  ]),
]);
