/**
 * Common Functions
 *
 * Author: Salman Ahmed Shaikh
 * Date created: 16th November, 2016
 *
 */
 
// Global variables
var periodicQueryExecutionID;
var callbackArgumentGlobal;
var queryExecutionInterval = 2000; // 1 second = 1000
var isPaused = false;
var isFirstPeriodicExecution = true;
var dimensionNames = new Array();
var latticeNodeDims = new Array();
var latticeNodeIDs = new Array();
var httpPostRequestStatus = new Array();
var postURLAndPort = "http://192.168.0.150:8085/";
//var postURLAndPort = "http://130.158.76.30:8085/";

function initializeOLAPGUI() 
{
	throb = Throbber({
    color: '#E8E8E8',
    padding: 10,
    size: 40,
    fade: 100,
    clockwise: true
	});
	throb.appendTo(document.getElementById('throbberDiv'));
	
	document.getElementById("btnPause").disabled = true;					
	document.getElementById("btnStop").disabled = true;		
	document.getElementById("divChartButtons").style.visibility = 'hidden';
	
	//Populating lattice node list (Query list)
	httpPostRequest("OLAPGetLattice", "NoTextToSend", httpPostRequestCb, "latticeNodeList");
}

function getLatticeWithInfo() 
{		
	httpPostRequest("OLAPGetLatticeWithInfo", "NoTextToSend", httpPostRequestCb, "latticeNodeListWithInfo");	
}


function initializeSubmitQuery()
{	
	httpPostRequest("JsOLAPStatus", "NoTextToSend", httpPostRequestCb, "JsSpinnerStatus");	
	document.getElementById("queryTextArea").innerHTML = "stream1 = readFromWrapper (\"salesStream\");\ \n dim1 = read (\"productDimension\");\ \n dim2 = read (\"supplierDimension\");\ \n dim3 = read (\"promotionDimension\");\ \n dim4 = read (\"customerDimension\");\ \n dim5 = read (\"storeDimension\");\ \n tmp1 = stream1 -> window[rows 10000];\ \n j1 = join f in tmp1, d1 in dim1 where f.prodID == d1.prodID into {f.prodID, d1.prodName, f.suppID, f.promoID, f.custID, f.storeID, f.salesAmountFACT};\ \n j2 = join r in j1, d2 in dim2 where r.suppID == d2.suppID into {r.prodID, r.prodName, r.suppID, d2.suppName, r.promoID, r.custID, r.storeID, r.salesAmountFACT};\ \n j3 = join s in j2, d3 in dim3 where s.promoID == d3.promoID into {s.prodID, s.prodName, s.suppID, s.suppName, s.promoID, s.custID, s.storeID, s.salesAmountFACT};\ \n j4 = join t in j3, d4 in dim4 where t.custID == d4.custID into {t.prodID, t.prodName, t.suppID, t.suppName, t.promoID, t.custID, t.storeID, t.salesAmountFACT};\ \n j5 = join u in j4, d5 in dim5 where u.storeID == d5.storeID into {u.prodID, u.prodName, u.suppID, u.suppName, u.promoID, u.custID, u.storeID, u.salesAmountFACT};\ \n j5 -> cubify(cubify.conf);";	
	document.getElementById("configFileTextArea").innerHTML = "#Dimension names for GUI\nDimensionNames = Product, Supplier, Promotion, Customer, Store\n\n#Dimension attributes with hierarchy\nDimensions = prodID, suppID, promoID, custID, storeID\n\n#Vertices to materialize\nMVertices = prodID\n\n#Time Granularity: Second, Minute, Hour\nTimeGrain = Second";	
	document.getElementById("btnGetLatticeWithInfo").disabled = true;			
 }
 
