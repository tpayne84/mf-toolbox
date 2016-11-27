Dim x : Set x = GetExtensionObject( "MFToolbox" )

Dim info : Set info = new EnvInfo()

Dim result : result = x.Call( info )

Class EnvInfo
   Public Vault
   Public UserID
   Public ObjVer

	Private Sub Class_Initialize()
		Set UserID = CurrentUserID
		Set Vault = Vault
		Set ObjVer = ObjVer
	End Sub
End Class