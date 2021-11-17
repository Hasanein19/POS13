# -*- coding: utf-8 -*-
from odoo import fields, models, api


class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.model
    def get_order_number(self, order_ref):
        if order_ref:
            order_id = self.search([('pos_reference', '=', order_ref)])
            if order_id:
                return {'order_number': order_id.name}
        return False
