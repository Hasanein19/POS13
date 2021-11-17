# -*- coding: utf-8 -*-

{
    'name': 'Pos Product Variant',
    'version': '1.0',
    'category': 'Point of Sale',
    'sequence': 6,
    'author': 'Webveer',
    'summary': 'Pos product variant allows you to sale products based on different varieties with different price.',
    'description': """

=======================
Pos product variant allows you to sale products based on different varieties with different price.

""",
    'depends': ['point_of_sale'],
    'data': [
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml'
    ],
    'qweb': [
        'static/src/xml/pos.xml',
    ],
    'images': [
        'static/description/select.jpg',
    ],
    'installable': True,
    'website': '',
    'auto_install': False,
    'price': 69,
    'currency': 'EUR',
}
