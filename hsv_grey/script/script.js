var svMousedown = false;
var hueMousedown = false;
var currentColor;
var currentColorHex;
var currentHue;

var savedColors = [];

buttonClick = function(color) {
	location.hash = tinycolor(color).toHex();
	newColor(color, "button-click");
};

svReticuleMove = function(e) {
	svMapSize = $("#sv-map").innerWidth();
	
	visualX = Math.max(0, Math.min(e.pageX - $("#sv-map").offset().left, svMapSize));
	visualY = Math.max(0, Math.min(e.pageY - $("#sv-map").offset().top, svMapSize));
	
	x = visualX/svMapSize;
	y = visualY/svMapSize;
	
	$("#sv-reticule").css({bottom: svMapSize-(visualY + 5), left: visualX - 5});
	
	newColor({h: currentHue, s: x, v: 1-y}, "sv-map");
}
hueReticuleMove = function(e) {
	hueMapSize = $("#hue-map").innerHeight();
	
	visualY = Math.max(0, Math.min(e.pageY - $("#hue-map").offset().top, hueMapSize));
	
	y = (1 - visualY/hueMapSize) * 360;
	
	$("#hue-reticule").css({top: visualY});

	currentHue = y;
	newColor({h: y, s: currentColor.toHsv().s, v: currentColor.toHsv().v}, "hue-map");
}
newColor = function(color, source) {
	color = new tinycolor(color);
	if(color.isValid()) {
		color.setAlpha(1);
		currentColor = tinycolor(color.toString());
		
		colorRgb = color.toRgb();
		colorHsl = color.toHsl();
		colorHsv = color.toHsv();
		
		if(source == "h" || source == "rgb" || source == "button-click" || source == "hash" || source == "enter-color") {
			currentHue = colorHsv.h;
		}
		
		currentColorHex = "#" + (colorHex = color.toHex());
		
		$("body, #save button").css({backgroundColor: color.toHexString()});
		$("#save button").css({color: tinycolor.mostReadable(color, ["#fff", "#000"])});
		
		if(source == "scroll" || source == "h" || source == "sv" || source == "sl") location.hash = colorHex; 
		
		if(source != "sv-map" && source != "hue-map") {
			displayColorScheme();
			$("#hue-reticule").css({top: ((360 - currentHue) * (400 / 360))});
		}
		
		if(source != "sv-map" && source != "sl" && source != "sv") $("#sv-map").css({backgroundColor: tinycolor({h: currentHue, s: 1, v: 1}).toHexString()});
		if(source != "sv-map" && source != "hue-map" && source != "scroll") $("#sv-reticule").css({left: colorHsv.s * $("#sv-map").innerWidth() - 5, bottom: colorHsv.v * $("#sv-map").innerWidth() - 5});
		
		if(source != "rgb") {
			$("#red").val(colorRgb.r);
			$("#green").val(colorRgb.g);
			$("#blue").val(colorRgb.b);
		}
		if(source != "sv" && source != "sl" && source != "h")  $("#saturation").val(Math.round(colorHsl.s * 100));
		if(source != "h" && source != "sl") $("#lightness").val(Math.round(colorHsl.l * 100));
		if(source != "h" && source != "sv") $("#value").val(Math.round(colorHsv.v * 100));
		if(source != "h" && source != "sl" && source != "sv") {
			$("#lightness").val(Math.round(colorHsl.l * 100));
			$("#hue").val(Math.round(colorHsl.h));
		}
		
		$("#hexcode").val(currentColorHex);;
		$("#rgb").val(color.toRgbString());
		$("#hsl").val(color.toHslString());
		$("#hsv").val(color.toHsvString());

		$('.deep').remove();
		var map = $('#sv-map');
		var greys = window.getLessGrey(colorRgb.r, colorRgb.g, colorRgb.b);
		// console.log(colorRgb.r, colorRgb.g, colorRgb.b);
		let els = [];
		greys.result.forEach(function(v, i) {
			var content = i + 1;
			v.forEach(function(hsv) {
				var el = $('<div class="deep">' + content + '</div>');
				el.css({left: hsv[1] / 100 * map.innerWidth() - 5, bottom: hsv[2] / 100 * map.innerWidth() - 5});
				els.push(el);
			})
		})
		greys.greys.forEach(function(hsv, i) {
			var content = 'g';
			var el = $('<div class="deep">' + content + '</div>');
			el.css({left: hsv[1] / 100 * map.innerWidth() - 5, bottom: hsv[2] / 100 * map.innerWidth() - 5});
			els.push(el);
		})
		map.append(els);
	}
}
toInfo = function() {
	$("#container").slideUp({complete: function() {$("#container-info").slideDown();}});
	$("body").addClass("info-active");
}
toColorPicker = function() {
	$("#container-info").slideUp({complete: function() {$("#container").slideDown();}});
	$("body").removeClass("info-active");
}
displayColorScheme = function(mostReadable) {
	colorScheme = [];
	color = tinycolor(currentColorHex);
	switch($("#color-schemes-container option:selected").val()) {
		case "complement":
			colorScheme = [color, color.complement()];
			break;
		case "splitcomplement":
			colorScheme = color.splitcomplement();
			break;
		case "triad":
			colorScheme = color.triad();
			break;
		case "tetrad":
			colorScheme = color.tetrad();
			break;
		case "analogous":
			colorScheme = color.analogous();
			break;
		case "monochromatic":
			colorScheme = color.monochromatic();
			break;
	}
	
	$("#color-schemes").html("");
	for(i = 0; i < colorScheme.length; i++) {
		$("#color-schemes").append(createSavedColorButton(colorScheme[i], true));
	}
}

