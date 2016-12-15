namespace MFToolbox.Core
{
	/// <summary>
	/// M-Files Vault Connection Info Attribute class.
	/// </summary>
	public class MFVaultConnectionAttribute : MFServerAttribute
	{
		/// <summary>
		/// Vault GUID of the target vault.
		/// </summary>
		public string VaultGuid { get; set; }
	}
}
