odoo.define('elak_pos_customization.models', function(require) {
    "use strict"
    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var PosDB = require("point_of_sale.DB");
    var core = require('web.core');
    var config = require('web.config');
    var QWeb = core.qweb;
    var SuperPosModel = models.PosModel.prototype;


    screens.ReceiptScreenWidget.include({
        print_html: function () {
            var self = this;
            var delay_value = 5000;
            var receipt = QWeb.render('OrderReceipt', self.get_receipt_render_env());
            for(var len = 0; len < 2; len++){                     
                setTimeout(function(){
                    self.pos.proxy.printer.print_receipt(receipt);
                },delay_value*len)  
            }
            self.pos.get_order()._printed = true;
        },
    })
});