saveNewColor = function() {
	$(createSavedColorButton(tinycolor(currentColorHex))).insertAfter("#save");
	savedColors.push(currentColor.toHexString());
	if(savedColors.length > 12) {
		$("#saved-colors .saved-color:gt(11)").remove();
		savedColors.splice(0,1);
	}
	Cookies.set("saved-colors", savedColors);
}
clearSavedColors = function() {
	$("#saved-colors .saved-color").remove();
	savedColors = [];
	Cookies.set("saved-colors", []);
}
createSavedColorButton = function(color, fromColorSchemes) {
	return [
		'<li',
		(fromColorSchemes?'':' class="saved-color"'),
		'><button style="background-color:',
		color.toHexString(),
		';color:',
		tinycolor.mostReadable(color, ["#fff", "#000"]),
		'" ',
		(fromColorSchemes?'onmouseup':'onclick'),
		'="buttonClick(\''+color.toHex()+'\');">',
		color.toHexString(),
		'</button></li>',
	].join("");
}

$(function() {
	if(savedColors != []) {
		for(i = 0; i < savedColors.length; i++) {
			color = tinycolor(savedColors[i]);
			$(createSavedColorButton(color)).insertAfter("#save");
		}
	}

	$("#color-settings input").click(function() {
		$(this).select();
	});
	$("#color-settings input.modifiable").change(function(e) {
		id = $(this).attr("id");
		if(!$.isNumeric($(this).val())) $(this).val(0);
		else {
			fieldMaxima = {
				red: 255,
				green: 255,
				blue: 255,
				hue: 360,
				saturation: 100,
				lightness: 100,
				value: 100,
			};
			maximum = fieldMaxima[id];
			if ($(this).val() < 0) $(this).val(0);
			else if ($(this).val() > maximum) $(this).val(maximum);
			value = $(this).val();
		}
		
		if($.inArray(id, ["red", "green", "blue"]) > -1) {
			newColor({r: $("#red").val(), g: $("#green").val(), b: $("#blue").val()}, "rgb");
		}
		else if(id == "hue") {
			newColor({h: $("#hue").val(), s: $("#saturation").val() / 100, l: $("#lightness").val() / 100}, "h");
		}
		else if(id == "lightness") {
			newColor({h: $("#hue").val(), s: $("#saturation").val() / 100, l: $("#lightness").val() / 100}, "sl");
		}
		else {
			newColor({h: $("#hue").val(), s: $("#saturation").val() / 100, v: $("#value").val() / 100}, "sv");
		}
	}).mousewheel(function(e) {
		$(this).val(parseInt($(this).val())+(5*e.deltaY));
		if($(this).attr("id") == "hue") $(this).val(((parseInt($(this).val())%360)+360)%360)
		$(this).change();
		
		if(!e) e = window.event;
		if(e.preventDefault) e.preventDefault();
		e.returnValue = false;
	});
	$("#sv-map, #hue-map").mousewheel(function(e) {
		hue = currentHue;
		hue += e.deltaY * 5;
		hue = ((hue%360)+360)%360;
		currentHue = hue;
		hsv = currentColor.toHsv();
		newColor({h: hue, s: hsv.s, v: hsv.v}, "scroll");
		
		if(!e) e = window.event;
		if(e.preventDefault) e.preventDefault();
		e.returnValue = false;
	});

	if(tinycolor(location.hash.substr(1)).isValid()) {
		newColor(location.hash.substr(1), "hash");
	}
	else {
		location.hash = tinycolor.random().toHex();
		newColor(location.hash, "hash");
	}

	$("#enter-color").keypress(function(e) {
		if(e.which == 13) {
			newColor($("#enter-color").val(), "enter-color");
			$("#enter-color").val("");
		}
	});
	
	$("#sv-map").mousedown(function(e) {
		if(e.which == 1) {
			svMousedown = true;
			svReticuleMove(e);
		}
	});
	$("#hue-map").mousedown(function(e) {
		if(e.which == 1) {
			hueMousedown = true;
			hueReticuleMove(e);
		}
	});
	$(window).mousemove(function(e) {
		if(e.which == 1) {
			if(svMousedown) {
				svReticuleMove(e);
			}
			else if(hueMousedown) {
				hueReticuleMove(e);
			}
		}
	}).mouseup(function(e) {
		if(svMousedown || hueMousedown && e.which == 1) {
			svMousedown = false;
			hueMousedown = false;
			
			location.hash = currentColorHex;
			displayColorScheme();
		}
	});
	
	$("#color-schemes-container select").change(displayColorScheme);
	displayColorScheme();
});