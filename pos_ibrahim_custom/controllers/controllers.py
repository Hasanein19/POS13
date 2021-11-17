# -*- coding: utf-8 -*-
# from odoo import http


# class PosIbrahimCustom(http.Controller):
#     @http.route('/pos_ibrahim_custom/pos_ibrahim_custom/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/pos_ibrahim_custom/pos_ibrahim_custom/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('pos_ibrahim_custom.listing', {
#             'root': '/pos_ibrahim_custom/pos_ibrahim_custom',
#             'objects': http.request.env['pos_ibrahim_custom.pos_ibrahim_custom'].search([]),
#         })

#     @http.route('/pos_ibrahim_custom/pos_ibrahim_custom/objects/<model("pos_ibrahim_custom.pos_ibrahim_custom"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('pos_ibrahim_custom.object', {
#             'object': obj
#         })
