// Requiring dependencies.
var mysql = require('mysql');
var password = require('./password.js');
var prompt = require('prompt');

// Setting up the connection to mySQL.
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: password,
	database: 'bamazon'
});

// Initializing the mySQL connection and prompt.
connection.connect();
prompt.start();

// Intro message for the user.
console.log(" ");
console.log("Welcome to Kishan's Store!");
console.log(" ");
console.log("We have the following products for sale:");
console.log(" ");

// Selecting everything from the products table.
connection.query('SELECT * FROM products', function(err, rows) {
	if (err) throw err;
	// Log all the items for sale to the console.
	for (var i = 0; i < rows.length; i++) {
		console.log("Item ID: " + rows[i].ItemID + " Name: " + rows[i].ProductName + " Price: $" + rows[i].Price);
	};
	var schema = {
		properties: {
			itemid: {
				description: 'What is the ID of the product you want?'
			},
			quantity: {
				description: 'How many would you like?'
			}
		}
	}
	// Ask the user what they want to buy and how much.
	prompt.get(schema, function(err, result) {
		// If the user wants more than we have in stock tell them we don't have enough.
		if (rows[result.itemid - 1].StockQuantity < result.quantity) {
			console.log("Insufficient Quantity");
		// If we do have enough stock...
		} else {
			// Total the amount for the user.
			var orderPrice = (rows[result.itemid-1].Price * result.quantity);
			var department = rows[result.itemid-1].DepartmentName;
			console.log("Yerp we can do that!");
			console.log("Your order costs: $" + orderPrice);
			console.log("Thanks for shopping at Kevin's Store!");
			// Update the total sales for the department.
			connection.query('SELECT * FROM Departments', function(err, rows){
				connection.query('UPDATE Departments SET TotalSales = TotalSales + ' + orderPrice + ' WHERE DepartmentName ="' + department + '"', function(err, res){
					if (err) throw err;
				});	
			});
			
			// Update the stock for the item.
			var newQuantity = ( rows[result.itemid - 1].StockQuantity - result.quantity);
			connection.query('UPDATE products SET StockQuantity=' + newQuantity + ' WHERE ItemID=' + result.itemid + ';', function(err, res) {
				if (err) throw err;
			});

		};
	});
});