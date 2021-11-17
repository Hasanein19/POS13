# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.addons import decimal_precision as dp
from odoo.exceptions import UserError, ValidationError


class PosProductAttribute(models.Model):
    _name = "pos.product.attribute"
    _description = "Product Attribute"
    _order = 'sequence, name'

    name = fields.Char('Name', required=True, translate=True)
    value_ids = fields.One2many('pos.product.attribute.value', 'attribute_id', 'Values', copy=True)
    sequence = fields.Integer('Sequence', help="Determine the display order")


class PoProductAttributevalue(models.Model):
    _name = "pos.product.attribute.value"
    _order = 'sequence'

    name = fields.Char('Value', required=True, translate=True)
    sequence = fields.Integer('Sequence', help="Determine the display order")
    attribute_id = fields.Many2one('pos.product.attribute', 'Attribute', ondelete='cascade')
    _sql_constraints = [
        ('value_company_uniq', 'unique (name,attribute_id)', 'This attribute value already exists !')
    ]

    # @api.multi
    def name_get(self):
        if not self._context.get('show_attribute', True):  # TDE FIXME: not used
            return super(PoProductAttributevalue, self).name_get()
        return [(value.id, "%s: %s" % (value.attribute_id.name, value.name)) for value in self]


class pos_config(models.Model):
    _inherit = 'pos.config' 

    allow_product_varients = fields.Boolean('Allow Product Variants', default=True)


class PosProductAttributeLine(models.Model):
    _name = "pos.product.attribute.line"
    _rec_name = 'attribute_id'

    product_ids = fields.Many2one('product.product', 'Product', ondelete='cascade', required=True)
    value_ids = fields.Many2one('pos.product.attribute.value', string='Attribute Values')
    attribute_id = fields.Many2one('pos.product.attribute', 'Attribute', ondelete='restrict')
    default_selected = fields.Boolean('Default selected')
    price = fields.Float("Price")


class product_product(models.Model):
    _inherit = 'product.product'
    
    has_variant = fields.Boolean('Has Variant')
    pos_product_varient_id = fields.One2many('pos.product.attribute.line','product_ids',string="Product Varient")

    
# class PosOrder(models.Model):
#     _inherit = "pos.order"

#     @api.model
#     def _order_fields(self, ui_order):
#         new_lines = []
#         if ui_order.has_key('lines'):
#             for lines in ui_order['lines']:
#                 new_lines.append(lines)
#                 if lines[2].has_key('selected_product_list'):
#                     for selected_pack in lines[2]['selected_product_list']:
#                         new_lines.append(selected_pack)
#                 if lines[2].has_key('fixed_product_list'):
#                     for fixed_pack in lines[2]['fixed_product_list']:
#                         new_lines.append(fixed_pack)
#             ui_order['lines'] = new_lines
#         return super(PosOrder, self)._order_fields(ui_order)



