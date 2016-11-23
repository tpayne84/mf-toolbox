using MFilesAPI;

namespace MFToolbox.Core
{
	/// <summary>
	/// Abstract Base Extension Object Implementation.
	/// </summary>
	public abstract class ExtensionObject : IExtensionObject
	{
		/// <summary>
		/// Permanent Vault Connection.
		/// </summary>
		protected Vault Vault { get; set; }

		/// <summary>
		/// Updates the local vault with the live vault passed into this method.
		/// </summary>
		/// <param name="v">Live <see cref="MFilesAPI.Vault"/></param>
		private void updateConnection( Vault v )
		{
			// Likely overkill, but just in case.
			lock( this.Vault )
			{
				// Clone the vault into our local instance.
				this.Vault.CloneFrom( v );
			}
		}

		/// <summary>
		/// Extension Object Name.
		/// </summary>
		private string Name { get; set; }

		/// <summary>
		/// Parameterless Constructor.
		/// </summary>
		protected ExtensionObject()
		{
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="name"></param>
		protected ExtensionObject( string name )
		{
			// Set the Extension Object name.
			this.Name = name;

			// Create a new instance of the perm vault.
			this.Vault = new Vault();
		}

		/// <summary>
		/// Name of the Extension Object.
		/// </summary>
		/// <returns>Extension Object Name</returns>
		public virtual string GetName()
		{
			return this.Name;
		}

		/// <summary>
		/// Extension Object => Install => Event Hook.
		/// </summary>
		/// <param name="v"><see cref="MFilesAPI.Vault"/></param>
		public virtual void Install( Vault v )
		{
			this.updateConnection( v );
		}

		/// <summary>
		/// Extension Object => Uninstall => Event Hook.
		/// </summary>
		/// <param name="v"><see cref="MFilesAPI.Vault"/></param>
		public virtual void Uninstall( Vault v )
		{
			this.updateConnection( v );
		}


		/// <summary>
		/// Extension Object => Initialize => Event Hook.
		/// </summary>
		/// <param name="v"><see cref="MFilesAPI.Vault"/></param>
		public virtual void Initialize( Vault v )
		{
			this.updateConnection( v );
		}

		/// <summary>
		/// Extension Object => Uninitialize => Event Hook.
		/// </summary>
		/// <param name="v"><see cref="MFilesAPI.Vault"/></param>
		public virtual void Uninitialize( Vault v )
		{
			this.updateConnection( v );
		}
	}
}