function selectQuery()
{	
	var selectedVal = document.getElementById("queryList").value;
	if(selectedVal == "syntheticDataQuery")		
	{
		document.getElementById("queryTextArea").innerHTML = "";
		document.getElementById("queryTextArea").innerHTML = "stream1 = readFromWrapper (\"salesStream\");\ \n dim1 = read (\"productDimension\");\ \n dim2 = read (\"supplierDimension\");\ \n dim3 = read (\"promotionDimension\");\ \n dim4 = read (\"customerDimension\");\ \n dim5 = read (\"storeDimension\");\ \n tmp1 = stream1 -> window[rows 10000];\ \n j1 = join f in tmp1, d1 in dim1 where f.prodID == d1.prodID into {f.prodID, d1.prodName, f.suppID, f.promoID, f.custID, f.storeID, f.salesAmountFACT};\ \n j2 = join r in j1, d2 in dim2 where r.suppID == d2.suppID into {r.prodID, r.prodName, r.suppID, d2.suppName, r.promoID, r.custID, r.storeID, r.salesAmountFACT};\ \n j3 = join s in j2, d3 in dim3 where s.promoID == d3.promoID into {s.prodID, s.prodName, s.suppID, s.suppName, s.promoID, s.custID, s.storeID, s.salesAmountFACT};\ \n j4 = join t in j3, d4 in dim4 where t.custID == d4.custID into {t.prodID, t.prodName, t.suppID, t.suppName, t.promoID, t.custID, t.storeID, t.salesAmountFACT};\ \n j5 = join u in j4, d5 in dim5 where u.storeID == d5.storeID into {u.prodID, u.prodName, u.suppID, u.suppName, u.promoID, u.custID, u.storeID, u.salesAmountFACT};\ \n j5 -> cubify(cubify.conf);";	
		
		document.getElementById("configFileTextArea").innerHTML = "";
		document.getElementById("configFileTextArea").innerHTML = "#Dimension names for GUI\nDimensionNames = Product, Supplier, Promotion, Customer, Store\n\n#Dimension attributes with hierarchy\nDimensions = prodID, suppID, promoID, custID, storeID\n\n#Vertices to materialize\nMVertices = prodID\n\n#Time Granularity: Second, Minute, Hour\nTimeGrain = Second";	
	}
	else if(selectedVal == "TPCHDataQuery")		
	{
		document.getElementById("queryTextArea").innerHTML = "";
		document.getElementById("queryTextArea").innerHTML = "stream1 = readFromWrapper (\"lineOrderStream\");\ \n dim1 = read (\"partDimension\");\ \n dim2 = read (\"supplierDimension\");\ \n dim3 = read (\"storeDimension\");\ \n dim4 = read (\"customerDimension\");\ \n tmp1 = stream1 -> window[rows 10000];\ \n j1 = join f in tmp1, d1 in dim1 where f.prodID == d1.prodID into {f.prodID, d1.prodName, f.suppID, f.promoID, f.custID, f.storeID, f.salesAmountFACT};\ \n j2 = join r in j1, d2 in dim2 where r.suppID == d2.suppID into {r.prodID, r.prodName, r.suppID, d2.suppName, r.promoID, r.custID, r.storeID, r.salesAmountFACT};\ \n j3 = join s in j2, d3 in dim3 where s.promoID == d3.promoID into {s.prodID, s.prodName, s.suppID, s.suppName, s.promoID, s.custID, s.storeID, s.salesAmountFACT};\ \n j4 = join t in j3, d4 in dim4 where t.custID == d4.custID into {t.prodID, t.prodName, t.suppID, t.suppName, t.promoID, t.custID, t.storeID, t.salesAmountFACT};\ \n j4 -> cubify(cubify.conf);";
		
		document.getElementById("configFileTextArea").innerHTML = "";
		document.getElementById("configFileTextArea").innerHTML = "#Dimension names for GUI\nDimensionNames = Part, Supplier, Customer, Store\n\n#Dimension attributes with hierarchy\nDimensions = partKey, suppKey, custKey, storeKey\n\n#Vertices to materialize\nMVertices = partKey\n\n#Time Granularity: Second, Minute, Hour\nTimeGrain = Second";	
	}
	else if(selectedVal == "typeQuery")		
	{
		document.getElementById("queryTextArea").innerHTML = "Type your query here.";
		document.getElementById("configFileTextArea").innerHTML = "";
		document.getElementById("configFileTextArea").innerHTML = "# List Dimension table names separated by commas as follows\nDimensionNames = Dim1, Dim2, ...\n\nList Dimension table keys separated by commas as follows\nDimensions = Dim1Key, Dim2Key, ...\n\n#Vertices to materialize\nMVertices = Dim1Key\n\n#Time Granularity: Second, Minute, Hour\nTimeGrain = Second";	
	}
}

function stopQuery()
{
	var queryID = 0;	
	requestBody = "-----------------------------19588288329222{\"queryID\":" + queryID + "}-----------------------------19588288329222";	
	httpPostRequest("stopQuery", requestBody, httpPostRequestCb, "stopQueryStatus");	
}

