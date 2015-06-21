$(document).on('pagecreate', '#home', function() {
	var ip_addr = new Array(4);
	var nw_addr = new Array(4);
	var prefix;
	var valid = true;


	$.mobile.defaultPageTransition = 'none';

	jQuery(function ($) {
		$("#gen").tap(function(){
			initialize();
			generate();
			$("#ver").button("enable").button("refresh");
			if ( $("#step_mode").prop("checked") ) {
				$("#gen").button("disable").button("refresh");
			}
		});
		$("#ver").tap(function(){
			verify();
			validate_gen();
		});
		$("input[name=nw]").each(function (i) {
			$(this).click(function(){
				if ( $("#help_mode").prop("checked") ) {
					switch_cell($(this).attr("id").slice(-1));
				}
			});
		});
		$("input[name=class]").click(function(){
			validate_gen();
		});
		$("#step_mode").change(function(){
			validate_gen();
		});
	});


	function validate_gen() {
		if ( $("input[name=class]:checked").length > 0 && ( valid || !$("#step_mode").prop("checked") ) ) {
			$("#gen").button("enable").button("refresh");
		} else {
			$("#gen").button("disable").button("refresh");
		}
	}


	function initialize() {
		var ip_bits, ip_host, sb_mask;
		var min, max;
		var i;

		switch ( $("input[name=class]:checked").eq( 
			Math.floor( Math.random() * $("input[name=class]:checked").length ) 
		).val() ) {
		case 'A':
			ip_bits = '00001010';  // 10
			min = 8;
			break;
		case 'B':
			ip_bits = '10101100';  // 172
			min = 12;
			break;
		case 'C':
			ip_bits = '11000000';  // 192
			min = 16;
			break;
		}
		max = 30;

		do {
			prefix = random_range(min, max);
		} while ( $("#hard_mode").prop("checked") == true 
			&& (prefix == 24 || prefix == 16 || prefix == 8) );

		ip_bits += random_bits(8, prefix);
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
	}


	function random_range(min, max) {
		return Math.floor( Math.random() * (max-min+1) + min );
	}

	function random_bits(min, max) {
		var str = '';
		var i;

		for ( i = min; i < max; i++ ) {
			str += Math.floor( Math.random() * 2 );
		}
		return str;
	}


	function generate() {
		$("input[name=nw]").val("");
		$("span[name=rs]").html("");
		$("#nwBottom").height(0);

		$("input[name=ip]").each(function (i) {
			$(this).val(ip_addr[i]);
		});
		if (prefix < 10) {
			$("#pre").html(prefix+'&#160;');
		} else {
			$("#pre").html(prefix);
		}
	}


	function switch_cell(octet) {
		$("input[name=nw]:lt("+octet+")").each(function (i) {
			$(this).val(ip_addr[i]);
		});
		$("input[name=nw]:eq("+octet+")").val("");
		$("input[name=nw]:gt("+octet+")").val(0x00);
	}


	function verify() {
		var count = 0;

		$("input[name=nw]").each(function (i) {
			if ( nw_addr[i].toString() == $(this).val() ) {
				$("#rs"+i).html("&#10004;").css("color","green");
			} else {
				$("#rs"+i).html("&#10005;").css("color","red");
				count++;
			}
		});
		valid = count == 0;

		$("#nwBottom").height(8);
	}
});
