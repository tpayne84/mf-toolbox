( function( localization, $, undefined ) {

	// initialize.
	localization.initialize = function( shellFrame )
	{
		// Get
		this.vault = shellFrame.ShellUI.Vault;
		this.shellFrame = shellFrame;

		this.resources = {};	
    };
	
	// getDateFormat.
	localization.getDateFormat = function()
	{
		// Get short date format (in Windows-specific format).
		var dateFormat = this.getCalendarInfo( "DateFormat" );
		
		// Do mapping from Windows date format to jQuery UI datapicker format.
		//
		// Windows format returned by getText function consists of:
		//
		// d     Day of the month as digits without leading zeros for single-digit days.
		// dd    Day of the month as digits with leading zeros for single-digit days.
		// ddd   Abbreviated day of the week.
		// dddd  Day of the week.
		//
		// M     Month as digits without leading zeros for single-digit months.
		// MM    Month as digits with leading zeros for single-digit months.
		// MMM   Abbreviated month.
		// MMMM  Month.
		//
		// y     Year represented only by the last digit.
		// yy    Year represented only by the last two digits. A leading zero is added for single-digit years.
		// yyyy  Year represented by a full four or five digits, depending on the calendar used.
		// yyyyy Behaves identically to "yyyy".
		//
		// jQuery Datepicker format consists of:
		//
		// d - day of month (no leading zero)
		// dd - day of month (two digit)
		// o - day of the year (no leading zeros)
		// oo - day of the year (three digit)
		// D - day name short
		// DD - day name long
		// m - month of year (no leading zero)
		// mm - month of year (two digit)
		// M - month name short
		// MM - month name long
		// y - year (two digit)
		// yy - year (four digit) 
		
		
		// Convert day.
		if ( dateFormat.indexOf("dddd") != -1 )
			dateFormat = dateFormat.replace("dddd", "DD");
		else if ( dateFormat.indexOf("ddd") != -1 )
			dateFormat = dateFormat.replace("ddd", "D");
		
		// Convert month.
		if ( dateFormat.indexOf("MMMM") != -1 )
			dateFormat = dateFormat.replace("MMMM", "MM");
		else if ( dateFormat.indexOf("MMM") != -1 )
			dateFormat = dateFormat.replace("MMM", "M");
		else if ( dateFormat.indexOf("MM") != -1 )
			dateFormat = dateFormat.replace("MM", "mm");
		else if ( dateFormat.indexOf("M") != -1 )
			dateFormat = dateFormat.replace("M", "m");			

		// Convert year.
		if ( dateFormat.indexOf("yyyyy") != -1 )
			dateFormat = dateFormat.replace("yyyyy", "yy");
		else if ( dateFormat.indexOf("yyyy") != -1 )
			dateFormat = dateFormat.replace("yyyy", "yy");
		else if ( dateFormat.indexOf("yy") != -1 )
			dateFormat = dateFormat.replace("yy", "y");			
				
		// Return converted dataFormat.
		return dateFormat;
	};
	
	// getTimeInfo.
	localization.getTimeInfo = function()
	{
		// Get time format (in Windows-specific format).
		var timeFormat = this.getCalendarInfo( "TimeFormat" );
		
		// Check if we should use 12-hour or 24-hour clock.
		var use24Hours = false;
		if ( timeFormat.indexOf("H") != -1 )
			use24Hours = true;
			
		// Return time format info used for date control.	
		return {
			show24Hours: use24Hours,
			showSeconds: true,
			separator: ":",
			ampmPrefix: ' ',
			ampmNames: ['AM', 'PM']
		};
	};
	
	// getDayNamesMin.
	localization.getDayNamesMin = function()
	{
		var dayNamesMin = [];
		for ( var i = 0; i < 7; i++ )
		{
			var dayNameMin = this.getCalendarInfo( "DayNameMin-" + ( i + 1 ) );
			dayNamesMin.push( dayNameMin );
		}	
		return dayNamesMin;
	};
	
	// getDayNames.
	localization.getDayNames = function()
	{
		var dayNames = [];
		for ( var i = 0; i < 7; i++ )
		{
			var dayName = this.getCalendarInfo( "DayName-" + ( i + 1 ) );
			dayNames.push( dayName );
		}	
		return dayNames;
	};
	
	// getMonthNames.
	localization.getMonthNames = function()
	{
		var monthNames = [];
		for ( var i = 0; i < 12; i++ )
		{
			var monthName = this.getCalendarInfo( "MonthName-" + ( i + 1 ) );
			monthNames.push( monthName );
		}	
		return monthNames;
	};
		
    // getCalendarInfo.
	localization.getCalendarInfo = function( id )
	{
	    // Get localized calendar info from MFShell.
		var localizedString = null;
		try {
		    localizedString = MFiles.GetCalendarInfo( id );
		}
		catch ( ex ) {
		}
		return ( localizedString != null ) ? localizedString : "";
	};
		
	// getText.
	localization.getText = function( id )
	{
		var idString = null;
		if ( id == "BooleanControl-True")
		{
			// IDS_STRING_YES
			idString = "16225";
		}
		else if ( id == "BooleanControl-False")
		{
			// IDS_STRING_NO
			idString = "16226";
		}
		else if ( id == "NumberControl-InvalidInteger")
		{	
			// IDS_E_MFILES_INVALID_INTEGER_NUMBER
			idString = "22074";
		}
		else if ( id == "NumberControl-InvalidFloating")
		{			
			// IDS_E_MFILES_INVALID_REAL_NUMBER
			idString = "22075";
		}
		else if ( id == "NumberControl-InvalidNumber")
		{			
			// IDS_E_STRINGHELPER_INVALID_NUMBER_FORMAT
			idString = "33750";
		}
		else if ( id == "DateControl-InvalidDate")
		{
			// IDS_E_MFILES_INVALID_DATE_FORMAT
			idString = "22292";
		}
		else if ( id == "DateControl-InvalidDate2")
		{
			// IDS_E_MFILES_INVALID_DATE
			idString = "22293";
		}
		else if ( id == "MSLUControl-SpecifyMoreValues" )
		{
			// IDS_MENUSTR_SPECIFY_MORE_VALUES
			idString = "1204";
		}
		else if ( id == "SSLUControl-ConfirmNewValue" )
		{
			// IDS_DLGTITLE_ADD_NEW_VALUE_TO_LIST
			idString = "28150";
		}
		else if ( id == "SSLUControl-ValueDoesNotExist" )
		{
			// IDS_MSG_VALUE_X_NOT_IN_LIST_BOX_DO_YOU_WANT_TO_ADD_NEW_VALUE
			idString = "27077";
		}
		else if ( id == "SSLUControl-AddingOfValueNotAllowed" )
		{
			// IDS_MSG_VALUE_X_NOT_INLISTBOX_AND_ADDING_NOT_ALLOWED
			idString = "27076";
		}
		else if ( id == "SSLUControl-AddingOfObjectNotAllowed" )
		{
			// TODO: Remove this, previous code already handles this situation.
			// IDS_MSG_VALUE_X_NOT_INLISTBOX_AND_ADDING_NOT_ALLOWED
			idString = "27076";
		}
		else if ( id == "BooleanControl-NotItem" )
		{
			// IDS_MSG_MCOMBO_TEXT_NOT_INLISTBOX
			idString = "28050";
		}
		else if ( id == "MetadataCard-FieldMustNotBeEmpty" )
		{
			// IDS_E_MFILES_REQUIRED_PROPERTY_NOT_SET_DESC
			idString = "21002";
		}
		else if ( id == "Dialog-Ok" )
		{
			// IDS_BTNTITLE_OK
			idString = "26857";
		}
		else if ( id == "Dialog-Cancel" )
		{
			// IDS_BTNTITLE_CANCEL
			idString = "26853";
		}
		else if ( id == "Dialog-Close")
		{
			// IDS_BTNTITLE_CLOSE
			idString = "28154";
		}
		else if ( id == "Dialog-Yes" )
		{
			// IDS_STRING_YES
			idString = "16225";
		}
		else if ( id == "Dialog-No" )
		{
			// IDS_STRING_NO
			idString = "16226";
		}
		else if ( id == "Previous" )
		{
			// IDS_CONTROLHELPER_BTNTITLE_PREVIOUS
			idString = "28067";
		}
		else if ( id == "Next" )
		{
			// IDS_CONTROLHELPER_BTNTITLE_NEXT
			idString = "28068";
		}
		else if ( id == "MetadataCard-MoreProperties" )
		{
			// IDC_BUTTON_MORE_FIELDS
			//idString = "301";
			// FIXME
			return "More properties...";
		}
			
		// Get localized text from MFShell.
		var localizedString = null;
		try {
			localizedString = MFiles.GetStringResource( idString );
		}
		catch ( ex ) {
		}
		return ( localizedString != null ) ? localizedString : "";
	};
	
} ( window.localization = window.localization || {}, jQuery ) );
