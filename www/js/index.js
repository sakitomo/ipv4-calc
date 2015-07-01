$(document).on('mobileinit', function() {
	$.mobile.defaultPageTransition = 'none';
});


$(document).on('pagecreate', '#home', function() {
	IPv4.set_selectors();

	$("#gen").tap(function(e){
		IPv4.initialize();
		IPv4.generate();
		$("#ver").removeClass("ui-state-disabled");
		if ( $("#step_mode").prop("checked") ) {
			$("#gen").addClass("ui-state-disabled");
		}
		e.preventDefault();
	});
	$("#ver").click(function(){
		IPv4.verify();
		IPv4.validate_gen();
	});
	IPv4.$cellsNW.each(function(i) {
		$(this).click(function(){
			if ( $("#help_mode").prop("checked") ) {
				IPv4.switch_cell(i);
			}
		});
	});
	$("#divClass input").click(function(){
		IPv4.validate_gen();
	});
	$("#step_mode").change(function(){
		IPv4.validate_gen();
	});
});


var IPv4 = (function() {
	var my = {};

	var ip_addr = new Array(4);
	var nw_addr = new Array(4);
	var prefix;
	var valid = true;


	my.set_selectors = function () {
		my.$cellsIP = $("#rowIP input");
		my.$cellsNW = $("#rowNW input");
		my.$cellsRS = $("#rowRS span");
	};


	my.initialize = function () {
		var Class = function(min, bits) {
			this.min = min;
			this.bits = bits;
		};
		var classes = {
			A: new Class( 8, '00001010'), //  10
			B: new Class(12, '10101100'), // 172
			C: new Class(16, '11000000')  // 192
		};

		var $classChkd = $("#divClass input:checked");
		var cls = classes[ $classChkd.eq( Math.floor( Math.random() * $classChkd.length ) ).val() ];
		var ip_bits, ip_host, sb_mask;
		var i;

		do {
			prefix = random_range(cls.min, 30);
		} while ( $("#hard_mode").prop("checked") && (prefix == 24 || prefix == 16 || prefix == 8) );
		ip_bits = cls.bits + random_bits(8, prefix);

		do {
			ip_host = random_bits(prefix, 32);
		} while ( ip_host.match(/^(0+|1+)$/) );  // The host part is not allowed to be "all 0s" nor "all 1s".
		ip_bits += ip_host;

		sb_mask = Array(prefix+1).join("1") + Array(33-prefix).join("0");

		for ( i = 0; i < 4; i++ ) {
			ip_addr[i] = parseInt( ip_bits.slice(i*8, (i+1)*8), 2 );
			nw_addr[i] = parseInt( sb_mask.slice(i*8, (i+1)*8), 2 ) & ip_addr[i];
		}

		valid = false;
	};


	var random_range = function (min, max) {
		return Math.floor( Math.random() * (max-min+1) + min );
	};

	var random_bits = function (min, max) {
		var str = '';
		var i;

		for ( i = min; i < max; i++ ) {
			str += Math.floor( Math.random() * 2 );
		}
		return str;
	};


	my.generate = function () {
		my.$cellsNW.val("");
		my.$cellsRS.html("");
		$("#rowBottom").height(0);

		my.$cellsIP.each(function(i) {
			$(this).val(ip_addr[i]);
		});
		if (prefix < 10) {
			$("#pre").html(prefix+'&#160;');
		} else {
			$("#pre").html(prefix);
		}
	};


	my.switch_cell = function (octet) {
		my.$cellsNW.filter(":lt("+octet+")").each(function(i) {
			$(this).val(ip_addr[i]);
		});
		my.$cellsNW.eq(octet).val("");
		my.$cellsNW.filter(":gt("+octet+")").val(0);
	};


	my.verify = function () {
		var count = 0;

		my.$cellsNW.each(function(i) {
			if ( nw_addr[i].toString() == $(this).val() ) {
				my.$cellsRS.eq(i).html("&#10004;").css("color","green");
			} else {
				my.$cellsRS.eq(i).html("&#10005;").css("color","red");
				count++;
			}
		});
		valid = count == 0;

		$("#rowBottom").height(8);
	};


	my.validate_gen = function () {
		if ( $("#divClass input:checked").length > 0 && ( valid || !$("#step_mode").prop("checked") ) ) {
			$("#gen").removeClass("ui-state-disabled");
		} else {
			$("#gen").addClass("ui-state-disabled");
		}
	};


	return my;
}());
