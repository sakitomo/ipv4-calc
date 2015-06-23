$(document).on('pagecreate', '#home', function() {
	var ip_addr = new Array(4);
	var nw_addr = new Array(4);
	var prefix;
	var valid = true;


	$.mobile.defaultPageTransition = 'none';

	var $cellsNW = $("#rowNW input");
	var $cellsRS = $("#rowRS span");
	var $classChkd = $("#divClass input:checked");

	$("#gen").tap(function(){
		initialize();
		generate();
		$("#ver").button("enable").button("refresh");
		if ( $("#step_mode").prop("checked") ) {
			$("#gen").button("disable").button("refresh");
		}
		return false;
	});
	$("#ver").click(function(){
		verify();
		validate_gen();
	});
	$cellsNW.each(function(i) {
		$(this).click(function(){
			if ( $("#help_mode").prop("checked") ) {
				switch_cell(i);
			}
		});
	});
	$("#divClass input").click(function(){
		validate_gen();
	});
	$("#step_mode").change(function(){
		validate_gen();
	});


	function validate_gen() {
		if ( $classChkd.length > 0 && ( valid || !$("#step_mode").prop("checked") ) ) {
			$("#gen").button("enable").button("refresh");
		} else {
			$("#gen").button("disable").button("refresh");
		}
	}


	function initialize() {
		var ip_bits, ip_host, sb_mask;
		var min, max;
		var i;

		switch ( $classChkd.eq( Math.floor( Math.random() * $classChkd.length ) ).val() ) {
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
		$cellsNW.val("");
		$cellsRS.html("");
		$("#rowBottom").height(0);

		$("#rowIP input").each(function(i) {
			$(this).val(ip_addr[i]);
		});
		if (prefix < 10) {
			$("#pre").html(prefix+'&#160;');
		} else {
			$("#pre").html(prefix);
		}
	}


	function switch_cell(octet) {
		$cellsNW.filter(":lt("+octet+")").each(function(i) {
			$(this).val(ip_addr[i]);
		});
		$cellsNW.eq(octet).val("");
		$cellsNW.filter(":gt("+octet+")").val(0x00);
	}


	function verify() {
		var count = 0;

		$cellsNW.each(function(i) {
			if ( nw_addr[i].toString() == $(this).val() ) {
				$cellsRS.eq(i).html("&#10004;").css("color","green");
			} else {
				$cellsRS.eq(i).html("&#10005;").css("color","red");
				count++;
			}
		});
		valid = count == 0;

		$("#rowBottom").height(8);
	}
});
