# -*- coding: utf-8 -*-

from odoo import api, fields, models, _


class POSSession(models.Model):
    _inherit = 'pos.session'

    @api.model
    def create(self, values):
        config_id = values.get('config_id') or self.env.context.get('default_config_id')
        config = self.env['pos.config'].browse(config_id)
        last_session = self.search([('config_id', '=', config.id)], order='id desc', limit=1)
        res  = super(POSSession, self).create(values)
        if config_id:
            sequence_no = max(self.config_id.seq_receipt_number, last_session.sequence_number)
            if config and hasattr(config, 'seq_receipt_number'):
                res.update({'sequence_number': sequence_no})
        return res
