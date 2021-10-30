# -*- coding: utf-8 -*-

from odoo import api, fields, models, _


class POSOrder(models.Model):
	_inherit = 'pos.order'

	@api.model
	def _order_fields(self, ui_order):
		res  = super(POSOrder, self)._order_fields(ui_order)
		pos_session = self.env['pos.session'].browse(ui_order['pos_session_id'])
		if pos_session.sequence_number <= ui_order['sequence_number']:
			pos_session.write({'sequence_number': ui_order['sequence_number'] + 1})
			pos_session.refresh()
		return res
