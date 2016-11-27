( function( vaultOperations, $, undefined ) {

	// initialize.
	vaultOperations.initialize = function( shellFrame )
	{
		this.vault = shellFrame.ShellUI.Vault;
		this.shellFrame = shellFrame;	
    };
	
	// getVault.
	vaultOperations.getVault = function()
	{
		return this.vault;
	};
	
	// getValueListValues.
	vaultOperations.getValueListValues = function( searchCondition, propertyDef, valueListId, maxResults )
	{
		// TODO: check if there is better way to implement sorting of names/ids together.
		// TODO: Check whether this works in case of value list values with equal name but different id.
		
		// Get lookup values from MFShell.
		// Returned array contains the following values:
		//
		// Element 0: Name of first lookup item.
		// Element 1: Id of first lookup item.
		// Element 2: Name of second lookup item.
		// Element 3: Id of second lookup item.
		// etc.
		var values = {};
		var lookupValues = this.shellFrame.GetLookupValues( this.vault, valueListId, maxResults, searchCondition );
		var arr = ( new VBArray( lookupValues ) ).toArray();
		
		// Sort array.
		var nameArray = []
		var idMap = {};
		for( var i = 0; i < arr.length / 2; i++ )
		{ 
			var name = arr[ i * 2 ];
			nameArray.push( name );
			idMap[ name ] = arr[ i * 2 + 1 ];
		}
		var ascendingSort = vaultOperations.sortIsAscending( propertyDef );
		nameArray.sort( function( a, b ) {
			return vaultOperations.caseInsensitiveSort( a, b, ascendingSort )
		} );
		var resultArray = [];
		for( var i = 0; i < nameArray.length; i++ )
		{
			var name = nameArray[ i ];
			resultArray.push( name );
			resultArray.push( idMap[ name ] );			
		}
		return resultArray;
	};
	
	// getPropertyDefs.
	vaultOperations.getPropertyDefs = function()
	{
		var result = [];
		var propertyDefs = this.vault.PropertyDefOperations.GetPropertyDefs();
		for ( var i = 0; i < propertyDefs.Count; i++ )
		{
			var propertyDef = propertyDefs.Item( i + 1 );
			result.push( propertyDef.Name );
			result.push( propertyDef.ID );	
		}
		return result;
	};
	
	// isNewValue.
	vaultOperations.valueExists = function( value, valueListId )
	{		
		return ( this.shellFrame.ValueExists( this.vault, valueListId, value ) === -1 ) ? false : true;
	};
	
	// isAddingAllowed.
	vaultOperations.isAddingAllowed = function( valueListId )
	{		
		var objType = this.vault.ValueListOperations.GetValueList( valueListId );
		return objType.AllowAdding;
	};
	
	// hasRealObjects.
	vaultOperations.hasRealObjects = function( valueListId )
	{		
		var objType = this.vault.ValueListOperations.GetValueList( valueListId );
		return objType.RealObjectType;
	};
	
	// sortIsAscending
	vaultOperations.sortIsAscending = function( propertyDef )
	{
		var propertyDefObject = this.vault.PropertyDefOperations.GetPropertyDef( propertyDef );
		if ( propertyDefObject.SortAscending == true )
			return true
		return false;
	};
	
	// propertyName
	vaultOperations.propertyName = function( propertyDef )
	{
	    var propertyName = "";
	    try {
		    var propertyDefObject = this.vault.PropertyDefOperations.GetPropertyDef( propertyDef );
			if ( propertyDefObject )
			    propertyName = propertyDefObject.Name;
	    }
		catch ( ex )
		{
		}
		return propertyName;
	};
	
	// addNewValueToList.
	vaultOperations.addNewValueToList = function( value, valueListId )
	{
		// Create new value list item and add it to the value list.
		var valueListItem = MFiles.CreateInstance( "ValueListItem" );
		valueListItem.ValueListID = valueListId;
		valueListItem.Name = value;
		
		var result = null;
		try
		{
			result = this.vault.ValueListItemOperations.AddValueListItem( valueListId, valueListItem, false ).ID;
		}
		catch ( ex )
		{
			// Adding new values to the list is not allowed.
		}
		return result;
	};
	
	// getValueListByPropertyDef
	vaultOperations.getValueListByPropertyDef = function( propertyDef )
	{
		var propertyDefObject = null;
		try {
		    propertyDefObject = this.vault.PropertyDefOperations.GetPropertyDef( propertyDef );
			if ( propertyDefObject )
			{
			    if ( propertyDefObject.BasedOnValueList == false )
			        return -1;
				return propertyDefObject.ValueList;
			}
		}
		catch ( ex ) {
		}
	    return -1;
	};
	
	// getDatatypeByPropertyDef
	vaultOperations.getDatatypeByPropertyDef = function( propertyDef )
	{
		var propertyDefObject = null;
		try {
		    propertyDefObject = this.vault.PropertyDefOperations.GetPropertyDef( propertyDef );
			if ( propertyDefObject )
				return propertyDefObject.DataType;
		}
		catch ( ex ) {
		}
	    return -1;
	};
	
	// getValueListItemNameByID
	vaultOperations.getValueListItemNameByID = function( valueList, id )
	{
		var displayName = "";
		try {
		    var valueListItem = this.vault.ValueListItemOperations.GetValueListItemByID( valueList, id );
			if ( valueListItem )
				displayName = valueListItem.Name;
		}
		catch ( ex ) {
		}
	    return displayName;
	};

	// createObject
	vaultOperations.createNewObject = function( objectType, propertyValues )
	{	
		// Create new object.
		var objectFiles = MFiles.CreateInstance( "SourceObjectFiles" );
		var accessControlList = MFiles.CreateInstance( "AccessControlList" );
		var objectVersionAndProperties =  this.vault.ObjectOperations.CreateNewObject(
			objectType, propertyValues, objectFiles, accessControlList );

		// Check in the newly created object if not checked yet.
		try {
			this.vault.ObjectOperations.CheckIn( objectVersionAndProperties.ObjVer );
		}
		catch ( ex ) {
		}
    };
	
	// saveObject
	vaultOperations.saveObject = function( objectVersionAndProperties, changedProperties, removedProperties )
	{
		var objVer = objectVersionAndProperties.ObjVer;
		var type = objVer.Type;
		
		// Get latest version.
		var objectVersionAndProperties = this.vault.ObjectOperations.GetLatestObjectVersionAndProperties( objVer.ObjID, true );
		var properties = objectVersionAndProperties.Properties;
		
		// Merge changed propertyValues.
		// TODO: What if properties of latest object have been changed???
		for ( var i = 0; i < changedProperties.Count; i++ )
		{
			var changedProperty = changedProperties.Item( i + 1 );
			var index = properties.IndexOf( changedProperty.PropertyDef );
			if ( index != -1 )
			{
				properties.Remove( index );
			}
			properties.Add( -1, changedProperty );
		}
		// Remove properties which are marked to be removed by user.
		for ( var removedPropertyDef in removedProperties ) {
			
			if ( removedProperties[ removedPropertyDef ] === false )
				continue;
			
			var index = properties.IndexOf( removedPropertyDef );
			if ( index != -1 )
				properties.Remove( index );
		}
		
		this.vault.ObjectPropertyOperations.SetAllProperties( objectVersionAndProperties.ObjVer, true, properties );
    };
	
	vaultOperations.setNamedValue = function( name, value )
	{
	    var storageOperations = this.vault.NamedValueStorageOperations;
		var namedValues = MFiles.CreateInstance( "NamedValues" );
		namedValues.Value( name ) = value;
		storageOperations.SetNamedValues( MFUserDefinedValue, "TestApplication", namedValues );
	}
	
	vaultOperations.getNamedValue = function( name )
	{
	    var storageOperations = this.vault.NamedValueStorageOperations;
		var namedValues = storageOperations.GetNamedValues( MFUserDefinedValue, "TestApplication" );
		return namedValues.Value( name );
	}
	
	vaultOperations.getDefaultPropertyValues = function( classId, onlyRequiredValues )
	{
		// Get associated property defs.
		var objectClass = this.vault.ClassOperations.GetObjectClass( classId );
		var associatedPropertyDefs = objectClass.AssociatedPropertyDefs;
					
		// Create property values array.
		var propertyValues = MFiles.CreateInstance( "PropertyValues" );
		for ( var i = 0; i < associatedPropertyDefs.Count; i++ )
		{
			// Get associated propery def.
			var associatedPropertyDef = associatedPropertyDefs.Item( i + 1 );
			if ( onlyRequiredValues && !associatedPropertyDef.Required ) continue;
			
			var propertyDef = associatedPropertyDef.PropertyDef;
								
			// Add new property value based on associated property def.
			var propertyValue = MFiles.CreateInstance( "PropertyValue" );		
			propertyValue.PropertyDef = propertyDef;
			var dataType = vaultOperations.getDatatypeByPropertyDef( propertyDef )
			propertyValue.TypedValue.SetValueToNULL( dataType );
			propertyValues.Add( -1, propertyValue );
		}
		return propertyValues;
	}
	
	vaultOperations.caseInsensitiveSort = function( a, b, ascendingSort )
	{
		var ret = 0;
		a = a.toLowerCase();
		b = b.toLowerCase();
		if( a > b ) 
			ret = (ascendingSort) ? 1 : -1;
		if( a < b ) 
			ret = (ascendingSort) ? -1 : 1; 
		return ret;
	};
	
}( window.vaultOperations = window.vaultOperations || {}, jQuery ) );
