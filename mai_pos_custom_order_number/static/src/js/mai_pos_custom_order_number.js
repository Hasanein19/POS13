odoo.define('mai_pos_custom_order_number.mai_pos_custom_order_number', function (require) {
'use strict';

var models = require('point_of_sale.models');

var _super_order = models.Order.prototype;
models.Order = models.Order.extend({
	get_name: function() {
		if (this.name && this.pos.config.seq_receipt_prefix) {
			this.name = this.name.replace('Order', this.pos.config.seq_receipt_prefix);
		}
		return this.name;
	},

	generate_unique_id: function() {
		// Generates a public identification number for the order.
		// The generated number must be unique and sequential. They are made 12 digit long
		// to fit into EAN-13 barcodes, should it be needed

		function zero_pad(num,size){
			var s = ""+num;
			while (s.length < size) {
				s = "0" + s;
			}
			return s;
		}
		var seq = zero_pad(this.sequence_number,4)
		if (this.pos.config.seq_receipt_number) {
			var padding = 4;
			if (this.pos.config.seq_receipt_number_padding) {
				padding = this.pos.config.seq_receipt_number_padding;
			}
			seq = zero_pad(this.sequence_number, padding);
		}
		return zero_pad(this.pos.pos_session.id,5) +'-'+
			   zero_pad(this.pos.pos_session.login_number,3) +'-'+
			   seq;
	},
});
});
