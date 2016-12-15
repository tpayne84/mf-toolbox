using System;
using MFilesAPI;
using MFToolbox.Core;

namespace MFToolboxTests
{
	/// <summary>
	/// Vault Connection Info Class.
	/// </summary>
	public static class ConnectionInfo
	{
		/// <summary>
		/// <see cref="MFilesServerApplication"/>.Connect() extension method that accepts a class type that is decorated with a <see cref="MFVaultConnectionAttribute"/>.
		/// </summary>
		/// <param name="sa"><see cref="MFilesServerApplication"/> instance</param>
		/// <param name="decoratedType"><see cref="Type"/> of the class with the connection info decorations</param>
		/// <param name="vault">Out <see cref="Vault"/></param>
		/// <returns><see cref="MFVaultConnectionAttribute"/></returns>
		public static MFVaultConnectionAttribute Connect(this MFilesServerApplication sa, Type decoratedType, out Vault vault )
		{
			// Extract the MFVaultConnectionAttribute info attribute.
			MFVaultConnectionAttribute vaultConn = (MFVaultConnectionAttribute)Attribute.GetCustomAttribute(decoratedType, typeof(MFVaultConnectionAttribute));

			// Connect to the server.
			sa.Connect(vaultConn);

			// Login to the vault using the GUID provided.
			// Set the out vault value.
			vault = sa.LogInToVault(vaultConn.VaultGuid);

			// Return the Vault Connection info.
			return vaultConn;
		}

		/// <summary>
		/// <see cref="MFilesServerApplication"/>.Connect() extension method that accepts a class type that is decorated with the MFVaultConnectionAttribute attribute.
		/// </summary>
		/// <param name="sa"><see cref="MFilesServerApplication"/> instance</param>
		/// <param name="serverInfo"><see cref="MFServerAttribute"/> server connection info.</param>
		public static void Connect(this MFilesServerApplication sa, MFServerAttribute serverInfo)
		{
			// Test the connection to the server.
			int ms = sa.TestConnectionToServer(serverInfo.NetworkAddress, serverInfo.Endpoint, serverInfo.ProtocolSequence);

			sa.Connect(
			   serverInfo.AuthType,
			   serverInfo.UserName,
			   serverInfo.Password,
			   serverInfo.Domain,
			   serverInfo.ProtocolSequence,
			   serverInfo.NetworkAddress,
			   serverInfo.Endpoint,
			   serverInfo.LocalComputerName,
			   serverInfo.AllowAnonymousConnection
		   );
		}

		/// <summary>
		/// <see cref="MFilesServerApplication"/>.Connect() extension method that accepts a class type that is decorated with a <see cref="MFServerAttribute"/>.
		/// </summary>
		/// <param name="sa"><see cref="MFilesServerApplication"/> instance</param>
		/// <param name="decoratedType"><see cref="Type"/> of the class with the connection info decorations</param>
		/// <returns><see cref="MFServerAttribute"/></returns>
		public static MFServerAttribute Connect(this MFilesServerApplication sa, Type decoratedType )
		{
			MFServerAttribute serverInfo = (MFServerAttribute)Attribute.GetCustomAttribute(decoratedType, typeof(MFServerAttribute));
			sa.Connect(serverInfo);

			return serverInfo;
		}

		/// <summary>
		/// User name of the test user account.
		/// </summary>
		public const string TestUser = "test";

		/// <summary>
		/// Password of the test user account.
		/// </summary>
		public const string TestPassword = "test";

		/// <summary>
		/// Virtual Machine : Server Address.
		/// </summary>
		public const string VMAddress = "192.168.0.47";

		/// <summary>
		/// Virtual Machine : Vault GUID.
		/// </summary>
		public const string VaultGuid = "{C840BE1A-5B47-4AC0-8EF7-835C166C8E24}";
	}
}
