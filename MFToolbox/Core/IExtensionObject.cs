using MFilesAPI;

namespace MFToolbox.Core
{
	/// <summary>
	/// Interface to allow a class to be used as an extension object in M-Files.
	/// </summary>
	interface IExtensionObject
	{
		/// <summary>
		/// Name of the Extension Object.
		/// </summary>
		/// <returns></returns>
		string GetName();

		/// <summary>
		/// Application Install event hook.
		/// </summary>
		/// <param name="v"><see cref="Vault"/> Object</param>
		void Install( Vault v );

		/// <summary>
		/// Application Un-Install event hook.
		/// </summary>
		/// <param name="v"><see cref="Vault"/> Object</param>
		void Uninstall( Vault v );


		/// <summary>
		/// Application Initialize event hook.
		/// </summary>
		/// <param name="v"><see cref="Vault"/> Object</param>
		void Initialize( Vault v );

		/// <summary>
		/// Application Un-Initialize event hook.
		/// </summary>
		/// <param name="v"><see cref="Vault"/> Object</param>
		void Uninitialize( Vault v );
	}
}
