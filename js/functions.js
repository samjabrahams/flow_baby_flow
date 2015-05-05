		/***********************************************
		* Drop Down Date select script- by JavaScriptKit.com
		* This notice MUST stay intact for use
		* Visit JavaScript Kit at http://www.javascriptkit.com/ for this script and more
		***********************************************/

	var monthtext=["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

	function populatedropdown(dayfield, monthfield, yearfield){

		var yearWanted = 2011;
		var monthWanted = "10";
		var dayWanted = "01";

		var today=new Date();
		var dayfield=document.getElementById(dayfield);
		var monthfield=document.getElementById(monthfield);
		var yearfield=document.getElementById(yearfield);
		for (var i=0; i<31; i++)
		dayfield.options[i]=new Option(i+1, i+1);
		//ayfield.options[0]=new Option(dayWanted, dayWanted, true, true) ;//select today's day
		for (var m=0; m<12; m++)
		monthfield.options[m]=new Option(monthtext[m], monthtext[m]);
		monthfield.options[monthWanted - 1]=new Option(monthWanted, monthWanted, true, true) ;//select today's month
		var thisyear=2011;
		var myyear = thisyear - 10;
		for (var y=0; y<10; y++){
		yearfield.options[y]=new Option(myyear, myyear)
		myyear+=1
		}
		yearfield.options[yearfield.options.length]=new Option(2011, 2011, true, true) //select today's year
	}