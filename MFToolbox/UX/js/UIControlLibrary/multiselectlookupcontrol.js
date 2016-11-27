( function( $, undefined ) {

	// TODO: Change the name of this widget to lookupcontrolcontainer,
	// because this widget is used as container for both normal lookup control and multiselect lookup control.
	
	// mfiles.mfmultiselectlookupcontrol
	$.widget("mfiles.mfmultiselectlookupcontrol", {
	
		// options.
        options: {
			propertydef: -1,
			valuelist: -1,
			editmode: false,
			readonly: false,
			showhelptext: false,
			highlightcolor: "transparent",
			requesteditmode: null
        },
		
		// _create.
        _create: function ()
		{
			var self = this;
			var element = this.element;
			
			// Get localization strings.
			this.specifyMoreValuesText = localization.getText( "MSLUControl-SpecifyMoreValues" );
			
			// Check whether this is SSLU or MSLU control.
			this.multiSelect = element.hasClass( 'mf-multiselectlookup' );
			
			// Check whether drop-down list is allowed.
			this.dropDownAllowed = !element.hasClass( 'mf-nodropdown' );
			
			// Set max number of results to default value 50.
			// If max number of results is defined in HTML, read it and use instead of default value.
			this.maxResults = 50;
			element.filter( function () {
				var classes = $( this ).attr('class').split(' ');
				for ( var i = 0; i < classes.length; i++ )
				{
					// If class name starts with substring 'mf-maxresults-', convert the end of class name to value and store it.
					var className = classes[ i ];
					if ( className.slice( 0, 14 ) === 'mf-maxresults-' )
					{
						self.maxResults = parseInt( className.substring( 14 ) );
						return true;
					}
				}
				return false;
			} );
			
			// Get original content and hide help text.
			var originalContent = element.html();
			element.find(".mf-helptext").hide();
						
			// Append container for embedded lookup controls.
			var lookupContainer = $('<div class="mf-internal-lookups" style="width:100%;"></div>');
			element.append( lookupContainer );
			element.data( 'lookupContainer', lookupContainer );
			
			// Append hidden text to lookup container to represent empty list of lookup controls.
			// This is first element added to the container. It is shown and hidden based on number of actual lookup controls inside this container.
			// FIXME: var emptyList = $('<span class="mf-internal-empty-lookup-list" style="width:100%">' + originalContent + '&nbsp;</span>');
			var emptyList = $('<div class="mf-internal-empty-lookup-list" style="width:100%">' + originalContent + '&nbsp;</div>');
			
			
			
			if ( !this.options.showhelptext )
				emptyList.hide();
			lookupContainer.append( emptyList );
			
			// In case of MSLU, add link to add more lookup values.
			if ( this.multiSelect )
			{
				// Append hidden link to add more lookup controls.
				var addLookupLink = $('<a class="mf-internal-link">' + this.specifyMoreValuesText + '</a>').click( function() {
					// If there was existing lookup controls, they are changed to be deletable.
					var lookupControls = lookupContainer.find(".mf-internal-lookup");
					lookupControls.each(
						function() {
							$(this).mflookupcontrol("setDeletable", true );
						}
					); // End of each-loop.
					
					// Add new deletable lookup control.
					self._specifyMoreValues( true );
				}).hide();
				
				element.append( addLookupLink );
				element.data( 'addLookupLink', addLookupLink );
			}			
				
			// Bind click event to this element with 'lookupcontainer' namespace.
			// Click event sets the control to edit mode when user clicks the control.
			// Moving to edit mode changes the state of embedded lookups controls also to edit mode.
			element.bind( 'click.lookupcontainer', function( event ) {
				// Request change to edit mode from metadatacard control.
				if ( !self.options.editmode )
					self.options.requesteditmode( self );
					
				// Don't forward events to parent.
				// Events are allowed for surrounding metadatacard control only if we click to outside of controls rect.
				// This is because clicking out of controls changes all controls to view mode.				
				event.stopPropagation();				
			} );
			
			// Bind custom stopEditing events sent by metadata card.
			element.bind( 'stopEditing.lookupcontainer', function( event ) {
				if ( self.inEditMode() )
					self.setToNormalMode();
			});
			
			// Hover-effect.
			if ( !this.options.readonly )
			{
				lookupContainer.hover(
					function() {
						if ( self.inEditMode() )
							lookupContainer.css('background-color', "transparent");
						else
							lookupContainer.css('background-color', self.options.highlightcolor ); 
					},
					function() {
						lookupContainer.css('background-color', "transparent");
					}
				);
			}
		},
		
		// Use the _setOption method to respond to changes to options.
		_setOption: function( key, value )
		{
			var self = this;
			
			switch( key ) {
			//case "valuelistid":
			//	break;
				
			case "editmode":
				// handle changes to options
				
				break;
			}
			// In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
			$.Widget.prototype._setOption.apply( this, arguments );
			// In jQuery UI 1.9 and above, you use the _super method instead
			this._super( "_setOption", key, value );
		},
		
		// Use the destroy method to clean up any modifications your widget has made to the DOM.
		destroy: function()
		{
			var element = this.element;
			
			// Unbind click and stopEditing events.
			this.element.unbind( 'click.lookupcontainer' );
			this.element.bind('stopEditing.lookupcontainer' );
			
			// Remove lookupContainer and its childs. Unbinds also all events.
			element.data('lookupContainer').remove();
			
			// In case of MSLU, remove link. Unbinds also all events.
			if ( this.multiSelect )
				element.data('addLookupLink').remove();
			
			// Put original content visible again.			
			element.find(".mf-helptext").show();
			
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
		},
		
		// --------------------- Own functionality --------------------
		
		// setToNormalMode
		setToNormalMode: function()
		{
			var self = this;
			setTimeout( function() {
				self.setToNormalMode2();
			}, 1 );
		
		},
		
		// setToNormalMode.
		setToNormalMode2: function()
		{
			// Get embedded lookup controls.
			var lookupContainer = this.element.data('lookupContainer');
			
			// FIXME: This may fail, if user has opened lookup control and changes the current object.
			// Probably, because setToNormalMode2 is called after timeout.
			var lookupControls = lookupContainer.find(".mf-internal-lookup");
			
			// Check the validity of each lookup value.
			// If the value of any lookup control is invalid, change to view mode is not allowed. 			
			var changeAllowed = true;
			lookupControls.each(
				function() {
					var valid = $(this).mflookupcontrol("validate");
					if ( !valid )
					{
						changeAllowed = false;
						return false;
					}
				}
			); // End of each-loop.
			
			if ( changeAllowed )
			{
				// Remove empty lookup controls.
				lookupControls.each(
					function() {
						var isEmpty = $(this).mflookupcontrol("isEmpty");
						if ( isEmpty )
							$(this).remove();						
					}
				); // End of each-loop.
				
				// Get lookup controls again when empty controls are removed.
				var lookupControls2 = lookupContainer.find(".mf-internal-lookup");
				
				// In case of MSLU, hide link.
				if ( this.multiSelect )
					this.element.data('addLookupLink').hide();

				// Set all embedded lookup controls to normal mode.
				lookupControls2.mflookupcontrol("setToNormalMode");
			
				// If there are no embedded lookup controls, show text that represents empty list of lookup controls.
				if ( lookupControls2.length === 0 )
					lookupContainer.find( ".mf-internal-empty-lookup-list" ).show();
				else
					lookupContainer.find( ".mf-internal-empty-lookup-list" ).hide();
			
				this.options.editmode = false;			
			
				// Inform metadatacard about state change.
				this.element.closest('.mf-metadatacard').trigger('onStateChanged');
			}
		},
		
		setToEditMode: function()
		{
			var self = this;
			setTimeout( function() {
				self.setToEditMode2();
			}, 1 );
		
		},
		
		// setToEditMode2.
		setToEditMode2: function()
		{
			if ( this.options.readonly )
				return;
				
			// Set all embedded lookup controls to edit mode.
			// Note that embedded lookupcontrols are not allowed to move to edit mode itself.
			// Their state is controlled by "parent" multiselectlookupcontrol.
			
			var lookupContainer = this.element.data('lookupContainer');
			var lookupControls = lookupContainer.find(".mf-internal-lookup");
			
			var length = lookupControls.length;
			if ( length < 1 )
			{
				// No existing lookup controls.
				// Add empty lookup control without possibility to delete it by user.
				// Note, this function moves it already to edit mode.
				this._specifyMoreValues( false );
			}
			else if ( length === 1 )
			{
				// One existing lookup control.
				// Set it to edit mode and mark to non-deletable.
				lookupControls.mflookupcontrol("setToEditMode2");
				lookupControls.mflookupcontrol("setDeletable", false );
			}
			else
			{
				// Several lookup controls.
				// Set all controls to edit mode and mark to deletable.
				lookupControls.mflookupcontrol("setToEditMode2");
				lookupControls.mflookupcontrol("setDeletable", true );
			}
					
			// In case of MSLU, show hidden links.
			if ( this.multiSelect )
				this.element.data('addLookupLink').show();
			
			// Hide text that represents empty list of lookup controls.
			lookupContainer.find( ".mf-internal-empty-lookup-list" ).hide();
			
			// Return background back to default color.
			lookupContainer.css('background-color', "transparent");
			
			// Set this control to edit mode.
			this.options.editmode = true;

			// Inform metadatacard about state change.
			this.element.closest('.mf-metadatacard').trigger('onStateChanged');			
		},
	
		// updateControlFromProperties.
		// TODO: Is this called only in normal mode???
		updateControlFromProperties: function( propertyValues )
		{
			var self = this;
			var propertyDef = this.options.propertydef;
			var lookupContainer = this.element.data('lookupContainer');
			
			// Remove existing lookup controls.
			lookupContainer.find(".mf-internal-lookup").remove();
			
			try {
				var propertyValue = propertyValues.SearchForProperty( self.options.propertydef );
					
				var typedValue = propertyValue.Value;
				if ( typedValue.IsNULL() || typedValue.IsUninitialized() )
				{
					// TODO: ensure that this is done only in edit mode!!!!
					lookupContainer.find(".mf-internal-empty-lookup-list").show();
					return;
				}
				
				var lookups = typedValue.GetValueAsLookups();
				var deletable = false;
				if ( lookups.Count > 1 )
					deletable = true;
					
				// Add embedded lookup control for each lookup value from propertyValue.		
				for ( var i = 0; i < lookups.Count; i++ )
				{
					var lookup = lookups.Item( i + 1 );
					var displayValue = lookup.DisplayValue;
					
					//alert("lookup, displayvalue: " + lookup.DisplayValue + " item " + lookup.Item );
					
					// Get display value if it does not exist.
					if ( !displayValue || displayValue.length == 0 )
					{
						displayValue = vaultOperations.getValueListItemNameByID( self.options.valuelist, lookup.Item );
					}
					this._createLookupControl( lookupContainer, deletable, displayValue, lookup.Item );
				}
				if ( lookups.Count === 0 )
					lookupContainer.find(".mf-internal-empty-lookup-list").show();
				else
					lookupContainer.find(".mf-internal-empty-lookup-list").hide();
			}
			catch ( ex )
			{
				// TODO: ensure that this is done only in edit mode!!!!
				lookupContainer.find(".mf-internal-empty-lookup-list").show();	
			}
		},

		// controlValue.
		controlValue: function()
		{
			var self = this;
			
			// TODO: In case of SSLU, return only single value, not array of values.
			
			var lookupContainer = this.element.data('lookupContainer');		
			var lookupControls = lookupContainer.find(".mf-internal-lookup");
						
			// Loop over each lookup control and add value from control to array.
			var returnValue = [];
			lookupControls.each(
				function( index ){
					
					// Get text from text field of single lookup control.
					var text = $( this ).mflookupcontrol( "controlText" );
					
					// If this is empty, don't add this value to array.
					if ( !text || text.length == 0 )
						return false;
					
					
					// TODO: Optimize. There is no need to check this if we have already checked this before.
					// This is relevant only when called to ensure value is ok before calling onPropertyValueChange.					
					
					// Ensure that user has not given text that does not match to items in valuelist.
					if ( !vaultOperations.valueExists( text, self.options.valuelist ) )
						return false;
					
					var controlValue = $( this ).mflookupcontrol( "controlValue" );	
					returnValue.push( controlValue );
					//alert( "Value of single lookup inside MSLU: " + controlValue + "editmode: " + self.options.editmode );	
					
				}
			); // End of each-loop.
			
			// Remove duplicate values and return unique array.
			return this.uniqueArray( returnValue );
		},
		
		// controlPropertyValue
		controlPropertyValue: function( getNewValue )
		{
			var propertyValue = MFiles.CreateInstance( "PropertyValue" );		
			propertyValue.PropertyDef = this.options.propertydef;
			
			if ( this.multiSelect )
			{
				var value = this.controlValue();
				var lookups = MFiles.CreateInstance( "Lookups" );
				
				for ( var i = 0; i < value.length; i++ )
				{
					var lookup = MFiles.CreateInstance( "Lookup" );
					lookup.Item = value[ i ];
					lookups.Add( -1, lookup );
				}
				propertyValue.TypedValue.SetValueToMultiSelectLookup( lookups );
			}
			else
			{
				var value = this.controlValue();
				if ( this.isEmpty() || value.length == 0 )
					propertyValue.TypedValue.SetValueToNULL( MFDatatypeLookup );
				else	
					propertyValue.TypedValue.SetValue( MFDatatypeLookup, value );
			}
			return propertyValue;
		},
		
		// _specifyMoreValues.
		// Adds new lookup control. Parameter tells if control is deletable by user.
		_specifyMoreValues: function( deletable )
		{
			var lookupContainer = this.element.data('lookupContainer');
			this._createLookupControl( lookupContainer, deletable, null, -666 );
			
			// Hide text that represents empty list of lookup controls.
			lookupContainer.find(".mf-internal-empty-lookup-list").hide();
		},
		
		// _createLookupControl. 
		_createLookupControl: function( lookupContainer, deletable, name, id )
		{	
			var self = this;
			
			// Create div-tag and append it to container.
			var divTag = $('<div class="mf-internal-lookup" style="width:100%;"></div>');
			lookupContainer.append( divTag );
				
			// Create lookupcontrol as child control for div-tag.
			divTag.mflookupcontrol({
				propertydef: self.options.propertydef,
				valuelist: self.options.valuelist,
				maxresults: self.maxResults,
				isdeletable: deletable,
				requesteditmode: null,					
				editmode: self.options.editmode,
				readonly: self.options.readonly,
				dropdownallowed: self.dropDownAllowed,
				
				open: function() {
					// Called when suggestion menu is opened.
					// In case of MSLU, hide link.
					if ( self.multiSelect )
						self.element.data('addLookupLink').hide();
				},
				close: function() {
					// Called when suggestion menu is closed.					
					// In case of MSLU, show hidden link.
					if ( self.multiSelect )
						self.element.data('addLookupLink').show();
				},
				remove: function() {
					// Called when lookup control is removed by user.
					// If there is only one lookup control left, set it non-deletable.
					// If there are more controls, set all to deletable.
					var lookupControls = lookupContainer.find(".mf-internal-lookup");
					if ( lookupControls.length > 1 )
						lookupControls.mflookupcontrol("setDeletable", true );
					else
						lookupControls.mflookupcontrol("setDeletable", false );
				}
			});
			
			if ( name != null )
			{
				// Set value and mark it to valid.
				divTag.mflookupcontrol("updateControl", name, id, true );
			}
			else
				divTag.mflookupcontrol("setToEditMode");			
		},
	
		// _stopEditing.		
		_stopEditing: function()
		{
			this.setToNormalMode();
		},
		
		// isEmpty.		
		isEmpty: function()
		{
			var lookupContainer = this.element.data('lookupContainer');
			var lookupControls = lookupContainer.find(".mf-internal-lookup");
			return ( lookupControls.length == 0 );
		},
		
		// inEditMode.
		inEditMode: function()
		{
			return this.options.editmode;
		},
		
		// Utility functions
		
		// Removes duplicate values and returns new unique array.
		uniqueArray: function( arr )
		{
			var temp = [];
			for( var i = 0; i < arr.length; i++ )
			{
				if( !this.contains( temp, arr[ i ] ) )
				{
					temp.length += 1;
					temp[ temp.length - 1 ] = arr[ i ];
				}
			}
			return temp;
		},

		// Check if array already contains the value.
		contains: function( arr, value )
		{
			for( var i = 0; i < arr.length; i++ )
				if( arr[ i ] == value )
					return true;
			return false;
		} 		
				
    });  // end of multiselectlookupcontrol widget.
	
})( jQuery );
