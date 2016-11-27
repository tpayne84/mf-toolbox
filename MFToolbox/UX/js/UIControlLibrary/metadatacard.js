var g_offset = 0;

( function( $, undefined ) {
	
	// mfiles.metadatacard
	$.widget("mfiles.metadatacard", {
	
		// options.
        options: {
			highlightcolor: "transparent",
			objecttype: -1,
			classid: -1,
			closewhensaved: true,
			initialproperties: null,
			onInitialize: null,
			onEnableControls: null,
			onDisableControls: null,
			onSave: null,
			onClose: null,
			onEdit: null,
			onPropertyValueChange: null
        },

		// _create.
		// Creates this metadatacard widget.
        _create: function ()
		{
			var self = this;
			this.dashboard = null;
			this.currentObject = null;
			this.controlToActivate = null;
			this.closeWhenSaved = this.options.closewhensaved;
						
			// Get localization strings.
			this.fieldMustNotBeEmpty = localization.getText( "MetadataCard-FieldMustNotBeEmpty" );
			this.moreProperties = localization.getText( "MetadataCard-MoreProperties" );
			
			// Associative array for custom properties set by user.
			this.customProperties = null;
			
			// Associative array for excluded properties set by user.
			this.excludedProperties = null;
			
			this.framework = {
			
				// Sets all properties to metadata card. Used e.g. for creating of new object.
				setAllProperties: function( properties ) {
					// Check duplicates.
					var props = {};
					for ( var i = 0 ; i < properties.Count; i++ )
					{
						var propertyValue = properties.Item( i + 1 );
						if ( props.hasOwnProperty( propertyValue.propertyDef ) )
							throw "Duplicate property value. Property def: " + propertyValue.propertyDef;
						props[ propertyValue.propertyDef ] = true;
					}
					
					// Store properties.
					self.customProperties = properties;
					
					// Set class property if it does not exist.
					var classPropertyValue = MFiles.CreateInstance( "PropertyValue" );		
					classPropertyValue.PropertyDef = 100;
					var lookup = MFiles.CreateInstance( "Lookup" );
					lookup.Item = self.options.classid;
					classPropertyValue.TypedValue.SetValueToLookup( lookup );
					
					// Note: If index is -1 (class property not found), new property is added to the end. Otherwise old value is replaced.		
					var index = self.customProperties.IndexOf( 100 );
					self.customProperties.Add( index, classPropertyValue );
				},
				
				// getAllProperties TODO: --> propertyValues
				// Gets all properties from controls in metadata card.
				getAllProperties: function() {
					// Create PropertyValues object and fill it based on values from controls.
					var propertyValues = MFiles.CreateInstance( "PropertyValues" );
					$( ".mf-control" ).each( function() {
						if ( $( this ).basecontrol( "isEmpty" ) === false )
						{		
							var propertyValue = $( this ).basecontrol( "controlPropertyValue" );
							propertyValues.Add( -1, propertyValue );
						}
					} );
					return propertyValues;
				},
				
				mergeProperties: function( properties, overwrite ) {
					
					// Merge properties.
					var props = {};
					for ( var i = 0 ; i < properties.Count; i++ )
					{
						var propertyValue = properties.Item( i + 1 );
						
						// Check duplicates in incoming properties.
						if ( props.hasOwnProperty( propertyValue.propertyDef ) )
							throw "Duplicate property value. Property def: " + propertyValue.propertyDef;
						props[ propertyValue.propertyDef ] = true;
						
						// Check if property exist. If not, add it.
						var index = self.customProperties.IndexOf( propertyValue.propertyDef );
						if ( index == -1 )
							self.customProperties.Add( -1, propertyValue );
						else
						{			
							// Property already exists. Overwrite it if requested.
							if ( overwrite )
							{
								self.customProperties.Remove( index );
								self.customProperties.Add( -1, propertyValue );
							}
						}
					}						
				},
				
				// setExcludedProperties
				setExcludedProperties: function( properties ) {
					self.excludedProperties = properties;
				},
				
				// getExcludedProperties
				getExcludedProperties: function() {
					return self.excludedProperties;
				},
				
				// update
				update: function() {
					setTimeout( function() {
						// Update controls. Use flag to force external update.
						self.updateControls( self.currentObject, false );
					}, 10 );
				},
				
				getObjectType: function() {
					return self.options.objecttype;
				},
				
				getClassId: function() {
					return self.options.classid;
				},
				
				setClassId: function( classId ) {
					self.options.classid = classId;
				}
				
			};
			
			// Associative array for persistent properties.
			this.persistentProperties = {};
			
			// Associative array for properties which are added to metadata card, but not yet saved.
			this.addedProperties = {};
			
			// Associative array for properties which are removed from metadata card, but not yet from actual object.
			this.removedProperties = {};
			
			// Callback handler 
			//
			// Callbacks:
			//	onSave
			//	onClose
			//	onShowDashboard
			//	onUpdateDashboard
			//	onEdit
			//	onPropertyValueChange
			this.callbackHandler = {};	
			
			// Bind click event to this element with 'metadatacard' namespace.
			this.element.bind( "click.metadatacard", function( event ) {
			
				// Check if any controls are in edit mode.
				var controls = [];
				$( ".mf-control" ).each( function() {
					if ( $( this ).basecontrol( "inEditMode" ) )
					{
						controls.push( $( this ) );
						return false;
					}
				} );					
				
				// Send event to controls to change them from edit mode to view mode.
				// FIXME: Add loop to handle all controls...		
				if ( controls.length > 0 )
				{
					// Send event to controls to change them from edit mode to view mode.
					var controlInEditMode = controls.pop();
		
					// Call onPropertyValueChange to check if changing of value is allowed.
					// If changing of value is allowed, stop editing of control which is in edit mode.
					var newPropertyValue = controlInEditMode.basecontrol( "controlPropertyValue", true );					
					if ( self.options.onPropertyValueChange( newPropertyValue ) )		
						controlInEditMode.trigger( "stopEditing" );			
				}		
			} );
			
        },
		 
        // Use the _setOption method to respond to changes to options.
		_setOption: function( key, value )
		{
			switch( key ) {
			case "highlightcolor":
				// TODO: Handle changes to highlightcolor option.
				break;
			case "objecttype":
				// Handle changes to objecttype option.
				this.options.objecttype = value;
				break;
			case "classid":
				// Handle changes to classicid option.
				this.options.classid = value;
				break;
			case "closewhensaved":
				// TODO: Handle changes to closewhensaved option.
				break;
			case "initialproperties":
				// TODO: Handle changes to initialproperties option.
				break;
			}
			// In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
			$.Widget.prototype._setOption.apply( this, arguments );
			// In jQuery UI 1.9 and above, you use the _super method instead
			//this._super( "_setOption", key, value );
		},
		
		// Use the destroy method to clean up any modifications your widget has made to the DOM.
		destroy: function()
		{
			// Unbind click and onStateChanged events.
			this.element.unbind( "click.metadatacard" );
			this.element.bind( "onStateChanged.metadatacard" );
			
			// TODO: destroy rest of controls etc...
			
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget.
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method.
		},
		
		// initialize.
        initialize: function ( dashboard, isNewObject )
		{	
			var self = this;
			this.dashboard = dashboard;
			var shellFrame = dashboard.Parent.ShellFrame;
			if ( dashboard.IsPopupDashboard )
				shellFrame = dashboard.Parent;
			
			this.isNewObject = isNewObject;
		
			// Set this element's class to 'mf-metadatacard' if it is not yet. 
			this.element.attr('class', 'mf-metadatacard');
			
			// Initialize vaultOperations object. 
			vaultOperations.initialize( shellFrame );
			
			// Initialize localization object. 
			localization.initialize( shellFrame );
			
			// Create subcontrols based on HTML "template".
			$( ".mf-control" ).each( function() {
				
				// Read property def from own attribute.
				var propertyDef = $( this ).data( "mf-propertydef" );
				
				var valueList = -1;
				
				// Read value of read-only flag from class attribute.
				var readOnly = $( this ).hasClass( "mf-readonly" );
				
				// Read control type from class attribute.
				var dataType = MFDatatypeUninitialized;
				if ( $( this ).hasClass( "mf-text" ) )
					dataType = MFDatatypeText;
				else if ( $( this ).hasClass( "mf-multilinetext" ) )
					dataType = MFDatatypeMultiLineText;
				else if ( $( this ).hasClass( "mf-lookup" ) )
				{
					dataType = MFDatatypeLookup;
					valueList = vaultOperations.getValueListByPropertyDef( propertyDef );
				}
				else if ( $( this ).hasClass( "mf-multiselectlookup" ) )
				{
					dataType = MFDatatypeMultiSelectLookup;
					valueList = vaultOperations.getValueListByPropertyDef( propertyDef );
				}
				else if ( $( this ).hasClass( "mf-date" ) )
					dataType = MFDatatypeDate;
				else if ( $( this ).hasClass( "mf-time" ) )
					dataType = MFDatatypeTime;
				else if ( $( this ).hasClass( "mf-timestamp" ) )
					dataType = MFDatatypeTimestamp;
				else if ( $( this ).hasClass( "mf-integer" ) )
					dataType = MFDatatypeInteger;
				else if ( $( this ).hasClass( "mf-floating" ) )
					dataType = MFDatatypeFloating;
				else if ( $( this ).hasClass( "mf-boolean" ) )
					dataType = MFDatatypeBoolean;
				else if ( $( this ).hasClass( "mf-label" ) )
					dataType = MFDatatypeUninitialized;
				else {
					var classes = $( this ).attr( "class" );
					throw "Control type not defined by element's class-attribute. Assigned classes: " + classes;
				}
						
				// Create actual control(s).
				if ( dataType == MFDatatypeUninitialized )
				{
				    // Create label control.
					$( this ).basecontrol( {
						islabel: true,
						propertydef: propertyDef
					} );
				}
				else if ( dataType == MFDatatypeTimestamp )
				    // Create timestamp control.
					$( this ).basecontrol( {
						istimestamp: true,
						datatype: dataType,
						propertydef: propertyDef
					} );
				else
				{
                    // Create control.				
				    self._createSingleControl( $( this ), dataType, propertyDef, valueList, readOnly, isNewObject );
					
					// Add property to array of persistent properties.
					self.persistentProperties[ propertyDef ] = true;
				}
				
			} ); // end of each loop
			
			// Create dynamic controls.
			this._createDynamicControls();
			
			// Create save button(s).
			$( ".mf-savebutton" ).button().click( function() {
				if ( self.save() && self.closeWhenSaved )
					self.close();
			} );
			
			// Create close button(s).
			$( ".mf-closebutton" ).button().click( function() {
				self.close();
			} );
						
			// Bind onStateChanged events to this element with 'metadatacard' namespace.
			// Events are sent by subcontrols and used to inform metadatacard when subcontrols are changed
			// to edit mode and back to normal mode.
			this.element.bind( "onStateChanged.metadatacard", function( event ) {
			
				// Check if any controls are in edit mode.
				var editMode = false;
				$( ".mf-control" ).each( function() {
					if ( $( this ).basecontrol( "inEditMode" ) )
					{
						editMode = true;
						return false;
					}
				} );
			
				// Save and close buttons are disabled always if any subcontrol is in edit mode.
				// This is done because for some reason default button "Save" is activated automatically if user presses enter in some subcontrols.
				// By disabling defaut buttons this unwanted side-effect is prevented.			
				if ( editMode )
				{
					$( ".mf-savebutton" ).button( "disable" );
					$( ".mf-closebutton" ).button( "disable" );
					
					// Callback to inform caller that controls have been disabled.
					self.options.onDisableControls( self.framework );
				}
				else
				{
					if ( self.controlToActivate != null )
					{
						// Call onEdit to check if changing to edit mode is allowed.
						if ( self.options.onEdit( /*self.currentObject, self.controlToActivate*/ ) )
							self.controlToActivate.setToEditMode();
						self.controlToActivate = null;
					}
				
					$( ".mf-savebutton" ).button( "enable" );
					$( ".mf-closebutton" ).button( "enable" );
					
					// Callback to inform caller that controls have been enabled.
					self.options.onEnableControls( self.framework );
				}
			});

			// Initialize dialogs.
			utilities.initializeDialogs( self );

			// Callback to inform caller that metadatacard has been initialized and user is ready to do own initialization.
			self.options.onInitialize( self.framework );
		
			// HACK
			//vaultOperations.setNamedValue( "name1", "value2 " );


			//var value = vaultOperations.getNamedValue( "name1" );
            //alert( "stored value: " + value );			
			
        }, // end of initialize
		
		// updateControls.
		// Called to update control data from properties.
        updateControls: function ( objectVersionAndProperties, internalCall )
		{	
			var self = this;
			this.controlToActivate = null;
			this.currentObject = objectVersionAndProperties;
			
			// If there are open dialogs, close them.
			utilities.closeDialogs();
			
			// Verify that all controls are in view mode.
			// TODO: How to handle the situation that user has changed values and "selection change event" or other 
			// "external event" causes the call to updateControls?
			this.setToNormalMode();
				
		
			var properties = null;
			if ( this.customProperties != null )
				properties = this.customProperties;
			else if ( objectVersionAndProperties !== null )
			{
				 properties = objectVersionAndProperties.Properties;
			
				// Update special read-only fields.
				$( ".mf-objectid" ).text( objectVersionAndProperties.ObjVer.ID );
				$( ".mf-objectversion" ).text( objectVersionAndProperties.ObjVer.Version );
			}
			
			// Update dynamic controls first.
			this._updateDynamicControls( properties, internalCall );
			
			
			// Loop over each subcontrol and update it.
			$( ".mf-control" ).each( function( index ) {
			
				var isAllowed = true;
				
				// Call onShowControl to check if showing of control is allowed. NOTE: Not implemented yet.
				//if ( self.options.onShowControl( objectVersionAndProperties, null ) )	
				if ( isAllowed ) 
				{
					// If controls are linked to existing object, update all controls from target object only if existing object changes.
					if ( objectVersionAndProperties !== null && !internalCall )
					{
						$( this ).basecontrol( "updateControlFromProperties", properties );
					}
					// If controls are linked to existing object, update only empty controls when user adds or removes dynamic controls.
					else if ( objectVersionAndProperties !== null && internalCall )
					{
						if ( $( this ).basecontrol( "isEmpty" ) )
							$( this ).basecontrol( "updateControlFromProperties", properties );
					}
					// Controls are NOT linked to any object, e.g. in case of new object creations.
					else if ( objectVersionAndProperties === null )
					{
						if ( internalCall )
						{
							// In case of internal update,
							// fields which are not empty are filled by user, don't change them.
							if ( $( this ).basecontrol( "isEmpty" ) )
								$( this ).basecontrol( "updateControlFromProperties", properties );
						}
						else
						{
							// In case of external update, update all.
							$( this ).basecontrol( "updateControlFromProperties", properties );
						}
					
					}
				
				}
				
			} );
			
        },
		
		// setToNormalMode.
		setToNormalMode: function()
		{
			// Send event to change all controls back to view mode.
			$( ".mf-control" ).trigger('stopEditing');
		},
		
		// _createSingleControl
		_createSingleControl: function( element, dataType, propertyDef, valueList, readOnly, isNewObject )
		{
			var self = this;
			
		    // Create single control.
			element.basecontrol( {
				datatype: dataType,
				propertydef: propertyDef,
				valuelist: valueList,
				readonly: readOnly,
				showhelptext: isNewObject,
				highlightcolor: self.options.highlightcolor,
				// Function to make decision if edit mode is allowed.
				requesteditmode: function( control ) {
						
					self.controlToActivate = null;
						
					// Check if any controls are in edit mode.
					var inEditMode = [];
					var editMode = false;
					$( ".mf-control" ).each( function() {
						// Note, we need === to compare values here.
						// basecontrol("inEditMode") returns value which is converted to true if == comparison is used, when inEditMode function does not exist at all!
						if ( $( this ).basecontrol( "inEditMode" ) === true )
						{
							inEditMode.push( $( this ) );
							editMode = true;
							// This return breaks each-loop.
							return false;
						}
					} ); // each-loop	

					// If there are any controls in edit mode, we store reference to control which requested activation.
					// It will be activated right away when other controls change back to view mode. And other controls change back to 
					// view mode when we send stopEditing event to them.
					// If there are not any controls in edit mode, set requested control to edit mode now.		
					if ( editMode )
					{
						// Call onPropertyValueChange to check if changing of value is allowed.
						// If changing of value is not allowed, we won't stop editing of current control.
						var controlInEditMode = inEditMode.pop();
						var newPropertyValue = controlInEditMode.basecontrol( "controlPropertyValue", true );
											
						if ( self.options.onPropertyValueChange( newPropertyValue /*self.currentObject, controlInEditMode*/ ) )
						{
							self.controlToActivate = control;		
							// Send event to change control which is in edit mode back to view mode.
							controlInEditMode.trigger( "stopEditing" );
						}						
					}
					else
					{
						// Call onEdit to check if changing to edit mode is allowed.
						if ( self.options.onEdit( /*self.currentObject, control*/ ) )
							control.setToEditMode();
					}
					
				}  // closure for requesteditmode
						
			} );  // basecontrol constructor

		},
		
		// _createDynamicControls
		_createDynamicControls: function()
		{
			var self = this;
			$( ".mf-dynamic-controls" ).each( function() {
			
				// Create container for dynamic controls.
				var controlContainer = $( '<div class="mf-internal-dynamic-controls"></div>' );
				self.element.data( "dynamic-controls", controlContainer );
				$( this ).append( controlContainer );
				
				// Append link to add more properties.
				var morePropertiesLink = $( '<a href="">' + self.moreProperties + '</a>' ).click( function() {
					self._moreProperties();
					return false;
				});
				$( this ).append( $( "<div></div>" ) ).append( morePropertiesLink );
				
				// Handle only first found mf-dynamic-controls-tag and break each loop.
				return false;
			} );
		},
		
		// _updateDynamicControls
		// TODO: Optimize this...
		_updateDynamicControls: function( propertyValues, internalCall )
		{
			// Get container of dynamic controls.
			var controlContainer = this.element.data( "dynamic-controls" );
			if ( controlContainer )
			{
				if ( internalCall )
					this._updateDynamicControlsInternal( controlContainer, propertyValues );
				else
					this._updateDynamicControlsExternal( controlContainer, propertyValues );
			}
		},
		
		// _updateDynamicControlsInternal
		_updateDynamicControlsInternal: function( controlContainer, propertyValues )
		{
			var self = this;
			var table = controlContainer.find( "#table" ).first();
				
			// Remove controls for removed properties.
			// These are properties removed by user but not yet saved.
			for ( var i in self.removedProperties ) {
				if ( self.removedProperties[ i ] === false )
					continue;
					
				// Remove control if it exists.
				if ( table.find( "#" + i ).length != 0 )
					table.find( "#" + i ).first().remove();
			}	
			
			// Create controls for added properties.
			// These are properties added by user but not yet saved.
			for ( var i in self.addedProperties ) {
				if ( self.addedProperties[ i ] === false )
					continue;
					
				// Create control if it does not exist.
				if ( table.find( "#" + i ).length == 0 ) 
					self._addDynamicControl( table, i, vaultOperations.getDatatypeByPropertyDef( i ) );
			}					
		},
		
		// _updateDynamicControlsExternal
		_updateDynamicControlsExternal: function( controlContainer, propertyValues )
		{
			var self = this;
			
			// Remove added and removed properties from the arrays if this was not internal call.
			self.addedProperties = {};
			self.removedProperties = {};
			
			// Remove existing controls from this container. 
			controlContainer.empty();
				
			// Create table where to add controls.	
			var table = $( '<table class="mf-dynamic-table" id="table"></table>' );
			controlContainer.append( table );
			
			// Create and add rest of existing properties dynamically.
			for ( var i = 0 ; propertyValues !== null && i < propertyValues.Count; i++ )
			{
				var propertyValue = propertyValues.Item( i + 1 );
							
				// If there is a persistent control for the property in the metadata card, don't add it to dynamic controls area.  				
				if ( propertyValue.propertyDef in self.persistentProperties && self.persistentProperties[ propertyValue.propertyDef ] === true )
					continue;

				// Skip excluded properties.
				var excluded = false;
				if ( self.excludedProperties && self.excludedProperties.length > 0 )
				{
					for ( var j = 0; j < self.excludedProperties.length; j++ ) {
						if ( self.excludedProperties[ j ] == propertyValue.propertyDef )
						{
							// Break for loop.
							excluded = true;
							break;
						}
					}
				}
				if ( excluded )
					continue;
						
				// Create actual control.
				self._addDynamicControl( table, propertyValue.propertyDef, propertyValue.Value.DataType );
					
			}  // end for ( property values in current object )
					
		},
		
		// _addDynamicControl
		_addDynamicControl: function( table, propertyDef, dataType )
		{
			var self = this;
		
			// Container tags for label and control
			var labelControl = $( '<span class="mf-control"></span>' );
			var singleControl = $( '<span class="mf-control mf-dynamic-control"><span class="mf-helptext">---</span></span>' );
					
			// Add new line to table, contains own row for label and control.
			// TODO: If there will be support for several metadatacard in same HTML page, this id needs prefix from metadatacard name
			var line = $( '<tr id="' + propertyDef + '"></tr>' );					
			line.append( $( '<td class="mf-dynamic-namefield"></td>' ).append( labelControl ) );
			line.append( $( '<td class="mf-dynamic-controlfield"></td>' ).append( singleControl ) );
			
			// Append link to remove control.
			var removeControlLink = $( '<a href="">Remove</a>' ).click( function() {
				self.removeProperty( propertyDef );
				return false;
			} );
			line.append( $( '<td class="mf-dynamic-lastfield"></td>' ).append( removeControlLink ) );
			table.append( line );
		
			try {		
				// Add propertydef to element's data and control type to element's class.
				var valueList = -1;
				singleControl.data( "mf-propertydef", propertyDef );
							
				if ( dataType == MFDatatypeText )
					singleControl.addClass( "mf-text" );
				else if ( dataType == MFDatatypeMultiLineText )
					singleControl.addClass( "mf-multilinetext" );
				else if ( dataType == MFDatatypeLookup )
				{
					singleControl.addClass( "mf-lookup" );
					valueList = vaultOperations.getValueListByPropertyDef( propertyDef );
				}
				else if ( dataType == MFDatatypeMultiSelectLookup )
				{
					singleControl.addClass( "mf-multiselectlookup" );
					valueList = vaultOperations.getValueListByPropertyDef( propertyDef );
				}
				else if ( dataType == MFDatatypeDate )
				{
					singleControl.addClass( "mf-date" );
				}
				else if ( dataType == MFDatatypeTime )
				{
					singleControl.addClass( "mf-time" );
				}
				else if ( dataType == MFDatatypeTimestamp )
				{
					singleControl.addClass( "mf-timestamp" );
				}
				else if ( dataType == MFDatatypeInteger )
				{
					singleControl.addClass( "mf-integer" );
				}
				else if ( dataType == MFDatatypeFloating )
				{
					singleControl.addClass( "mf-floating" );
				}
				else if ( dataType == MFDatatypeBoolean )
				{
					singleControl.addClass( "mf-boolean" );
				}
				else
				{
					throw "Unknown datatype: " + dataType;
				}
						
				// Create label control.
				labelControl.basecontrol( {
					islabel: true,
					propertydef: propertyDef
				} );
							
				// Create actual control. Note that timestamp control is created differently.
				if ( dataType == MFDatatypeTimestamp )
				{
					singleControl.basecontrol( {
						istimestamp: true,
						datatype: dataType,
						propertydef: propertyDef
					} );
				}
				else
					self._createSingleControl( singleControl, dataType, propertyDef, valueList, false, false );
						
			}  // end try
			catch( ex ) {
				alert( "Error in creation of dynamic control: " + ex );
			}  // end catch
			
			//return singleControl;
		},
		
		// _moreProperties
		_moreProperties: function()
		{
			var self = this;
			
			// Get current properties shown in metadatacard.
			var excludedProperties = {};
			$( ".mf-control" ).each( function() {
				// TODO: Check that this works ok, so that propertydef is always valid.
				var propertyDef = $( this ).basecontrol( "option", "propertydef" );
				excludedProperties[ propertyDef ] = null;
			});

			// Add other excluded properties.
			if ( self.excludedProperties && self.excludedProperties.length > 0 )
			{			
				for ( var i = 0; i < self.excludedProperties.length; i++ ) {
					excludedProperties[ self.excludedProperties[ i ] ] = null;					
				}			
			}
		    // Show add properties-dialog. Don't show properties which are already shown on metadata card.
			utilities.showAddPropertiesDialog( excludedProperties );
		},
		
		// addProperty
		addProperty: function( propertyDef )
		{
			this.addedProperties[ propertyDef ] = true;
			if ( this.removedProperties[ propertyDef ] === true )
				this.removedProperties[ propertyDef ] = false;
	
			// Call updateControls internally. 
			this.updateControls( this.currentObject, true );
		},
		
		// removeProperty
		removeProperty: function( propertyDef )
		{
			this.removedProperties[ propertyDef ] = true;
			if ( this.addedProperties[ propertyDef ] === true )
				this.addedProperties[ propertyDef ] = false; 
			
			// Call updateControls internally. 
			this.updateControls( this.currentObject, true );
		},
				
		// save.
		save: function()
		{		
			var self = this;
			
			// Check that all required fields are filled.
			var failed = false;
			$( ".mf-required" ).each( function() {
				if ( $( this ).basecontrol( "isEmpty" ) )
				{	
					// Inform user about mandatory fields.
					var propertyName = $( this ).basecontrol( "getPropertyName" );
					utilities.parseAndShowMessage( self, self.fieldMustNotBeEmpty, propertyName );
					failed = true;
					
					// Returning false breaks each-loop.
					return false;
				}
			});
			
			if ( failed )
				return false;
			
			if ( this.isNewObject == true )
			{
				// Create new object.
				// Read default object type and class id from options.
				var objectType = this.options.objecttype;
				var classId = this.options.classid;
				
				// Property values.
				var propertyValues = MFiles.CreateInstance( "PropertyValues" );
				
				// Get initial properties defined in metadatacard HTML.
				if ( this.options.initialproperties )
					propertyValues = this.options.initialproperties( vaultOperations.getVault(), objectType, classId, propertyValues );
				
				// Get other properties.
				var classFound = false;
				$('.mf-control').each(function() {
					if ( $( this ).basecontrol( "isEmpty" ) === false )
					{		
						var propertyValue = $( this ).basecontrol( "controlPropertyValue" );
						propertyValues.Add( -1, propertyValue );

						if ( propertyValue.propertyDef === 100 ) // Class
							classFound = true;
					}
				} );
				
				// If properties don't include class, add it here.
				if ( !classFound )
					propertyValues.Add( -1, utilities.createProperty( MFDatatypeLookup, MFBuiltInPropertyDefClass, classId ) );
				
				// Create a new object.
				vaultOperations.createNewObject( objectType, propertyValues );
			}
			else
			{
				// Get properties.
				var propertyValues = MFiles.CreateInstance( "PropertyValues" );
				$( ".mf-control" ).each( function() {
				
					// Add properties retrieved from normal controls, ignore label and timestamp controls.
					if ( $( this ).basecontrol( "isReadOnlyControl" ) === false )
					{								
						var propertyValue = $( this ).basecontrol( "controlPropertyValue" );
						propertyValues.Add( -1, propertyValue );
					}
				});
				
				// Check that saving is not prevented by callback function.
				if ( !this.options.onSave( this.currentObject, propertyValues ) ) return false;
			
				// Save object.
				vaultOperations.saveObject( this.currentObject, propertyValues, self.removedProperties );
				
				// Remove added and removed properties from the arrays. 
				self.addedProperties = {};
				self.removedProperties = {};
				
				// Setting metadatacard to "normal" mode stops editing of all controls.
				// This is ok, because current values are already stored in call to saveObject.
				this.element.metadatacard( "setToNormalMode" );
			}
			return true;
		},
		
		// close.
		close: function()
		{
			// Check that closing is not prevented by callback function.
			if ( !this.options.onClose() ) return false;
			
			if ( this.dashboard.IsPopupDashboard )
				this.dashboard.Window.Close();
			else
			{
				this.dashboard.Parent.ShowDefaultContent();
				this.dashboard.Parent.Visible = false;
			}
		},
		
		// This is dummy function called by error dialog.
		cancelAdding: function()
		{
		},
		
		// getFramework
		getFramework: function()
		{
			return this.framework;
		}
		
    } ); // End of widget 'metadatacard'.
  
} )( jQuery );