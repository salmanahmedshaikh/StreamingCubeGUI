/**
 * Graphs.js 
 *
 * Author: Salman Ahmed Shaikh
 * Date created: 24th November, 2016
 *
 */
 
// Global variables
var timeSeriesLength = 30; // 30 time units
var salesNestedArrLength = 2;
var chartType = "pie";
var indexLabelStr = "{label} #percent%";

var salesArr = new Array();
for(var i = 0; i < salesNestedArrLength; i++)
	salesArr[i] = new Array();

var summaryWRTTime = new Array();
for(var i = 0; i < salesNestedArrLength; i++)
	summaryWRTTime[i] = new Array();

var execTimeChartArr = new Array();
for(var i = 0; i < salesNestedArrLength; i++)
	execTimeChartArr[i] = new Array();

var queryAnsweringNodeArr = new Array();
for(var i = 0; i < 3; i++)
	queryAnsweringNodeArr[i] = new Array();

function changeChartType(btnChartType)
{
	chartType = btnChartType.value;	
	if(chartType == "pie" || chartType == "doughnut")		
		indexLabelStr = "{label} #percent%";
	else
		indexLabelStr = "";
}

function clearSummaryWRTTimeChart()
{
	while(summaryWRTTime[0].length > 0)	
	{
		summaryWRTTime[0].shift(); // removes the oldest element
		summaryWRTTime[1].shift(); // removes the oldest element	
	}
}

function groupDataWRTTimestamp(jsonData)
{
	var timeValArr = new Array();
	for(var i = 0; i < salesNestedArrLength; i++)
		timeValArr[i] = new Array();
	
	$.each(jsonData.queryResult, function (i, item) 
	{
		var keys = Object.keys(item);
		
		var ts = item[keys[keys.length - 2]]; // second last attribute in json is timestamp
		var val = item[keys[keys.length - 1]]; // last attribute in json is timestamp
		
		var tsIndex = timeValArr[1].indexOf(ts);
		
		if(tsIndex != -1) // if timestamp found
		{
			timeValArr[0][tsIndex] += val;			
		}
		else
		{
			timeValArr[0].push(val);
			timeValArr[1].push(ts);			
		}
	});	
	return timeValArr;
}

function queryExecTimeChart(queriedNode, queryAnsweringNode, queryAnsweringTime, resultTimestamp)
{
	queryAnsweringNodeArr[0].push(queriedNode);
	queryAnsweringNodeArr[1].push(queryAnsweringNode);
	queryAnsweringNodeArr[2].push(resultTimestamp);
	
	execTimeChartArr[0].push(queryAnsweringTime);
	execTimeChartArr[1].push(resultTimestamp);		
	
	// Removing the Total sales which have gone beyond the timeSeriesLength
	if(execTimeChartArr[0].length > timeSeriesLength)
	{	
		execTimeChartArr[0].shift(); // removes the oldest element
		execTimeChartArr[1].shift(); // removes the oldest element			
	}
	
	if(queryAnsweringNodeArr[0].length > timeSeriesLength)
	{
		queryAnsweringNodeArr[0].shift(); // removes the oldest element
		queryAnsweringNodeArr[1].shift(); // removes the oldest element	
		queryAnsweringNodeArr[2].shift(); // removes the oldest element	
	}
	
	//Finding the min and max in salesArr for yAxis
	var execTimeArrMax = 0;
	var execTimeArrMin = 999999999999;
	for(var i = 0; i < execTimeChartArr[0].length; i++)
	{
		if(execTimeChartArr[0][i] > execTimeArrMax)
			execTimeArrMax = execTimeChartArr[0][i];
		
		if(execTimeChartArr[0][i] < execTimeArrMin)
			execTimeArrMin = execTimeChartArr[0][i];
	}	
	drawTimeSeriesChart(execTimeChartArr, "divQueryAnsweringTimeChart", "line", "Timestamp", "QueryExec.Time(s)", 0.95 * execTimeArrMin, 1.05 * execTimeArrMax);	
	drawMultiSeriesChart(queryAnsweringNodeArr, "divQueryAnsweringNode", "line", "Timestamp", "Lattice Node ID", "Queried Node", "Query Answering Node", 0, 0);  
}

