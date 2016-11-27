( function( utilities, $, undefined ) {

	// showMessage
	utilities.showMessage = function( caller, message )
	{
		// Show dialog.
		var dlg = $( ".mf-internal-invalidvalue-dialog" );
		dlg.find( ".mf-dialogtext" ).html( message );
		dlg.data( "caller", caller ).dialog( "open" );		
	};
	
	// parseAndShowMessage
	utilities.parseAndShowMessage = function( caller, message, value )
	{		
		// Parse value to localized string.
		var i = message.indexOf( "%s" );
		var text = message.substr( 0, i ) + value + message.substr( i + 2 );
					
		// Show dialog.
		this.showMessage( caller, text );
	};
	
	// showNewValueMessage
	utilities.showNewValueMessage = function( self, message, value, changedText )
	{		
		var i = message.indexOf( "%s" );
		var text = message.substr( 0, i ) + value + message.substr( i + 2 );
		
		var dlg = $( ".mf-internal-newvalue-dialog" );
	    dlg.find( ".mf-dialogtext" ).html( text );
		dlg.data( 'lookupControl', self ).data( 'changedText', changedText ).dialog( 'open' );
	};
	
	// showAddPropertiesDialog
	utilities.showAddPropertiesDialog = function( excludedProperties )
	{		
		// Show add properties-dialog.
		var dlg = $( ".mf-internal-addproperties-dialog" );
		var propertyList = dlg.find( ".mf-internal-addproperties-dialog-propertylist" );
		
		// Set empty string to search field.
		propertyList.val("");
		propertyList.data( "selection", -1 );
		var propertyDefs = null;
		
		// Attach autocomplete.  
		propertyList.autocomplete( {  
			delay: 0,
			minLength: 0,
			autoFocus: false,
			// Callback to format results.  			
			source: function( request, add ) {
			
				// TODO: Optimize this!!
			
				// Get propertyDefs
				if ( propertyDefs == null )
					propertyDefs = vaultOperations.getPropertyDefs();
				
				// Sort array based on name.
				var nameArray = []
				var idMap = {};
				for( var i = 0; i < propertyDefs.length / 2; i++ )
				{ 
					var name = propertyDefs[ i * 2 ];
					var id = propertyDefs[ i * 2 + 1 ];
					
					// Skip properties which are already shown on metadata card or otherwise excluded.
					if ( excludedProperties.hasOwnProperty( id ) )
						continue;
					
					nameArray.push( name );
					idMap[ name ] = id;
				}
				nameArray.sort();

				// Set results.	
				var results = [];
				for( var i = 0; i < nameArray.length; i++ ) {
					var name = nameArray[ i ];
					if ( request.term.length > 0 && name.length >= request.term.length && name.substring( 0, request.term.length ).toLowerCase() == request.term.toLowerCase() )
					{
						results.push( { "label" : name , "mf_value" : idMap[ name ] } );
					}						
				}				
				add( results );
			},
			select: function ( event, ui )
			{
				propertyList.data( "selection", ui.item.mf_value );			
			}
		});
		dlg.dialog( 'open' );
	};
	
	// initializeDialogs
	utilities.initializeDialogs = function( metadatacard )
	{
		this.initializeErrorDialog( metadatacard );
		this.initializeConfirmNewValueDialog( metadatacard );
		this.initializeValueDoesNotExistDialog( metadatacard );
		this.initializeAddPropertiesDialog( metadatacard );
	}
	
	// initializeErrorDialog
	utilities.initializeErrorDialog = function( metadatacard )
	{
		// Get localized text for button.
		var okButton = localization.getText( "Dialog-Ok" );
		
		var localizedButtons = {};
		localizedButtons[ okButton ] = function() {
					
			// Caller object is passed via element's data.
			var caller = $( this ).data('caller');
						
			// Clear reference to clicked control so that it will not move to edit mode when user closes the dialog. 
			metadatacard.controlToActivate = null;
						
			// Close dialog.
			$( this ).dialog( "close" );
						
			// TODO: Better name for function.
			caller.cancelAdding();
			return true;
		};
	
		// Dialog to inform user about error.
		$(".mf-internal-invalidvalue-dialog").dialog( {
			autoOpen: false,
			modal: true,	
			title: "M-Files",
			buttons: localizedButtons
		});		
		
	};
	
	// initializeValueDoesNotExistDialog
	utilities.initializeValueDoesNotExistDialog = function( metadatacard )
	{
		// Get localized text for buttons.
		var yesButton = localization.getText( "Dialog-Yes" );
		var noButton = localization.getText( "Dialog-No" );
		
		var localizedButtons = {};
		localizedButtons[ yesButton ] = function() {
			// Caller object (lookup control) and changed text are passed via element's data.
			var lookupControl = $( this ).data( "lookupControl" );
			var changedText = $( this ).data( "changedText" );
						
			// Clear reference to clicked control so that it will not move to edit mode when user closes the dialog. 
			metadatacard.controlToActivate = null;
						
			// Close dialog and call function in lookup control to confirm adding of value to list.
			$( this ).dialog( "close" );
			lookupControl.confirmValueAdding( changedText );
			return true;		
		};
		localizedButtons[ noButton ] = function() {
			// Caller object (lookup control) is passed via element's data.
			var lookupControl = $( this ).data( "lookupControl" );
						
			// Clear reference to clicked control so that it will not move to edit mode when user closes the dialog. 
			metadatacard.controlToActivate = null;
						
			// Close dialog and call function in lookup control to cancel adding of a new value.
			$( this ).dialog( "close" );
			lookupControl.cancelAdding();
			return false;
		};
	
		// Dialog to inform user about new value.
		$( ".mf-internal-newvalue-dialog" ).dialog( {
			autoOpen: false,
			modal: true,
			title: "M-Files",	
			buttons: localizedButtons
		} );	
	};
	
	// initializeConfirmNewValueDialog
	utilities.initializeConfirmNewValueDialog = function( metadatacard )
	{
		// Get localized text for buttons.
		var okButton = localization.getText( "Dialog-Ok" );
		var cancelButton = localization.getText( "Dialog-Cancel" );
		
		var localizedButtons = {};
		localizedButtons[ okButton ] = function() {
			// Caller object (lookup control) and changed text are passed via element's data.
			var lookupControl = $( this ).data( "lookupControl" );
			
			// It is possible that user has changed the value in this phase.
			// Get value from the input field. 
			var changedText = $( this ).find( ".value" ).val();
						
			// Clear reference to clicked control so that it will not move to edit mode when user closes the dialog. 
			metadatacard.controlToActivate = null;
						
			// Close dialog and call function in lookup control to add the new value to list.
			$( this ).dialog( "close" );
			lookupControl.addValueToList( changedText );
			return true;
		};
		localizedButtons[ cancelButton ] = function() {
			// Caller object (lookup control) is passed via element's data.
			var lookupControl = $( this ).data( "lookupControl" );
						
			// Clear reference to clicked control so that it will not move to edit mode when user closes the dialog. 
			metadatacard.controlToActivate = null;
						
			// Close dialog and call function in lookup control to cancel adding of a new value.
			$( this ).dialog( "close" );
			lookupControl.cancelAdding();
			return false;
		};
	
		// Dialog to confirm adding of new value.
		$( ".mf-internal-confirmnewvalue-dialog" ).dialog( {
			autoOpen: false,
			modal: true,	
			title: "M-Files",
			buttons: localizedButtons
		} );
	};
	
	// initializeAddPropertiesDialog
	utilities.initializeAddPropertiesDialog = function( metadatacard )
	{
		// Get localized text for buttons.
		var okButton = localization.getText( "Dialog-Ok" );
		var closeButton = localization.getText( "Dialog-Close" );
		
		// Add buttons and handlers for buttons.
		var localizedButtons = {};
		localizedButtons[ okButton ] = function() {
			// Add selected property and close dialog.
			var dlg = $( ".mf-internal-addproperties-dialog" );
			var propertyList = dlg.find( ".mf-internal-addproperties-dialog-propertylist" );
			var selectedProperty = propertyList.data( "selection" );
			metadatacard.addProperty( selectedProperty );
			return true;
		};
		localizedButtons[ closeButton ] = function() {
			// Close dialog.
			$( this ).dialog( "close" );
			return false;
		};
	
		// Dialog to confirm adding of new value.
		$( ".mf-internal-addproperties-dialog" ).dialog( {
			autoOpen: false,
			modal: true,	
			title: "M-Files",
			buttons: localizedButtons
		} );
	};
	
	// closeDialogs
	utilities.closeDialogs = function()
	{
		$( ".mf-internal-invalidvalue-dialog" ).dialog( "close" );	
		$( ".mf-internal-newvalue-dialog" ).dialog( "close" );
		$( ".mf-internal-confirmnewvalue-dialog" ).dialog( "close" );
		$( ".mf-internal-addproperties-dialog" ).dialog( "close" );
	}
	
	// createProperty: TODO: Move this to vaultOperations???
	utilities.createProperty = function( valueType, propertyDef, value )
	{
		var property = MFiles.CreateInstance( "PropertyValue" );
		property.PropertyDef = propertyDef;
		property.TypedValue.SetValue( valueType, value );
		return property;
	};
	
} ( window.utilities = window.utilities || {}, jQuery ) );
