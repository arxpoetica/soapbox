(function() {

	SOAPBOX.init = function() {

		console.log('Soapbox!')

		// anything universal goes here...

		// global selectors
		window.$WINDOW = $(window);
		window.$DOCUMENT = $(document);
		window.$HTML = $('html');
		window.$BODY = $('body');

	};

})();