function drawChart(jsonData)
{	
	var jsonDataset = [];
	var totalSales = 0;
	var bestSellerDim = "";
	var bestSellerQty = 0;
	var worstSellerDim = "";
	var worstSellerQty = 999999999999;
	
	$.each(jsonData.queryResult, function (i, item) 
	{
		var keys = Object.keys(item);
		var labelStr = "";
		
		for(var i = 0; i < (keys.length - 1); i++)
		{
			if (item.hasOwnProperty(keys[i])) 
			{
				if(i == (keys.length - 2))
					labelStr += item[keys[i]];
				else
					labelStr += item[keys[i]] + ",";
					//console.log(key + " -> " + item[key]);
			}
		}		
		
		jsonDataset.push({label: labelStr, y: item.value });		
		totalSales += item.value;
		
		if(item.value > bestSellerQty)
		{
			bestSellerQty = item.value;
			bestSellerDim = labelStr;
		}
		
		if(item.value < worstSellerQty)
		{
			worstSellerQty = item.value;
			worstSellerDim = labelStr;
		}		
	});	

	populateLiveStatsIoI(jsonData.resultTimestamp, totalSales, bestSellerDim, bestSellerQty, worstSellerDim, worstSellerQty, jsonData.queriedNode, jsonData.queryAnsweringNode, jsonData.queryAnsweringTime);
	
	// Summary Chart Total sales w.r.t. complete IoI
	var tsIndexIoI = salesArr[1].indexOf(jsonData.resultTimestamp);	
	if(tsIndexIoI == -1) // If timestamp does not already exist
	{	
		salesArr[0].push(totalSales);
		salesArr[1].push(jsonData.resultTimestamp);	
		
		// Removing the Total sales which have gone beyond the timeSeriesLength
		if(salesArr[0].length > timeSeriesLength)
		{
			salesArr[0].shift(); // removes the oldest element
			salesArr[1].shift(); // removes the oldest element		
		}
	}
	else // if timestamp already exists
	{
		if(totalSales > salesArr[0][tsIndexIoI])
			salesArr[0][tsIndexIoI] = totalSales;
	}	
	//Finding the min and max in salesArr for yAxis
	var salesArrMax = 0;
	var salesArrMin = 999999999999;
	for(var i = 0; i < salesArr[0].length; i++)
	{
		if(salesArr[0][i] > salesArrMax)
			salesArrMax = salesArr[0][i];
		
		if(salesArr[0][i] < salesArrMin)
			salesArrMin = salesArr[0][i];
	}
	// Summary Chart Total sales w.r.t. complete IoI
	
	// Summary Chart w.r.t. Timestamp
	var timeValArr = groupDataWRTTimestamp(jsonData);	
	for(var i = 0; i < timeValArr[0].length; i++)
	{	
		var tsIndex = summaryWRTTime[1].indexOf(timeValArr[1][i]);
		if(tsIndex != -1) // if timestamp found then update value
		{
			if(timeValArr[0][i] > summaryWRTTime[0][tsIndex])
				summaryWRTTime[0][tsIndex] = timeValArr[0][i];			
		}
		else
		{
			summaryWRTTime[0].push(timeValArr[0][i]);
			summaryWRTTime[1].push(timeValArr[1][i]);			
		}
	}	
	// Removing the Total sales which have gone beyond the timeSeriesLength
	if(summaryWRTTime[0].length > timeSeriesLength)
	{
		while(summaryWRTTime[0].length > timeSeriesLength)
		{
			summaryWRTTime[0].shift(); // removes the oldest element
			summaryWRTTime[1].shift(); // removes the oldest element		
		}
	}	
	//Finding the min and max in summaryWRTTime for yAxis
	var summaryWRTTimeMax = 0;
	var summaryWRTTimeMin = 999999999999;
	for(var i = 0; i < summaryWRTTime[0].length; i++)
	{
		if(summaryWRTTime[0][i] > summaryWRTTimeMax)
			summaryWRTTimeMax = summaryWRTTime[0][i];
		
		if(summaryWRTTime[0][i] < summaryWRTTimeMin)
			summaryWRTTimeMin = summaryWRTTime[0][i];
	}
	// ~ Summary chart w.r.t. Timestamp
	
	// drawing chart	
	//alert(Math.round(Math.floor(0.9 * summaryWRTTimeMin * 100))/100);
	drawSimpleChart(jsonDataset, jsonData.resultTimestamp, "divSimpleChart", chartType, "Dimensions", "Sales Qty (Query)");	
	var timeGrainList = document.getElementById("timeGrainList");	
	drawTimeSeriesChart(summaryWRTTime, "divSummaryWRTTimeChart", "column", timeGrainList.options[timeGrainList.selectedIndex].text, "Sales Qty (Time Grain)", Math.floor(0.95 * summaryWRTTimeMin), Math.ceil(1.05 * summaryWRTTimeMax));
	drawTimeSeriesChart(salesArr, "divTimeSeriesChart", "line", "Timestamp", "Total Sales Qty (IoI)", Math.floor(0.95 * salesArrMin), Math.ceil(1.05 * salesArrMax) );
}

// -------------------- Charts --------------------- //

