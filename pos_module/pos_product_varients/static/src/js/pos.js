odoo.define('pos_product_varients', function(require) {
    "use strict";

    var models = require('point_of_sale.models');
    var chrome = require('point_of_sale.chrome');
    var core = require('web.core');
    var PosPopWidget = require('point_of_sale.popups');
    var PosBaseWidget = require('point_of_sale.BaseWidget');
    var gui = require('point_of_sale.gui');
    var screens = require('point_of_sale.screens');
    var _t = core._t;

    models.load_fields('product.product', ['has_variant', 'pos_product_varient_id']);

    models.load_models([{
        model: 'pos.product.attribute.line',
        condition: function(self) { return self.config.allow_product_varients; },
        fields: ['product_ids', 'value_ids', 'default_selected', 'price'],
        loaded: function(self, result) {
            if (result.length) {
                self.pos_product_varient_list = result;
            } else {
                self.pos_product_varient_list = [];
            }
        },
    }], { 'after': 'product.product' });

    var PosVarientProductWidget = PosPopWidget.extend({
        template: 'PosVarientProductWidget',

        renderElement: function(options) {
            var self = this;
            this._super();
            this.$(".add_modifiers").click(function() {
                var selected_product_varient_list = [];
                var total = 0;
                $(".wv_product").each(function() {
                    if ($(this).hasClass('dark-border')) {
                        var product_id = $(this).data('product-id');
                        var price = $(this).data("product-price");
                        total += price
                        // var amount = $(this).data('product-amount');
                        selected_product_varient_list.push({ "varient_name": $(this).find('.product-name').data('product-name'), "price": price });
                    }
                });
                var p_id = $('.base_product').data('product-id');
                if (p_id) {
                    if (!options.edit_pack) {
                        var product = self.pos.db.get_product_by_id(p_id);
                        var product_price = product.get_price(self.pos.default_pricelist, 1);
                        self.pos.get_order().add_product(product, { price: product_price });
                    } else {
                        var product = self.pos.db.get_product_by_id(p_id);
                        var product_price = product.get_price(self.pos.default_pricelist, 1);
                        self.pos.get_order().selected_orderline.list_price = product_price;
                    }

                    self.pos.get_order().selected_orderline.selective_product_varient_ids = selected_product_varient_list;
                    self.pos.get_order().selected_orderline.trigger('change', self.pos.get_order().selected_orderline);
                }
                self.gui.show_screen('products');
            });
            $(".wv_product").click(function() {
                if ($(this).hasClass('dark-border')) {
                    $(this).removeClass('dark-border');
                } else {
                    $(this).addClass('dark-border');
                }
            });
        },
        show: function(options) {
            var self = this;
            this.options = options || {};
            var product_varient_list = [];
            var pos_product_varients = this.pos.pos_product_varient_list;
            var pack_ids = options.product.pos_product_varient_id;
            for (var i = 0; i < pos_product_varients.length; i++) {
                if (pack_ids.indexOf(pos_product_varients[i].id) >= 0) {
                    product_varient_list.push(pos_product_varients[i]);
                }
            }
            options.product_varient_list = product_varient_list;
            this._super(options);
            this.renderElement(options);
        },
    });

    gui.define_popup({
        'name': 'pos-varient-product-widget',
        'widget': PosVarientProductWidget,
    });
    var OrderlineEditVarientButton = screens.ActionButtonWidget.extend({
        template: 'OrderlineEditVarientButton',
        button_click: function() {
            var line = this.pos.get_order().get_selected_orderline();
            if (line) {
                if (line.product.pos_product_varient_id) {
                    this.gui.show_popup('pos-varient-product-widget', { 'product': line.product, 'edit_pack': true });
                }
            }
        },
    });

    screens.define_action_button({
        'name': 'order_line_edit_varient',
        'widget': OrderlineEditVarientButton,
        'condition': function() {
            return this.pos.config.allow_product_varients;
        },
    });
    screens.ProductScreenWidget.include({
        click_product: function(product) {
            if (product.to_weight && this.pos.config.iface_electronic_scale) {
                this.gui.show_screen('scale', { product: product });
            } else {
                if (this.pos.config.allow_product_varients && product.has_variant) {
                    this.gui.show_popup('pos-varient-product-widget', { 'product': product, 'edit_pack': false });
                } else {
                    this.pos.get_order().add_product(product);
                }
            }
        },

    });
    var _super_Orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        export_for_printing: function() {
            var res = _super_Orderline.export_for_printing.call(this);
            res.selective_product_varient_ids = this.selective_product_varient_ids || false;
            return res;
        },
        get_all_prices: function() {
            var self = this;
            var addons_total = 0;
            if (self.pos.get_order()){
                var line = this.pos.get_order().get_selected_orderline();
                if (line) {
                    if (line.selective_product_varient_ids) {
                        line.selective_product_varient_ids.forEach(function(orderline){
                            addons_total += orderline['price']
                        });
                    }
                }
            }
            
            var price_unit = this.get_unit_price() * (1.0 - (this.get_discount() / 100.0));
            price_unit = price_unit + addons_total
            
            var taxtotal = 0;

            var product = this.get_product();
            var taxes_ids = product.taxes_id;
            var taxes = this.pos.taxes;
            var taxdetail = {};
            var product_taxes = [];

            _(taxes_ids).each(function(el) {
                var tax = _.detect(taxes, function(t) {
                    return t.id === el;
                });
                product_taxes.push.apply(product_taxes, self._map_tax_fiscal_position(tax));
            });
            product_taxes = _.uniq(product_taxes, function(tax) { return tax.id; });

            var all_taxes = this.compute_all(product_taxes, price_unit, this.get_quantity(), this.pos.currency.rounding);
            var all_taxes_before_discount = this.compute_all(product_taxes, this.get_unit_price(), this.get_quantity(), this.pos.currency.rounding);
            _(all_taxes.taxes).each(function(tax) {
                taxtotal += tax.amount;
                taxdetail[tax.id] = tax.amount;
            });

            return {
                "priceWithTax": all_taxes.total_included,
                "priceWithoutTax": all_taxes.total_excluded,
                "priceSumTaxVoid": all_taxes.total_void,
                "priceWithTaxBeforeDiscount": all_taxes_before_discount.total_included,
                "tax": taxtotal,
                "taxDetails": taxdetail,
            };
        },
    });
});