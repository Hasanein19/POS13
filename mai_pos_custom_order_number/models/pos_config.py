# -*- coding: utf-8 -*-

from odoo import api, fields, models, _


class POSConfig(models.Model):
    _inherit = 'pos.config'

    seq_receipt_prefix = fields.Char(default='Order')
    seq_receipt_number = fields.Integer(default=1)
    seq_receipt_number_padding = fields.Integer(default=6)