function submitQuery()
{
	// Send config file before sending query contents	
	var configFileLines = document.getElementById('configFileTextArea').value.split('\n');	
	var configFileBodyStr = "";
	for(var i = 0; i < configFileLines.length; i++)
	{
		configFileBodyStr += configFileLines[i] + "$";
	}	
	httpPostRequest("generateConfigFile", configFileBodyStr, httpPostRequestCb, "generateConfigFileStatus");
	
	var selectedVal = document.getElementById("queryList").value;
	var QIR = "";
	
	if(selectedVal == "syntheticDataQuery")		
	{
		// Query on Synthetic data with 5 dims
		QIR = "{\"type\":\"root\",\"input\":{\"type\":\"cubify\",\"input\":{\"type\":\"join\",\"left_join_attribute\":[\"promoID\"],\"right_join_attribute\":[\"promoID\"],\"left_outer\":false,\"right_outer\":false,\"projection\":{\"type\":\"projection_obj\",\"projection_type\":\"object\",\"fields\":[{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"prodID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"prodName\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"suppID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"suppName\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"promoID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"promoName\"],\"attribute_source\":\"right\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"custID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"custName\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"storeID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"storeArea\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"salesAmountFACT\"],\"attribute_source\":\"left\"}}]},\"left_input\":{\"type\":\"join\",\"left_join_attribute\":[\"suppID\"],\"right_join_attribute\":[\"suppID\"],\"left_outer\":false,\"right_outer\":false,\"projection\":{\"type\":\"projection_obj\",\"projection_type\":\"object\",\"fields\":[{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"prodID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"prodName\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"suppID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"suppName\"],\"attribute_source\":\"right\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"promoID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"custID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"custName\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"storeID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"storeArea\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"salesAmountFACT\"],\"attribute_source\":\"left\"}}]},\"left_input\":{\"type\":\"join\",\"left_join_attribute\":[\"prodID\"],\"right_join_attribute\":[\"prodID\"],\"left_outer\":false,\"right_outer\":false,\"projection\":{\"type\":\"projection_obj\",\"projection_type\":\"object\",\"fields\":[{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"prodID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"prodName\"],\"attribute_source\":\"right\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"suppID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"promoID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"custID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"custName\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"storeID\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"storeArea\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"salesAmountFACT\"],\"attribute_source\":\"left\"}}]},\"left_input\":{\"type\":\"rowwindow\",\"windowsize\":100,\"input\":{\"type\":\"leaf\",\"stream_source\":\"salesFact5DimWNamesWrapper\",\"is_master\":true}},\"right_input\":{\"type\":\"csv_leaf\",\"csv_source\":\"productDimension\"}},\"right_input\":{\"type\":\"csv_leaf\",\"csv_source\":\"supplierDimension\"}},\"right_input\":{\"type\":\"csv_leaf\",\"csv_source\":\"promotionDimension\"}}}}";
	}
	else if(selectedVal == "TPCHDataQuery")		
	{
		// Query on TPCH data with 4 dims
		QIR = "{\"type\":\"root\",\"input\":{\"type\":\"cubify\",\"input\":{\"type\":\"join\",\"left_join_attribute\":[\"custKey\"],\"right_join_attribute\":[\"custKey\"],\"left_outer\":false,\"right_outer\":false,\"projection\":{\"type\":\"projection_obj\",\"projection_type\":\"object\",\"fields\":[{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"partKey\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"partName\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"suppKey\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"suppName\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"custKey\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"custName\"],\"attribute_source\":\"right\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"storeKey\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"storeArea\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"salesQtyFACT\"],\"attribute_source\":\"left\"}}]},\"left_input\":{\"type\":\"join\",\"left_join_attribute\":[\"suppKey\"],\"right_join_attribute\":[\"suppKey\"],\"left_outer\":false,\"right_outer\":false,\"projection\":{\"type\":\"projection_obj\",\"projection_type\":\"object\",\"fields\":[{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"partKey\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"partName\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"suppKey\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"suppName\"],\"attribute_source\":\"right\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"custKey\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"storeKey\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"storeArea\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"salesQtyFACT\"],\"attribute_source\":\"left\"}}]},\"left_input\":{\"type\":\"join\",\"left_join_attribute\":[\"partKey\"],\"right_join_attribute\":[\"partKey\"],\"left_outer\":false,\"right_outer\":false,\"projection\":{\"type\":\"projection_obj\",\"projection_type\":\"object\",\"fields\":[{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"partKey\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"partName\"],\"attribute_source\":\"right\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"suppKey\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"custKey\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"storeKey\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"storeArea\"],\"attribute_source\":\"left\"}},{\"type\":\"projection_obj\",\"need_rename\":false,\"projection_type\":\"direct\",\"expression\":{\"type\":\"expression_obj\",\"expression_type\":\"id\",\"id_name\":[\"salesQtyFACT\"],\"attribute_source\":\"left\"}}]},\"left_input\":{\"type\":\"rowwindow\",\"windowsize\":100,\"input\":{\"type\":\"leaf\",\"stream_source\":\"salesFact4DimTPCH\",\"is_master\":true}},\"right_input\":{\"type\":\"csv_leaf\",\"csv_source\":\"PartDimensionTPCH\"}},\"right_input\":{\"type\":\"csv_leaf\",\"csv_source\":\"SupplierDimensionTPCH\"}},\"right_input\":{\"type\":\"csv_leaf\",\"csv_source\":\"CustomerDimensionTPCH\"}}}}";
	}
	else if(selectedVal == "typeQuery")		
	{
		QIR = document.getElementById("queryTextArea").innerHTML;
	}
	var requestBody = "-----------------------------19588288329222" + QIR + "-----------------------------19588288329222";
	//alert(requestBody);
	httpPostRequest("submitInitialOLAPQuery", requestBody, httpPostRequestCb, "querySubmissionStatus");	

	setTimeout(function()
					{ 
						//Populate OLAP Lattice Table
						httpPostRequest("OLAPGetLatticeWithInfo", "NoTextToSend", httpPostRequestCb, "latticeNodeListWithInfo");						
						
						// Initialize OLAP GUI
						initializeOLAPGUI();	
						
					}, 1000);
}

