( function( MFiles_UIControls, $, undefined ) {

	// initialize
	MFiles_UIControls.initialize = function( dashboard, callbacks, initialProperties )
	{
	    var master = {};
	    master.dashboard = dashboard;
		master.commonCallbacks = dashboard.CustomData.commoncallbacks || {};
		master.localCallbacks = callbacks || {};
		initialProperties = initialProperties || function( vault, objectType, classId, propertyValues ) {
			return propertyValues;
		}
		
		// Insert internal HTML before (first) metadatacard tag if it doesn't exist. This contains HTML e.g. for UI control dialogs.
		var internalHtml = $( ".mf-internal-html" );
		if ( internalHtml.length == 0 )
		{
			var container = $( '<div class=".mf-internal-html"></div>' );
		    $( ".mf-metadatacard" ).first().prepend( container );
			container.load( "UIControlLibrary/internal.html" );
		}
		
		// List of preloaded JavaScript files.
		var jsFiles = [];
		
		// jQuery, jQuery UI and other needed plugins.
		jsFiles.push( "jquery-ui-1.8.19/js/jquery-ui-1.8.19.custom.min.js" );
		jsFiles.push( "jquery.timeentry-1.4.9/jquery.timeentry.js" );
		
		// Own UI controls
		jsFiles.push( "utilities.js" );
		jsFiles.push( "vaultoperations.js" );
		jsFiles.push( "localization.js" );
		jsFiles.push( "textcontrol.js" );
		jsFiles.push( "lookupcontrol.js" );
		jsFiles.push( "multiselectlookupcontrol.js" );
		jsFiles.push( "booleancontrol.js" );
		jsFiles.push( "numbercontrol.js" );
		jsFiles.push( "datecontrol.js" );
		jsFiles.push( "timecontrol.js" );
		jsFiles.push( "timestampcontrol.js" );
		jsFiles.push( "labelcontrol.js" );
		jsFiles.push( "dynamiccontrolcontainer.js" );
		jsFiles.push( "basecontrol.js" );
		jsFiles.push( "metadatacard.js" );
		
		// Preload JavaScript files. When all are loaded, callback funtion is called to register Started and Stop events for dashboard.
		MFiles_UIControls.preLoadJsFiles( jsFiles, function() {
			// Register event handler for dashboard Started event.
			master.dashboard.Events.Register( Event_Started, function() {
				
				master.isPopup = false;
				master.shellFrame = master.dashboard.Parent.ShellFrame;
				if ( master.dashboard.IsPopupDashboard )
				{
					master.isPopup = true;
					master.shellFrame = dashboard.Parent;
				}
				// Creates and initializes metadatacard.
				MFiles_UIControls.createDashboard( master, initialProperties );
			} );

			// Register event handler for dashboard Stop event.
			master.dashboard.Events.Register( Event_Stop, function() {
				if ( master.dashboard.CustomData && master.dashboard.CustomData.dashboardClosed )
					master.dashboard.CustomData.dashboardClosed();
			} );
		} );	
	}

	// preLoadJsFiles	
	MFiles_UIControls.preLoadJsFiles = function( jsFiles, mainCallback )
	{
		// Callback function for script loading.
		var count = 0;
		var loaded = function( fileName ) {
		    count++;
			// When all files are loaded, call main callback funtion which continue the initialization.
			if ( count == jsFiles.length )
				mainCallback();
		}
		
		// Loop for all files.
		for ( var i = 0; i < jsFiles.length; i++ ) {
		// HACK!!!!
			//$.getScript( "UIControlLibrary/" + jsFiles[ i ], function(){
				loaded( jsFiles[ i ] );
			//} );
		}
	}

	// Create and initialize metadatacard.
    MFiles_UIControls.createDashboard = function( master, initialProperties )
	{
		var self = this;
		
		 // Register event handler for selection changed event.
		master.shellFrame.Listing.Events.Register( Event_SelectionChanged, function( selectedItems ) {
			MFiles_UIControls.onSelectionChanged( master, selectedItems );
		} );

		// Register event handler for selected items changed event.
		master.shellFrame.Listing.Events.Register( Event_SelectedItemsChanged, function( selectedItems ) {
			MFiles_UIControls.onSelectedItemsChanged( master, selectedItems );
		} );
		
		// Create and initialize metadatacard widget.
		$('.mf-metadatacard').metadatacard({
			highlightcolor: "#eeeeee",
			objecttype: master.dashboard.CustomData.objectType,  // Default object type.
			classid: master.dashboard.CustomData.classId,  // Default class id.
			closewhensaved: master.isPopup,
			initialproperties: initialProperties, // Function to return initial properties.
			
			// callbacks.
			onInitialize: function( metadatacard ) { 
				return self._performCallback( master, true, 'onInitialize', metadatacard );
			},
			onEnableControls: function( metadatacard ) { 
				return self._performCallback( master, true, 'onEnableControls' );
			},
			onDisableControls: function( metadatacard ) { 
				return self._performCallback( master, true, 'onDisableControls' );
			},
			onSave: function( objectVersionAndProperties, changedProperties ) {
				// Allow saving if not prevented by callback.
				return self._performCallback( master, true, 'onSave', objectVersionAndProperties, changedProperties );
			},
			onClose: function() {
				// Allow closing if not prevented by callback.
				return self._performCallback( master, true, 'onClose' );
			},
			onEdit: function() {
				// Allow editing of controls if not prevented by callback.
				return self._performCallback( master, true, 'onEdit' );
			},
			onPropertyValueChange: function( newPropertyValue ) {
				return self._performCallback( master, true, 'onPropertyValueChange', newPropertyValue );
			}
			
		} );
		// Note: objecttype and classid can be set also via options at the later phase.
		
		$( ".mf-metadatacard" ).metadatacard( "initialize", master.dashboard, master.isPopup );		

		// Current selection.
		var objectVersionAndProperties = null;
		
		// Update controls.	
		if ( !master.isPopup )
		{
			// Get current selection. The type of selection is objectVersionAndProperties.
			objectVersionAndProperties = MFiles_UIControls.getCurrentObject( master, master.shellFrame.Listing.CurrentSelection );
		}
		
		// Call onUpdateDashboard callback method. It is not possible to cancel updating by callback function.
		self._performCallback( master, true, "onUpdateDashboard", objectVersionAndProperties );
		
		// Update metadatacard.
		$('.mf-metadatacard').metadatacard( "updateControls", objectVersionAndProperties, false );
	}
		
	// getCurrentObject.
	MFiles_UIControls.getCurrentObject = function( master, selectedItems )
	{
		var currentObject = null;
		var currentObjectType = -1;
		var currentClassId = -1
		
		var objectVersionsAndProperties = selectedItems.ObjectVersionsAndProperties;
		if ( objectVersionsAndProperties != null && objectVersionsAndProperties.Count > 0 )
		{
			currentObject = objectVersionsAndProperties.Item( 1 );
			currentObjectType = currentObject.ObjVer.Type;		
			
			var objectVersions = selectedItems.ObjectVersions;	
			if ( objectVersions && objectVersions.Count > 0 )
			{
				var objectVersion = objectVersions.Item( 1 );
				currentClassId = objectVersion.Class;
			}
			
			// Check if object type and class id matches to any of registered dashboard.
			if ( !this.isAllowedObject( master, currentObjectType, currentClassId ) )
				currentObject = null;
		}
		return currentObject;
	}
	
	// isAllowedObject
	MFiles_UIControls.isAllowedObject = function( master, objectType, classId )
	{
	    var dashboards = master.dashboard.CustomData.dashboards;
		for ( var i = 0; i < dashboards.length; i++ ) {
			var dashboard = dashboards[ i ];
			if ( ( dashboard.objectType == objectType || dashboard.objectType == '*' ) && ( dashboard.classId == classId || dashboard.classId == '*' ) )
				return true
		}
		return false;
	}
	
	// onSelectionChanged.
	MFiles_UIControls.onSelectionChanged = function( master, selectedItems )
	{
		var self = this;
		
		// Get current selection.
		var objectVersionAndProperties = MFiles_UIControls.getCurrentObject( master, selectedItems );
		
		// Call onUpdateDashboard callback method. It is not possible to cancel updating by callback function.
		self._performCallback( master, true, "onUpdateDashboard", objectVersionAndProperties );
		
		// Update metadatacard.
		if ( objectVersionAndProperties != null )
			$( ".mf-metadatacard" ).metadatacard( "updateControls", objectVersionAndProperties, false );
	}

	// onSelectedItemsChanged.
	MFiles_UIControls.onSelectedItemsChanged = function( master, selectedItems )
	{
		var self = this;
		
		// Get current selection.
		var objectVersionAndProperties = MFiles_UIControls.getCurrentObject( master, selectedItems );
		
		// Call onUpdateDashboard callback method. It is not possible to cancel updating by callback function.
		self._performCallback( master, true, "onUpdateDashboard", objectVersionAndProperties );
		
		// Update metadatacard.
		if ( objectVersionAndProperties != null )
			$( ".mf-metadatacard" ).metadatacard( "updateControls", objectVersionAndProperties, false );
	}
	
	// _performCallback
	MFiles_UIControls._performCallback = function( master, isLocal, callbackName )
	{	
		var result = true;
		// If callback is not local and common callback function for dashboards exists, call it.
		if ( !isLocal && master.commonCallbacks.hasOwnProperty( callbackName ) )
		{
			// Get target function and call it with additional arguments (skip master and callbackName arguments).
			// Note that apply-function can not be used, because callback function is not real java objects.
			var targetFunction = master.commonCallbacks[ callbackName ];
			var args = arguments.length - 3;
			if ( args == 0 )	
				result = targetFunction();
			else if ( args == 1 )	
				result = targetFunction( arguments[ 3 ] ) ;
			else if ( args == 2 )
			{
				result = targetFunction( arguments[ 3 ], arguments[ 4 ] ) ;
			}
			else if ( args == 3 )	
				result = targetFunction( arguments[ 3 ], arguments[ 4 ], arguments[ 5 ] ) ;
			else throw "More than 3 arguments are not supported.";	
		}
		// If common callback function returns true or does not return anything,
		// perform local (dashboard-specific) callback function.
		if ( result === true || result === undefined )
		{
			// If local callback function for dashboard exists, call it.
			if ( master.localCallbacks.hasOwnProperty( callbackName ) )
			{
				// Get target function and call it with additional arguments (skip master and callbackName arguments).
				// Note that apply-function can not be used, because callback function is not real java objects.
				var targetFunction = master.localCallbacks[ callbackName ];
				var args = arguments.length - 3;
				if ( args == 0 )	
					result = targetFunction();
				else if ( args == 1 )	
					result = targetFunction( arguments[ 3 ] ) ;
				else if ( args == 2 )	
					result = targetFunction( arguments[ 3 ], arguments[ 4 ] ) ;
				else if ( args == 3 )	
					result = targetFunction( arguments[ 3 ], arguments[ 4 ], arguments[ 5 ] ) ;
				else throw "More than 3 arguments are not supported.";
			}
		}		
		// Return result. True means that actual operation based on event should be performed.
		return ( result === true || result === undefined );
	}
	
}( window.MFiles_UIControls = window.MFiles_UIControls || {}, jQuery ) );