function drawSimpleChart(jsonDataset, resultTimestamp, divName, chartType, xAxisTitle, yAxisTitle)   
{
		
	var chart = new CanvasJS.Chart(divName, {
		theme: "theme2",//theme1
		
		zoomEnabled: true,
		panEnabled: true, 
		/*
		title:{
			text: "Timestamp:" + resultTimestamp,
			fontSize: 20,
			fontFamily: "times",
			fontColor: "#2193C3",
			fontWeight: "bold"
		},
		*/
		legend:{
			verticalAlign: "center",
			horizontalAlign: "left",
			fontSize: 10,
			fontFamily: "Helvetica"        
		},
		axisX:{
			title: xAxisTitle,
			fontSize: 10,
			fontFamily: "times",
			fontColor: "grey",
			fontWeight: "lighter",
			labelAngle: 165
			//labelAutoFit: true
			//interval: 1000
		},
		axisY:{
			title: yAxisTitle,
			fontSize: 10,
			fontFamily: "times",
			fontColor: "grey",
			fontWeight: "lighter"
		},
        toolTip:{
            shared: true
        },
		
		animationEnabled: false,   // change to true
				
		data: [              
				{
					// Change type to "bar", "area", "spline", "pie",etc.
					name: yAxisTitle,
					type: chartType,
					indexLabelFontFamily: "Garamond",       
					indexLabelFontSize: 20,
					indexLabel: indexLabelStr,
					startAngle:-20,      					
					dataPoints: jsonDataset
				}
			]
    });	
		
	chart.render();
	document.getElementById(divName).style.border = "1px solid black";
}


function drawMultiSeriesChart(chartArr, divName, chartType, xAxisTitle, yAxisTitle, series1Name, series2Name, yAxisMin, yAxisMax)  
{
	var data = []; 
	var dataSeries1 = {type: chartType, showInLegend: true, name: series1Name, lineThickness: 2, markerType: "triangle", color: "#F08080"};	
	var dataSeries2 = {type: chartType, showInLegend: true, name: series2Name, lineThickness: 2, markerType: "circle", color: "#20B2AA"};	
	
	var dataPointsArr = new Array();
	for(var i = 0; i < 2; i++)
		dataPointsArr[i] = new Array();		
	
	for(var i = 0; i < chartArr[0].length; i++)
	{	
		dataPointsArr[0].push({label:chartArr[2][i], y: chartArr[0][i]});		
		dataPointsArr[1].push({label:chartArr[2][i], y: chartArr[1][i]});		
	}
	
 	dataSeries1.dataPoints = dataPointsArr[0];	
	dataSeries2.dataPoints = dataPointsArr[1];	
	
 	data.push(dataSeries1); 
	data.push(dataSeries2); 
	
	var chart = new CanvasJS.Chart(divName,
	{
		zoomEnabled: true,
		panEnabled: true, 
		animationEnabled: false,
		title:{
			text: "",
			fontSize: 15,
			fontFamily: "times",
			fontColor: "#2193C3",
			fontWeight: "normal"
		},
		axisX:{
			title: xAxisTitle,
			fontSize: 10,
			fontFamily: "times",
			fontColor: "grey",
			fontWeight: "lighter",
			labelAngle: 135			
		},
		axisY:{
			//minimum: yAxisMin,
			//maximum: yAxisMax,			
			title: yAxisTitle,			
			fontSize: 10,
			fontFamily: "times",
			fontColor: "grey",
			fontWeight: "lighter"
		},		
		legend:{
			verticalAlign: "top",
			horizontalAlign: "center",					
			fontSize: 12,
			fontFamily: "times"		 
		},
		theme: "theme1",
        toolTip:{ shared: true },
		data: data, 		
	});
	chart.render();
	document.getElementById(divName).style.border = "1px solid black";
}

 function drawTimeSeriesChart(salesArr, divName, chartType, xAxisTitle, yAxisTitle, yAxisMin, yAxisMax)  
 {
	var data = []; 
	var dataSeries = { type: chartType, showInLegend: false, name: yAxisTitle};	
	
	var dataPointsArr = new Array();
	for(var i = 0; i < salesNestedArrLength; i++)
		dataPointsArr[i] = new Array();		
	
	for(var i = 0; i < salesArr[0].length; i++)
	{		
		//dataPointsArr[0].push({label:salesArr[1][i], y: Math.round(salesArr[0][i])});		
		dataPointsArr[0].push({label:salesArr[1][i], y: salesArr[0][i]});		
	}
	
 	dataSeries.dataPoints = dataPointsArr[0];	
 	data.push(dataSeries); 
	
	var chart = new CanvasJS.Chart(divName,
	{
		zoomEnabled: true,
		panEnabled: true, 
		title:{
			text: "",
			fontSize: 15,
			fontFamily: "times",
			fontColor: "#2193C3",
			fontWeight: "normal"
		},				
		legend: {
			verticalAlign: "top",
			horizontalAlign: "center",					
			fontSize: 11,
			fontFamily: "times",
			fontColor: "grey"			 
		},
		axisX:{
			title: xAxisTitle,
			fontSize: 10,
			fontFamily: "times",
			fontColor: "grey",
			fontWeight: "lighter",
			labelAngle: 135			
		},
		axisY:{
			minimum: yAxisMin,
			maximum: yAxisMax,
			valueFormatString: "##0.0E+0",
			title: yAxisTitle,			
			fontSize: 10,
			fontFamily: "times",
			fontColor: "grey",
			fontWeight: "lighter"
		},
		
		theme: "theme1",
        toolTip:{ shared: true },
		data: data,  
    });
	chart.render();
	document.getElementById(divName).style.border = "1px solid black";
}