//var populateLatticeNodeListCb = function(xhrResponseText) 
function httpPostRequestCb(callbackArgument, xhrResponseText)
{	
	if(callbackArgument == "latticeNodeList")
	{
		throb.stop();
		populateDropdown(callbackArgument, xhrResponseText);		
	}
	else if(callbackArgument == "OLAPQueryResult" || callbackArgument == "OLAPQueryDrilldown" || callbackArgument == "OLAPQueryRollup" || callbackArgument == "OLAPQueryTimeGrain")
	{
		throb.stop();
		if(isFirstPeriodicExecution)
		{			
			if(callbackArgument == "OLAPQueryDrilldown")
			{			
				document.getElementById("latticeNodeList").value = document.getElementById("drilldownList").value;				
			}
			else if(callbackArgument == "OLAPQueryRollup")
			{
				document.getElementById("latticeNodeList").value = document.getElementById("rollupList").value;					
			}			
			else if(callbackArgument == "OLAPQueryTimeGrain")
			{
				document.getElementById("OLAPOpTimeGrainList").value = "OLAPOpTimeGrainListDefault";					
				clearSummaryWRTTimeChart();
			}
		}
		
		var JSONObj = JSON.parse(xhrResponseText);
		// Sorting result w.r.t. timestamp
		JSONObj.queryResult.sort( function(a, b) { return parseFloat(a.timestamp) - parseFloat(b.timestamp); } );
		// console.log(JSONObj.resultTimestamp);
		// Table need to be updated every time, no matter if it isFirstPeriodicExecution 		
		displayAsTable(JSONObj.queryResult, "divTable");	
		// Chart also need to be updated every time
		drawChart(JSONObj);
		
		if(isFirstPeriodicExecution)
		{
			requestBody = "-----------------------------19588288329222{\"nodeID\":" + document.getElementById("latticeNodeList").value + "}-----------------------------19588288329222";
			httpPostRequest("OLAPDrilldown", requestBody, httpPostRequestCb, "drilldownList");				
			
			isFirstPeriodicExecution = false; // Next it will be second periodic execution
			document.getElementById("divChartButtons").style.visibility = 'visible';
		}
	}
	else if(callbackArgument == "drilldownList")
	{	
		throb.stop();
		populateDropdown(callbackArgument, xhrResponseText);
		requestBody = "-----------------------------19588288329222{\"nodeID\":" + document.getElementById("latticeNodeList").value + "}-----------------------------19588288329222";
		httpPostRequest("OLAPRollup", requestBody, httpPostRequestCb, "rollupList");		
	}
	else if(callbackArgument == "rollupList")
	{
		throb.stop();
		populateDropdown(callbackArgument, xhrResponseText);				
	}
	else if(callbackArgument == "querySubmissionStatus")
	{	
		var JSONObj = JSON.parse(xhrResponseText);		
		if(JSONObj._status == "Query Submitted")
		{
			document.getElementById("btnSubmitQuery").disabled = true;			
			document.getElementById("btnGetLatticeWithInfo").disabled = false;	
			httpPostRequest("OLAPGetLatticeWithInfo", "NoTextToSend", httpPostRequestCb, "latticeNodeListWithInfo");	
			
			document.getElementById("lblJSONQueryStatusVal").style.color = "#4CAF50";
			document.getElementById("lblJSONQueryStatusVal").innerText = JSONObj._status;	
		}	
	}
	else if(callbackArgument == "JsSpinnerStatus")
	{
		var JSONObj = JSON.parse(xhrResponseText);		
		if(JSONObj._status == "Running")
		{
			document.getElementById("lblJsSpinnerStatusVal").style.color = "#4CAF50";
			document.getElementById("lblJsSpinnerStatusVal").innerText = JSONObj._status;	
		}	
		
		if(JSONObj.numOfQueriesInExecution > 0)
		{
			document.getElementById("btnSubmitQuery").disabled = true;
			document.getElementById("btnGetLatticeWithInfo").disabled = false;			
			httpPostRequest("OLAPGetLatticeWithInfo", "NoTextToSend", httpPostRequestCb, "latticeNodeListWithInfo");	
			
			document.getElementById("lblJSONQueryStatusVal").style.color = "#4CAF50";
			document.getElementById("lblJSONQueryStatusVal").innerText = "Query in Execution.";	
			initializeOLAPGUI();
		}	
	}
	else if(callbackArgument == "latticeNodeListWithInfo")
	{		
		var JSONObj = JSON.parse(xhrResponseText);				
		displayAsTable(JSONObj.latticeNodes, "divOLAPLatticeTable");
	}
	else if(callbackArgument == "generateConfigFileStatus")
	{}
	else if(callbackArgument == "stopQueryStatus")
	{
		var JSONObj = JSON.parse(xhrResponseText);				
		document.getElementById("lblJSONQueryStatusVal").style.color = "#4CAF50";
		document.getElementById("lblJSONQueryStatusVal").innerText = JSONObj._status;			
	}
}

