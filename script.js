const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

const comparer = (idx, asc) => (a, b) => ((v1, v2) => 
	v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
)(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
	const table = th.closest('table');
	Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
		.sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
		.forEach(tr => table.appendChild(tr) );
})));


var sizeWhole = 1000;
var svg = d3.select("#correlogram")
	.append("svg")
	.attr("width", sizeWhole)
	.attr("height", sizeWhole)
	.append("g");
var raw = d3.select("#csvdata").text();
var data = d3.csvParse(raw);
var allVar = data.columns;
margin = 20
size = sizeWhole / allVar.length
var position = d3.scalePoint()
	.domain(allVar)
	.range([0, sizeWhole-size])
for (i in allVar){
	for (j in allVar){
		var var1 = allVar[i]
		var var2 = allVar[j]
		if (i <= j) { continue; }
		xextent = d3.extent(data, function(d) { return +d[var1] })
		var x = d3.scaleLinear()
			.domain(xextent).nice()
			.range([ 0, size-2*margin ]);
		yextent = d3.extent(data, function(d) { return +d[var2] })
		var y = d3.scaleLinear()
			.domain(yextent).nice()
			.range([ size-2*margin, 0 ]);
		var tmp = svg
			.append('g')
			.attr("transform", "translate(" + (position(var1)+margin) + "," + (position(var2)+margin) + ")");
		if (j == 0) {
			tmp.append("text")
				.attr("x", 40)
				.attr("y", -10)
				.style("text-anchor", "middle")
				.style("font-size", 10)
				.text(var1);
		}
		if (i == allVar.length-1) {
			tmp.append("text")
				.attr("x", 25)
				.attr("y", -80)
				.attr("transform", "rotate(90)")
				.style("text-anchor", "middle")
				.style("font-size", 10)
				.text(var2);
		}
		tmp.append("g")
			.attr("transform", "translate(" + 0 + "," + (size-margin*2) + ")")
			.call(d3.axisBottom(x)
				.ticks(3)
				.tickFormat(d3.format(".0s")));
		tmp.append("g")
			.call(d3.axisLeft(y)
				.ticks(3)
				.tickFormat(d3.format(".0s")));
		tmp
			.selectAll("myCircles")
			.data(data)
			.enter()
			.append("circle")
			.attr("cx", function(d){ return x(+d[var1]) })
			.attr("cy", function(d){ return y(+d[var2]) })
			.attr("r", 1)
	}
}
for (i in allVar){
	for (j in allVar){
		var var1 = allVar[i]
		var var2 = allVar[j]
		if (i != j) { continue; }
		xextent = d3.extent(data, function(d) { return +d[var1] })
		var x = d3.scaleLinear()
			.domain(xextent).nice()
			.range([ 0, size-2*margin ]);
		var tmp = svg
			.append('g')
			.attr("transform", "translate(" + (position(var1)+margin) + "," + (position(var2)+margin) + ")");
		tmp.append("g")
			.attr("transform", "translate(" + 0 + "," + (size-margin*2) + ")")
			.call(d3.axisBottom(x)
				.ticks(3)
				.tickFormat(d3.format(".0s")));
		var histogram = d3.histogram()
			.value(function(d) { return +d[var1]; })
			.domain(x.domain())
			.thresholds(x.ticks(15));
		var bins = histogram(data);
		var y = d3.scaleLinear()
			.range([ size-2*margin, 0 ])
			.domain([0, d3.max(bins, function(d) { return d.length; })]);
		tmp.append('g')
			.selectAll("rect")
			.data(bins)
			.enter()
			.append("rect")
			.attr("x", 1)
			.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
			.attr("width", function(d) { return x(d.x1) - x(d.x0)  ; })
			.attr("height", function(d) { return (size-2*margin) - y(d.length); })
	}
}
