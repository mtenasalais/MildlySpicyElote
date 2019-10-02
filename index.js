const lcd = require('lcd');

const my_lcd = new lcd({ rs: 25, e: 24, data: [23, 17, 18, 22], cols: 16, rows: 2 });

my_lcd.on('ready', () => {
	setInterval(() => {
		my_lcd.setCursor(0, 0);
		my_lcd.print('Current time is:', () => {
			my_lcd.setCursor(0,1);
			my_lcd.print(new Date().toLocaleTimeString());
		});
	}, 1000);
});

// if ctrl+c is hit, free resources and exit.
process.on('SIGINT', () => {
	my_lcd.clear();
	my_lcd.close();
	process.exit();
});