function displayAsTable(jsonData, elementID)
{	
	//console.log(jsonData);
	document.getElementById(elementID).innerHTML = "";
	document.getElementById(elementID).appendChild(buildHtmlTable(jsonData));	
	document.getElementById(elementID).style.border = "1px solid black";
}

function httpPostRequest(postCommand, requestBody, callbackFunction, callbackArgument)
{
	//alert(postCommand + "\n" + requestBody + "\n" + callbackArgument);	
	//console.log(requestBody);
	if(postCommand == "OLAPQuery") // Periodic Execution: Only the OLAP query needs to be executed periodically
	{
		// Saving the state of current httpPostRequest
		httpPostRequestStatus[0] = postCommand;
		httpPostRequestStatus[1] = requestBody;
		//httpPostRequestStatus[2] = callbackFunction;
		httpPostRequestStatus[2] = callbackArgument;
		// ~ Saving the state of current httpPostRequest
	
		clearInterval(periodicQueryExecutionID);		
		callbackArgumentGlobal = callbackArgument;		
		periodicQueryExecutionID = setInterval(function (){															
															var postURL = postURLAndPort + "OLAPQuery";
															var xhr = new XMLHttpRequest();
															 
															xhr.open("POST", postURL, true);
															xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");  
															
															xhr.onerror = function() 
															{	
																//throb.stop();
																console.log("Network error: Server not available!"); 
																clearInterval(periodicQueryExecutionID);
																//refresh browser
																javascript:history.go(0);
																return;
															};
															
															xhr.onreadystatechange = function()
															{	
																if(xhr.readyState == 4 && xhr.status == 200)        
																{	
																	var xhrResponseText = xhr.responseText;
																	//console.log(xhrResponseText);			
																	//throb.stop();	
																	callbackFunction.apply(this,[callbackArgumentGlobal, xhrResponseText]);
																}
															};
	
															xhr.send(requestBody.replace(/(\r\n|\n|\r)/gm,""));		
														  }, queryExecutionInterval);
	}
	else // One-time Execution
	{		
		var postURL = postURLAndPort + postCommand;
		var xhr = new XMLHttpRequest();
		xhr.open("POST",postURL,true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");  
		
		xhr.onerror = function() 
		{	
			//throb.stop();
			//alert("Network error: Server not available!");
			console.log("Network error: Server not available!"); 
			clearInterval(periodicQueryExecutionID);
			//refresh browser
			//javascript:history.go(0);
			return;
		};
		
		xhr.onreadystatechange = function()
		{	
			if(xhr.readyState == 4 && xhr.status == 200)        
			{	
				var xhrResponseText = xhr.responseText;
				//console.log(xhrResponseText);			
				//throb.stop();	
				callbackFunction.apply(this,[callbackArgument, xhrResponseText]);
			}
		};
		xhr.send(requestBody.replace(/(\r\n|\n|\r)/gm,""));
	}
}

function refreshBrowser()
{
	javascript:history.go(0);	
}

function populateDropdown(dropdownID, jsonText)
{	
	var JSONObj = JSON.parse(jsonText);	
	var dropdown = document.getElementById(dropdownID);
	//console.log(JSONObj.dimensionNames);	
	
	// Optional: Clear all existing values first:
	dropdown.innerHTML = "";
	
	if(dropdownID == "drilldownList")
	{		
		dropdown.innerHTML += "<option value=\"drilldownListDefault\" selected>Drilldown</option>";
	}
	else if(dropdownID == "rollupList")
	{
		dropdown.innerHTML += "<option value=\"rollupListDefault\" selected>Rollup</option>";
	}
	
	// Populate list with values:
	for(var i = 0; i < JSONObj.latticeNodes.length; i++) 
	{		
		dropdown.innerHTML += "<option value=\"" + JSONObj.latticeNodes[i].nodeID + "\">" + JSONObj.latticeNodes[i].nodeAttributes + "</option>";
		
		if(dropdownID == "latticeNodeList")
		{	
			latticeNodeDims[i] = JSONObj.latticeNodes[i].nodeAttributes;
			latticeNodeIDs[i] = JSONObj.latticeNodes[i].nodeID;
		}
	}	
	
	if(dropdownID == "latticeNodeList")
	{
		addQueryDimensions(JSONObj);
	}
}

function dimCheckboxChange(chkboxElement)
{	
	var dimSelectElement = document.getElementById("lst"+chkboxElement.id);
	
	if(dimSelectElement.disabled)
		dimSelectElement.disabled = false;
	else
		dimSelectElement.disabled = true;
}

function addQueryDimensions(JSONObj)
{	
	var divLatticeDims = document.getElementById("divLatticeDimensions");
	var divLatticeStr = "";
	// Adding Dimension Checkboxes
	divLatticeStr = "<table valign=\"top\" style=\"width:100\%;\"  cellspacing=\"0\" cellpadding=\"0\" border=\"0\";><tr>";	
	for(var i = 0; i < JSONObj.dimensionNames.length; i++) 
	{		
		divLatticeStr += "<td width = \"20\%\"> <input type=\"checkbox\" onchange=\"dimCheckboxChange(this)\" id=\"" + JSONObj.dimensionNames[i].dimName + "\" value=\"" + JSONObj.dimensionNames[i].dimName  + "\" ><font class=\"labelHeading\">" + JSONObj.dimensionNames[i].dimName + "</font> \&nbsp\;</td>";
		dimensionNames[i] = JSONObj.dimensionNames[i].dimName;
	}	
	divLatticeStr += "</tr><tr>";
	
	for(var i = 0; i < JSONObj.dimensions.length; i++) 
	{	
		var selectList = "";		
		//selectList = "<td><select id=\"lst" + JSONObj.dimensionNames[i].dimName + "\" style=\"width:97\%\" > <option value=\"default\" selected>" + JSONObj.dimensionNames[i].dimName + "</option>";	
		selectList = "<td><select id=\"lst" + JSONObj.dimensionNames[i].dimName + "\" style=\"width:97\%\" disabled> <option value=\"default\" selected> Attribute </option>";	
		selectList += "<option value=\"" + JSONObj.dimensions[i].dimAttribute + "\">" + JSONObj.dimensions[i].dimAttribute + "</option>";
		selectList += "</select></td>";
		
		divLatticeStr += selectList;
	}	
	
	divLatticeStr += "</tr></table>";		
	divLatticeDims.innerHTML = "";
	divLatticeDims.innerHTML += divLatticeStr;
	
}

function executePause()
{
	clearInterval(periodicQueryExecutionID);
	document.getElementById("btnPause").disabled = true;
	document.getElementById("btnSubmit").disabled = false;	
	isPaused = true;
}

function executeStop()
{	
	document.getElementById("btnSubmit").disabled = false;
	document.getElementById("btnPause").disabled = true;					
	document.getElementById("btnStop").disabled = true;	
	isPaused = false;
	
	clearInterval(periodicQueryExecutionID);
}

function executeQuery(queryType)
{	
	var requestBody = "";	
	isFirstPeriodicExecution = true;
	document.getElementById("btnSubmit").disabled = true;			
	document.getElementById("btnPause").disabled = false;									
	document.getElementById("btnStop").disabled = false;
	
	if(isPaused) // Resume it
	{		
		isPaused = false;	
		isFirstPeriodicExecution = false;		
		
		httpPostRequest(httpPostRequestStatus[0], httpPostRequestStatus[1], httpPostRequestCb, httpPostRequestStatus[2]);
		return;
	}
	
	if(queryType == "btnSubmit")
	{
		var queryDims = getCheckedDimensions();
		var queryNodeID = getNodeIDByQuerySelection(queryDims);
		
		if(queryNodeID != -1)
		{
			//requestBody = "-----------------------------19588288329222{\"nodeID\":" + document.getElementById("latticeNodeList").value + ", \"aggrOp\":\"" + document.getElementById("aggrOpList").value + "\"}-----------------------------19588288329222";							
			requestBody = "-----------------------------19588288329222{\"nodeID\":" + queryNodeID + ", \"aggrOp\":\"" + document.getElementById("aggrOpList").value + "\", \"timeGrain\":\"" + document.getElementById("timeGrainList").value + "\"}-----------------------------19588288329222";	
			httpPostRequest("OLAPQuery", requestBody, httpPostRequestCb, "OLAPQueryResult");																	
		}
		else
		{
			document.getElementById("btnSubmit").disabled = false;			
			document.getElementById("btnPause").disabled = true;									
			document.getElementById("btnStop").disabled = true;
			alert("Invalid Query " + queryNodeID);
			return;
		}
	}
	else if(queryType == "drilldownList") // If query is triggered by selecting drilldown list from the GUI
	{	
		clearInterval(periodicQueryExecutionID);	
		requestBody = "-----------------------------19588288329222{\"nodeID\":" + document.getElementById(queryType).value + ", \"aggrOp\":\"" + document.getElementById("aggrOpList").value + "\", \"timeGrain\":\"" + document.getElementById("timeGrainList").value + "\"}-----------------------------19588288329222";						
		httpPostRequest("OLAPQuery", requestBody, httpPostRequestCb, "OLAPQueryDrilldown");	
	}	
	else if(queryType == "rollupList") // If query is triggered by selecting rollup list from the GUI
	{	
		clearInterval(periodicQueryExecutionID);	
		requestBody = "-----------------------------19588288329222{\"nodeID\":" + document.getElementById(queryType).value + ", \"aggrOp\":\"" + document.getElementById("aggrOpList").value + "\", \"timeGrain\":\"" + document.getElementById("timeGrainList").value + "\"}-----------------------------19588288329222";					
		httpPostRequest("OLAPQuery", requestBody, httpPostRequestCb, "OLAPQueryRollup")														
	}
	else if(queryType == "OLAPOpTimeGrainList") // If query is triggered by selecting timeGrainList list from the GUI
	{	
		clearInterval(periodicQueryExecutionID);	
		document.getElementById("timeGrainList").value = document.getElementById("OLAPOpTimeGrainList").value;					
		requestBody = "-----------------------------19588288329222{\"nodeID\":" + document.getElementById("latticeNodeList").value + ", \"aggrOp\":\"" + document.getElementById("aggrOpList").value + "\", \"timeGrain\":\"" + document.getElementById("timeGrainList").value + "\"}-----------------------------19588288329222";					
		httpPostRequest("OLAPQuery", requestBody, httpPostRequestCb, "OLAPQueryTimeGrain")														
	}
	else
	{
		alert("Invalid Query Type.");
	}
}

function populateLiveStatsIoI(resultTimestamp, salesQtyTotal, bestSellerDim, bestSellerQty, worstSellerDim, worstSellerQty, queriedNode, queryAnsweringNode, queryAnsweringTime)
{	
	document.getElementById('lblResultTimestampVal').innerHTML = resultTimestamp;
	document.getElementById('lblTotalSalesQtyIoIVal').innerHTML = salesQtyTotal;
	document.getElementById('lblBestSellerDimVal').innerHTML = bestSellerDim;
	document.getElementById('lblBestSellerQtyVal').innerHTML = bestSellerQty;
	document.getElementById('lblWorstSellerDimVal').innerHTML = worstSellerDim;
	document.getElementById('lblWorstSellerQtyVal').innerHTML = worstSellerQty;	
	
	//document.getElementById('lblQueriedNodeVal').innerHTML = queriedNode;	
	//document.getElementById('lblQueryAnsweringNodeVal').innerHTML = queryAnsweringNode;	
	//document.getElementById('lblQueryAnsweringTimeVal').innerHTML = queryAnsweringTime + " seconds";

	queryExecTimeChart(queriedNode, queryAnsweringNode, queryAnsweringTime, resultTimestamp);
}
 
function getCheckedDimensions()
{
	var queryDims = new Array();
	
	// Getting all checked dimensions 
	for(var i = 0; i < dimensionNames.length; i++) 
	{
		var dimensionChkbox = document.getElementById(dimensionNames[i]);		
		if (dimensionChkbox.checked) 
		{
			var dimSelectedValue = document.getElementById("lst"+dimensionNames[i]).value;
            // If user did not select any attribute
			if(dimSelectedValue == "default")
			{
				alert("Please select the " + dimensionNames[i] + " dimension attribute.");
				return;				
			}
			else
			{	
				queryDims.push(dimSelectedValue);						
			}
        } 		
	}
	
	return queryDims;	
}

function getNodeIDByQuerySelection(queryDims)
{
	//var candidateNodeIDs = new Array();
	var latticeNodeDimsArray = new Array();	
	var queryNodeID = -1;
	
	// Parsing all lattice nodes
	for(var j = 0; j < latticeNodeDims.length; j++) 
	{
		latticeNodeDimsArray[j] = latticeNodeDims[j].split(",");		
	}
	
	for(var j = 0; j < latticeNodeDimsArray.length; j++) 
	{	
		if(queryDims.length == latticeNodeDimsArray[j].length)
		{
			var matchCount = 0;
			for(var x = 0; x < queryDims.length; x++) 
			{
				for(var y = 0; y < latticeNodeDimsArray[j].length; y++) 
				{
					//console.log(queryDims[x]);
					//console.log(latticeNodeDimsArray[j][y]);					
					//if(latticeNodeDimsArray[j][y].search(queryDims[x]) != -1)
					if(queryDims[x].trim() == latticeNodeDimsArray[j][y].trim())					
						matchCount++;
				}
			}
			
			if(matchCount == queryDims.length)
			{
				queryNodeID = latticeNodeIDs[j];
				//console.log(latticeNodeDimsArray[j]);
				//console.log(latticeNodeIDs[j]);				
				document.getElementById("latticeNodeList").value = latticeNodeIDs[j];
				
				return latticeNodeIDs[j];
			}
		}
	}
	
	return -1;
}

$(document).ready(function () {
    $(document).on("scroll", onScroll);
    
    //smoothscroll
    $('a[href^="#"]').on('click', function (e) {
        e.preventDefault();
        $(document).off("scroll");
        
        $('a').each(function () {
            $(this).removeClass('active');
        })
        $(this).addClass('active');
      
        var target = this.hash,
            menu = target;
        $target = $(target);
        $('html, body').stop().animate({
            'scrollTop': $target.offset().top-45
        }, 500, 'swing', function () {
            window.location.hash = target;
            $(document).on("scroll", onScroll);
        });
    });
});

function onScroll(event){	
    var scrollPos = $(document).scrollTop();	
    $('#menu-top a').each(function () {
        var currLink = $(this);		
        var refElement = $(currLink.attr("href"));
		//alert(refElement.position().top + ", " + refElement.position().top + refElement.height());
        if (refElement.position().top <= scrollPos + 45 && refElement.position().top + refElement.height() > scrollPos ) {
            $('#menu-top ul li a').removeClass("active");
            currLink.addClass("active");
        }
        else{
            currLink.removeClass("active");
        }
    });
}