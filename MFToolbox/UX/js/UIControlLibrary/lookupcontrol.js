( function( $, undefined ) {

	// New function prototype for String to replace new line '\n' by HTML line break '<br />'.
	String.prototype.nl2br = function() {
		return this.replace(/\n/gi, "<br />");
	};
	
	// New function prototype for String to encode HTML tags to corresponding entities.
	String.prototype.htmlencode = function() {
		return this.replace(/[&<>"']/g, function( $0 ) {
			return "&" + {"&":"amp", "<":"lt", ">":"gt", '"':"quot", "'":"#39"}[ $0 ] + ";";
		});
	};
	
	// mfiles.lookupcontrol
	$.widget("mfiles.mflookupcontrol", {
	
		// options.
        options: {
			propertydef: -1,
			valuelist: -1,
			maxresults: 50,
			isdeletable: false,
			editmode: false,
			readonly: false,
			dropdownallowed: true,
			remove: null
        },
		
		// _create.
        _create: function ()
		{	
			var self = this;
			var element = this.element;
			
			this.listIsOpen = false;
			this._isEmpty = true;
			this.focusedItem = -1;
			
			// Current text in original format (HTML tags not encoded) and item id are stored in element data.
			element.data( 'Text', null );
			element.data( 'Value', null );
			
			// Default parameters.
			this.maxResults = this.options.maxresults;
			this.showDropdown = false;
			
			// Check whether drop-down list is allowed.
			this.dropDownAllowed = this.options.dropdownallowed;
						
			// Append container for controls.
			var container = $('<div class="mf-internal-container" style="width:100%; display:table;"></div>');
			element.append( container );
			element.data( 'container', container );
			
			// Get localization strings.
			this.valueDoesNotExistText = localization.getText( "SSLUControl-ValueDoesNotExist" );
			this.confirmNewValueText = localization.getText( "SSLUControl-ConfirmNewValue" );
			this.addingOfValueNotAllowedText = localization.getText( "SSLUControl-AddingOfValueNotAllowed" );
			this.addingOfObjectNotAllowedText = localization.getText( "SSLUControl-AddingOfObjectNotAllowed" );
			
			// Create lookup control.
			this._createControl( container );
		},
		
		// Use the _setOption method to respond to changes to options.
		_setOption: function( key, value )
		{
			switch( key ) {
			//case "valuelistid":
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
		
			// Unbind events. TODO: Use own namespace here.
			element.unbind('click');
			
			// Remove Container and its childs. Unbinds also all events.
			element.data( 'container' ).remove();
		
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
		},

		// _createControl.
        _createControl: function ( container )
		{
			var self = this;
			var element = this.element;
			
			// Remove all contents and unbind events.
			container.find(".mf-internal-openlink").remove();
			container.find(".mf-internal-delete-link").remove();
			container.find(".mf-internal-text").remove();
	 
			if ( !this.options.editmode )
			{
				// Embedded lookup control.
				var textFieldControl = $( '<span class="mf-internal-text" style="display:table-cell; width:100%"></span>' );
				container.append( textFieldControl );
				return;
			}			

			// Edit mode.
			var textFieldControl = $( '<input class="mf-internal-text" type="text" style="display:table-cell; width:100%" value="" />' );							
			container.append( textFieldControl );
			
			// Add open-button for drop-down list if it is allowed.
			if ( this.dropDownAllowed )
			{
				var openLink = $('<img src="UIControlLibrary/ArrowDown.png" class="mf-internal-openlink" style="display:table-cell" />')
					.click( function() {
						if ( !self.listIsOpen )
							self._openList();
						else
							self._closeList();
					});
				container.append( openLink );
			}			
			
			// Add link to remove the lookup control.	
			var removeLink = $('<a class="mf-internal-delete-link" style="display:table-cell"><img src="UIControlLibrary/RemoveProperty.png" /></a>').click( function() {
				self._removeControl();
			});
			if ( !this.options.isdeletable )
				removeLink.hide();
			container.append( removeLink );

			// Key down events from text field.
			textFieldControl.keydown( function( event ) {
				// Check whether enter key is pressed down.							
				if ( event.keyCode == 13 )	
					self.handleChangedText( false );		
			} );	
					
			// Attach autocomplete.  
			textFieldControl.autocomplete({  
				delay: 0,
				minLength: 0,
				autoFocus: false,
				
				// Define callback to format results.  
				source: function( request, add )
				{  
					self.delayed_setLookupResults( textFieldControl, request, add ); 
				},
				
				select: function (event, ui)
				{
					element.data( 'Text', ui.item.label );
					element.data( 'Value', ui.item.mf_value );
					self._isEmpty = false;					
					self.listIsOpen = false;
					
					// Set focus back to input field.
					self.setFocus();				
				},
				
				open: function (event, ui)
				{
					var value = textFieldControl.val();
					if ( value.length > 0 )
					{			
						// Get internal autocomplete object and activate requested item.
						if ( self.focusedItem != -1 ) 
						{
							var autocomplete = $( this ).data( "autocomplete" );
							var menu = autocomplete.menu;
							
							var item = menu.element.children().eq( self.focusedItem );
							menu.activate( event, item );
							self.focusedItem = -1;
						}
					}						
					// When list is open, set focus back to input field.
					setTimeout( function() {
						textFieldControl.focus();
					}, 10 )
				}
			});
			return this;		
        },

		// setToNormalMode.
		setToNormalMode: function()
		{
			var self = this;
			var element = this.element;
			
			// Get current data.
			// We are still in edit-mode, so controlText returns text as is. 		
			var text = self.controlText();
			var value = self.controlValue();		

			// TODO: Check that _createControl don't perform unnecessary/illegal tasks.
			// Re-create the control and bind it again to original property.
			this.options.editmode = false;
			var container = element.data( 'container', container );			
			self._createControl( container );
			
			// Update re-created control.
			if ( self.isEmpty() )
				text = "";
			self.updateControl( text, value, false );
		},
	
		// delayed_setToNormalMode
		delayed_setToNormalMode: function()
		{
			var self = this;
			setTimeout( function() {
				self.setToNormalMode();
			}, 1 );
		},
		
		// setToEditMode
		setToEditMode: function()
		{
			var self = this;
			setTimeout( function() {
				self.setToEditMode2();
			}, 1 );
		},
		
		// setDeletable
		setDeletable: function( deletable )
		{
			this.options.isdeletable = deletable;
			var deleteLink = this.element.find(".mf-internal-delete-link").first();
			if ( deletable )
				deleteLink.show();
			else
				deleteLink.hide();	
		},
		
		// delayed_setLookupResults
		//
		// Starts asynchronous search.
		delayed_setLookupResults: function( textFieldControl, request, add )
		{
			var self = this;
			setTimeout( function() {
				self.showLookupResults( textFieldControl, request, add );
			}, 1 );
		},
		
		// showLookupResults
		showLookupResults: function( textFieldControl, request, add )
		{
			var self = this;
			
			// Create array for response objects.  
            var suggestions = [];
			
			// Search values based on request term and add each searched value to response array.
			// TODO: Optimize this...
			var count = 0;
			if ( this.showDropdown || request.term.length > 0 )
			{
				var arr = vaultOperations.getValueListValues( request.term, this.options.propertydef, this.options.valuelist, this.maxResults );
				for( var i = 0; i < arr.length / 2; i++ )
				{
					var name = arr[ i * 2 ];
					var id = arr[ i * 2 + 1 ];
					var item = { "label" : name , "mf_value" : id };
					
					// If value in the text field matches to value in the list, set focus to matching item.
					// TODO: Check if this should be done based on id, not based on name.
					if ( textFieldControl.val() == name.toString() )
						self.focusedItem = count;
						
					count++;
					suggestions.push( item );
				}
			}			
			// After search, set parameters back to default values.
			this.maxResults = this.options.maxresults;
			this.showDropdown = false;
            add( suggestions );
		},
	
		// setToEditMode2.
		setToEditMode2: function()
		{
			if ( this.options.readonly )
				return;
	
			var self = this;
			var element = this.element;
	
			// Get current data.
			var text = null;
			if ( this.isEmpty() )
				text = "";
			else
				text = self.controlText();
							
			var value = self.controlValue();
			var textField = self.element.find(".mf-internal-text").first();
			
			// Get textfield style.
			/*
			var fontSize = textField.css( 'font-size' );
			var fontFamily = textField.css( 'font-family' );
			var fontStyle = textField.css( 'font-style' );
			var fontWeight = textField.css( 'font-weight' );
			var lineHeight = textField.css( 'line-height' );
			var letterSpacing = textField.css( 'letter-spacing' );
			var color = textField.css( 'color' );
			var paddingLeft = textField.css( 'padding-left' );
			var paddingRight = textField.css( 'padding-right' );
			var marginLeft = textField.css( 'margin-left' );
			var marginRight = textField.css( 'margin-right' );
			*/			
				
			this.options.editmode = true;
			this.listIsOpen = false;

			// Re-create the control and add it to the container.
			var container = element.data( 'container', container );			
			self._createControl( container );
			
			// Set style.
			var textField2 = self.element.find(".mf-internal-text").first();
			
			/*
			textField2
				.css( 'font-size', fontSize )
				.css( 'font-family', fontFamily )
				.css( 'font-style', fontStyle )
				.css( 'font-weight', fontWeight )
				.css( 'line-height', lineHeight )
				.css( 'letter-spacing', letterSpacing )
				.css( 'color', color )
				.css( 'padding-left', paddingLeft )
				.css( 'padding-right', paddingRight )
				.css( 'margin-left', marginLeft )
				.css( 'margin-right', marginRight );
			*/
			
			// Update re-created control.
			self.updateControl( text, value, false );
			
			// Set focus back to input field.
			self.setFocus();
		},
		
		// updateControl
		updateControl: function( text, value, setToValid )
		{
			var element = this.element;
			if ( this.options.editmode == false )
			{
				if ( !text || text.length == 0 )
					text = "...";

				// Sanitize possible HTML.
				var sanitizedHtml = text.htmlencode().nl2br();			
				element.find( ".mf-internal-text" ).first().html( sanitizedHtml );
			}
			else
				element.find( ".mf-internal-text" ).first().val( text );
			
			element.data( 'Text', text );
			element.data( 'Value', value );
			if ( setToValid )
				this._isEmpty = false;
		},
	
		// controlText
		controlText: function()
		{		
			if ( this.options.editmode == true )
				return this.element.find(".mf-internal-text").first().val();
			else
				return this.element.data( 'Text' );
		},
	
		// controlValue
		controlValue: function()
		{
			return this.element.data( 'Value' );
		},
		
		// isEmpty
		isEmpty: function()
		{
			return this._isEmpty;
		},
		
		// inEditMode.
		inEditMode: function()
		{
			return this.options.editmode;
		},
		
		// setFocus
		setFocus: function()
		{
			var self = this;
			setTimeout( function() {
				self.delayedSetFocus();
			}, 1 );
		},
	
		// delayedFocusMove
		delayedSetFocus: function()
		{
			this.element.find(".mf-internal-text").first().select();
		},
		
		// _openList
		_openList: function()
		{
			// maxResults tells number of max shown items.	
			this.maxResults = this.options.maxresults;
			this.showDropdown = true;
			
			// Start search with empty string.
			var textField = this.element.find(".mf-internal-text").first();
			textField.autocomplete('search', '*');
			this.listIsOpen = true;
		},
		
		// _closeList
		_closeList: function()
		{
			// Start search.
			var textField = this.element.find(".mf-internal-text").first();
			textField.autocomplete('close');
			this.listIsOpen = false;
		},
		
		// _removeControl
		//
		// It is possible to remove embedded lookup controls from multiselection lookup control.
		// This function is called to remove these controls.
		_removeControl: function()
		{
			// Remove this control.
			this.element.remove();
			
			// Inform parent MSLU-control that control is removed.
			this.options.remove();	
		},
		
		// confirmValueAdding.
		confirmValueAdding: function( changedText )
		{
			var self = this;
			
			// Ask confirmation from the user.
			// User is able to change the text in this dialog before final accepting.
			var dlg = $( ".mf-internal-confirmnewvalue-dialog" );
			
			dlg.find( ".value" ).val( changedText );
			dlg.find( ".mf-dialogtext" ).html( self.confirmNewValueText );
			dlg.data( 'lookupControl', self ).dialog( 'open' );
		},
		
		// addValueToList.
		addValueToList: function( changedText )
		{
			var self = this;
			var valuelist = this.options.valuelist;
			
			var resultID = vaultOperations.addNewValueToList( changedText, valuelist );
			if ( resultID != null )
			{
				// Store the id of created value list item. Set also text again, because user may have changed the text.
				self.updateControl( changedText, resultID, true )
			}
			else
				throw new Error( "Adding of a new value failed. Valuelist: " + valuelist + " Text: " + changedText );			
		},
		
		// cancelAdding
		cancelAdding: function()
		{
			// Set focus back to input field of this control and select the text.
			var textField = this.element.find(".mf-internal-text").first();
			textField.select();
		},
		
		
		// validate
		validate: function()
		{
			var changedText = this.element.find(".mf-internal-text").first().val();
			return this.handleChangedText2( changedText, true );	
		},
		
		// handleChangedText
		handleChangedText: function( allowChangeToViewMode )
		{		
			var self = this;
			var changedText = this.element.find(".mf-internal-text").first().val();
		
			// Call asynchronously.
			setTimeout( function() {
				self.handleChangedText2( changedText, allowChangeToViewMode );	
			}, 0 );
		},
		
		// handleChangedText2.
		//
		// This function is called to check if text has been changed in input field of lookup control.
		// If it has been changed and don't match with stored value, the needed operations are done to store the correct value.
		handleChangedText2: function( changedText, allowChangeToViewMode )
		{		
			var self = this;
			var valueList = this.options.valuelist;
			
			// Check if text field is empty.
			if ( changedText.length === 0 )
			{
				self._isEmpty = true;
			}					
			// If text field is not empty, check whether this is a new value (which means that value doesn't exist in the list).
			else if ( !vaultOperations.valueExists( changedText, valueList ) )
			{
				// This is a new value.
				// Sanitize possible HTML.
				var sanitizedHtml = changedText.htmlencode().nl2br();
			
				// New value. Check if it is allowed to add new values to the list.
				if ( vaultOperations.isAddingAllowed( valueList ) )
				{
					// Adding of a new value was allowed.
					// Check if valuelist contains real object. Adding of real objects is not supported.
					if ( vaultOperations.hasRealObjects( valueList ) )
					{
						// Inform user that adding of real objects is not allowed.
						utilities.parseAndShowMessage( self, self.addingOfObjectNotAllowedText, sanitizedHtml );
						return false;
					}
					
					// Ask if user wants to add new value to valuelist.
					utilities.showNewValueMessage( self, self.valueDoesNotExistText, sanitizedHtml, changedText );
				}
				else
				{
					// Show message that given value is not allowed.
					utilities.parseAndShowMessage( self, self.addingOfValueNotAllowedText, sanitizedHtml );
				}
				// Return false to indicate that value is not valid. So, it is not reasonable to move focus to another control.
				return false;			
			}
			// No new value. User has entered existing (but probably changed) value.
			else
			{
				// If text has been changed, id must be updated based on changed text.
				var originalText = self.element.data( "Text" );
				if ( originalText != changedText )
				{
					// Get id based on changed text and store it.
					// TODO: Change this so that ID is retrieved already in first call to vaultOperations.valueExists.
					var id = vaultOperations.valueExists( changedText, valueList );
					
					// Store text and id.
					self.element.data( "Text", changedText );
					self.element.data( "Value", id );
					self._isEmpty = false;
				}
			}	
			// Return true to indicate that value is valid. So, it is reasonable to move focus to another control.
			return true;	
		}
				
    });  // end of lookupcontrol widget.
	
})( jQuery );
